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

// Axis 1 — Level (how hands-on you are). Tunes the interview, not respect. All three
// proceed in Slice 1 — this is the fork we're proving.
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

export default function PersonaSelector({ profile, onChange, onBegin, onBack }: Props) {
  // Picking a Purpose re-suggests its default Platform (a suggestion, never a lock).
  const pickPurpose = (purpose: Purpose) =>
    onChange({ ...profile, purpose, platform: defaultPlatformForPurpose(purpose) });

  const ready = canProceed(profile);

  return (
    <ScreenShell>
      <ScreenIntro
        eyebrow="Set up your build"
        title="Three quick choices — then we begin."
        description="They're independent: what you're making, how hands-on you want to be, and where it'll run. There's no wrong answer; you can change them later."
      />

      {/* Axis 3 — Purpose */}
      <p className="mb-2 text-xs uppercase tracking-wide text-black/40">What are you making?</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {PURPOSES.map((o) => {
          const sel = profile.purpose === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => pickPurpose(o.value)}
              className={[
                "rounded-2xl border p-4 text-left transition",
                sel
                  ? "border-black bg-black text-white shadow-sm"
                  : "border-black/10 bg-white text-black hover:border-black/25 hover:bg-black/[0.02]",
              ].join(" ")}
            >
              <div className="mb-1 text-sm font-medium tracking-tight">
                {o.title}
                {o.value !== "build" && <SoonTag />}
              </div>
              <div className={["text-xs leading-5", sel ? "text-white/75" : "text-black/60"].join(" ")}>
                {o.body}
              </div>
            </button>
          );
        })}
      </div>

      {/* Axis 1 — Level */}
      <p className="mb-2 mt-7 text-xs uppercase tracking-wide text-black/40">How hands-on are you?</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {LEVELS.map((o) => {
          const sel = profile.level === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange({ ...profile, level: o.value })}
              className={[
                "rounded-2xl border p-4 text-left transition",
                sel
                  ? "border-black bg-black text-white shadow-sm"
                  : "border-black/10 bg-white text-black hover:border-black/25 hover:bg-black/[0.02]",
              ].join(" ")}
            >
              <div className="mb-1 text-sm font-medium tracking-tight">{o.title}</div>
              <div className={["text-xs leading-5", sel ? "text-white/75" : "text-black/60"].join(" ")}>
                {o.body}
              </div>
            </button>
          );
        })}
      </div>

      {/* Axis 2 — Platform (pre-filled from Purpose) */}
      <p className="mb-2 mt-7 text-xs uppercase tracking-wide text-black/40">
        Where will it run? <span className="normal-case text-black/35">— suggested from your purpose, change anytime</span>
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
                "rounded-2xl border px-4 py-3 text-center text-sm font-medium transition",
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

      <div className="mt-8 flex items-center justify-between gap-4">
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
