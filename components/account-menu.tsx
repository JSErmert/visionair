"use client";
import { useState } from "react";

// Signed-in account control for the homepage nav. Shows the display name when
// set, otherwise the email. Clicking opens a small menu: add/change a name (which
// replaces the email everywhere) or log out. Styled to match the page's buttons.
export default function AccountMenu({
  email,
  name,
}: {
  email: string | null;
  name: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [display, setDisplay] = useState<string>(name || email || "Account");
  const [hasName, setHasName] = useState<boolean>(!!name);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function saveName() {
    const n = draft.replace(/\s+/g, " ").trim();
    if (!n) {
      setAdding(false);
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/auth/name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n }),
      });
      if (!r.ok) throw new Error("Could not save your name.");
      const d = await r.json();
      setDisplay(d.name);
      setHasName(true);
      setAdding(false);
      setOpen(false);
    } catch (e) {
      setErr(String((e as Error).message || e));
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.reload();
    } catch {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="max-w-[12rem] truncate text-sm text-foreground/60 transition hover:text-foreground/85"
        title={email ?? undefined}
      >
        {display}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-60 rounded-2xl border border-border/10 bg-card p-2 shadow-lg">
          {!adding ? (
            <>
              {email && (
                <p className="truncate px-3 pb-2 pt-1 text-xs text-foreground/40" title={email}>
                  Signed in as {email}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  setDraft(name || "");
                  setAdding(true);
                }}
                className="block w-full rounded-xl px-3 py-2 text-left text-sm text-foreground/70 transition hover:bg-foreground/[0.05] hover:text-foreground"
              >
                {hasName ? "Change name" : "Add a name"}
              </button>
              <button
                type="button"
                onClick={logout}
                disabled={busy}
                className="block w-full rounded-xl px-3 py-2 text-left text-sm text-foreground/70 transition hover:bg-foreground/[0.05] hover:text-foreground disabled:opacity-60"
              >
                Log out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 p-1">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, 80))}
                maxLength={80}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") setAdding(false);
                }}
                placeholder="Your name"
                className="rounded-xl border border-border/15 bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-border/30"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveName}
                  disabled={busy}
                  className="flex-1 rounded-xl bg-foreground px-3 py-2 text-sm font-medium text-background transition hover:bg-foreground/85 disabled:opacity-60"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="rounded-xl border border-border/10 px-3 py-2 text-sm text-foreground/65 transition hover:border-border/20 hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
              {err && <p className="text-xs text-red-600">{err}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
