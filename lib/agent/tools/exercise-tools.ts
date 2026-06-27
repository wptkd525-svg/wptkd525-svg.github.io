import { EXERCISES } from "@/lib/data/exercises";
import type { BodyPart, Exercise } from "@/lib/data/types";
import type { ToolDefinition } from "./types";

export const TARGET_EXERCISE_COUNT = 5;
export const MIN_EXERCISE_COUNT = 4;

export function hasRequiredEquipment(
  exercise: Exercise,
  availableEquipment: string[],
): boolean {
  return exercise.equipment.some((item) => availableEquipment.includes(item));
}

export function searchExercises(
  bodyParts: BodyPart[],
  availableEquipment: string[],
): Exercise[] {
  return EXERCISES.filter(
    (exercise) =>
      exercise.bodyParts.some((part) => bodyParts.includes(part)) &&
      hasRequiredEquipment(exercise, availableEquipment),
  );
}

export function pickExercises(
  candidates: Exercise[],
  count: number = TARGET_EXERCISE_COUNT,
): Exercise[] {
  if (candidates.length <= count) {
    return [...candidates];
  }

  const compounds = candidates.filter((e) => e.type === "compound");
  const isolations = candidates.filter((e) => e.type === "isolation");

  const compoundTarget = Math.min(
    compounds.length,
    Math.max(2, Math.ceil(count * 0.6)),
  );
  const isolationTarget = Math.min(isolations.length, count - compoundTarget);

  const selected: Exercise[] = [];
  const usedMuscleGroups = new Set<string>();

  const pickFrom = (pool: Exercise[], target: number) => {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    for (const exercise of shuffled) {
      if (selected.length >= count) break;
      if (selected.filter((e) => e.type === exercise.type).length >= target) {
        continue;
      }
      if (usedMuscleGroups.has(exercise.muscleGroup) && pool.length > target) {
        continue;
      }
      selected.push(exercise);
      usedMuscleGroups.add(exercise.muscleGroup);
    }
  };

  pickFrom(compounds, compoundTarget);
  pickFrom(isolations, isolationTarget);

  if (selected.length < count) {
    const remaining = candidates
      .filter((e) => !selected.includes(e))
      .sort(() => Math.random() - 0.5);
    for (const exercise of remaining) {
      if (selected.length >= count) break;
      selected.push(exercise);
    }
  }

  return selected.slice(0, count);
}

interface SearchExercisesInput {
  bodyParts: BodyPart[];
  availableEquipment: string[];
}

interface PickExercisesInput {
  exerciseIds: string[];
  count?: number;
}

export const searchExercisesTool: ToolDefinition<
  SearchExercisesInput,
  { exercises: Exercise[]; count: number }
> = {
  name: "search_exercises",
  description:
    "사용자의 운동 부위와 보유 기구에 맞는 운동 후보 목록을 검색합니다. 운동을 선택하기 전에 반드시 먼저 호출하세요.",
  parameters: {
    type: "object",
    properties: {
      bodyParts: {
        type: "array",
        items: { type: "string", enum: ["가슴", "등", "어깨", "하체", "팔", "코어"] },
        description: "운동할 부위 목록",
      },
      availableEquipment: {
        type: "array",
        items: { type: "string" },
        description: "사용자가 보유한 기구 목록",
      },
    },
    required: ["bodyParts", "availableEquipment"],
  },
  execute({ bodyParts, availableEquipment }) {
    const exercises = searchExercises(bodyParts, availableEquipment);
    return { exercises, count: exercises.length };
  },
};

export const pickExercisesTool: ToolDefinition<
  PickExercisesInput,
  { exercises: Exercise[]; count: number }
> = {
  name: "pick_exercises",
  description:
    "검색된 운동 후보 중에서 복합/고립 균형을 맞춰 메인 운동 4~5개를 선정합니다. search_exercises 결과의 exercise id를 전달하세요.",
  parameters: {
    type: "object",
    properties: {
      exerciseIds: {
        type: "array",
        items: { type: "string" },
        description: "선정 대상 운동 id 목록 (search_exercises 결과)",
      },
      count: {
        type: "number",
        description: "선정할 운동 수 (기본 5, 최소 4)",
      },
    },
    required: ["exerciseIds"],
  },
  execute({ exerciseIds, count = TARGET_EXERCISE_COUNT }) {
    const candidates = EXERCISES.filter((e) => exerciseIds.includes(e.id));
    const exercises = pickExercises(candidates, count);
    return { exercises, count: exercises.length };
  },
};
