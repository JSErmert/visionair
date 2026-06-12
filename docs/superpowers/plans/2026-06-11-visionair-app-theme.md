# VisionAir App-Theme System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give VisionAir's own surface a Dark/Light + Aurora-on/off theme with custom primary/secondary aurora colors, controlled from a top-right settings panel, persisted per-device, defaulting to Dark+Aurora — and redesign the landing to use it.

**Architecture:** CSS-variable semantic tokens (Approach A). A pure `settings` module is the single source of truth for "settings → DOM"; a `ThemeProvider` holds the one settings object, persists to localStorage, and applies it; an inline no-flash script applies the saved theme before first paint. Components use semantic Tailwind tokens (`bg-background`, `text-foreground`, …) mapped to CSS vars that flip on `data-theme`. Aurora is a gated component colored by `--aurora-1/2`.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind (CSS-var colors with `<alpha-value>`), Vitest + @testing-library/react (jsdom), react-colorful.

**Branch:** `feat/app-theme` (already created off `feat/v3-persona`). No deploy.

**Reference spec:** `docs/superpowers/specs/2026-06-11-visionair-app-theme-design.md`

---

### Task 1: Pure settings core (`lib/theme/settings.ts`)

**Files:**
- Create: `lib/theme/settings.ts`
- Test: `lib/theme/settings.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/theme/settings.test.ts
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { parseSettings, serialize, applyToDocument, DEFAULTS } from './settings';

describe('parseSettings', () => {
  it('returns defaults for null', () => {
    expect(parseSettings(null)).toEqual(DEFAULTS);
  });
  it('returns defaults for non-JSON', () => {
    expect(parseSettings('{not json')).toEqual(DEFAULTS);
  });
  it('round-trips a valid object', () => {
    const v = { theme: 'light' as const, aurora: false, primary: '#112233', secondary: '#445566' };
    expect(parseSettings(serialize(v))).toEqual(v);
  });
  it('falls back per-field on invalid values', () => {
    const raw = JSON.stringify({ theme: 'purple', aurora: 'yes', primary: 'blue', secondary: '#zzzzzz' });
    expect(parseSettings(raw)).toEqual(DEFAULTS);
  });
});

describe('applyToDocument', () => {
  it('sets data attributes and aurora vars on the element', () => {
    const html = document.documentElement;
    applyToDocument({ theme: 'light', aurora: false, primary: '#112233', secondary: '#445566' }, html);
    expect(html.dataset.theme).toBe('light');
    expect(html.dataset.aurora).toBe('off');
    expect(html.style.getPropertyValue('--aurora-1')).toBe('#112233');
    expect(html.style.getPropertyValue('--aurora-2')).toBe('#445566');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/theme/settings.test.ts`
Expected: FAIL — cannot find module `./settings`.

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/theme/settings.ts
export type ThemeSettings = {
  theme: 'dark' | 'light';
  aurora: boolean;
  primary: string;
  secondary: string;
};

export const DEFAULTS: ThemeSettings = {
  theme: 'dark',
  aurora: true,
  primary: '#4E6EF5',
  secondary: '#9A5AE6',
};

export const STORAGE_KEY = 'visionair-theme';

const HEX = /^#[0-9a-fA-F]{6}$/;

export function parseSettings(raw: string | null): ThemeSettings {
  if (!raw) return { ...DEFAULTS };
  let obj: unknown;
  try {
    obj = JSON.parse(raw);
  } catch {
    return { ...DEFAULTS };
  }
  if (typeof obj !== 'object' || obj === null) return { ...DEFAULTS };
  const o = obj as Record<string, unknown>;
  return {
    theme: o.theme === 'light' ? 'light' : 'dark',
    aurora: typeof o.aurora === 'boolean' ? o.aurora : DEFAULTS.aurora,
    primary: typeof o.primary === 'string' && HEX.test(o.primary) ? o.primary : DEFAULTS.primary,
    secondary: typeof o.secondary === 'string' && HEX.test(o.secondary) ? o.secondary : DEFAULTS.secondary,
  };
}

export function serialize(settings: ThemeSettings): string {
  return JSON.stringify(settings);
}

