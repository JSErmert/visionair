import { useMemo } from 'react'
import PrimaryButton from '@/components/primary-button'
import ScreenIntro from '@/components/screen-intro'
import ScreenShell from '@/components/screen-shell'
import SecondaryButton from '@/components/secondary-button'

type EntryPoint = 'strength' | 'problem' | 'idea' | 'direction' | 'unsure' | ''

type SeedPromptProps = {
  entryPoint: EntryPoint
  value: string
  onChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}

const promptMap: Record<Exclude<EntryPoint, ''>, string> = {
  strength:
    'What are you good at that feels real, even if you have not fully structured it yet?',
  problem:
    'What problem keeps bothering you because it clearly should be handled better?',
  idea:
    'What idea keeps returning to you, even if it still feels unformed?',
  direction:
    'What kind of direction keeps pulling your attention, even if you cannot fully define it yet?',
  unsure:
    'Tell me about a moment when you felt especially capable, useful, or frustrated by how something was handled.',
}

export default function SeedPrompt({
  entryPoint,
  value,
  onChange,
  onNext,
  onBack,
}: SeedPromptProps) {
  const prompt = useMemo(() => {
    if (!entryPoint) return 'What feels most real for you right now?'
    return promptMap[entryPoint]
  }, [entryPoint])

  const canContinue = value.trim().length > 0

  return (
    <ScreenShell>
      <ScreenIntro
        eyebrow="Discovering your path"
        title="Let’s begin with what feels real."
        description="You do not need to sound polished. A real answer is enough."
      />

      <div className="mb-5 rounded-2xl border border-black/10 bg-black/[0.02] p-5">
        <p className="text-base leading-7 text-black/85">{prompt}</p>
      </div>

      <div className="mb-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write freely. You do not need to sound polished — just be real."
          rows={10}
          className="w-full rounded-2xl border border-black/10 bg-white px-5 py-4 text-base leading-7 text-black outline-none transition placeholder:text-black/35 focus:border-black/25"
        />
      </div>

      <div className="mb-8 flex items-center justify-between gap-4">
        <p className="text-sm text-black/45">
          VisionAir will help clarify what matters most.
        </p>

        <button
          type="button"
          className="rounded-2xl border border-black/10 px-4 py-2 text-sm text-black/55 transition hover:border-black/20 hover:text-black"
        >
          Voice input
        </button>
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
