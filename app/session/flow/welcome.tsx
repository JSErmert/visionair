import PrimaryButton from '@/components/primary-button'
import ScreenShell from '@/components/screen-shell'

type WelcomeProps = {
  onNext: () => void
}

export default function Welcome({ onNext }: WelcomeProps) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <ScreenShell className="max-w-2xl p-10">
        <div className="mb-8">
          <p className="mb-3 text-sm tracking-wide text-black/50">
            VisionAir
          </p>

          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-black">
            You do not need a perfect idea to begin.
          </h1>

          <p className="mx-auto max-w-xl text-base leading-7 text-black/70">
            VisionAir helps you turn something real — a strength, a problem you
            care about, a direction, or even a vague idea — into a structured
            path you can actually build.
          </p>
        </div>

        <div className="mb-8">
          <p className="text-sm text-black/55">
            You do not need polished answers. You only need a real starting
            point.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <PrimaryButton onClick={onNext}>Begin</PrimaryButton>

          <p className="text-sm text-black/45">
            We will discover the structure together.
          </p>
        </div>
      </ScreenShell>
    </div>
  )
}
