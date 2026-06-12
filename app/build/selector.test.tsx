// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import PersonaSelector from "./selector";
import type { PersonaProfile } from "@/lib/build-mode/persona";

afterEach(cleanup);

const base: PersonaProfile = { level: "intermediate", purpose: "build", platform: "claude-code" };

function setup(profile: PersonaProfile = base) {
  const onChange = vi.fn();
  const onBegin = vi.fn();
  const onBack = vi.fn();
  render(<PersonaSelector profile={profile} onChange={onChange} onBegin={onBegin} onBack={onBack} />);
  return { onChange, onBegin, onBack };
}
const beginBtn = () => screen.getByRole("button", { name: /begin/i }) as HTMLButtonElement;

describe("PersonaSelector", () => {
  it("renders the three support levels and the single live Build x Claude Code option", () => {
    setup();
    expect(screen.getByText(/level of support/i)).toBeTruthy();
    expect(screen.getByText(/guide me/i)).toBeTruthy();
    expect(screen.getByText(/structure me/i)).toBeTruthy();
    expect(screen.getByText(/check my gaps/i)).toBeTruthy();
    expect(screen.getByText("Build anything")).toBeTruthy();
    expect(screen.getByText("Claude Code")).toBeTruthy();
  });

  it("does not show the deferred / unwired options", () => {
    setup();
    expect(screen.queryByText("Claude.ai")).toBeNull();
    expect(screen.queryByText("ChatGPT")).toBeNull();
    expect(screen.queryByText(/operate an ai/i)).toBeNull();
    expect(screen.queryByText(/^soon$/i)).toBeNull();
  });

  it("changing Level calls onChange with the new level", () => {
    const { onChange } = setup();
    fireEvent.click(screen.getByText(/guide me/i)); // beginner
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ level: "beginner" }));
  });

  it("enables Begin (Build x Claude Code is live) and fires onBegin", () => {
    const { onBegin } = setup();
    expect(beginBtn().disabled).toBe(false);
    fireEvent.click(beginBtn());
    expect(onBegin).toHaveBeenCalledOnce();
  });

  it("fires onBack from the Back button", () => {
    const { onBack } = setup();
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
