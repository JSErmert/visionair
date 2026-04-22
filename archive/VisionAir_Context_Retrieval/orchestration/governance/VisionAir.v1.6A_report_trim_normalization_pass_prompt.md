# VisionAir.v1.6A — Report Artifact Trim & Normalization Pass

First, write this prompt content to:

docs/orchestration/governance/VisionAir.v1.6A_report_trim_normalization_pass_prompt.md

Then execute exactly as written below.

---

## Objective

Run a narrow normalization pass across existing VisionAir **report artifacts** to remove any embedded chat-return scaffolding that should not live inside the saved report files.

This pass exists because some reports may contain appended blocks such as:

- `Required Return`
- numbered return summaries
- chat-facing path confirmations
- duplicate next-artifact notes written in return-block style

Those belong in execution return output, not inside the persisted report artifact.

This is a **trim / normalization pass only**.

Do NOT:
- rewrite report decisions
- change report meaning
- alter authority statements
- restyle reports into a different report format
- touch primary artifacts
- touch prompts
- touch output/report contracts

Only remove report-ending material that belongs to execution return formatting rather than the saved report itself.

---

## Inputs

- docs/orchestration/governance/VisionAir_report_contract.md
- docs/orchestration/reports/

Review all existing report artifacts in:

`docs/orchestration/reports/`

and identify any that contain embedded return-block content that violates the report contract.

---

## Required Outputs

### Output 1
Revise in place all affected report artifacts in:

`docs/orchestration/reports/`

### Output 2
Write:

docs/orchestration/reports/VisionAir.v1.6A_report_trim_normalization_report.md

---

## Requirements

---

### 1. Scope Rule

Only report artifacts may be changed.

Do NOT modify:
- primary architecture/specification artifacts
- prompt files
- governance documents
- output contract
- report contract

---

### 2. Trim Rule

Remove only content that is clearly execution-return scaffolding, including patterns such as:

- `Required Return`
- numbered path-return lists
- chat-facing confirmation blocks
- repeated "next artifact" lines written as return output rather than report prose

If a section is genuine report content, keep it.

---

### 3. Preservation Rule

For every revised report:

- preserve the report's title
- preserve the report's decisions
- preserve constraints / unresolved / drift risk / handoff content
- preserve the one-sentence chain addition if present
- preserve preservation/authority statements if they are part of the report

Only trim the non-artifact chat-return material.

---

### 4. Report Contract Alignment

Use the current VisionAir Report Contract as the governing standard.

The result should make each affected report feel like:
- a saved report artifact
not
- a pasted tool/chat return

---

### 5. Normalization Report

The normalization report must contain:

- which report artifacts were affected
- what kind of trim was applied
- confirmation that no primary artifacts were changed
- confirmation that the pass was limited to return-block cleanup
- whether any reports required no changes

This report should follow the current VisionAir Report Contract.

---

### 6. Output Contract Compliance

Follow the VisionAir Output Contract:
- save the pass prompt
- revise affected reports in place
- save the normalization report
- print the normalization report
- do not print this prompt

If no reports required trimming, still produce the normalization report confirming that outcome.

---

## Required Return

Return:

1. list of affected report paths
2. confirmation that only report artifacts were modified
3. normalization report path
4. one-sentence statement of what this pass accomplished
