# Build Mode — Presets + Packager (Plan 2a) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Turn the engine's elicited artifacts + the Gate-1-validated presets into a downloadable, ordered, authority-ranked **ZIP context pack**.

**Architecture:** Three pure, testable units in `lib/build-mode/`: `authority.ts` (the single canonical read-order + conflict rule), `assemble.ts` (`assemble(elicited) → FileMap` — merges elicited artifacts + preset files, generates `LAUNCH.md` + `CLAUDE.md`, applies provenance tags), and `pack.ts` (`pack(FileMap) → Uint8Array` via JSZip). Preset content lives as authored files in `lib/build-mode/presets/`, each carrying the Gate-1 **meta-rule header** ("validated default — verify against this app; flag mismatch as a gap"). No live LLM in this plan — `assemble` runs on `ElicitedArtifact[]` regardless of how they were produced; tests use sample artifacts.

**Tech Stack:** TypeScript · Vitest (existing) · JSZip (added Task 1) · Node `fs` to load preset files. Authority source: `docs/superpowers/specs/2026-06-07-gate1-preset-validation.md`.

**Scope refs:** `2026-06-05-build-mode-design.md`, `2026-06-05-build-mode-seed-pattern.md`, `2026-06-07-gate1-preset-validation.md`. Engine types in `lib/build-mode/types.ts` (`ElicitedArtifact { path, provenance, content }`).

---

## File structure (this plan)

- `lib/build-mode/authority.ts` + `authority.test.ts` — canonical `READ_ORDER` + `CONFLICT_RULE` + `META_RULE` (create)
- `lib/build-mode/presets/` — authored uniform-safe preset files (create): `security.md`, `ci.yml`, `architecture.md`, `testing.md`, `workflow.md`, `setup.md`, `gitignore`, `dependabot.yml`, `pre-commit-config.yaml`
- `lib/build-mode/presets.ts` + `presets.test.ts` — loads preset files into a `{path: content}` map (create)
- `lib/build-mode/assemble.ts` + `assemble.test.ts` — `assemble(elicited) → FileMap` (create)
- `lib/build-mode/pack.ts` + `pack.test.ts` — `pack(FileMap) → Uint8Array` (create)
- `package.json` — add `jszip` (modify)

---

### Task 1: Canonical authority (`authority.ts`)

**Files:** Create `lib/build-mode/authority.ts`, `lib/build-mode/authority.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from "vitest";
import { READ_ORDER, CONFLICT_RULE, META_RULE } from "./authority";

describe("authority", () => {
  it("read-order leads with LAUNCH then CLAUDE then the numbered context sequence", () => {
    expect(READ_ORDER[0]).toBe("LAUNCH.md");
    expect(READ_ORDER[1]).toBe("CLAUDE.md");
    expect(READ_ORDER).toContain("docs/context/01-non-negotiables.md");
    expect(READ_ORDER.indexOf("docs/context/00-identity.md"))
      .toBeLessThan(READ_ORDER.indexOf("docs/context/07-known-gaps.md"));
  });
  it("conflict rule ranks non-negotiables/contracts/security above prose", () => {
    expect(CONFLICT_RULE).toMatch(/non-negotiables/i);
    expect(CONFLICT_RULE).toMatch(/known-gaps/i);
  });
  it("meta rule states presets are validated defaults, not authoritative", () => {
    expect(META_RULE).toMatch(/validated default/i);
    expect(META_RULE).toMatch(/gap/i);
  });
});
```

- [ ] **Step 2: Run → fail.** `npx vitest run lib/build-mode/authority.test.ts` → cannot find module.

- [ ] **Step 3: Implement**

```ts
export const READ_ORDER: string[] = [
  "LAUNCH.md",
  "CLAUDE.md",
  "docs/context/00-identity.md",
  "docs/context/01-non-negotiables.md",
  "docs/context/02-doctrine.md",
  "docs/context/03-spec.md",
  "docs/context/04-contracts.md",
  "docs/context/05-architecture.md",
  "docs/context/06-security.md",
  "docs/context/07-known-gaps.md",
  "docs/context/08-workflow.md",
];

export const CONFLICT_RULE =
  "When files conflict, authority is: non-negotiables > contracts > security > " +
  "doctrine > spec/prose. Anything unresolved or contradictory goes to " +
  "docs/context/07-known-gaps.md before you build on it.";

export const META_RULE =
  "Files tagged [preset] are VALIDATED DEFAULTS for this stack — verify each against " +
  "THIS app. If a preset does not fit, do NOT silently comply: flag the mismatch as a gap " +
  "in docs/context/07-known-gaps.md.";
```

