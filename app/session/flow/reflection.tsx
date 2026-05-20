import { useEffect, useMemo, useState } from 'react'
import PrimaryButton from '@/components/primary-button'
import ScreenIntro from '@/components/screen-intro'
import ScreenShell from '@/components/screen-shell'
import SecondaryButton from '@/components/secondary-button'
import { type Theme, themePatterns, detectThemes } from './structural-primitives'

type ReflectionProps = {
  seedInput: string
  onConfirm: (value: string) => void
  onNext: () => void
  onBack: () => void
}

// Structural Constraint Layer — first active application surface.
// Theme detection primitives live in ./structural-primitives (unified in v1.0.18,
// bug_004 resolved). Reflection-specific sentence templates (capabilityBullet,
// patternBullet, fallbackBullets, weak-signal detectors) and emotionalTranslations
// stay here. NOTE: this file imports directly from primitives — a bounded
// exception to the v1.0.17 module-boundary rule, resolved when synthesizeReflection
// is later extracted into synthesizers.ts. No other flow screen may follow this pattern.

const emotionalTranslations: { re: RegExp; functional: string }[] = [
  { re: /\b(?:feel(?:s|ing)?\s+)?lost\b/i, functional: 'lacks direction and structure' },
  { re: /\b(?:feel(?:s|ing)?\s+)?empty\b/i, functional: 'lacks meaningful structure or grounding' },
  { re: /\b(?:feel(?:s|ing)?\s+)?worthless\b/i, functional: 'lacks confidence, self-trust, or perceived capability' },
  { re: /\b(?:feel(?:s|ing)?\s+)?overwhelmed\b/i, functional: 'holds more unorganized input than there is usable structure for' },
  { re: /\b(?:feel(?:s|ing)?\s+)?stuck\b/i, functional: 'is blocked by a missing next step rather than a missing ability' },
  { re: /\b(?:feel(?:s|ing)?\s+)?confused\b/i, functional: 'is operating without structure in the current situation' },
  { re: /\b(?:feel(?:s|ing)?\s+)?scattered\b/i, functional: 'carries unconsolidated input that has not yet been organized' },
  { re: /\b(?:feel(?:s|ing)?\s+)?anxious\b/i, functional: 'is operating under uncertainty with no visible path forward' },
  { re: /\bsafe\s+space\b/i, functional: 'needs a structured environment for reflection and guidance' },
  { re: /\bdon['’]?t\s+know\s+what\s+i['’]?m\s+(?:good|best)\s+at\b/i, functional: 'has real capability that has not yet been named or separated from context' },
]

function extractFunctionalTranslations(text: string): string[] {
  const out: string[] = []
  for (const { re, functional } of emotionalTranslations) {
    if (re.test(text)) out.push(functional)
  }
  return out
}

const capabilityBullet: Record<Theme, string> = {
  structure:
    'You tend to take loose or unstructured situations and bring them into a more organized, usable form.',
  clarity:
    'You tend to work by turning fog and vagueness into clarity that other people can act on.',
  guiding:
    'You operate by helping other people move from a stuck point toward a clear next step.',
  building:
    'You operate by turning internal ideas and signals into something real, shaped, and buildable.',
  teaching:
    'You operate by converting complex or unfamiliar material into explanations others can actually use.',
  analysis:
    'You operate by noticing patterns inside messy situations and naming what is actually going on.',
  problemSolving:
    'You operate by isolating what is functionally broken and moving it toward a working state.',
  translating:
    'You operate as a translator — converting unclear, emotional, or complex input into usable structure.',
}

const patternBullet: Record<Theme, string> = {
  structure:
    'There is a recurring pattern of turning scattered material into a coherent structure others can follow.',
  clarity:
    'There is a recurring pattern of reducing ambiguity so the next step becomes visible.',
  guiding:
    'There is a recurring pattern of helping others move from confusion toward direction.',
  building:
    'There is a recurring pattern of helping things move from possibility into something real and testable.',
  teaching:
    'There is a recurring pattern of making difficult material accessible so others can use it.',
  analysis:
    'There is a recurring pattern of making hidden structure visible so decisions become easier.',
  problemSolving:
    'There is a recurring pattern of moving from a broken state to a working state with less wasted effort.',
  translating:
    'There is a recurring pattern of interpreting complex or emotional input and translating it into something more operational.',
}

// Fallback structuralization: when no theme keywords and no emotional
// translations match, the input is still structurally readable (aspirational,
// identity-language, questioning, fragment, gibberish). Convert that
// structural shape itself into a functional reflection.

type WeakSignal =
  | 'aspirational'
  | 'questioning'
  | 'self-defining'
  | 'identity-domain'
  | 'short'
  | 'gibberish'

