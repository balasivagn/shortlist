# Shortlist — PRD v1.0

Tagline: From endless options to confident decisions.

## Product Scope
Shortlist is a focused AI buying advisor demo for one real decision: helping the user choose a vegetable chopper for their elderly parents in India. The product does not try to become a universal research platform in the demo. It solves one concrete problem well: too many product options, too little confidence.

## Origin Story
On Wednesday, the user’s mother in India asked for help finding a vegetable chopper. The user opened Amazon, scrolled through many options, watched Tamil YouTube review videos, checked reviews, compared features, revisited the search again on Friday morning, and still had not placed the order. The issue was not product discovery. It was decision confidence.

## Problem Statement
Marketplaces show hundreds of options. YouTube shows opinions. Reviews are noisy. Sponsored rankings and influencer content reduce trust. The buyer has personal constraints: elderly users, dishwasher, easy cleaning, food safety, durability, not just cheap hype. Existing search tools surface options; they do not help the buyer reach a confident decision.

## Target User for Demo
A person buying a vegetable chopper for elderly parents in India.

## Demo Query
“Find a vegetable chopper for my elderly parents in India.”

## Job To Be Done
When I need to buy a product for someone I care about, I want an AI research assistant to compare options against my real constraints, surface red flags, and give me a clear shortlist so I can buy with confidence.

## MVP Outcome
The app produces a research-backed shortlist of 3 vegetable choppers with reasoning, red flags, evidence, confidence, and memory-backed preferences.

## Must-Have Capabilities
1. Accept a natural language product request.
2. Load remembered preferences from Mem0.
3. Use Exa to discover product candidates and supporting evidence.
4. Evaluate candidates against explicit and remembered constraints.
5. Surface red flags, not just positives.
6. Rank the top 3 options.
7. Save at least one new decision preference to Mem0.
8. Optionally use Manus as an independent verification pass.

## Non-Goals
No login. No payment. No cart checkout. No browser extension. No multi-user flows. No generic “buy anything” positioning. No deep product catalog. No perfect review scraping. No legal/medical/safety guarantees.

## Success Criteria for Demo
The audience should understand in 30 seconds that Shortlist turns overwhelming product research into a confident purchase decision. The demo must show one complete workflow: query, research, red flags, shortlist, memory save, and optionally verification.

## Final Demo Output Shape
- Remembered preferences
- Evaluation criteria
- Research progress
- Top 3 shortlist
- Red flags per product
- Winner explanation
- Confidence score
- Sources/evidence snippets
- Memory saved confirmation

## Recommended Stack
Frontend: Next.js, Vercel AI SDK useChat/useCompletion or simple fetch, shadcn/ui cards.
Backend: Next.js API routes.
AI Layer: Vercel AI SDK with Vercel AI Gateway.
Model: Use a strong general reasoning model available through AI Gateway; keep model ID configurable via env var.
Research: Exa Search + Contents.
Memory: Mem0 REST API.
Verification: Manus API as optional independent verifier or manual fallback if API setup slows the build.
Persistence: None for MVP, except Mem0 memory.

## Architecture
User -> Next.js UI -> /api/research -> AI SDK Orchestrator -> Exa + Mem0 + optional Manus -> Structured JSON -> UI cards.

## Research Swarm Modules
Discovery: find candidate vegetable choppers.
Evidence: collect positive signals and useful reviews/discussions.
Risk: find complaints, failure modes, durability issues, cleaning issues, fake-review concerns.
Constraint Evaluation: score each option against constraints like dishwasher safe, easy cleaning, elderly-friendly, low food-contact plastic, available in India.
User Fit: retrieve Mem0 preferences and apply them.
Ranking: produce weighted shortlist and confidence.
Memory: save learned preferences.
Verification: ask Manus for independent second opinion on the selected product or shortlist.

## UX Layout
Left: chat input and conversation.
Right: research dossier cards.
Cards: Parent/Product Context, Research Progress, Criteria, Shortlist, Red Flags, Recommendation, Memory Saved, Verification.

## Demo Script
1. Open with the Wednesday story.
2. Type: “Find a vegetable chopper for my elderly parents in India.”
3. Show research stages running.
4. Show remembered preferences or default assumptions.
5. Show shortlist and red flags.
6. Ask: “Why this one?”
7. Save preference: “Remember: avoid food-contact plastic and prioritize easy cleaning over low price.”
8. Show Mem0 confirmation.
9. Optional: run Manus verifier and show consensus.

## Pitch Line
Amazon gives options. Shortlist gives confidence.
