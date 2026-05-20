import { useMemo } from 'react'
import PrimaryButton from '@/components/primary-button'
import ScreenIntro from '@/components/screen-intro'
import ScreenShell from '@/components/screen-shell'
import SecondaryButton from '@/components/secondary-button'
import { synthesizeVersionOne } from './synthesizers'

type VersionOneProps = {
  value: string
  onChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}

export default function VersionOne({
  value,
  onChange,
  onNext,
  onBack,
}: VersionOneProps) {
  const canContinue = value.trim().length > 0
  const bullets = useMemo(() => synthesizeVersionOne(value), [value])

  return (
    <ScreenShell>
      <ScreenIntro
        eyebrow="Shaping version one"
        title="What is the smallest real version of this?"
        description="We are not trying to build everything. We are identifying the simplest meaningful version that creates real value."
      />

      <div className="mb-5 rounded-2xl border border-black/10 bg-black/[0.02] p-5">
        <ul className="space-y-2 text-sm leading-6 text-black/65">
          <li>• What absolutely needs to be included first?</li>
          <li>• What can wait until later?</li>
          <li>• What would prove this matters?</li>
          <li>• What would make version one feel real, but not overcomplicated?</li>
        </ul>
      </div>

      <div className="mb-6">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={10}
          placeholder="Describe the smallest meaningful first version in a grounded way."
          className="w-full rounded-2xl border border-black/10 bg-white px-5 py-4 text-base leading-7 text-black outline-none transition placeholder:text-black/35 focus:border-black/25"
        />
      </div>

      <div className="mb-8 rounded-2xl border border-black/10 bg-black/[0.02] p-5">
        <p className="mb-2 text-sm font-medium text-black/75">
          Your first buildable version
        </p>

        {canContinue ? (
          <ul className="space-y-2">
            {bullets.map((bullet, i) => (
              <li key={i} className="text-base leading-7 text-black/80">
                • {bullet}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-6 text-black/45">
            A grounded version-one statement will begin to take shape here.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>

        <PrimaryButton onClick={onNext} disabled={!canContinue}>
          Continue
        </PrimaryButton>
      </div>
    </ScreenShell>
  )
}
