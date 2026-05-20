# VisionAir

A guided intelligence environment that helps capable-but-unclear people turn what they already carry into a structured, trustworthy path they can begin building.

**Live (preview):** `<vercel preview URL>`
**Production:** `<vercel production URL>`

---

## What it is

VisionAir is a 14-step session flow that takes a person from a vague idea, strength, or problem into a concrete blueprint with a single next move. The current product is a fully client-side wizard (no backend, no accounts, no tracking) with deterministic synthesis. The Beta-1.0 release adds an LLM-adaptive question layer for niche-specific follow-ups, a downloadable Markdown artifact at the end, and a production-grade deploy + security pipeline.

---

## Tech stack

- **Framework:** Next.js 14 (App Router)
- **UI:** React 18 + TypeScript
- **Styling:** Tailwind CSS
- **Deploy:** Vercel (auto-deploy from `main`)
- **CI/CD:** GitHub Actions (type-check + build + Trivy security scan)
- **LLM (v1.2+):** Anthropic Claude — Sonnet 4.6 for dynamic questions, Opus 4.7 for final blueprint synthesis
- **Persistence:** Browser `localStorage` (session draft + saved blueprints)

Full architecture: see [`ARCHITECTURE.md`](./ARCHITECTURE.md).
Security policy + pre-commit review checklist: see [`SECURITY.md`](./SECURITY.md).

---

## Local development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000/session` (the root `/` returns 404 by design — `/session` is the entry).

### Environment variables

```bash
# .env.local (gitignored — never commit)
ANTHROPIC_API_KEY=sk-ant-...
```

If `ANTHROPIC_API_KEY` is missing, VisionAir runs in deterministic-fallback mode (the v1.1.5 fixed-question flow). The product never breaks — it degrades.

---

## Production build

```bash
npm run build
npm start
```

---

## Deployment

Push to `main` → Vercel auto-deploys. PRs get unique preview URLs automatically. No manual deploy step.

GitHub Actions runs on every push/PR:
1. TypeScript type-check
2. Next.js production build
3. Trivy filesystem scan (blocks merge on HIGH/CRITICAL vulnerabilities)

Trivy findings appear in the GitHub Security tab.

---

## Session flow

14 screens in order:

1. `welcome` — entry; shows past blueprints and resumable draft if any
2. `starting-point` — pick entry point (strength / problem / idea / direction / unsure)
3. `seed-prompt` — free-text seed
4. `reflection` — confirm or refine the seed
5. `capability` — capability tags
6. `problem-space` — pick problem space
7. `ideal-user` — describe who it serves
8. `transformation` — before/after pair
9. `opportunity-form` — pick output form (platform / tool / service / hybrid / learning)
10. `version-one` — what version one looks like
11. `path-forward` — immediate / near-term / later actions
12. `blueprint` — full synthesized blueprint render
13. `your-next-move` — compressed strategy (one direction, first build, proof, immediate actions, constraint)
14. `closing` — completion + download button

Each screen is a self-contained component in `app/session/flow/`. Session state is managed in `app/session/page.tsx`. Blueprint synthesis is pure-deterministic functions in `app/session/flow/synthesizers.ts` and `app/session/flow/strategy-compression.ts`.

---

## What's new in Beta-1.0 (v1.2.0)

- **LLM-adaptive questions** (incoming) — dynamic follow-up questions based on the user's input, replacing fixed prompts where the lane is clear
- **Downloadable blueprint** — at the closing screen and from each past blueprint card on the welcome screen, download the full session as a Markdown file
- **Session history** — past blueprints already surface on the welcome screen with Open / Download / Delete per entry
- **GitHub Actions CI/CD** — type-check + build + Trivy on every push and PR
- **Security headers** — CSP, HSTS, X-Frame-Options, Permissions-Policy via `next.config.mjs` + `vercel.json`
- **`SECURITY.md`** — operational security standards + pre-commit Claude review checklist
- **`ARCHITECTURE.md`** — full stack documentation

---

## Future scope — Generative AEI

VisionAir is the productization beach-head for **Generative AEI** — an idea-to-substrate pipeline that produces per-idea Digital Brains. The current 14-step session output (raw state + synthesized blueprint + compressed strategy) becomes the input to **ProjectGenesis orchestration** (5-phase pipeline: Idea Pre-Flight → Witness Dispatch → Substrate Generation → Deployment Scaffold → Evolution Loop). Timeline: 6–12 months cumulative to full operational form.

See `ARCHITECTURE.md` §8 for the architectural tie-in.

---

## Repository structure

```
VisionAir/
├── app/                    # Next.js App Router
│   ├── api/                # (Beta-1.0) server routes for LLM calls
│   ├── layout.tsx
│   └── session/            # session controller + flow screens
├── components/             # shared UI primitives
├── docs/                   # design + governance docs (50+ files)
├── archive/                # historical artifacts
├── .github/
│   ├── workflows/ci.yml    # CI: type-check + build + Trivy
│   └── dependabot.yml      # weekly dep updates, grouped
├── ARCHITECTURE.md
├── SECURITY.md
├── README.md
├── next.config.mjs         # security headers + Next.js config
├── vercel.json             # Vercel deploy config + backup headers
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── postcss.config.js
```

---

## License

Private. All rights reserved.

---

## Maintainer

Joshua Ermert · [jseermert@gmail.com](mailto:jseermert@gmail.com)

For security issues, see `SECURITY.md` §11.
