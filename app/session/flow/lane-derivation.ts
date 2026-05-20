// Lane Derivation (v1.1.3). Pre-LLM intelligence layer that derives a single
// LaneProfile per session from the joined input, then threads it through the
// existing synthesizers as an optional second parameter. Synthesizers consult
// the lane profile when their primary detection paths produce weak signal,
// replacing generic fallback with lane-aligned output.
//
// Determinism: pure regex-and-arithmetic. No LLM, no embeddings, no external
// calls. All tables and weights are local to this module per the realignment
// hard stop on vocabulary expansion in `structural-primitives.ts`.
//
// Memo-pass tightenings (v1.1.3 re-seal):
// - T1: selection threshold = 0.55 (was 0.40)
// - T2: lane-aware fallback fires only on confidence === 'high'
// - T3: structured evidence (LaneEvidence) replaces string[]
// - T4: ambitious_unstructured_builder lane added
// - T5: low-signal null-lane test (Persona 11d) covered by uncertainty-cap

import {
  type Theme,
  detectThemes,
  detectCapabilityTargets,
  detectVersionOneForm,
  detectVersionOneScope,
  detectIdealUserRole,
  detectIdealUserBlocker,
  versionOneFormPatterns,
} from './structural-primitives'
import type { SessionState } from '../page'

// ===========================================================================
// Public types
// ===========================================================================

export type CognitiveLane =
  | 'concrete_builder'
  | 'abstract_systems_thinker'
  | 'meta_orchestrator'
  | 'understructured_operator'
  | 'high_capability_low_legibility'
  | 'ambitious_unstructured_builder'

export type ConstraintLane =
  | 'structure_gap'
  | 'legibility_gap'
  | 'scope_gap'
  | 'proof_gap'
  | 'direction_gap'

export type GuidanceLane =
  | 'structure'
  | 'clarify'
  | 'translate'
  | 'narrow'
  | 'validate'

export type LaneConfidence = 'low' | 'medium' | 'high'

// T3: structured evidence — auditable, debuggable, machine-readable.
export type LaneEvidence = {
  metaMarkers: number
  abstractMarkers: number
  legibilityMarkers: number
  concreteFormHits: number
  ambitionMarkers: number
  uncertaintyMarkers: number
  understructuredMarkers: number
  formNoun: string | null
  scope: string | null
  role: string | null
  blocker: string | null
  themes: Theme[]
  targets: string[]
}

export type LaneProfile = {
  cognitive: CognitiveLane | null
  constraint: ConstraintLane | null
  guidance: GuidanceLane | null
  confidence: LaneConfidence
  evidence: LaneEvidence
}

// T1: lane selection threshold — only signal scores at or above 0.55 produce
// a lane assignment; below threshold, the lane is null and primary detection
// paths in synthesizers run unaltered.
export const LANE_SELECTION_THRESHOLD = 0.55

// ===========================================================================
// Marker tables (local; not added to structural-primitives per realignment)
// ===========================================================================

const metaOrchestratorMarkers: RegExp[] = [
  /\bacross\s+(?:all\s+)?(?:my\s+)?projects?\b/i,
  /\bmultiple\s+systems?\b/i,
  /\bsystem\s+of\s+systems\b/i,
  /\bmeta[\s-]?(?:system|orchestrat)/i,
  /\b(?:digital|second|external|portfolio)\s+brain\b/i,
  /\borchestration\s+layer\b|\bintelligence\s+layer\b/i,
  /\bportfolio\s+intelligence\b/i,
  /\bknowledge\s+graph\b/i,
]

const abstractSystemsMarkers: RegExp[] = [
  /\bprinciple/i,
  /\bdynamic/i,
  /\btransformation/i,
  /\bsystems?\s+thinker/i,
  /\bdeeper\s+structure/i,
  /\bunderlying\s+pattern/i,
  /\b(?:highly|deeply)\s+(?:intellectual|analytical|thoughtful)/i,
  /\bpolymath/i,
]

