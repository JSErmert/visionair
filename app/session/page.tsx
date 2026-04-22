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
import Transformation, {
  structuralizeBefore,
  structuralizeAfter,
} from './flow/transformation'
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

// Capability synthesizer (v1.0.11). Decoupled from synthesizeReflection.
// Produces capability statements about what the user can reliably do for
// someone else, never reflection-style meta-commentary about the input.
// Deterministic, regex-based, no LLM. Inline per pass scope.

type CapabilityTheme =
  | 'structure'
  | 'clarity'
  | 'guiding'
  | 'building'
  | 'teaching'
  | 'analysis'
  | 'problemSolving'
  | 'translating'

const capabilityThemePatterns: Record<CapabilityTheme, RegExp[]> = {
  structure: [/\bstructur/i, /\borganiz/i, /\bsystem/i, /\bframework/i, /\border\b/i, /\bscope/i, /\bplan/i],
  clarity: [/\bclar/i, /\bclear/i, /\bfog/i, /\bunclear/i, /\bvague/i],
  guiding: [/\bhelp/i, /\bguid/i, /\bsupport/i, /\bmentor/i, /\bcoach/i, /\badvis/i, /\btutor/i, /\bhold(?:ing)?\s+space\b/i, /\bpresence\b/i, /\bretreat/i, /\bsession/i, /\bworkshop/i, /\bfacilitat/i],
  building: [/\bbuild/i, /\bcreat/i, /\bmak(?:e|ing|er)\b/i, /\bdesign/i, /\bdevelop/i, /\bship/i, /\bproduct/i, /\bprototyp/i, /\blaunch/i, /\bMRR\b/i, /\bSaaS\b/i, /\bv1\b/i],
  teaching: [/\bteach/i, /\blearn/i, /\beducat/i, /\bexplain/i, /\btutor/i],
  analysis: [/\banalyz/i, /\bpattern/i, /\bunderstand/i, /\bbreak\s*down/i, /\bfigure\s+(?:it\s+)?out/i, /\bdebug/i, /\btrac(?:e|ing)\b/i, /\bdiagnos/i],
  problemSolving: [/\bfix/i, /\bsolv/i, /\bproblem/i, /\bissue/i, /\bdebug/i, /\bdysfunctional/i, /\bbroken/i, /\bbottleneck/i],
  translating: [/\btranslat/i, /\bbridg/i, /\bconnect/i, /\binterpret/i, /\bconvert/i],
}

const capabilityTargetNouns: { re: RegExp; canonical: string }[] = [
  { re: /\b(?:back-?end\s+)?engineers?\b|\bdevelopers?\b|\bSREs?\b/i, canonical: 'engineers' },
  { re: /\bfounders?\b|\bentrepreneurs?\b/i, canonical: 'founders' },
  { re: /\bstudents?\b|\bfreshm[ae]n\b/i, canonical: 'students' },
  { re: /\bsmall\s+business(?:es)?\b|\bbusiness\s+owners?\b|\bartisans?\b|\bbakers?\b/i, canonical: 'small business owners' },
  { re: /\bdesigners?\b/i, canonical: 'designers' },
  { re: /\bconsultants?\b/i, canonical: 'consultants' },
  { re: /\bcoaches?\b/i, canonical: 'coaches' },
  { re: /\bteams?\b/i, canonical: 'teams' },
  { re: /\bclients?\b/i, canonical: 'clients' },
  { re: /\bcustomers?\b/i, canonical: 'customers' },
  { re: /\bwomen\b/i, canonical: 'women' },
  { re: /\bnontechnical\b|\bnon-?technical\b/i, canonical: 'nontechnical builders' },
  { re: /\bbeginners?\b/i, canonical: 'beginners' },
  { re: /\boverwhelmed\b/i, canonical: 'overwhelmed people' },
  { re: /\bstuck\b/i, canonical: 'stuck people' },
  { re: /\b(?:feel(?:s|ing)?\s+)?lost\b/i, canonical: 'people who feel lost' },
  { re: /\b(?:feel(?:s|ing)?\s+)?confused\b/i, canonical: 'confused people' },
  { re: /\bscattered\b/i, canonical: 'scattered or fragmented people' },
  { re: /\b(?:feel(?:s|ing)?\s+)?anxious\b|\bburned[\s-]?out\b|\bburn[\s-]?out\b/i, canonical: 'burned-out or anxious people' },
  { re: /\bdisconnected\b/i, canonical: 'disconnected people' },
]

