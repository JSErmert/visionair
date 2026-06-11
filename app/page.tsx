import Link from 'next/link'
import ScreenShell from '@/components/screen-shell'

// Home / front door. v2 = Build Mode only (the /session guided flow stays in the
// repo but is unlinked; the persona delineation that brings it back arrives in
// v3). Static server component with real anchor links — renders and navigates
// with zero client JS (fail-open). Content sits inside the ScreenShell card (the
// boxed layout app/session uses), Build-Mode-only.
//
// Login is OPTIONAL: Build Mode generates a pack without an account; logging in
// only unlocks the saved library (/api/sessions is the only owner-gated path).

export default function Home() {
  return (
    <main className="relative px-6 py-16">
      <div className="absolute right-28 top-5">
        <Link
          href="/build/login"
          className="text-sm text-foreground/45 transition hover:text-foreground/70"
        >
          Log in
        </Link>
      </div>

      <ScreenShell className="max-w-2xl p-10 text-center">
        <p className="mb-3 text-sm tracking-wide text-foreground/50">VisionAir · Build Mode</p>

        <h1 className="mb-5 text-4xl font-semibold tracking-tight text-foreground">
          Your AI agent starts every project blind.
        </h1>

        <p className="mx-auto mb-8 max-w-xl text-base leading-7 text-foreground/70">
          VisionAir interviews you about what&apos;s missing, then hands it a real blueprint —
          not a blank prompt. Ready-to-build context packs for Claude Code and other AI coding agents.
        </p>

        <div className="flex flex-col items-center gap-4">
          <Link
            href="/build"
            className="inline-flex rounded-2xl border border-foreground bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90"
          >
            Open Build Mode →
          </Link>

          <p className="text-sm text-foreground/45">
            No account needed to try it. Log in to save your library.
          </p>
        </div>
      </ScreenShell>
    </main>
  )
}
