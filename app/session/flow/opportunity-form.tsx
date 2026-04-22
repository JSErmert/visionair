import PrimaryButton from '@/components/primary-button'
import ScreenIntro from '@/components/screen-intro'
import ScreenShell from '@/components/screen-shell'
import SecondaryButton from '@/components/secondary-button'

type OpportunityFormValue =
  | 'platform'
  | 'tool'
  | 'service'
  | 'hybrid'
  | 'learning'
  | ''

type OpportunityFormProps = {
  value: OpportunityFormValue
  onChange: (value: Exclude<OpportunityFormValue, ''>) => void
  onNext: () => void
  onBack: () => void
}

const options: {
  value: Exclude<OpportunityFormValue, ''>
  title: string
  body: string
}[] = [
  {
    value: 'platform',
    title: 'Guided digital platform',
    body: 'A structured environment that helps users move through guided progression.',
  },
  {
    value: 'tool',
    title: 'Interactive intelligence tool',
    body: 'A more focused tool that helps users clarify, structure, or decide.',
  },
  {
    value: 'service',
    title: 'Structured advisory or service model',
    body: 'A direct offering where your guidance creates the value more personally.',
  },
  {
    value: 'hybrid',
    title: 'Hybrid guided experience',
    body: 'A blend of system structure and direct support.',
  },
  {
    value: 'learning',
    title: 'Learning environment',
    body: 'A guided educational structure that helps users grow toward clarity and capability.',
  },
]

export default function OpportunityForm({
  value,
  onChange,
  onNext,
  onBack,
}: OpportunityFormProps) {
  const canContinue = value !== ''

  return (
    <ScreenShell>
      <ScreenIntro
        eyebrow="Shaping version one"
        title="What should this become first?"
        description="The right opportunity is not just about what sounds exciting. It is about what fits your value, your user, and what can realistically become real."
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

      <div className="mt-8 flex items-center justify-between gap-4">
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>

        <PrimaryButton onClick={onNext} disabled={!canContinue}>
          Continue
        </PrimaryButton>
      </div>
    </ScreenShell>
  )
}
