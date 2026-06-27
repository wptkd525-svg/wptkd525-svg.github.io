import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ChatCompletionToolMessageParam,
} from "openai/resources/chat/completions";
import {
  checkEquipmentGaps,
  executeTool,
  getOpenAIToolDefinitions,
  getStretches,
  hasRequiredEquipment,
  MIN_EXERCISE_COUNT,
  pickExercises,
  searchExercises,
  TARGET_EXERCISE_COUNT,
} from "@/lib/agent/tools";
import { getUserEquipment } from "@/lib/agent/tools/profile-tools";
import { buildWorkoutPlan, formatWithLLM } from "@/lib/agent/workout-planner";
import type { BodyPart, Exercise, Stretch, WorkoutPlan } from "@/lib/data/types";
import type { AgentChatResult } from "@/lib/data/chat-types";

const MAX_AGENT_ITERATIONS = 10;
const AGENT_MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `당신은 운동 계획 전문 AI agent입니다. 사용자의 프로필과 운동 부위에 맞는 루틴을 만들기 위해 제공된 도구만 사용하세요.

필수 절차:
1. get_user_equipment로 사용자 기구를 먼저 확인하세요.
2. search_exercises로 운동 후보를 검색하세요.
3. pick_exercises로 메인 운동 4~5개를 선정하세요 (search 결과의 exercise id를 전달).
4. get_stretches를 phase=warmup, count=3으로 호출하세요.
5. get_stretches를 phase=cooldown, count=2로 호출하세요.
6. 운동 후보가 4개 미만이면 check_equipment_gaps를 호출하세요.
7. 모든 도구 호출이 끝나면 한국어로 응답하세요. 변경 사항 요약과 3~5문장 코칭 팁을 포함하세요.

규칙:
- 도구 없이 운동이나 기구를 지어내지 마세요.
- 사용자가 없는 기구의 운동은 절대 추천하지 마세요.
- 복합 운동과 고립 운동이 균형 있게 포함되도록 pick_exercises를 사용하세요.
- 사용자가 특정 운동 제외·난이도·시간 제한을 요청하면 도구를 다시 호출해 루틴을 조정하세요.
- 이전 대화 맥락과 현재 루틴을 참고해 수정 요청에 반응하세요.`;

interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

interface AgentLoopOptions {
  profileId: string;
  bodyParts: BodyPart[];
  history?: ConversationTurn[];
  userMessage: string;
  currentPlan?: WorkoutPlan | null;
}

interface AgentState {
  bodyParts: BodyPart[];
  profileId: string;
  equipment: string[];
  candidateExercises: Exercise[];
  mainExercises: Exercise[];
  warmup: Stretch[];
  cooldown: Stretch[];
  missingEquipment?: string[];
}

function createInitialState(
  profileId: string,
  bodyParts: BodyPart[],
): AgentState {
  return {
    bodyParts,
    profileId,
    equipment: [],
    candidateExercises: [],
    mainExercises: [],
    warmup: [],
    cooldown: [],
  };
}

function updateStateFromTool(
  state: AgentState,
  toolName: string,
  input: unknown,
  result: unknown,
): void {
  switch (toolName) {
    case "get_user_equipment": {
      const profile = result as { equipment: string[] };
      state.equipment = profile.equipment;
      break;
    }
    case "search_exercises": {
      const data = result as { exercises: Exercise[] };
      state.candidateExercises = data.exercises;
      break;
    }
    case "pick_exercises": {
      const data = result as { exercises: Exercise[] };
      state.mainExercises = data.exercises;
      break;
    }
    case "get_stretches": {
      const data = result as { stretches: Stretch[] };
      const { phase } = input as { phase: "warmup" | "cooldown" };
      if (phase === "warmup") {
        state.warmup = data.stretches;
      } else {
        state.cooldown = data.stretches;
      }
      break;
    }
    case "check_equipment_gaps": {
      const data = result as { missingEquipment: string[] };
      state.missingEquipment = data.missingEquipment;
      break;
    }
  }
}

function validateExercises(
  exercises: Exercise[],
  equipment: string[],
): Exercise[] {
  return exercises.filter((exercise) => hasRequiredEquipment(exercise, equipment));
}

function assemblePlan(
  state: AgentState,
  tips: string,
): WorkoutPlan {
  const { bodyParts, equipment } = state;

  let mainExercises = validateExercises(state.mainExercises, equipment);

  if (mainExercises.length === 0 && state.candidateExercises.length > 0) {
    const count = Math.min(
      TARGET_EXERCISE_COUNT,
      Math.max(MIN_EXERCISE_COUNT, state.candidateExercises.length),
    );
    mainExercises = pickExercises(state.candidateExercises, count);
  }

  if (mainExercises.length === 0) {
    const candidates = searchExercises(bodyParts, equipment);
    const count = Math.min(
      TARGET_EXERCISE_COUNT,
      Math.max(MIN_EXERCISE_COUNT, candidates.length),
    );
    mainExercises = pickExercises(candidates, count);
  }

  const warmup =
    state.warmup.length > 0
      ? state.warmup
      : getStretches(bodyParts, "warmup", 3);

  const cooldown =
    state.cooldown.length > 0
      ? state.cooldown
      : getStretches(bodyParts, "cooldown", 2);

  const missingEquipment =
    mainExercises.length < MIN_EXERCISE_COUNT
      ? (state.missingEquipment ??
        checkEquipmentGaps(bodyParts, equipment))
      : state.missingEquipment;

  return {
    bodyParts,
    warmup,
    mainExercises,
    cooldown,
    tips,
    missingEquipment:
      missingEquipment && missingEquipment.length > 0
        ? missingEquipment
        : undefined,
  };
}

