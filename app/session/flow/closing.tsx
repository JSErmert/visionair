'use client'

import { useRouter } from 'next/navigation'
import PrimaryButton from '@/components/primary-button'
import SecondaryButton from '@/components/secondary-button'
import ScreenShell from '@/components/screen-shell'
import type { SessionState, BlueprintSynthesis } from '../page'
import { downloadBlueprint } from './export-markdown'
import { SEED_KEY } from '@/lib/build-mode/seed'
import { sessionToBuildSeed } from '../build-handoff'

type ClosingProps = {
  onRestart?: () => void
  state?: SessionState
  label?: string
  savedAt?: number
  // v1.2.0 — Opus 4.7 distilled synthesis carried forward from the Blueprint
  // screen so the Markdown download can include it. Optional / null on
  // graceful fallback.
  synthesis?: BlueprintSynthesis | null
}

export default function Closing({ onRestart, state, label, savedAt, synthesis }: ClosingProps) {
  const router = useRouter()
  const canDownload = !!state

  const handleDownload = () => {
    if (!state) return
    downloadBlueprint({ state, label, savedAt, synthesis: synthesis ?? null })
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <ScreenShell className="max-w-2xl p-10">
        <div className="mb-8">
          <p className="mb-3 text-sm tracking-wide text-black/50">
            VisionAir
          </p>

          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-black">
            You now have a path where there was once only possibility.
          </h1>

          <p className="mx-auto max-w-xl text-base leading-7 text-black/70">
            You now have a clearer understanding of what you genuinely have, who
            it can help, what it should become, and what your next real move is.
          </p>
        </div>

        <div className="mb-8">
          <p className="text-sm text-black/50">
            From fog to form. From possibility to path.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          {canDownload && (
            <PrimaryButton onClick={handleDownload}>
              Download your blueprint
            </PrimaryButton>
          )}
          {canDownload && (
            <SecondaryButton
              onClick={() => {
                const seed = sessionToBuildSeed(state!, synthesis ?? null)
                sessionStorage.setItem(SEED_KEY, JSON.stringify(seed))
                router.push('/build')
              }}
            >
              Turn this into a Claude Code build pack →
            </SecondaryButton>
          )}
          {onRestart && (
            <SecondaryButton onClick={onRestart}>Begin again</SecondaryButton>
          )}
        </div>

        {canDownload && (
          <p className="mt-6 text-xs text-black/45">
            Saves as a Markdown file you can keep, share, or feed into your
            next tool.
          </p>
        )}
      </ScreenShell>
    </div>
  )
}