- [ ] **Step 4: Run → pass.** `npx vitest run lib/build-mode/authority.test.ts`

- [ ] **Step 5: Commit**

```bash
git add lib/build-mode/authority.ts lib/build-mode/authority.test.ts
git commit -m "feat(build-mode): canonical authority (read-order, conflict rule, meta-rule)"
```

---

### Task 2: Author the uniform-safe preset files (`presets/`)

Author each file per the Gate-1 spec's "SAFE to preset uniformly" column. **Every preset file MUST begin with the meta-rule header** (so the agent treats it as a validated default, not gospel):

```
<!-- [preset] VALIDATED DEFAULT for the Next.js/TS/Vercel house stack — verify against THIS app; flag any mismatch as a gap in docs/context/07-known-gaps.md. Authority: see citations inline. -->
```

**Files (create under `lib/build-mode/presets/`):**

- [ ] **`security.md`** — safe-uniform HTTP headers ONLY (`X-Content-Type-Options: nosniff`; `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'`; `Referrer-Policy`; lean `Permissions-Policy`; **HSTS WITHOUT `preload`**; strip `X-Powered-By`). Server-only secrets + **"no secrets in `NEXT_PUBLIC_*`"** + `.env.example`. **CSRF** guidance (cookie/session mutations + Server Actions), **data-layer authz scoping**, **SSRF + webhook-signature** guards. Explicit **GAP markers** for: the CSP source-allowlist, HSTS `preload`, rate-limiting (note: needs an external store on serverless — Upstash/Vercel WAF), and the app threat model. Cite OWASP Top 10:2025 + Secure Headers.

- [ ] **`ci.yml`** — GitHub Actions: top-level `permissions: contents: read`; trigger `pull_request` (NEVER `pull_request_target` with secrets); `npm ci`; type-check + build + **the test run** (`npm test`); gitleaks; **all actions pinned by full commit SHA** (comment the version next to each); `concurrency: { group: ..., cancel-in-progress: true }`. Trivy + SARIF upload included but **commented as conditional** (needs code-scanning / not free on private repos). Cite GitHub Actions secure-use.

- [ ] **`architecture.md`** — principles + an **ADR template** (Title / Status / Context / Decision / Consequences-incl-negative), NOT a fixed folder taxonomy. Next.js conventions (app/ = routing only; server/client boundary; where validation lives). Cite 12-Factor + Nygard ADR + Next.js project-structure.

- [ ] **`testing.md`** — Testing-Trophy guidance (TS+lint static base, integration-weighted, thin e2e); "test authz/validation/the money path first"; **coverage is report-only, no hard gate**; Playwright/e2e conditional on UI surface. Cite Dodds + Fowler.

- [ ] **`workflow.md`** — durable spec→plan→TDD→review→verify inline + **right-sizing rule** (scale rigor to app risk) + **optional** accelerator refs (`superpowers:*` "if installed"). Never assume the plugin is present.

- [ ] **`setup.md`** — prereqs; optional plugin install; `npm ci`; how to run CI locally.

- [ ] **`gitignore`** — Node/Next defaults (`.next`, `node_modules`, `.env*`, `.vercel`).

- [ ] **`dependabot.yml`** — weekly, **grouped** npm + github-actions updates.

- [ ] **`pre-commit-config.yaml`** — JS-native note at top (recommend Husky + lint-staged for JS/TS; this config is the fallback); secret-detection + large-file hooks; comment that local hooks are bypassable and CI is the backstop.

- [ ] **Verification test** — create `lib/build-mode/presets.test.ts` AFTER Task 3 (the loader) verifies these; for now just author the files.

- [ ] **Commit**

```bash
git add lib/build-mode/presets
git commit -m "feat(build-mode): author Gate-1-validated uniform-safe presets"
```

---

### Task 3: Preset loader (`presets.ts`)