const legibilityGapMarkers: RegExp[] = [
  /\bunder[\s-]?(?:recognized|valued|appreciated)\b/i,
  /\bcan(?:not|'?t)\s+find\s+(?:employment|work|a\s+job)\b/i,
  /\bpeople\s+don['’]?t\s+understand\b/i,
  /\bhard\s+to\s+(?:explain|present|translate|articulate)\b/i,
  /\bcan(?:not|'?t)\s+(?:present|show|translate|articulate|explain)\b/i,
  /\bnot\s+(?:externally\s+)?recognized\b/i,
  /\bothers?\s+can(?:not|'?t)\s+(?:see|understand|detect)\b/i,
]

const ambitionMarkers: RegExp[] = [
  /\bambitious\b|\bambition\b/i,
  /\bscale\b|\bscaling\b/i,
  /\bmassive\b/i,
  /\bworld[\s-]?(?:class|wide|changing)\b/i,
  /\b(?:millions?|thousands?)\s+of\b/i,
  /\bhuge\s+(?:impact|opportunity|market)\b/i,
  /\bbig\s+(?:idea|vision|impact)\b/i,
]

// T5 support: uncertainty markers cap confidence at 'low' and force null
// lane resolution when the user's input is genuinely uncommitted, even if
// scattered theme matches would otherwise score above threshold.
const uncertaintyMarkers: RegExp[] = [
  /\bnot\s+sure\b/i,
  /\bdon['’]?t\s+know\s+(?:what|where|how|whether|if)\b/i,
  /\bunsure\b/i,
  /\bmaybe\b/i,
  /\b(?:want\s+to\s+)?build(?:\s+(?:something|anything))?\s+yet\b/i,
  /\bsomeday\b/i,
  /\bsomething\s+like\b/i,
  /\bvague\s+idea\b/i,
]

const understructuredMarkers: RegExp[] = [
  /\bdo\s+(?:a\s+)?lot\b/i,
  /\bbuilt?\s+(?:lots?\s+of\s+)?things?\b/i,
  /\bhard\s+to\s+explain\b/i,
  /\bdon['’]?t\s+know\s+(?:how|what)\s+to\s+(?:explain|describe|name)\b/i,
  /\ball\s+over\s+the\s+place\b/i,
  /\bnothing\s+(?:feels\s+)?clearly\s+shaped\b/i,
]

// Forms that are themselves meta-system shapes (rather than concrete builds).
const META_FORMS = new Set<string>([
  'digital brain',
  'orchestration layer',
  'intelligence layer',
  'meta-system',
  'developer operating system',
  'portfolio intelligence engine',
  'knowledge graph',
])

// ===========================================================================
// Signal extraction
// ===========================================================================

type SignalSet = {
  joined: string
  themes: Theme[]
  targets: string[]
  formNoun: string | null
  scope: string | null
  role: string | null
  blocker: string | null
  metaMarkers: number
  abstractMarkers: number
  legibilityMarkers: number
  concreteFormHits: number
  ambitionMarkers: number
  uncertaintyMarkers: number
  understructuredMarkers: number
  isMetaForm: boolean
  isConcreteForm: boolean
  hasStructureGapPhrase: boolean
  hasDirectionGapPhrase: boolean
  hasProofGapPhrase: boolean
}

function countMatches(text: string, patterns: RegExp[]): number {
  let count = 0
  for (const re of patterns) if (re.test(text)) count++
  return count
}

function extractSignals(joined: string): SignalSet {
  const themes = detectThemes(joined)
  const targets = detectCapabilityTargets(joined)
  const formNoun = detectVersionOneForm(joined)
  const scope = detectVersionOneScope(joined)
  const role = detectIdealUserRole(joined, null)
  const blocker = detectIdealUserBlocker(joined)

  const metaMarkers = countMatches(joined, metaOrchestratorMarkers)
  const abstractMarkers = countMatches(joined, abstractSystemsMarkers)
  const legibilityMarkers = countMatches(joined, legibilityGapMarkers)
  const ambitionMarkersCount = countMatches(joined, ambitionMarkers)
  const uncertaintyMarkersCount = countMatches(joined, uncertaintyMarkers)
  const understructuredMarkersCount = countMatches(joined, understructuredMarkers)

  let concreteFormHits = 0
  for (const { re } of versionOneFormPatterns) if (re.test(joined)) concreteFormHits++

  const isMetaForm = formNoun !== null && META_FORMS.has(formNoun)
  const isConcreteForm = formNoun !== null && !isMetaForm

  const hasStructureGapPhrase = /\black(?:ing|s)?\s+(?:guidance|structure)\b|\bunstructured\b|\bscattered\b|\bno\s+clarity\s+(?:moment|yet)\b/i.test(joined)
  const hasDirectionGapPhrase = /\bdon['’]?t\s+know\s+(?:where|what|how|why|whether)\b|\bcan(?:not|'?t)\s+(?:figure|decide|choose)\b/i.test(joined)
  const hasProofGapPhrase = /\b(?:haven['’]?t|not)\s+(?:tested|validated|tried|launched|shipped)\b|\bunproven\b|\bno\s+one\s+has\s+used\b/i.test(joined)

  return {
    joined,
    themes,
    targets,
    formNoun,
    scope,
    role,
    blocker,
    metaMarkers,
    abstractMarkers,
    legibilityMarkers,
    concreteFormHits,
    ambitionMarkers: ambitionMarkersCount,
    uncertaintyMarkers: uncertaintyMarkersCount,
    understructuredMarkers: understructuredMarkersCount,
    isMetaForm,
    isConcreteForm,
    hasStructureGapPhrase,
    hasDirectionGapPhrase,
    hasProofGapPhrase,
  }
}

// ===========================================================================
// Lane scoring
// ===========================================================================

function scoreCognitive(s: SignalSet): Record<CognitiveLane, number> {
  return {
    concrete_builder:
      0.5 * (s.isConcreteForm ? 1 : 0) +
      0.3 * (Math.min(s.concreteFormHits, 3) / 3) +
      0.2 * (s.themes.includes('building') ? 1 : 0),

    abstract_systems_thinker:
      0.5 * (Math.min(s.abstractMarkers, 4) / 4) +
      0.3 * (s.themes.includes('analysis') ? 1 : 0) +
      0.2 * (s.themes.includes('translating') ? 1 : 0),

    meta_orchestrator:
      0.7 * (Math.min(s.metaMarkers, 3) / 3) +
      0.3 * (s.isMetaForm ? 1 : 0),

    understructured_operator:
      0.5 * (Math.min(s.understructuredMarkers, 2) / 2) +
      0.25 * (s.themes.length >= 3 ? 1 : 0) +
      0.25 * (s.role === null && s.formNoun === null && s.targets.length === 0 ? 1 : 0),

    high_capability_low_legibility:
      0.6 * (Math.min(s.legibilityMarkers, 3) / 3) +
      0.4 * (s.abstractMarkers > 0 ? 1 : 0),

    // T4: builder intent + ambition + lack of structure.
    // Weight on ambition is the load-bearing distinguisher from concrete_builder
    // (which requires a form noun) and from understructured_operator (which
    // requires capability-naming markers like "do a lot").
    ambitious_unstructured_builder:
      0.30 * (s.themes.includes('building') ? 1 : 0) +
      0.50 * (Math.min(s.ambitionMarkers, 3) / 3) +
      0.20 * (s.formNoun === null && s.scope === null && s.targets.length === 0 ? 1 : 0),
  }
}

function scoreConstraint(s: SignalSet): Record<ConstraintLane, number> {
  return {
    structure_gap:
      0.6 * (s.themes.includes('structure') ? 1 : 0) +
      0.4 * (s.hasStructureGapPhrase ? 1 : 0),

    legibility_gap:
      0.7 * (Math.min(s.legibilityMarkers, 3) / 3) +
      0.3 * (s.role === null && (s.themes.includes('translating') || s.abstractMarkers > 0) ? 1 : 0),

    // scope_gap requires actual build intent to fire — bare absence-of-form
    // would otherwise fire for every input that doesn't name a form noun,
    // which is too broad. Building theme + missing form is the load-bearing
    // signal; missing scope + missing targets are secondary contributors.
    scope_gap:
      0.4 * (s.themes.includes('building') && s.formNoun === null ? 1 : 0) +
      0.4 * (s.scope === null && s.themes.includes('building') ? 1 : 0) +
      0.2 * (s.targets.length === 0 ? 1 : 0),

    proof_gap:
      0.6 * (s.hasProofGapPhrase ? 1 : 0) +
      0.4 * (s.themes.includes('building') && s.scope === null ? 1 : 0),

    direction_gap:
      0.6 * (s.hasDirectionGapPhrase ? 1 : 0) +
      0.4 * (s.themes.length === 0 ? 1 : 0),
  }
}

function scoreGuidance(
  s: SignalSet,
  cognitive: CognitiveLane | null,
  constraint: ConstraintLane | null,
): Record<GuidanceLane, number> {
  // Guidance lane is largely a function of the constraint lane plus secondary signal.
  // Each entry takes the form: base from constraint compatibility + small boost from cognitive lane.
  return {
    structure:
      (constraint === 'structure_gap' ? 0.7 : 0) +
      0.3 * (cognitive === 'understructured_operator' || cognitive === 'ambitious_unstructured_builder' ? 1 : 0),

    clarify:
      0.4 * (s.uncertaintyMarkers >= 1 && s.uncertaintyMarkers < 2 ? 1 : 0) +
      0.3 * (constraint === 'direction_gap' ? 1 : 0) +
      0.2 * (cognitive === 'understructured_operator' ? 1 : 0),

    translate:
      (constraint === 'legibility_gap' ? 0.7 : 0) +
      0.3 * (cognitive === 'high_capability_low_legibility' || cognitive === 'abstract_systems_thinker' ? 1 : 0),

    narrow:
      (constraint === 'scope_gap' ? 0.7 : 0) +
      0.3 * (cognitive === 'meta_orchestrator' || cognitive === 'ambitious_unstructured_builder' ? 1 : 0),

    validate:
      (constraint === 'proof_gap' ? 0.7 : 0) +
      0.3 * (cognitive === 'concrete_builder' ? 1 : 0),
  }
}

// ===========================================================================
// Resolution
// ===========================================================================

function resolveLane<T extends string>(
  scores: Record<T, number>,
  uncertaintyForcesNull: boolean,
): { lane: T | null; topScore: number } {
  let best: T | null = null
  let bestScore = 0
  // Sort entries by lexical key for deterministic tie-break, then pick highest.
  const entries = (Object.entries(scores) as [T, number][]).sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  )
  for (const [lane, score] of entries) {
    if (score > bestScore) {
      best = lane
      bestScore = score
    }
  }
  // T5 support: if input is dominated by uncertainty markers, force null lane
  // resolution regardless of incidental score crossing threshold.
  if (uncertaintyForcesNull) return { lane: null, topScore: bestScore }
  return { lane: bestScore >= LANE_SELECTION_THRESHOLD ? best : null, topScore: bestScore }
}

function deriveConfidence(
  cog: number,
  con: number,
  gui: number,
  uncertaintyForcesLow: boolean,
): LaneConfidence {
  if (uncertaintyForcesLow) return 'low'
  const max = Math.max(cog, con, gui)
  const sum = cog + con + gui
  if (sum >= 1.8 && max >= 0.6) return 'high'
  if (sum >= 1.0 && max >= 0.5) return 'medium'
  return 'low'
}

function buildEvidence(s: SignalSet): LaneEvidence {
  return {
    metaMarkers: s.metaMarkers,
    abstractMarkers: s.abstractMarkers,
    legibilityMarkers: s.legibilityMarkers,
    concreteFormHits: s.concreteFormHits,
    ambitionMarkers: s.ambitionMarkers,
    uncertaintyMarkers: s.uncertaintyMarkers,
    understructuredMarkers: s.understructuredMarkers,
    formNoun: s.formNoun,
    scope: s.scope,
    role: s.role,
    blocker: s.blocker,
    themes: s.themes,
    targets: s.targets,
  }
}

// ===========================================================================
// Public API
// ===========================================================================

export function deriveLaneProfile(state: SessionState): LaneProfile {
  const joined = [
    state.seedInput,
    state.reflection,
    (state.capability ?? []).join(' '),
    state.idealUser,
    state.transformationBefore,
    state.transformationAfter,
    state.versionOne,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()

  const emptyEvidence: LaneEvidence = {
    metaMarkers: 0,
    abstractMarkers: 0,
    legibilityMarkers: 0,
    concreteFormHits: 0,
    ambitionMarkers: 0,
    uncertaintyMarkers: 0,
    understructuredMarkers: 0,
    formNoun: null,
    scope: null,
    role: null,
    blocker: null,
    themes: [],
    targets: [],
  }

  if (!joined) {
    return {
      cognitive: null,
      constraint: null,
      guidance: null,
      confidence: 'low',
      evidence: emptyEvidence,
    }
  }

  const signals = extractSignals(joined)
  const uncertaintyDominates = signals.uncertaintyMarkers >= 2

  const cognitiveScores = scoreCognitive(signals)
  const constraintScores = scoreConstraint(signals)

  const cogResolved = resolveLane(cognitiveScores, uncertaintyDominates)
  const conResolved = resolveLane(constraintScores, uncertaintyDominates)

  const guidanceScores = scoreGuidance(signals, cogResolved.lane, conResolved.lane)
  const guiResolved = resolveLane(guidanceScores, uncertaintyDominates)

  const confidence = deriveConfidence(
    cogResolved.topScore,
    conResolved.topScore,
    guiResolved.topScore,
    uncertaintyDominates,
  )

  return {
    cognitive: cogResolved.lane,
    constraint: conResolved.lane,
    guidance: guiResolved.lane,
    confidence,
    evidence: buildEvidence(signals),
  }
}

// ===========================================================================
// Lane-aware fallback maps (consumed by synthesizers when confidence === 'high')
// ===========================================================================
// Sparse — only populated cognitive×constraint pairs have entries. Synthesizers
// fall through to existing generic fallback if their pair is absent.

type LaneAwareFallback = {
  idealUser?: string[]
  versionOne?: string[]
  capability?: string[]
  before?: string[]
}

function laneKey(cognitive: CognitiveLane | null, constraint: ConstraintLane | null): string {
  return `${cognitive ?? '_'}|${constraint ?? '_'}`
}

const laneAwareFallbacks: Record<string, LaneAwareFallback> = {
  [laneKey('high_capability_low_legibility', 'legibility_gap')]: {
    idealUser: [
      'The ideal user is a deeply capable person whose work is not yet externally legible.',
      'What specifically blocks them is the absence of a recognizable form for what they produce.',
      'They are recognizable as someone whose capability appears clear internally but does not yet read as actionable to evaluators.',
    ],
    capability: [
      'You can reliably help under-recognized capable people convert internal capability into externally legible form.',
      'Your strength is in producing the translation between internal pattern and external readable shape.',
      'The value you create is legibility where there was previously only invisible signal.',
    ],
    before: [
      'The current state has real capability that is not yet externally legible to evaluators.',
      'The current state operates without a converted external form for the work that is internally clear.',
    ],
  },

  [laneKey('meta_orchestrator', 'scope_gap')]: {
    versionOne: [
      'Version one is a single concrete instance of the meta-system, not the full meta-system itself.',
      'Scope is intentionally bounded to one isolated thread of the broader pattern.',
      'What it proves is whether one node of the system, fully built, holds enough value on its own to justify the broader build.',
    ],
    before: [
      'The current state holds a meta-system intent without a single committed concrete instance to build first.',
      'The current state operates at the orchestration layer without a chosen first node to ship.',
    ],
  },

  [laneKey('abstract_systems_thinker', 'structure_gap')]: {
    before: [
      'The current state operates with strong internal pattern recognition that has not yet been externalized into a committed structure.',
      'The current state has insight without a chosen structural commitment to act from.',
    ],
    versionOne: [
      'Version one is one concrete realization of the underlying pattern, not the pattern itself.',
      'Scope is intentionally bounded to a single specific manifestation that can be built and tested.',
      'What it proves is whether the underlying pattern produces value when forced into one concrete form.',
    ],
  },

  [laneKey('ambitious_unstructured_builder', 'scope_gap')]: {
    versionOne: [
      'Version one is the smallest single concrete artifact the ambition can manifest in.',
      'Scope is intentionally bounded to one specific buildable thing, not the full ambition surface.',
      'What it proves is whether the ambition can survive contact with a single completed shipped artifact.',
    ],
    before: [
      'The current state holds ambition without committed form.',
      'The current state has scale intent but no bounded version-one to test it against.',
    ],
  },

  [laneKey('understructured_operator', 'legibility_gap')]: {
    capability: [
      'You can reliably produce real activity across multiple kinds of work — the recurring shape of that activity has not yet been named in operational terms.',
      'Your strength is in generating useful output even when the underlying capability has not been externally named.',
      'The value you create is real but is currently distributed across surfaces that do not yet add up to one nameable thing.',
    ],
    idealUser: [
      'The ideal user is a capable operator whose own activity is not yet visible to themselves in named form.',
      'What specifically blocks them is producing more than current language can absorb.',
      'They are recognizable as someone whose body of work is real but does not yet read as one coherent capability.',
    ],
  },
}

// T2: gate — lane-aware fallback ONLY on confidence === 'high'.
export function getLaneAwareFallback(
  laneProfile: LaneProfile | undefined,
): LaneAwareFallback | null {
  if (!laneProfile) return null
  if (laneProfile.confidence !== 'high') return null
  const key = laneKey(laneProfile.cognitive, laneProfile.constraint)
  return laneAwareFallbacks[key] ?? null
}
