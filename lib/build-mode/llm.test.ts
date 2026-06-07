import { describe, it, expect, vi } from "vitest";
import { createAskLLM } from "./llm";

describe("createAskLLM", () => {
  it("calls the client with model/system/user and returns joined text", async () => {
    const create = vi.fn().mockResolvedValue({
      content: [{ type: "text", text: "hello " }, { type: "text", text: "world" }],
    });
    const client = { messages: { create } } as any;
    const ask = createAskLLM(client, "claude-sonnet-4-6", 800);
    const out = await ask("SYS", "USR");
    expect(out).toBe("hello world");
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "claude-sonnet-4-6",
        max_tokens: 800,
        system: "SYS",
        messages: [{ role: "user", content: "USR" }],
      }),
    );
  });
  it("ignores non-text content blocks", async () => {
    const client = { messages: { create: vi.fn().mockResolvedValue({
      content: [{ type: "tool_use" }, { type: "text", text: "ok" }] }) } } as any;
    expect(await createAskLLM(client, "m")("s", "u")).toBe("ok");
  });
});
