# VisionAir — Future Plans (deferred, not yet wired)

These options were previously shown in the Build-Mode selector as "coming soon" but are
**not implemented end to end**. They've been removed from the live UI so users only see
wired choices. Each returns to the selector (`app/build/selector.tsx`) once it's actually
wired through interview → synthesis → packaging.

**Live today:** **Build × Claude Code**, across all three support levels
(Beginner / Intermediate / Expert — the wired Level fork that tunes the interview).

## Deferred purposes — "What are you making" (forks output CONTENT)
| Purpose | Description | Suggested platform |
|---|---|---|
| Operate an AI | An assistant that runs or governs an operation by the user's rules. | Claude.ai |
| Automate a workflow | Streamline one repetitive process end to end. | Claude.ai |
| Decide a direction | Turn a fuzzy idea into a clear path and next move. | Claude.ai |
| An ongoing helper | A companion for a recurring task — it learns the user's world. | ChatGPT |
| I'm not sure yet | Discovery to surface the real purpose. | Claude.ai |

## Deferred platforms — "Where it'll run" (forks output PACKAGING)
| Platform | Notes |
|---|---|
| Claude.ai | A governed Claude Project / corpus. |
| ChatGPT | Most accessible for a personal helper. |

## How to bring one back
1. Implement its end-to-end path (the content fork for a purpose; the packaging fork for a platform).
2. Re-add its card to `app/build/selector.tsx` (and re-enable selection there).
3. The data model already supports it: the `Purpose` / `Platform` types and
   `PLATFORM_DEFAULT` in `lib/build-mode/persona.ts` retain every value, so nothing in the
   model needs to change — only the UI gating and the new path.

See the design rationale in `docs/superpowers/specs/2026-06-09-v3-persona-fork-design.md`.
