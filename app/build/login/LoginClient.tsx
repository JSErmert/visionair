"use client";
import { useState } from "react";
import ScreenShell from "@/components/screen-shell";
import ScreenIntro from "@/components/screen-intro";
import PrimaryButton from "@/components/primary-button";

type Mode = "signin" | "signup";

// v3 multi-tenant: email + password login/signup. Build Mode still generates a
// pack with no account; logging in only unlocks the saved library per user.
export default function LoginClient({ next }: { next: string }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    if (!email || !password) {
      setErr("Enter your email and password.");
      return;
    }
    if (isSignup && password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch(isSignup ? "/api/auth/signup" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (r.ok) {
        window.location.href = next;
        return;
      }
      const j = (await r.json().catch(() => ({}))) as { error?: string };
      setErr(j.error || "Something went wrong. Try again.");
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
        title={isSignup ? "Create your account" : "Sign in"}
        description="Build Mode generates a pack without an account — sign in only to save your library across sessions."
      />
      <form onSubmit={submit}>
        <label htmlFor="bm-email" className="mb-1 block text-sm font-medium text-black/70">
          Email
        </label>
        <input
          id="bm-email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          autoFocus
          className="mb-3 w-full rounded-2xl border border-black/10 bg-white px-5 py-3 text-base text-black outline-none transition placeholder:text-black/35 focus:border-black/25"
        />
        <label htmlFor="bm-password" className="mb-1 block text-sm font-medium text-black/70">
          Password
        </label>
        <div className="mb-3 flex items-stretch gap-2">
          <input
            id="bm-password"
            type={show ? "text" : "password"}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isSignup ? "At least 8 characters" : "Your password"}
            autoComplete={isSignup ? "new-password" : "current-password"}
            className="w-full rounded-2xl border border-black/10 bg-white px-5 py-3 text-base text-black outline-none transition placeholder:text-black/35 focus:border-black/25"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="shrink-0 rounded-2xl border border-black/10 bg-white px-4 text-sm text-black/55 transition hover:bg-black/[0.04]"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
        {err && <p className="mb-3 text-sm text-red-600">{err}</p>}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              setMode(isSignup ? "signin" : "signup");
              setErr("");
            }}
            className="text-sm text-black/55 underline transition hover:text-black"
          >
            {isSignup ? "Have an account? Sign in" : "New here? Create an account"}
          </button>
          <PrimaryButton disabled={busy}>
            {busy ? "…" : isSignup ? "Create account" : "Sign in"}
          </PrimaryButton>
        </div>
      </form>
    </ScreenShell>
  );
}
