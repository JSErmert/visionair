# VisionAir v3 — Pillar B: The Persona Fork (design)

Status: **design, 2026-06-09** (operator + Claude, on `feat/v3-persona`). Pillar A
(multi-tenant signup) is built on `feat/v3-multitenant`; this is the next slice.

## Core insight (why three axes, all independent)

The original keystone conflated *who the user is* with *which tool they use*
("developer ⟹ Claude Code") — a correlation masquerading as a rule. The fix:
**stop inferring, let the user tell you, on three orthogonal axes** — because each
axis controls a *different part of the pipeline*:

| Axis | Question | Controls |
|---|---|---|
| **Level** | how hands-on are you? | the **interview** (guidance / depth / voice) |
| **Purpose** | what are you making? | the output's **content** (what kind of spec it *is*) |
| **Platform** | where will it live? | the output's **packaging** (what format it ships in) |

They are independent: "Operate a business" (Purpose) decides the content is doctrine
+ decision rules; "Claude.ai" vs "ChatGPT" (Platform) only decides whether that same
doctrine ships as a Claude Project or a custom GPT. Same content, different wrapper.

**Defining principle for any axis value:** a value earns a place only if it changes
the engine's job *and* its definition of "done." If two candidates produce the same
behaviour + output, merge them. Axis values are **goals (verbs), not identities
(job titles)** — "Build," not "Developer."

## Axis 1 — Level (tunes the interview)
- **Beginner** — guide me, I'm new. Engine explains terms, offers example answers to
  react to, *recommends* choices instead of demanding them, fills more gaps. Warm,
  permission-giving, many small questions.
- **Intermediate** — I know my goal, help me structure it. Engine organizes +
  translates.
- **Expert** — I know what I want, check my gaps. Terse, technical, *adversarial about
  gaps* ("you didn't define the auth contract"). Few questions, no hand-holding.

Level = **technical / articulation fluency** (how much you can specify yourself), NOT
domain expertise. A world-class chef may be a Beginner here; Level dials *guidance*,
not respect.

## Axis 2 — Platform (tunes packaging; arrives pre-filled, never locked)
**Claude Code** · **Claude.ai** · **ChatGPT** — the runtime the artifact ships into.

## Axis 3 — Purpose (tunes content); five goals + an escape
| Purpose | What the user is making | Output content |
|---|---|---|
| **Build** | software / a tool / an app | architecture, contracts, stack, edge cases |
| **Operate** | an AI that runs/governs an operation | doctrine, rules, decision policies *(muscle-pt, chef-fina-os)* |
| **Automate** | streamline one repetitive workflow | process steps, triggers, automation logic |
| **Decide** | turn a fuzzy idea into a clear path | a decision blueprint, options, next move *(the OG /session)* |
| **Assist / Learn** | an ongoing helper for a recurring task | the assistant's role, scope, knowledge boundaries |
| **Not sure** | help me figure it out | → short discovery sub-flow, then *suggests* a Purpose |

## Suggested-default logic (Purpose → Platform, one-click overridable)
| Purpose | Platform default | Note |
|---|---|---|
| Build | Claude Code | code wants a coding agent |
| Operate | Claude.ai | governed corpus = a Claude Project |
| Automate | Claude.ai | most workflow-opt is business process (→ Claude Code if dev automation) |
| Decide | Claude.ai | reasoning-heavy thinking partner (→ ChatGPT for lighter) |
| Assist / Learn | ChatGPT | most accessible for a personal helper (→ Claude.ai for depth) |

A suggested default is **not** an assumption — the other two platforms sit one click
away. The sin was *locking* the inference, not *suggesting* it.

## The flow
**Welcome → Selector → Seed → Interview → Pack.**
1. **Welcome** — warm, permission-giving, *no input* ("you don't need a perfect idea
   to begin"). Keeps the /session ethos; disarms a Beginner before three picks.
2. **Selector** — one page: Purpose (cards) · Level · Platform (pre-filled from
   Purpose). Then Begin. This configures the run *before* gathering content.
3. **Seed → Interview → Pack** — all forked by the selection.

**Retire the current entry-point slide.** Today's first Build slide (StartingPoint:
strength / problem / idea / direction / unsure) is content-gathering that overlaps the
Purpose axis ("unsure" ≈ "Not sure"). It is **absorbed**, not preceded: its "unsure"
becomes the selector's "Not sure"; its strength/problem/idea framing folds into the
seed prompt (gentler for Beginners).

