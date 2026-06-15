import Link from 'next/link'
import ScreenShell from '@/components/screen-shell'
import SettingsPanel from '@/components/theme/SettingsPanel'
import AccountMenu from '@/components/account-menu'
import { getOwnerIdServer } from '@/lib/build-mode/server-auth'
import { getSql } from '@/lib/build-mode/db/client'
import { getOwnerById } from '@/lib/build-mode/db/owners'
import { listSessions } from '@/lib/build-mode/db/sessions'

// Home / front door. Session-aware: when signed in, the nav shows the account
// (email or chosen name) with an inline menu, the "no account needed" caption is
// dropped, and the saved library is listed below the Build Mode block. The read
// is fail-open — any cookie/DB error renders the logged-out view rather than
// erroring. Login stays OPTIONAL (Build Mode generates a pack without an account;
// logging in only unlocks the saved library).

function fmtDate(s: string): string {
  try {
    return new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return s
  }
}

export default async function Home() {
  let account: { email: string | null; name: string | null } | null = null
  let history: { id: number; title: string; updatedAt: string }[] = []
  try {
    const ownerId = await getOwnerIdServer()
    if (ownerId !== null) {
      const sql = getSql()
      const [owner, sessions] = await Promise.all([getOwnerById(sql, ownerId), listSessions(sql, ownerId)])
      if (owner) account = { email: owner.email, name: owner.name }
      history = sessions.map((s) => ({ id: s.id, title: s.title, updatedAt: s.updatedAt }))
    }
  } catch {
    account = null
    history = []
  }
  const signedIn = account !== null

  return (
    <main className="relative px-6 pb-10 pt-4">
      <header className="mx-auto mb-5 flex max-w-2xl items-center justify-between sm:mb-7">
        <span className="text-sm font-medium tracking-wide text-foreground/60">VisionAir</span>
        <div className="flex items-center gap-4">
          <SettingsPanel />
          {signedIn ? (
            <AccountMenu email={account!.email} name={account!.name} />
          ) : (
            <Link
              href="/build/login"
              className="text-sm text-foreground/45 transition hover:text-foreground/70"
            >
              Log in
            </Link>
          )}
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

          {!signedIn && (
            <p className="text-sm text-foreground/45">
              No account needed to try it. Log in to save your library.
            </p>
          )}
        </div>
      </ScreenShell>

      {signedIn && (
        <section className="mx-auto mt-5 max-w-2xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-foreground/40">Your library</p>
            {history.length > 0 && (
              <Link href="/build/library" className="text-sm text-foreground/55 underline hover:text-foreground">
                Open library →
              </Link>
            )}
          </div>
          {history.length === 0 ? (
            <p className="rounded-2xl border border-border/10 bg-card px-5 py-4 text-sm text-foreground/50">
              No saved builds yet — finish a build to save it here.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {history.map((s) => (
                <li key={s.id}>
                  <Link
                    href="/build/library"
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border/10 bg-card px-5 py-4 transition hover:border-border/20"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{s.title}</span>
                    <span className="shrink-0 text-xs text-foreground/45">{fmtDate(s.updatedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  )
}
