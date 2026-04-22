# VisionAir Repo Growth Map

## Purpose
This document defines how the VisionAir repository is allowed to grow.

It exists to make future expansion:
- intentional
- readable
- constrained
- doctrine-aligned
- safe for Claude Code orchestration

This is not a build log.
It is a growth-governance map.

It defines:
- what exists now
- what may exist later
- when new branches are allowed
- what must not be created too early

---

## Core Principle
VisionAir must grow in the order of truth, not the order of excitement.

That means:
- current structure stays minimal on purpose
- future structure is planned, not guessed
- new branches only appear when they solve a real structural need
- Claude Code must not silently create platform sprawl

---

## Current Canonical Structure

```text
visionair/
├── README.md
├── .claude/
├── docs/
├── app/
├── components/
├── public/
├── styles/
├── prototypes/
└── archive/

These are the only canonical top-level branches in the first state.

Current Branch Meanings
README.md

Front door to the repo.

Contains:

what VisionAir is
who it serves
what the first sacred experience is
what the repo is currently focused on
.claude/

Active Claude Code orchestration layer.

Contains:

repo rules
architecture constraints
doctrine alignment instructions
implementation guardrails
docs/

Source-of-truth doctrine and product architecture.

Contains:

founding doctrine
first experience charter
preserve/reframe/release audit
build sequence
Phase 1 specs
session flow
screen copy
wireframe spec
app/

Canonical product implementation layer.

Contains:

real runtime experience
sacred experience screens
canonical routes and page structure
components/

Reusable UI and interaction components.

Contains:

prompt cards
synthesis blocks
progress indicators
blueprint modules
button groups
layout primitives
public/

Static assets.

Contains:

icons
logos
images
export assets
other truly needed static files
styles/

Global styling and design-system support.

Contains:

global CSS
theme tokens
spacing rules
typography primitives
motion rules if needed
prototypes/

Non-canonical experiments.

Contains:

early sacred-experience experiments
alternate flows
proof-of-feel builds
disposable validation work
archive/

Inactive legacy/reference material.

Contains:

old Claude config
context retrieval docs
legacy assets
deprecated or reference-only material
Growth Rule

No new top-level branch should be created unless:

it solves a real structural problem
it clearly reduces confusion
it is not already covered by an existing folder
it supports the sacred experience or its validated expansion
it would still make sense if VisionAir were being invented today from scratch

If these are not true, the new branch should not be created.

Allowed Future Branches

These branches are allowed in the future, but should not exist until their conditions are met.

Future Branch: lib/
Purpose

Shared non-UI logic.

Examples
orchestration helpers
blueprint assembly functions
state transformation utilities
prompt formatting logic
validation helpers
Create only when
non-UI logic is reused across multiple files
keeping logic inside app/ or components/ becomes messy
shared functions clearly deserve their own home
Do not create if
it is only being added to make the repo look mature
the shared logic is still too small or too unstable
Future Branch: hooks/
Purpose

Reusable React hooks.

Examples
session flow state hooks
synthesis state hooks
blueprint generation hooks
persistence hooks
Create only when
hooks are reused across multiple screens/components
session logic is clearly repeated
state management becomes more complex than local component state
Do not create if
only one screen uses the logic
the hook is speculative
reuse is imagined rather than real
Future Branch: types/
Purpose

Shared type definitions and schemas.

Examples
blueprint types
session-state models
user input schemas
synthesis object shapes
Create only when
types are reused across multiple layers
app and component logic need shared contracts
blueprint/session objects become important enough to formalize
Do not create if
types remain local and simple
the app is still too early for central typing
Future Branch: tests/
Purpose

Formal validation of behavior.

Examples
component tests
session flow tests
artifact generation tests
schema tests
orchestration behavior tests
Create only when
sacred experience behavior is stable enough to test
repeated regressions justify formal validation
implementation has enough shape to preserve
Do not create if
the sacred experience is still changing rapidly
test architecture would outweigh actual product proof
Allowed Future Sub-Branches Inside Existing Folders

These are preferred before adding brand-new top-level branches.

Future docs/ sub-branches
docs/future/

For explicitly deferred ideas.

Use for:

later-stage concepts
platform ideas not yet allowed into scope
possible expansions that should remain non-canonical

Create only when:

future thinking needs containment
deferred ideas are cluttering core doctrine docs
docs/testing/

For structured user-testing materials.

Use for:

interview scripts
test prompts
feedback synthesis
evaluation notes

Create only when:

real user testing begins
Future app/ sub-branches

These should emerge only when implementation becomes real.

Possible patterns:

sacred experience route grouping
blueprint output grouping
version-one planning area later

Create only when:

route structure is needed by actual product flow
sacred experience implementation is underway

Do not create broad app subtrees for future platform ideas too early.

Future components/ sub-branches

Possible patterns:

components/ui/
components/session/
components/blueprint/

Create only when:

component count is large enough to justify grouping
grouping reduces confusion

Do not pre-create deep component trees.

Future archive/ sub-branches

Recommended:

archive/legacy-claude/
archive/context-retrieval/
archive/old-assets/

Create as needed when real legacy material is moved in.

Forbidden Early Branches

The following should not be created early unless a later doctrine explicitly allows them.

Forbidden early top-level branches
dashboard/
admin/
infrastructure/
services/
agents/
workflows/
analytics/
community/
marketplace/
backend/ as a broad abstraction layer before it is structurally needed
Why

These tend to imply:

platform sprawl
premature architecture
startup-software drift
imaginary maturity
hidden deviation from the sacred experience
Current Priority of Growth
Priority 1

Protect the doctrine layer.

Priority 2

Build the sacred experience in app/.

Priority 3

Create only the components needed for that experience.

Priority 4

Keep experiments inside prototypes/.

Priority 5

Move legacy material into archive/, never into canonical folders.

Branch Creation Order

When growth becomes necessary, branch creation should happen in this order:

First preference

Use existing folders better.

Second preference

Create sub-branches inside existing folders.

Third preference

Create a new top-level branch only if the structure truly demands it.

This keeps the repo:

skeletal
intentional
explainable
Claude-friendly
Claude Code Expansion Rules

Claude Code should assume:

the current tree is minimal on purpose
missing folders are not invitations to invent structure
docs/ is authoritative
prototypes/ is non-canonical
archive/ is non-governing
future branches require explicit need, not convenience
the sacred experience remains the center
Promotion Rules

A concept or artifact may move:

From prototypes/ -> app/

Only if it proves:

clarity
trust
usefulness
doctrinal alignment
From archive/ -> canonical structure

Only if it passes:

preserve / reframe / release logic
current product-fit review
sacred experience relevance
From deferred idea -> real branch

Only if:

it solves a real structural problem now
it does not dilute Phase 1 or Phase 2 priorities
Growth Anti-Patterns

Avoid these:

1. Folder inflation

Creating folders to feel advanced.

2. Architecture theater

Adding structural complexity before the sacred experience is proven.

3. Legacy seepage

Letting archive material silently become authoritative again.

4. Prototype drift

Letting experiments become canonical without explicit promotion.

5. Platform hallucination

Building for the imagined future instead of the proven present.

First-State Philosophy

The repo should feel:

clean
governed
sparse by design
ready for depth
not prematurely expanded

The repo should not feel:

bloated
speculative
over-foldered
startup-enterprise styled
architecturally noisy
One-Line Growth Compass

Grow the repo only when new structure makes the sacred experience clearer, cleaner, or more trustworthy.