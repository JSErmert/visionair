# VisionAir — Architecture

**Version:** v1.1.5 (current) → v1.2.0 (incoming Beta-1.0 changes)
**Last updated:** 2026-05-18

VisionAir is a guided intelligence environment that helps capable-but-unclear people turn what they already carry into a structured, trustworthy path they can begin building. The current product is a deterministic, client-side session wizard (14 flow screens). The Beta-1.0 upgrade introduces LLM-adaptive questions, a downloadable final artifact, and a CI/CD-driven deployment pipeline. The longer-term scope is to make VisionAir the productization beach-head for **Generative AEI** — an idea-to-substrate pipeline producing per-idea Digital Brains.

---

## 1. Tech stack (current)

### Frontend / runtime

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14.2.5 |
| UI library | React | 18.3.1 |
| Language | TypeScript | 5.4.5 |
| Styling | Tailwind CSS | 3.4.4 |
| Build tool | Next.js (Turbopack on dev, webpack on build) | bundled |
| Node runtime | Node.js | ≥20 (currently 24.14.0 local) |

### Persistence (current)

- **Client-side only.** Browser `localStorage` via `app/session/persistence.ts`
- Two stores:
  - `activeDraft` — autosave-per-keystroke during an in-progress session (suppressed at welcome, past closing, when viewing past blueprint, and after finalization)
  - `savedBlueprintIndex` — append-only list of completed sessions; each entry includes the full `SessionState` + an id + timestamp
- No backend. No database. No user accounts.

### Tunneling / dev access

- `ngrok` (v3.39.1 local) used for sharing local dev with external reviewers
- Tunnel routes `https://<subdomain>.ngrok-free.dev` → `localhost:3000`

### External integrations (current)

None. Fully self-contained.

---

## 2. Tech stack (Beta-1.0 incoming)

### LLM integration

- **Provider:** Anthropic
- **Models:**
  - `claude-sonnet-4-6` for in-flow dynamic question generation (light-to-medium reasoning, low-latency, mid-cost)
  - `claude-opus-4-7` for final blueprint synthesis (heavy synthesis at end of session where full context is available)
- **SDK:** `@anthropic-ai/sdk` (TypeScript native)
- **Surface:** Next.js API routes (`app/api/*/route.ts`) — server-side only, never exposes the API key to the client
- **Key management:** `ANTHROPIC_API_KEY` environment variable (managed via Vercel Environment Variables UI in production; `.env.local` in dev)

### Deployment

- **Target:** Vercel
- **Trigger:** Push to `main` branch (auto-deploy)
- **URL pattern:** `visionair-<hash>.vercel.app` for previews, custom domain for production
- **TLS:** Auto-managed by Vercel (no manual cert work)
- **CDN:** Vercel Edge Network (global)
- **Server functions:** Vercel serverless / edge functions for API routes

### CI/CD

- **GitHub Actions workflow** runs on every push/PR:
  - Type-check (`tsc --noEmit`)
  - Build (`next build`) — catches build-time errors
  - Trivy security scan (vulnerabilities in dependencies)
  - Claude code review against `SECURITY.md` standards (pre-merge gate)
- **Vercel** picks up `main` branch push and auto-deploys after GHA checks pass

### Security (full spec lives in `SECURITY.md`)

- No client-side secrets — Anthropic API key never reaches browser
- HTTPS-only (Vercel enforces)
- Content Security Policy headers (Next.js config)
- Rate limiting on API routes (per-IP, per-session)
- Input length caps on all user-text fields
- LLM prompts sanitized (no user input directly concatenated into system prompts)
- Dependency scanning (Trivy in CI)
- Pre-commit Claude review against SECURITY.md

---

## 3. Folder structure

