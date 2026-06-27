import { prisma } from "@/lib/db/prisma";
import type { ToolDefinition } from "./types";

export interface UserEquipmentProfile {
  profileId: string;
  name: string | null;
  equipment: string[];
}

export async function getUserEquipment(
  profileId: string,
): Promise<UserEquipmentProfile> {
  const profile = await prisma.userProfile.findUnique({
    where: { id: profileId },
  });

  if (!profile) {
    throw new Error("프로필을 찾을 수 없습니다.");
  }

  return {
    profileId: profile.id,
    name: profile.name,
    equipment: JSON.parse(profile.equipment) as string[],
  };
}

interface GetUserEquipmentInput {
  profileId: string;
}

export const getUserEquipmentTool: ToolDefinition<
  GetUserEquipmentInput,
  UserEquipmentProfile
> = {
  name: "get_user_equipment",
  description:
    "사용자 프로필에서 헬스장 기구 설문 결과를 조회합니다. 루틴 생성 전 반드시 먼저 호출하세요.",
  parameters: {
    type: "object",
    properties: {
      profileId: {
        type: "string",
        description: "사용자 프로필 ID",
      },
    },
    required: ["profileId"],
  },
  execute: ({ profileId }) => getUserEquipment(profileId),
};
