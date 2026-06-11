import { useMemo } from 'react'
import PrimaryButton from '@/components/primary-button'
import ScreenIntro from '@/components/screen-intro'
import ScreenShell from '@/components/screen-shell'
import SecondaryButton from '@/components/secondary-button'
import { synthesizeIdealUser } from './synthesizers'

type IdealUserProps = {
  value: string
  onChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}

export default function IdealUser({
  value,
  onChange,
  onNext,
  onBack,
}: IdealUserProps) {
  const canContinue = value.trim().length > 0
  const bullets = useMemo(() => synthesizeIdealUser(value), [value])

  return (
    <ScreenShell className="max-w-4xl">
      <ScreenIntro
        eyebrow="Aligning your opportunity"
        title="Who most needs this first?"
        description="We are not looking for everyone. We are looking for the first human being this should help clearly."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="mb-4 rounded-2xl border border-border/10 bg-foreground/[0.02] p-5">
            <p className="mb-3 text-sm font-medium text-foreground/75">
              Questions to think through
            </p>
            <ul className="space-y-2 text-sm leading-6 text-foreground/65">
              <li>• Who is most affected by this problem?</li>
              <li>• Who feels capable, but blocked?</li>
              <li>• What are they trying to do or become?</li>
              <li>• What are they missing right now?</li>
              <li>• Why do you understand them especially well?</li>
            </ul>
          </div>

          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={10}
            placeholder="Describe the first person this should help in a grounded, human way."
            className="w-full rounded-2xl border border-border/10 bg-card px-5 py-4 text-base leading-7 text-foreground outline-none transition placeholder:text-foreground/35 focus:border-border/25"
          />
        </div>

        <div>
          <div className="h-full rounded-2xl border border-border/10 bg-foreground/[0.02] p-5">
            <p className="mb-3 text-sm font-medium text-foreground/75">
              Your first ideal user
            </p>

            {canContinue ? (
              <ul className="space-y-2">
                {bullets.map((bullet, i) => (
                  <li key={i} className="text-base leading-7 text-foreground/80">
                    • {bullet}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-6 text-foreground/45">
                A live draft of the person you are building for will begin to
                take shape here.
              </p>
            )}
          </div>
        </div>
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
