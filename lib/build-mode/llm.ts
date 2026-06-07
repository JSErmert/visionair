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
export function anthropicAskLLM(opts: { apiKey?: string; model: string; maxTokens?: number }): AskLLM {
  const client = new Anthropic({ apiKey: opts.apiKey ?? process.env.ANTHROPIC_API_KEY }) as unknown as AnthropicLike;
  return createAskLLM(client, opts.model, opts.maxTokens);
}
