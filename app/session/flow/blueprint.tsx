import { useEffect, useState } from 'react'
import PrimaryButton from '@/components/primary-button'
import ScreenIntro from '@/components/screen-intro'
import ScreenShell from '@/components/screen-shell'
import SecondaryButton from '@/components/secondary-button'
import type { LaneProfile } from './lane-derivation'
import type { SessionState } from '../page'

type BlueprintData = {
  capability: string[]
  problemSpace: string
  idealUser: string[]
  transformation: string
  opportunityForm: string
  versionOne: string[]
  pathForward: {
    immediate: string
    nearTerm: string
    later: string
  }
  // v1.0.22: user's verbatim refinement/recalibration text from the Reflection
  // screen. Renders as italicized footer block when non-empty and not the
  // literal 'yes' confirmation. User-authored content, explicitly distinct
  // from synthesized sections (SCL Rule 5 preservation; Rule 1 not engaged
  // because this is user's own words, not synthesizer output).
  reflection: string
  // v1.1.3: optional lane profile produced by deriveLaneProfile (page.tsx).
  // Carried on BlueprintData for v1.1.4 strategy-compression downstream
  // consumption. Not rendered in v1.1.3.
  laneProfile?: LaneProfile
}

type BlueprintProps = {
  data: BlueprintData
  // v1.2.0 — full session state passed through so the Blueprint screen can
  // fire /api/blueprint (Opus 4.7) on mount for a distilled 5-field synthesis.
  // Deterministic blueprint below remains the source of truth; LLM card
  // layers on top and hides silently on fallback.
  sessionState: SessionState
  onNext: () => void
  onBack: () => void
}

type SynthesizedBlueprint = {
  coreDirection: string
  whoItServes: string
  whatItOffers: string
  firstShippableSlice: string
  proofItWorks: string
}

function SectionCard({
  title,
  content,
}: {
  title: string
  content: string | string[]
}) {
  const isArray = Array.isArray(content)
  const hasContent = isArray ? content.length > 0 : content.trim().length > 0

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <p className="mb-2 text-sm font-medium tracking-wide text-black/55">
        {title}
      </p>
      {hasContent ? (
        isArray ? (
          <ul className="space-y-2">
            {content.map((item, i) => (
              <li key={i} className="text-base leading-7 text-black/80">
                • {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-base leading-7 text-black/80">{content}</p>
        )
      ) : (
        <p className="text-base leading-7 text-black/80">Still taking shape.</p>
      )}
    </div>
  )
}

export default function Blueprint({
  data,
  sessionState,
  onNext,
  onBack,
}: BlueprintProps) {
  const hasPathForward =
    data.pathForward.immediate.trim() ||
    data.pathForward.nearTerm.trim() ||
    data.pathForward.later.trim()

  // v1.2.0 — LLM-distilled blueprint (Opus 4.7 via /api/blueprint). Layered on
  // top of the deterministic 7-section blueprint below. Graceful fallback: if
  // the API key is missing / rate-limited / returns malformed output, the
  // distilled card hides itself and the deterministic blueprint stays intact.
  const [synthesis, setSynthesis] = useState<SynthesizedBlueprint | null>(null)
  const [synthesisLoading, setSynthesisLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setSynthesisLoading(true)
    fetch('/api/blueprint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entryPoint: sessionState.entryPoint,
        seedInput: sessionState.seedInput,
        reflection: sessionState.reflection,
        capability: sessionState.capability,
        problemSpace: sessionState.problemSpace,
        idealUser: sessionState.idealUser,
        transformationBefore: sessionState.transformationBefore,
        transformationAfter: sessionState.transformationAfter,
        opportunityForm: sessionState.opportunityForm,
        versionOne: sessionState.versionOne,
        pathForward: sessionState.pathForward,
      }),
    })
      .then((res) => res.json())
      .then((payload) => {
        if (cancelled) return
        if (payload && payload.fallbackToFixed === false && payload.synthesis) {
          setSynthesis(payload.synthesis)
        } else {
          setSynthesis(null)
        }
      })
      .catch(() => {
        if (cancelled) return
        setSynthesis(null)
      })
      .finally(() => {
        if (!cancelled) setSynthesisLoading(false)
      })
    return () => {
      cancelled = true
    }
    // We intentionally fire once on mount with the state captured at that
    // moment — the Blueprint screen is downstream of every input, so state
    // is effectively final by the time this screen renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ScreenShell className="max-w-5xl">
      <ScreenIntro
        eyebrow="Revealing your blueprint"
        title="Your Structured Opportunity Blueprint"
        description="This blueprint was built from the truth you already carry. VisionAir helped give it shape."
      />

      {/* v1.2.0 — Opus 4.7 distilled synthesis. Renders above the deterministic
          blueprint when available; hides silently on fallback. */}
      {synthesisLoading && (
        <div className="mb-6 rounded-2xl border border-black/5 bg-white p-5">
          <p className="text-sm text-black/40">Distilling your direction…</p>
        </div>
      )}
      {!synthesisLoading && synthesis && (
        <div className="mb-6 rounded-2xl border border-black/15 bg-white p-6">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-black/45">
            Your direction, distilled
          </p>
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-sm font-medium text-black/55">
                Core direction
              </p>
              <p className="text-base leading-7 text-black/85">
                {synthesis.coreDirection}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-black/55">
                Who it serves
              </p>
              <p className="text-base leading-7 text-black/85">
                {synthesis.whoItServes}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-black/55">
                What it offers
              </p>
              <p className="text-base leading-7 text-black/85">
                {synthesis.whatItOffers}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-black/55">
                First shippable slice
              </p>
              <p className="text-base leading-7 text-black/85">
                {synthesis.firstShippableSlice}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-black/55">
                Proof it works
              </p>
              <p className="text-base leading-7 text-black/85">
                {synthesis.proofItWorks}
              </p>
            </div>
          </div>
        </div>
      )}

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

      {data.reflection.trim() && data.reflection.trim() !== 'yes' && (
        <div className="mt-4 rounded-2xl border border-black/10 bg-black/[0.02] p-5">
          <p className="mb-2 text-sm font-medium tracking-wide text-black/55">
            Your refinement
          </p>
          <p className="text-base leading-7 italic text-black/80">
            &ldquo;{data.reflection}&rdquo;
          </p>
        </div>
      )}

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
