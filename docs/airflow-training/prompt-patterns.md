# AirFlow Prompt Patterns  
  
## Purpose  
This document captures reusable, high-leverage prompt patterns for building, governing, aligning, and advancing systems using AirFlow.  
  
It is a training-layer artifact.  
  
It must:  
- remain fully copyable  
- remain internally consistent  
- remain structured  
- contain no conversational narrative  
- be suitable for direct reuse in future orchestration  
  
This document does not override runtime governance.  
It exists to teach and replicate successful orchestration patterns.  
  
---  
  
## Usage Rule  
  
Use the simplest pattern that fits the current state.  
  
Do not:  
- combine multiple patterns into one prompt unnecessarily  
- expand scope beyond the pattern’s intent  
- apply patterns out of sequence  
  
---  
  
# Pattern 1 — Structural Alignment Pass  
  
## Use Case  
Correct misalignment between declared governance and actual repo structure.  
  
## Goal  
Fix structure without expanding scope.  
  
## Template  
  
Run a single structural alignment pass.  
  
Goal:  
Bring the repository into structural alignment with governance.  
  
Execute only the following:  
  
1. [specific move]  
2. [specific rename / relocation]  
3. [specific reference correction]  
  
Do NOT:  
  
* create new files  
* expand architecture  
* modify doctrine meaning  
* refactor implementation  
  
After completion, return a concise report confirming:  
  
* what changed  
* what is now aligned  
* whether the system is ready for the next move  
  
---  
  
# Pattern 2 — Non-Reportable Refinement Pass  
  
## Use Case  
Apply small governance or cleanup changes before a major milestone.  
  
## Goal  
Refine system state without polluting report history.  
  
## Template  
  
Run this as a non-reportable refinement pass.  
  
Purpose:  
Apply a small governance/output refinement before the next major reportable event.  
  
Do NOT:  
  
* write a report  
* increment report versions  
* expand scope  
  
Execute only:  
  
1. [specific refinement]  
2. [specific enforcement addition]  
3. [specific cleanup]  
  
After completion, return only a concise confirmation.  
  
---  
  
# Pattern 3 — Runtime-Readiness Pass  
  
## Use Case  
Enable a scaffolded system to run.  
  
## Goal  
Add only the minimum runtime configuration required for execution.  
  
## Template  
  
Run a runtime-readiness pass.  
  
Purpose:  
Make the current scaffold runnable without changing structure or doctrine.  
  
Create only:  
  
* package.json  
* tsconfig.json  
* Tailwind runtime config  
* minimal supporting files required for execution  
  
Do NOT:  
  
* refactor scaffold files  
* add architecture  
* change flow logic  
* modify doctrine  
  
After execution:  
  
1. validate runtime readiness  
2. write the governed report  
3. print the full report in fenced markdown  
  
---  
  
# Pattern 4 — Bootstrap Injection Pass  
  
## Use Case  
Apply an existing repository bootstrap manifest.  
  
## Goal  
Create files exactly as defined in the manifest.  
  
## Template  
  
execute Stage 7  
Apply docs/repository-bootstrap-manifest-v1.md exactly as the Stage 7 bootstrap injection payload.  
Constraints:  
* do not introduce extra architecture  
* do not create unauthorized folders  
* do not modify doctrine files  
* keep scope limited to the manifest  
* verify each file lands at the correct path  
After execution:  
1. validate repo state against doctrine and growth rules  
2. write the next governed report  
3. print the report in fenced markdown  
4. provide a concise execution summary  
  
---  
  
# Pattern 5 — Initialization Command Design  
  
## Use Case  
Create a single-command system entrypoint.  
  
## Goal  
Load full system state and begin governed execution.  
  
## Template  
  
Initialize [System Name]  
  
Claude must:  
  
1. load doctrine files  
2. load doctrine files  
3. load repo structure files  
4. load repo structure files  
5. load execution authority  
6. load execution authority  
7. activate AirFlow  
8. activate AirFlow  
9. inspect current repo state  
10. inspect current repo state  
11. identify the highest-leverage next move  
12. identify the highest-leverage next move  
13. execute the highest-leverage next move according to AirFlow  
  