## Three cells, end to end (proving the axes flex independently)
- **A · Build × Expert × Claude Code** — terse gap-check interview → architecture/
  contracts → LAUNCH.md/CLAUDE.md/docs pack. (the canonical dev)
- **B · Build × Beginner × Claude Code** — *same purpose+platform, level flipped*:
  warm, example-rich, engine recommends the stack → *same* content type → *same* pack
  with a gentler LAUNCH.md. Proves **Level is independent**.
- **C · Assist × Expert × ChatGPT** — terse interview about the assistant's scope →
  role/knowledge/refusal rules → a ChatGPT custom-GPT config. An **Expert who never
  touches Claude Code** — the cell the old stereotype erased.

## Constants under all 45 cells
- **"Not sure" always escapes** to a short discovery sub-flow (taxonomy never has to
  be complete).
- **The honesty rails do not move.** Level changes warmth, Purpose changes content,
  Platform changes format — none touch the anti-confabulation / ground-or-flag truth
  standard. Beginner-mode is gentler, **never looser**.

## Build notes (for the implementation plan)
- The selector is new UI state ahead of the existing `BuildClient` phases; persist the
  three picks alongside the seed/progress.
- **Interview fork (Level):** parameterize question framing + example-answer density +
  the coverage-model's "fill vs challenge" stance.
- **Content fork (Purpose):** the synthesis layer emits a different document set per
  purpose (architecture vs doctrine vs process vs blueprint vs assistant-config).
- **Packaging fork (Platform):** the assembler wraps the same content into Claude Code
  files vs a Claude.ai Project structure vs a ChatGPT custom-GPT export.
- This composes with existing v-next items: Archetypes = per-(Purpose) starting packs;
  Portable export targets = the Platform packaging layer; the Design-preset layer
  attaches at the Build/Claude-Code packaging path.
- Independent of Pillar A (accounts) at the engine level, but a logged-in user's
  selections + history can later inform smart defaults.

## Level is an AGENCY dial, not a skill dial (the north star)

The operator's per-level characterizations revealed the real variable: each level
wants the tool to **respect and extend the agency they already have — never reduce
it.** The failure mode for all three is the same sin (reducing agency). This IS the
democratize-tech mission: agency over technology, calibrated to where you stand.

| Level | Feeling to produce | Agency move | Anti-pattern (never) |
|---|---|---|---|
| **Beginner** | heard, personal; in control of the *vision* while best practices are handled for them | GRANT agency they lack: engine owns the HOW, user owns the WHAT/WHY | make them feel dumb; ask what they can't answer; over-interrogate (warmth ≠ slowness) |
| **Intermediate** | "I can build something powerful, guided to it" — amplification | EXTEND their reach: structure + fill the gaps they don't know | cap their ambition; treat as beginner; under-deliver on the power |
| **Expert** | unrestricted, precise, able to lean into specificity; testing the engine | DON'T take agency away: skip the obvious, give the controls, prove worth fast | obvious questions; restriction; slowness; treating as beginner |

Caveats locked: Level is **agency, not technical identity** (a non-technical domain
expert can be Intermediate/Expert). Expert "unrestricted" ≠ no rigor — they *want*
gaps caught (respect), just not the obvious. Beginner warmth ≠ verbosity — pair it
with the good-enough-stop.

## The PersonaProfile object (one threaded parameter)

One object set by the selector, read by interview + synthesis + packaging. A future
axis = a new field, never scattered conditionals.

