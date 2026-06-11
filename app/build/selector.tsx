import ScreenIntro from "@/components/screen-intro";
import ScreenShell from "@/components/screen-shell";
import PrimaryButton from "@/components/primary-button";
import SecondaryButton from "@/components/secondary-button";
import {
  defaultPlatformForPurpose,
  canProceed,
  type Level,
  type Purpose,
  type Platform,
  type PersonaProfile,
} from "@/lib/build-mode/persona";

type Props = {
  profile: PersonaProfile;
  onChange: (next: PersonaProfile) => void;
  onBegin: () => void;
  onBack: () => void;
};

// Axis 3 — Purpose (what you're making). Goals, not identities. Slice 1 ships only
// "build"; the rest are shown so the matrix reads as real, but marked coming soon.
const PURPOSES: { value: Purpose; title: string; body: string }[] = [
  { value: "build", title: "Build something", body: "Software, a tool, an app — I want the thing that gets built." },
  { value: "operate", title: "Operate an AI", body: "An assistant that runs or governs an operation by my rules." },
  { value: "automate", title: "Automate a workflow", body: "Streamline one repetitive process end to end." },
  { value: "decide", title: "Decide a direction", body: "Turn a fuzzy idea into a clear path and next move." },
  { value: "assist", title: "An ongoing helper", body: "A companion for a recurring task — it learns my world." },
  { value: "unsure", title: "I'm not sure yet", body: "Help me figure out what I'm really making." },
];

// Axis 1 — Level / support. Tunes the interview, not respect. All three proceed in
// Slice 1 — this is the fork we're proving.
const LEVELS: { value: Level; title: string; body: string }[] = [
  { value: "beginner", title: "Guide me", body: "I'm new — assume best practices, walk me through it." },
  { value: "intermediate", title: "Structure me", body: "I know my goal; help me organize and fill the gaps." },
  { value: "expert", title: "Check my gaps", body: "I know what I want — be terse, catch what I missed." },
];

// Axis 2 — Platform (where it ships). Pre-filled from Purpose, one click away.
const PLATFORMS: { value: Platform; title: string }[] = [
  { value: "claude-code", title: "Claude Code" },
  { value: "claude-ai", title: "Claude.ai" },
  { value: "chatgpt", title: "ChatGPT" },
];

function SoonTag() {
  return (
    <span className="ml-2 rounded-full bg-black/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-black/45 align-middle">
      soon
    </span>
  );
}

const cardCls = (sel: boolean) =>
  [
    "rounded-xl border p-4 text-left transition",
    sel
      ? "border-black bg-black text-white shadow-sm"
      : "border-black/10 bg-white text-black hover:border-black/25 hover:bg-black/[0.02]",
  ].join(" ");

// Title above a grouped, bordered selection box (the portfolio's title -> box rhythm).
const GROUP_TITLE = "mb-2 font-serif text-lg font-medium text-black/85";
const GROUP_BOX = "mb-7 rounded-2xl border border-black/10 bg-black/[0.02] p-3 sm:p-4";
const SUBLABEL = "mb-2 text-xs uppercase tracking-wide text-black/40";

export default function PersonaSelector({ profile, onChange, onBegin, onBack }: Props) {
  // Picking a Purpose re-suggests its default Platform (a suggestion, never a lock).
  const pickPurpose = (purpose: Purpose) =>
    onChange({ ...profile, purpose, platform: defaultPlatformForPurpose(purpose) });

  const ready = canProceed(profile);

  return (
    <ScreenShell>
      <ScreenIntro
        eyebrow="Set up your build"
        title="A few quick choices."
        description="There's no wrong answer, and you can change these later — they just shape how we work together."
      />

      {/* ── Box 1: support level ─────────────────────────────────────── */}
      <h3 className={GROUP_TITLE}>What level of support do you need?</h3>
      <div className={GROUP_BOX}>
        <div className="grid gap-3 sm:grid-cols-3">
          {LEVELS.map((o) => {
            const sel = profile.level === o.value;
            return (
              <button key={o.value} type="button" onClick={() => onChange({ ...profile, level: o.value })} className={cardCls(sel)}>
                <div className="mb-1 text-sm font-medium tracking-tight">{o.title}</div>
                <div className={["text-xs leading-5", sel ? "text-white/75" : "text-black/60"].join(" ")}>{o.body}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Box 2: what you're making + where it'll run (connected) ───── */}
      <h3 className={GROUP_TITLE}>What are you making, and where it&apos;ll run?</h3>
      <div className="mb-8 rounded-2xl border border-black/10 bg-black/[0.02] p-3 sm:p-4">
        <p className={SUBLABEL}>What are you making</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {PURPOSES.map((o) => {
            const sel = profile.purpose === o.value;
            return (
              <button key={o.value} type="button" onClick={() => pickPurpose(o.value)} className={cardCls(sel)}>
                <div className="mb-1 text-sm font-medium tracking-tight">
                  {o.title}
                  {o.value !== "build" && <SoonTag />}
                </div>
                <div className={["text-xs leading-5", sel ? "text-white/75" : "text-black/60"].join(" ")}>{o.body}</div>
              </button>
            );
          })}
        </div>

        <div className="my-4 border-t border-black/[0.08]" />

        <p className={SUBLABEL}>
          Where it&apos;ll run <span className="normal-case text-black/35">— suggested from your purpose, change anytime</span>
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {PLATFORMS.map((o) => {
            const sel = profile.platform === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => onChange({ ...profile, platform: o.value })}
                className={[
                  "rounded-xl border px-4 py-3 text-center text-sm font-medium transition",
                  sel
                    ? "border-black bg-black text-white shadow-sm"
                    : "border-black/10 bg-white text-black hover:border-black/25 hover:bg-black/[0.02]",
                ].join(" ")}
              >
                {o.title}
                {o.value !== "claude-code" && <SoonTag />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <div className="flex flex-col items-end gap-2">
          {!ready && (
            <p className="text-right text-xs text-black/45">
              That combination is coming soon — <strong className="font-medium text-black/65">Build × Claude Code</strong> is live today.
            </p>
          )}
          <PrimaryButton onClick={onBegin} disabled={!ready}>
            Begin
          </PrimaryButton>
        </div>
      </div>
    </ScreenShell>
  );
}
