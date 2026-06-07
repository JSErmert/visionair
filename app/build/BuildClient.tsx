"use client";
import { useState } from "react";

type Answer = { move: string; question: string; response: string };
type Phase = "idea" | "interview" | "building" | "done" | "error";

export default function BuildClient() {
  const [phase, setPhase] = useState<Phase>("idea");
  const [idea, setIdea] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [q, setQ] = useState<{ move: string; text: string } | null>(null);
  const [draft, setDraft] = useState("");
  const [url, setUrl] = useState<string | null>(null);
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
      const packR = await post("pack", nextAnswers);
      const blob = await packR.blob();
      setUrl(URL.createObjectURL(blob));
      setPhase("done");
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
        <h1 className="text-2xl font-semibold">Build Mode — context pack for Claude Code</h1>
        <p className="text-sm text-black/50">
          Describe your full-stack app idea. A few focused questions, then download a ready-to-build
          context pack.
        </p>
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
