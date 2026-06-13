# VisionAir v4 — Deferred Backlog

**v3 shipped 2026-06-13** (tag `visionair-v3`, live at `visionair-sable.vercel.app`):
Build Mode × Claude Code across all three Levels (Beginner / Intermediate / Expert),
interview → blueprint → context pack, multi-tenant accounts (signup / login / owner-scoped
library), and the UX polish (loading states, rendered blueprint, next-steps). Everything
below was found deferred on the v3 branch or recorded in the v-next notes.

## 1. Persona-matrix completion (the headline v4 work)
v3 wired only **Build × Claude Code**. The data model already retains every value
(`lib/build-mode/persona.ts` — `Purpose` / `Platform` types + `PLATFORM_DEFAULT`); only the
end-to-end paths and the UI gating are deferred. Source: `docs/reference/visionair-future-plans.md`.

**Purposes** — "What are you making" (forks output *content*); each needs its own
interview → synthesis → packaging path:
- **Operate an AI** — an assistant that runs/governs an operation by the user's rules → Claude.ai
- **Automate a workflow** — streamline one repetitive process end to end → Claude.ai
- **Decide a direction** — turn a fuzzy idea into a clear path + next move → Claude.ai
- **An ongoing helper** — a companion for a recurring task that learns the user's world → ChatGPT
- **I'm not sure yet** — discovery to surface the real purpose → Claude.ai

**Platforms** — "Where it'll run" (forks output *packaging*):
- **Claude.ai** — a governed Claude Project / corpus
- **ChatGPT** — most accessible for a personal helper

Bring-back per option: (1) implement the path, (2) re-add its card in
`app/build/selector.tsx`, (3) re-enable selection. No model change needed.

## 2. The /session ProjectGenesis self-discovery flow
Currently **dormant** — Build Mode reuses its components (`seed-prompt`, `lane-derivation`,
`reflection`). The full self-discovery → blueprint → genesis flow, plus the homepage
`/session` entry (the "persona delineation that brings it back arrives in a later slice"
note in `app/page.tsx`), are deferred.

## 3. Voice input
Deleted in v3 (the button had no handler — did nothing). Real speech-to-text input → v4.

## 4. Idea backlog (from the v-next notes)
- Drag-drop **PDF/MD context upload** — parse docs at the start, pre-cover the coverage model
- **Repo-ingestion**
- **Design / experience preset layer** (the five-exemplar UI presets)
- Portable exports · live-preview · good-enough-stop · example-answers ·
  live-contradiction-surfacing · provenance UI · archetypes · doctrine-from-corpus

## 5. Validation milestone (not a feature — the open gap)
The ExoGenius blueprint-fit pass-signal — **"3 unaffiliated first-time users complete a
session and confirm the blueprint fit, observed/logged"** — remains **UNMET**. v3's
multi-tenant signup is precisely what now makes it gatherable. The auto-push gate was
removed (it was friction-as-theater); run the behavioral gate **manually** when claiming
validation:

```
exogenius gate --deliverable visionair --evidence <session-logs>
```