---  
  
# Pattern 6 — Highest-Leverage Next Move Selection  
  
## Use Case  
Select one next action when multiple options exist.  
  
## Goal  
Force disciplined prioritization.  
  
## Template  
  
Based on the current repo state, doctrine, and constraints, identify the single highest-leverage next move.  
  
Requirements:  
  
* choose only one move  
* justify why it is higher leverage than alternatives  
* explain why other reasonable moves are not selected yet  
* remain inside current scope and governance  
  
---  
  
# Pattern 7 — Doctrine Extraction From Legacy Material  
  
## Use Case  
Extract useful principles from legacy systems.  
  
## Goal  
Preserve intelligence without importing drift.  
  
## Template  
  
Extract the governing principles from these legacy files into the new system.  
  
Do NOT promote the raw files directly into canonical authority.  
  
Instead:  
  
* identify invariant principles  
* discard implementation-specific noise  
* rewrite them to fit the current system  
* recommend the correct new canonical file location  
  
---  
  
# Pattern 8 — Contract Enforcement Injection  
  
## Use Case  
Enforce an existing contract in execution layer.  
  
## Goal  
Reference contract without duplication.  
  
## Template  
  
Run a focused update on .claude/CLAUDE.md.  
Do NOT rewrite the file. Do NOT modify unrelated sections.  
Add a short enforcement section that:  
* enforces use of [contract file]  
* defines canonical location  
* defines qualifying events  
* forbids low-value or trivial application  
Keep the addition concise. Reference the contract instead of copying it.  
  
---  
  
# Pattern 9 — Dual Output Enforcement  
  
## Use Case  
Separate execution output from formal report output.  
  
## Goal  
Maintain clean runtime vs historical layers.  
  
## Template  
  
For this reportable event, produce two outputs:  
1. Chat Output  
* concise execution summary  
* validation result  
* readiness / next move  
2. Formal Report  
* written to docs/reports/  
* follows docs/report-contract.md  
* printed in chat as an exact fenced markdown copy  
Do not merge these outputs. Do not include conversational reasoning inside the report.  
  
---  
  
# Pattern 10 — State Correction Before Progression  
  
## Use Case  
Fix system state before moving forward.  
  
## Goal  
Stabilize system before expansion.  
  
## Template  
  
Run a correction pass based on the initialization report.  
  
This is a stabilization pass, not an expansion pass.  
  
Execute only the structural corrections identified.  
  
Do not:  
  
* propose new directions  
* introduce new files unless required  
* begin implementation before the state is corrected  
  
After completion, confirm readiness for progression.  
  
---  
  
# Pattern 11 — Formal Readiness Check  
  
## Use Case  
Determine if system is ready for next major step.  
  
## Goal  
Prevent premature execution.  
  
## Template  
  
Inspect the repo and determine whether the system is ready for [major next command].  
  
Return:  
  
* current state  
* blockers, if any  
* readiness status  
* exact highest-leverage next move if not ready  
  
Base the answer on actual disk truth.  
  
---  
  
# Pattern 12 — Copyable Artifact Generation  
  
## Use Case  
Generate repo-ready artifacts.  
  
## Goal  
Ensure output is clean and directly usable.  
  
## Template  
  
Provide one formal markdown print format only.  
  
Requirements:  
  
* no canvas format  
* no extra explanation outside the artifact  
* fully copyable  
* repo-ready  
* exact file content  
  
---  
  
# Pattern Selection Guidance  
  
Use patterns in sequence:  
  
1. Diagnose state    
2. Correct structure    
3. Enforce governance    
4. Enable runtime    
5. Inject scaffold    
6. Validate output    
7. Progress    
  
Avoid:  
- premature abstraction  
- parallel branching  
- future planning beyond current state  
  
---  
  
# AirFlow Prompt Characteristics  
  
A strong AirFlow prompt must:  
  
- have one clear purpose  
- have constrained scope  
- define explicit boundaries  
- define success condition  
- operate on current state  
- prioritize leverage over completeness  
  
---  
  
# One-Line Summary  
  
AirFlow prompt patterns are structured, reusable orchestration templates that convert system-level reasoning into governed, high-leverage execution.
