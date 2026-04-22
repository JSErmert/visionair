# VisionAir — Highest-Leverage Move Contract

## Purpose
This contract enforces how Claude must identify, prioritize, and communicate the **single highest-leverage next move** at every meaningful system step.

It ensures that:
- reasoning translates into action
- prioritization is visible and consistent
- the system progresses through a **closed-loop sequence**
- outputs reinforce **AirFlow orchestration behavior**

This is not optional formatting.  
This is **execution authority**.

---

## Core Principle

At any point in system evolution, there exists:

> one move that produces more progress than all others combined

Claude must:
- find it
- justify it
- express it clearly
- execute it or request confirmation

---

## Required Output Block

Every reportable pass MUST end with the following structure:

---

### Current System State
A concise, factual description of where the system is now.

Must include:
- what is working
- what is not
- where the bottleneck is

---

### Highest-Leverage Next Move
State the single most impactful move.

Rules:
- must be singular (no lists)
- must be actionable
- must target the real bottleneck, not surface issues

---

### Exact Next Step
Translate the move into a precise action.

Must:
- be executable without interpretation
- specify where and how to act (file, function, pass, etc.)
- avoid abstraction

---

### Why This Move
Explain why this move is highest leverage.

Must include:
- impact relative to alternatives
- what it unlocks
- why it is sequenced now

---

### What Not To Do Yet
Explicitly list 2–4 reasonable alternatives that are NOT chosen.

For each:
- explain why it is lower leverage
- clarify when it should be done instead

---

## Prioritization Rules

Claude must always:

1. Choose **one move**
   - Never present multiple equal options

2. Prefer **system-level fixes over surface fixes**

3. Prefer **integration over isolation**
   - If multiple surfaces are affected, the move must reflect that

4. Prefer **data flow fixes over logic tweaks**
   - If output is wrong, check source-of-truth first

5. Prefer **runtime behavior alignment over documentation updates**

---

## Closed-Loop Requirement

Each output must enable the next step in a loop:

```text
State → Move → Step → Execution → New State → Repeat
```

Claude must:

* assume the loop continues
* ensure the next step is well-defined
* avoid leaving the system in an ambiguous state

---

## Failure Conditions

This contract is violated if:

* multiple "next moves" are presented without ranking
* prioritization is implied but not stated
* the move is vague or abstract
* no reasoning is provided for prioritization
* outputs default to summaries instead of decisions
* Claude avoids committing to a single direction

---

## Interaction with Other Contracts

### Structural Constraint Layer
* governs how outputs are formed

### Report Contract
* governs when and how reports are written

### This Contract
* governs what the system chooses to do next

All three must operate together.

---

## Execution Behavior

Claude must:

* treat this contract as mandatory
* apply it to:
    * reports
    * evaluation passes
    * system upgrades
    * architecture decisions
* elevate the Highest-Leverage Move block as the primary outcome
* treat all preceding analysis as support, not the final output

---

## Final Directive

Claude must always move the system forward by:

identifying the real bottleneck
selecting the highest-leverage move
and defining the exact step to resolve it

No output is complete without this.

---

## One-Line Summary

Every step must clearly answer: what is the most important thing to do next, and exactly how to do it.
