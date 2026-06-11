# VisionAir App-Theme System — Design Spec

**Date:** 2026-06-11
**Status:** Approved design, ready for implementation plan
**Branch plan:** fresh branch off `feat/v3-persona` (the validated Slice-1 line). Local only; no deploy.

## Goal

Make VisionAir's own surface themeable: a **Dark/Light** switch and an **Aurora on/off** switch, plus **custom Primary/Secondary aurora colors** — all controlled from a top-right App Settings panel and persisted per-device. Default is **Dark + Aurora**. This both makes the app feel customizable/engaging and fixes the weak, plain-white landing by giving it the deep-sea look (ported from the operator's portfolio).

This is **dogfooding**: VisionAir's surface uses the same Light/Dark + Aurora presets it will later offer users for their generated packs. The pack-side application is a *separate* slice (Output Preferences) and is explicitly out of scope here.

## Settings model

The entire feature state is one object:

```ts
type ThemeSettings = {
  theme: 'dark' | 'light'   // default 'dark'
  aurora: boolean           // default true
  primary: string           // hex, default '#4E6EF5'  (deep-sea blue)
  secondary: string         // hex, default '#9A5AE6'  (violet)
}
```

All four combinations are valid: Dark+Aurora (default), Dark only, Light+Aurora, Light only. The Primary/Secondary colors are the two aurora glow colors — they have no effect unless Aurora is on, which is why their controls are disabled when Aurora is off.

## Architecture (Approach A: CSS-variable semantic tokens)

Chosen over Tailwind `dark:` variants and `next-themes` because it makes custom colors nearly free (colors = CSS vars), keeps one unified settings object, and avoids per-component `dark:` duplication. Both alternatives would still need CSS vars for the custom colors anyway.

A theme flip works by swapping a single `data-theme` attribute on `<html>`; the CSS variable block repaints every semantic-token component. Aurora colors are injected as `--aurora-1` / `--aurora-2` and consumed by the aurora component's gradients, so picking a color re-tints live.

### Unit 1 — `lib/theme/settings.ts` (pure, no React)

Single source of truth for "settings → DOM." Fully unit-testable.

- `DEFAULTS: ThemeSettings` — dark, aurora on, the two deep-sea hexes.
- `parseSettings(raw: string | null): ThemeSettings` — JSON-parse + sanitize: clamp `theme` to the two allowed values, coerce `aurora` to boolean, hex-validate `primary`/`secondary` (`/^#[0-9a-fA-F]{6}$/`); any invalid/missing field falls back to its default. Never throws.
- `serialize(settings: ThemeSettings): string` — JSON string for localStorage.
- `applyToDocument(settings, htmlEl: HTMLElement): void` — sets `htmlEl.dataset.theme`, `htmlEl.dataset.aurora` (`'on'|'off'`), and the inline CSS vars `--aurora-1`/`--aurora-2` from primary/secondary.

### Unit 2 — `lib/theme/ThemeProvider.tsx` (React context)

- Holds `settings` in state. On mount, reads `localStorage['visionair-theme']` via `parseSettings`. On every change: `serialize` → localStorage (try/catch, best-effort) and `applyToDocument`.
- Exposes `useTheme()` → `{ settings, setTheme, toggleAurora, setPrimary, setSecondary }`.
- Wraps the app in `app/layout.tsx`.

### Unit 3 — No-flash inline script

`layout.tsx` server-renders `<html lang="en" data-theme="dark" data-aurora="on" suppressHydrationWarning>` as the static default (so the very first paint is dark, matching the default, even with no JS). A small `<script>` in `<head>` (dangerouslySetInnerHTML) then runs **before first paint**: it reads `localStorage['visionair-theme']` and, if a saved value exists, overrides `data-theme` + `data-aurora` + the aurora vars synchronously — so returning users who chose light also get no flash. `suppressHydrationWarning` is needed because the script may mutate `<html>` before React hydrates. The script mirrors `applyToDocument`'s logic; if it throws or storage is empty, the static `data-theme="dark"` default stands.

### Unit 4 — CSS tokens

- `app/globals.css`: keep existing `:root` as the **light** values; add a `:root[data-theme="dark"]` block with dark values for `--background`, `--foreground`, `--card`, `--border`, `--muted`, `--soft-muted`. The dark *default* comes from the statically-rendered `<html data-theme="dark">` (see Unit 3), not from redefining bare `:root` — so a no-JS / pre-hydration paint is already dark, matching the default, with no flash.
- `tailwind.config.js`: map `theme.extend.colors` → `{ background: 'var(--background)', foreground: 'var(--foreground)', card: 'var(--card)', border: 'var(--border)', muted: 'var(--muted)' }`. Components then use `bg-background`, `text-foreground`, `border-border`, etc., and flip automatically.

