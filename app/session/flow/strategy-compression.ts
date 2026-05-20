// Strategy Compression (v1.1.4). Deterministic decision-extraction layer that
// converts the structured blueprint + lane profile into a single actionable
// strategy: one direction, one first build, one proof, 2–4 immediate actions,
// one constraint, one reason.
//
// This is NOT summarization. It is decision extraction:
// - Compresses the blueprint into a decision moment
// - Outputs only what the user must do next
// - Does not re-state blueprint sections
//
// Pure deterministic: same input → identical output. No LLM. No external calls.
// Operates on the v1.1.3 LaneProfile + the v1.0.x synthesizer outputs already
// computed in BlueprintData.

import type { LaneProfile, CognitiveLane, ConstraintLane } from './lane-derivation'
import type { SessionState } from '../page'
import { detectVersionOneForm } from './structural-primitives'

// ===========================================================================
// Public types
// ===========================================================================

export type StrategyCompression = {
  coreDirection: string
  whatToBuildFirst: string
  whatThisProves: string
  immediateAction: string[]
  constraint: string
  whyThisWorks: string
}

// Subset of BlueprintData the compressor needs (avoids cross-import cycles).
export type CompressionBlueprint = {
  capability: string[]
  problemSpace: string
  idealUser: string[]
  versionOne: string[]
  laneProfile?: LaneProfile
}

// ===========================================================================
// Constraint templates
// ===========================================================================

const constraintByLane: Record<ConstraintLane, string> = {
  structure_gap:
    'Do not write more structure before one concrete instance exists to organize.',
  legibility_gap:
    'Do not explain more. Show the artifact instead.',
  scope_gap:
    'Do not expand the first build beyond one shippable, testable thing.',
  proof_gap:
    'Do not skip user contact. Proof requires one real user, not more planning.',
  direction_gap:
    'Do not commit to one direction before testing two narrow hypotheses against real input.',
}

const constraintDefault =
  'Do not build more than one bounded, testable thing before getting real signal back.'

// ===========================================================================
// What This Proves templates
// ===========================================================================

const provesByConstraint: Record<ConstraintLane, string> = {
  structure_gap:
    'It proves that the underlying pattern produces something usable when committed to a specific shape.',
  legibility_gap:
    "It proves that the work others can't yet see can be made externally readable in a single concrete form.",
  scope_gap:
    'It proves that the broader vision actually delivers value when forced into one shippable artifact.',
  proof_gap:
    'It proves whether the value is real enough to test against actual users or buyers.',
  direction_gap:
    'It proves which of the possible directions actually generates traction when concretely tested.',
}

const provesDefault =
  'It proves that the core idea works in a real, testable form — small enough to finish, specific enough to learn from.'

// ===========================================================================
// Why This Works templates (cognitive × constraint pairs, then cognitive only)
// ===========================================================================

const whyByPair: Record<string, string> = {
  'meta_orchestrator|scope_gap':
    "Systems thinking pulls toward orchestrating everything before shipping anything. Picking one node and finishing it short-circuits that pattern — the meta-system can wait for the first node to prove value.",
  'high_capability_low_legibility|legibility_gap':
    "The capability is real; legibility is the bottleneck. A single shipped artifact creates the external readability that internal sophistication cannot.",
  'abstract_systems_thinker|structure_gap':
    "The structure already exists internally. What's missing is a forced commitment that pulls it into external form — the first concrete build is that commitment.",
  'ambitious_unstructured_builder|scope_gap':
    "Ambition rarely fails from being too small. It fails from being too large to ever ship. One shipped piece beats ten unshipped.",
  'understructured_operator|legibility_gap':
    "The activity is already real. Naming one thread of it precisely is the move that makes the whole body of work visible — to others, and to you.",
}

const whyByCognitive: Record<CognitiveLane, string> = {
  concrete_builder:
    'Build intent is already aligned with form. The remaining work is narrowing — one shipped piece, then iterate from real signal.',
  abstract_systems_thinker:
    'Pattern recognition is the strength; structural commitment is the missing complement. Force the abstraction into one concrete shape and the rest follows.',
  meta_orchestrator:
    'Cross-system thinking is most powerful when grounded in one finished thread. Build the thread first; generalize after.',
  understructured_operator:
    'Activity is real but unnamed. Naming one piece precisely creates the surface the rest of the work can attach to.',
  high_capability_low_legibility:
    "Capability isn't the bottleneck. External form is. Shipping one artifact converts internal sophistication into something others can read.",
  ambitious_unstructured_builder:
    'Ambition matched with form is durable; ambition without form dissipates. One shipped artifact gives the ambition a vehicle.',
}

