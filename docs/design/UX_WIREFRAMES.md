# UX Wireframes — Synthetic Persona Web

This document outlines the current user flows for the two main surfaces.

---

## 1) Idea Stress Test (Route: `/`)

**Step 1 — Inputs**
- Persona selector
- Challenge level selector
- Idea (multi‑line)
- Goal (multi‑line)
- Evaluation focus (multi‑line)

**Step 2 — Results**
- Persona reaction + verdict summary
- Strengths, gaps, improvements, questions
- Confidence indicator
- Call‑to‑action to refine the pitch

**Step 3 — Refinement**
- Missing‑info questions (if any)
- Refined pitch + changes summary

---

## 2) Copywriter (Route: `/copywriter`)

**Step 1 — Inputs**
- Persona selector
- Platform selector(s)
- Format selector(s)
- Context + message + goal

**Step 2 — Outputs**
- Copy outputs grouped by platform
- Primary + alternate copy, hashtags, CTA, notes

---

## 3) Profile and 2FA Setup (Route: `/profile`)

**Step 1 — Security Overview**
- Show account email
- Show current 2FA status (`Enabled`/`Disabled`)

**Step 2 — Guided 2FA Onboarding**
- Ask device type (iOS or Android)
- Offer authenticator app options
- Desktop-friendly handoff:
  - open store link
  - copy store link
  - QR code that opens app-store link on phone camera

**Step 3 — Connect Authenticator**
- Generate account-specific QR code
- Manual setup secret fallback
- User confirms they scanned code

**Step 4 — Verify Code**
- User enters 6-digit TOTP code
- Success state shown immediately
- Recommended confirmation: sign out and sign in again

---

## Notes

- Dark theme with indigo accents.
- Inputs are form‑heavy; keep labels explicit and validation clear.
- Output sections should be scannable and grouped by source.
