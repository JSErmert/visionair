"use client";
import { useEffect, useState } from "react";
import JSZip from "jszip";
import ScreenShell from "@/components/screen-shell";
import ScreenIntro from "@/components/screen-intro";
import SecondaryButton from "@/components/secondary-button";

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
  const [openVersion, setOpenVersion] = useState<number | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Could not load your library."))))
      .then((d) => setSessions(d.sessions ?? []))
      .catch((e) => setErr(String(e.message || e)));
  }, []);

  function openSession(id: number) {
    setErr("");
    setDetail(null);
    fetch(`/api/sessions/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Could not open that session."))))
      .then((d) => {
        setDetail(d.session);
        setOpenVersion(d.session?.versions?.[0]?.versionNo ?? null);
      })
      .catch((e) => setErr(String(e.message || e)));
  }

  // --- Session detail view ---
  if (detail) {
    return (
      <ScreenShell>
        <ScreenIntro eyebrow="Your library" title={detail.title} description={detail.idea} />
        <div className="mb-5">
          <SecondaryButton onClick={() => setDetail(null)}>← All sessions</SecondaryButton>
        </div>
        <div className="flex flex-col gap-3">
          {detail.versions.map((v) => {
            const isOpen = openVersion === v.versionNo;
            return (
              <div key={v.id} className="rounded-2xl border border-black/10 bg-white">
                <button
                  type="button"
                  onClick={() => setOpenVersion(isOpen ? null : v.versionNo)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                >
                  <span className="text-base font-medium text-black">Version {v.versionNo}</span>
                  <span className="text-xs text-black/45">{fmtDate(v.createdAt)}</span>
                </button>
                {isOpen && (
                  <div className="border-t border-black/10 px-5 py-4">
                    <button
                      type="button"
                      onClick={() => downloadVersion(detail.title, v)}
                      className="mb-4 inline-block rounded bg-black px-4 py-2 text-sm text-white"
                    >
                      Download V{v.versionNo} pack →
                    </button>
                    <p className="mb-2 text-xs uppercase tracking-wide text-black/40">Blueprint</p>
                    <pre className="mb-5 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-black/[0.02] p-4 text-sm leading-relaxed text-black/85">
                      {v.blueprint}
                    </pre>
                    <p className="mb-2 text-xs uppercase tracking-wide text-black/40">
                      Interview ({v.qa.length} answers)
                    </p>
                    <ol className="flex flex-col gap-3">
                      {v.qa.map((qa, i) => (
                        <li key={i} className="rounded-xl border border-black/10 p-4">
                          <p className="mb-1 text-sm font-medium text-black/75">{qa.question}</p>
                          <p className="text-sm leading-6 text-black/65">{qa.response}</p>
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
      {sessions === null && !err && <p className="text-sm text-black/55">Loading…</p>}
      {sessions !== null && sessions.length === 0 && (
        <div className="rounded-2xl border border-black/10 bg-white p-6 text-center">
          <p className="mb-3 text-sm text-black/60">No saved sessions yet.</p>
          <a href="/build" className="text-sm underline text-black/70 hover:text-black">
            Start your first build →
          </a>
        </div>
      )}
      {sessions !== null && sessions.length > 0 && (
        <ul className="flex flex-col gap-2">
          {sessions.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-medium text-black">{s.title}</p>
                <p className="text-xs text-black/50">
                  {fmtDate(s.updatedAt)} · {s.versionCount}{" "}
                  {s.versionCount === 1 ? "version" : "versions"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openSession(s.id)}
                className="rounded-xl border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black/[0.04]"
              >
                Open
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-8">
        <a href="/build" className="text-sm underline text-black/60 hover:text-black">
          ← New build
        </a>
      </div>
    </ScreenShell>
  );
}