const whyDefault =
  'Picking one bounded thing and shipping it is what converts insight into momentum. The path forward is execution, not more analysis.'

// ===========================================================================
// Helpers
// ===========================================================================

function pickUserClass(blueprint: CompressionBlueprint): string {
  // Prefer a concise user class derived from idealUser bullet 1, otherwise
  // fall back to a profile-aware default.
  const firstIdealUser = (blueprint.idealUser ?? [])[0] ?? ''
  const stripped = firstIdealUser
    .replace(/^The ideal user is\s+/i, '')
    .replace(/\.$/, '')
    .trim()
  if (stripped.length > 0 && stripped.length <= 80) return stripped

  const cog = blueprint.laneProfile?.cognitive ?? null
  if (cog === 'high_capability_low_legibility') return 'capable people whose work is not yet externally legible'
  if (cog === 'meta_orchestrator') return 'people building across multiple systems'
  if (cog === 'abstract_systems_thinker') return 'systems thinkers who need committed external form'
  if (cog === 'understructured_operator') return 'capable operators whose work is not yet named'
  if (cog === 'ambitious_unstructured_builder') return 'ambitious builders without committed form'
  if (cog === 'concrete_builder') return 'a specific user with a specific problem'
  return 'one specific person with one specific problem'
}

function pickFormNoun(state: SessionState): string | null {
  const text = (state.versionOne ?? '').trim()
  if (!text) return null
  return detectVersionOneForm(text)
}

function pickTransformationGoal(state: SessionState): string {
  const after = (state.transformationAfter ?? '').trim()
  if (!after) return 'find a clear path forward'
  // Take the first clause if user wrote multiple sentences.
  const firstClause = after.split(/[.\n]/)[0].trim()
  if (firstClause.length > 0 && firstClause.length <= 100) return firstClause.toLowerCase()
  return 'find a clear path forward'
}

// ---- Core Direction ----

function composeCoreDirection(
  formNoun: string | null,
  userClass: string,
  goal: string,
): string {
  const system = formNoun ?? 'first concrete version of your idea'
  const first = system.trim().toLowerCase().charAt(0)
  const art = /[aeiou]/.test(first) ? 'an' : 'a'
  return `You are building ${art} ${system} for ${userClass} so that they can ${goal}.`
}

// ---- What To Build First ----

const firstBuildByForm: Record<string, (target: string) => string> = {
  'digital brain': () =>
    "Build the smallest single instance of a digital brain — one project's worth of pattern surfacing, end to end, before generalizing across all projects.",
  'orchestration layer': () =>
    'Build one orchestrated thread between two existing systems — not the full layer.',
  'intelligence layer': () =>
    'Build one intelligence query that produces useful output for one specific case — not the full layer.',
  'meta-system': () =>
    'Build one concrete instance of the meta-system, not the meta-system itself.',
  'developer operating system': () =>
    "Build one workflow inside the developer operating system, end to end, before adding others.",
  'portfolio intelligence engine': () =>
    'Build one project-level slice of the portfolio engine before generalizing.',
  'knowledge graph': () =>
    "Build one fully-connected slice of the graph for one domain before expanding.",
  'CLI': (t) =>
    `Build a v1 CLI with one command that produces useful output for ${t}. No flags, no config, no plugins yet.`,
  'web app': (t) =>
    `Build a single-page web app that does one thing for ${t}. One input, one output, no user accounts yet.`,
  'mobile app': (t) =>
    `Build a single screen of the mobile app that does one thing for ${t}. One input, one output, no auth.`,
  'platform': (t) =>
    `Build the smallest instance of the platform's core action — one ${t}, one output, one repeatable transaction.`,
  'dashboard': (t) =>
    `Build one chart that answers one specific question for ${t}, before adding others.`,
  'course': (t) =>
    `Write the first lesson and ship it to ${t}. No syllabus, no framework — one lesson that stands on its own.`,
  'workshop': (t) =>
    `Run one workshop with ${t}, live, before designing a curriculum.`,
  'service': (t) =>
    `Sell and deliver the service to one specific ${t} once, end to end, before productizing.`,
  'guide': (t) =>
    `Write one chapter of the guide and give it to ${t}. Wait for the response before writing more.`,
  'newsletter': (t) =>
    `Send issue 1 to ${t} this week. Issue 2 only after responses come in.`,
}

