import PrimaryButton from '@/components/primary-button'
import ScreenIntro from '@/components/screen-intro'
import ScreenShell from '@/components/screen-shell'
import SecondaryButton from '@/components/secondary-button'

type PathForwardProps = {
  immediate: string
  nearTerm: string
  later: string
  onImmediateChange: (value: string) => void
  onNearTermChange: (value: string) => void
  onLaterChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}

export default function PathForward({
  immediate,
  nearTerm,
  later,
  onImmediateChange,
  onNearTermChange,
  onLaterChange,
  onNext,
  onBack,
}: PathForwardProps) {
  const canContinue =
    immediate.trim().length > 0 ||
    nearTerm.trim().length > 0 ||
    later.trim().length > 0

  return (
    <ScreenShell className="max-w-4xl">
      <ScreenIntro
        eyebrow="Revealing your blueprint"
        title="What do you do next?"
        description="Clarity matters most when it becomes movement."
      />

      <div className="grid gap-6">
        <div className="rounded-2xl border border-border/10 bg-card p-5">
          <p className="mb-3 text-sm font-medium text-foreground/75">
            Immediate
          </p>
          <p className="mb-3 text-sm text-foreground/50">
            What to do in the next 24–72 hours
          </p>
          <textarea
            value={immediate}
            onChange={(e) => onImmediateChange(e.target.value)}
            rows={4}
            placeholder="Write the first immediate steps."
            className="w-full rounded-2xl border border-border/10 bg-card px-4 py-3 text-base leading-7 text-foreground outline-none transition placeholder:text-foreground/35 focus:border-border/25"
          />
        </div>

        <div className="rounded-2xl border border-border/10 bg-card p-5">
          <p className="mb-3 text-sm font-medium text-foreground/75">
            Near-term
          </p>
          <p className="mb-3 text-sm text-foreground/50">
            What to validate, shape, or test next
          </p>
          <textarea
            value={nearTerm}
            onChange={(e) => onNearTermChange(e.target.value)}
            rows={4}
            placeholder="Write the next shaping or validation steps."
            className="w-full rounded-2xl border border-border/10 bg-card px-4 py-3 text-base leading-7 text-foreground outline-none transition placeholder:text-foreground/35 focus:border-border/25"
          />
        </div>

        <div className="rounded-2xl border border-border/10 bg-card p-5">
          <p className="mb-3 text-sm font-medium text-foreground/75">Later</p>
          <p className="mb-3 text-sm text-foreground/50">
            What to deliberately postpone until the foundation is clearer
          </p>
          <textarea
            value={later}
            onChange={(e) => onLaterChange(e.target.value)}
            rows={4}
            placeholder="Write what should wait until later."
            className="w-full rounded-2xl border border-border/10 bg-card px-4 py-3 text-base leading-7 text-foreground outline-none transition placeholder:text-foreground/35 focus:border-border/25"
          />
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