function detectWeakSignals(text: string): WeakSignal[] {
  const signals: WeakSignal[] = []

  if (
    /\bi\s+want\b|\bi\s+need\b|\bi['’]?m\s+trying\b|\blooking\s+for\b|\bshould\s+(?:be|do|have)\b|\bwish\b|\bhope\s+to\b/i.test(
      text
    )
  ) {
    signals.push('aspirational')
  }

  if (/\?\s*$|\bhow\s+(?:do|can|should)\b|\bwhy\s+(?:do|am|is)\b|\bwhat\s+(?:should|do\s+i)\b/i.test(text)) {
    signals.push('questioning')
  }

  if (/\bi\s+am\b|\bi['’]?m\s+(?:a|just)\b|\bmyself\b|\bwho\s+i\s+am\b/i.test(text)) {
    signals.push('self-defining')
  }

  if (/\blife\b|\bpurpose\b|\bmeaning\b|\bcalling\b|\bdream\b|\bsoul\b|\bjourney\b/i.test(text)) {
    signals.push('identity-domain')
  }

  if (text.length < 30) {
    signals.push('short')
  }

  const vowelCount = (text.match(/[aeiou]/gi) || []).length
  if (text.length > 5 && vowelCount / text.length < 0.15 && !/\s/.test(text)) {
    signals.push('gibberish')
  }

  return signals
}

function fallbackBullets(text: string): string[] {
  const signals = detectWeakSignals(text)

  if (signals.includes('gibberish')) {
    return [
      'There is no readable signal in what you shared yet — the input has not crossed into language the system can structure.',
      'That is itself a structural observation: the first move is to put the situation into recognizable words rather than to refine what is already there.',
      'The capability question is downstream of having something nameable to work with.',
      'What matters now is producing one short, plain sentence about what is actually going on, then re-running the reflection from that.',
    ]
  }

  const bullets: string[] = []

  // Bullet 1 — name the structural mode of the input
  if (signals.includes('aspirational')) {
    bullets.push(
      'What you shared sits in the aspirational layer — pointing at something wanted but not yet describing what it actually is or how it would work.'
    )
  } else if (signals.includes('questioning')) {
    bullets.push(
      'What you shared is structured as a question rather than a claim, which means there is direction-of-search but not yet a stable signal to translate.'
    )
  } else if (signals.includes('self-defining')) {
    bullets.push(
      'What you shared is identity-language about who you are rather than functional-language about what you can reliably do for someone else — those are different layers, and the second is the one that becomes buildable.'
    )
  } else if (signals.includes('identity-domain')) {
    bullets.push(
      'What you shared sits in the personal-meaning layer — true, but not yet on the layer that converts into a capability, a user, or a buildable form.'
    )
  } else if (signals.includes('short')) {
    bullets.push(
      'What you shared is short enough that there is a fragment of signal but not enough surface to extract a pattern from.'
    )
  } else {
    bullets.push(
      'What you shared is real but is still in unstructured form — there is signal here that has not yet been separated into a capability, a problem, or a direction.'
    )
  }

  // Bullet 2 — structural diagnosis: what is missing functionally
  if (signals.includes('self-defining') || signals.includes('identity-domain')) {
    bullets.push(
      'The functional gap is between identity and operation: it is clearer what kind of person you are or want to be than what you would reliably do for which specific person.'
    )
  } else if (signals.includes('aspirational') || signals.includes('questioning')) {
    bullets.push(
      'The functional gap is that the wanted state is named without the current state, the user, or the work being named — a path needs both endpoints, not just the destination.'
    )
  } else {
    bullets.push(
      'The functional gap is that the input has not yet been named in terms of what someone else would receive or experience as a result.'
    )
  }

  // Bullet 3 — re-frame as a structural state, not a personal deficit
  bullets.push(
    'This is a normal early-stage state, not a deficit — the input is in a layer that needs structural separation, not more reflection.'
  )

  // Bullet 4 — actionable forward move (functional)
  if (signals.includes('aspirational') || signals.includes('questioning')) {
    bullets.push(
      'What matters now is naming one specific person you have helped or could help, and one specific thing that became easier for them — that gives the system a concrete signal to structure from.'
    )
  } else if (signals.includes('self-defining') || signals.includes('identity-domain')) {
    bullets.push(
      'What matters now is moving from "who I am" to "what I do for whom" — describe one moment when something you did changed something for another person, then re-run the reflection from there.'
    )
  } else if (signals.includes('short')) {
    bullets.push(
      'What matters now is going one layer deeper — write a few more sentences about a real situation where this showed up, so there is surface to structure from.'
    )
  } else {
    bullets.push(
      'What matters now is restating the input in terms of what someone else would receive — that single shift gives the system a structural anchor to work from.'
    )
  }

  return bullets
}

export function synthesizeReflection(seedInput: string): string[] {
  console.log("SYNTHESIS RUNNING", seedInput)
  const text = seedInput.trim()

  if (!text) {
    return [
      'There is something here that has not yet been named in a usable way.',
      'The signal is real but unseparated from the feeling, which is why it resists being structured right now.',
      'The first structural move is to pull the capability apart from the emotional wrapper so it can be worked with.',
      'What matters now is converting this from internal sense into something that can be explained and acted on.',
    ]
  }

  const themes = detectThemes(text)
  const translations = extractFunctionalTranslations(text)

  // Fallback structuralization: weak/ambiguous input — no theme matches and
  // no emotional translations. Read the structural shape of the input itself
  // (aspirational, identity-language, short fragment, etc.) and produce
  // structured bullets. Prevents the engine from quietly returning generic
  // defaults for low-signal inputs.
  if (themes.length === 0 && translations.length === 0) {
    return fallbackBullets(text)
  }

  // Structural Constraint Layer Rule 1+2: when the seed is mostly emotional,
  // lead with translation framing rather than overclaiming a capability signal.
  const emotionalDominant = translations.length > 0 && translations.length >= themes.length

  if (emotionalDominant) {
    const bullets: string[] = []

    bullets.push(
      `The language you used points at something structural: the situation ${translations[0]}.`
    )

    if (translations.length > 1) {
      bullets.push(
        `Another part of the signal is that the situation ${translations[1]} — also a structural problem to address, not an identity to settle.`
      )
    } else {
      bullets.push(
        'That is a structural problem about missing inputs, not an identity problem about who you are.'
      )
    }

    bullets.push(
      'The capability underneath is harder to see right now because it has not yet been separated from the feeling — pulling them apart is the first structural move.'
    )

    bullets.push(
      'What matters now is translating this into something you can name, test, and act on — starting with one small piece of real structure.'
    )

    return bullets
  }

  // Theme-led composition for capability-signal-rich input.
  const bullets: string[] = []

  bullets.push(
    themes.length > 0
      ? capabilityBullet[themes[0]]
      : 'You tend to take material that is still unstructured and work it into a form other people can use.'
  )

  const secondTheme = themes.length > 1 ? themes[1] : themes[0]
  bullets.push(
    secondTheme
      ? patternBullet[secondTheme]
      : 'There is a recurring pattern of turning something unclear into something clearer and more actionable.'
  )

  if (translations.length > 0) {
    bullets.push(
      `The emotional phrasing in what you shared points at a structural reality — the situation ${translations[0]} — which is a structural problem to address, not an identity to settle.`
    )
  } else {
    bullets.push(
      'Your underlying approach is less about feeling a certain way and more about what you can reliably produce for other people.'
    )
  }

  bullets.push(
    'What matters now is sharpening this into a consistent, repeatable approach that can be explained, tested, and built from.'
  )

  return bullets
}

export default function Reflection({
  seedInput,
  onConfirm,
  onNext,
  onBack,
}: ReflectionProps) {
  const [mode, setMode] = useState<'initial' | 'refine' | 'recalibrate'>('initial')
  const [response, setResponse] = useState('')

  const reflection = useMemo(() => synthesizeReflection(seedInput), [seedInput])

  // v1.2.0 — LLM-dynamic follow-up question (Sonnet 4.6 via /api/question).
  // Layered on top of the deterministic reflection above. Graceful fallback:
  // if the API key is missing / rate-limited / returns malformed output, the
  // dynamic block hides itself and the deterministic flow stays intact.
  const [dynamicQuestion, setDynamicQuestion] = useState<string | null>(null)
  const [dynamicRationale, setDynamicRationale] = useState<string | null>(null)
  const [dynamicLoading, setDynamicLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setDynamicLoading(true)
    fetch('/api/question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentStep: 'reflection',
        seedInput,
        entryPoint: '',
        capability: [],
        problemSpace: '',
        idealUser: '',
        transformationBefore: '',
        transformationAfter: '',
        versionOne: '',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        if (data && data.fallbackToFixed === false) {
          setDynamicQuestion(data.dynamicQuestion)
          setDynamicRationale(data.rationale)
        } else {
          setDynamicQuestion(null)
          setDynamicRationale(null)
        }
      })
      .catch(() => {
        if (cancelled) return
        setDynamicQuestion(null)
        setDynamicRationale(null)
      })
      .finally(() => {
        if (!cancelled) setDynamicLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [seedInput])

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

      {/* v1.2.0 — LLM-dynamic follow-up. Shows when /api/question returns a
          niche-specific question (Sonnet 4.6). Hidden silently on fallback. */}
      {dynamicLoading && (
        <div className="mb-6 rounded-2xl border border-black/5 bg-white p-5">
          <p className="text-sm text-black/40">Listening to what you shared…</p>
        </div>
      )}
      {!dynamicLoading && dynamicQuestion && (
        <div className="mb-6 rounded-2xl border border-black/15 bg-white p-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-black/45">
            A more specific question for you
          </p>
          <p className="text-base leading-7 text-black">{dynamicQuestion}</p>
          {dynamicRationale && (
            <p className="mt-3 text-xs italic text-black/50">
              {dynamicRationale}
            </p>
          )}
        </div>
      )}

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