function composeFirstBuild(formNoun: string | null, userClass: string): string {
  if (formNoun && firstBuildByForm[formNoun]) {
    return firstBuildByForm[formNoun](userClass)
  }
  if (formNoun) {
    return `Build the smallest version of the ${formNoun} — one ${userClass.split(/\s+/).slice(0, 4).join(' ')} can use it for one specific outcome before any expansion.`
  }
  return `Build the smallest concrete artifact your capability produces. One tangible deliverable for ${userClass}, before generalizing into a larger system.`
}

// ---- What This Proves ----

function composeProves(constraint: ConstraintLane | null): string {
  if (constraint === null) return provesDefault
  return provesByConstraint[constraint]
}

// ---- Immediate Action ----

function parseImmediateActions(immediate: string): string[] {
  if (!immediate.trim()) return []
  // Split on newlines, then on sentence boundaries; trim and dedupe.
  const raw = immediate
    .split(/\r?\n+/)
    .flatMap((line) => line.split(/(?<=\.)\s+/))
    .map((s) => s.trim().replace(/\.$/, ''))
    .filter((s) => s.length > 0)
  // Cap at 4 entries; require minimum length to filter junk fragments.
  return raw.filter((s) => s.length >= 5).slice(0, 4)
}

function deriveDefaultActions(
  formNoun: string | null,
  userClass: string,
): string[] {
  const target = userClass.split(/\s+/).slice(0, 5).join(' ')
  if (formNoun) {
    return [
      `Sketch a one-page plan of the ${formNoun}'s core flow, with ${target} as the user`,
      `Identify one specific person who fits ${target} and could try it this week`,
      `Build the smallest piece that produces one usable output`,
      `Show the result to that one person and capture what they actually do with it`,
    ]
  }
  return [
    `Name one specific instance of your capability you could ship in 72 hours`,
    `Identify one specific person who would benefit from it`,
    `Sketch the minimum artifact that delivers it`,
    `Send it to that one person and observe their reaction`,
  ]
}

function composeImmediateAction(
  state: SessionState,
  formNoun: string | null,
  userClass: string,
): string[] {
  const userTyped = parseImmediateActions(state.pathForward?.immediate ?? '')
  if (userTyped.length >= 2) return userTyped
  // Supplement the user's typed actions with derived defaults to reach 2–4.
  const defaults = deriveDefaultActions(formNoun, userClass)
  const merged = [...userTyped]
  for (const d of defaults) {
    if (merged.length >= 4) break
    if (!merged.includes(d)) merged.push(d)
  }
  return merged.slice(0, 4)
}

// ---- Constraint ----

function composeConstraint(constraint: ConstraintLane | null): string {
  if (constraint === null) return constraintDefault
  return constraintByLane[constraint]
}

// ---- Why This Works ----

function composeWhyThisWorks(
  cognitive: CognitiveLane | null,
  constraint: ConstraintLane | null,
): string {
  if (cognitive && constraint) {
    const pair = whyByPair[`${cognitive}|${constraint}`]
    if (pair) return pair
  }
  if (cognitive) return whyByCognitive[cognitive]
  return whyDefault
}

// ===========================================================================
// Public API
// ===========================================================================

export function compressStrategy(
  blueprint: CompressionBlueprint,
  state: SessionState,
): StrategyCompression {
  const userClass = pickUserClass(blueprint)
  const formNoun = pickFormNoun(state)
  const goal = pickTransformationGoal(state)
  const cognitive = blueprint.laneProfile?.cognitive ?? null
  const constraint = blueprint.laneProfile?.constraint ?? null

  return {
    coreDirection: composeCoreDirection(formNoun, userClass, goal),
    whatToBuildFirst: composeFirstBuild(formNoun, userClass),
    whatThisProves: composeProves(constraint),
    immediateAction: composeImmediateAction(state, formNoun, userClass),
    constraint: composeConstraint(constraint),
    whyThisWorks: composeWhyThisWorks(cognitive, constraint),
  }
}
