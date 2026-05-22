#!/usr/bin/env bash
# ExoGenius ship-gate for VisionAir. Calls the independent runtime; does not own it.
# Override (conscious + logged + counted):  EXOGENIUS_OVERRIDE="reason" git push
set -euo pipefail

UPSTREAM="$(git rev-parse --abbrev-ref @{u} 2>/dev/null || echo "")"
if [ -n "$UPSTREAM" ]; then RANGE="$UPSTREAM..HEAD"; else RANGE="HEAD~1..HEAD"; fi
DIFF="$(git diff "$RANGE")"

if [ -z "$DIFF" ]; then
  echo "ExoGenius: no diff to gate."
  exit 0
fi

if [ -n "${EXOGENIUS_OVERRIDE:-}" ]; then
  printf '%s' "$DIFF" | exogenius gate --deliverable visionair --diff-file - --override "$EXOGENIUS_OVERRIDE"
else
  printf '%s' "$DIFF" | exogenius gate --deliverable visionair --diff-file -
fi
