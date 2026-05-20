// Synthesizers (v1.0.17). The five public synthesis functions plus their
// composers, fallback arrays, and template Records. Imports primitives
// (vocabulary tables + low-level detectors) from ./structural-primitives.
//
// Module boundary: anything that turns detector output into a user-facing
// string[] bullet array lives here. Vocabulary and pattern-scan functions
// live in primitives.

import {
  type Theme,
  themePatterns,
  detectThemes,
  detectCapabilityTargets,
  capabilityTargetNouns,
  emphasisPatterns,
  detectVersionOneForm,
  detectVersionOneAction,
  detectVersionOneScope,
  verbsThatTakeDirectObject,
  detectIdealUserRole,
  detectIdealUserBlocker,
  detectIdealUserContext,
  translateState,
  beforeTranslations,
  afterTranslations,
} from './structural-primitives'
import { type LaneProfile, getLaneAwareFallback } from './lane-derivation'

// ===========================================================================
// Capability synthesizer (v1.0.11)
// ===========================================================================

const capabilityActionByTheme: Record<Theme, string> = {
  structure: 'bring scattered or unstructured situations into a more organized, usable form',
  clarity: 'move foggy or ambiguous situations toward clarity they can act on',
  guiding: 'move from a stuck or unsupported state toward something more workable for them',
  building: 'turn ideas and signals into something real, shaped, and externally observable',
  teaching: 'understand complex or unfamiliar material in usable terms',
  analysis: 'see patterns and structure inside messy or opaque situations',
  problemSolving: 'move broken situations toward a working state',
  translating: 'convert unclear, complex, or emotional input into structured, operational form',
}

const capabilityStrengthByTheme: Record<Theme, string> = {
  structure: 'Your strength is in turning scattered material into structure others can follow.',
  clarity: 'Your strength is in turning fog into clarity others can use.',
  guiding: 'Your strength is in turning a stuck or unsupported moment into a workable next step for the person you are with.',
  building: 'Your strength is in turning possibility into something real and externally testable.',
  teaching: 'Your strength is in turning difficult material into operational understanding.',
  analysis: 'Your strength is in making hidden structure visible so decisions become easier.',
  problemSolving: 'Your strength is in moving broken situations toward working ones with less wasted effort.',
  translating: 'Your strength is in interpreting complex or emotional input and converting it into operational form.',
}

const capabilityValueByTheme: Record<Theme, string> = {
  structure: 'The value you create is structure where there was previously fragmentation.',
  clarity: 'The value you create is named clarity where there was previously fog.',
  guiding: 'The value you create is forward movement for someone who could not access it on their own.',
  building: 'The value you create is something real, shipped, and observable where there was previously only possibility.',
  teaching: 'The value you create is operational understanding where there was previously confusion.',
  analysis: 'The value you create is visible structure inside what previously looked like noise.',
  problemSolving: 'The value you create is a working state where there was previously a broken one.',
  translating: 'The value you create is structured form where there was previously emotional or unclear input.',
}

// v1.0.24 — per-answer weighting helpers.
// Four directive-mandated signals: repetition, emphasis, specificity, domain keywords.

const EMPHASIS_CAP = 3
const DOMAIN_KEYWORD_CAP = 5
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
  'to', 'of', 'in', 'for', 'on', 'at', 'with', 'by', 'from', 'as', 'it', 'this',
  'that', 'these', 'those', 'i', 'me', 'my', 'you', 'your', 'we', 'our', 'they',
  'their', 'them', 'he', 'she', 'him', 'her', 'his', 'hers', 'do', 'does', 'did',
  'can', 'could', 'would', 'should', 'will', 'have', 'has', 'had', 'not',
])

function countEmphasis(text: string): number {
  let count = 0
  for (const re of emphasisPatterns) if (re.test(text)) count++
  return count
}

function countDomainKeywords(text: string): number {
  let count = 0
  for (const { re } of capabilityTargetNouns) if (re.test(text)) count++
  for (const theme of Object.keys(themePatterns) as Theme[]) {
    for (const re of themePatterns[theme]) if (re.test(text)) count++
  }
  return count
}

