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
  it("renders the boxed axes (support level + making/where)", () => {
    setup();
    expect(screen.getByText(/level of support/i)).toBeTruthy(); // support box title
    expect(screen.getByText(/what are you making, and where/i)).toBeTruthy(); // combined box title
    expect(screen.getByText("Claude.ai")).toBeTruthy(); // a Platform option
  });

  it("renders the six purposes and tags every non-Build one 'soon'", () => {
    setup();
    [/build something/i, /operate an ai/i, /automate a workflow/i, /decide a direction/i, /ongoing helper/i, /not sure yet/i].forEach(
      (label) => expect(screen.getByText(label)).toBeTruthy(),
    );
    // 5 non-build purposes + 2 non-claude-code platforms each carry a 'soon' tag.
    expect(screen.getAllByText(/^soon$/i).length).toBeGreaterThanOrEqual(5);
  });

  it("picking a Purpose re-suggests its default Platform", () => {
    const { onChange } = setup();
    fireEvent.click(screen.getByText(/operate an ai/i));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ purpose: "operate", platform: "claude-ai" }));
  });

  it("changing Level calls onChange with the new level", () => {
    const { onChange } = setup();
    fireEvent.click(screen.getByText(/guide me/i)); // beginner
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ level: "beginner" }));
  });

  it("enables Begin only for Build x Claude Code (else disabled + 'coming soon')", () => {
    setup();
    expect(beginBtn().disabled).toBe(false);
    cleanup();
    setup({ ...base, purpose: "operate", platform: "claude-ai" });
    expect(beginBtn().disabled).toBe(true);
    expect(screen.getByText(/coming soon/i)).toBeTruthy();
  });

  it("fires onBegin (Begin) and onBack (Back)", () => {
    const { onBegin, onBack } = setup();
    fireEvent.click(beginBtn());
    expect(onBegin).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
