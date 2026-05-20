import type { SessionState } from './page'

const SCHEMA_VERSION = 1
const ACTIVE_DRAFT_KEY = 'visionair:active-draft'
const SAVED_BLUEPRINTS_KEY = 'visionair:saved-blueprints'

export type ActiveDraft = {
  schemaVersion: number
  savedAt: number
  state: SessionState
  stepIndex: number
}

export type SavedBlueprint = {
  id: string
  schemaVersion: number
  savedAt: number
  label: string
  state: SessionState
}

export type SavedBlueprintIndex = {
  schemaVersion: number
  blueprints: SavedBlueprint[]
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function safeRead(key: string): string | null {
  if (!isBrowser()) return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeWrite(key: string, value: string): void {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* best-effort: quota, private mode, etc. */
  }
}

function safeRemove(key: string): void {
  if (!isBrowser()) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* best-effort */
  }
}

export function readActiveDraft(): ActiveDraft | null {
  const raw = safeRead(ACTIVE_DRAFT_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as ActiveDraft
    if (parsed.schemaVersion !== SCHEMA_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

// v1.1.5 — Active-draft eligibility (Fix 2).
// A persisted draft is only resumable if its stepIndex is strictly before the
// completion boundary. Drafts at or beyond the closing step represent a
// finalized session that should NOT be re-exposed as "session in progress."
// Caller (page.tsx) supplies the completion-boundary index — keeps persistence
// decoupled from the steps array.
export function isResumableActiveDraft(
  draft: ActiveDraft | null,
  completionStepIndex: number,
): boolean {
  if (!draft) return false
  return draft.stepIndex < completionStepIndex
}

export function writeActiveDraft(state: SessionState, stepIndex: number): void {
  const draft: ActiveDraft = {
    schemaVersion: SCHEMA_VERSION,
    savedAt: Date.now(),
    state,
    stepIndex,
  }
  safeWrite(ACTIVE_DRAFT_KEY, JSON.stringify(draft))
}

export function clearActiveDraft(): void {
  safeRemove(ACTIVE_DRAFT_KEY)
}

export function readSavedBlueprintIndex(): SavedBlueprintIndex {
  const raw = safeRead(SAVED_BLUEPRINTS_KEY)
  if (!raw) return { schemaVersion: SCHEMA_VERSION, blueprints: [] }
  try {
    const parsed = JSON.parse(raw) as SavedBlueprintIndex
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      return { schemaVersion: SCHEMA_VERSION, blueprints: [] }
    }
    return parsed
  } catch {
    return { schemaVersion: SCHEMA_VERSION, blueprints: [] }
  }
}

function writeSavedBlueprintIndex(index: SavedBlueprintIndex): void {
  safeWrite(SAVED_BLUEPRINTS_KEY, JSON.stringify(index))
}

function generateId(): string {
  return `bp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function deriveLabel(state: SessionState): string {
  const seed = (state.seedInput || (state.capability || []).join(' ') || '').trim()
  if (!seed) return 'Untitled blueprint'
  const firstLine = seed.split(/\r?\n/)[0].trim()
  return firstLine.length > 60 ? `${firstLine.slice(0, 57)}…` : firstLine
}

export function appendSavedBlueprint(state: SessionState): SavedBlueprint {
  const blueprint: SavedBlueprint = {
    id: generateId(),
    schemaVersion: SCHEMA_VERSION,
    savedAt: Date.now(),
    label: deriveLabel(state),
    state,
  }
  const current = readSavedBlueprintIndex()
  const next: SavedBlueprintIndex = {
    schemaVersion: SCHEMA_VERSION,
    blueprints: [...current.blueprints, blueprint],
  }
  writeSavedBlueprintIndex(next)
  return blueprint
}

export function deleteSavedBlueprint(id: string): void {
  const current = readSavedBlueprintIndex()
  const next: SavedBlueprintIndex = {
    schemaVersion: SCHEMA_VERSION,
    blueprints: current.blueprints.filter((blueprint) => blueprint.id !== id),
  }
  writeSavedBlueprintIndex(next)
}

export function findSavedBlueprint(id: string): SavedBlueprint | null {
  return readSavedBlueprintIndex().blueprints.find((blueprint) => blueprint.id === id) ?? null
}
