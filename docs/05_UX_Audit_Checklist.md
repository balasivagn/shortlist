# ShortList — UX Audit Brief & Checklist

*Senior UX Director audit framework. Use as the rubric for design + eng review. Last written 2026-06-12.*

---

## 0. The Thesis (read this first)

ShortList is **not** a search product or a chatbot. The job-to-be-done is **decision confidence**, not discovery. The user already *found* the options — Amazon, YouTube, and reviews gave them too many. What they couldn't do was *commit* (opened Amazon Wednesday, still hadn't ordered by Friday).

Judge every UX decision against one question:

> **Does this move the user from "overwhelmed" to "confident enough to buy"?**

This is a **trust-transfer product**: the user outsources judgment to a swarm of AI agents. The UX's primary job is to make that trust **earned and legible**, not assumed.

**The one thing to watch most:** the biggest risk is that ShortList quietly becomes *a prettier Amazon* — a ranked list the user still has to decide between. The moment the UI optimizes for "show more good products" over "make one choice feel safe," it has lost.

> Amazon gives options. ShortList gives confidence.

---

## 1. UX Goals (priority order)

| # | Goal | Why | Met when |
|---|------|-----|----------|
| **G1** | **Confidence over comprehensiveness** | Fails if it recreates the Amazon "wall of options." One clear pick > 30 ranked choices. | User can state the winner + one reason within 5s of results landing. |
| **G2** | **Legible trust** | Users trust AI only when they can see reasoning, evidence, and limits. Confidence with no visible "why" reads as a guess. | Every claim traces to a source or stated assumption; confidence shown honestly, including when low. |
| **G3** | **Red flags first-class** | The differentiator vs. Amazon/influencers is surfacing what's *wrong*, not just what's good. | Red flags never buried; a dealbreaker is visibly flagged, not silently de-ranked. |
| **G4** | **Constraints are the user's, made explicit** | The value is matching against *their* real constraints (elderly, easy cleaning, food safety, India). | Criteria used are shown and editable; user recognizes their own constraints reflected back. |
| **G5** | **Waiting feels like work, not lag** | A swarm of 8 agents takes time. Dead spinners destroy trust; visible progress builds it. | The wait communicates labor ("checking durability complaints…") and increases perceived thoroughness. |
| **G6** | **Memory feels like a relationship, not surveillance** | "Remember: avoid food-contact plastic" should feel like learning *for* the user, with consent. | Saved preferences shown, attributed, reversible; nothing remembered silently. |

---

## 2. UX Best-Practice Checklist

### A. First impression / empty state
- [ ] Value proposition legible in **one sentence** before any interaction.
- [ ] Empty input state **shows what a good query looks like** (popular-queries pattern — keep it).
- [ ] No login wall, no friction before first value (honor PRD non-goal).
- [ ] User understands *this is research, not chat* before they type.

### B. Input / framing the request
- [ ] Natural language accepted; no rigid form fields.
- [ ] System **reflects back its interpretation** (who it's for, key constraints) so a misread is caught early.
- [ ] Remembered preferences shown *before* results, so the user knows what's applied.
- [ ] Obvious, low-cost way to correct/add a constraint.

### C. The wait (research in progress)
- [ ] Progress is **specific and human-readable** ("Scanning durability complaints," not "Loading 60%").
- [ ] Stages map to real agent work, building a sense of thoroughness.
- [ ] Perceived time < actual time; never a bare spinner.
- [ ] Graceful partial results if one agent fails — never a total dead-end.

### D. The results / dossier
- [ ] **One winner is unambiguous** — hierarchy makes the recommendation the loudest thing on screen.
- [ ] The **"why this one"** is answerable without clicking — reasoning surfaced, not hidden behind an expander.
- [ ] **Confidence is honest** — a low-confidence result says so. Never fake certainty.
- [ ] **Red flags first-class** — visually weighted, per-product, not euphemized.
- [ ] Every factual claim links to or cites **evidence** the user can spot-check.
- [ ] The 3-item shortlist supports comparison **without** reintroducing paralysis (clear axes, not a 20-column spec table).
- [ ] Scannable in 30 seconds (the PRD's own success bar).

### E. Trust & honesty
- [ ] Sponsorship/bias-free positioning is *felt*, not just claimed.
- [ ] Product states what it **didn't / couldn't** check (no false completeness).
- [ ] No dark patterns: no fake urgency, no manufactured scarcity, no affiliate nudging.
- [ ] AI limitations acknowledged where they matter (no medical/safety guarantees — per non-goals).

### F. Memory & continuity
- [ ] Saving a preference is **explicit and confirmed** ("Saved: avoid food-contact plastic").
- [ ] Remembered preferences are **visible and reversible**.
- [ ] Memory framed as serving the user, never as data capture.

### G. Cross-cutting craft
- [ ] Accessible: contrast, focus states, keyboard nav, screen-reader labels on dossier cards.
- [ ] Responsive: left-chat / right-dossier layout degrades gracefully on mobile (real risk — two-pane layouts collapse badly).
- [ ] Error & edge states designed (no results, ambiguous query, region with no availability).
- [ ] Motion is functional (signals progress/state), never decorative lag.
- [ ] Tone is calm and advisory — a trusted friend who did the homework, not a hype machine.

---

## 3. How to Run the Audit

**Phase 1 — Frame (½ day).** Re-confirm the JTBD. Align on G1–G6 as the rubric. No screen gets reviewed without a goal to grade it against.

**Phase 2 — Heuristic pass (1 day).** Walk the full journey (empty state → query → wait → dossier → memory save) against the checklist + Nielsen's heuristics, weighting **trust legibility** and **honest uncertainty** heaviest. Score each screen Red / Yellow / Green per goal. Tag every finding with its goal (G1–G6) + severity.

**Phase 3 — The "30-second test" (½ day).** Can a fresh user state the winner + one reason in 30s? Run on 5 people matching the persona (buying for a parent). Validates G1 + G2 better than any heuristic.

**Phase 4 — Trust stress-tests.** Deliberately probe category-killers:
- Show a **low-confidence** result — does the UI stay honest?
- Inject a **product with a dealbreaker** — is the red flag impossible to miss?
- **Misread a constraint** — can the user catch + correct it cheaply?
- **One agent fails** — graceful degrade or dead-end?
- **Mobile** — does the two-pane dossier survive the collapse?

**Phase 5 — Synthesize & prioritize.** Map findings on **impact-on-confidence × effort**. Order by trust impact, not visual polish. A buried red flag (G3) outranks a misaligned margin.

**Phase 6 — Deliver.** Short readout: trust thesis, G1–G6 scorecard (R/Y/G), top 5 confidence-killers with annotated examples, sequenced fix roadmap.

---

## 4. Scorecard (fill in during review)

| Goal | Status (R/Y/G) | Top finding | Owner |
|------|----------------|-------------|-------|
| G1 — Confidence over comprehensiveness | | | |
| G2 — Legible trust | | | |
| G3 — Red flags first-class | | | |
| G4 — Constraints explicit | | | |
| G5 — Waiting feels like work | | | |
| G6 — Memory as relationship | | | |
