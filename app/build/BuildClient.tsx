"use client";
import { useState, useEffect } from "react";
import { SEED_KEY } from "@/lib/build-mode/seed";
import type { BuildSeed } from "@/lib/build-mode/seed";
import { composeIdea } from "@/lib/build-mode/entry";
import type { EntryPoint } from "@/lib/build-mode/entry";
import StartingPoint from "@/app/session/flow/starting-point";
import ScreenShell from "@/components/screen-shell";
import ScreenIntro from "@/components/screen-intro";
import PrimaryButton from "@/components/primary-button";

type Answer = { move: string; question: string; response: string };
type Phase = "start" | "describe" | "interview" | "building" | "blueprint" | "error";

const DESCRIBE_INTRO: Record<EntryPoint, { title: string; description: string }> = {
  strength: {
    title: "Tell me what's there.",
    description: "Describe the capability as concretely as you can — what you do, when you feel most useful, what makes it real.",
  },
  problem: {
    title: "Tell me what's there.",
    description: "Describe the problem in your own words — what's wrong, who it affects, why it matters to you.",
  },
  idea: {
    title: "Tell me what's there.",
    description: "Describe the idea as it exists right now — even if it's still unformed. What keeps returning to you?",
  },
  direction: {
    title: "Tell me what's there.",
    description: "Describe the direction you feel pulled toward — what draws you, even if you can't fully name it yet.",
  },
  unsure: {
    title: "Tell me what's there.",
    description: "Describe whatever signal you do have — a feeling, a frustration, a recurring thought. Anything real.",
  },
};

export default function BuildClient() {
  const [phase, setPhase] = useState<Phase>("start");
  const [entryPoint, setEntryPoint] = useState<EntryPoint | "">("");
  const [description, setDescription] = useState("");
  const [idea, setIdea] = useState("");
  const [fromBlueprint, setFromBlueprint] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SEED_KEY);
      if (raw) {
        const seed = JSON.parse(raw) as BuildSeed;
        setIdea(seed.idea);
        setFromBlueprint(true);
        sessionStorage.removeItem(SEED_KEY);
        setPhase("interview");
        guard(() => advance([], seed.idea));
      }
    } catch {
      // ignore malformed seed
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [q, setQ] = useState<{ move: string; text: string } | null>(null);
  const [draft, setDraft] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState("");
  const [err, setErr] = useState("");

  async function post(action: "question" | "pack", nextAnswers: Answer[], seedIdea: string) {
    const r = await fetch("/api/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, idea: seedIdea, answers: nextAnswers }),
    });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "request failed");
    return r;
  }

  async function advance(nextAnswers: Answer[], seedIdea?: string) {
    const effectiveIdea = seedIdea ?? idea;
    const r = await post("question", nextAnswers, effectiveIdea);
    const data = await r.json();
    if (data.done) {
      setPhase("building");
      const packR = await fetch("/api/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pack", idea: effectiveIdea, answers: nextAnswers }),
      });
      if (!packR.ok) throw new Error((await packR.json().catch(() => ({}))).error || "build failed");
      const packData = await packR.json(); // { blueprint, zipBase64 }
      const bytes = Uint8Array.from(atob(packData.zipBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "application/zip" });
      setBlueprint(packData.blueprint);
      setUrl(URL.createObjectURL(blob));
      setPhase("blueprint");
    } else {
      setQ({ move: data.move, text: data.text });
      setDraft("");
      setPhase("interview");
    }
  }

  const guard = (fn: () => Promise<void>) =>
    fn().catch((e) => {
      setErr(String(e.message || e));
      setPhase("error");
    });

  if (phase === "start")
    return (
      <StartingPoint
        value={entryPoint}
        onSelect={(v) => setEntryPoint(v)}
        onNext={() => setPhase("describe")}
        onBack={() => {/* no prior step */}}
      />
    );

  if (phase === "describe") {
    const intro = entryPoint ? DESCRIBE_INTRO[entryPoint as EntryPoint] : DESCRIBE_INTRO.unsure;
    return (
      <ScreenShell>
        <ScreenIntro
          eyebrow="Shaping your starting point"
          title={intro.title}
          description={intro.description}
        />
        {fromBlueprint && (
          <p className="mb-4 text-sm text-black/55 bg-black/[0.03] rounded-xl px-4 py-2">
            Starting from your VisionAir blueprint — edit if needed, then Continue.
          </p>
        )}
        <textarea
          className="mb-6 w-full h-36 rounded-2xl border border-black/10 bg-white px-5 py-4 text-base leading-7 text-black outline-none transition placeholder:text-black/35 focus:border-black/25"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write in a real, grounded way — you do not need to sound impressive."
          autoFocus
        />
        <div className="flex items-center justify-between gap-4">
          <button
            className="rounded-2xl border border-black/10 px-4 py-2 text-sm text-black/65 transition hover:border-black/20 hover:text-black"
            onClick={() => setPhase("start")}
          >
            Back
          </button>
          <PrimaryButton
            disabled={description.trim().length < 4}
            onClick={() => {
              const composed = composeIdea(entryPoint as EntryPoint, description.trim());
              setIdea(composed);
              guard(() => advance([], composed));
            }}
          >
            Continue
          </PrimaryButton>
        </div>
      </ScreenShell>
    );
  }

  if (phase === "interview" && q)
    return (
      <main className="mx-auto max-w-2xl p-8 space-y-4">
        <div className="text-xs uppercase tracking-wide text-black/40">
          {q.move} · {answers.length + 1}
        </div>
        <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-5">
          <p className="text-base leading-7 text-black/85">{q.text}</p>
        </div>
        <textarea
          className="w-full h-28 rounded-2xl border border-black/10 bg-white px-5 py-4 text-base leading-7 text-black outline-none transition placeholder:text-black/35 focus:border-black/25"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Your answer — or 'not sure' to flag it as a gap"
        />
        <button
          className="rounded-2xl bg-black px-6 py-3 text-sm font-medium text-white transition disabled:opacity-40 hover:bg-black/85"
          disabled={draft.trim().length === 0}
          onClick={() => {
            const na = [
              ...answers,
              { move: q.move, question: q.text, response: draft.trim() },
            ];
            setAnswers(na);
            guard(() => advance(na));
          }}
        >
          Next
        </button>
      </main>
    );

  if (phase === "building")
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p className="text-base text-black/70">Engineering your context pack…</p>
      </main>
    );

  if (phase === "blueprint" && url)
    return (
      <main className="mx-auto max-w-2xl p-8 space-y-5">
        <pre className="whitespace-pre-wrap text-sm leading-relaxed">{blueprint}</pre>
        <a
          className="inline-block rounded bg-black px-4 py-2 text-white"
          href={url}
          download="build-mode-pack.zip"
        >
          Download your build pack →
        </a>
        <p className="text-sm opacity-70">Unzip into a fresh repo and open it in Claude Code — start with LAUNCH.md.</p>
      </main>
    );

  return (
    <main className="mx-auto max-w-2xl p-8 space-y-3">
      <p className="text-red-600">Something went wrong: {err}</p>
      <button
        className="text-sm underline text-black/60 hover:text-black"
        onClick={() => {
          setPhase("start");
          setErr("");
        }}
      >
        Start over
      </button>
    </main>
  );
}
