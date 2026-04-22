# VisionAir Report Contract

## Purpose
This document governs how Claude writes formal reports inside the VisionAir repository.

It exists to ensure that important system changes are:
- documented
- versioned
- traceable
- readable
- consistent

These reports are not casual notes.
They are governed records of meaningful repo, doctrine, governance, or execution-state changes.

---

## Canonical Report Location

Claude must write formal reports only to:

`docs/reports/`

This is the only canonical location for governed VisionAir reports.

### Rule
Claude must not write formal reports to:
- `app/`
- `.claude/`
- `archive/`
- `prototypes/`
- repo root

unless explicitly instructed otherwise by the user.

---

## Report Folder Rule

If `docs/reports/` does not exist, Claude may create it.

Claude must not create additional nested report folders unless:
- report volume becomes large enough to justify it
- the user explicitly requests a new reporting structure

### Default structure
Use a flat reporting structure:

`docs/reports/<version>-<slug>.md`

Example:
- `docs/reports/v1.0.0-initial-bootstrap-state.md`
- `docs/reports/v1.0.1-structural-alignment-pass.md`

---

## Report Versioning Rule

Claude must version reports using semantic-style report versions:

`vMAJOR.MINOR.PATCH`

### Meaning

#### MAJOR
Increase when:
- the reporting system itself changes
- the repo enters a new major lifecycle phase
- a foundational doctrine or architecture shift occurs

#### MINOR
Increase when:
- a new meaningful system milestone is reached
- a new AirFlow cycle completes
- a new governed pass materially changes repo state

#### PATCH
Increase when:
- a refinement pass updates the current state
- a correction pass resolves structural inconsistencies
- a small but meaningful governed change occurs

---

## Default Versioning Behavior

Until a more advanced reporting system exists, Claude should use this rule:

- keep `MAJOR` stable at the current system era
- increase `MINOR` for a new major pass or cycle
- increase `PATCH` for corrections and refinements inside that cycle

### Example
- `v1.0.0` = initial bootstrap state
- `v1.0.1` = structural alignment pass
- `v1.0.2` = initialization report
- `v1.1.0` = first full execution cycle complete

---

## Report Naming Rule

Every report filename must follow this format:

`vX.X.X-short-kebab-slug.md`

### Slug requirements
The slug must:
- be short
- describe the pass clearly
- use lowercase kebab-case
- avoid vague names like `update` or `notes`

### Good examples
- `v1.0.0-initial-bootstrap-state.md`
- `v1.0.1-structural-alignment-pass.md`
- `v1.0.2-initialization-report.md`
- `v1.1.0-first-execution-cycle.md`

### Bad examples
- `v1.md`
- `report.md`
- `notes.md`
- `update-final.md`

---

## When Claude Must Write a Report

Claude must write a formal report when one of the following happens:

### 1. Structural alignment changes
Examples:
- doctrine files moved
- path corrections
- repo tree reconciled
- canonical locations fixed

### 2. Initialization completes
Examples:
- full repo initialization executed
- doctrine loaded
- current state assessed
- next move selected

### 3. A major AirFlow cycle completes
Examples:
- bootstrap cycle completed
- governance cycle completed
- first scaffold cycle completed
- first execution cycle completed

### 4. Governance materially changes
Examples:
- CLAUDE.md upgraded
- new doctrine added
- reporting system added
- authority hierarchy changed

### 5. Repo state materially changes
Examples:
- canonical code scaffold added
- implementation layer begins
- major cleanup completed
- report contract activated

---

## When Claude Should NOT Write a Formal Report

Claude should not write a formal report for:

- tiny formatting edits
- cosmetic wording changes
- trivial renames with no structural impact
- low-impact file cleanup
- conversational planning only
- speculative discussion with no repo change

These may be acknowledged in chat, but should not create governed report noise.

---

## Report Required Sections

Every formal report must contain these sections in order:

### 1. Report Title
A clear title for the pass or event.

### 2. Report Version
The report version in `vX.X.X` format.

### 3. Purpose
Why this report exists.

### 4. Trigger
What action, command, or completed pass caused the report to be written.

### 5. State Observed
What the repo or system state was at the time of reporting.

### 6. Action Taken
What was actually done.

### 7. Result
What changed, what was resolved, or what is now true.

### 8. Validation
How the result was checked.

### 9. Readiness / Next Move
Whether the system is ready to proceed, and what the next highest-leverage move is.

---

## Report Writing Style

Reports must be:

- concise
- structured
- factual
- readable
- grounded in actual repo state

Reports must not be:

- hype-heavy
- vague
- overly dramatic
- bloated
- speculative without evidence

---

## Report Truth Rule

Reports must reflect:

- actual disk state
- actual file paths
- actual changes performed
- actual validation performed

Claude must not:
- claim work it did not verify
- report assumptions as facts
- imply completion without validation

---

## Report Authority

Reports are historical governed records.

They do not override doctrine.

### Authority hierarchy
1. `docs/` doctrine files
2. `.claude/` execution authority
3. `docs/reports/` governed historical records

Reports help explain what happened.
They do not redefine system truth unless doctrine is also updated.

---

## Report Promotion Rule

A report may be referenced later for:
- continuity
- state history
- debugging governance decisions
- understanding why a structural change occurred

But a report must not become doctrine automatically.

If a report reveals a lasting rule, that rule must be promoted separately into:
- doctrine
- governance
- growth rules
- contracts

---

## Claude Reporting Rule

When a reportable event occurs, Claude must:

1. determine whether the event meets report criteria
2. choose the correct next version
3. write the report into `docs/reports/`
4. use the required structure
5. keep the report grounded in verified state

---

## Initialization Reporting Rule

After the command:

**"Initialize VisionAir"**

Claude should write a formal report only if initialization:
- completes successfully
- surfaces meaningful state
- identifies a real next highest-leverage move

Suggested filename pattern:
- `docs/reports/v1.0.X-initialization-report.md`

---

## AirFlow Reporting Rule

AirFlow cycles that materially change repo state should produce reports.

This makes AirFlow:
- traceable
- inspectable
- professionally documented

The report is the governed record of the cycle outcome.

---

## One-Line Operating Rule

Claude must write formal reports only to `docs/reports/`, only for meaningful governed changes, and only in versioned, structured, disk-truth-based markdown form.
