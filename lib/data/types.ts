export const BODY_PARTS = ["가슴", "등", "어깨", "하체", "팔", "코어"] as const;

export type BodyPart = (typeof BODY_PARTS)[number];

export type ExerciseType = "compound" | "isolation";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Exercise {
  id: string;
  name: string;
  bodyParts: BodyPart[];
  muscleGroup: string;
  equipment: string[];
  type: ExerciseType;
  defaultSets: number;
  defaultReps: string;
  restSeconds: number;
  difficulty: Difficulty;
  description: string;
}

export interface Stretch {
  id: string;
  name: string;
  bodyParts: BodyPart[];
  phase: "warmup" | "cooldown";
  duration: string;
  description: string;
}

export interface EquipmentCategory {
  id: string;
  title: string;
  description: string;
  items: EquipmentItem[];
}

export interface EquipmentItem {
  id: string;
  name: string;
}

export interface WorkoutPlan {
  bodyParts: BodyPart[];
  warmup: Stretch[];
  mainExercises: (Exercise & { notes?: string })[];
  cooldown: Stretch[];
  tips: string;
  missingEquipment?: string[];
}