**Files:** Create `lib/build-mode/presets.ts`, `lib/build-mode/presets.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from "vitest";
import { loadPresets } from "./presets";

describe("preset loader", () => {
  it("maps preset source files to their pack destinations with content", () => {
    const m = loadPresets();
    expect(m["docs/context/06-security.md"]).toMatch(/nosniff/);
    expect(m[".github/workflows/ci.yml"]).toMatch(/contents: read/);
    expect(m["docs/context/05-architecture.md"]).toMatch(/Decision/);
    expect(m["docs/context/08-workflow.md"]).toMatch(/spec/i);
    expect(m["SETUP.md"]).toBeTruthy();
    expect(m[".gitignore"]).toMatch(/node_modules/);
  });
  it("every preset carries the validated-default meta-rule header", () => {
    const m = loadPresets();
    for (const [path, content] of Object.entries(m)) {
      if (path.endsWith(".md")) expect(content).toMatch(/VALIDATED DEFAULT/i);
    }
  });
  it("ci.yml pins actions by 40-char SHA, never bare tags", () => {
    const ci = loadPresets()[".github/workflows/ci.yml"];
    expect(ci).toMatch(/uses: [\w./-]+@[0-9a-f]{40}/);
    expect(ci).not.toMatch(/uses: [\w./-]+@v\d+\s*$/m);
  });
});
```

- [ ] **Step 2: Run → fail.**

- [ ] **Step 3: Implement** — map source files in `presets/` to pack paths:

```ts
import { readFileSync } from "fs";
import { join } from "path";

const DIR = join(__dirname, "presets");
const MAP: Record<string, string> = {
  "security.md": "docs/context/06-security.md",
  "architecture.md": "docs/context/05-architecture.md",
  "testing.md": "docs/context/testing.md",
  "workflow.md": "docs/context/08-workflow.md",
  "ci.yml": ".github/workflows/ci.yml",
  "dependabot.yml": ".github/dependabot.yml",
  "pre-commit-config.yaml": ".pre-commit-config.yaml",
  "setup.md": "SETUP.md",
  "gitignore": ".gitignore",
};

export function loadPresets(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [src, dest] of Object.entries(MAP)) {
    out[dest] = readFileSync(join(DIR, src), "utf8");
  }
  return out;
}
```

> If the SHA-pin test fails, fix `ci.yml` (Task 2) to use real 40-char SHAs — do not weaken the test.

- [ ] **Step 4: Run → pass.**

- [ ] **Step 5: Commit**

```bash
git add lib/build-mode/presets.ts lib/build-mode/presets.test.ts
git commit -m "feat(build-mode): preset loader with meta-rule + SHA-pin verification"
```

---

### Task 4: Assembler (`assemble.ts`)

**Files:** Create `lib/build-mode/assemble.ts`, `lib/build-mode/assemble.test.ts`

`assemble` builds the full `FileMap`: start from presets, overlay each elicited artifact (elicited 06-security is APPENDED under the preset baseline, not overwritten), then generate `LAUNCH.md` (from `READ_ORDER`) and `CLAUDE.md` (authority registry + `CONFLICT_RULE` + `META_RULE`).

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from "vitest";
import { assemble } from "./assemble";
import { ElicitedArtifact } from "./types";
import { READ_ORDER } from "./authority";

const elicited: ElicitedArtifact[] = [
  { path: "docs/context/00-identity.md", provenance: "elicited", content: "IS: a tool" },
  { path: "docs/context/06-security.md", provenance: "elicited", content: "app stores emails" },
  { path: "docs/context/07-known-gaps.md", provenance: "open", content: "# Known gaps\n- rate limits" },
];

describe("assemble", () => {
  it("produces LAUNCH.md listing the canonical read-order", () => {
    const m = assemble(elicited);
    for (const f of READ_ORDER) expect(m["LAUNCH.md"]).toContain(f);
  });
  it("CLAUDE.md carries the conflict rule and meta-rule", () => {
    const m = assemble(elicited);
    expect(m["CLAUDE.md"]).toMatch(/authority/i);
    expect(m["CLAUDE.md"]).toMatch(/validated default/i);
  });
  it("merges elicited security UNDER the preset security baseline (no overwrite)", () => {
    const m = assemble(elicited);
    expect(m["docs/context/06-security.md"]).toMatch(/nosniff/);        // preset baseline kept
    expect(m["docs/context/06-security.md"]).toContain("app stores emails"); // elicited appended
  });
  it("includes presets, elicited files, and known-gaps", () => {
    const m = assemble(elicited);
    expect(m["docs/context/00-identity.md"]).toContain("IS: a tool");
    expect(m[".github/workflows/ci.yml"]).toBeTruthy();
    expect(m["docs/context/07-known-gaps.md"]).toContain("rate limits");
  });
});
```

- [ ] **Step 2: Run → fail.**

- [ ] **Step 3: Implement**

```ts
import { ElicitedArtifact } from "./types";
import { loadPresets } from "./presets";
import { READ_ORDER, CONFLICT_RULE, META_RULE } from "./authority";