```
PersonaProfile {
  level:    'beginner' | 'intermediate' | 'expert'                              // -> interview
  purpose:  'build' | 'operate' | 'automate' | 'decide' | 'assist' | 'unsure'   // -> content
  platform: 'claude-code' | 'claude-ai' | 'chatgpt'                             // -> packaging
}
// Level derives interview behaviour (the agency dial):
//   beginner:     { depth: guided,     voice: warm,    offerExamples: true,     stance: 'fill',      explainTerms: true  }
//   intermediate: { depth: structured, voice: neutral, offerExamples: optional, stance: 'organize',  explainTerms: false }
//   expert:       { depth: gap-only,   voice: terse,   offerExamples: false,    stance: 'challenge', explainTerms: false }
```

**Adapt-don't-cage rule:** the selected level is a STARTING point, not a lock. If a
self-declared Beginner answers like an Expert (precise, technical), the engine quietly
offers to level up (and vice versa). Self-ID is unreliable; adapt from first answers.

## Slice 1 — first buildable increment (proves the mechanism end to end)

Goal: selector + a REAL Level fork on the interview; **Build × Claude Code only**.

1. **`PersonaProfile` type + Level-behaviour derivation** (`lib/build-mode`) — pure,
   unit-tested against the agency-dial table.
2. **Selector UI** (new screen ahead of `BuildClient` phases): Purpose cards · Level ·
   Platform (default-from-purpose). Persist alongside seed/progress. Other
   Purposes/Platforms shown but **"coming soon"** (only Build × Claude Code proceeds).
3. **Welcome screen** (warm, no input) before the selector.
4. **Thread the profile** into the interview: parameterize question framing +
   example-answer density + fill-vs-challenge stance by Level. Content + packaging stay
   the existing Build × Claude Code path.
5. **Absorb** the old entry-point slide ("unsure" → Purpose "Not sure"; framing → seed).
6. **Tests (TDD):** Level→behaviour derivation; selector persists; interview reads the
   profile.

**Acceptance:** same idea, Beginner vs Expert → demonstrably different interview
(warmth, # questions, examples, fill-vs-challenge), not just tone; Build × Claude Code
output unchanged; other cells visibly "coming soon."

**Next slices:** Purpose #2 = **Operate** (distill output structure from
muscle-pt/chef-fina-os) → content template → Claude.ai packager → rest of the matrix +
the "Not sure" discovery sub-flow.

> RESUME POINT (updated 2026-06-11): **Slice 1 is COMPLETE + tested** on
> `feat/v3-persona` (Welcome → Selector → Seed → Level-forked interview). 125 tests green
> incl. Pillar A multi-tenant integration tests + the PersonaSelector component test.
> NOT yet merged or deployed. Next slices below.

---

## Next slice — Output Preferences (settings layer)  [added 2026-06-11, post-Slice-1]

A **"tune your output" step AFTER the interview, before pack generation**:
`interview → preferences → building → pack`. Preferences are collected only once enough
info exists to make them meaningful — do NOT front-load them into the questionnaire
(a Beginner can't evaluate output settings before they know what they're building).

**Designer switches — kept deliberately simple (operator preference 2026-06-11):**
- **Light / Dark** — a toggle
- **Aurora background — on / off** — a toggle

Two clean switches, NOT a preset menu. They feed a "Design preferences" section in the
emitted pack, so the coding agent builds light-vs-dark + aurora-on/off into the actual
project. (The operator's own portfolio — light/plain → dark/aurora — is exactly this
preference captured.)

**Level-gated exposure (the agency dial applied to settings):**
- **Beginner** → the two switches with smart defaults pre-set; nothing else
- **Intermediate** → the two switches, clean
- **Expert** → the switches **+ an "Advanced" expander** (progressive disclosure): model
  tier, doc verbosity, framework hints

**Data model:**
```ts
OutputPreferences {
  theme: 'light' | 'dark'   // the switch
  aurora: boolean           // the switch
  // advanced (expert-only, optional): modelTier, verbosity, frameworkHints
}
```
Set on the preferences step, threaded into synthesis, emitted as a design-context doc in
the pack. Hangs off the persona fork (Level gates exposure). This is the next deliberate
slice AFTER Slice 1 merges — not part of that merge. (Composes with the broader v-next
5-exemplar design-preset layer; the two simple switches are the minimal first form.)