## Visible pieces

### Aurora — `components/theme/Aurora.tsx`

Ports the portfolio's deep-sea field: a `position: fixed` full-page layer behind all content (negative z-index), with blurred radial-gradient orbs that drift (lava-lamp motion). Orbs are colored from `--aurora-1`/`--aurora-2`.

- Renders `null` when `settings.aurora` is false.
- **Blend adapts per theme:** `mix-blend-mode: screen` (glow) on dark; `mix-blend-mode: multiply` at low opacity on light, so Light+Aurora reads as gentle tinted color on cream rather than washing out. Exact opacities tuned live.
- Reduced-motion-safe: under `prefers-reduced-motion: reduce`, orbs are static (no animation).
- Visual correctness validated by live eyeball (smoke test), not unit assertions.

### Settings panel — `components/theme/SettingsPanel.tsx` + trigger

- A top-right trigger ("Settings" gear) in `layout.tsx`, so it's on every screen.
- Opens a popover with: **Theme** switch (Dark/Light), **Aurora** switch (On/Off), and a divided "Aurora colors" section with **Primary** + **Secondary** swatches.
- The Aurora-colors section is **disabled + greyed (opacity ~0.4) with "Turn Aurora on to customize"** when `settings.aurora` is false.
- Tapping an active swatch opens a Figma-style picker (`react-colorful` — ~2.8 KB, zero deps): gradient square + hue slider + hex field. The aurora re-tints live as the color changes.
- Closes on Escape and click-outside; keyboard-accessible; focus-trapped while open.

### Landing redesign — `app/page.tsx`

Re-themed to semantic tokens (flips with theme), aurora behind it, and sharper problem-first copy:
- Eyebrow: "VisionAir · Build Mode"
- Headline: **"Your AI agent starts every project blind."**
- Sub: **"VisionAir interviews you about what's missing, then hands it a real blueprint — not a blank prompt. Ready-to-build context packs for Claude Code and other AI coding agents."**
- CTA "Open Build Mode →" + optional "Log in to save your library."

### Component migration

Swap hardcoded `text-black` / `bg-white` / `border-black/10` (and similar) → semantic tokens across the user-facing surface: shared shell (`screen-shell`, `screen-intro`, `primary-button`, `secondary-button`), the Build-Mode flow screens (`BuildClient`, `selector`, seed, interview, blueprint), and the landing. Since v2 is Build-Mode-only, this is the whole live surface. One-time touch; the dormant `/session` flow is not themed.

## Testing strategy (TDD)

- `lib/theme/settings.ts` — unit tests: parse valid/garbage/missing/bad-hex/bad-theme; serialize round-trip; applyToDocument sets attributes + vars (jsdom).
- `ThemeProvider` — component test: defaults to dark+aurora; toggleAurora/setTheme flip + persist; hydrates from existing localStorage.
- `SettingsPanel` — component test: switches render; color section disabled when aurora off; switch clicks call setters; color change calls setPrimary; Escape/click-outside closes.
- `Aurora` — renders null when off, orbs when on, reads the vars.
- No-flash + visual correctness — live smoke check (no white flash on dark load; aurora looks right both themes).

## Implementation slices (for the plan)

1. `lib/theme/settings.ts` (pure core, test-first)
2. CSS tokens — globals.css dark block + tailwind color mapping
3. `ThemeProvider` + no-flash script + wrap layout
4. Migrate components to semantic tokens
5. Aurora component (gated, var-colored, blend-per-theme, reduced-motion)
6. SettingsPanel + trigger + the two switches
7. Color pickers (`react-colorful`) wired to primary/secondary + grey-out gate
8. Landing redesign + sharper copy

Tasks 1–6 deliver a working theme + aurora + switches. Tasks 7 (custom colors) and 8 (landing polish) are clean fast-follows; 7 detaches cleanly if anything must be deferred.

## Edge cases / error handling

- localStorage unavailable (private mode / SSR) → defaults; persistence is best-effort (try/catch); app still works.
- Garbage in storage → `parseSettings` sanitizes to defaults.
- Hydration mismatch → avoided: inline script sets `data-theme` before React; provider reads the same value; `suppressHydrationWarning` on `<html>`.
- No-flash script failure → CSS defaults to dark; no crash.

## Out of scope (YAGNI)

- Account/DB sync of preferences (localStorage per-device only).
- Custom colors flowing into the generated pack (separate Output-Preferences slice).
- System-preference auto-detect (default is a hard Dark+Aurora).
- More than two aurora colors; theming the dormant `/session` flow; a full settings page (popover only).

## Sequencing

Built on a fresh branch off `feat/v3-persona`, TDD, no deploy. Merges/deploys to production remain gated behind the operator (and the separate Pillar-A DB migration when that ships).
