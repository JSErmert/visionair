# VisionAir.v1.6B — Output Contract Required Return Fencing Patch Prompt

First, write this prompt content to:

docs/orchestration/governance/VisionAir.v1.6B_output_contract_required_return_fencing_patch_prompt.md

Then execute exactly as written below.

---

## Objective

Apply a narrow governance patch to the VisionAir Output Contract so that the **Required Return** section is emitted as a **copy-pasteable fenced markdown block**, instead of plain text.

This patch exists to improve:

- mobile-safe copying
- remote workflow reliability
- consistency with artifact printing
- separation between saved artifacts and execution metadata

This is a governance patch only.

Do NOT:
- rewrite the whole Output Contract
- change artifact priority
- change report rules
- change print/save ordering
- modify unrelated governance documents

Only update the Output Contract so Claude knows:
- what to add
- where to add it
- how Required Return should be printed going forward

---

## Inputs

- docs/orchestration/governance/VisionAir_output_contract.md

---

## Required Outputs

### Output 1
Revise in place:

docs/orchestration/governance/VisionAir_output_contract.md

### Output 2
Write:

docs/orchestration/reports/VisionAir.v1.6B_output_contract_required_return_fencing_patch_report.md

---

## Requirements

---

### 1. Scope Rule

This pass must modify only:

- `docs/orchestration/governance/VisionAir_output_contract.md`

Do NOT modify:
- VisionAir Report Contract
- any primary artifact
- any prompt file
- any other governance file

---

### 2. Patch Requirement

Add a new section to the Output Contract that explicitly governs **Required Return printing format**.

It must establish that:

- the Required Return block must be printed as a **single copy-pasteable fenced markdown block**
- the block must use the same **4-backtick fence standard** used for artifact printing
- the Required Return block must appear **after** all printed artifacts
- the Required Return block must **not** be emitted as plain text
- the Required Return block must **not** be split across multiple blocks
- the Required Return block must remain concise and structured
- the purpose of the rule is mobile-safe copying and execution-metadata clarity

---

### 3. Placement Rule

Insert this new section in the Output Contract in the most logical location for execution formatting rules.

It should live near the existing return-structure / print-formatting logic, not as a disconnected appendix.

---

### 4. Naming Rule

Name the new section clearly and directly.

Preferred title:

## Required Return Printing Format

Equivalent wording is acceptable only if equally clear.

---

### 5. Preservation Rule

Do not alter existing Output Contract behavior beyond what is required for this patch.

Preserve:
- save → print → continue flow
- artifact priority
- 4-backtick artifact fencing
- non-truncation rules
- report-printing rules
- structured return requirement itself

This patch changes **how Required Return is printed**, not whether it exists.

---

### 6. Report Requirements

The patch report must follow the current VisionAir Report Contract.

It must include:

- the decision locked
- why it matters
- what was intentionally not changed
- the main drift risk prevented by this patch
- confirmation that only the Output Contract was modified

Keep it concise and decision-impact focused.

---

### 7. Output Contract Compliance

Follow the VisionAir Output Contract as currently written for this patch pass.

- save the patch prompt
- revise the Output Contract in place
- save the patch report
- print the patch report
- do not print this prompt

---

## Required Return

Return:

1. revised output contract path
2. patch report path
3. confirmation that the Output Contract now requires fenced markdown printing for Required Return
4. one-sentence statement of what this patch changes
