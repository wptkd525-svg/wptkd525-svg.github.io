import { NextRequest, NextResponse } from "next/server";
import { runWorkoutAgentChat } from "@/lib/agent/workout-agent";
import { BODY_PARTS, type BodyPart, type WorkoutPlan } from "@/lib/data/types";

interface ChatRequestBody {
  profileId: string;
  bodyParts: string[];
  message: string;
  history?: { role: "user" | "assistant"; content: string }[];
  currentPlan?: WorkoutPlan | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const { profileId, bodyParts, message, history = [], currentPlan } = body;

    if (!profileId) {
      return NextResponse.json(
        { error: "프로필 ID가 필요합니다." },
        { status: 400 },
      );
    }

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "메시지를 입력해 주세요." },
        { status: 400 },
      );
    }

    if (!Array.isArray(bodyParts) || bodyParts.length === 0) {
      return NextResponse.json(
        { error: "최소 하나 이상의 운동 부위를 선택해 주세요." },
        { status: 400 },
      );
    }

    const validParts = bodyParts.filter((part): part is BodyPart =>
      BODY_PARTS.includes(part as BodyPart),
    );

    if (validParts.length === 0) {
      return NextResponse.json(
        { error: "유효한 운동 부위를 선택해 주세요." },
        { status: 400 },
      );
    }

    const validHistory = history.filter(
      (turn) =>
        (turn.role === "user" || turn.role === "assistant") &&
        typeof turn.content === "string",
    );

    const result = await runWorkoutAgentChat(
      profileId,
      validParts,
      message.trim(),
      validHistory,
      currentPlan ?? null,
    );

    if (result.plan.mainExercises.length === 0) {
      return NextResponse.json(
        {
          error: "선택한 부위에 맞는 운동을 찾을 수 없습니다.",
          missingEquipment: result.plan.missingEquipment,
          reply: result.reply,
        },
        { status: 422 },
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "대화 처리에 실패했습니다." },
      { status: 500 },
    );
  }
}
