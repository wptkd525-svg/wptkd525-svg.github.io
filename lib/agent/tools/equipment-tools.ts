import { EXERCISES } from "@/lib/data/exercises";
import type { BodyPart } from "@/lib/data/types";
import type { ToolDefinition } from "./types";

export function checkEquipmentGaps(
  bodyParts: BodyPart[],
  availableEquipment: string[],
  limit = 5,
): string[] {
  const candidates = EXERCISES.filter((exercise) =>
    exercise.bodyParts.some((part) => bodyParts.includes(part)),
  );
  const required = new Set(candidates.flatMap((exercise) => exercise.equipment));
  return [...required]
    .filter((item) => !availableEquipment.includes(item))
    .slice(0, limit);
}

interface CheckEquipmentGapsInput {
  bodyParts: BodyPart[];
  availableEquipment: string[];
  limit?: number;
}

export const checkEquipmentGapsTool: ToolDefinition<
  CheckEquipmentGapsInput,
  { missingEquipment: string[]; hasGaps: boolean }
> = {
  name: "check_equipment_gaps",
  description:
    "선택한 부위 운동을 위해 부족한 기구가 있는지 확인합니다. 운동 후보가 부족할 때 호출하세요.",
  parameters: {
    type: "object",
    properties: {
      bodyParts: {
        type: "array",
        items: { type: "string", enum: ["가슴", "등", "어깨", "하체", "팔", "코어"] },
        description: "운동 부위 목록",
      },
      availableEquipment: {
        type: "array",
        items: { type: "string" },
        description: "사용자가 보유한 기구 목록",
      },
      limit: {
        type: "number",
        description: "반환할 최대 부족 기구 수 (기본 5)",
      },
    },
    required: ["bodyParts", "availableEquipment"],
  },
  execute({ bodyParts, availableEquipment, limit = 5 }) {
    const missingEquipment = checkEquipmentGaps(
      bodyParts,
      availableEquipment,
      limit,
    );
    return { missingEquipment, hasGaps: missingEquipment.length > 0 };
  },
};
