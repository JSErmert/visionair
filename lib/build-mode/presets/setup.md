<!-- [preset] VALIDATED DEFAULT for the Next.js/TS/Vercel house stack — verify against THIS app; flag any mismatch as a gap in docs/context/07-known-gaps.md. Authority: see citations inline. -->

# SETUP — Getting Started

> Authority: 12-Factor App §II Dependencies, §III Config; Node.js LTS release schedule.

---

## Prerequisites

| Requirement | Version | Check |
|---|---|---|
| Node.js | 20.x LTS (see `engines` in `package.json`) | `node --version` |
| npm | 10.x+ (bundled with Node 20) | `npm --version` |
| Git | 2.40+ | `git --version` |

---

## Initial Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd <repo-name>

# 2. Install dependencies (lockfile-enforced — do NOT use npm install)
npm ci

# 3. Copy the environment variable template and fill in values
cp .env.example .env.local
# Edit .env.local — never commit this file
```

---

## Environment Variables

All required variables are listed in `.env.example` with descriptions but no values.  
See `docs/context/06-security.md` for the secrets management policy — in particular:

- No secrets in `NEXT_PUBLIC_*` variables (they are bundled into client JS).
- Server-side secrets live only in `.env.local` (local) and the deployment platform's secret store (CI/production).

---

## Running Locally

```bash
# Development server (hot-reload)
npm run dev

# Type check
npx tsc --noEmit

# Run tests (Vitest)
npm test

# Build for production
npm run build

# Start production build locally
npm run start
```

---

## Running CI Locally

Replicate the CI pipeline locally before pushing:

```bash
npm ci
npx tsc --noEmit
npm run build
npm test
npm audit  # advisory — does not fail
```

For secret scanning locally, install [gitleaks](https://github.com/gitleaks/gitleaks) and run:
```bash
gitleaks detect --source . --verbose
```

---

## Optional: Claude Code Superpowers Plugin

The workflow in `docs/context/08-workflow.md` references optional `superpowers:*` skills. To enable them:

```bash
# Requires Claude Code installed globally
# See https://github.com/anthropics/claude-code-superpowers for installation
```

This is entirely optional — all workflows function without the plugin.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `npm ci` fails | Ensure `package-lock.json` is committed. Delete `node_modules` and retry. |
| TypeScript errors after `npm ci` | Check Node version matches `engines` in `package.json`. |
| Missing env vars at runtime | Compare `.env.local` against `.env.example`. |
| CI fails on type-check locally | Run `npx tsc --noEmit` to see the full error list. |
