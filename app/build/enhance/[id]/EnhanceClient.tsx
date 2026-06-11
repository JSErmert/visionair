"use client";
import { useEffect, useState } from "react";
import ScreenShell from "@/components/screen-shell";
import ScreenIntro from "@/components/screen-intro";
import PrimaryButton from "@/components/primary-button";
import SecondaryButton from "@/components/secondary-button";
import { LIMITS } from "@/lib/build-mode/limits";

type Target = { move: string; question: string; rationale: string };
type Answer = { move: string; question: string; response: string };
type Phase = "auditing" | "interview" | "empty" | "finishing" | "done" | "error";

export default function EnhanceClient({ sessionId }: { sessionId: number }) {
  const [phase, setPhase] = useState<Phase>("auditing");
  const [targets, setTargets] = useState<Target[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [draft, setDraft] = useState("");
  const [blueprint, setBlueprint] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const [savedNo, setSavedNo] = useState<number | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/enhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "audit", sessionId }),
    })
      .then(async (r) => {
        if (r.status === 401) {
          window.location.href = `/build/login?next=/build/enhance/${sessionId}`;
          return null;
        }
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || "audit failed");
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        const t: Target[] = d.targets ?? [];
        setTargets(t);
        setPhase(t.length ? "interview" : "empty");
      })
      .catch((e) => {
        setErr(String(e.message || e));
        setPhase("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recordCurrent = (): Answer[] => {
    if (!draft.trim() || !targets[idx]) return answers;
    const a: Answer = { move: targets[idx].move, question: targets[idx].question, response: draft.trim() };
    const next = [...answers, a];
    setAnswers(next);
    return next;
  };

  const advance = () => {
    recordCurrent();
    setDraft("");
    setIdx((i) => i + 1);
  };

  const skip = () => {
    setDraft("");
    setIdx((i) => i + 1);
  };

  async function finish() {
    const finalAnswers = recordCurrent();
    setPhase("finishing");
    try {
      const r = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "finish", sessionId, answers: finalAnswers }),
      });
      if (r.status === 401) {
        window.location.href = `/build/login?next=/build/enhance/${sessionId}`;
        return;
      }
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || "enhance failed");
      const d = await r.json();
      const bytes = Uint8Array.from(atob(d.zipBase64), (c) => c.charCodeAt(0));
      setUrl(URL.createObjectURL(new Blob([bytes], { type: "application/zip" })));
      setBlueprint(d.blueprint);
      setSavedNo(d.saved?.versionNo ?? null);
      setPhase("done");
    } catch (e) {
      setErr(String((e as Error).message || e));
      setPhase("error");
    }
  }

  if (phase === "auditing")
    return (
      <ScreenShell>
        <ScreenIntro
          eyebrow="Enhancing your pack"
          title="Finding the highest-leverage gaps…"
          description="Reading your pack for open questions and thin spots worth deepening."
        />
      </ScreenShell>
    );

  if (phase === "empty")
    return (
      <ScreenShell>
        <ScreenIntro
          eyebrow="Enhancing your pack"
          title="This pack is already strong."
          description="Nothing high-leverage to add right now — your current version holds up."
        />
        <a href="/build/library" className="text-sm underline text-foreground/60 hover:text-foreground">
          ← Back to your library
        </a>
      </ScreenShell>
    );

  if (phase === "finishing")
    return (
      <ScreenShell>
        <p className="text-base text-foreground/70">Re-engineering your context pack…</p>
      </ScreenShell>
    );

  if (phase === "done")
    return (
      <ScreenShell>
        <p className="mb-4 text-sm text-foreground/60 bg-foreground/[0.03] rounded-xl px-4 py-2">
          Saved as <strong>V{savedNo}</strong> to your library.{" "}
          <a href="/build/library" className="underline hover:text-foreground">
            View your library →
          </a>
        </p>
        <pre className="whitespace-pre-wrap text-sm leading-relaxed mb-5">{blueprint}</pre>
        {url && (
          <a className="inline-block rounded bg-foreground px-4 py-2 text-background" href={url} download={`build-mode-pack-v${savedNo}.zip`}>
            Download V{savedNo} pack →
          </a>
        )}
        <div className="mt-6 flex items-center justify-between gap-4 border-t border-border/10 pt-5">
          <a href="/build/library" className="text-sm underline text-foreground/60 hover:text-foreground">
            ← Your library
          </a>
        </div>
      </ScreenShell>
    );

  if (phase === "error")
    return (
      <ScreenShell>
        <p className="text-red-600 mb-3">Something went wrong: {err}</p>
        <a href="/build/library" className="text-sm underline text-foreground/60 hover:text-foreground">
          ← Back to your library
        </a>
      </ScreenShell>
    );

  // interview
  const t = targets[idx];
  const beyondTargets = !t;
  return (
    <ScreenShell>
      <ScreenIntro
        eyebrow="Enhancing your pack"
        title="Let's deepen this."
        description="Each answer sharpens the next version. Stop whenever you're ready — your work is saved as a new version."
      />
      <p className="mb-3 text-xs uppercase tracking-wide text-foreground/40">
        {beyondTargets ? "All suggestions covered" : `Suggestion ${idx + 1} of ${targets.length}`}
      </p>
      {!beyondTargets && (
        <>
          {t.rationale && (
            <p className="mb-2 text-xs text-foreground/45">Why this: {t.rationale}</p>
          )}
          <div className="mb-5 rounded-2xl border border-border/10 bg-foreground/[0.02] p-5">
            <p className="text-base leading-7 text-foreground/85">{t.question}</p>
          </div>
          <div className="mb-4">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, LIMITS.response))}
              maxLength={LIMITS.response}
              placeholder="Write freely. You do not need to sound polished — just be real."
              rows={9}
              className="w-full rounded-2xl border border-border/10 bg-card px-5 py-4 text-base leading-7 text-foreground outline-none transition placeholder:text-foreground/35 focus:border-border/25"
            />
            <p className={`mt-2 text-right text-xs ${draft.length >= LIMITS.response ? "font-medium text-red-600" : "text-foreground/40"}`}>
              {draft.length >= LIMITS.response
                ? `character limit: ${LIMITS.response.toLocaleString()}`
                : `${draft.length.toLocaleString()} / ${LIMITS.response.toLocaleString()}`}
            </p>
          </div>
          <div className="flex items-center justify-between gap-4">
            <SecondaryButton onClick={skip}>Skip</SecondaryButton>
            <PrimaryButton disabled={draft.trim().length === 0} onClick={advance}>
              Continue
            </PrimaryButton>
          </div>
        </>
      )}
      {beyondTargets && (
        <p className="mb-6 text-sm text-foreground/60">
          You've gone through every suggestion. Finish to save the improved version.
        </p>
      )}
      <div className="mt-6 flex items-center justify-between gap-4 border-t border-border/10 pt-5">
        <a href="/build/library" className="text-sm underline text-foreground/50 hover:text-foreground">
          Cancel
        </a>
        <PrimaryButton onClick={finish}>Finish &amp; save new version</PrimaryButton>
      </div>
    </ScreenShell>
  );
}
