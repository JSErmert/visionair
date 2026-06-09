<!-- [preset] VALIDATED DEFAULT for the Next.js/TS/Vercel house stack — verify against THIS app; flag any mismatch as a gap in docs/context/07-known-gaps.md. Authority: see citations inline. -->

# Testing Baseline

> Authority: Kent C. Dodds — "The Testing Trophy" (2018); Martin Fowler — "Test Pyramid" + "TestCoverage" (2012/2023); Fowler — "On the Diverse And Fantastical Shapes of Testing".

---

## Testing Trophy (integration-weighted)

For a Next.js/TypeScript app, use the **Testing Trophy** shape rather than the classic pyramid:

```
        /\
       /e2e\          (thin — conditional on UI surface)
      /------\
     /integr- \       <-- MOST TESTS LIVE HERE
    / ation    \
   /------------\
  / unit (pure)  \    (for pure functions, utilities, domain logic)
 /----------------\
/ static (TS+lint) \   (free — always on)
```

**Why integration-weighted?** Next.js Server Components, API routes, and Server Actions are best tested at the integration level (real request/response, in-memory DB or MSW mocks). Pure unit tests miss the framework contract; shallow component tests give false confidence. Integration tests are the best ROI for this stack.

---

## What to test first

1. **AuthZ paths** — every endpoint and Server Action that touches data must have a test proving an unauthenticated or unauthorized caller gets a 401/403, not data.
2. **Validation paths** — every input schema (Zod or equivalent) has a test for invalid input producing a useful error, not a 500.
3. **The money path** — the core user flow that makes or breaks the app's value. If something here breaks, you know immediately.
4. **Known-gaps and security controls** — any item in `07-known-gaps.md` that has a code fix should have a test that would have caught the gap.

---

## Coverage

**Coverage is REPORT-ONLY — no hard threshold gate.** Reasons:
- A hard coverage gate trains teams to write useless tests to hit the number rather than testing risk.
- 80% coverage on unimportant code is worse than 60% coverage on the critical path.
- The signal is the trend (is coverage growing?) and the gap (what important code is uncovered?), not a pass/fail binary.
- Authority: Fowler "TestCoverage" — "I would be suspicious of anything like 80% as a universal rule."

Configure Vitest to generate a coverage report (`v8` or `istanbul`) and commit the configuration — just do not fail the build on it.

---

## Tool Stack

| Layer | Tool | Note |
|---|---|---|
| Static / type | TypeScript + ESLint | Zero config overhead |
| Unit + integration | Vitest + `@testing-library/react` | Fast, ESM-native |
| API/route testing | Vitest + `node:http` or MSW | Integration level |
| E2E | Playwright | **Conditional** — see GAP below |

### GAP: E2E / Playwright
E2E tests against a running browser are high-value for apps with complex UI flows and low-value for API-only apps. Playwright is also expensive to maintain. **Elicit the UI surface** from `docs/context/03-spec.md` before adding Playwright. Track in `docs/context/07-known-gaps.md`.

---

## TDD Loop (per feature)

1. Write the failing test (describes desired behavior, not implementation).
2. Run — confirm it fails for the right reason.
3. Implement the minimum code to pass.
4. Run — confirm it passes.
5. Refactor (optional) — run again to confirm still green.
6. Commit.

Authority: Beck "Test-Driven Development by Example" (2002).
