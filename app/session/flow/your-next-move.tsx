import PrimaryButton from '@/components/primary-button'
import ScreenIntro from '@/components/screen-intro'
import ScreenShell from '@/components/screen-shell'
import SecondaryButton from '@/components/secondary-button'
import type { StrategyCompression } from './strategy-compression'

type YourNextMoveProps = {
  data: StrategyCompression
  onNext: () => void
  onBack: () => void
}

export default function YourNextMove({ data, onNext, onBack }: YourNextMoveProps) {
  return (
    <ScreenShell className="max-w-3xl">
      <ScreenIntro
        eyebrow="A decision has been made"
        title="Your Next Move"
        description="The blueprint is the truth you already carry. This is what to do with it."
      />

      <div className="space-y-5">
        <section className="rounded-2xl border border-black/15 bg-white p-6">
          <p className="mb-2 text-sm font-medium tracking-wide text-black/55">
            Core Direction
          </p>
          <p className="text-xl leading-8 text-black">
            {data.coreDirection}
          </p>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5">
          <p className="mb-2 text-sm font-medium tracking-wide text-black/55">
            What to build first
          </p>
          <p className="text-base leading-7 text-black/85">
            {data.whatToBuildFirst}
          </p>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5">
          <p className="mb-2 text-sm font-medium tracking-wide text-black/55">
            What this proves
          </p>
          <p className="text-base leading-7 text-black/85">
            {data.whatThisProves}
          </p>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5">
          <p className="mb-3 text-sm font-medium tracking-wide text-black/55">
            Immediate action — next 24–72 hours
          </p>
          {data.immediateAction.length > 0 ? (
            <ol className="space-y-2 text-base leading-7 text-black/85">
              {data.immediateAction.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="select-none text-black/40">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-base leading-7 text-black/70">
              Still taking shape.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-black/15 bg-black/[0.04] p-5">
          <p className="mb-2 text-sm font-medium tracking-wide text-black/55">
            Constraint
          </p>
          <p className="text-base leading-7 text-black">
            {data.constraint}
          </p>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5">
          <p className="mb-2 text-sm font-medium tracking-wide text-black/55">
            Why this works
          </p>
          <p className="text-base leading-7 text-black/85">
            {data.whyThisWorks}
          </p>
        </section>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <PrimaryButton onClick={onNext}>Finish</PrimaryButton>
      </div>
    </ScreenShell>
  )
}