```
VisionAir/
├── app/
│   ├── layout.tsx                       # root layout, sets HTML shell + globals.css
│   ├── globals.css                      # Tailwind directives + base styles
│   ├── api/                             # (Beta-1.0) — Next.js API routes for LLM calls
│   │   ├── question/route.ts            # POST: generates next dynamic question
│   │   └── blueprint/route.ts           # POST: synthesizes final blueprint
│   └── session/
│       ├── page.tsx                     # main session controller — manages step index, state, persistence
│       ├── persistence.ts               # localStorage read/write — activeDraft + savedBlueprintIndex
│       └── flow/
│           ├── welcome.tsx              # step 0 — hero; resume / start fresh / saved list
│           ├── starting-point.tsx       # step 1 — entry-point picker (strength / problem / idea / direction / unsure)
│           ├── seed-prompt.tsx          # step 2 — free-text seed input
│           ├── reflection.tsx           # step 3 — confirm or refine the seed
│           ├── capability.tsx           # step 4 — capability tags (multi-select)
│           ├── problem-space.tsx        # step 5 — problem space (structure/guidance/opportunity)
│           ├── ideal-user.tsx           # step 6 — ideal user free-text
│           ├── transformation.tsx       # step 7 — before / after pair
│           ├── opportunity-form.tsx     # step 8 — output form picker
│           ├── version-one.tsx          # step 9 — version-one description
│           ├── path-forward.tsx         # step 10 — immediate / near-term / later actions
│           ├── blueprint.tsx            # step 11 — full synthesized blueprint render
│           ├── your-next-move.tsx       # step 12 — compressed strategy + Finish button
│           ├── closing.tsx              # step 13 — completion screen; (Beta-1.0) download button
│           ├── synthesizers.ts          # deterministic synthesis functions (capability / ideal-user / transformation / version-one)
│           ├── structural-primitives.ts # building blocks for synthesizers
│           ├── strategy-compression.ts  # blueprint → single actionable strategy compressor
│           └── lane-derivation.ts       # deterministic lane profile detection from session input
├── components/
│   ├── primary-button.tsx
│   ├── secondary-button.tsx
│   ├── screen-intro.tsx
│   └── screen-shell.tsx
├── docs/                                # extensive design + report docs (50+ files)
├── archive/                             # historical artifacts
├── .github/                             # (Beta-1.0) — workflows/
├── ARCHITECTURE.md                      # this file
├── SECURITY.md                          # (Beta-1.0) — security standards + Claude-review checklist
├── README.md                            # (existing or to-be-written)
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── next-env.d.ts
└── .gitignore
```

---

## 4. Runtime architecture (current — deterministic v1.1.5)

```
User browser
    │
    ▼
[Next.js dev/prod server]  ← localhost:3000 (dev) or visionair.vercel.app (prod)
    │
    ▼
app/session/page.tsx (client component, "use client")
    │
    │  manages:
    │  - stepIndex (0–13)
    │  - SessionState (all fields)
    │  - hasMounted / hasDraft / savedBlueprints
    │  - isViewingPastBlueprint / isFinalized
    │
    │  effects:
    │  - hydrate from localStorage on mount
    │  - autosave activeDraft on every state change (with guards)
    │  - finalize on Your Next Move → Closing transition
    │
    ▼
Flow screens (one per step)
    │
    ├── User input → updateState() → setState
    ├── Next/Back → setStepIndex
    └── Persistence side-effects → persistence.ts
                                          │
                                          ▼
                              localStorage (browser)
                              ├── activeDraft
                              └── savedBlueprintIndex
```

### Synthesis layer

The Blueprint screen renders a **derived** view of session state — not the raw input:

```
Raw SessionState
    │
    ▼
deriveLaneProfile() — deterministic lane detection
    │
    ▼
synthesizeCapability()    ──┐
synthesizeIdealUser()       │
formatTransformation()      ├──→ blueprintData
formatProblemSpace()        │
formatOpportunityForm()     │
synthesizeVersionOne()    ──┘
    │
    ▼
Blueprint.tsx renders blueprintData
    │
    ▼
compressStrategy(blueprintData, state) → strategy
    │
    ▼
YourNextMove.tsx renders strategy (deterministic compression to single actionable plan)
```

All synthesis is **pure function** — no external API calls, no LLM, no async work. This will remain true for the deterministic fallback path even after LLM integration.

---

## 5. Runtime architecture (Beta-1.0 — LLM-adaptive)

```
User browser
    │
    ▼
Next.js (Vercel)
    │
    ▼
app/session/page.tsx (client)
    │
    │  on each step transition + user-input event:
    │
    ▼
fetch('/api/question', { method: 'POST', body: { state, currentStep, history } })
    │
    ▼
app/api/question/route.ts (server, runs on Vercel edge function)
    │
    │  validates input (length caps, schema)
    │  rate-limits (per-IP / per-session)
    │  builds system prompt from SECURITY.md sanitized template
    │
    ▼
Anthropic API (claude-sonnet-4-6)
    │
    ▼
Response: { nextQuestion: string, intent: string, fallbackToFixed: boolean }
    │
    ▼
Client renders dynamic question OR falls through to existing fixed screen if fallbackToFixed=true

────────────────────────────────────────

At end of session (Blueprint step):

fetch('/api/blueprint', { method: 'POST', body: { fullSessionState } })
    │
    ▼
app/api/blueprint/route.ts (server)
    │
    ▼
Anthropic API (claude-opus-4-7)
    │
    ▼
Full synthesized blueprint + strategy compression + downloadable output

────────────────────────────────────────

At Closing (Beta-1.0 download button):

User clicks Download
    │
    ▼
Client-side: serialize blueprintData + strategy + sessionState
    │
    ▼
Generate file (.md or .pdf) in-browser (no server roundtrip needed for the download itself)
    │
    ▼
Trigger browser download
```

### Fallback path

If `ANTHROPIC_API_KEY` is missing, network fails, or rate limit hits, the system falls back to the deterministic v1.1.5 path — fixed questions, deterministic synthesizers, no LLM. The product never breaks; it degrades.

---

## 6. Data model

### `SessionState` (canonical session shape)

