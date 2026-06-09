import Anthropic from "@anthropic-ai/sdk";
import { AskLLM } from "./interview";

export interface AnthropicLike {
  messages: {
    create(args: {
      model: string; max_tokens: number; system: string;
      messages: { role: "user"; content: string }[];
    }): Promise<{ content: Array<{ type: string; text?: string }> }>;
  };
}

export function createAskLLM(client: AnthropicLike, model: string, maxTokens = 1500): AskLLM {
  return async (system, user) => {
    const msg = await client.messages.create({
      model, max_tokens: maxTokens, system,
      messages: [{ role: "user", content: user }],
    });
    return msg.content
      .filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("")
      .trim();
  };
}

// Real client factory (operator-attended; needs ANTHROPIC_API_KEY).
// Uses top-level import to match house style in app/api/question/route.ts.
// maxRetries is raised well above the SDK default (2) because the pack step
// fires several synthesis calls back-to-back; a transient 429/529 on one of
// them was surfacing to the user as an opaque "build failed". The SDK honors
// Retry-After and backs off exponentially, so a higher cap lets it wait a
// short rate-limit window out instead of giving up mid-pack.
export function anthropicAskLLM(opts: { apiKey?: string; model: string; maxTokens?: number }): AskLLM {
  const client = new Anthropic({
    apiKey: opts.apiKey ?? process.env.ANTHROPIC_API_KEY,
    maxRetries: 6,
    timeout: 120_000,
  }) as unknown as AnthropicLike;
  return createAskLLM(client, opts.model, opts.maxTokens);
}
