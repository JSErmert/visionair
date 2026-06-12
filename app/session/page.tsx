'use client'

import { useEffect, useState } from 'react'

import {
  readActiveDraft,
  writeActiveDraft,
  clearActiveDraft,
  readSavedBlueprintIndex,
  appendSavedBlueprint,
  deleteSavedBlueprint,
  findSavedBlueprint,
  isResumableActiveDraft,
  type SavedBlueprint,
} from './persistence'

// Flow Screens
import Welcome from './flow/welcome'
import StartingPoint from './flow/starting-point'
import SeedPrompt from './flow/seed-prompt'
import Reflection from './flow/reflection'
import Capability from './flow/capability'
import ProblemSpace from './flow/problem-space'
import IdealUser from './flow/ideal-user'
import Transformation from './flow/transformation'
import {
  synthesizeCapability,
  synthesizeVersionOne,
  synthesizeIdealUser,
  structuralizeBefore,
  structuralizeAfter,
} from './flow/synthesizers'
import { deriveLaneProfile, type LaneProfile } from './flow/lane-derivation'
import OpportunityForm from './flow/opportunity-form'
import VersionOne from './flow/version-one'
import Blueprint from './flow/blueprint'
import PathForward from './flow/path-forward'
import YourNextMove from './flow/your-next-move'
import Closing from './flow/closing'
import { compressStrategy } from './flow/strategy-compression'

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
  'your-next-move',
  'closing',
] as const

type Step = (typeof steps)[number]

type EntryPoint = 'strength' | 'problem' | 'idea' | 'direction' | 'unsure' | ''
type ProblemSpaceValue = 'structure' | 'guidance' | 'opportunity' | ''
type OpportunityFormValue = 'platform' | 'tool' | 'service' | 'hybrid' | 'learning' | ''

