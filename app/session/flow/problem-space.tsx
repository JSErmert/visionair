import PrimaryButton from '@/components/primary-button'
import ScreenIntro from '@/components/screen-intro'
import ScreenShell from '@/components/screen-shell'
import SecondaryButton from '@/components/secondary-button'

type ProblemSpaceValue = 'structure' | 'guidance' | 'opportunity' | ''

type ProblemSpaceProps = {
  value: ProblemSpaceValue
  onChange: (value: Exclude<ProblemSpaceValue, ''>) => void
  onNext: () => void
  onBack: () => void
}

const options: {
  value: Exclude<ProblemSpaceValue, ''>
  title: string
  body: string
}[] = [
  {
    value: 'structure',
    title: 'Helping skilled people gain structure and direction',
    body: 'You help capable people move from internal potential to usable clarity.',
  },
  {
    value: 'guidance',
    title: 'Helping overwhelmed people move toward trustworthy guidance',
    body: 'You create calm, structured progression where confusion is high.',
  },
  {
    value: 'opportunity',
    title: 'Helping nontechnical people turn value into opportunity',
    body: 'You help people make something real from what they already carry.',
  },
]

export default function ProblemSpace({
  value,
  onChange,
  onNext,
  onBack,
}: ProblemSpaceProps) {
  const canContinue = value !== ''

  return (
    <ScreenShell>
      <ScreenIntro
        eyebrow="Aligning your opportunity"
        title="Where does this capability most want to be applied?"
        description="Your capability matters most when it is aimed at the right kind of problem."
      />

      <div className="grid gap-4">
        {options.map((option) => {
          const isSelected = value === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={[
                'w-full rounded-2xl border p-5 text-left transition',
                isSelected
                  ? 'border-black bg-black text-white shadow-sm'
                  : 'border-black/10 bg-white text-black hover:border-black/25 hover:bg-black/[0.02]',
              ].join(' ')}
            >
              <div className="mb-2 text-base font-medium tracking-tight">
                {option.title}
              </div>
              <div
                className={[
                  'text-sm leading-6',
                  isSelected ? 'text-white/80' : 'text-black/65',
                ].join(' ')}
              >
                {option.body}
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        <p className="text-sm text-black/50">
          Which of these feels most meaningful, alive, and worth building in?
        </p>
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
