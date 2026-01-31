Testing Synthetic Persona Web

This document describes the current testing posture.

---

## 1. Current State

There are no automated test scripts configured in `package.json` at this time. The project relies on manual QA and runtime validation (Zod schemas + JSON guards).

---

## 2. Manual QA Checklist

Stress Test
- Submit valid inputs and verify response includes reaction, verdict, strengths, gaps, questions, and confidence.
- Confirm challenge levels load correctly from `/api/challenge-levels`.

Idea Refinement
- Trigger missing‑info questions and verify “needs_input” response.
- Provide answers and verify refined pitch + changes summary.

Copywriter
- Load platform/format catalog.
- Generate copy for a single platform/format and verify output ordering and structure.

Legacy Scorecard
- Call `/api/scorecard` with valid inputs and verify narratives + suggestedFocus.

---

## 3. Suggested Future Enhancements

- Unit tests for `src/lib/aiNarrative.ts` math helpers.
- Integration tests for `/api/stress-test`, `/api/idea-refinement`, and `/api/copywriter` with mocked OpenAI.
- Contract tests for API schemas.