export type SessionState = {
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

// Synthesis layer extracted to ./flow/synthesizers.ts + ./flow/structural-primitives.ts
// in v1.0.17. synthesizeCapability / synthesizeVersionOne / synthesizeIdealUser /
// structuralizeBefore / structuralizeAfter are imported at the top of this file.

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

function formatTransformation(before: string, after: string, laneProfile?: LaneProfile) {
  if (!before.trim() && !after.trim()) return ''

  const beforeBullets = structuralizeBefore(before, laneProfile).slice(0, 2)
  const afterBullets = structuralizeAfter(after).slice(0, 2)

  return `Before — ${beforeBullets.join(' ')} After — ${afterBullets.join(' ')}`
}

const BLUEPRINT_STEP_INDEX = steps.indexOf('blueprint')
const YOUR_NEXT_MOVE_STEP_INDEX = steps.indexOf('your-next-move')
const CLOSING_STEP_INDEX = steps.indexOf('closing')
const STARTING_POINT_STEP_INDEX = steps.indexOf('starting-point')

// v1.2.0 — Opus 4.7 distilled blueprint shape. Fetched once when the user
// reaches the Blueprint step, cached at the session-page level so it persists
// through to the Closing screen download. Null = not fetched / fallback.
export type BlueprintSynthesis = {
  coreDirection: string
  whoItServes: string
  whatItOffers: string
  firstShippableSlice: string
  proofItWorks: string
}

export default function SessionPage() {
  const [stepIndex, setStepIndex] = useState(0)
  const [state, setState] = useState<SessionState>(initialState)
  const [hasMounted, setHasMounted] = useState(false)
  const [hasDraft, setHasDraft] = useState(false)
  const [savedBlueprints, setSavedBlueprints] = useState<SavedBlueprint[]>([])
  // v1.1.5 — Fix 1/3/5: navigation-mode flags that gate autosave.
  // - isViewingPastBlueprint: user opened a saved blueprint from welcome; the
  //   reopened state must not be auto-written as a new active draft (Fix 6).
  // - isFinalized: user clicked Finish on Your Next Move; the active draft has
  //   been cleared and must not be re-written by the autosave effect when the
  //   stepIndex transitions to closing (or if the user navigates back from
  //   closing within this same session).
  const [isViewingPastBlueprint, setIsViewingPastBlueprint] = useState(false)
  const [isFinalized, setIsFinalized] = useState(false)

  // v1.2.0 — Opus 4.7 distilled synthesis (lifted from Blueprint screen so it
  // persists through to Closing for inclusion in the Markdown download).
  // Fetched once when stepIndex first reaches BLUEPRINT_STEP_INDEX with a
  // non-empty session. Re-fetched if the user navigates back, edits inputs,
  // and re-enters Blueprint (state-key dependency forces a new call).
  const [blueprintSynthesis, setBlueprintSynthesis] = useState<BlueprintSynthesis | null>(null)
  const [blueprintSynthesisLoading, setBlueprintSynthesisLoading] = useState(false)

  const currentStep: Step = steps[stepIndex]

  // Mount-time hydration (v1.1.5 Fix 5: deterministic order).
  // 1) Read saved blueprints first (cheap, no validation needed).
  // 2) Read active draft, then validate its eligibility against the
  //    completion boundary. Drafts at or beyond closing are stale finalized
  //    artifacts — clear them and do NOT expose Resume state.
  // 3) Set hasMounted last so the welcome UI only renders the resolved state.
  useEffect(() => {
    setSavedBlueprints(readSavedBlueprintIndex().blueprints)

    const draft = readActiveDraft()
    if (draft && !isResumableActiveDraft(draft, CLOSING_STEP_INDEX)) {
      // Stale finalized draft (or any draft past the completion boundary).
      // Clear it from storage and treat as if no draft existed.
      clearActiveDraft()
      setHasDraft(false)
    } else {
      setHasDraft(draft !== null)
    }

    setHasMounted(true)
  }, [])

  // Per-keystroke autosave (v1.1.1 T3: intentional, no debounce; v1.1.5 Fix 1+6
  // additions). Skip autosave when:
  // - not yet hydrated (avoid SSR mismatch)
  // - on the welcome step (nothing to save before the user begins)
  // - on or past the closing step (session is over; preserves clearActiveDraft
  //   from the finalization branch of next())
  // - the user is viewing a previously-saved blueprint (read-only mode; do not
  //   re-create a "session in progress" artifact for past content)
  // - the session has been finalized in this render lifecycle
  useEffect(() => {
    if (!hasMounted) return
    if (stepIndex === 0) return
    if (stepIndex >= CLOSING_STEP_INDEX) return
    if (isViewingPastBlueprint) return
    if (isFinalized) return
    writeActiveDraft(state, stepIndex)
  }, [state, stepIndex, hasMounted, isViewingPastBlueprint, isFinalized])

  // v1.2.0 — Fire /api/blueprint (Opus 4.7) when the user first lands on the
  // Blueprint step. Cached for the rest of the session so Closing's download
  // can include the distilled fields. Graceful fallback: on any failure
  // (missing key, rate-limit, malformed JSON) we leave synthesis null and the
  // Blueprint screen + download silently degrade to the deterministic flow.
  useEffect(() => {
    if (stepIndex !== BLUEPRINT_STEP_INDEX) return
    if (blueprintSynthesis !== null) return // already fetched for this session
    if (blueprintSynthesisLoading) return

    let cancelled = false
    setBlueprintSynthesisLoading(true)
    fetch('/api/blueprint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entryPoint: state.entryPoint,
        seedInput: state.seedInput,
        reflection: state.reflection,
        capability: state.capability,
        problemSpace: state.problemSpace,
        idealUser: state.idealUser,
        transformationBefore: state.transformationBefore,
        transformationAfter: state.transformationAfter,
        opportunityForm: state.opportunityForm,
        versionOne: state.versionOne,
        pathForward: state.pathForward,
      }),
    })
      .then((res) => res.json())
      .then((payload) => {
        if (cancelled) return
        if (payload && payload.fallbackToFixed === false && payload.synthesis) {
          setBlueprintSynthesis(payload.synthesis)
        }
      })
      .catch(() => {
        // swallow — graceful fallback
      })
      .finally(() => {
        if (!cancelled) setBlueprintSynthesisLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex])

  const next = () => {
    if (stepIndex >= steps.length - 1) return

    // v1.1.5 Fix 1: Your Next Move → closing is the SINGLE authoritative
    // session finalization boundary. At this exact transition:
    //   1. append the completed blueprint to the saved index
    //   2. clear the active draft from storage
    //   3. mark in-memory state as finalized (suppresses any subsequent
    //      autosave from re-writing a stale draft when stepIndex advances
    //      to closing)
    //   4. set hasDraft=false so the welcome screen does not show Resume
    //      if the user navigates back via restart()
    // Skipped when viewing a past blueprint — append-only-on-edit duplication
    // is intentionally avoided in that mode (Fix 6).
    if (stepIndex === YOUR_NEXT_MOVE_STEP_INDEX && !isViewingPastBlueprint) {
      const saved = appendSavedBlueprint(state)
      setSavedBlueprints((prev) => [...prev, saved])
      clearActiveDraft()
      setHasDraft(false)
      setIsFinalized(true)
    }

    setStepIndex((prev) => prev + 1)
  }

  const back = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1)
    }
  }

  const restart = () => {
    clearActiveDraft()
    setHasDraft(false)
    setIsViewingPastBlueprint(false)
    setIsFinalized(false)
    setState(initialState)
    setStepIndex(0)
  }

  const resumeDraft = () => {
    const draft = readActiveDraft()
    if (!draft) return
    setState(draft.state)
    setStepIndex(draft.stepIndex)
    setHasDraft(false)
    setIsViewingPastBlueprint(false)
    setIsFinalized(false)
  }

  // T5: clear draft AND jump to Starting Point (stepIndex 1), not Welcome (0).
  // The user has already seen the welcome banner by interacting with it.
  const startFresh = () => {
    clearActiveDraft()
    setHasDraft(false)
    setIsViewingPastBlueprint(false)
    setIsFinalized(false)
    setState(initialState)
    setStepIndex(STARTING_POINT_STEP_INDEX)
  }

  // v1.1.5 Fix 6: opening a past blueprint enters a read-only-ish view mode.
  // Autosave is suppressed (see autosave effect guard on isViewingPastBlueprint)
  // so reopening + refreshing does not recreate a "session in progress."
  const openSavedBlueprint = (id: string) => {
    const found = findSavedBlueprint(id)
    if (!found) return
    setState(found.state)
    setStepIndex(BLUEPRINT_STEP_INDEX)
    setIsViewingPastBlueprint(true)
    setIsFinalized(false)
  }

  const removeSavedBlueprint = (id: string) => {
    deleteSavedBlueprint(id)
    setSavedBlueprints((prev) => prev.filter((blueprint) => blueprint.id !== id))
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

  // Blueprint sources of truth: synthesized outputs, not raw user input.
  // Structured synthesis output is preserved as string[] end-to-end — no
  // `.join(' ')` flattening at the artifact boundary (v1.0.14).
  // - capability: synthesized via synthesizeCapability (returns string[])
  // - problemSpace: already structured (radio → fixed phrase)
  // - idealUser: synthesized via synthesizeIdealUser (v1.0.16) — returns
  //   string[]; empty input returns [] so SectionCard renders the
  //   "Still taking shape." empty state
  // - transformation: already synthesized via formatTransformation (v1.0.7)
  // - opportunityForm: already structured (radio → fixed phrase)
  // - versionOne: synthesized via synthesizeVersionOne (v1.0.12)
  // - pathForward: action content, intentionally not run through state translators
  //   (would replace specific actions with generic state fallbacks); the
  //   immediate/near-term/later bucketing is itself the structural shape
  // - reflection: user's verbatim refinement/recalibration text from the
  //   Reflection screen (v1.0.22); renders as an italicized footer block on
  //   the blueprint when non-empty and not the literal 'yes' confirmation.
  //   Synthesized reflection bullets live in the Reflection screen, not the
  //   blueprint — this field carries only the user's typed correction if they
  //   chose "Partly — refine it" or "Not quite — let me clarify"
  // v1.1.3: derive lane profile once per render from the joined session input.
  // High-confidence lanes drive lane-aware fallback in the four lane-consuming
  // synthesizers below; low/medium confidence drops through to existing primary
  // detection paths byte-identically.
  const laneProfile = deriveLaneProfile(state)

  const blueprintData = {
    capability: synthesizeCapability(state.capability, laneProfile),
    problemSpace: formatProblemSpace(state.problemSpace),
    idealUser: synthesizeIdealUser(state.idealUser, laneProfile),
    transformation: formatTransformation(
      state.transformationBefore,
      state.transformationAfter,
      laneProfile
    ),
    opportunityForm: formatOpportunityForm(state.opportunityForm),
    versionOne: synthesizeVersionOne(state.versionOne, laneProfile),
    pathForward: state.pathForward,
    reflection: state.reflection,
    laneProfile,
  }

  // v1.1.4: deterministic compression of the blueprint into a single
  // actionable strategy. Decision extraction, not summarization.
  const strategy = compressStrategy(
    {
      capability: blueprintData.capability,
      problemSpace: blueprintData.problemSpace,
      idealUser: blueprintData.idealUser,
      versionOne: blueprintData.versionOne,
      laneProfile,
    },
    state
  )

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <Welcome
            onNext={next}
            hasDraft={hasMounted && hasDraft}
            savedBlueprints={hasMounted ? savedBlueprints : []}
            onResumeDraft={resumeDraft}
            onStartFresh={startFresh}
            onOpenBlueprint={openSavedBlueprint}
            onRemoveBlueprint={removeSavedBlueprint}
          />
        )

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
            synthesis={blueprintSynthesis}
            synthesisLoading={blueprintSynthesisLoading}
            onNext={next}
            onBack={back}
          />
        )

      case 'your-next-move':
        return (
          <YourNextMove
            data={strategy}
            onNext={next}
            onBack={back}
          />
        )

      case 'closing': {
        // v1.2.0 Beta-1.0 — Closing screen now offers a Download button for
        // the just-finalized blueprint. Pull label/savedAt from the most
        // recently appended saved blueprint (if any); state is still the live
        // in-memory state by construction at this step. Synthesis is the
        // Opus 4.7 distillation carried forward from the Blueprint step.
        const latest = savedBlueprints[savedBlueprints.length - 1]
        return (
          <Closing
            onRestart={restart}
            state={state}
            label={latest?.label}
            savedAt={latest?.savedAt}
            synthesis={blueprintSynthesis}
          />
        )
      }

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">{renderStep()}</div>
    </div>
  )
}
