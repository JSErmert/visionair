import { useMemo } from 'react'
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

// Structural Constraint Layer — second active application surface.
// Translates raw before/after phrasing into structured state descriptions.
// Deterministic, rule-based, no LLM. Exported helpers are reused by
// page.tsx's formatTransformation so the blueprint card receives the
// same structurally-translated promise rather than a raw concatenation.

const beforeTranslations: { re: RegExp; structural: string }[] = [
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
]

const afterTranslations: { re: RegExp; structural: string }[] = [
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

function dedupe(items: string[]): string[] {
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

function translateState(text: string, table: { re: RegExp; structural: string }[]): string[] {
  const out: string[] = []
  for (const { re, structural } of table) {
    if (re.test(text)) out.push(structural)
  }
  return dedupe(out)
}

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

export function structuralizeBefore(input: string): string[] {
  const text = input.trim()
  if (!text) return beforeFallback
  const matches = translateState(text, beforeTranslations)
  if (matches.length === 0) return beforeFallback
  return matches.slice(0, 3).map((m) => `The current state ${m}.`)
}

export function structuralizeAfter(input: string): string[] {
  const text = input.trim()
  if (!text) return afterFallback
  const matches = translateState(text, afterTranslations)
  if (matches.length === 0) return afterFallback
  return matches.slice(0, 3).map((m) => `The new state ${m}.`)
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

  const beforeBullets = useMemo(() => structuralizeBefore(beforeValue), [beforeValue])
  const afterBullets = useMemo(() => structuralizeAfter(afterValue), [afterValue])

  const showBullets =
    beforeValue.trim().length > 0 || afterValue.trim().length > 0

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
        <p className="mb-3 text-sm font-medium text-black/75">
          Your transformation promise
        </p>

        {showBullets ? (
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-black/55">
                Before
              </p>
              <ul className="space-y-2">
                {beforeBullets.map((bullet, i) => (
                  <li key={i} className="text-sm leading-6 text-black/80">
                    • {bullet}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-black/55">
                After
              </p>
              <ul className="space-y-2">
                {afterBullets.map((bullet, i) => (
                  <li key={i} className="text-sm leading-6 text-black/80">
                    • {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-6 text-black/45">
            Once you start describing either side, the transformation will appear here as a structured before/after.
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
