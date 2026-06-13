# Shortlist — Pitch Video Storyboard v3

**Runtime: 75 seconds. No talking head. Captions only.**

---

## Scene 1 — Wednesday (0:00–0:12)

**Visual:** WhatsApp. Mum's profile photo. Message arrives.

> *"I want a vegetable chopper.*
> *Finding helpers is so hard these days.*
> *I'm finding it hard to do things manually now.*
> *Can you find one and send it to me?"*

Caption fades in beneath:

> *Sounds like a 5-minute task.*

---

## Scene 2 — The Scroll (0:12–0:28)

**Visual:** Amazon. Search bar. One word typed slowly:

> *vegetable chopper*

Scroll. Scroll. Scroll.

Captions appear and disappear, one at a time:

> *486 results.*
> *Maybe this one?*
> *Or this?*
> *She needs something easy to clean...*
> *Is plastic safe?*
> *What about the blade?*
> *Not sure.*

---

## Scene 3 — The Spiral (0:28–0:38)

**Visual:** Rapid cuts, no audio:
- Tamil YouTube review. Skip.
- Another one. Skip.
- 5-star review. 1-star review. 5-star. 1-star.
- Reddit thread. Closed.
- Amazon tab. Still open.

One caption. Holds for 3 seconds:

> *She's waiting.*

---

## Scene 4 — Friday (0:38–0:44)

**Visual:** Phone lock screen. Date reads Friday. Cut to the same Amazon tab still open. Cart: empty.

Two captions. Each holds:

> *Friday morning.*

> *Still haven't sent her anything.*

**Audio:** Silence.

---

## Scene 5 — The Insight (0:44–0:52)

**Visual:** Black screen. Text only. Each line appears then holds:

> *The problem wasn't finding products.*

> *It was deciding.*

> *Search solved discovery.*
> *It never solved confidence.*

---

## Scene 6 — Shortlist (0:52–1:08)

**Visual:** App opens. One query typed:

> *"Find a vegetable chopper for my elderly parents in India."*

Then — no explanations, just show it working:

| Screen | Caption |
|---|---|
| Memory card: *elderly users · easy grip · dishwasher safe* | *It remembers what matters to her.* |
| Progress: researching, checking red flags | *It does the work.* |
| Product cards with red flags marked | *It flags what could go wrong.* |
| Recommendation card, one clear pick | *One answer. With reasons.* |

---

## Scene 7 — The Send (1:08–1:14)

**Visual:** WhatsApp open. A product link pasted into the chat with Mum. Send button pressed.

Caption:

> *Order placed.*
> *Two minutes.*

---

## Scene 8 — Close (1:14–1:20)

**Visual:** Black screen.

> *Amazon gives options.*
> *Shortlist gives confidence.*

Logo. Tagline. Fade.

> **Shortlist**
> *From endless options to confident decisions.*

---

## What's different in this version

- **"She's waiting"** — reframes the spiral. It's not about your frustration. It's about her waiting on the other end.
- **The send scene is the resolution** — not the recommendation card. The recommendation is the tool working. The send is the story resolving.
- **Leaner than v1, more personal than v2.** v2 had the better structure. v1 had the better emotional core. This one tries to be both.

---

## Architecture (and how it earns each scene)

This version's thesis is in Scene 5: *search solved discovery, it never solved confidence.* The architecture is built to deliver the second half — confidence — and every layer maps to something the audience feels on screen.

```
   "Find a chopper for my elderly parents in India"
                     │
                     ▼
   Next.js UI  ──▶  /api/research-stream  ──▶  live dossier cards
                     │
                     ▼
   ┌─────────────────────────────────────────────┐
   │  Research Orchestrator (lib/orchestrator.ts) │
   │  Anthropic Claude · Vercel AI SDK · Zod      │  every output = typed JSON
   └──┬──────┬──────┬───────┬────────┬──────┬─────┘
   Memory  Intent  Discovery  Evidence  Ranking  Verification
   (Mem0)         (Exa+Amazon) +Risk    +flags  (2nd Claude pass)
```

| Layer | Tech | Why it matters to the pitch |
|---|---|---|
| **Streaming UI** | Next.js, live progress cards | The "It does the work" caption (Scene 6) is literal — research steps stream to screen as they run. The audience watches confidence being built. |
| **Reasoning core** | Anthropic Claude (Sonnet for judgment, Haiku for speed) + Zod-typed outputs | Structured decisions, not chat. That's what makes the Memory / Red Flag / Recommendation cards render cleanly and feel like a *product*, not a chatbot. |
| **Memory** | Mem0 | "It remembers what matters to her" (Scene 6) — preferences load before research begins, which is what makes the answer hers, not generic. |
| **Discovery** | Exa (semantic web) + SerpApi (live Amazon), in parallel | Replaces the doom-scroll of Scenes 2–3. 486 results become a handful of evaluated candidates — the contrast the whole video is built on. |
| **Evidence + Risk** | Parallel Claude passes per candidate | "It flags what could go wrong" (Scene 6). Red flags are the trust signal — confidence comes from knowing the downsides, not hiding them. |
| **Verification** | Independent Claude critique of the pick | A built-in second opinion before "Order placed" (Scene 7) — the gap between a fast guess and a decision worth sending to Mum. |

**One line for the judges:** Amazon gives you 486 options; Shortlist runs a typed, streaming Claude research swarm — memory, dual discovery, evidence, risk, and independent verification — and gives you one answer you can defend. Confidence, not discovery.
