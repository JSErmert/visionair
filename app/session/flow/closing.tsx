import PrimaryButton from '@/components/primary-button'
import ScreenShell from '@/components/screen-shell'

type ClosingProps = {
  onRestart?: () => void
}

export default function Closing({ onRestart }: ClosingProps) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <ScreenShell className="max-w-2xl p-10">
        <div className="mb-8">
          <p className="mb-3 text-sm tracking-wide text-black/50">
            VisionAir
          </p>

          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-black">
            You now have a path where there was once only possibility.
          </h1>

          <p className="mx-auto max-w-xl text-base leading-7 text-black/70">
            You now have a clearer understanding of what you genuinely have, who
            it can help, what it should become, and what your next real move is.
          </p>
        </div>

        <div className="mb-8">
          <p className="text-sm text-black/50">
            From fog to form. From possibility to path.
          </p>
        </div>

        {onRestart && (
          <PrimaryButton onClick={onRestart}>Begin again</PrimaryButton>
        )}
      </ScreenShell>
    </div>
  )
}