const capabilityActionByTheme: Record<CapabilityTheme, string> = {
  structure: 'bring scattered or unstructured situations into a more organized, usable form',
  clarity: 'move foggy or ambiguous situations toward clarity they can act on',
  guiding: 'move from a stuck or unsupported state toward something more workable for them',
  building: 'turn ideas and signals into something real, shaped, and externally observable',
  teaching: 'understand complex or unfamiliar material in usable terms',
  analysis: 'see patterns and structure inside messy or opaque situations',
  problemSolving: 'move broken situations toward a working state',
  translating: 'convert unclear, complex, or emotional input into structured, operational form',
}

const capabilityStrengthByTheme: Record<CapabilityTheme, string> = {
  structure: 'Your strength is in turning scattered material into structure others can follow.',
  clarity: 'Your strength is in turning fog into clarity others can use.',
  guiding: 'Your strength is in turning a stuck or unsupported moment into a workable next step for the person you are with.',
  building: 'Your strength is in turning possibility into something real and externally testable.',
  teaching: 'Your strength is in turning difficult material into operational understanding.',
  analysis: 'Your strength is in making hidden structure visible so decisions become easier.',
  problemSolving: 'Your strength is in moving broken situations toward working ones with less wasted effort.',
  translating: 'Your strength is in interpreting complex or emotional input and converting it into operational form.',
}

const capabilityValueByTheme: Record<CapabilityTheme, string> = {
  structure: 'The value you create is structure where there was previously fragmentation.',
  clarity: 'The value you create is named clarity where there was previously fog.',
  guiding: 'The value you create is forward movement for someone who could not access it on their own.',
  building: 'The value you create is something real, shipped, and observable where there was previously only possibility.',
  teaching: 'The value you create is operational understanding where there was previously confusion.',
  analysis: 'The value you create is visible structure inside what previously looked like noise.',
  problemSolving: 'The value you create is a working state where there was previously a broken one.',
  translating: 'The value you create is structured form where there was previously emotional or unclear input.',
}

