import { checkEquipmentGapsTool } from "./equipment-tools";
import { pickExercisesTool, searchExercisesTool } from "./exercise-tools";
import { getUserEquipmentTool } from "./profile-tools";
import { getStretchesTool } from "./stretch-tools";
import type { AnyToolDefinition } from "./types";

export const WORKOUT_AGENT_TOOLS: AnyToolDefinition[] = [
  getUserEquipmentTool as AnyToolDefinition,
  searchExercisesTool as AnyToolDefinition,
  pickExercisesTool as AnyToolDefinition,
  getStretchesTool as AnyToolDefinition,
  checkEquipmentGapsTool as AnyToolDefinition,
];

const toolMap = new Map(
  WORKOUT_AGENT_TOOLS.map((tool) => [tool.name, tool]),
);

export function getToolByName(name: string): AnyToolDefinition | undefined {
  return toolMap.get(name);
}

export async function executeTool(
  name: string,
  input: unknown,
): Promise<unknown> {
  const tool = getToolByName(name);
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }
  return tool.execute(input);
}

export function getOpenAIToolDefinitions() {
  return WORKOUT_AGENT_TOOLS.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
}

export * from "./equipment-tools";
export * from "./exercise-tools";
export * from "./profile-tools";
export * from "./stretch-tools";
export * from "./types";
