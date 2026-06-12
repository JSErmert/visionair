import Link from 'next/link'
import ScreenShell from '@/components/screen-shell'
import SettingsPanel from '@/components/theme/SettingsPanel'

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
    <main className="relative px-6 pb-16 pt-6">
      {/* In-flow header: scrolls with the page (not a fixed overlay). The App
          Settings control lives here on the homepage only — it tunes the
          VisionAir interface, so it doesn't belong on the build screens. */}
      <header className="mx-auto mb-8 flex max-w-2xl items-center justify-between sm:mb-12">
        <span className="text-sm font-medium tracking-wide text-foreground/60">VisionAir</span>
        <div className="flex items-center gap-4">
          <SettingsPanel />
          <Link
            href="/build/login"
            className="text-sm text-foreground/45 transition hover:text-foreground/70"
          >
            Log in
          </Link>
        </div>
      </header>

      <ScreenShell className="max-w-2xl p-6 text-center sm:p-10">
        <p className="mb-3 text-sm tracking-wide text-foreground/50">VisionAir · Build Mode</p>

        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:mb-5 sm:text-4xl">
          Your AI agent starts every project blind.
        </h1>

        <p className="mx-auto mb-7 max-w-xl text-[15px] leading-7 text-foreground/70 sm:mb-8 sm:text-base">
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