export type FileMap = Record<string, string>;

export function assemble(elicited: ElicitedArtifact[]): FileMap {
  const map: FileMap = { ...loadPresets() };
  for (const a of elicited) {
    if (map[a.path]) {
      // preset baseline exists (e.g. 06-security): append elicited app-specifics
      map[a.path] = `${map[a.path]}\n\n## App-specific [${a.provenance}]\n${a.content}`;
    } else {
      map[a.path] = `<!-- [${a.provenance}] -->\n${a.content}`;
    }
  }
  map["LAUNCH.md"] =
    "<!-- [preset] -->\n# LAUNCH — read before any action\n\n" +
    "Read these files IN THIS ORDER, then build:\n\n" +
    READ_ORDER.map((f, i) => `${i + 1}. ${f}`).join("\n") +
    `\n\n${CONFLICT_RULE}\n\n${META_RULE}\n`;
  map["CLAUDE.md"] =
    "<!-- [preset] -->\n# CLAUDE — authority registry\n\n" +
    "Read `LAUNCH.md` first. Authority + conflict resolution:\n\n" +
    `${CONFLICT_RULE}\n\n${META_RULE}\n`;
  return map;
}
```

- [ ] **Step 4: Run → pass.**

- [ ] **Step 5: Commit**

```bash
git add lib/build-mode/assemble.ts lib/build-mode/assemble.test.ts
git commit -m "feat(build-mode): assemble elicited + presets into ordered FileMap (LAUNCH/CLAUDE)"
```

---

### Task 5: Packager (`pack.ts`)

**Files:** Create `lib/build-mode/pack.ts`, `lib/build-mode/pack.test.ts`; modify `package.json`.

- [ ] **Step 1: Install JSZip.** Run: `npm install jszip` (and `npm install -D @types/jszip` if types are not bundled).

- [ ] **Step 2: Failing test**

```ts
import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { pack } from "./pack";

describe("pack", () => {
  it("zips a FileMap so every path round-trips", async () => {
    const map = { "LAUNCH.md": "hi", "docs/context/00-identity.md": "id" };
    const bytes = await pack(map);
    const zip = await JSZip.loadAsync(bytes);
    expect(await zip.file("LAUNCH.md")!.async("string")).toBe("hi");
    expect(await zip.file("docs/context/00-identity.md")!.async("string")).toBe("id");
  });
});
```

- [ ] **Step 3: Run → fail.**

- [ ] **Step 4: Implement**

```ts
import JSZip from "jszip";
import { FileMap } from "./assemble";

export async function pack(files: FileMap): Promise<Uint8Array> {
  const zip = new JSZip();
  for (const [path, content] of Object.entries(files)) zip.file(path, content);
  return zip.generateAsync({ type: "uint8array" });
}
```

- [ ] **Step 5: Run → pass; then full suite.** `npx vitest run lib/build-mode/pack.test.ts` then `npm test`.

- [ ] **Step 6: Commit**

```bash
git add lib/build-mode/pack.ts lib/build-mode/pack.test.ts package.json package-lock.json
git commit -m "feat(build-mode): pack FileMap into a downloadable ZIP (JSZip)"
```

---

## Self-review

- **Spec coverage:** ordered authority stack + LAUNCH/CLAUDE (assemble) ✅; Gate-1 validated presets w/ meta-rule + SHA-pins + no-hard-coverage-gate (Task 2/3) ✅; provenance tags preserved ✅; ZIP output (pack) ✅. Out of scope by design: real LLM wiring (2b), UI (2c).
- **Placeholders:** preset file *content* is specified by required-elements + the Gate-1 doc (the authoritative content source) + verified by `presets.test.ts` (meta-rule header, SHA-pin format, key strings) — not vague TODOs.
- **Type consistency:** `FileMap` defined in `assemble.ts`, imported by `pack.ts`; `ElicitedArtifact` from `types.ts`; `READ_ORDER`/`CONFLICT_RULE`/`META_RULE` from `authority.ts` used by `assemble`.

## Next after this plan

- **2b** — LLM adapter (`AskLLM` → Anthropic; Sonnet questions, Sonnet-or-Opus synthesis per the cost finding) + end-to-end orchestrator (interview → synthesize → reconcile → assemble → pack).
- **2c** — Build Mode UI (question-slides + download) + `/api/build` route.
