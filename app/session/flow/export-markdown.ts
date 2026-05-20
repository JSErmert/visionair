// VisionAir blueprint export — turns a SessionState into a downloadable Markdown
// artifact containing the full synthesized blueprint + compressed strategy.
//
// Pure deterministic: same input → identical output. No LLM. No network.
// Re-uses the existing synthesizers / lane derivation / strategy compression
// so the downloaded artifact matches exactly what the user saw on screen.

import type { SessionState } from '../page'
import { deriveLaneProfile } from './lane-derivation'
import {
  synthesizeCapability,
  synthesizeIdealUser,
  synthesizeVersionOne,
  structuralizeBefore,
  structuralizeAfter,
} from './synthesizers'
import { compressStrategy } from './strategy-compression'

export type ExportableBlueprint = {
  state: SessionState
  label?: string
  savedAt?: number
}

function formatTimestamp(savedAt: number | undefined): string {
  const ts = savedAt ?? Date.now()
  try {
    return new Date(ts).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return new Date(ts).toISOString()
  }
}

function bulletList(items: string[]): string {
  const filtered = items.filter((s) => s && s.trim().length > 0)
  if (filtered.length === 0) return '_Still taking shape._'
  return filtered.map((item) => `- ${item}`).join('\n')
}

function paragraph(text: string): string {
  const t = (text || '').trim()
  return t.length > 0 ? t : '_Still taking shape._'
}

function formatProblemSpace(value: SessionState['problemSpace']): string {
  switch (value) {
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

function formatOpportunityForm(value: SessionState['opportunityForm']): string {
  switch (value) {
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

function safeFilenameSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export function makeBlueprintFilename(input: ExportableBlueprint): string {
  const date = new Date(input.savedAt ?? Date.now())
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const labelSlug = input.label ? safeFilenameSlug(input.label) : ''
  const labelPart = labelSlug ? `-${labelSlug}` : ''
  return `visionair-blueprint-${yyyy}-${mm}-${dd}${labelPart}.md`
}

export function blueprintToMarkdown(input: ExportableBlueprint): string {
  const { state, label, savedAt } = input
  const laneProfile = deriveLaneProfile(state)

  const capability = synthesizeCapability(state.capability, laneProfile)
  const idealUser = synthesizeIdealUser(state.idealUser, laneProfile)
  const versionOne = synthesizeVersionOne(state.versionOne, laneProfile)
  const beforeBullets = structuralizeBefore(state.transformationBefore, laneProfile).slice(0, 4)
  const afterBullets = structuralizeAfter(state.transformationAfter).slice(0, 4)

  const strategy = compressStrategy(
    {
      capability,
      problemSpace: formatProblemSpace(state.problemSpace),
      idealUser,
      versionOne,
      laneProfile,
    },
    state,
  )

  const lines: string[] = []

  lines.push('# VisionAir Blueprint')
  lines.push('')
  if (label && label.trim()) lines.push(`**Title:** ${label.trim()}`)
  lines.push(`**Saved:** ${formatTimestamp(savedAt)}`)
  if (laneProfile?.cognitive || laneProfile?.constraint) {
    const parts = [laneProfile.cognitive, laneProfile.constraint].filter(Boolean) as string[]
    lines.push(`**Lane profile:** ${parts.join(' / ')} (confidence: ${laneProfile.confidence})`)
  }
  lines.push('')
  lines.push('---')
  lines.push('')

  // --- Seed input -------------------------------------------------------
  lines.push('## Your seed')
  lines.push('')
  lines.push(paragraph(state.seedInput))
  lines.push('')

  // --- Capability -------------------------------------------------------
  lines.push('## What you bring (Capability)')
  lines.push('')
  lines.push(bulletList(capability))
  lines.push('')

  // --- Problem space ----------------------------------------------------
  lines.push('## What it solves (Problem space)')
  lines.push('')
  lines.push(paragraph(formatProblemSpace(state.problemSpace)))
  lines.push('')

  // --- Ideal user -------------------------------------------------------
  lines.push('## Who it serves (Ideal user)')
  lines.push('')
  lines.push(bulletList(idealUser))
  lines.push('')

  // --- Transformation ---------------------------------------------------
  lines.push('## Where someone lands (Transformation)')
  lines.push('')
  lines.push('**Before:**')
  lines.push('')
  lines.push(bulletList(beforeBullets))
  lines.push('')
  lines.push('**After:**')
  lines.push('')
  lines.push(bulletList(afterBullets))
  lines.push('')

  // --- Opportunity form -------------------------------------------------
  lines.push('## What form it takes (Opportunity form)')
  lines.push('')
  lines.push(paragraph(formatOpportunityForm(state.opportunityForm)))
  lines.push('')

  // --- Version one ------------------------------------------------------
  lines.push('## Version one')
  lines.push('')
  lines.push(bulletList(versionOne))
  lines.push('')

  // --- Path forward -----------------------------------------------------
  lines.push('## Your path forward')
  lines.push('')
  lines.push('**Immediate:**')
  lines.push('')
  lines.push(paragraph(state.pathForward.immediate))
  lines.push('')
  lines.push('**Near-term:**')
  lines.push('')
  lines.push(paragraph(state.pathForward.nearTerm))
  lines.push('')
  lines.push('**Later:**')
  lines.push('')
  lines.push(paragraph(state.pathForward.later))
  lines.push('')

  lines.push('---')
  lines.push('')

  // --- Strategy (Your Next Move) ---------------------------------------
  lines.push('## Your Next Move')
  lines.push('')
  lines.push('**Core direction**')
  lines.push('')
  lines.push(paragraph(strategy.coreDirection))
  lines.push('')
  lines.push('**What to build first**')
  lines.push('')
  lines.push(paragraph(strategy.whatToBuildFirst))
  lines.push('')
  lines.push('**What this proves**')
  lines.push('')
  lines.push(paragraph(strategy.whatThisProves))
  lines.push('')
  lines.push('**Immediate action — next 24–72 hours**')
  lines.push('')
  if (strategy.immediateAction.length === 0) {
    lines.push('_Still taking shape._')
  } else {
    strategy.immediateAction.forEach((step, i) => {
      lines.push(`${i + 1}. ${step}`)
    })
  }
  lines.push('')
  lines.push('**Constraint**')
  lines.push('')
  lines.push(paragraph(strategy.constraint))
  lines.push('')
  lines.push('**Why this works**')
  lines.push('')
  lines.push(paragraph(strategy.whyThisWorks))
  lines.push('')

  // --- Reflection notes -------------------------------------------------
  const reflection = (state.reflection || '').trim()
  if (reflection && reflection.toLowerCase() !== 'yes') {
    lines.push('---')
    lines.push('')
    lines.push('## Reflection notes')
    lines.push('')
    lines.push(reflection)
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push('_Generated by VisionAir._')
  lines.push('')

  return lines.join('\n')
}

// Browser-only: triggers a file download of the blueprint as Markdown.
// Safe to call from React event handlers in client components.
// No-op if called outside a browser (e.g., during SSR).
export function downloadBlueprint(input: ExportableBlueprint): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const md = blueprintToMarkdown(input)
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const filename = makeBlueprintFilename(input)

  try {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } finally {
    // Defer revoke so Safari/Firefox have a chance to start the download.
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}