```typescript
type SessionState = {
  entryPoint: 'strength' | 'problem' | 'idea' | 'direction' | 'unsure' | ''
  seedInput: string
  reflection: string
  capability: string[]
  problemSpace: 'structure' | 'guidance' | 'opportunity' | ''
  idealUser: string
  transformationBefore: string
  transformationAfter: string
  opportunityForm: 'platform' | 'tool' | 'service' | 'hybrid' | 'learning' | ''
  versionOne: string
  pathForward: {
    immediate: string
    nearTerm: string
    later: string
  }
}
```

### `SavedBlueprint` (persistence shape)

```typescript
type SavedBlueprint = {
  id: string           // generated UUID
  savedAt: number      // unix epoch ms
  state: SessionState  // full snapshot at finalization
}
```

### `LaneProfile` (derived)

```typescript
type LaneProfile = {
  primaryLane: string
  confidence: 'low' | 'medium' | 'high'
  signals: string[]
}
```

---

## 7. Persistence model

### Storage keys

- `visionair:active-draft` — JSON `{ state: SessionState, stepIndex: number, savedAt: number }`
- `visionair:saved-blueprints` — JSON `{ blueprints: SavedBlueprint[] }`

### Write semantics

- Autosave on every state change, gated by `hasMounted`, not on welcome, not past closing, not when viewing past blueprint, not when finalized
- Append-only saved-blueprint index
- Single source of truth: the in-memory `state` is the live truth; localStorage is the durability layer

### Privacy implications

- All data lives in the user's browser. Nothing leaves the device for the deterministic flow.
- LLM integration changes this: prompt text + session context are sent to Anthropic API for inference. `SECURITY.md` documents what is sent, what is logged, and what the operator-facing privacy posture is.

---

## 8. Future architecture — Generative AEI tie-in

When the AEI Trinity (`AEI` Execution + `ACG` Cognitive Governance + `ACE` Coherence Engineering) is operational, VisionAir's session output becomes the **input** to ProjectGenesis orchestration:

```
VisionAir session (current 14-step flow, LLM-adaptive)
    │
    │  outputs:
    │  - SessionState (raw)
    │  - Blueprint (synthesized)
    │  - Strategy (compressed)
    │
    ▼
ProjectGenesis Phase 1: Idea Pre-Flight
    │
    ▼
ProjectGenesis Phase 2: Witness Dispatch (idea-modified — Conversational + Implementation + Literature)
    │
    ▼
ProjectGenesis Phase 3: Substrate Generation
    │
    ▼
ProjectGenesis Phase 4: Deployment Scaffold
    │
    ▼
ProjectGenesis Phase 5: Evolution Loop
    │
    ▼
Per-idea Digital Brain (with agentic creation + reasoning + deployment scope)
```

In this view, VisionAir is the **front-end** of Generative AEI: the surface where a person's idea enters the pipeline. The current closing-page download button + saved-blueprint index are the v1 interfaces to this pipeline — the operator collects blueprints, then runs them through ProjectGenesis manually until the trinity automates the handoff.

See `digital-brain/roadmap/meta-to-projectgenesis-inflection.md` (in operator's separate repo) for the 5-phase timeline. Estimate: 6–12 months cumulative to full operational form.

---

## 9. Build / run / deploy commands

### Local development

```bash
npm install
npm run dev              # starts on http://localhost:3000
```

### Production build

```bash
npm run build            # compiles to .next/
npm start                # serves the production build
```

### Deploy

Push to `main` on GitHub → Vercel auto-deploys. No manual step.

Preview deploys: every PR gets a unique URL automatically.

### Local environment variables

```
# .env.local (gitignored)
ANTHROPIC_API_KEY=sk-ant-...
```

### Vercel environment variables

Managed in Vercel dashboard → Project Settings → Environment Variables. Encrypted at rest. Never exposed to client bundles.

---

## 10. Versioning

VisionAir follows internal semantic versioning tied to milestone reports in `docs/reports/`:

- **v1.0.x** — initial build through synthesis layer maturation
- **v1.1.x** — session persistence, lane derivation, strategy compression, finalization stability
- **v1.2.x** — *(Beta-1.0)* LLM-adaptive questions, download artifact, CI/CD, security hardening, session history UI

Each numbered minor version has a corresponding report in `docs/reports/v1.x.x-*.md`.

---

## 11. References

- Anthropic API docs: https://docs.anthropic.com/
- Next.js 14 App Router: https://nextjs.org/docs/app
- Vercel deploy docs: https://vercel.com/docs
- Trivy security scanner: https://github.com/aquasecurity/trivy
- VisionAir governance + doctrine: `docs/founding-doctrine.md`, `docs/governance-principles.md`, `docs/contract-authority-and-supersession.md`

---

## Last Updated

2026-05-18 — initial ARCHITECTURE.md authored. Documents current v1.1.5 deterministic state + incoming v1.2 / Beta-1.0 LLM-adaptive + CI/CD + security hardening + Vercel deploy + Generative AEI future tie-in. Companion file: `SECURITY.md` (to be authored next).
