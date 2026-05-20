// Structural primitives (v1.0.17). Vocabulary tables + low-level detectors
// that scan them. No bullet composition. No user-facing sentence templates.
// No fallback strings. Synthesizers (./synthesizers.ts) consume these.
//
// Module boundary: anything that returns intermediate values (themes, targets,
// matched-state strings, role/blocker/context strings) lives here. Anything
// that composes those values into "Version one is a..." or "The ideal user is..."
// bullets lives in synthesizers.

// ===========================================================================
// Theme primitives (v1.0.11 capability / v1.0.5 reflection, merged in v1.0.18)
// ===========================================================================

export type Theme =
  | 'structure'
  | 'clarity'
  | 'guiding'
  | 'building'
  | 'teaching'
  | 'analysis'
  | 'problemSolving'
  | 'translating'

export const themePatterns: Record<Theme, RegExp[]> = {
  structure: [/\bstructur/i, /\borganiz/i, /\bsystem/i, /\bframework/i, /\border\b/i, /\bscope/i, /\bplan/i],
  clarity: [/\bclar/i, /\bclear/i, /\bfog/i, /\bunclear/i, /\bvague/i],
  guiding: [/\bhelp/i, /\bguid/i, /\bsupport/i, /\bmentor/i, /\bcoach/i, /\badvis/i, /\btutor/i, /\bhold(?:ing)?\s+space\b/i, /\bpresence\b/i, /\bretreat/i, /\bsession/i, /\bworkshop/i, /\bfacilitat/i],
  building: [/\bbuild/i, /\bcreat/i, /\bmak(?:e|ing|er)\b/i, /\bdesign/i, /\bdevelop/i, /\bship/i, /\bproduct/i, /\bprototyp/i, /\blaunch/i, /\bMRR\b/i, /\bSaaS\b/i, /\bv1\b/i],
  teaching: [/\bteach/i, /\blearn/i, /\beducat/i, /\bexplain/i, /\btutor/i],
  analysis: [/\banalyz/i, /\bpattern/i, /\bunderstand/i, /\bbreak\s*down/i, /\bfigure\s+(?:it\s+)?out/i, /\bdebug/i, /\btrac(?:e|ing)\b/i, /\bdiagnos/i],
  problemSolving: [/\bfix/i, /\bsolv/i, /\bproblem/i, /\bissue/i, /\bdebug/i, /\bdysfunctional/i, /\bbroken/i, /\bbottleneck/i],
  translating: [/\btranslat/i, /\bbridg/i, /\bconnect/i, /\binterpret/i, /\bconvert/i],
}

export const capabilityTargetNouns: { re: RegExp; canonical: string }[] = [
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
  // v1.1.2 — semantic-bridge additions for abstract-archetype targets
  // (appended at end so concrete role nouns above still match first)
  { re: /\b(?:abstract\s+)?systems?\s+thinkers?\b|\bmeta[\s-]?orchestrators?\b/i, canonical: 'systems thinkers' },
  { re: /\b(?:highly|deeply)\s+(?:intellectual|analytical|capable)\s+(?:individuals?|people)?\b/i, canonical: 'deeply capable thinkers' },
  { re: /\bunder[\s-]?(?:recognized|valued)\s+(?:individuals?|people|builders?|thinkers?)?/i, canonical: 'under-recognized capable people' },
  { re: /\bambitious\s+(?:people|individuals?|builders?)\b/i, canonical: 'ambitious builders' },
  { re: /\bcapable\s+(?:but\s+(?:unsupported|unstructured|unclear|fogged))\s+(?:people|individuals?|builders?)\b/i, canonical: 'capable but unsupported people' },
  { re: /\bpolymaths?\b/i, canonical: 'polymaths' },
]

