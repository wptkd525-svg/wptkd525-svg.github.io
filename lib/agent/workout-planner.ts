import OpenAI from "openai";
import {
  checkEquipmentGaps,
  getStretches,
  MIN_EXERCISE_COUNT,
  pickExercises,
  searchExercises,
  TARGET_EXERCISE_COUNT,
} from "@/lib/agent/tools";
import type { BodyPart, WorkoutPlan } from "@/lib/data/types";

export function buildWorkoutPlan(
  bodyParts: BodyPart[],
  availableEquipment: string[],
): WorkoutPlan {
  const candidates = searchExercises(bodyParts, availableEquipment);
  const exerciseCount = Math.min(
    TARGET_EXERCISE_COUNT,
    Math.max(MIN_EXERCISE_COUNT, candidates.length),
  );
  const mainExercises = pickExercises(candidates, exerciseCount);
  const warmup = getStretches(bodyParts, "warmup", 3);
  const cooldown = getStretches(bodyParts, "cooldown", 2);

  const missingEquipment =
    mainExercises.length < MIN_EXERCISE_COUNT
      ? checkEquipmentGaps(bodyParts, availableEquipment)
      : undefined;

  return {
    bodyParts,
    warmup,
    mainExercises,
    cooldown,
    tips: "",
    missingEquipment,
  };
}

function buildFallbackTips(plan: WorkoutPlan): string {
  const parts = plan.bodyParts.join(", ");
  return `${parts} 루틴을 진행하세요. 워밍업으로 몸을 충분히 풀고, 메인 운동 사이에는 제시된 휴식 시간을 지켜 주세요. 운동 후 쿨다운 스트레칭으로 근육을 이완하면 회복에 도움이 됩니다.`;
}

export async function formatWithLLM(plan: WorkoutPlan): Promise<WorkoutPlan> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return { ...plan, tips: buildFallbackTips(plan) };
  }

  const openai = new OpenAI({ apiKey });

  const planSummary = {
    bodyParts: plan.bodyParts,
    warmup: plan.warmup.map((s) => ({
      name: s.name,
      duration: s.duration,
      description: s.description,
    })),
    mainExercises: plan.mainExercises.map((e) => ({
      name: e.name,
      sets: e.defaultSets,
      reps: e.defaultReps,
      restSeconds: e.restSeconds,
      description: e.description,
    })),
    cooldown: plan.cooldown.map((s) => ({
      name: s.name,
      duration: s.duration,
      description: s.description,
    })),
    missingEquipment: plan.missingEquipment,
  };

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `당신은 전문 피트니스 코치입니다. 사용자에게 오늘의 운동 루틴 팁을 한국어로 작성해 주세요.
규칙:
- 제공된 운동 목록만 언급하세요. 새로운 운동이나 기구를 추가하지 마세요.
- 3~5문장으로 간결하게 작성하세요.
- 세트/휴식 시간 준수, 자세 주의사항, 오늘 루틴의 핵심 포인트를 포함하세요.
- 기구가 부족한 경우 missingEquipment를 언급하고 대안을 제안하세요.`,
        },
        {
          role: "user",
          content: JSON.stringify(planSummary, null, 2),
        },
      ],
    });

    const tips = response.choices[0]?.message?.content?.trim();
    return { ...plan, tips: tips || buildFallbackTips(plan) };
  } catch {
    return { ...plan, tips: buildFallbackTips(plan) };
  }
}

export async function generateWorkoutPlan(
  bodyParts: BodyPart[],
  availableEquipment: string[],
): Promise<WorkoutPlan> {
  const plan = buildWorkoutPlan(bodyParts, availableEquipment);
  return formatWithLLM(plan);
}
