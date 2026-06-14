"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import JSZip from "jszip";
import ScreenShell from "@/components/screen-shell";
import ScreenIntro from "@/components/screen-intro";
import SecondaryButton from "@/components/secondary-button";
import Spinner from "@/components/spinner";

type SessionSummary = { id: number; title: string; updatedAt: string; versionCount: number };
type QAItem = { move: string; question: string; response: string };
type VersionDetail = {
  id: number;
  versionNo: number;
  createdAt: string;
  qa: QAItem[];
  blueprint: string;
  files: Record<string, string>;
};
type SessionDetail = {
  id: number;
  title: string;
  idea: string;
  summary: string | null;
  createdAt: string;
  versions: VersionDetail[];
};

function fmtDate(s: string): string {
  try {
    return new Date(s).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
}

// Minimal markdown renderer for the session overview (## / ### / - / paragraphs).
function renderLite(md: string): ReactNode[] {
  const out: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = (key: string) => {
    if (bullets.length) {
      out.push(
        <ul key={key} className="my-2 ml-4 list-disc space-y-1">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>,
      );
      bullets = [];
    }
  };
  md.split("\n").forEach((raw, i) => {
    const line = raw.trimEnd();
    if (/^##\s+/.test(line)) {
      flush(`u${i}`);
      out.push(
        <p key={i} className="mt-4 mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/45">
          {line.replace(/^##\s+/, "")}
        </p>,
      );
    } else if (/^###\s+/.test(line)) {
      flush(`u${i}`);
      out.push(
        <p key={i} className="mt-2 font-medium text-foreground/75">
          {line.replace(/^###\s+/, "")}
        </p>,
      );
    } else if (/^[-*]\s+/.test(line)) {
      bullets.push(line.replace(/^[-*]\s+/, ""));
    } else if (line.trim() === "") {
      flush(`u${i}`);
    } else {
      flush(`u${i}`);
      out.push(
        <p key={i} className="mb-1">
          {line}
        </p>,
      );
    }
  });
  flush("uend");
  return out;
}

async function downloadVersion(title: string, v: VersionDetail) {
  const zip = new JSZip();
  for (const [path, content] of Object.entries(v.files)) zip.file(path, content);
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-v${v.versionNo}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function LibraryClient() {
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [openVersion, setOpenVersion] = useState<number | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [err, setErr] = useState("");
  // Cache fetched session details so the loading signal shows only on the FIRST
  // open of a given session; re-opens load instantly (no LLM ever runs on open —
  // title + description are locked, so a re-open is a pure cache hit).
  const detailCache = useRef<Map<number, SessionDetail>>(new Map());

  useEffect(() => {
    fetch("/api/sessions")
      .then(async (r) => {
        if (r.status === 401) {
          setNeedsLogin(true);
          return;
        }
        if (!r.ok) throw new Error("Could not load your library.");
        const d = await r.json();
        setSessions(d.sessions ?? []);
      })
      .catch((e) => setErr(String(e.message || e)));
  }, []);

  function openSession(id: number) {
    setErr("");
    // Re-open: serve the already-loaded session instantly, no loading screen.
    const cached = detailCache.current.get(id);
    if (cached) {
      setDetail(cached);
      setOpenVersion(cached.versions?.[0]?.versionNo ?? null);
      return;
    }
    // First open of this session: show the loading signal during the fetch.
    setDetail(null);
    setLoadingDetail(true);
    fetch(`/api/sessions/${id}`)
      .then(async (r) => {
        if (r.status === 401) {
          setNeedsLogin(true);
          return;
        }
        if (!r.ok) throw new Error("Could not open that session.");
        const d = await r.json();
        detailCache.current.set(id, d.session);
        setDetail(d.session);
        setOpenVersion(d.session?.versions?.[0]?.versionNo ?? null);
      })
      .catch((e) => setErr(String(e.message || e)))
      .finally(() => setLoadingDetail(false));
  }

  function removeSession(id: number) {
    if (!window.confirm("Delete this session and all its versions? This cannot be undone.")) return;
    fetch(`/api/sessions/${id}`, { method: "DELETE" })
      .then((r) => {
        if (!r.ok) throw new Error("Delete failed.");
        detailCache.current.delete(id);
        setSessions((prev) => (prev ? prev.filter((s) => s.id !== id) : prev));
      })
      .catch((e) => setErr(String(e.message || e)));
  }

  if (needsLogin)
    return (
      <ScreenShell>
        <ScreenIntro
          eyebrow="Your library"
          title="Sign in to view your library."
          description="Your saved sessions and Enhance are private to you."
        />
        <a
          href="/build/login?next=/build/library"
          className="inline-block rounded bg-foreground px-4 py-2 text-sm text-background"
        >
          Sign in →
        </a>
      </ScreenShell>
    );

  // --- Loading a session (buffer between click and the stored record) ---
  if (loadingDetail) {
    return (
      <ScreenShell>
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-foreground/55">Opening your session…</p>
        </div>
      </ScreenShell>
    );
  }

  // --- Session detail view ---
  if (detail) {
    return (
      <ScreenShell>
        <ScreenIntro
          eyebrow="Your library"
          title={detail.title}
          description="The current shape of this session, and what each version added."
        />
        <div className="mb-5 flex items-center justify-between gap-4">
          <SecondaryButton onClick={() => setDetail(null)}>← All sessions</SecondaryButton>
          <a
            href={`/build/enhance/${detail.id}`}
            className="rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-foreground/85"
          >
            Enhance →
          </a>
        </div>
        <div className="mb-6 rounded-2xl border border-border/10 bg-foreground/[0.02] p-5 text-sm leading-7 text-foreground/80">
          {detail.summary && detail.summary.trim()
            ? renderLite(detail.summary)
            : <p className="text-foreground/55">{detail.idea}</p>}
        </div>
        <div className="flex flex-col gap-3">
          {detail.versions.map((v) => {
            const isOpen = openVersion === v.versionNo;
            return (
              <div key={v.id} className="rounded-2xl border border-border/10 bg-card">
                <button
                  type="button"
                  onClick={() => setOpenVersion(isOpen ? null : v.versionNo)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                >
                  <span className="text-base font-medium text-foreground">Version {v.versionNo}</span>
                  <span className="text-xs text-foreground/45">{fmtDate(v.createdAt)}</span>
                </button>
                {isOpen && (
                  <div className="border-t border-border/10 px-5 py-4">
                    <button
                      type="button"
                      onClick={() => downloadVersion(detail.title, v)}
                      className="mb-4 inline-block rounded bg-foreground px-4 py-2 text-sm text-background"
                    >
                      Download V{v.versionNo} pack →
                    </button>
                    <p className="mb-2 text-xs uppercase tracking-wide text-foreground/40">Blueprint</p>
                    <pre className="mb-5 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-foreground/[0.02] p-4 text-sm leading-relaxed text-foreground/85">
                      {v.blueprint}
                    </pre>
                    <p className="mb-2 text-xs uppercase tracking-wide text-foreground/40">
                      Interview ({v.qa.length} answers)
                    </p>
                    <ol className="flex flex-col gap-3">
                      {v.qa.map((qa, i) => (
                        <li key={i} className="rounded-xl border border-border/10 p-4">
                          <p className="mb-1 text-sm font-medium text-foreground/75">{qa.question}</p>
                          <p className="text-sm leading-6 text-foreground/65">{qa.response}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScreenShell>
    );
  }

  // --- Session list view ---
  return (
    <ScreenShell>
      <ScreenIntro
        eyebrow="Your library"
        title="Your build sessions"
        description="Every session you complete is saved here, most recent first. Open one to view its versions and re-download the pack."
      />
      {err && <p className="mb-5 text-sm text-red-600">{err}</p>}
      {sessions === null && !err && <p className="text-sm text-foreground/55">Loading…</p>}
      {sessions !== null && sessions.length === 0 && (
        <div className="rounded-2xl border border-border/10 bg-card p-6 text-center">
          <p className="mb-3 text-sm text-foreground/60">No saved sessions yet.</p>
          <a href="/build" className="text-sm underline text-foreground/70 hover:text-foreground">
            Start your first build →
          </a>
        </div>
      )}
      {sessions !== null && sessions.length > 0 && (
        <ul className="flex flex-col gap-2">
          {sessions.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border/10 bg-card px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-medium text-foreground">{s.title}</p>
                <p className="text-xs text-foreground/50">
                  {fmtDate(s.updatedAt)} · {s.versionCount}{" "}
                  {s.versionCount === 1 ? "version" : "versions"}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => openSession(s.id)}
                  className="rounded-xl border border-border/15 bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-foreground/[0.04]"
                >
                  Open
                </button>
                <button
                  type="button"
                  onClick={() => removeSession(s.id)}
                  className="rounded-xl border border-border/15 bg-card px-3 py-2 text-sm text-foreground/55 transition hover:border-red-300 hover:text-red-600"
                  title="Delete session"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-8">
        <a href="/build" className="text-sm underline text-foreground/60 hover:text-foreground">
          ← New build
        </a>
      </div>
    </ScreenShell>
  );
}
