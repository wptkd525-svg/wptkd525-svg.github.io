import { STRETCHES } from "@/lib/data/stretches";
import type { BodyPart, Stretch } from "@/lib/data/types";
import type { ToolDefinition } from "./types";

export function getStretches(
  bodyParts: BodyPart[],
  phase: "warmup" | "cooldown",
  count: number,
): Stretch[] {
  const matches = STRETCHES.filter(
    (stretch) =>
      stretch.phase === phase &&
      stretch.bodyParts.some((part) => bodyParts.includes(part)),
  );

  const unique = new Map<string, Stretch>();
  for (const stretch of matches.sort(() => Math.random() - 0.5)) {
    unique.set(stretch.id, stretch);
    if (unique.size >= count) break;
  }

  return [...unique.values()];
}

interface GetStretchesInput {
  bodyParts: BodyPart[];
  phase: "warmup" | "cooldown";
  count?: number;
}

export const getStretchesTool: ToolDefinition<
  GetStretchesInput,
  { stretches: Stretch[]; count: number }
> = {
  name: "get_stretches",
  description:
    "운동 부위에 맞는 워밍업(warmup) 또는 쿨다운(cooldown) 스트레칭 목록을 가져옵니다.",
  parameters: {
    type: "object",
    properties: {
      bodyParts: {
        type: "array",
        items: { type: "string", enum: ["가슴", "등", "어깨", "하체", "팔", "코어"] },
        description: "운동 부위 목록",
      },
      phase: {
        type: "string",
        enum: ["warmup", "cooldown"],
        description: "warmup: 운동 전, cooldown: 운동 후",
      },
      count: {
        type: "number",
        description: "가져올 스트레칭 수 (warmup 기본 3, cooldown 기본 2)",
      },
    },
    required: ["bodyParts", "phase"],
  },
  execute({ bodyParts, phase, count }) {
    const defaultCount = phase === "warmup" ? 3 : 2;
    const stretches = getStretches(bodyParts, phase, count ?? defaultCount);
    return { stretches, count: stretches.length };
  },
};
