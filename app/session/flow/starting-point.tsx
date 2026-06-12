import PrimaryButton from '@/components/primary-button'
import ScreenIntro from '@/components/screen-intro'
import ScreenShell from '@/components/screen-shell'
import SecondaryButton from '@/components/secondary-button'

type StartingPointValue =
  | 'strength'
  | 'problem'
  | 'idea'
  | 'direction'
  | 'unsure'
  | ''

type StartingPointProps = {
  value: StartingPointValue
  onSelect: (value: Exclude<StartingPointValue, ''>) => void
  onNext: () => void
  onBack: () => void
}

const options: {
  value: Exclude<StartingPointValue, ''>
  title: string
  body: string
}[] = [
  {
    value: 'strength',
    title: "Something I’m good at",
    body: 'I know I have real capability, but I have not fully structured it yet.',
  },
  {
    value: 'problem',
    title: 'A problem I care about',
    body: 'There is something in the world that clearly should be handled better.',
  },
  {
    value: 'idea',
    title: "An idea I can't stop thinking about",
    body: 'Something keeps returning to me, even if it is still unformed.',
  },
  {
    value: 'direction',
    title: 'A direction I want to explore',
    body: 'I feel pulled somewhere, but I need help shaping it.',
  },
  {
    value: 'unsure',
    title: "I'm not sure yet — help me find it",
    body: 'I know there is something here, but I cannot clearly name it yet.',
  },
]

export default function StartingPoint({
  value,
  onSelect,
  onNext,
  onBack,
}: StartingPointProps) {
  const canContinue = value !== ''

  return (
    <ScreenShell>
      <ScreenIntro
        eyebrow="Discovering your path"
        title="What feels most real for you right now?"
        description="You can begin from wherever the signal is strongest. Choose the starting point that feels most honest."
      />

      <div className="grid gap-2.5">
        {options.map((option) => {
          const isSelected = value === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={[
                'w-full rounded-2xl border p-4 text-left transition',
                isSelected
                  ? 'border-foreground bg-foreground text-background shadow-sm'
                  : 'border-border/10 bg-card text-foreground hover:border-border/25 hover:bg-foreground/[0.02]',
              ].join(' ')}
            >
              <div className="mb-0.5 text-[15px] font-medium tracking-tight">
                {option.title}
              </div>
              <div
                className={[
                  'text-[13px] leading-5',
                  isSelected ? 'text-background/65' : 'text-foreground/65',
                ].join(' ')}
              >
                {option.body}
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>

        <div className="flex flex-col items-end gap-3">
          <p className="text-sm text-foreground/45">There is no wrong place to begin.</p>
          <PrimaryButton onClick={onNext} disabled={!canContinue}>
            Continue
          </PrimaryButton>
        </div>
      </div>
    </ScreenShell>
  )
}
