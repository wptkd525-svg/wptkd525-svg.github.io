export interface ToolDefinition<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
  };
  execute: (input: TInput) => Promise<TOutput> | TOutput;
}

export interface AnyToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
  };
  execute: (input: unknown) => Promise<unknown> | unknown;
}