function computeSpecificity(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  const wordCount = trimmed.split(/\s+/).length
  if (wordCount < 3) return 0
  const hits = countDomainKeywords(text)
  return Math.min(1.0, hits / Math.sqrt(wordCount))
}

function extractMeaningfulTokens(text: string): Set<string> {
  const out = new Set<string>()
  for (const raw of text.toLowerCase().split(/\W+/)) {
    if (raw.length >= 4 && !STOPWORDS.has(raw)) out.add(raw)
  }
  return out
}

function computeRepetitionMap(answers: string[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const a of answers) {
    if (!a.trim()) continue
    for (const token of extractMeaningfulTokens(a)) {
      counts.set(token, (counts.get(token) ?? 0) + 1)
    }
  }
  return counts
}

function computeAnswerWeight(
  answer: string,
  repetitionCounts: Map<string, number>
): number {
  const trimmed = answer.trim()
  if (!trimmed) return 0
  const emphasis = Math.min(countEmphasis(answer), EMPHASIS_CAP)
  const specificity = computeSpecificity(answer)
  const domainKeywords = Math.min(countDomainKeywords(answer), DOMAIN_KEYWORD_CAP)
  const base = 1.0 + 0.2 * emphasis + 0.2 * specificity + 0.1 * domainKeywords
  const tokens = extractMeaningfulTokens(answer)
  let sharedCount = 0
  for (const t of tokens) if ((repetitionCounts.get(t) ?? 0) >= 2) sharedCount++
  const repetitionBoost = tokens.size > 0
    ? Math.min(0.5, sharedCount / tokens.size)
    : 0
  return base * (1 + repetitionBoost)
}

function detectWeightedThemes(answers: string[]): Theme[] {
  const repetitionCounts = computeRepetitionMap(answers)
  const scores = new Map<Theme, number>()
  for (const answer of answers) {
    if (!answer.trim()) continue
    const weight = computeAnswerWeight(answer, repetitionCounts)
    if (weight <= 0) continue
    for (const theme of Object.keys(themePatterns) as Theme[]) {
      let matchCount = 0
      for (const re of themePatterns[theme]) {
        const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
        const m = answer.match(g)
        if (m) matchCount += m.length
      }
      if (matchCount > 0) {
        scores.set(theme, (scores.get(theme) ?? 0) + weight * matchCount)
      }
    }
  }
  return Array.from(scores.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([t]) => t)
}

