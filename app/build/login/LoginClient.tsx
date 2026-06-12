"use client";
import { useState } from "react";
import Link from "next/link";
import ScreenShell from "@/components/screen-shell";
import ScreenIntro from "@/components/screen-intro";
import PrimaryButton from "@/components/primary-button";

export default function LoginClient({ next }: { next: string }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Controlled value is the source of truth; FormData is a fallback in case a
    // password manager fills the field without firing onChange.
    const pw =
      password || String(new FormData(e.currentTarget).get("bm-owner-pass") || "");
    if (!pw) {
      setErr("Enter your Build Mode owner password.");
      return;
    }
    setErr("");
    setBusy(true);
    try {
      const r = await fetch("/api/build-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (r.ok) {
        window.location.href = next;
        return;
      }
      if (r.status === 401)
        setErr("Incorrect password. Use your Build Mode owner password (not the database password).");
      else if (r.status === 503) setErr("Auth is not configured on the server.");
      else setErr("Could not sign in. Try again.");
    } catch {
      setErr("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScreenShell>
      {/* Escape hatch: the page is optional (Build Mode works without an account),
          so always give the user a way out instead of trapping them here. */}
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-foreground/55 transition hover:text-foreground"
      >
        <span aria-hidden="true">←</span> Back
      </Link>
      <ScreenIntro
        eyebrow="Your library"
        title="Sign in"
        description="This area — your saved sessions and Enhance — is private to you. Sign in with your Build Mode owner password (the one you set when deploying, not your database password)."
      />
      <form onSubmit={submit}>
        <div className="mb-3 flex items-stretch gap-2">
          <input
            // Non-standard name + autoComplete off so the browser does not
            // autofill a saved credential and lock the field with dots.
            type={show ? "text" : "password"}
            name="bm-owner-pass"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Owner password"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full rounded-2xl border border-border/10 bg-card px-5 py-3 text-base text-foreground outline-none transition placeholder:text-foreground/35 focus:border-border/25"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="shrink-0 rounded-2xl border border-border/10 bg-card px-4 text-sm text-foreground/55 transition hover:bg-foreground/[0.04]"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
        {err && <p className="mb-3 text-sm text-red-600">{err}</p>}
        <div className="flex items-center justify-between gap-4">
          <a href="/build" className="text-sm underline text-foreground/55 hover:text-foreground">
            ← New build
          </a>
          <PrimaryButton disabled={busy}>{busy ? "Signing in…" : "Sign in"}</PrimaryButton>
        </div>
      </form>
    </ScreenShell>
  );
}
