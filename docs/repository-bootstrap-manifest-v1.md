# AirFlow Repository Bootstrap Manifest v1

## Purpose
This manifest is a structured batch file injection payload for Claude Code.

Its purpose is to let Claude:
- see the initial VisionAir Phase 1 app scaffold clearly
- create the files in the correct repo locations
- preserve order, structure, and consistency
- avoid guessing or inventing missing code

This is a repository bootstrap manifest, not a design discussion.

## Instruction to Claude
Create the following files exactly at the specified paths.
Use the provided contents as the initial implementation state.
Do not rename files.
Do not add extra abstractions.
Do not create extra folders.
Do not “improve” architecture unless explicitly requested.
Preserve the current VisionAir doctrine, sacred experience order, and minimal scaffold philosophy.

---

## FILE: app/layout.tsx

```tsx
import './globals.css'
import type { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'VisionAir',
  description:
    'A guided intelligence environment that helps capable but unclear people turn what they already carry into a structured, trustworthy path they can begin building.',
}

type RootLayoutProps = {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
FILE: app/globals.css
:root {
  --background: #faf9f6;
  --foreground: #111111;
  --muted: rgba(17, 17, 17, 0.7);
  --soft-muted: rgba(17, 17, 17, 0.5);
  --border: rgba(17, 17, 17, 0.1);
  --card: rgba(255, 255, 255, 0.8);
}

* {
  box-sizing: border-box;
}

html {
  font-size: 16px;
}

html,
body {
  margin: 0;
  padding: 0;
  min-height: 100%;
  background: var(--background);
  color: var(--foreground);
  font-family:
    Arial,
    Helvetica,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  line-height: 1.5;
}

button,
input,
textarea,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

textarea {
  resize: vertical;
}

a {
  color: inherit;
  text-decoration: none;
}

::selection {
  background: rgba(17, 17, 17, 0.12);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
FILE: components/screen-shell.tsx
import { ReactNode } from 'react'

type ScreenShellProps = {
  children: ReactNode
  className?: string
}

export default function ScreenShell({
  children,
  className = '',
}: ScreenShellProps) {
  return (
    <div className="flex min-h-[70vh] flex-col justify-center">
      <div
        className={[
          'mx-auto w-full max-w-3xl rounded-3xl border border-black/10 bg-white/80 p-8 shadow-sm',
          className,
        ].join(' ')}
      >
        {children}
      </div>
    </div>
  )
}
FILE: components/screen-intro.tsx
type ScreenIntroProps = {
  eyebrow?: string
  title: string
  description?: string
}

export default function ScreenIntro({
  eyebrow,
  title,
  description,
}: ScreenIntroProps) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <p className="mb-3 text-sm tracking-wide text-black/50">
          {eyebrow}
        </p>
      )}

      <h1 className="mb-4 text-3xl font-semibold tracking-tight text-black">
        {title}
      </h1>

      {description && (
        <p className="max-w-2xl text-base leading-7 text-black/70">
          {description}
        </p>
      )}
    </div>
  )
}
FILE: components/primary-button.tsx
import { ReactNode } from 'react'

type PrimaryButtonProps = {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
}

export default function PrimaryButton({
  children,
  onClick,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'rounded-2xl px-5 py-3 text-sm font-medium transition',
        disabled
          ? 'cursor-not-allowed border border-black/10 bg-black/5 text-black/30'
          : 'border border-black bg-black text-white hover:opacity-90',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
FILE: components/secondary-button.tsx
import { ReactNode } from 'react'

type SecondaryButtonProps = {
  children: ReactNode
  onClick?: () => void
}

export default function SecondaryButton({
  children,
  onClick,
}: SecondaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-black/10 px-4 py-2 text-sm text-black/65 transition hover:border-black/20 hover:text-black"
    >
      {children}
    </button>
  )
}
FILE: app/session/page.tsx
'use client'

import { useState } from 'react'

// Flow Screens
import Welcome from './flow/welcome'
import StartingPoint from './flow/starting-point'
import SeedPrompt from './flow/seed-prompt'
import Reflection from './flow/reflection'
import Capability from './flow/capability'
import ProblemSpace from './flow/problem-space'
import IdealUser from './flow/ideal-user'
import Transformation from './flow/transformation'
import OpportunityForm from './flow/opportunity-form'
import VersionOne from './flow/version-one'
import Blueprint from './flow/blueprint'
import PathForward from './flow/path-forward'
import Closing from './flow/closing'

// Step order
const steps = [
  'welcome',
  'starting-point',
  'seed-prompt',
  'reflection',
  'capability',
  'problem-space',
  'ideal-user',
  'transformation',
  'opportunity-form',
  'version-one',
  'path-forward',
  'blueprint',
  'closing',
] as const

type Step = (typeof steps)[number]

type EntryPoint = 'strength' | 'problem' | 'idea' | 'direction' | 'unsure' | ''
type ProblemSpaceValue = 'structure' | 'guidance' | 'opportunity' | ''
type OpportunityFormValue = 'platform' | 'tool' | 'service' | 'hybrid' | 'learning' | ''

type SessionState = {
  entryPoint: EntryPoint
  seedInput: string
  reflection: string
  capability: string[]
  problemSpace: ProblemSpaceValue
  idealUser: string
  transformationBefore: string
  transformationAfter: string
  opportunityForm: OpportunityFormValue
  versionOne: string
  pathForward: {
    immediate: string
    nearTerm: string
    later: string
  }
}

const initialState: SessionState = {
  entryPoint: '',
  seedInput: '',
  reflection: '',
  capability: [],
  problemSpace: '',
  idealUser: '',
  transformationBefore: '',
  transformationAfter: '',
  opportunityForm: '',
  versionOne: '',
  pathForward: {
    immediate: '',
    nearTerm: '',
    later: '',
  },
}

function formatCapability(capability: string[]) {
  return capability.filter(Boolean).join(' ')
}

function formatProblemSpace(problemSpace: ProblemSpaceValue) {
  switch (problemSpace) {
    case 'structure':
      return 'Helping skilled people gain structure and direction.'
    case 'guidance':
      return 'Helping overwhelmed people move toward trustworthy guidance.'
    case 'opportunity':
      return 'Helping nontechnical people turn value into opportunity.'
    default:
      return ''
  }
}

function formatOpportunityForm(opportunityForm: OpportunityFormValue) {
  switch (opportunityForm) {
    case 'platform':
      return 'Guided digital platform'
    case 'tool':
      return 'Interactive intelligence tool'
    case 'service':
      return 'Structured advisory or service model'
    case 'hybrid':
      return 'Hybrid guided experience'
    case 'learning':
      return 'Learning environment'
    default:
      return ''
  }
}

function formatTransformation(before: string, after: string) {
  if (!before.trim() && !after.trim()) return ''
  if (!before.trim()) return after
  if (!after.trim()) return before

  return `This system helps someone move from ${before.trim()} toward ${after.trim()}.`
}

export default function SessionPage() {
  const [stepIndex, setStepIndex] = useState(0)
  const [state, setState] = useState<SessionState>(initialState)

  const currentStep: Step = steps[stepIndex]

  const next = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1)
    }
  }

  const back = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1)
    }
  }

  const restart = () => {
    setState(initialState)
    setStepIndex(0)
  }

  const updateState = (updates: Partial<SessionState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }

  const updatePathForward = (
    field: keyof SessionState['pathForward'],
    value: string
  ) => {
    setState((prev) => ({
      ...prev,
      pathForward: {
        ...prev.pathForward,
        [field]: value,
      },
    }))
  }

  const blueprintData = {
    capability: formatCapability(state.capability),
    problemSpace: formatProblemSpace(state.problemSpace),
    idealUser: state.idealUser,
    transformation: formatTransformation(
      state.transformationBefore,
      state.transformationAfter
    ),
    opportunityForm: formatOpportunityForm(state.opportunityForm),
    versionOne: state.versionOne,
    pathForward: state.pathForward,
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <Welcome onNext={next} />

      case 'starting-point':
        return (
          <StartingPoint
            value={state.entryPoint}
            onSelect={(value) => updateState({ entryPoint: value })}
            onNext={next}
            onBack={back}
          />
        )

      case 'seed-prompt':
        return (
          <SeedPrompt
            entryPoint={state.entryPoint}
            value={state.seedInput}
            onChange={(value) => updateState({ seedInput: value })}
            onNext={next}
            onBack={back}
          />
        )

      case 'reflection':
        return (
          <Reflection
            seedInput={state.seedInput}
            onConfirm={(value) => updateState({ reflection: value })}
            onNext={next}
            onBack={back}
          />
        )

      case 'capability':
        return (
          <Capability
            value={state.capability}
            onChange={(value) => updateState({ capability: value })}
            onNext={next}
            onBack={back}
          />
        )

      case 'problem-space':
        return (
          <ProblemSpace
            value={state.problemSpace}
            onChange={(value) => updateState({ problemSpace: value })}
            onNext={next}
            onBack={back}
          />
        )

      case 'ideal-user':
        return (
          <IdealUser
            value={state.idealUser}
            onChange={(value) => updateState({ idealUser: value })}
            onNext={next}
            onBack={back}
          />
        )

      case 'transformation':
        return (
          <Transformation
            beforeValue={state.transformationBefore}
            afterValue={state.transformationAfter}
            onBeforeChange={(value) =>
              updateState({ transformationBefore: value })
            }
            onAfterChange={(value) =>
              updateState({ transformationAfter: value })
            }
            onNext={next}
            onBack={back}
          />
        )

      case 'opportunity-form':
        return (
          <OpportunityForm
            value={state.opportunityForm}
            onChange={(value) => updateState({ opportunityForm: value })}
            onNext={next}
            onBack={back}
          />
        )

      case 'version-one':
        return (
          <VersionOne
            value={state.versionOne}
            onChange={(value) => updateState({ versionOne: value })}
            onNext={next}
            onBack={back}
          />
        )

      case 'path-forward':
        return (
          <PathForward
            immediate={state.pathForward.immediate}
            nearTerm={state.pathForward.nearTerm}
            later={state.pathForward.later}
            onImmediateChange={(value) => updatePathForward('immediate', value)}
            onNearTermChange={(value) => updatePathForward('nearTerm', value)}
            onLaterChange={(value) => updatePathForward('later', value)}
            onNext={next}
            onBack={back}
          />
        )

      case 'blueprint':
        return (
          <Blueprint
            data={blueprintData}
            onNext={next}
            onBack={back}
          />
        )

      case 'closing':
        return <Closing onRestart={restart} />

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">{renderStep()}</div>
    </div>
  )
}
FILE: app/session/flow/welcome.tsx
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
FILE: app/session/flow/starting-point.tsx
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
    title: 'Something I’m good at',
    body: 'I know I have real capability, but I have not fully structured it yet.',
  },
  {
    value: 'problem',
    title: 'A problem I care about',
    body: 'There is something in the world that clearly should be handled better.',
  },
  {
    value: 'idea',
    title: 'An idea I can’t stop thinking about',
    body: 'Something keeps returning to me, even if it is still unformed.',
  },
  {
    value: 'direction',
    title: 'A direction I want to explore',
    body: 'I feel pulled somewhere, but I need help shaping it.',
  },
  {
    value: 'unsure',
    title: 'I’m not sure yet — help me find it',
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

      <div className="grid gap-4">
        {options.map((option) => {
          const isSelected = value === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
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

        <div className="flex flex-col items-end gap-3">
          <p className="text-sm text-black/45">There is no wrong place to begin.</p>
          <PrimaryButton onClick={onNext} disabled={!canContinue}>
            Continue
          </PrimaryButton>
        </div>
      </div>
    </ScreenShell>
  )
}
FILE: app/session/flow/seed-prompt.tsx
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
FILE: app/session/flow/reflection.tsx
import { useMemo, useState } from 'react'
import PrimaryButton from '@/components/primary-button'
import ScreenIntro from '@/components/screen-intro'
import ScreenShell from '@/components/screen-shell'
import SecondaryButton from '@/components/secondary-button'

type ReflectionProps = {
  seedInput: string
  onConfirm: (value: string) => void
  onNext: () => void
  onBack: () => void
}

function buildReflection(seedInput: string): string[] {
  if (!seedInput.trim()) {
    return [
      'There seems to be something meaningful here that has not fully taken shape yet.',
      'You may be carrying a real signal, even if it still feels difficult to name clearly.',
      'What matters now is not perfect wording, but discovering the structure together.',
    ]
  }

  return [
    'You seem to be pointing toward something real, even if it is not fully structured yet.',
    'There is likely a meaningful pattern in what you care about, what you notice, or how you create value.',
    'What matters now is helping that signal become clearer and more usable.',
  ]
}

export default function Reflection({
  seedInput,
  onConfirm,
  onNext,
  onBack,
}: ReflectionProps) {
  const [mode, setMode] = useState<'initial' | 'refine' | 'recalibrate'>('initial')
  const [response, setResponse] = useState('')

  const reflection = useMemo(() => buildReflection(seedInput), [seedInput])

  const handleContinue = () => {
    onConfirm(response.trim())
    onNext()
  }

  return (
    <ScreenShell>
      <ScreenIntro
        eyebrow="Discovering your path"
        title="Here’s what I’m hearing so far."
        description="From what you shared, a few signals already stand out."
      />

      <div className="mb-6 rounded-2xl border border-black/10 bg-black/[0.02] p-5">
        <ul className="space-y-3">
          {reflection.map((item, index) => (
            <li
              key={index}
              className="text-base leading-7 text-black/85"
            >
              • {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <p className="text-base font-medium text-black">Does this feel accurate?</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <PrimaryButton
          onClick={() => {
            onConfirm('yes')
            onNext()
          }}
        >
          Yes, this feels right
        </PrimaryButton>

        <button
          type="button"
          onClick={() => setMode('refine')}
          className="rounded-2xl border border-black/10 px-4 py-2 text-sm text-black/70 transition hover:border-black/20 hover:text-black"
        >
          Partly — refine it
        </button>

        <button
          type="button"
          onClick={() => setMode('recalibrate')}
          className="rounded-2xl border border-black/10 px-4 py-2 text-sm text-black/70 transition hover:border-black/20 hover:text-black"
        >
          Not quite — let me clarify
        </button>
      </div>

      {(mode === 'refine' || mode === 'recalibrate') && (
        <div className="mb-8">
          <div className="mb-3">
            <p className="text-sm text-black/60">
              {mode === 'refine'
                ? 'What feels right here, and what needs adjustment?'
                : 'Tell me what I’m missing, and I’ll recalibrate.'}
            </p>
          </div>

          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={6}
            placeholder={
              mode === 'refine'
                ? 'Add what feels true, missing, or slightly off.'
                : 'Describe what I missed so the direction can become clearer.'
            }
            className="w-full rounded-2xl border border-black/10 bg-white px-5 py-4 text-base leading-7 text-black outline-none transition placeholder:text-black/35 focus:border-black/25"
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>

        {mode !== 'initial' && (
          <PrimaryButton
            onClick={handleContinue}
            disabled={!response.trim()}
          >
            Continue
          </PrimaryButton>
        )}
      </div>
    </ScreenShell>
  )
}
FILE: app/session/flow/capability.tsx
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
        title="Let’s make your capability more visible."
        description="You do not need a title first. We are looking for the real pattern in how you create value."
      />

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="text-sm text-black/50">{progressLabel}</p>
          <p className="text-sm text-black/40">Building your capability pattern…</p>
        </div>

        <div className="h-2 w-full rounded-full bg-black/6">
          <div
            className="h-2 rounded-full bg-black transition-all"
            style={{
              width: `${((questionIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-black/10 bg-black/[0.02] p-5">
        <p className="text-base leading-7 text-black/85">{currentQuestion}</p>
      </div>

      <div className="mb-8">
        <textarea
          value={currentAnswer}
          onChange={(e) => updateAnswer(e.target.value)}
          rows={8}
          placeholder="Write in a real, grounded way. You do not need to sound impressive."
          className="w-full rounded-2xl border border-black/10 bg-white px-5 py-4 text-base leading-7 text-black outline-none transition placeholder:text-black/35 focus:border-black/25"
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
FILE: app/session/flow/problem-space.tsx
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
FILE: app/session/flow/ideal-user.tsx
import PrimaryButton from '@/components/primary-button'
import ScreenIntro from '@/components/screen-intro'
import ScreenShell from '@/components/screen-shell'
import SecondaryButton from '@/components/secondary-button'

type IdealUserProps = {
  value: string
  onChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}

export default function IdealUser({
  value,
  onChange,
  onNext,
  onBack,
}: IdealUserProps) {
  const canContinue = value.trim().length > 0

  return (
    <ScreenShell className="max-w-4xl">
      <ScreenIntro
        eyebrow="Aligning your opportunity"
        title="Who most needs this first?"
        description="We are not looking for everyone. We are looking for the first human being this should help clearly."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="mb-4 rounded-2xl border border-black/10 bg-black/[0.02] p-5">
            <p className="mb-3 text-sm font-medium text-black/75">
              Questions to think through
            </p>
            <ul className="space-y-2 text-sm leading-6 text-black/65">
              <li>• Who is most affected by this problem?</li>
              <li>• Who feels capable, but blocked?</li>
              <li>• What are they trying to do or become?</li>
              <li>• What are they missing right now?</li>
              <li>• Why do you understand them especially well?</li>
            </ul>
          </div>

          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={10}
            placeholder="Describe the first person this should help in a grounded, human way."
            className="w-full rounded-2xl border border-black/10 bg-white px-5 py-4 text-base leading-7 text-black outline-none transition placeholder:text-black/35 focus:border-black/25"
          />
        </div>

        <div>
          <div className="h-full rounded-2xl border border-black/10 bg-black/[0.02] p-5">
            <p className="mb-3 text-sm font-medium text-black/75">
              Your first ideal user
            </p>

            {canContinue ? (
              <p className="text-base leading-7 text-black/80">{value}</p>
            ) : (
              <p className="text-sm leading-6 text-black/45">
                A live draft of the person you are building for will begin to
                take shape here.
              </p>
            )}
          </div>
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
FILE: app/session/flow/transformation.tsx
import PrimaryButton from '@/components/primary-button'
import ScreenIntro from '@/components/screen-intro'
import ScreenShell from '@/components/screen-shell'
import SecondaryButton from '@/components/secondary-button'

type TransformationProps = {
  beforeValue: string
  afterValue: string
  onBeforeChange: (value: string) => void
  onAfterChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}

export default function Transformation({
  beforeValue,
  afterValue,
  onBeforeChange,
  onAfterChange,
  onNext,
  onBack,
}: TransformationProps) {
  const canContinue =
    beforeValue.trim().length > 0 && afterValue.trim().length > 0

  return (
    <ScreenShell className="max-w-4xl">
      <ScreenIntro
        eyebrow="Shaping your opportunity"
        title="What changes for this person because your system exists?"
        description="This is the heart of the value. We are defining the movement your system creates."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <p className="mb-3 text-sm font-medium text-black/75">Before</p>
          <textarea
            value={beforeValue}
            onChange={(e) => onBeforeChange(e.target.value)}
            rows={8}
            placeholder="What are they feeling, struggling with, or lacking before your system helps them?"
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base leading-7 text-black outline-none transition placeholder:text-black/35 focus:border-black/25"
          />
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <p className="mb-3 text-sm font-medium text-black/75">After</p>
          <textarea
            value={afterValue}
            onChange={(e) => onAfterChange(e.target.value)}
            rows={8}
            placeholder="What becomes clearer, easier, safer, or more possible after?"
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base leading-7 text-black outline-none transition placeholder:text-black/35 focus:border-black/25"
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-black/10 bg-black/[0.02] p-5">
        <p className="mb-2 text-sm font-medium text-black/75">
          Your transformation promise
        </p>

        {canContinue ? (
          <p className="text-base leading-7 text-black/80">
            You help someone move from <span className="font-medium">{beforeValue}</span>{' '}
            toward <span className="font-medium">{afterValue}</span>.
          </p>
        ) : (
          <p className="text-sm leading-6 text-black/45">
            Once both sides are clearer, the transformation will begin to take shape here.
          </p>
        )}
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
FILE: app/session/flow/opportunity-form.tsx
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
FILE: app/session/flow/version-one.tsx
import PrimaryButton from '@/components/primary-button'
import ScreenIntro from '@/components/screen-intro'
import ScreenShell from '@/components/screen-shell'
import SecondaryButton from '@/components/secondary-button'

type VersionOneProps = {
  value: string
  onChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}

export default function VersionOne({
  value,
  onChange,
  onNext,
  onBack,
}: VersionOneProps) {
  const canContinue = value.trim().length > 0

  return (
    <ScreenShell>
      <ScreenIntro
        eyebrow="Shaping version one"
        title="What is the smallest real version of this?"
        description="We are not trying to build everything. We are identifying the simplest meaningful version that creates real value."
      />

      <div className="mb-5 rounded-2xl border border-black/10 bg-black/[0.02] p-5">
        <ul className="space-y-2 text-sm leading-6 text-black/65">
          <li>• What absolutely needs to be included first?</li>
          <li>• What can wait until later?</li>
          <li>• What would prove this matters?</li>
          <li>• What would make version one feel real, but not overcomplicated?</li>
        </ul>
      </div>

      <div className="mb-6">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={10}
          placeholder="Describe the smallest meaningful first version in a grounded way."
          className="w-full rounded-2xl border border-black/10 bg-white px-5 py-4 text-base leading-7 text-black outline-none transition placeholder:text-black/35 focus:border-black/25"
        />
      </div>

      <div className="mb-8 rounded-2xl border border-black/10 bg-black/[0.02] p-5">
        <p className="mb-2 text-sm font-medium text-black/75">
          Your first buildable version
        </p>

        {canContinue ? (
          <p className="text-base leading-7 text-black/80">{value}</p>
        ) : (
          <p className="text-sm leading-6 text-black/45">
            A grounded version-one statement will begin to take shape here.
          </p>
        )}
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
FILE: app/session/flow/path-forward.tsx
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
        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <p className="mb-3 text-sm font-medium text-black/75">
            Immediate
          </p>
          <p className="mb-3 text-sm text-black/50">
            What to do in the next 24–72 hours
          </p>
          <textarea
            value={immediate}
            onChange={(e) => onImmediateChange(e.target.value)}
            rows={4}
            placeholder="Write the first immediate steps."
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base leading-7 text-black outline-none transition placeholder:text-black/35 focus:border-black/25"
          />
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <p className="mb-3 text-sm font-medium text-black/75">
            Near-term
          </p>
          <p className="mb-3 text-sm text-black/50">
            What to validate, shape, or test next
          </p>
          <textarea
            value={nearTerm}
            onChange={(e) => onNearTermChange(e.target.value)}
            rows={4}
            placeholder="Write the next shaping or validation steps."
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base leading-7 text-black outline-none transition placeholder:text-black/35 focus:border-black/25"
          />
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <p className="mb-3 text-sm font-medium text-black/75">Later</p>
          <p className="mb-3 text-sm text-black/50">
            What to deliberately postpone until the foundation is clearer
          </p>
          <textarea
            value={later}
            onChange={(e) => onLaterChange(e.target.value)}
            rows={4}
            placeholder="Write what should wait until later."
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base leading-7 text-black outline-none transition placeholder:text-black/35 focus:border-black/25"
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
FILE: app/session/flow/blueprint.tsx
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
FILE: app/session/flow/closing.tsx
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
Final note to Claude

After creating these files, do not invent extra structure.
Stop after successful file creation unless explicitly asked to continue.

This manifest is the initial VisionAir Phase 1 sacred experience scaffold.