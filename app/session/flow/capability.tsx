import { useMemo, useState } from 'react'
import PrimaryButton from '@/components/primary-button'
import ScreenIntro from '@/components/screen-intro'
import ScreenShell from '@/components/screen-shell'
import SecondaryButton from '@/components/secondary-button'

type CapabilityProps = {
  value: string[]
  onChange: (value: string[]) => void
  onNext: () => void
  onBack: () => void
}

const questions = [
  'When have you felt most capable, effective, or useful in real life?',
  'What kinds of problems do people already come to you for help with?',
  'What feels natural to you that seems difficult for many people around you?',
  'What kind of value do you repeatedly create, even if you have never fully named it?',
  'What kind of work or thinking feels energizing rather than draining to you?',
]

export default function Capability({
  value,
  onChange,
  onNext,
  onBack,
}: CapabilityProps) {
  const [questionIndex, setQuestionIndex] = useState(0)
  const currentQuestion = questions[questionIndex]
  const currentAnswer = value[questionIndex] ?? ''

  const progressLabel = useMemo(
    () => `Question ${questionIndex + 1} of ${questions.length}`,
    [questionIndex]
  )

  const updateAnswer = (text: string) => {
    const nextAnswers = [...value]
    nextAnswers[questionIndex] = text
    onChange(nextAnswers)
  }

  const goNextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((prev) => prev + 1)
      return
    }

    onNext()
  }

  const goPreviousQuestion = () => {
    if (questionIndex > 0) {
      setQuestionIndex((prev) => prev - 1)
      return
    }

    onBack()
  }

  const canContinue = currentAnswer.trim().length > 0

  return (
    <ScreenShell>
      <ScreenIntro
        eyebrow="Clarifying your capability"
        title="Let's make your capability more visible."
        description="You do not need a title first. We are looking for the real pattern in how you create value."
      />

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="text-sm text-foreground/50">{progressLabel}</p>
          <p className="text-sm text-foreground/40">Building your capability pattern…</p>
        </div>

        <div className="h-2 w-full rounded-full bg-foreground/6">
          <div
            className="h-2 rounded-full bg-foreground transition-all"
            style={{
              width: `${((questionIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-border/10 bg-foreground/[0.02] p-5">
        <p className="text-base leading-7 text-foreground/85">{currentQuestion}</p>
      </div>

      <div className="mb-8">
        <textarea
          value={currentAnswer}
          onChange={(e) => updateAnswer(e.target.value)}
          rows={8}
          placeholder="Write in a real, grounded way. You do not need to sound impressive."
          className="w-full rounded-2xl border border-border/10 bg-card px-5 py-4 text-base leading-7 text-foreground outline-none transition placeholder:text-foreground/35 focus:border-border/25"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <SecondaryButton onClick={goPreviousQuestion}>Back</SecondaryButton>

        <PrimaryButton onClick={goNextQuestion} disabled={!canContinue}>
          {questionIndex < questions.length - 1 ? 'Continue' : 'Finish section'}
        </PrimaryButton>
      </div>
    </ScreenShell>
  )
}