function detectCapabilityThemes(text: string): CapabilityTheme[] {
  const scored: { theme: CapabilityTheme; score: number }[] = []
  for (const theme of Object.keys(capabilityThemePatterns) as CapabilityTheme[]) {
    let score = 0
    for (const re of capabilityThemePatterns[theme]) {
      const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
      const matches = text.match(g)
      if (matches) score += matches.length
    }
    if (score > 0) scored.push({ theme, score })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.map((s) => s.theme)
}

function detectCapabilityTargets(text: string): string[] {
  const found: string[] = []
  const seen = new Set<string>()
  for (const { re, canonical } of capabilityTargetNouns) {
    if (re.test(text) && !seen.has(canonical)) {
      seen.add(canonical)
      found.push(canonical)
    }
  }
  return found
}

function synthesizeCapability(answers: string[]): string[] {
  const joined = answers.filter(Boolean).join(' ').trim()

  if (!joined) {
    return [
      'Capability has not yet been named in operational terms — the current answers point to a real pattern but it has not been translated into a repeatable external capability.',
      'What matters now is identifying one specific person who benefits and one specific thing that becomes easier because of this person.',
      'Once that pair is named, the capability becomes externally describable and the rest of the blueprint can build on it.',
    ]
  }

  const themes = detectCapabilityThemes(joined)
  const targets = detectCapabilityTargets(joined)

  const bullets: string[] = []

  // Bullet 1 — capability statement: target + action
  if (themes.length > 0) {
    const target = targets[0] ?? 'others'
    bullets.push(`You can reliably help ${target} ${capabilityActionByTheme[themes[0]]}.`)
  } else {
    bullets.push(
      'You can reliably produce real value for the people you work with — the specific shape of that value has not yet been named in operational terms.'
    )
  }

  // Bullet 2 — strength statement (second theme if distinct, else target-paired phrasing)
  if (themes.length > 1) {
    bullets.push(capabilityStrengthByTheme[themes[1]])
  } else if (themes.length === 1 && targets.length > 1) {
    bullets.push(
      `Your work tends to land specifically with ${targets[0]} and ${targets[1]} — the kind of person whose situation rewards the value you create.`
    )
  } else if (themes.length === 1) {
    bullets.push(capabilityStrengthByTheme[themes[0]])
  } else {
    bullets.push(
      'Your strength is in producing externally observable change for the people you work with, not just internal insight for yourself.'
    )
  }

  // Bullet 3 — value statement (top theme)
  if (themes.length > 0) {
    bullets.push(capabilityValueByTheme[themes[0]])
  } else {
    bullets.push(
      'The value you create is real but is still phrased experientially — naming it operationally is the next move.'
    )
  }

  // Bullet 4 — only when content is rich (3+ themes OR 2+ targets)
  if (themes.length >= 3 || targets.length >= 2) {
    const secondaryTarget = targets.length > 1 ? targets[1] : (targets[0] ?? 'people in that situation')
    bullets.push(
      `The pattern is recognizable across multiple situations — when ${secondaryTarget} encounter the kind of problem you address, you tend to be the person who turns it into a usable next step.`
    )
  }

  return bullets
}

// VersionOne synthesizer (v1.0.12). Build-definition surface — produces
// concrete form/scope/proof bullets, not after-state structural fallback.
// Reuses detectCapabilityTargets from above. Inline per pass scope.

const versionOneFormPatterns: { re: RegExp; canonical: string }[] = [
  // Multi-word forms first so they match before single-word fallbacks
  { re: /\bweb\s+app\b/i, canonical: 'web app' },
  { re: /\bmobile\s+app\b/i, canonical: 'mobile app' },
  { re: /\bemail\s+course\b/i, canonical: 'email course' },
  { re: /\bemail\s+sequence\b/i, canonical: 'email sequence' },
  { re: /\bonboarding\s+(?:flow|sequence)\b/i, canonical: 'onboarding flow' },
  { re: /\bintake\s+(?:flow|form)\b/i, canonical: 'intake flow' },
  { re: /\bnotion\s+template\b/i, canonical: 'Notion template' },
  { re: /\blanding\s+page\b/i, canonical: 'landing page' },
  { re: /\b(?:figma\s+)?prototype\b/i, canonical: 'prototype' },
  { re: /\bbrand\s+sprint\b/i, canonical: 'brand sprint' },
  // Single-word forms
  { re: /\bCLI\b/i, canonical: 'CLI' },
  { re: /\bSDK\b/i, canonical: 'SDK' },
  { re: /\bAPI\b/i, canonical: 'API' },
  { re: /\bdashboard\b/i, canonical: 'dashboard' },
  { re: /\bplatform\b/i, canonical: 'platform' },
  { re: /\btemplate\b/i, canonical: 'template' },
  { re: /\bcourse\b/i, canonical: 'course' },
  { re: /\bworkshop\b/i, canonical: 'workshop' },
  { re: /\bsprint\b/i, canonical: 'sprint' },
  { re: /\bservice\b/i, canonical: 'service' },
  { re: /\bsession\b/i, canonical: 'session' },
  { re: /\bgroup\b/i, canonical: 'group' },
  { re: /\bcohort\b/i, canonical: 'cohort' },
  { re: /\bnewsletter\b/i, canonical: 'newsletter' },
  { re: /\bplaybook\b/i, canonical: 'playbook' },
  { re: /\bguide\b/i, canonical: 'guide' },
  { re: /\bframework\b/i, canonical: 'framework' },
  { re: /\bprogram\b/i, canonical: 'program' },
  { re: /\bsite\b/i, canonical: 'site' },
  { re: /\bpage\b/i, canonical: 'page' },
  { re: /\bdiagnostic\b/i, canonical: 'diagnostic' },
  { re: /\bengagement\b/i, canonical: 'engagement' },
  { re: /\baudit\b/i, canonical: 'audit' },
  { re: /\btool\b/i, canonical: 'tool' },
  { re: /\bapp\b/i, canonical: 'app' },
]

const versionOneActionVerbs: { re: RegExp; verb: string }[] = [
  { re: /\bguid(?:e|es|ed|ing)\b/i, verb: 'guides' },
  { re: /\bstructur(?:e|es|ed|ing)\b/i, verb: 'structures' },
  { re: /\bteach(?:es|ing)?\b/i, verb: 'teaches' },
  { re: /\borganiz(?:e|es|ed|ing)\b/i, verb: 'organizes' },
  { re: /\bdraft(?:s|ed|ing)?\b/i, verb: 'drafts' },
  { re: /\btrack(?:s|ed|ing)?\b/i, verb: 'tracks' },
  { re: /\bconnect(?:s|ed|ing)?\b/i, verb: 'connects' },
  { re: /\bautomat(?:e|es|ed|ing)\b/i, verb: 'automates' },
  { re: /\bhelp(?:s|ed|ing)?\b/i, verb: 'helps' },
  { re: /\bwalk(?:s|ed|ing)?\s+through\b/i, verb: 'walks through' },
  { re: /\bgenerat(?:e|es|ed|ing)\b/i, verb: 'generates' },
  { re: /\bingest(?:s|ed|ing)?\b/i, verb: 'ingests' },
  { re: /\boutput(?:s|ted|ting)?\b/i, verb: 'outputs' },
  { re: /\btranslat(?:e|es|ed|ing)\b/i, verb: 'translates' },
  { re: /\bevaluat(?:e|es|ed|ing)\b/i, verb: 'evaluates' },
  { re: /\bsort(?:s|ed|ing)?\b/i, verb: 'sorts' },
  { re: /\bcompar(?:e|es|ed|ing)\b/i, verb: 'compares' },
  { re: /\bsurfac(?:e|es|ed|ing)\b/i, verb: 'surfaces' },
  { re: /\bmap(?:s|ped|ping)?\b/i, verb: 'maps' },
  { re: /\bdiagnos(?:e|es|ed|ing)\b/i, verb: 'diagnoses' },
  { re: /\bclassif(?:y|ies|ied|ying)\b/i, verb: 'classifies' },
  { re: /\brender(?:s|ed|ing)?\b/i, verb: 'renders' },
  { re: /\bhighlight(?:s|ed|ing)?\b/i, verb: 'highlights' },
  { re: /\bdefin(?:e|es|ed|ing)\b/i, verb: 'defines' },
  { re: /\bidentif(?:y|ies|ied|ying)\b/i, verb: 'identifies' },
  { re: /\bdeliver(?:s|ed|ing)?\b/i, verb: 'delivers' },
  { re: /\breview(?:s|ed|ing)?\b/i, verb: 'reviews' },
]

const verbsThatTakeDirectObject = new Set([
  'helps', 'guides', 'teaches', 'walks through', 'mentors', 'coaches', 'reviews',
])

const versionOneFallback = [
  'Version one has not yet been named in terms of what it is.',
  'The current input points toward a real build, but the form and boundary are still undefined.',
  'What it proves first is whether one concrete form and one clear boundary can be named and tested.',
]

function detectVersionOneForm(text: string): string | null {
  for (const { re, canonical } of versionOneFormPatterns) {
    if (re.test(text)) return canonical
  }
  return null
}

function detectVersionOneAction(text: string): string | null {
  let best: { verb: string; index: number } | null = null
  for (const { re, verb } of versionOneActionVerbs) {
    const m = text.search(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'))
    if (m >= 0 && (best === null || m < best.index)) {
      best = { verb, index: m }
    }
  }
  return best?.verb ?? null
}

function detectVersionOneScope(text: string): string | null {
  // Multiple "no X" / "without X" exclusions take priority — they indicate deliberate scope choices
  const exclusions: string[] = []
  const exclusionRe = /\b(?:no|without)\s+([a-z][a-z]*(?:[\s-]+[a-z][a-z]+)?)\b/gi
  let m: RegExpExecArray | null
  while ((m = exclusionRe.exec(text)) !== null) {
    const term = m[1].toLowerCase().replace(/\s+/g, ' ')
    if (!['one', 'need', 'longer', 'sense', 'idea', 'matter'].includes(term)) {
      exclusions.push(term)
    }
  }
  if (exclusions.length > 0) {
    const list = exclusions.slice(0, 3).map((e) => `no ${e}`).join(', ')
    return list
  }

  // Duration windows
  const durMatch = text.match(/\b(\d+)[\s-]*(week|day|month|year)s?\b/i)
  if (durMatch) return `a ${durMatch[1]}-${durMatch[2]} window`

  // Participant cap
  const capMatch = text.match(/\bcap(?:ped)?\s+at\s+(\d+)/i)
  if (capMatch) return `a deliberate cap at ${capMatch[1]} participants`

  // Fixed scope/price
  if (/\bfixed\s+(?:price|scope|cost)\b/i.test(text)) return 'a fixed scope and price'

  // Static scope phrases
  if (/\bsmallest\s+meaningful\b/i.test(text)) return 'the smallest meaningful version'
  if (/\bsmallest\b/i.test(text)) return 'the smallest possible version'
  if (/\bsimplest\b/i.test(text)) return 'the simplest possible version'
  if (/\bminimum\b|\bminimal\b/i.test(text)) return 'a minimum viable version'
  if (/\blightweight\b/i.test(text)) return 'a deliberately lightweight version'
  if (/\bv1\b/i.test(text)) return 'a v1 release rather than a full product'
  if (/\bonly\b|\bjust\b/i.test(text)) return 'a deliberately narrow surface'
  if (/\bbounded\b|\blimited\b/i.test(text)) return 'an explicitly bounded scope'

  return null
}

function composeVersionOneFormBullet(
  form: string | null,
  action: string | null,
  target: string | null
): string {
  if (form && action && target) {
    if (verbsThatTakeDirectObject.has(action)) {
      return `Version one is a ${form} that ${action} ${target}.`
    }
    return `Version one is a ${form} that ${action} for ${target}.`
  }
  if (form && target) return `Version one is a ${form} for ${target}.`
  if (form) return `Version one is a ${form}.`
  if (target) return `Version one is a focused build aimed at ${target}.`
  return 'Version one is a build whose form has not yet been explicitly named.'
}

function composeVersionOneScopeBullet(scope: string | null): string {
  if (!scope) {
    return 'Scope is not yet explicitly bounded — naming what is deliberately excluded is the next move.'
  }
  if (scope.startsWith('no ')) {
    return `Scope is intentionally bounded by what is excluded: ${scope}.`
  }
  return `Scope is intentionally bounded to ${scope}.`
}

function composeVersionOneProofBullet(text: string): string {
  if (/\bvalidat/i.test(text)) {
    return 'What it proves is whether the value is real enough to validate before further investment.'
  }
  if (/\bpay\b|\bcharge\b|\bprice\b|\$\d/i.test(text)) {
    return 'What it proves is whether real users will actually pay for this version.'
  }
  if (/\b(?:see\s+if|test\s+(?:if|whether)|test\s+with)\b/i.test(text)) {
    return 'What it proves is whether the smallest version of the offer matches what users actually need.'
  }
  return 'What it proves is that the core transformation can happen in a real, testable form.'
}

function synthesizeVersionOne(text: string): string[] {
  const trimmed = text.trim()
  if (!trimmed) return versionOneFallback

  const form = detectVersionOneForm(trimmed)
  const scope = detectVersionOneScope(trimmed)
  const action = detectVersionOneAction(trimmed)
  const targets = detectCapabilityTargets(trimmed)

  // Fallback only when neither form nor scope is detected
  if (!form && !scope) return versionOneFallback

  return [
    composeVersionOneFormBullet(form, action, targets[0] ?? null),
    composeVersionOneScopeBullet(scope),
    composeVersionOneProofBullet(trimmed),
  ]
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

  const beforeBullets = structuralizeBefore(before).slice(0, 2)
  const afterBullets = structuralizeAfter(after).slice(0, 2)

  return `Before — ${beforeBullets.join(' ')} After — ${afterBullets.join(' ')}`
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

  // Blueprint sources of truth: synthesized outputs, not raw user input.
  // - capability: synthesized reflection over the joined capability answers
  // - problemSpace: already structured (radio → fixed phrase)
  // - idealUser: structuralized via the "before" translator (state-of-user content)
  // - transformation: already synthesized via formatTransformation (v1.0.7)
  // - opportunityForm: already structured (radio → fixed phrase)
  // - versionOne: structuralized via the "after" translator (resolved-state content)
  // - pathForward: action content, intentionally not run through state translators
  //   (would replace specific actions with generic state fallbacks); the
  //   immediate/near-term/later bucketing is itself the structural shape
  const blueprintData = {
    capability: synthesizeCapability(state.capability).join(' '),
    problemSpace: formatProblemSpace(state.problemSpace),
    idealUser: state.idealUser.trim()
      ? structuralizeBefore(state.idealUser).join(' ')
      : '',
    transformation: formatTransformation(
      state.transformationBefore,
      state.transformationAfter
    ),
    opportunityForm: formatOpportunityForm(state.opportunityForm),
    versionOne: synthesizeVersionOne(state.versionOne).join(' '),
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
