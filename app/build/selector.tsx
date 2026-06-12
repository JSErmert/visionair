import { useEffect } from "react";
import ScreenIntro from "@/components/screen-intro";
import ScreenShell from "@/components/screen-shell";
import PrimaryButton from "@/components/primary-button";
import SecondaryButton from "@/components/secondary-button";
import { canProceed, type Level, type PersonaProfile } from "@/lib/build-mode/persona";

type Props = {
  profile: PersonaProfile;
  onChange: (next: PersonaProfile) => void;
  onBegin: () => void;
  onBack: () => void;
};

// Support level (user expertise) — the one wired axis. It forks the interview
// (guidance / depth / voice); all three proceed.
const LEVELS: { value: Level; title: string; body: string }[] = [
  { value: "beginner", title: "Guide me", body: "I'm new — assume best practices, walk me through it." },
  { value: "intermediate", title: "Structure me", body: "I know my goal; help me organize and fill the gaps." },
  { value: "expert", title: "Check my gaps", body: "I know what I want — be terse, catch what I missed." },
];

// Only Build × Claude Code is wired end to end today, so it's the single live option
// shown below. The other purposes (Operate / Automate / Decide / Assist / Unsure) and
// platforms (Claude.ai / ChatGPT) are deferred — see
// docs/reference/visionair-future-plans.md — and return to the UI as each is wired.

const cardCls = (sel: boolean) =>
  [
    "rounded-xl border p-3 text-left transition sm:p-4",
    sel
      ? "border-foreground bg-foreground text-background shadow-sm"
      : "border-border/10 bg-card text-foreground hover:border-foreground/25 hover:bg-foreground/[0.02]",
  ].join(" ");

const GROUP_TITLE = "mb-2 font-serif text-lg font-medium text-foreground/85";
const GROUP_BOX = "mb-4 rounded-2xl border border-border/10 bg-foreground/[0.02] p-3 sm:mb-7 sm:p-4";
const SUBLABEL = "mb-2 text-xs uppercase tracking-wide text-foreground/40";
const FIXED_CARD = "rounded-xl border border-border/15 bg-card p-3 sm:p-4";

export default function PersonaSelector({ profile, onChange, onBegin, onBack }: Props) {
  // Build × Claude Code is the only live cell, so lock the profile to it — a stale
  // stored purpose/platform from earlier would otherwise leave Begin disabled.
  useEffect(() => {
    if (profile.purpose !== "build" || profile.platform !== "claude-code") {
      onChange({ ...profile, purpose: "build", platform: "claude-code" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.purpose, profile.platform]);

  const ready = canProceed(profile);

  return (
    <ScreenShell>
      <ScreenIntro eyebrow="Set up your build" title="A few quick choices." />

      {/* The one real choice: support level (user expertise) — forks the interview. */}
      <h3 className={GROUP_TITLE}>What level of support do you need?</h3>
      <div className={GROUP_BOX}>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {LEVELS.map((o) => {
            const sel = profile.level === o.value;
            return (
              <button key={o.value} type="button" onClick={() => onChange({ ...profile, level: o.value })} className={cardCls(sel)}>
                <div className="mb-1 text-sm font-medium tracking-tight">{o.title}</div>
                <div className={["text-xs leading-5", sel ? "text-background/75" : "text-foreground/60"].join(" ")}>{o.body}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* The single live cell, shown side by side. */}
      <h3 className={GROUP_TITLE}>What are you making, and where it&apos;ll run?</h3>
      <div className="mb-4 grid grid-cols-2 gap-3 rounded-2xl border border-border/10 bg-foreground/[0.02] p-3 sm:p-4">
        <div>
          <p className={SUBLABEL}>What you&apos;re making</p>
          <div className={FIXED_CARD}>
            <div className="mb-1 text-sm font-medium tracking-tight">Build something</div>
            <div className="text-xs leading-5 text-foreground/60">Software, a tool, an app — the thing that gets built.</div>
          </div>
        </div>
        <div>
          <p className={SUBLABEL}>Where it&apos;ll run</p>
          <div className={FIXED_CARD}>
            <div className="mb-1 text-sm font-medium tracking-tight">Claude Code</div>
            <div className="text-xs leading-5 text-foreground/60">A ready-to-build context pack for your coding agent.</div>
          </div>
        </div>
      </div>

      <p className="mb-6 text-xs text-foreground/40">More makings and platforms are on the way — Build × Claude Code is live today.</p>

      <div className="flex items-center justify-between gap-4">
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <PrimaryButton onClick={onBegin} disabled={!ready}>
          Begin
        </PrimaryButton>
      </div>
    </ScreenShell>
  );
}
