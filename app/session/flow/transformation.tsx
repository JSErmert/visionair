import { useMemo } from 'react'
import PrimaryButton from '@/components/primary-button'
import ScreenIntro from '@/components/screen-intro'
import ScreenShell from '@/components/screen-shell'
import SecondaryButton from '@/components/secondary-button'
import { structuralizeBefore, structuralizeAfter } from './synthesizers'

type TransformationProps = {
  beforeValue: string
  afterValue: string
  onBeforeChange: (value: string) => void
  onAfterChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}

// Structural Constraint Layer — second active application surface (v1.0.7,
// extracted to ./synthesizers.ts in v1.0.17). Synthesizers translate raw
// before/after phrasing into structured state descriptions; this screen
// renders those bullets live.

export default function Transformation({
  beforeValue,
  afterValue,
  onBeforeChange,
  onAfterChange,
  onNext,
  onBack,
}: TransformationProps) {
  const canContinue =
    beforeValue.trim().length > 0 && afterValue.trim().length > 0

  const beforeBullets = useMemo(() => structuralizeBefore(beforeValue), [beforeValue])
  const afterBullets = useMemo(() => structuralizeAfter(afterValue), [afterValue])

  const showBullets =
    beforeValue.trim().length > 0 || afterValue.trim().length > 0

  return (
    <ScreenShell className="max-w-4xl">
      <ScreenIntro
        eyebrow="Shaping your opportunity"
        title="What changes for this person because your system exists?"
        description="This is the heart of the value. We are defining the movement your system creates."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border/10 bg-card p-5">
          <p className="mb-3 text-sm font-medium text-foreground/75">Before</p>
          <textarea
            value={beforeValue}
            onChange={(e) => onBeforeChange(e.target.value)}
            rows={8}
            placeholder="What are they feeling, struggling with, or lacking before your system helps them?"
            className="w-full rounded-2xl border border-border/10 bg-card px-4 py-3 text-base leading-7 text-foreground outline-none transition placeholder:text-foreground/35 focus:border-border/25"
          />
        </div>

        <div className="rounded-2xl border border-border/10 bg-card p-5">
          <p className="mb-3 text-sm font-medium text-foreground/75">After</p>
          <textarea
            value={afterValue}
            onChange={(e) => onAfterChange(e.target.value)}
            rows={8}
            placeholder="What becomes clearer, easier, safer, or more possible after?"
            className="w-full rounded-2xl border border-border/10 bg-card px-4 py-3 text-base leading-7 text-foreground outline-none transition placeholder:text-foreground/35 focus:border-border/25"
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border/10 bg-foreground/[0.02] p-5">
        <p className="mb-3 text-sm font-medium text-foreground/75">
          Your transformation promise
        </p>

        {showBullets ? (
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/55">
                Before
              </p>
              <ul className="space-y-2">
                {beforeBullets.map((bullet, i) => (
                  <li key={i} className="text-sm leading-6 text-foreground/80">
                    • {bullet}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/55">
                After
              </p>
              <ul className="space-y-2">
                {afterBullets.map((bullet, i) => (
                  <li key={i} className="text-sm leading-6 text-foreground/80">
                    • {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-6 text-foreground/45">
            Once you start describing either side, the transformation will appear here as a structured before/after.
          </p>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>

        <PrimaryButton onClick={onNext} disabled={!canContinue}>
          Continue
        </PrimaryButton>
      </div>
    </ScreenShell>
  )
}
