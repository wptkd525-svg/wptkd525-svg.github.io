import { NextRequest, NextResponse } from "next/server";
import { runWorkoutAgent } from "@/lib/agent/workout-agent";
import { BODY_PARTS, type BodyPart } from "@/lib/data/types";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileId, bodyParts } = body as {
      profileId: string;
      bodyParts: string[];
    };

    if (!profileId) {
      return NextResponse.json(
        { error: "프로필 ID가 필요합니다. 먼저 기구 설문을 완료해 주세요." },
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

    const profile = await prisma.userProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "프로필을 찾을 수 없습니다. 기구 설문을 다시 진행해 주세요." },
        { status: 404 },
      );
    }

    const plan = await runWorkoutAgent(profileId, validParts);

    if (plan.mainExercises.length === 0) {
      return NextResponse.json(
        {
          error: "선택한 부위에 맞는 운동을 찾을 수 없습니다. 기구 설문에서 더 많은 기구를 선택해 보세요.",
          missingEquipment: plan.missingEquipment,
        },
        { status: 422 },
      );
    }

    return NextResponse.json(plan);
  } catch {
    return NextResponse.json(
      { error: "운동 계획 생성에 실패했습니다." },
      { status: 500 },
    );
  }
}
