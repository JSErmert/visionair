import PrimaryButton from '@/components/primary-button'
import ScreenShell from '@/components/screen-shell'
import type { SavedBlueprint } from '../persistence'
import { downloadBlueprint } from './export-markdown'

type WelcomeProps = {
  onNext: () => void
  hasDraft?: boolean
  savedBlueprints?: SavedBlueprint[]
  onResumeDraft?: () => void
  onStartFresh?: () => void
  onOpenBlueprint?: (id: string) => void
  onRemoveBlueprint?: (id: string) => void
}

function formatSavedAt(savedAt: number): string {
  try {
    const date = new Date(savedAt)
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export default function Welcome({
  onNext,
  hasDraft = false,
  savedBlueprints = [],
  onResumeDraft,
  onStartFresh,
  onOpenBlueprint,
  onRemoveBlueprint,
}: WelcomeProps) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <ScreenShell className="max-w-2xl p-10">
        <div className="mb-8">
          <p className="mb-3 text-sm tracking-wide text-foreground/50">
            VisionAir
          </p>

          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-foreground">
            You do not need a perfect idea to begin.
          </h1>

          <p className="mx-auto max-w-xl text-base leading-7 text-foreground/70">
            VisionAir helps you turn something real — a strength, a problem you
            care about, a direction, or even a vague idea — into a structured
            path you can actually build.
          </p>
        </div>

        {hasDraft && (
          <div className="mb-8 rounded-md border border-border/15 bg-foreground/[0.03] p-5 text-left">
            <p className="mb-1 text-sm font-medium text-foreground">
              You have a session in progress.
            </p>
            <p className="mb-4 text-sm text-foreground/65">
              Pick up where you left off, or start fresh and keep your past
              blueprints.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onResumeDraft}
                className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-foreground/85"
              >
                Resume
              </button>
              <button
                type="button"
                onClick={onStartFresh}
                className="rounded-md border border-border/20 bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-foreground/[0.04]"
              >
                Start fresh
              </button>
            </div>
          </div>
        )}

        {savedBlueprints.length > 0 && (
          <div className="mb-8 rounded-md border border-border/10 bg-card p-5 text-left">
            <p className="mb-3 text-sm font-medium text-foreground">
              Past blueprints
            </p>
            <ul className="flex flex-col gap-2">
              {savedBlueprints
                .slice()
                .sort((a, b) => b.savedAt - a.savedAt)
                .map((blueprint) => (
                  <li
                    key={blueprint.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-border/10 px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">
                        {blueprint.label}
                      </p>
                      <p className="text-xs text-foreground/50">
                        {formatSavedAt(blueprint.savedAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          downloadBlueprint({
                            state: blueprint.state,
                            label: blueprint.label,
                            savedAt: blueprint.savedAt,
                          })
                        }
                        className="rounded-md border border-border/15 bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-foreground/[0.04]"
                        title="Download as Markdown"
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenBlueprint?.(blueprint.id)}
                        className="rounded-md border border-border/15 bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-foreground/[0.04]"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveBlueprint?.(blueprint.id)}
                        className="rounded-md border border-border/15 bg-card px-3 py-1.5 text-xs font-medium text-foreground/70 transition hover:bg-foreground/[0.04]"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        )}

        <div className="mb-8">
          <p className="text-sm text-foreground/55">
            You do not need polished answers. You only need a real starting
            point.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <PrimaryButton onClick={onNext}>Begin</PrimaryButton>

          <p className="text-sm text-foreground/45">
            We will discover the structure together.
          </p>
        </div>
      </ScreenShell>
    </div>
  )
}
