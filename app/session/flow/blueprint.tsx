import PrimaryButton from '@/components/primary-button'
import ScreenIntro from '@/components/screen-intro'
import ScreenShell from '@/components/screen-shell'
import SecondaryButton from '@/components/secondary-button'

type BlueprintData = {
  capability: string
  problemSpace: string
  idealUser: string
  transformation: string
  opportunityForm: string
  versionOne: string
  pathForward: {
    immediate: string
    nearTerm: string
    later: string
  }
}

type BlueprintProps = {
  data: BlueprintData
  onNext: () => void
  onBack: () => void
}

function SectionCard({
  title,
  content,
}: {
  title: string
  content: string
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <p className="mb-2 text-sm font-medium tracking-wide text-black/55">
        {title}
      </p>
      <p className="text-base leading-7 text-black/80">
        {content.trim() || 'Still taking shape.'}
      </p>
    </div>
  )
}

export default function Blueprint({
  data,
  onNext,
  onBack,
}: BlueprintProps) {
  const hasPathForward =
    data.pathForward.immediate.trim() ||
    data.pathForward.nearTerm.trim() ||
    data.pathForward.later.trim()

  return (
    <ScreenShell className="max-w-5xl">
      <ScreenIntro
        eyebrow="Revealing your blueprint"
        title="Your Structured Opportunity Blueprint"
        description="This blueprint was built from the truth you already carry. VisionAir helped give it shape."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard
          title="1. Core Capability"
          content={data.capability}
        />
        <SectionCard
          title="2. Aligned Problem Space"
          content={data.problemSpace}
        />
        <SectionCard
          title="3. Ideal User"
          content={data.idealUser}
        />
        <SectionCard
          title="4. Transformation Promise"
          content={data.transformation}
        />
        <SectionCard
          title="5. Opportunity Form"
          content={data.opportunityForm}
        />
        <SectionCard
          title="6. First Buildable Version"
          content={data.versionOne}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-black/10 bg-black/[0.02] p-5">
        <p className="mb-3 text-sm font-medium tracking-wide text-black/55">
          7. Guided Path Forward
        </p>

        {hasPathForward ? (
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="mb-2 text-sm font-medium text-black/70">
                Immediate
              </p>
              <p className="text-sm leading-6 text-black/75">
                {data.pathForward.immediate.trim() || 'Still taking shape.'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-black/70">
                Near-term
              </p>
              <p className="text-sm leading-6 text-black/75">
                {data.pathForward.nearTerm.trim() || 'Still taking shape.'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-black/70">
                Later
              </p>
              <p className="text-sm leading-6 text-black/75">
                {data.pathForward.later.trim() || 'Still taking shape.'}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-6 text-black/45">
            Your next path forward will appear here once it has been defined.
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-black/10 pt-6 md:flex-row md:items-center">
        <p className="max-w-2xl text-sm leading-6 text-black/55">
          This is not the end of the process. It is the first time your path
          has become clearly visible.
        </p>

        <div className="flex items-center gap-3">
          <SecondaryButton onClick={onBack}>Back</SecondaryButton>
          <PrimaryButton onClick={onNext}>Continue</PrimaryButton>
        </div>
      </div>
    </ScreenShell>
  )
}
