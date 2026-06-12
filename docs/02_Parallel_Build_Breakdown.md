# Shortlist — Parallel Build Breakdown

## Build Principle
One working workflow beats a broad architecture. Every module must produce a JSON output that can be rendered even if other modules are mocked.

## Phase 0 — Pre-Build Freeze
Owner: Lead/Orchestrator
Duration: 10 minutes before build
Output: env vars, repo structure, fixed contracts, demo query.

Tasks:
- Create Next.js app.
- Add shadcn/ui if available, otherwise plain Tailwind cards.
- Add env variables: AI_GATEWAY_API_KEY, EXA_API_KEY, MEM0_API_KEY, MANUS_API_KEY optional, MODEL_ID.
- Create /lib/contracts.ts first. All teams import from it.

## Phase 1 — Skeleton UI
Owner: Frontend Agent
Deliverable: one page UI that can render mocked ResearchResult.

Tasks:
- Build split layout: chat left, research dossier right.
- Create reusable cards: MemoryCard, CriteriaCard, ResearchProgressCard, ProductCard, RedFlagsCard, RecommendationCard, VerificationCard.
- Add loading state messages.
- Add “Save Preference” button.
- Use mock JSON until backend works.

Acceptance:
- Pasting a mock ResearchResult renders the full dossier without backend.

## Phase 2 — Data Contracts
Owner: Contracts Agent
Deliverable: shared TypeScript types and Zod schemas.

Tasks:
- Define ResearchRequest.
- Define UserMemory.
- Define ProductCandidate.
- Define ProductEvidence.
- Define ProductRisk.
- Define ConstraintScore.
- Define RankedProduct.
- Define ResearchResult.

Acceptance:
- Frontend and backend compile against the same schemas.

## Phase 3 — Exa Research Tools
Owner: Research Agent
Deliverable: functions returning candidate products, evidence, and risks.

Functions:
- discoverProducts(query, constraints)
- gatherEvidence(productName, query)
- gatherRisks(productName, query)

Implementation notes:
- Use Exa search for product discovery.
- Use Exa search/contents for reviews, discussions, complaints, and product pages.
- Keep result count low: 5 to 8 candidates, 3 to 5 evidence items each.
- For speed, use parallel Promise.all.

Acceptance:
- Given “vegetable chopper elderly parents India dishwasher safe”, returns at least 3 product-like candidates and evidence URLs/snippets.

## Phase 4 — Mem0 Memory Tools
Owner: Memory Agent
Deliverable: retrieve and save decision preferences.

Functions:
- getDecisionMemory(userId, query)
- saveDecisionMemory(userId, text, metadata)

Seed memory for demo:
- buying_for: elderly parents in India
- prefers: easy cleaning
- prefers: dishwasher safe
- avoids: food-contact plastic when possible
- values: durability over lowest price

Acceptance:
- Memory retrieval returns relevant preferences before research.
- Save preference button stores a new memory and UI confirms it.

## Phase 5 — Orchestrator
Owner: AI Orchestrator Agent
Deliverable: /api/research route returning ResearchResult.

Flow:
1. Parse user request.
2. Retrieve memories.
3. Generate evaluation criteria.
4. Call Exa discovery.
5. Call evidence/risk collection.
6. Score candidates.
7. Return structured JSON.
8. Optionally call Manus verification.

Implementation note:
- Do not implement a complex agent framework.
- Use simple functions and generateObject/generateText for scoring.
- If streaming becomes risky, use normal JSON response.

Acceptance:
- One API call returns complete ResearchResult within demo-friendly latency.

## Phase 6 — Manus Verification
Owner: Verification Agent
Deliverable: optional verifier module.

Function:
- verifyWithManus(shortlist, originalQuery, constraints)

Prompt:
“Independently verify this shortlist for a vegetable chopper for elderly parents in India. Focus on practical fit, safety, cleaning difficulty, durability, and red flags. Return whether you agree with the top recommendation and why.”

Fallback:
- If Manus API access is slow, create a manual “Verifier unavailable / queued” card or run Manus separately and paste result into mocked verification JSON.

Acceptance:
- Verification card shows: agree/disagree, confidence, reasons.

## Phase 7 — Demo Polish
Owner: Pitch/Demo Agent
Deliverable: smooth live story.

Tasks:
- Add sample loading states: Searching products, Reading reviews, Finding red flags, Checking fit, Ranking options.
- Add top-line: “From endless options to confident decisions.”
- Add intro slide or landing text with Wednesday story.
- Prepare backup mock response JSON.
- Prepare screenshots if live API fails.

Acceptance:
- Demo can run live or with fallback mock data.

## Phase 8 — Integration Test
Owner: Lead
Tasks:
- Run one full query.
- Validate JSON render.
- Test memory save.
- Test fallback if Exa/Manus fails.
- Confirm no secrets in browser.

## Priority Ladder
P0: UI renders mock result.
P1: Exa returns real evidence.
P2: Mem0 retrieves/saves preferences.
P3: AI ranks products.
P4: Manus verifies.
P5: UI polish.

## Cut Rules
If time is short:
- Cut Manus first.
- Then cut streaming.
- Then cut live product image fetching.
- Never cut red flags.
- Never cut memory save.
