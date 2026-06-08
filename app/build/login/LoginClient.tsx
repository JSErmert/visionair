"use client";
import { useState } from "react";
import ScreenShell from "@/components/screen-shell";
import ScreenIntro from "@/components/screen-intro";
import PrimaryButton from "@/components/primary-button";

export default function LoginClient({ next }: { next: string }) {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const r = await fetch("/api/build-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (r.ok) {
        window.location.href = next;
        return;
      }
      if (r.status === 401) setErr("Incorrect password.");
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
      <ScreenIntro
        eyebrow="Your library"
        title="Sign in"
        description="This area — your saved sessions and Enhance — is private to you."
      />
      <form onSubmit={submit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Owner password"
          autoFocus
          className="mb-3 w-full rounded-2xl border border-black/10 bg-white px-5 py-3 text-base text-black outline-none transition placeholder:text-black/35 focus:border-black/25"
        />
        {err && <p className="mb-3 text-sm text-red-600">{err}</p>}
        <div className="flex items-center justify-between gap-4">
          <a href="/build" className="text-sm underline text-black/55 hover:text-black">
            ← New build
          </a>
          <PrimaryButton disabled={busy || password.length === 0} onClick={() => {}}>
            {busy ? "Signing in…" : "Sign in"}
          </PrimaryButton>
        </div>
      </form>
    </ScreenShell>
  );
}
