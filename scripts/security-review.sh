#!/usr/bin/env bash
#
# Claude security review — runs before `git push`.
#
# Ryan-spec: "use Claude to write SECURITY.md security standards, then have
# Claude read it to perform a code review." This script does the second half:
# it feeds SECURITY.md + the outgoing diff to the Claude CLI in headless
# (-p / print) mode and asks for a strict review against the documented
# controls. It complements the fast deterministic gates (gitleaks, Trivy) with
# a reasoning-based review layer.
#
# Wiring: registered as a pre-commit-framework `pre-push` hook (see
# .pre-commit-config.yaml). Runs once per push, not per commit — keeps API
# spend down (Ryan flagged the credit concern).
#
# Override (skip) for a single push:  git push --no-verify
# Run manually any time:               bash scripts/security-review.sh
#
set -uo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
SECURITY_MD="$REPO_ROOT/SECURITY.md"

# ---- Graceful skips (never hard-fail the push for infra reasons) ----
if ! command -v claude >/dev/null 2>&1; then
  echo "[security-review] claude CLI not found on PATH — skipping (gitleaks/Trivy still ran)."
  exit 0
fi
if [ ! -f "$SECURITY_MD" ]; then
  echo "[security-review] no SECURITY.md in repo root — skipping."
  exit 0
fi

# ---- Determine the diff being pushed ----
# Prefer the pre-commit framework's supplied range; else upstream..HEAD; else last commit.
if [ -n "${PRE_COMMIT_FROM_REF:-}" ] && [ -n "${PRE_COMMIT_TO_REF:-}" ]; then
  RANGE="${PRE_COMMIT_FROM_REF}..${PRE_COMMIT_TO_REF}"
elif git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
  RANGE='@{u}..HEAD'
else
  RANGE='HEAD~1..HEAD'
fi

# Exclude lockfiles + generated noise from the review surface.
DIFF="$(git diff "$RANGE" -- . \
  ':(exclude)package-lock.json' \
  ':(exclude)*.lock' \
  ':(exclude)pnpm-lock.yaml' \
  2>/dev/null)"

if [ -z "$DIFF" ]; then
  echo "[security-review] no code diff in $RANGE to review — passing."
  exit 0
fi

# Cap the diff so the review stays focused + cheap (~60KB ≈ a large but bounded change).
DIFF_TRUNC="$(printf '%s' "$DIFF" | head -c 60000)"

# ---- Build the review prompt (SECURITY.md + diff inline; no tools needed) ----
read -r -d '' INSTRUCTIONS <<'EOF'
You are a strict security reviewer for a pre-push gate. Read the project's
SECURITY.md standards below, then review ONLY the provided git diff against
those standards. Look specifically for:
  - leaked secrets / API keys / tokens / private keys
  - injection vectors (prompt injection, SQL, command, path traversal)
  - authn / authz gaps, missing input validation, unsafe deserialization
  - violations of the explicit controls documented in SECURITY.md
  - dependency or config changes that weaken the security posture

Be precise and terse. Do not invent issues. If the diff is clean against the
standards, say so.

Output format:
  - A short bullet list of findings, each as: <file>: <issue> — violates <SECURITY.md rule> [severity: low|med|high]
  - Then EXACTLY one final line, one of:
      VERDICT: PASS       (no concerns)
      VERDICT: CONCERNS   (advisory issues, non-blocking)
      VERDICT: BLOCK      (must fix before pushing)
If there are no findings at all, output only: VERDICT: PASS
EOF

PROMPT="$INSTRUCTIONS

===== SECURITY.md (the standards) =====
$(cat "$SECURITY_MD")

===== GIT DIFF (being pushed, range: $RANGE) =====
$DIFF_TRUNC"

echo "[security-review] Claude reviewing outgoing diff ($RANGE) against SECURITY.md…"
REVIEW="$(printf '%s' "$PROMPT" | claude -p 2>&1)"
RC=$?

echo "------------------------------- Claude security review -------------------------------"
echo "$REVIEW"
echo "--------------------------------------------------------------------------------------"

# If the CLI itself errored (rate limit, auth, no credits), don't block the push.
if [ $RC -ne 0 ]; then
  echo "[security-review] claude CLI returned $RC — treating as advisory, not blocking."
  exit 0
fi

if printf '%s' "$REVIEW" | grep -q 'VERDICT: BLOCK'; then
  echo "[security-review] ❌ BLOCK — address the findings above, or override with: git push --no-verify"
  exit 1
fi

if printf '%s' "$REVIEW" | grep -q 'VERDICT: CONCERNS'; then
  echo "[security-review] ⚠️  Concerns noted (advisory) — push proceeding."
fi

echo "[security-review] ✅ OK to push."
exit 0
