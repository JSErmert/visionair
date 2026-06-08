"use client";
import { useState, useEffect } from "react";
import { SEED_KEY } from "@/lib/build-mode/seed";
import type { BuildSeed } from "@/lib/build-mode/seed";

type Answer = { move: string; question: string; response: string };
type Phase = "idea" | "interview" | "building" | "blueprint" | "done" | "error";

export default function BuildClient() {
  const [phase, setPhase] = useState<Phase>("idea");
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
      }
    } catch {
      // ignore malformed seed
    }
  }, []);
  const [q, setQ] = useState<{ move: string; text: string } | null>(null);
  const [draft, setDraft] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState("");
  const [err, setErr] = useState("");

  async function post(action: "question" | "pack", nextAnswers: Answer[]) {
    const r = await fetch("/api/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, idea, answers: nextAnswers }),
    });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "request failed");
    return r;
  }

  async function advance(nextAnswers: Answer[]) {
    const r = await post("question", nextAnswers);
    const data = await r.json();
    if (data.done) {
      setPhase("building");
      const packR = await fetch("/api/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pack", idea, answers: nextAnswers }),
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

  if (phase === "idea")
    return (
      <main className="mx-auto max-w-2xl p-8 space-y-4">
        <h1 className="text-2xl font-semibold">Let's begin with what feels real.</h1>
        <p className="text-sm text-black/50">
          A few questions, in your words — then a blueprint and a ready-to-build pack. You do not
          need a title first.
        </p>
        {fromBlueprint && (
          <p className="text-sm text-black/55 bg-black/[0.03] rounded-xl px-4 py-2">
            Starting from your VisionAir blueprint — edit if needed, then Start.
          </p>
        )}
        <textarea
          className="w-full h-32 rounded-2xl border border-black/10 bg-white px-5 py-4 text-base leading-7 text-black outline-none transition placeholder:text-black/35 focus:border-black/25"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="e.g. a habit tracker where…"
        />
        <button
          className="rounded-2xl bg-black px-6 py-3 text-sm font-medium text-white transition disabled:opacity-40 hover:bg-black/85"
          disabled={idea.trim().length < 8}
          onClick={() => guard(() => advance([]))}
        >
          Start
        </button>
      </main>
    );

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

  if (phase === "done" && url)
    return (
      <main className="mx-auto max-w-2xl p-8 space-y-4">
        <h2 className="text-xl font-semibold">Your pack is ready.</h2>
        <a
          className="inline-block rounded-2xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-black/85"
          href={url}
          download="build-mode-pack.zip"
        >
          Download ZIP
        </a>
        <p className="text-sm text-black/50">
          Unzip into a fresh repo and open it in Claude Code — start with LAUNCH.md.
        </p>
      </main>
    );

  return (
    <main className="mx-auto max-w-2xl p-8 space-y-3">
      <p className="text-red-600">Something went wrong: {err}</p>
      <button
        className="text-sm underline text-black/60 hover:text-black"
        onClick={() => {
          setPhase("idea");
          setErr("");
        }}
      >
        Start over
      </button>
    </main>
  );
}
