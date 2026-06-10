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