export function applyToDocument(settings: ThemeSettings, html: HTMLElement): void {
  html.dataset.theme = settings.theme;
  html.dataset.aurora = settings.aurora ? 'on' : 'off';
  html.style.setProperty('--aurora-1', settings.primary);
  html.style.setProperty('--aurora-2', settings.secondary);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/theme/settings.test.ts`
Expected: PASS (6 assertions across 5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/theme/settings.ts lib/theme/settings.test.ts
git commit -m "feat(theme): pure settings core — parse/serialize/applyToDocument"
```

---

### Task 2: CSS tokens + Tailwind mapping

CSS/config task — no unit test (TDD config exception). Verified by `tsc`, the existing suite staying green, and a visual smoke check.

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.js`

- [ ] **Step 1: Add the dark token block + aurora vars to `app/globals.css`**

Replace the existing `:root { … }` block (the one defining `--background` etc.) with channel-triplet vars plus a dark override, and switch `html, body` to consume them:

```css
:root {
  /* light (default values; dark default is applied via <html data-theme="dark">) */
  --background-rgb: 250 249 246;
  --foreground-rgb: 17 17 17;
  --card-rgb: 255 255 255;
  --border-rgb: 17 17 17;
  --muted-rgb: 17 17 17;
  --aurora-1: #4E6EF5;
  --aurora-2: #9A5AE6;
}

:root[data-theme='dark'] {
  --background-rgb: 7 8 12;
  --foreground-rgb: 240 242 248;
  --card-rgb: 17 23 38;
  --border-rgb: 255 255 255;
  --muted-rgb: 240 242 248;
}
```

Then update the `html, body` rule's `background`/`color`:

```css
html,
body {
  margin: 0;
  padding: 0;
  min-height: 100%;
  background: rgb(var(--background-rgb));
  color: rgb(var(--foreground-rgb));
  font-family: Arial, Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

And update `::selection` to `background: rgb(var(--foreground-rgb) / 0.12);`.

- [ ] **Step 2: Map Tailwind colors to the vars in `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background-rgb) / <alpha-value>)',
        foreground: 'rgb(var(--foreground-rgb) / <alpha-value>)',
        card: 'rgb(var(--card-rgb) / <alpha-value>)',
        border: 'rgb(var(--border-rgb) / <alpha-value>)',
        muted: 'rgb(var(--muted-rgb) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 3: Verify build/types unaffected**

Run: `npx tsc --noEmit`
Expected: exit 0.
Run: `npx vitest run`
Expected: existing suite still green (125 passing).

- [ ] **Step 4: Commit**

```bash
git add app/globals.css tailwind.config.js
git commit -m "feat(theme): CSS-var semantic tokens (light + dark blocks) + tailwind mapping"
```

---

### Task 3: ThemeProvider + no-flash script + layout wiring

**Files:**
- Create: `lib/theme/ThemeProvider.tsx`
- Modify: `app/layout.tsx`
- Test: `lib/theme/ThemeProvider.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// lib/theme/ThemeProvider.test.tsx
// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { STORAGE_KEY } from './settings';

function Probe() {
  const { settings, setTheme, toggleAurora } = useTheme();
  return (
    <div>
      <span data-testid="theme">{settings.theme}</span>
      <span data-testid="aurora">{String(settings.aurora)}</span>
      <button onClick={() => setTheme('light')}>to-light</button>
      <button onClick={toggleAurora}>toggle-aurora</button>
    </div>
  );
}

beforeEach(() => { localStorage.clear(); cleanup(); });

describe('ThemeProvider', () => {
  it('defaults to dark + aurora on', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(screen.getByTestId('aurora').textContent).toBe('true');
  });
  it('hydrates from existing localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme: 'light', aurora: false, primary: '#4E6EF5', secondary: '#9A5AE6' }));
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(screen.getByTestId('aurora').textContent).toBe('false');
  });
  it('setTheme updates state, DOM, and storage', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    fireEvent.click(screen.getByText('to-light'));
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).theme).toBe('light');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/theme/ThemeProvider.test.tsx`
Expected: FAIL — cannot find module `./ThemeProvider`.

- [ ] **Step 3: Write the provider**

```tsx
// lib/theme/ThemeProvider.tsx
'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeSettings, DEFAULTS, STORAGE_KEY, parseSettings, serialize, applyToDocument } from './settings';

type ThemeCtx = {
  settings: ThemeSettings;
  setTheme: (t: ThemeSettings['theme']) => void;
  toggleAurora: () => void;
  setPrimary: (hex: string) => void;
  setSecondary: (hex: string) => void;
};

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Start at DEFAULTS so SSR and the first client render MATCH (no hydration
  // mismatch for theme-dependent children like Aurora). Hydrate from storage in
  // an effect after mount. The no-flash script already fixed the <html> visuals
  // before paint, so the base theme never flashes; only post-mount state (orb
  // presence / panel) settles, and the apply-effect is gated on `mounted` so it
  // never stomps the script's value with DEFAULTS.
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      setSettings(parseSettings(localStorage.getItem(STORAGE_KEY)));
    } catch {
      // storage unavailable — keep DEFAULTS
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyToDocument(settings, document.documentElement);
    try {
      localStorage.setItem(STORAGE_KEY, serialize(settings));
    } catch {
      // storage unavailable — best-effort
    }
  }, [settings, mounted]);

  const value: ThemeCtx = {
    settings,
    setTheme: (theme) => setSettings((s) => ({ ...s, theme })),
    toggleAurora: () => setSettings((s) => ({ ...s, aurora: !s.aurora })),
    setPrimary: (primary) => setSettings((s) => ({ ...s, primary })),
    setSecondary: (secondary) => setSettings((s) => ({ ...s, secondary })),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/theme/ThemeProvider.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Wire the layout + no-flash script**

Replace `app/layout.tsx` body with the provider and add the static dark default + inline script:

```tsx
import './globals.css'
import type { Metadata } from 'next'
import { ReactNode } from 'react'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'

export const metadata: Metadata = {
  title: 'VisionAir',
  description:
    'A guided intelligence environment that helps capable but unclear people turn what they already carry into a structured, trustworthy path they can begin building.',
}

const NO_FLASH = `(function(){try{var s=localStorage.getItem('visionair-theme');if(!s)return;var o=JSON.parse(s);var h=document.documentElement;if(o.theme==='light'||o.theme==='dark')h.dataset.theme=o.theme;h.dataset.aurora=o.aurora?'on':'off';if(/^#[0-9a-fA-F]{6}$/.test(o.primary))h.style.setProperty('--aurora-1',o.primary);if(/^#[0-9a-fA-F]{6}$/.test(o.secondary))h.style.setProperty('--aurora-2',o.secondary);}catch(e){}})();`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark" data-aurora="on" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 6: Verify + commit**

Run: `npx tsc --noEmit` (exit 0) and `npx vitest run` (all green).
Manual smoke: load `localhost:3001` — no white flash; `<html data-theme="dark">` in devtools.

```bash
git add lib/theme/ThemeProvider.tsx lib/theme/ThemeProvider.test.tsx app/layout.tsx
git commit -m "feat(theme): ThemeProvider + no-flash script + layout wiring"
```

---

### Task 4: Migrate components to semantic tokens

Refactor task: structure/behavior unchanged, so the existing suite (incl. `app/build/selector.test.tsx`) is the guard — it must stay green. No new test. Apply this exact mapping in each file, reading the file first:

| Current class | Token replacement |
|---|---|
| `text-black` | `text-foreground` |
| `text-black/70` `/60` `/50` `/45` `/40` `/35` | `text-foreground/70` (same number) |
| `bg-white` | `bg-card` |
| `bg-black` (primary button / selected card) | `bg-foreground` |
| `text-white` (on those dark fills) | `text-background` |
| `text-white/75` | `text-background/75` |
| `border-black` (selected) | `border-foreground` |
| `border-black/10` `/25` `/[0.08]` | `border-border/10` (same number) |
| `bg-black/[0.02]` `/[0.015]` `/[0.06]` (group boxes, soon tag, hovers) | `bg-foreground/[0.02]` (same number) |
| `hover:border-black/25` | `hover:border-foreground/25` |

This makes selected fills and the primary button **auto-invert**: on dark, `bg-foreground` (near-white) + `text-background` (near-black) = the white button/selected card seen in the approved mockups.

**Files (apply mapping to each):**
- Modify: `components/screen-shell.tsx`
- Modify: `components/screen-intro.tsx`
- Modify: `components/primary-button.tsx`
- Modify: `components/secondary-button.tsx`
- Modify: `app/build/selector.tsx`
- Modify: `app/build/BuildClient.tsx`
- Modify: `app/page.tsx` (base colors only; copy comes in Task 8)

- [ ] **Step 1:** Read each file; apply the mapping table to every matching class.
- [ ] **Step 2: Verify structure/tests unaffected**

Run: `npx vitest run` → all green (selector test unchanged).
Run: `npx tsc --noEmit` → exit 0.
Manual smoke: toggle `data-theme` between `dark`/`light` in devtools on `localhost:3001/build` — colors flip, layout unchanged, text legible both ways.

- [ ] **Step 3: Commit**

```bash
git add components/ app/build/selector.tsx app/build/BuildClient.tsx app/page.tsx
git commit -m "refactor(theme): migrate surface components to semantic tokens"
```

---

### Task 5: Aurora component

**Files:**
- Create: `components/theme/Aurora.tsx`
- Modify: `app/globals.css` (append aurora field + orb CSS)
- Test: `components/theme/Aurora.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/theme/Aurora.test.tsx
// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import Aurora from './Aurora';

afterEach(() => { localStorage.clear(); cleanup(); });

function withTheme(stored?: object) {
  if (stored) localStorage.setItem('visionair-theme', JSON.stringify(stored));
  return render(<ThemeProvider><Aurora /></ThemeProvider>);
}

describe('Aurora', () => {
  it('renders the field with orbs when aurora is on (default)', () => {
    const { container } = withTheme();
    expect(container.querySelector('.aurora-field')).not.toBeNull();
    expect(container.querySelectorAll('.aurora-orb').length).toBeGreaterThan(0);
  });
  it('renders nothing when aurora is off', () => {
    const { container } = withTheme({ theme: 'dark', aurora: false, primary: '#4E6EF5', secondary: '#9A5AE6' });
    expect(container.querySelector('.aurora-field')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/theme/Aurora.test.tsx`
Expected: FAIL — cannot find module `./Aurora`.

- [ ] **Step 3: Implement the component**

```tsx
// components/theme/Aurora.tsx
'use client';
import { useTheme } from '@/lib/theme/ThemeProvider';

// Five drifting, blurred orbs colored from --aurora-1/--aurora-2. Fixed, behind
// all content, pointer-inert. Hidden entirely when aurora is off. Motion is
// disabled under prefers-reduced-motion (handled in globals.css).
export default function Aurora() {
  const { settings } = useTheme();
  if (!settings.aurora) return null;
  return (
    <div className="aurora-field" aria-hidden="true">
      <span className="aurora-orb aurora-orb-1" />
      <span className="aurora-orb aurora-orb-2" />
      <span className="aurora-orb aurora-orb-3" />
      <span className="aurora-orb aurora-orb-4" />
      <span className="aurora-orb aurora-orb-5" />
    </div>
  );
}
```

- [ ] **Step 4: Append orb CSS to `app/globals.css`**

```css
.aurora-field {
  position: fixed;
  inset: 0;
  z-index: -10;
  overflow: hidden;
  pointer-events: none;
}
.aurora-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.55;
  mix-blend-mode: screen; /* dark default: glow */
}
:root[data-theme='light'] .aurora-orb {
  mix-blend-mode: multiply; /* light: soft tinted wash on cream */
  opacity: 0.28;
  filter: blur(80px);
}
.aurora-orb-1 { width: 46vw; height: 44vw; left: 6%; top: 2%;  background: radial-gradient(circle, rgb(var(--background-rgb) / 0), var(--aurora-1) 0%, transparent 70%); }
.aurora-orb-2 { width: 40vw; height: 40vw; right: 4%; top: 10%; background: radial-gradient(circle, var(--aurora-2), transparent 70%); }
.aurora-orb-3 { width: 52vw; height: 48vw; left: 18%; top: 38%; background: radial-gradient(circle, var(--aurora-1), transparent 70%); }
.aurora-orb-4 { width: 38vw; height: 38vw; right: 12%; bottom: 6%; background: radial-gradient(circle, var(--aurora-2), transparent 70%); }
.aurora-orb-5 { width: 34vw; height: 34vw; left: 40%; bottom: 14%; background: radial-gradient(circle, var(--aurora-1), transparent 70%); }

@media (prefers-reduced-motion: no-preference) {
  .aurora-orb-1 { animation: aurora-drift-1 42s ease-in-out infinite; }
  .aurora-orb-2 { animation: aurora-drift-2 50s ease-in-out infinite; }
  .aurora-orb-3 { animation: aurora-drift-3 46s ease-in-out infinite; }
  .aurora-orb-4 { animation: aurora-drift-2 54s ease-in-out infinite; }
  .aurora-orb-5 { animation: aurora-drift-1 48s ease-in-out infinite; }
}
@keyframes aurora-drift-1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(6vw,8vh) scale(1.12); } }
@keyframes aurora-drift-2 { 0%,100% { transform: translate(0,0) scale(1.05); } 50% { transform: translate(-7vw,5vh) scale(0.95); } }
@keyframes aurora-drift-3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(4vw,-6vh) scale(1.1); } }
```

(Fix orb-1's gradient to `radial-gradient(circle, var(--aurora-1), transparent 70%)` — keep all five consistent.)

- [ ] **Step 5: Mount Aurora globally** in `app/layout.tsx` inside `ThemeProvider`, before `{children}`:

```tsx
<ThemeProvider>
  <Aurora />
  {children}
</ThemeProvider>
```
(Add `import Aurora from '@/components/theme/Aurora'`.)

- [ ] **Step 6: Run test + verify + commit**

Run: `npx vitest run components/theme/Aurora.test.tsx` → PASS.
Run: `npx vitest run` → all green. `npx tsc --noEmit` → exit 0.
Manual smoke: `localhost:3001` shows drifting blue/violet orbs on dark; flipping `data-aurora`/theme behaves.

```bash
git add components/theme/Aurora.tsx components/theme/Aurora.test.tsx app/globals.css app/layout.tsx
git commit -m "feat(theme): ported deep-sea Aurora component (gated, var-colored, blend-per-theme)"
```

---

### Task 6: Settings panel + trigger + the two switches

**Files:**
- Create: `components/theme/SettingsPanel.tsx`
- Modify: `app/layout.tsx` (mount the trigger)
- Test: `components/theme/SettingsPanel.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/theme/SettingsPanel.test.tsx
// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import SettingsPanel from './SettingsPanel';

afterEach(() => { localStorage.clear(); cleanup(); });
const open = (stored?: object) => {
  if (stored) localStorage.setItem('visionair-theme', JSON.stringify(stored));
  render(<ThemeProvider><SettingsPanel /></ThemeProvider>);
  fireEvent.click(screen.getByRole('button', { name: /settings/i }));
};

describe('SettingsPanel', () => {
  it('opens to reveal Theme and Aurora switches', () => {
    open();
    expect(screen.getByRole('switch', { name: /theme/i })).toBeTruthy();
    expect(screen.getByRole('switch', { name: /aurora/i })).toBeTruthy();
  });
  it('toggling the theme switch flips data-theme', () => {
    open();
    fireEvent.click(screen.getByRole('switch', { name: /theme/i }));
    expect(document.documentElement.dataset.theme).toBe('light');
  });
  it('greys out the color section when aurora is off', () => {
    open({ theme: 'dark', aurora: false, primary: '#4E6EF5', secondary: '#9A5AE6' });
    expect(screen.getByTestId('aurora-colors').getAttribute('data-disabled')).toBe('true');
  });
  it('closes on Escape', () => {
    open();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('switch', { name: /theme/i })).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/theme/SettingsPanel.test.tsx`
Expected: FAIL — cannot find module `./SettingsPanel`.

- [ ] **Step 3: Implement (switches only; color swatches are static placeholders wired in Task 7)**

```tsx
// components/theme/SettingsPanel.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/lib/theme/ThemeProvider';

function Switch({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-foreground/85">{label}</span>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={on}
        onClick={onToggle}
        className={['relative h-[21px] w-[38px] rounded-full transition', on ? 'bg-foreground/70' : 'bg-foreground/20'].join(' ')}
      >
        <span className={['absolute top-[2.5px] h-4 w-4 rounded-full bg-card transition-all', on ? 'right-[2.5px]' : 'left-[2.5px]'].join(' ')} />
      </button>
    </div>
  );
}

export default function SettingsPanel() {
  const { settings, setTheme, toggleAurora } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  return (
    <div ref={ref} className="fixed right-5 top-5 z-50">
      <button
        type="button"
        aria-label="App settings"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-border/15 bg-card/60 px-3 py-1.5 text-xs text-foreground/70 backdrop-blur transition hover:text-foreground"
      >
        Settings
      </button>
      {open && (
        <div className="mt-2 w-[250px] rounded-2xl border border-border/15 bg-card/80 p-4 shadow-lg backdrop-blur">
          <div className="mb-3 text-[11px] uppercase tracking-wider text-foreground/45">App settings</div>
          <Switch label="Theme" on={settings.theme === 'light'} onToggle={() => setTheme(settings.theme === 'dark' ? 'light' : 'dark')} />
          <Switch label="Aurora" on={settings.aurora} onToggle={toggleAurora} />
          <div
            data-testid="aurora-colors"
            data-disabled={!settings.aurora}
            className={['mt-3 border-t border-border/10 pt-3 transition', settings.aurora ? '' : 'pointer-events-none opacity-40'].join(' ')}
          >
            <div className="mb-1 text-[11px] uppercase tracking-wider text-foreground/40">Aurora colors</div>
            {!settings.aurora && <div className="mb-2 text-[10px] italic text-foreground/40">Turn Aurora on to customize</div>}
            <div className="flex items-center justify-between py-1.5">
              <span className="text-sm text-foreground/85">Primary</span>
              <span className="h-6 w-6 rounded-md border border-border/25" style={{ background: settings.primary }} />
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-sm text-foreground/85">Secondary</span>
              <span className="h-6 w-6 rounded-md border border-border/25" style={{ background: settings.secondary }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/theme/SettingsPanel.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Mount the panel** in `app/layout.tsx` inside `ThemeProvider` (replaces the per-page "Log in" position concerns — panel is global). Add `import SettingsPanel from '@/components/theme/SettingsPanel'` and place `<SettingsPanel />` after `<Aurora />`.

- [ ] **Step 6: Verify + commit**

Run: `npx vitest run` (all green), `npx tsc --noEmit` (exit 0). Smoke: gear top-right opens panel; switches flip theme/aurora live; color section greys when aurora off.

```bash
git add components/theme/SettingsPanel.tsx components/theme/SettingsPanel.test.tsx app/layout.tsx
git commit -m "feat(theme): top-right settings panel with theme + aurora switches"
```

---

### Task 7: Figma-style color pickers (`react-colorful`)

**Files:**
- Modify: `package.json` (add `react-colorful`)
- Modify: `components/theme/SettingsPanel.tsx`
- Test: extend `components/theme/SettingsPanel.test.tsx`

- [ ] **Step 1: Install the dependency**

Run: `npm install react-colorful`
Expected: adds `react-colorful` to dependencies; lockfile updated.

- [ ] **Step 2: Write the failing test (append to SettingsPanel.test.tsx)**

```tsx
  it('opens a hex-input picker when a Primary swatch is clicked (aurora on)', () => {
    open();
    fireEvent.click(screen.getByRole('button', { name: /primary color/i }));
    const hex = screen.getByLabelText(/primary hex/i) as HTMLInputElement;
    fireEvent.change(hex, { target: { value: '#112233' } });
    expect(document.documentElement.style.getPropertyValue('--aurora-1')).toBe('#112233');
  });
```

- [ ] **Step 3: Run it — FAIL**

Run: `npx vitest run components/theme/SettingsPanel.test.tsx`
Expected: FAIL — no button named "Primary color" / no "Primary hex" input.

- [ ] **Step 4: Replace the swatch rows** in `SettingsPanel.tsx` with clickable swatches that open a `HexColorPicker` + hex field. Add at top: `import { HexColorPicker } from 'react-colorful'`. Add `const [picking, setPicking] = useState<null | 'primary' | 'secondary'>(null)` and use `setPrimary`/`setSecondary` from `useTheme()`. Each row:

```tsx
<div className="flex items-center justify-between py-1.5">
  <span className="text-sm text-foreground/85">Primary</span>
  <button type="button" aria-label="Primary color" onClick={() => setPicking(picking === 'primary' ? null : 'primary')}
    className="h-6 w-6 rounded-md border border-border/25" style={{ background: settings.primary }} />
</div>
{picking === 'primary' && (
  <div className="mb-2">
    <HexColorPicker color={settings.primary} onChange={setPrimary} />
    <label className="mt-2 block text-[10px] uppercase text-foreground/40">Primary hex
      <input aria-label="Primary hex" value={settings.primary}
        onChange={(e) => /^#[0-9a-fA-F]{6}$/.test(e.target.value) && setPrimary(e.target.value)}
        className="mt-1 w-full rounded-md border border-border/20 bg-background/40 px-2 py-1 text-xs text-foreground" />
    </label>
  </div>
)}
```

Repeat for Secondary (`aria-label="Secondary color"` / `"Secondary hex"`, `settings.secondary`, `setSecondary`, `picking === 'secondary'`).

- [ ] **Step 5: Run test — PASS**

Run: `npx vitest run components/theme/SettingsPanel.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 6: Verify + commit**

Run: `npx vitest run` (all green), `npx tsc --noEmit` (exit 0). Smoke: clicking a swatch opens the gradient/hue picker; dragging re-tints the aurora live; pickers unavailable when aurora off.

```bash
git add package.json package-lock.json components/theme/SettingsPanel.tsx components/theme/SettingsPanel.test.tsx
git commit -m "feat(theme): react-colorful primary/secondary aurora-color pickers"
```

---

### Task 8: Landing redesign + sharper copy

**Files:**
- Modify: `app/page.tsx`

Tokens were applied in Task 4; this task is the copy + hero polish. Refactor of static content — no unit test; visual smoke + tsc.

- [ ] **Step 1: Update the hero copy + structure**

In `app/page.tsx`, set the eyebrow/headline/sub to the approved copy and keep the CTA + login. The card content becomes:

```tsx
<p className="mb-3 text-sm tracking-wide text-foreground/50">VisionAir · Build Mode</p>
<h1 className="mb-5 text-4xl font-semibold tracking-tight text-foreground">
  Your AI agent starts every project blind.
</h1>
<p className="mx-auto mb-8 max-w-xl text-base leading-7 text-foreground/70">
  VisionAir interviews you about what&apos;s missing, then hands it a real blueprint —
  not a blank prompt. Ready-to-build context packs for Claude Code and other AI coding agents.
</p>
```

Keep the existing `Link href="/build"` CTA (now `bg-foreground text-background` from Task 4) and the "No account needed…" line (`text-foreground/45`). Remove the per-page top-right "Log in" link only if it visually collides with the global Settings gear; otherwise move it to `right-20` so both fit.

- [ ] **Step 2: Verify + commit**

Run: `npx tsc --noEmit` (exit 0), `npx vitest run` (all green). Smoke: landing reads with the new copy, aurora behind it, legible in both themes; gear + login don't overlap.

```bash
git add app/page.tsx
git commit -m "feat(theme): landing redesign — themed hero + sharper problem-first copy"
```

---

## Final verification (after all tasks)

- [ ] `npx vitest run` — full suite green (125 prior + new theme tests).
- [ ] `npx tsc --noEmit` — exit 0.
- [ ] Manual smoke on `localhost:3001`: default Dark+Aurora; toggle to Light (no flash on reload, persists); toggle Aurora off (orbs gone, colors greyed); pick custom primary/secondary (aurora re-tints, persists across reload); Light+Aurora looks like gentle tint, not washout; build flow (`/build`) legible in all four combos.
- [ ] Branch `feat/app-theme` only; no push/deploy.
