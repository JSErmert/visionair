"use client";
import { useState, useEffect } from "react";
import { SEED_KEY, PROGRESS_KEY } from "@/lib/build-mode/seed";
import type { BuildSeed, BuildProgress } from "@/lib/build-mode/seed";
import { composeIdea } from "@/lib/build-mode/entry";
import type { EntryPoint } from "@/lib/build-mode/entry";
import { LIMITS } from "@/lib/build-mode/limits";
import StartingPoint from "@/app/session/flow/starting-point";
import SeedPrompt from "@/app/session/flow/seed-prompt";
import ScreenShell from "@/components/screen-shell";
import ScreenIntro from "@/components/screen-intro";
import PrimaryButton from "@/components/primary-button";
import SecondaryButton from "@/components/secondary-button";

type Answer = { move: string; question: string; response: string };
type Question = { move: string; text: string };
type Phase = "start" | "seed" | "interview" | "building" | "blueprint" | "error" | "resume";

export default function BuildClient() {
  const [phase, setPhase] = useState<Phase>("start");
  const [entryPoint, setEntryPoint] = useState<EntryPoint | "">("");
  const [seedValue, setSeedValue] = useState("");
  const [idea, setIdea] = useState("");
  const [fromBlueprint, setFromBlueprint] = useState(false);

  // Question history. responses[i] answers questions[i] (""=unanswered); idx is
  // the question currently on screen. This is what makes Back/Continue navigate
  // real history instead of restarting.
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<string[]>([]);
  const [idx, setIdx] = useState(-1);
  const [draft, setDraft] = useState("");
  const [complete, setComplete] = useState(false);

  const [url, setUrl] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState("");
  const [saved, setSaved] = useState<{ sessionId: number; versionNo: number } | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    // A fresh seed handed off from /session always wins over saved progress.
    try {
      const raw = sessionStorage.getItem(SEED_KEY);
      if (raw) {
        const seed = JSON.parse(raw) as BuildSeed;
        setFromBlueprint(true);
        sessionStorage.removeItem(SEED_KEY);
        sessionStorage.removeItem(PROGRESS_KEY);
        setPhase("interview");
        guard(() => startInterview(seed.idea));
        return;
      }
    } catch {
      // ignore malformed seed
    }
    // Otherwise, recover an in-progress build (transient failure or refresh).
    try {
      const rawP = sessionStorage.getItem(PROGRESS_KEY);
      if (rawP) {
        const p = JSON.parse(rawP) as BuildProgress;
        if (p && Array.isArray(p.questions) && p.questions.length > 0) {
          setIdea(p.idea);
          setQuestions(p.questions);
          setResponses(Array.isArray(p.responses) ? p.responses : []);
          setComplete(!!p.complete);
          if (p.complete) {
            // All questions answered — only the pack step remains. Offer a
            // button rather than auto-firing, so a refresh never spends API.
            setPhase("resume");
          } else {
            const i = Math.min(
              typeof p.idx === "number" ? p.idx : p.questions.length - 1,
              p.questions.length - 1,
            );
            setIdx(i);
            setDraft((Array.isArray(p.responses) ? p.responses[i] : "") ?? "");
            setPhase("interview");
          }
        }
      }
    } catch {
      // ignore malformed progress
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function answersFrom(qs: Question[], rs: string[]): Answer[] {
    return qs
      .map((qq, i) => ({ move: qq.move, question: qq.text, response: (rs[i] ?? "").trim() }))
      .filter((a) => a.response.length > 0);
  }

  function saveProgress(p: BuildProgress) {
    try {
      sessionStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
    } catch {
      // storage full / unavailable — recovery is best-effort
    }
  }

  function clearProgress() {
    try {
      sessionStorage.removeItem(PROGRESS_KEY);
    } catch {
      /* no-op */
    }
  }

  async function post(action: "question" | "pack", ans: Answer[], seedIdea: string) {
    const r = await fetch("/api/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, idea: seedIdea, answers: ans }),
    });
    if (!r.ok) {
      const j = (await r.json().catch(() => ({}))) as { error?: string; detail?: string };
      throw new Error(j.detail || j.error || "request failed");
    }
    return r;
  }

  // The pack step in isolation, so it can be retried after a transient failure
  // without re-walking the interview.
  async function runPack(effectiveIdea: string, finalAnswers: Answer[]) {
    setPhase("building");
    const packR = await fetch("/api/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "pack", idea: effectiveIdea, answers: finalAnswers }),
    });
    if (!packR.ok) {
      const j = (await packR.json().catch(() => ({}))) as { error?: string; detail?: string };
      throw new Error(j.detail || j.error || "build failed");
    }
    const packData = await packR.json(); // { blueprint, zipBase64, saved? }
    const bytes = Uint8Array.from(atob(packData.zipBase64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "application/zip" });
    setBlueprint(packData.blueprint);
    setSaved(packData.saved ?? null);
    setUrl(URL.createObjectURL(blob));
    setPhase("blueprint");
    clearProgress();
  }

  // Ask the server for the NEXT question (or build the pack if the interview is
  // complete). Only ever called at the frontier — never when revisiting history.
  async function askNext(effectiveIdea: string, qs: Question[], rs: string[]) {
    const ans = answersFrom(qs, rs);
    const r = await post("question", ans, effectiveIdea);
    const data = await r.json();
    if (data.done) {
      setComplete(true);
      saveProgress({ idea: effectiveIdea, questions: qs, responses: rs, idx: qs.length - 1, complete: true });
      await runPack(effectiveIdea, ans);
    } else {
      const nq: Question = { move: data.move, text: data.text };
      const nqs = [...qs, nq];
      const nrs = [...rs, ""];
      setQuestions(nqs);
      setResponses(nrs);
      setIdx(nqs.length - 1);
      setDraft("");
      setComplete(false);
      saveProgress({ idea: effectiveIdea, questions: nqs, responses: nrs, idx: nqs.length - 1, complete: false });
      setPhase("interview");
    }
  }

  // Fresh interview from a seed idea (first LLM question).
  async function startInterview(ideaStr: string) {
    setIdea(ideaStr);
    setQuestions([]);
    setResponses([]);
    setIdx(-1);
    setComplete(false);
    await askNext(ideaStr, [], []);
  }

  // Continue from the question on screen.
  function onContinue() {
    const rs = [...responses];
    rs[idx] = draft.trim();
    setResponses(rs);
    if (idx < questions.length - 1) {
      // Revisiting an earlier question — step forward to the already-known next
      // one. No API call, no question regeneration.
      const ni = idx + 1;
      setIdx(ni);
      setDraft(rs[ni] ?? "");
      saveProgress({ idea, questions, responses: rs, idx: ni, complete });
    } else {
      // At the frontier — ask the server for what comes next.
      guard(() => askNext(idea, questions, rs));
    }
  }

  // Back from the question on screen — preserve current edits, never regenerate.
  function onBack() {
    const rs = [...responses];
    if (idx >= 0) rs[idx] = draft.trim();
    setResponses(rs);
    if (idx > 0) {
      const pi = idx - 1;
      setIdx(pi);
      setDraft(rs[pi] ?? "");
      saveProgress({ idea, questions, responses: rs, idx: pi, complete });
    } else {
      // Before the first question is the seed page. Keep everything intact.
      setPhase("seed");
    }
  }

  // Resume after a failure/refresh: re-run only what's left, using saved answers.
  function resume() {
    if (complete) {
      guard(() => runPack(idea, answersFrom(questions, responses)));
    } else {
      guard(() => askNext(idea, questions, responses));
    }
  }

  function startOver() {
    clearProgress();
    setQuestions([]);
    setResponses([]);
    setIdx(-1);
    setDraft("");
    setComplete(false);
    setErr("");
    setFromBlueprint(false);
    setPhase("start");
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
        onBack={() => {
          // First page: Back returns to the home landing (the front door).
          window.location.href = "/";
        }}
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
          if (questions.length > 0) {
            // Returning forward from Back — keep the existing questions exactly
            // as asked (never regenerate); just re-enter the interview at Q1.
            setIdx(0);
            setDraft(responses[0] ?? "");
            setPhase("interview");
          } else {
            setPhase("interview");
            guard(() => startInterview(composed));
          }
        }}
        onBack={() => setPhase("start")}
      />
    );

  if (phase === "interview" && idx >= 0 && questions[idx])
    return (
      <ScreenShell>
        <ScreenIntro
          eyebrow="Discovering your path"
          title="Let's go a little deeper."
          description="You do not need to sound polished. A real answer is enough."
        />
        {fromBlueprint && (
          <p className="mb-4 text-sm text-foreground/55 bg-foreground/[0.03] rounded-xl px-4 py-2">
            Starting from your VisionAir blueprint.
          </p>
        )}
        <p className="mb-2 text-xs uppercase tracking-wide text-foreground/40">
          Question {idx + 1}
        </p>
        <div className="mb-5 rounded-2xl border border-border/10 bg-foreground/[0.02] p-5">
          <p className="text-base leading-7 text-foreground/85">{questions[idx].text}</p>
        </div>
        <div className="mb-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, LIMITS.response))}
            maxLength={LIMITS.response}
            placeholder="Write freely. You do not need to sound polished — just be real."
            rows={10}
            className="w-full rounded-2xl border border-border/10 bg-card px-5 py-4 text-base leading-7 text-foreground outline-none transition placeholder:text-foreground/35 focus:border-border/25"
          />
          <p
            className={`mt-2 text-right text-xs ${
              draft.length >= LIMITS.response ? "font-medium text-red-600" : "text-foreground/40"
            }`}
          >
            {draft.length >= LIMITS.response
              ? `character limit: ${LIMITS.response.toLocaleString()}`
              : `${draft.length.toLocaleString()} / ${LIMITS.response.toLocaleString()}`}
          </p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <SecondaryButton onClick={onBack}>Back</SecondaryButton>
          <PrimaryButton disabled={draft.trim().length === 0} onClick={onContinue}>
            Continue
          </PrimaryButton>
        </div>
      </ScreenShell>
    );

  if (phase === "building")
    return (
      <ScreenShell>
        <p className="text-base text-foreground/70">Engineering your context pack…</p>
      </ScreenShell>
    );

  if (phase === "blueprint" && url)
    return (
      <ScreenShell>
        {saved ? (
          <p className="mb-4 text-sm text-foreground/60 bg-foreground/[0.03] rounded-xl px-4 py-2">
            Saved as <strong>V{saved.versionNo}</strong> to your library.{" "}
            <a href="/build/library" className="underline hover:text-foreground">
              View your library →
            </a>
          </p>
        ) : (
          <p className="mb-4 text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-2">
            Not saved to your library —{" "}
            <a href="/build/login?next=/build/library" className="underline hover:text-amber-900">
              sign in
            </a>{" "}
            first and your builds save automatically. Your pack is still ready to download below.
          </p>
        )}
        <pre className="whitespace-pre-wrap text-sm leading-relaxed mb-5">{blueprint}</pre>
        <a
          className="inline-block rounded bg-foreground px-4 py-2 text-background"
          href={url}
          download="build-mode-pack.zip"
        >
          Download your build pack →
        </a>
        <p className="mt-3 mb-6 text-sm opacity-70">Unzip into a fresh repo and open it in Claude Code — start with LAUNCH.md.</p>
        <div className="flex items-center justify-between gap-4 border-t border-border/10 pt-5">
          <SecondaryButton onClick={startOver}>Start a new build</SecondaryButton>
          <a
            href="/build/library"
            className="text-sm underline text-foreground/60 hover:text-foreground"
          >
            Go to your library →
          </a>
        </div>
      </ScreenShell>
    );

  if (phase === "resume")
    return (
      <ScreenShell>
        <ScreenIntro
          eyebrow="Welcome back"
          title="Let's pick up where you left off."
          description="Your answers are saved. We just need to finish engineering your pack."
        />
        <p className="mb-5 text-sm text-foreground/55 bg-foreground/[0.03] rounded-xl px-4 py-2">
          {answersFrom(questions, responses).length} answers saved — nothing to re-do.
        </p>
        <div className="flex items-center justify-between gap-4">
          <SecondaryButton onClick={startOver}>Start over</SecondaryButton>
          <PrimaryButton onClick={resume}>Continue where I left off</PrimaryButton>
        </div>
      </ScreenShell>
    );

  return (
    <ScreenShell>
      <p className="text-red-600 mb-2">Something went wrong: {err}</p>
      <p className="mb-5 text-sm text-foreground/60">
        This is usually a temporary hiccup. Your answers are saved
        {answersFrom(questions, responses).length
          ? ` (${answersFrom(questions, responses).length} so far)`
          : ""}{" "}
        — you can pick up right where you left off without redoing anything.
      </p>
      <div className="flex items-center justify-between gap-4">
        <button
          className="text-sm underline text-foreground/50 hover:text-foreground"
          onClick={startOver}
        >
          Start over
        </button>
        <PrimaryButton onClick={resume}>Continue where I left off</PrimaryButton>
      </div>
    </ScreenShell>
  );
}
