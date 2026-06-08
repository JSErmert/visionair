"use client";
import { useState, useEffect } from "react";
import { SEED_KEY } from "@/lib/build-mode/seed";
import type { BuildSeed } from "@/lib/build-mode/seed";
import { composeIdea } from "@/lib/build-mode/entry";
import type { EntryPoint } from "@/lib/build-mode/entry";
import StartingPoint from "@/app/session/flow/starting-point";
import SeedPrompt from "@/app/session/flow/seed-prompt";
import ScreenShell from "@/components/screen-shell";
import ScreenIntro from "@/components/screen-intro";
import PrimaryButton from "@/components/primary-button";
import SecondaryButton from "@/components/secondary-button";

type Answer = { move: string; question: string; response: string };
type Phase = "start" | "seed" | "interview" | "building" | "blueprint" | "error";

export default function BuildClient() {
  const [phase, setPhase] = useState<Phase>("start");
  const [entryPoint, setEntryPoint] = useState<EntryPoint | "">("");
  const [seedValue, setSeedValue] = useState("");
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
        onNext={() => setPhase("seed")}
        onBack={() => {/* no prior step */}}
      />
    );

  if (phase === "seed")
    return (
      <SeedPrompt
        entryPoint={entryPoint}
        value={seedValue}
        onChange={setSeedValue}
        onNext={() => {
          const composed = composeIdea(entryPoint as EntryPoint, seedValue.trim());
          setIdea(composed);
          guard(() => advance([], composed));
        }}
        onBack={() => setPhase("start")}
      />
    );

  if (phase === "interview" && q)
    return (
      <ScreenShell>
        <ScreenIntro
          eyebrow="Discovering your path"
          title="Let's go a little deeper."
          description="You do not need to sound polished. A real answer is enough."
        />
        {fromBlueprint && (
          <p className="mb-4 text-sm text-black/55 bg-black/[0.03] rounded-xl px-4 py-2">
            Starting from your VisionAir blueprint.
          </p>
        )}
        <div className="mb-5 rounded-2xl border border-black/10 bg-black/[0.02] p-5">
          <p className="text-base leading-7 text-black/85">{q.text}</p>
        </div>
        <div className="mb-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write freely. You do not need to sound polished — just be real."
            rows={10}
            className="w-full rounded-2xl border border-black/10 bg-white px-5 py-4 text-base leading-7 text-black outline-none transition placeholder:text-black/35 focus:border-black/25"
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <SecondaryButton
            onClick={() => {
              setPhase("seed");
            }}
          >
            Back
          </SecondaryButton>
          <PrimaryButton
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
            Continue
          </PrimaryButton>
        </div>
      </ScreenShell>
    );

  if (phase === "building")
    return (
      <ScreenShell>
        <p className="text-base text-black/70">Engineering your context pack…</p>
      </ScreenShell>
    );

  if (phase === "blueprint" && url)
    return (
      <ScreenShell>
        <pre className="whitespace-pre-wrap text-sm leading-relaxed mb-5">{blueprint}</pre>
        <a
          className="inline-block rounded bg-black px-4 py-2 text-white"
          href={url}
          download="build-mode-pack.zip"
        >
          Download your build pack →
        </a>
        <p className="mt-3 text-sm opacity-70">Unzip into a fresh repo and open it in Claude Code — start with LAUNCH.md.</p>
      </ScreenShell>
    );

  return (
    <ScreenShell>
      <p className="text-red-600 mb-3">Something went wrong: {err}</p>
      <button
        className="text-sm underline text-black/60 hover:text-black"
        onClick={() => {
          setPhase("start");
          setErr("");
        }}
      >
        Start over
      </button>
    </ScreenShell>
  );
}