export function synthesizeCapability(answers: string[], laneProfile?: LaneProfile): string[] {
  const joined = answers.filter(Boolean).join(' ').trim()

  if (!joined) {
    // Lane-aware fallback only when confidence === 'high' AND a populated cell exists
    const laneFallback = getLaneAwareFallback(laneProfile)
    if (laneFallback?.capability) return laneFallback.capability
    return [
      'Capability has not yet been named in operational terms — the current answers point to a real pattern but it has not been translated into a repeatable external capability.',
      'What matters now is identifying one specific person who benefits and one specific thing that becomes easier because of this person.',
      'Once that pair is named, the capability becomes externally describable and the rest of the blueprint can build on it.',
    ]
  }

  const themes = detectWeightedThemes(answers)
  const targets = detectCapabilityTargets(joined)

  // Lane-aware fallback: if themes are empty AND laneProfile is high-confidence
  // with a populated capability cell, use it instead of the generic empty-themes path.
  if (themes.length === 0) {
    const laneFallback = getLaneAwareFallback(laneProfile)
    if (laneFallback?.capability) return laneFallback.capability
  }

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

// ===========================================================================
// VersionOne synthesizer (v1.0.12)
// ===========================================================================

const versionOneFallback = [
  'Version one has not yet been named in terms of what it is.',
  'The current input points toward a real build, but the form and boundary are still undefined.',
  'What it proves first is whether one concrete form and one clear boundary can be named and tested.',
]

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

export function synthesizeVersionOne(text: string, laneProfile?: LaneProfile): string[] {
  const trimmed = text.trim()
  if (!trimmed) {
    const laneFallback = getLaneAwareFallback(laneProfile)
    if (laneFallback?.versionOne) return laneFallback.versionOne
    return versionOneFallback
  }

  const form = detectVersionOneForm(trimmed)
  const scope = detectVersionOneScope(trimmed)
  const action = detectVersionOneAction(trimmed)
  const targets = detectCapabilityTargets(trimmed)

  // Fallback only when neither form nor scope is detected
  if (!form && !scope) {
    const laneFallback = getLaneAwareFallback(laneProfile)
    if (laneFallback?.versionOne) return laneFallback.versionOne
    return versionOneFallback
  }

  return [
    composeVersionOneFormBullet(form, action, targets[0] ?? null),
    composeVersionOneScopeBullet(scope),
    composeVersionOneProofBullet(trimmed),
  ]
}

// ===========================================================================
// IdealUser synthesizer (v1.0.16)
// ===========================================================================

const idealUserFallback = [
  'The ideal user has not yet been named in terms of who specifically they are and what specifically blocks them.',
  'The current input points toward a real person, but the identifying role, the specific blocker, and the observable signal are still undefined.',
  'The next move is to name one real person who fits this, one specific thing they have already tried, and one specific place they got stuck.',
]

export function synthesizeIdealUser(text: string, laneProfile?: LaneProfile): string[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  const targets = detectCapabilityTargets(trimmed)
  const targetFallback = targets[0] ?? null
  const role = detectIdealUserRole(trimmed, targetFallback)
  const blocker = detectIdealUserBlocker(trimmed)
  const context = detectIdealUserContext(trimmed)

  // Fallback when neither role nor blocker is detectable
  if (!role && !blocker) {
    const laneFallback = getLaneAwareFallback(laneProfile)
    if (laneFallback?.idealUser) return laneFallback.idealUser
    return idealUserFallback
  }

  const bullets: string[] = []

  // Bullet 1 — role / archetype
  if (role) {
    bullets.push(`The ideal user is ${role}.`)
  } else {
    bullets.push('The ideal user has not yet been named in terms of a specific role or archetype.')
  }

  // Bullet 2 — specific blocker
  if (blocker) {
    bullets.push(`What specifically blocks them is ${blocker}.`)
  } else {
    bullets.push('What specifically blocks them has not yet been named in operational terms — naming one concrete obstacle is the next move.')
  }

  // Bullet 3 — observable signal
  if (context) {
    bullets.push(`They are recognizable because ${context}.`)
  } else if (role && blocker) {
    bullets.push('They are recognizable as someone whose situation rewards the specific help this system provides — naming one concrete thing they have already tried would sharpen the signal further.')
  } else {
    bullets.push('They are recognizable in principle, but the specific observable signal — what they say, what they have already tried, where they got stuck — has not yet been named.')
  }

  return bullets
}

// ===========================================================================
// Transformation synthesizers (v1.0.7) — extracted from transformation.tsx
// ===========================================================================

const beforeFallback = [
  'The current state lacks a clearly named structural shape someone could act from.',
  'There is signal that the situation is unresolved, but it has not yet been separated into a specific functional gap.',
  'The starting condition is described in personal or experiential language rather than operational terms.',
]

const afterFallback = [
  'The new state introduces a defined structural shift, with the situation moving from unresolved to organized.',
  'Capability becomes nameable and usable in operation, not just recognized internally.',
  'There is a visible next move, replacing direction-of-search with a usable decision.',
]

export function structuralizeBefore(input: string, laneProfile?: LaneProfile): string[] {
  const text = input.trim()
  if (!text) {
    const laneFallback = getLaneAwareFallback(laneProfile)
    if (laneFallback?.before) return laneFallback.before
    return beforeFallback
  }
  const matches = translateState(text, beforeTranslations)
  if (matches.length === 0) {
    const laneFallback = getLaneAwareFallback(laneProfile)
    if (laneFallback?.before) return laneFallback.before
    return beforeFallback
  }
  return matches.slice(0, 3).map((m) => `The current state ${m}.`)
}

export function structuralizeAfter(input: string): string[] {
  const text = input.trim()
  if (!text) return afterFallback
  const matches = translateState(text, afterTranslations)
  if (matches.length === 0) return afterFallback
  return matches.slice(0, 3).map((m) => `The new state ${m}.`)
}
