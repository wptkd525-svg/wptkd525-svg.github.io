import type { BodyPart, WorkoutPlan } from "./types";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatSession {
  profileId: string;
  bodyParts: BodyPart[];
  messages: ChatMessage[];
  plan: WorkoutPlan | null;
}

export interface AgentChatResult {
  plan: WorkoutPlan;
  reply: string;
}