function buildFallbackTips(plan: WorkoutPlan): string {
  const parts = plan.bodyParts.join(", ");
  return `${parts} 루틴을 진행하세요. 워밍업으로 몸을 충분히 풀고, 메인 운동 사이에는 제시된 휴식 시간을 지켜 주세요. 운동 후 쿨다운 스트레칭으로 근육을 이완하면 회복에 도움이 됩니다.`;
}

function buildSystemContent(currentPlan?: WorkoutPlan | null): string {
  if (!currentPlan) return SYSTEM_PROMPT;

  const planContext = {
    bodyParts: currentPlan.bodyParts,
    mainExercises: currentPlan.mainExercises.map((e) => ({
      id: e.id,
      name: e.name,
      sets: e.defaultSets,
      reps: e.defaultReps,
    })),
    warmup: currentPlan.warmup.map((s) => s.name),
    cooldown: currentPlan.cooldown.map((s) => s.name),
  };

  return `${SYSTEM_PROMPT}\n\n현재 루틴:\n${JSON.stringify(planContext, null, 2)}`;
}

function buildAgentMessages(options: AgentLoopOptions): ChatCompletionMessageParam[] {
  const { profileId, bodyParts, history = [], userMessage, currentPlan } = options;

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: buildSystemContent(currentPlan) },
  ];

  for (const turn of history) {
    messages.push({ role: turn.role, content: turn.content });
  }

  const contextPrefix = `프로필 ID: ${profileId}\n운동 부위: ${bodyParts.join(", ")}\n\n`;
  messages.push({ role: "user", content: `${contextPrefix}${userMessage}` });

  return messages;
}

async function runAgentLoop(options: AgentLoopOptions): Promise<AgentChatResult> {
  const { profileId, bodyParts } = options;
  const openai = new OpenAI();
  const state = createInitialState(profileId, bodyParts);

  const messages = buildAgentMessages(options);
  let finalReply = "";

  for (let i = 0; i < MAX_AGENT_ITERATIONS; i++) {
    const response = await openai.chat.completions.create({
      model: AGENT_MODEL,
      temperature: 0.4,
      messages,
      tools: getOpenAIToolDefinitions(),
    });

    const assistantMessage = response.choices[0]?.message;
    if (!assistantMessage) break;

    messages.push(assistantMessage);

    const toolCalls = assistantMessage.tool_calls;
    if (!toolCalls?.length) {
      finalReply = assistantMessage.content?.trim() ?? "";
      break;
    }

    for (const toolCall of toolCalls) {
      if (toolCall.type !== "function") continue;

      let parsedInput: unknown = {};
      try {
        parsedInput = JSON.parse(toolCall.function.arguments);
      } catch {
        parsedInput = {};
      }

      const result = await executeTool(toolCall.function.name, parsedInput);
      updateStateFromTool(
        state,
        toolCall.function.name,
        parsedInput,
        result,
      );

      const toolMessage: ChatCompletionToolMessageParam = {
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      };
      messages.push(toolMessage);
    }
  }

  const plan = assemblePlan(state, finalReply);
  const reply = finalReply || buildFallbackTips(plan);

  return {
    plan: { ...plan, tips: plan.tips || buildFallbackTips(plan) },
    reply,
  };
}

async function runWithFallback(
  profileId: string,
  bodyParts: BodyPart[],
): Promise<WorkoutPlan> {
  const { equipment } = await getUserEquipment(profileId);
  const plan = buildWorkoutPlan(bodyParts, equipment);
  return formatWithLLM(plan);
}

export async function runWorkoutAgentChat(
  profileId: string,
  bodyParts: BodyPart[],
  userMessage: string,
  history: ConversationTurn[] = [],
  currentPlan?: WorkoutPlan | null,
): Promise<AgentChatResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const plan = await runWithFallback(profileId, bodyParts);
    return {
      plan,
      reply:
        history.length > 0
          ? "대화형 수정은 OPENAI_API_KEY 설정이 필요합니다. 기본 루틴을 다시 생성했습니다."
          : plan.tips,
    };
  }

  try {
    return await runAgentLoop({
      profileId,
      bodyParts,
      history,
      userMessage,
      currentPlan,
    });
  } catch {
    const plan = await runWithFallback(profileId, bodyParts);
    return {
      plan,
      reply: "일시적인 오류가 발생해 기본 루틴을 생성했습니다.",
    };
  }
}

export async function runWorkoutAgent(
  profileId: string,
  bodyParts: BodyPart[],
): Promise<WorkoutPlan> {
  const result = await runWorkoutAgentChat(
    profileId,
    bodyParts,
    `오늘 ${bodyParts.join(", ")} 운동 루틴을 만들어 주세요.`,
  );
  return result.plan;
}
