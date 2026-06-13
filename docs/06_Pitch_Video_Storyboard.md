# Shortlist — Pitch Video Storyboard

**Runtime: ~90 seconds**

---

## Scene 1 — The Call (0:00–0:18)

**Visual:** Black screen. Phone call UI fades in. Caller: *"Mum 🇮🇳"*

Subtitle text appears line by line, as if transcribed live:

> *"I want a vegetable chopper."*
> *"Finding helpers and cooks is so difficult these days."*
> *"I'm finding it hard to do things manually now."*
> *"Can you find one and send it to me?"*

Cut to black. One line holds on screen for 3 seconds:

> *She's 4,000 miles away.*

**Audio:** Faint ambient phone static. Then silence.

---

## Scene 2 — The Spiral (0:18–0:32)

**Visual:** Fast-cut screen recordings. Raw, unpolished — this is real:
- Amazon search results. Hundreds of options. Sponsored badges.
- A Tamil YouTube review playing
- Star ratings. Conflicting reviews. "Great quality" vs "broke in 2 weeks"
- Browser tabs multiplying
- The same Amazon page. Again. Two days later.

**Voiceover:** *"I opened Amazon. Watched YouTube. Read reviews. Opened it again the next morning."*

Beat.

> *"I still hadn't sent her anything."*

---

## Scene 3 — The Reframe (0:32–0:40)

**Visual:** Clean white screen. Two lines, large, centred. They appear one at a time:

> *Search finds products.*
> *It doesn't make decisions.*

Hold for 3 seconds. Then the Shortlist logo fades in beneath.

**Audio:** Music begins — calm, intentional.

---

## Scene 4 — The Demo (0:40–1:15)

**Visual:** Full-screen app recording. Unhurried. Let each beat land.

| Time | Screen | Spoken |
|---|---|---|
| 0:40 | Query typed: *"Find a vegetable chopper for my elderly parents in India"* | *"I typed what she told me."* |
| 0:47 | **Memory card** — her preferences load: elderly users, easy grip, dishwasher safe, food-safe plastic | *"It remembered what matters to her."* |
| 0:54 | **Progress card** — Researching… Checking evidence… Evaluating red flags… | *"It did the research."* |
| 1:01 | **Criteria card** — constraints listed clearly | *"It checked against her actual constraints — not what's popular."* |
| 1:06 | **Product cards** — 3 options, red flags visible on the ones that didn't make it | *"It flagged what could go wrong."* |
| 1:11 | **Recommendation card** — one clear pick, with reasoning | *"And it gave me one answer I could trust."* |
| 1:14 | **Memory save card** — "Preference saved for next time" | *(no voiceover — let it land visually)* |

---

## Scene 5 — The Send (1:15–1:22)

**Visual:** Back to black. A WhatsApp message compose screen. A product link being pasted. The send button pressed.

One line appears:

> *Order placed. Two minutes.*

**Audio:** Message sent sound. Silence.

---

## Scene 6 — The Close (1:22–1:30)

**Visual:** Logo centred on screen. Tagline beneath.

> **Shortlist**
> *From endless options to confident decisions.*

Then, quiet and small beneath that — almost a footnote:

> *Built for everyone who needs help and can't always ask.*

**Audio:** Music fades out cleanly.

---

## Production Notes

- **Scene 1 is everything** — do not rush it. The call is why the whole product exists.
- **Scene 4: record a clean run** with pre-cached results so there's no spinner awkwardness. The memory card loading her preferences is your single most important product moment — slow down there.
- **No talking head** — this story is stronger as pure narrative + screen. Keep it that way.
- **Subtitles throughout** — judges watch on mute.
- **The WhatsApp send in Scene 5** is the payoff moment most demo videos skip. Don't skip it. That's the proof it worked.

---

## Architecture (and how it serves the story)

The whole pitch turns on one promise: *search finds products, Shortlist makes decisions.* The architecture is what makes that promise real. A single research orchestrator runs a swarm of focused passes, each one mapping to a beat the audience sees on screen.

```
              ┌──────────────────────────┐
   User query │  Next.js UI (chat + dossier cards)
      ───────▶│  /api/research-stream  (live progress)
              └────────────┬─────────────┘
                           ▼
              ┌──────────────────────────┐
              │   Research Orchestrator   │  (lib/orchestrator.ts)
              │   Anthropic Claude via    │
              │   Vercel AI SDK + Zod     │  ← every step returns typed JSON
              └─┬───┬───┬───┬───┬───┬───┬─┘
        Memory │   │   │   │   │   │   │ Verification
         Mem0  │   │   │   │   │   │   │ (independent Claude pass)
                   │   │   │   │   │
       Intent ─────┘   │   │   │   └───── Recommendation
       Discovery ──────┘   │   └───────── Ranking + red flags
       (Exa + SerpApi)     └───────────── Evidence + Risk passes
```

| Layer | What we use | How it helps the product |
|---|---|---|
| **Frontend** | Next.js + streaming dossier cards | Every research step streams to screen as it happens — the audience *watches the thinking*, which is the whole "it did the work" beat (Scene 4, 0:54). |
| **Reasoning** | Anthropic Claude (Sonnet for judgment, Haiku for fast query-building) via Vercel AI SDK, all outputs schema-validated with Zod | Decisions are structured, not prose. That's why the UI can render clean Criteria / Red Flag / Recommendation cards instead of a wall of text. |
| **Memory** | Mem0 | Loads "what matters to her" before researching — the emotional core of the demo (Scene 4, 0:47) and the reason the result feels personal, not generic. |
| **Discovery** | Exa (neural/semantic web search) + SerpApi (live Amazon results), run in parallel | Two complementary lenses — real marketplace listings *and* the wider web of reviews — so the shortlist reflects what's actually buyable, not just what ranks. |
| **Evidence + Risk** | Parallel Claude passes over each candidate | Surfaces red flags, not just positives (Scene 4, 1:06). This is the trust-builder — it's why one answer becomes a *confident* answer. |
| **Verification** | A second, independent Claude pass that critiques the recommendation | Models a "second opinion" before you commit — the difference between a guess and a decision you can stand behind. |

**The one-line version for judges:** a typed, streaming research swarm — Claude orchestrating Mem0 memory, Exa + Amazon discovery, and parallel evidence/risk/verification passes — turns "486 results" into one decision you can defend. Every card in the demo is a real module output, not a mockup.