export function detectThemes(text: string): Theme[] {
  const scored: { theme: Theme; score: number }[] = []
  for (const theme of Object.keys(themePatterns) as Theme[]) {
    let score = 0
    for (const re of themePatterns[theme]) {
      const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
      const matches = text.match(g)
      if (matches) score += matches.length
    }
    if (score > 0) scored.push({ theme, score })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.map((s) => s.theme)
}

export function detectCapabilityTargets(text: string): string[] {
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

// v1.0.24: emphasis patterns — intra-answer markers of user conviction.
// Used by synthesizeCapability's per-answer weighting. Presence of distinct
// matches adds bonus weight to the answer they appear in.
export const emphasisPatterns: RegExp[] = [
  /\balways\b/i,
  /\brepeated(?:ly)?\b/i,
  /\bconsistent(?:ly)?\b/i,
  /\bevery\s+time\b/i,
  /\bover\s+and\s+over\b/i,
  /\bcome\s+to\s+me\b/i,
  /\bpeople\s+ask\s+me\b/i,
  /\bbest\s+at\b/i,
  /\bmost(?:ly)?\b/i,
  /\bespecially\b/i,
  /\breally\b/i,
  /\bnever\b/i,
  /\bkeep(?:s)?\s+(?:getting|producing|doing|making|coming|happening)\b/i,
  /\beverything\b/i,
  /\bevery\s+single\b/i,
]

// ===========================================================================
// VersionOne primitives (v1.0.12) — extracted from page.tsx
// ===========================================================================

export const versionOneFormPatterns: { re: RegExp; canonical: string }[] = [
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
  // v1.1.2 — semantic-bridge additions for meta-system / orchestration vocabulary
  { re: /\b(?:digital|second|external|portfolio)\s+brain\b/i, canonical: 'digital brain' },
  { re: /\borchestration\s+layer\b/i, canonical: 'orchestration layer' },
  { re: /\bintelligence\s+layer\b/i, canonical: 'intelligence layer' },
  { re: /\bsystem\s+of\s+systems\b/i, canonical: 'meta-system' },
  { re: /\bdeveloper\s+operating\s+system\b/i, canonical: 'developer operating system' },
  { re: /\bportfolio\s+intelligence\s+engine\b/i, canonical: 'portfolio intelligence engine' },
  { re: /\bmeta[\s-]?system\b/i, canonical: 'meta-system' },
  { re: /\bknowledge\s+graph\b/i, canonical: 'knowledge graph' },
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

export const versionOneActionVerbs: { re: RegExp; verb: string }[] = [
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

export const verbsThatTakeDirectObject = new Set([
  'helps', 'guides', 'teaches', 'walks through', 'mentors', 'coaches', 'reviews',
])

export function detectVersionOneForm(text: string): string | null {
  for (const { re, canonical } of versionOneFormPatterns) {
    if (re.test(text)) return canonical
  }
  return null
}

export function detectVersionOneAction(text: string): string | null {
  let best: { verb: string; index: number } | null = null
  for (const { re, verb } of versionOneActionVerbs) {
    const m = text.search(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'))
    if (m >= 0 && (best === null || m < best.index)) {
      best = { verb, index: m }
    }
  }
  return best?.verb ?? null
}

// v1.0.21 (2nd re-seal): denylist for discourse markers that follow no/without.
// Check is against the FIRST WORD of the capture, not the full term, because
// the exclusion regex captures up to 2 words greedily (e.g., "no doubt this"
// captures "doubt this"). Filtering the full 2-word string against a single-
// token denylist silently misses every discourse marker that has a continuation
// word — the natural case in real prose. First-word check filters regardless
// of capture length while preserving legitimate 2-word scope exclusions whose
// first word is a domain noun (e.g., "no backend integration" → "backend" not
// denylisted → passed). 'time' is the most semantically ambiguous added token;
// revisit during polish if real user testing reveals false negatives.
const EXCLUSION_DENYLIST = new Set([
  'one', 'need', 'longer', 'sense', 'idea', 'matter',
  'doubt', 'way', 'question', 'problem', 'time',
  'rush', 'hurry', 'surprise', 'kidding', 'wonder',
  'worries', 'offense', 'thanks', 'joke', 'chance',
  'clue', 'contest',
])

export function detectVersionOneScope(text: string): string | null {
  // Multiple "no X" / "without X" exclusions take priority — they indicate deliberate scope choices
  const exclusions: string[] = []
  const exclusionRe = /\b(?:no|without)\s+([a-z][a-z]*(?:[\s-]+[a-z][a-z]+)?)\b/gi
  let m: RegExpExecArray | null
  while ((m = exclusionRe.exec(text)) !== null) {
    const term = m[1].toLowerCase().replace(/\s+/g, ' ')
    const firstWord = term.split(/[\s-]/)[0]
    if (!EXCLUSION_DENYLIST.has(firstWord)) {
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

// ===========================================================================
// IdealUser primitives (v1.0.16) — extracted from page.tsx
// ===========================================================================

export const idealUserRolePatterns: { re: RegExp; describe: (m: RegExpExecArray) => string }[] = [
  // Multi-word role+context first so they win over bare roles
  {
    re: /\bfounder\s+of\s+(?:an?\s+)?(\d+(?:[\s-]+\d+)?(?:[\s-]+person)?)\s+(startup|company|team|org(?:anization)?)/i,
    describe: (m) => `founder of a ${m[1].replace(/\s+/g, '-')} ${m[2]}`,
  },
  {
    re: /\bfounder\s+of\s+(?:an?\s+)?(?:a\s+)?(early[\s-]?stage|mid[\s-]?stage|growth[\s-]?stage|small|solo)\s+(startup|company|team|org(?:anization)?|business)/i,
    describe: (m) => `${m[1].toLowerCase().replace(/\s+/g, '-')} ${m[2]} founder`,
  },
  {
    re: /\bfounder\s+of\s+(?:an?\s+)?(startup|company|team|org(?:anization)?|business)/i,
    describe: (m) => `${m[1]} founder`,
  },
  {
    re: /\bengineers?\s+on[\s-]?call\b/i,
    describe: () => 'engineers who are on-call',
  },
  {
    re: /\bback[\s-]?end\s+engineers?\b/i,
    describe: () => 'back-end engineers',
  },
  {
    re: /\b(high[\s-]?achieving|burn(?:ed|t)[\s-]?out|mid[\s-]?career)\s+(women|men|founders|leaders|professionals|engineers|designers|operators)\b/i,
    describe: (m) => `${m[1].toLowerCase().replace(/\s+/g, '-')} ${m[2]}`,
  },
  {
    re: /\b(?:person|people|someone|individuals?)\s+(?:who\s+(?:has|have)\s+)?(?:been\s+)?(disconnected|burned[\s-]?out|stuck|blocked)\s+(?:from\s+)?([a-z][a-z\s-]{2,30})/i,
    describe: (m) => `people ${m[1].toLowerCase().replace(/\s+/g, '-')} from ${m[2].trim()}`,
  },
  {
    re: /\b(?:person|people|someone)\s+who\s+(?:has\s+already\s+)?(tried|spent|invested|built|led|managed)\b/i,
    describe: (m) => `someone who has already ${m[1].toLowerCase()} something`,
  },
  // v1.1.2 — semantic-bridge additions for legibility / abstract-archetype vocabulary
  {
    re: /\b(?:highly|deeply|fiercely)\s+(?:intellectual|analytical|thoughtful|capable)\s+(?:individuals?|people|persons?|thinkers?)?/i,
    describe: () => 'a deeply capable abstract thinker whose strength is not yet externally legible',
  },
  {
    re: /\bunder[\s-]?(?:recognized|valued|appreciated)\s+(?:individuals?|people|thinkers?|builders?|professionals?|operators?)?/i,
    describe: () => 'an under-recognized capable person whose work has not yet found a legible form',
  },
  {
    re: /\bsystems?\s+thinkers?\b|\bmeta[\s-]?orchestrators?\b|\bpolymaths?\b/i,
    describe: () => 'a systems thinker operating across multiple domains',
  },
  {
    re: /\b(?:cannot|can'?t|unable\s+to)\s+find\s+(?:employment|work|a\s+job)\b/i,
    describe: () => 'a capable person whose abilities are not externally legible to current evaluators',
  },
]

export const idealUserBlockerPatterns: { re: RegExp; blocker: string }[] = [
  { re: /\b(?:feel(?:s|ing)?\s+)?lost\b/i, blocker: 'not having a named direction to act from' },
  { re: /\b(?:feel(?:s|ing)?\s+)?stuck\b/i, blocker: 'a missing next step rather than a missing ability' },
  { re: /\b(?:feel(?:s|ing)?\s+)?overwhelmed\b/i, blocker: 'more input than current structure can absorb' },
  { re: /\b(?:feel(?:s|ing)?\s+)?confused\b/i, blocker: 'not having applicable structure for the current situation' },
  { re: /\b(?:feel(?:s|ing)?\s+)?scattered\b/i, blocker: 'carrying unconsolidated material with no organizing pattern' },
  { re: /\b(?:feel(?:s|ing)?\s+)?disconnected\b/i, blocker: 'operating without a connection to purpose or direction' },
  { re: /\b(?:feel(?:s|ing)?\s+)?blocked\b/i, blocker: 'a specific obstacle they cannot yet name or resolve on their own' },
  { re: /\b(?:in\s+)?conflict\b/i, blocker: 'team or context conflict they cannot yet diagnose' },
  { re: /\bperfectionism\b/i, blocker: 'perfectionism preventing visible progress' },
  { re: /\bburn[\s-]?out\b|\bburned[\s-]?out\b/i, blocker: 'burnout from sustained output without recovery structure' },
  { re: /\bdoesn['’]?t\s+know\s+(?:where|what|how|why|whether)\b/i, blocker: 'not having a defined map of next-step decisions' },
  { re: /\bcan['’]?t\s+(?:figure|decide|choose|tell)\b/i, blocker: 'having multiple possible moves with no decision criteria' },
  { re: /\boverthink/i, blocker: 'producing more analysis than current structure can absorb' },
  { re: /\banxious\b|\banxiety\b/i, blocker: 'uncertainty with no visible path forward' },
  { re: /\bpeople\b(?:,\s+)?\s+process\b(?:,\s+)?\s+(?:or\s+)?strategy/i, blocker: 'an unresolved people/process/strategy diagnosis' },
]

export const idealUserContextPatterns: { re: RegExp; build: (m: RegExpExecArray) => string }[] = [
  {
    re: /\btried\s+([a-z][a-z\s,-]{3,60}?)(?=\s+(?:and|but|without|yet|,|\.|\band))/i,
    build: (m) => `they have already tried ${m[1].trim()}`,
  },
  {
    re: /\b(?:spent|invested)\s+(\d+(?:\+|\s*plus)?\s*(?:hour|day|week|month|year)s?)/i,
    build: (m) => `they have already spent ${m[1]} on this`,
  },
  {
    re: /\b(therapy|coaching|courses?|programs?|therapists?|coach(?:es)?)\b/i,
    build: () => 'they have already tried therapy, coaching, or courses and are still stuck',
  },
  {
    re: /\bgetting\s+paged\b|\bon\s+call\b|\bincident\b|\bproduction\b/i,
    build: () => 'they get paged about problems they cannot reliably diagnose in real time',
  },
  {
    re: /\b(\$\d+(?:k|,\d{3})?|\d+k\s*a\s+(?:month|year))\b/i,
    build: (m) => `the stakes are concrete: ${m[1]} is on the line`,
  },
]

export function detectIdealUserRole(text: string, targetFallback: string | null): string | null {
  for (const { re, describe } of idealUserRolePatterns) {
    const m = re.exec(text)
    if (m) return describe(m)
  }
  return targetFallback
}

export function detectIdealUserBlocker(text: string): string | null {
  for (const { re, blocker } of idealUserBlockerPatterns) {
    if (re.test(text)) return blocker
  }
  return null
}

export function detectIdealUserContext(text: string): string | null {
  for (const { re, build } of idealUserContextPatterns) {
    const m = re.exec(text)
    if (m) return build(m)
  }
  return null
}

// ===========================================================================
// Transformation primitives (v1.0.7) — extracted from transformation.tsx
// ===========================================================================
//
// Note (bug_004, v1.0.18): Resolved in v1.0.18 (this module) — one canonical
// `Theme` + `themePatterns` + `detectThemes`. reflection.tsx imports these
// directly (a bounded exception to the v1.0.17 module-boundary rule; see the
// v1.0.18 sealed artifact Decision 5 and Change 3g for the formal framing).
//
// Note: idealUserBlockerPatterns above and beforeTranslations below describe
// overlapping emotional vocabulary at different output layers (blocker-of-user
// vs state-of-user). Intentional — same input source, different rendering
// templates per the SCL Translation Priority. Kept as separate tables.

export const beforeTranslations: { re: RegExp; structural: string }[] = [
  { re: /\b(?:feel(?:s|ing)?\s+)?lost\b/i, structural: 'operates without a defined direction' },
  { re: /\b(?:feel(?:s|ing)?\s+)?empty\b/i, structural: 'operates without meaningful internal structure' },
  { re: /\b(?:feel(?:s|ing)?\s+)?worthless\b/i, structural: 'operates with no recognized capability' },
  { re: /\b(?:feel(?:s|ing)?\s+)?overwhelmed\b/i, structural: 'carries more input than current structure can absorb' },
  { re: /\b(?:feel(?:s|ing)?\s+)?stuck\b/i, structural: 'is blocked by a missing next step rather than a missing ability' },
  { re: /\b(?:feel(?:s|ing)?\s+)?confused\b/i, structural: 'operates without applicable structure for the current situation' },
  { re: /\b(?:feel(?:s|ing)?\s+)?scattered\b/i, structural: 'carries unconsolidated material with no organizing pattern' },
  { re: /\b(?:feel(?:s|ing)?\s+)?anxious\b/i, structural: 'operates under uncertainty with no visible path forward' },
  { re: /\b(?:feel(?:s|ing)?\s+)?alone\b/i, structural: 'operates without external structure or ground for decisions' },
  { re: /\b(?:feel(?:s|ing)?\s+)?frustrat(?:ed|ion)\b/i, structural: 'operates without a functional path forward' },
  { re: /\b(?:feel(?:s|ing)?\s+)?unseen\b/i, structural: 'operates without external recognition of real signal' },
  { re: /\b(?:feel(?:s|ing)?\s+)?unsure\b/i, structural: 'has signal but no decision criteria' },
  { re: /\bunclear\b/i, structural: 'operates without resolved structure' },
  { re: /\bvague\b/i, structural: 'has unstructured input rather than nameable form' },
  { re: /\bfog\b/i, structural: 'operates inside fog rather than visible structure' },
  { re: /\bno\s+(?:clear\s+)?direction\b/i, structural: 'has no named direction to act from' },
  { re: /\bno\s+(?:real\s+)?clarity\b/i, structural: 'operates without resolved structure' },
  { re: /\bdoesn['’]?t\s+know\s+(?:where|what|how|why)\b/i, structural: 'lacks a defined map of next-step decisions' },
  { re: /\bdon['’]?t\s+know\s+(?:where|what|how|why)\b/i, structural: 'lacks a defined map of next-step decisions' },
  { re: /\bcan['’]?t\s+(?:figure|decide|choose)\b/i, structural: 'has multiple possible next moves with no decision criteria to choose between them' },
  { re: /\boverthink/i, structural: 'is producing more analysis than the current structure can absorb' },
  { re: /\bsafe\s+space\b/i, structural: 'lacks a structured environment to surface signal without performance pressure' },
  { re: /\bfinding\s+(?:my|their)\s+worth\b/i, structural: 'has not yet separated capability from identity in a recognizable way' },
  { re: /\bbecoming\s+(?:my|them)?self\b/i, structural: 'is in an identity-shaping phase without a stable functional anchor yet' },
  // v1.1.2 — semantic-bridge additions for legibility / structure-gap vocabulary
  { re: /\black(?:ing|s)?\s+guidance\b/i, structural: 'operates without an external structuring presence' },
  { re: /\bno\s+clarity\s+moment\b|\bno\s+clarity\s+yet\b/i, structural: 'has not yet hit the moment when structure becomes externally visible' },
  { re: /\bnot\s+(?:laid\s+out|fully\s+structured|externally\s+structured)\b/i, structural: 'has internal material rather than externally visible form' },
  { re: /\bcan(?:not|'?t)\s+(?:present|show|translate|articulate|explain)\b/i, structural: 'has internal capability with no externally legible form yet' },
  { re: /\bunder[\s-]?recognized\b|\bnot\s+(?:externally\s+)?recognized\b/i, structural: 'has real capability that is not externally legible to evaluators' },
  { re: /\bcan(?:not|'?t)\s+find\s+(?:employment|work|a\s+job)\b/i, structural: 'has capability that is not externally legible in current employment channels' },
  { re: /\bpeople\s+don['’]?t\s+understand\b|\bothers?\s+can(?:not|'?t)\s+(?:see|understand|detect)\b/i, structural: 'produces signal that others cannot yet read in usable form' },
]

export const afterTranslations: { re: RegExp; structural: string }[] = [
  { re: /\b(?:feel(?:s|ing)?\s+)?clear(?:er|ly)?\b|\bclarity\b/i, structural: 'has named, usable structure for the current situation' },
  { re: /\b(?:feel(?:s|ing)?\s+)?confident\b|\bconfidence\b/i, structural: 'has self-trust grounded in observable capability' },
  { re: /\b(?:feel(?:s|ing)?\s+)?free\b|\bfreedom\b/i, structural: 'operates without the prior structural blocker' },
  { re: /\bstructur(?:e|ed|ing)\b/i, structural: 'operates inside a defined structure' },
  { re: /\borganiz(?:e|ed|ing|ation)\b/i, structural: 'has organized previously scattered material into usable form' },
  { re: /\b(?:feel(?:s|ing)?\s+)?empowered\b|\bempowerment\b/i, structural: 'has access to actionable agency' },
  { re: /\b(?:feel(?:s|ing)?\s+)?capable\b|\bcapability\b/i, structural: 'has a visible, named capability to act from' },
  { re: /\b(?:feel(?:s|ing)?\s+)?safe\b/i, structural: 'operates from a stable enough base to act without performance pressure' },
  { re: /\b(?:feel(?:s|ing)?\s+)?seen\b/i, structural: 'has had real signal accurately reflected back, which becomes ground for action' },
  { re: /\b(?:feel(?:s|ing)?\s+)?heard\b/i, structural: 'has had real signal recognized externally, which validates it as actionable' },
  { re: /\b(?:feel(?:s|ing)?\s+)?grounded\b/i, structural: 'operates from a stable structural base' },
  { re: /\b(?:feel(?:s|ing)?\s+)?aligned\b|\balignment\b/i, structural: 'has matched capability to direction in a way that supports action' },
  { re: /\b(?:moving\s+forward|momentum|movement|moving\b)/i, structural: 'has visible next-step momentum' },
  { re: /\bdirection\b/i, structural: 'has a named direction to organize action around' },
  { re: /\bagency\b/i, structural: 'has restored capacity to act intentionally' },
  { re: /\bvalidat(?:e|ed|ion)\b/i, structural: 'has had perceived capability externally confirmed' },
  { re: /\bknow(?:s)?\s+(?:what|where|how|why)\b/i, structural: 'has a usable decision map for next moves' },
  { re: /\bnext\s+step\b/i, structural: 'has a defined next step rather than a generalized direction' },
  { re: /\bbuilt?\b/i, structural: 'has produced something real, shaped, and externally observable' },
  { re: /\bcreate(?:d)?\b/i, structural: 'has converted internal possibility into something externally produced' },
  { re: /\b(?:they|user|person)\s+(?:can|will|now)\b/i, structural: 'has gained a usable affordance that did not exist before' },
  { re: /\bself[\s-]?trust\b/i, structural: 'operates with a stable internal evaluation criterion for action' },
  { re: /\bunderstand\b/i, structural: 'has named the structure of the situation in operational terms' },
]

export function dedupe(items: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const item of items) {
    if (!seen.has(item)) {
      seen.add(item)
      out.push(item)
    }
  }
  return out
}

export function translateState(text: string, table: { re: RegExp; structural: string }[]): string[] {
  const out: string[] = []
  for (const { re, structural } of table) {
    if (re.test(text)) out.push(structural)
  }
  return dedupe(out)
}
