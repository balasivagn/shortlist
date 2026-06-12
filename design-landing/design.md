# ShortList — Design Document and Style Guide

**Author:** Manus AI
**Date:** June 12, 2026
**Reference:** [sai.work](https://www.sai.work/)

---

## Part 1: Design Review of sai.work

### 1.1 Overall Aesthetic

Sai.work follows a **Neo-Minimalist** design philosophy rooted in Swiss/International typographic tradition, updated with contemporary SaaS sensibilities. The site communicates authority and simplicity simultaneously — it feels like a product that "just works" because the design itself is effortless. The dominant impression is one of **confident restraint**: large type, generous whitespace, and a near-monochrome palette punctuated by a single accent color.

### 1.2 Layout Architecture

| Section | Layout Pattern | Notes |
|---------|---------------|-------|
| Navigation | Horizontal top bar, sticky | Logo left, links center, CTA right. Flat, no shadow. |
| Hero | Asymmetric split — text left, media right | ~50/50 split. Headline dominates left column. Video/demo occupies right. |
| Social Proof (Popular Starters) | 2x2 card grid | Dashed green borders, monospace stats, arrow icons. |
| About | Full-width text block + feature cards | Large section label, then horizontal card row with stats. |
| How It Works | Stacked vertical panels | Each step is a full-width card with embedded UI mockup. |
| Features | Alternating content blocks | Icon grids, approval UI mockups, tool logos. |
| Pricing | 4-column card layout | Tiered cards with badges ("Most Popular", "Limited Supply"). |
| FAQ | Accordion | Expandable questions, clean dividers. |
| Footer CTA | Centered text + button | Bold closing statement with single action. |
| Footer | Multi-column links + social icons | Standard SaaS footer pattern. |

The layout avoids centering everything. The hero is deliberately **left-aligned** with asymmetric weight, which creates visual tension and draws the eye to the headline first, then the demo.

### 1.3 Color System

| Role | Value | Usage |
|------|-------|-------|
| Background | `#FFFFFF` (pure white) to `#FAFAFA` (off-white) | Page canvas, alternating sections |
| Primary Text | `#1A1A1A` (near-black) | Headlines, body copy |
| Secondary Text | `#6B6B6B` (medium gray) | Descriptions, metadata |
| Accent | `#22C55E` (vivid green) | Buttons, status dots, card borders, interactive highlights |
| Surface (Dark) | `#1C1C1C` to `#2A2A2A` | Video container, dark UI mockups |
| Border | `#E5E5E5` (light gray) | Card borders, dividers |

The color strategy is **monochrome + one accent**. Green signals action, progress, and "go" — reinforcing the product's promise of getting things done. There are no gradients, no secondary accent colors, no decorative color usage.

### 1.4 Typography

| Element | Font | Weight | Size (approx.) | Style |
|---------|------|--------|-----------------|-------|
| Logo | Custom/SVG | — | — | Geometric mark |
| H1 (Hero) | Serif (likely a Didone/Modern serif) | Regular/Light | ~72–96px | Elegant, high contrast strokes |
| H2 (Section) | Same serif | Regular | ~48–56px | |
| Section Labels | Monospace/Sans | Medium | ~12px | ALL CAPS, letter-spaced, with green dot prefix |
| Body | Sans-serif (likely Inter or similar) | Regular | ~16–18px | Clean, neutral |
| Stats/Numbers | Sans-serif | Bold | ~24–32px | Used in feature cards |
| Card Titles | Sans-serif | Medium | ~16–18px | |
| Navigation | Sans-serif | Regular | ~14px | |
| Button Text | Sans-serif | Medium | ~14–16px | |

The **serif headline + sans-serif body** pairing is the signature typographic decision. It creates editorial gravitas in the hero while keeping the rest of the page functional and readable. The section labels in monospace/caps with a green dot create a consistent wayfinding system.

### 1.5 Component Patterns

**Buttons:**
- Primary: Black background, white text, rounded corners (~8px radius), padding generous
- Secondary: Outlined or ghost style
- Hover: Subtle scale or background shift

**Cards:**
- Light background, subtle border or dashed border (green for interactive cards)
- Rounded corners (~12px)
- Internal padding ~24px
- No heavy shadows — flat or very subtle elevation

**Section Labels:**
- Pattern: `● SECTION NAME` (green dot + caps + letter-spacing)
- Creates rhythm and scanability

**UI Mockups:**
- Embedded as styled `<div>` compositions (not screenshots)
- Dark background containers simulate desktop/app environments
- Rounded corners, subtle shadows for depth

### 1.6 Motion and Interaction

- **Scroll-triggered reveals:** Sections fade/slide in as they enter viewport
- **Hover states:** Buttons scale slightly (0.97–1.02), cards lift with subtle shadow
- **Video autoplay:** Background demo video in hero (muted, looping)
- **Accordion:** Smooth height transitions for FAQ
- **Overall tempo:** Restrained — motion supports comprehension, never distracts

### 1.7 Key Design Principles Extracted

1. **Confident restraint** — Say less, mean more. Every element earns its place.
2. **Asymmetric tension** — Left-heavy layouts create visual pull and reading flow.
3. **Monochrome + one accent** — Simplifies decisions, amplifies the accent's impact.
4. **Editorial typography** — Serif headlines elevate the brand above typical SaaS.
5. **Proof through UI** — Show the product working, not abstract illustrations.
6. **Scannable rhythm** — Section labels, stats, and card grids create predictable patterns.

---

## Part 2: ShortList Style Guide

### 2.1 Design Philosophy

**"Editorial Clarity"** — ShortList's design should feel like a well-edited magazine article about decision-making. It borrows sai.work's confident minimalism but shifts the emotional register from "productivity machine" to "trusted advisor." The design should evoke the relief of finally having a clear answer after hours of research paralysis.

### 2.2 Core Principles

1. **Clarity over cleverness** — Every design choice should reduce cognitive load, mirroring the product's purpose.
2. **Warmth within minimalism** — Slightly warmer tones than sai.work to feel approachable and human.
3. **Narrative flow** — The page tells a story (problem → solution → proof → action), and the layout reinforces this arc.
4. **Earned trust** — Visual credibility through restraint, not flashiness.

### 2.3 Color Palette

| Token | Value | OKLCH | Usage |
|-------|-------|-------|-------|
| `--bg-primary` | `#FAFAF8` | `oklch(0.985 0.003 90)` | Main background (warm white) |
| `--bg-secondary` | `#F5F3EF` | `oklch(0.965 0.008 80)` | Alternating sections |
| `--text-primary` | `#1A1A1A` | `oklch(0.20 0.005 0)` | Headlines, primary copy |
| `--text-secondary` | `#5C5C5C` | `oklch(0.45 0.005 0)` | Descriptions, metadata |
| `--text-muted` | `#9A9A9A` | `oklch(0.67 0.005 0)` | Captions, tertiary info |
| `--accent` | `#E85D2A` | `oklch(0.62 0.20 40)` | Primary CTA, highlights, confidence indicators |
| `--accent-soft` | `#FFF0EB` | `oklch(0.97 0.03 40)` | Accent backgrounds, hover states |
| `--surface-dark` | `#1C1C1C` | `oklch(0.20 0 0)` | Demo/mockup containers |
| `--border` | `#E8E6E2` | `oklch(0.93 0.005 80)` | Card borders, dividers |
| `--success` | `#22C55E` | `oklch(0.72 0.19 145)` | Positive indicators, checkmarks |

**Rationale:** The warm white background (`#FAFAF8`) distinguishes ShortList from the cold whites of typical SaaS. The burnt orange accent (`#E85D2A`) conveys confidence and decisiveness — it says "here's your answer" without the generic tech-blue or startup-green. It also provides excellent contrast against the warm neutrals.

### 2.4 Typography System

| Element | Font | Weight | Size | Line Height | Letter Spacing |
|---------|------|--------|------|-------------|----------------|
| H1 (Hero) | **DM Serif Display** | Regular | 72px / 5rem | 1.05 | -0.02em |
| H2 (Section) | **DM Serif Display** | Regular | 48px / 3rem | 1.1 | -0.01em |
| H3 (Card/Sub) | **DM Sans** | Medium (500) | 24px / 1.5rem | 1.3 | 0 |
| Section Label | **DM Mono** | Regular | 12px / 0.75rem | 1.5 | 0.1em |
| Body | **DM Sans** | Regular (400) | 17px / 1.0625rem | 1.6 | 0 |
| Body Small | **DM Sans** | Regular (400) | 15px / 0.9375rem | 1.5 | 0 |
| Button | **DM Sans** | Medium (500) | 15px / 0.9375rem | 1 | 0.02em |
| Nav Links | **DM Sans** | Regular (400) | 14px / 0.875rem | 1 | 0 |
| Stats/Numbers | **DM Sans** | Bold (700) | 32px / 2rem | 1.2 | -0.01em |

**Font Loading (Google Fonts):**
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400&family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
```

**Rationale:** The DM family provides a cohesive serif/sans/mono trio from a single design lineage. DM Serif Display brings editorial elegance to headlines (similar to sai.work's serif hero), DM Sans is highly readable for body text, and DM Mono provides the technical/label aesthetic for section markers.

### 2.5 Layout System

**Grid:** 12-column grid, max-width 1280px, with 24px gutters on desktop and 16px on mobile.

**Section Rhythm:**
```
[Section Label]          ← DM Mono, caps, with accent dot
[Headline]              ← DM Serif Display, large
[Supporting text]       ← DM Sans, secondary color
[Content block]         ← Cards, mockups, or feature grid
[Spacer: 120–160px]    ← Generous breathing room between sections
```

**Hero Layout:**
- Asymmetric split: 55% text (left), 45% visual (right)
- Text is left-aligned, not centered
- Visual is a product mockup or demo animation

**Feature Sections:**
- Alternating: text-left/visual-right, then text-right/visual-left
- Or: full-width card grids (2–3 columns)

**Mobile:**
- Single column, stacked
- Hero text remains left-aligned (not centered)
- Cards stack vertically with 16px gaps

### 2.6 Component Specifications

#### Buttons

| Variant | Background | Text | Border | Radius | Padding |
|---------|-----------|------|--------|--------|---------|
| Primary | `#1A1A1A` | `#FFFFFF` | none | 8px | 14px 28px |
| Primary Hover | `#333333` | `#FFFFFF` | none | 8px | 14px 28px |
| Secondary | transparent | `#1A1A1A` | 1px `#E8E6E2` | 8px | 14px 28px |
| Accent | `#E85D2A` | `#FFFFFF` | none | 8px | 14px 28px |

All buttons: `transform: scale(0.97)` on `:active`, 160ms ease-out transition.

#### Cards

```css
.card {
  background: #FFFFFF;
  border: 1px solid #E8E6E2;
  border-radius: 16px;
  padding: 32px;
  transition: box-shadow 200ms cubic-bezier(0.23, 1, 0.32, 1);
}
.card:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
}
```

#### Section Labels

```css
.section-label {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5C5C5C;
}
.section-label::before {
  content: '●';
  color: #E85D2A;
  margin-right: 8px;
}
```

### 2.7 Iconography

- **Style:** Lucide icons (already in project dependencies)
- **Size:** 20px for inline, 24px for standalone, 32px for feature highlights
- **Stroke:** 1.5px weight
- **Color:** Inherit from text color, or accent for emphasis

### 2.8 Motion Guidelines

| Interaction | Duration | Easing | Property |
|-------------|----------|--------|----------|
| Button press | 160ms | `cubic-bezier(0.23, 1, 0.32, 1)` | transform |
| Card hover | 200ms | `cubic-bezier(0.23, 1, 0.32, 1)` | box-shadow |
| Section reveal | 600ms | `cubic-bezier(0.23, 1, 0.32, 1)` | opacity, transform |
| Stagger delay | 80ms per item | — | — |
| Accordion open | 300ms | `cubic-bezier(0.77, 0, 0.175, 1)` | height |

**Scroll animations:** Elements enter from `translateY(24px)` + `opacity: 0`, transitioning to their natural position. Use Intersection Observer, not scroll-linked animations.

### 2.9 Imagery Strategy

| Area | Image Type | Notes |
|------|-----------|-------|
| Hero | Product mockup or abstract "decision clarity" visual | Generated via AI — warm tones, abstract representation of choices narrowing to one |
| Problem section | Illustrative (overwhelm/chaos) | Could be a stylized representation of too many browser tabs or product listings |
| Solution section | Product UI mockup | Show ShortList's interface in action |
| How It Works | Step-by-step UI frames | Embedded styled divs mimicking the product |
| Background textures | Subtle grain/noise | 2–3% opacity noise overlay on sections for depth |

### 2.10 Page Structure for ShortList

```
1. Navigation (sticky)
   - Logo (left) | Links (center) | CTA button (right)

2. Hero Section
   - Section: "From endless options to confident decisions."
   - Headline: Large serif, emotionally resonant
   - Subtext: One-line product description
   - CTA: "Try ShortList" button
   - Visual: Product demo or abstract visual (right side)

3. Problem Section
   - Section label: "THE PROBLEM"
   - Narrative: The vegetable chopper story (condensed)
   - Key insight: "Search solved discovery. It didn't solve decision-making."

4. Solution Section
   - Section label: "THE SOLUTION"
   - Headline: What ShortList does
   - Feature cards (3): Research, Evaluate, Recommend

5. How It Works
   - Section label: "HOW IT WORKS"
   - 3-step flow with embedded UI mockups
   - Step 1: Describe what you need
   - Step 2: ShortList researches and evaluates
   - Step 3: Get a ranked shortlist with reasoning

6. What Makes It Different
   - Section label: "WHY SHORTLIST"
   - Comparison: "Most tools optimize for products. ShortList optimizes for confidence."
   - 4 differentiators as cards

7. Demo/Use Case
   - Section label: "IN ACTION"
   - Visual walkthrough of the vegetable chopper example
   - Shows: constraints → research → red flags → recommendation

8. CTA Section
   - Bold closing statement
   - "Amazon gives options. ShortList gives confidence."
   - Primary CTA button

9. Footer
   - Links, social, copyright
```

### 2.11 Responsive Breakpoints

| Breakpoint | Width | Columns | Notes |
|------------|-------|---------|-------|
| Mobile | < 640px | 1 | Stacked, 16px padding |
| Tablet | 640–1024px | 2 | Reduced spacing, 24px padding |
| Desktop | > 1024px | 12 (max 1280px) | Full layout, 32px padding |

### 2.12 Accessibility Requirements

- All text meets WCAG AA contrast ratios (4.5:1 for body, 3:1 for large text)
- Focus rings visible on all interactive elements
- Semantic HTML structure (proper heading hierarchy, landmarks)
- Alt text for all images
- Reduced motion respected via `prefers-reduced-motion`
- Keyboard navigable throughout

---

## Part 3: Design Rationale — sai.work to ShortList

| sai.work Pattern | ShortList Adaptation | Reasoning |
|-----------------|---------------------|-----------|
| Pure white background | Warm white (`#FAFAF8`) | ShortList is about trust and human decisions — warmth signals approachability |
| Green accent | Burnt orange accent (`#E85D2A`) | Green = "go/productivity"; Orange = "confidence/clarity/warmth" — better fit for decision-making |
| Serif hero headlines | DM Serif Display headlines | Same editorial gravitas, different typeface for brand distinction |
| Monospace section labels | DM Mono section labels | Maintains the scannable rhythm and technical credibility |
| Asymmetric hero layout | Same asymmetric split | Proven pattern for SaaS heroes — text left, visual right |
| Product UI mockups | Styled UI demonstrations | Show ShortList working, not abstract illustrations |
| 2x2 "Popular Starters" grid | Use cases / example queries grid | Same pattern, adapted for ShortList's input examples |
| Dark video container | Dark mockup container | Frames the product demo with contrast |
| Minimal color usage | Same restraint | One accent color, no decorative gradients |
| Stats with bold numbers | Confidence metrics | "4 options → 1 recommendation" style stats |

---

*This document serves as the single source of truth for all design decisions on the ShortList landing page. Every component, color, and layout choice should trace back to a principle defined here.*
