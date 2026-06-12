# ShortList — Design System

## Philosophy: "Editorial Clarity"

Warm Swiss minimalism. Feels like a well-edited magazine about decision-making — not a cold SaaS tool. Borrows sai.work's confident restraint but shifts the register from "productivity machine" to "trusted advisor."

Core principles:
1. **Clarity over cleverness** — every design choice reduces cognitive load
2. **Warmth within minimalism** — slightly warmer tones to feel approachable
3. **Narrative flow** — layout tells a story: problem → solution → proof → action
4. **Earned trust** — credibility through restraint, not flashiness

---

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#FAFAF8` | Main background (warm white) |
| `--bg-secondary` | `#F5F3EF` | Alternating sections |
| `--text-primary` | `#1A1A1A` | Headlines, primary copy |
| `--text-secondary` | `#5C5C5C` | Descriptions, metadata |
| `--text-muted` | `#9A9A9A` | Captions, tertiary info |
| `--accent` | `#E85D2A` | Primary CTA, highlights, confidence indicators |
| `--accent-soft` | `#FFF0EB` | Accent backgrounds, hover states |
| `--surface-dark` | `#1C1C1C` | Demo/mockup containers |
| `--border` | `#E8E6E2` | Card borders, dividers |
| `--success` | `#22C55E` | Positive indicators, checkmarks |

Burnt orange accent (`#E85D2A`) over generic tech-blue/green — signals "confidence and clarity", not "productivity SaaS".

---

## Typography

Fonts: **DM Serif Display** (headlines) + **DM Sans** (body) + **DM Mono** (labels) — cohesive trio from one design lineage.

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400&family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
```

| Element | Font | Weight | Size | Line Height |
|---------|------|--------|------|-------------|
| H1 Hero | DM Serif Display | Regular | 72px | 1.05 |
| H2 Section | DM Serif Display | Regular | 48px | 1.1 |
| H3 Card | DM Sans | 500 | 24px | 1.3 |
| Section Label | DM Mono | Regular | 12px | 1.5 |
| Body | DM Sans | 400 | 17px | 1.6 |
| Button | DM Sans | 500 | 15px | 1 |
| Stats | DM Sans | 700 | 32px | 1.2 |

---

## Layout

- 12-column grid, max-width 1280px, 24px gutters
- Hero: **55% text left / 45% visual right** — asymmetric, left-aligned, not centered
- Section rhythm: Label → Headline → Supporting text → Content → 120–160px spacer
- Mobile: single column, 16px padding, hero stays left-aligned

---

## Components

### Buttons

| Variant | Background | Text | Radius | Padding |
|---------|-----------|------|--------|---------|
| Primary | `#1A1A1A` | `#FFFFFF` | 8px | 14px 28px |
| Secondary | transparent | `#1A1A1A` | 8px | 14px 28px |
| Accent | `#E85D2A` | `#FFFFFF` | 8px | 14px 28px |

All buttons: `transform: scale(0.97)` on `:active`, 160ms ease-out.

### Cards

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

### Section Labels

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

---

## Motion

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Button press | 160ms | `cubic-bezier(0.23, 1, 0.32, 1)` |
| Card hover | 200ms | `cubic-bezier(0.23, 1, 0.32, 1)` |
| Section reveal | 600ms | `cubic-bezier(0.23, 1, 0.32, 1)` |
| Stagger delay | 80ms per item | — |

Scroll animations: elements enter from `translateY(24px) + opacity:0`. Use Intersection Observer.

---

## Page Structure

```
1. Nav — Logo left | Links center | CTA right (sticky)
2. Hero — "From endless options to confident decisions." + product demo
3. Problem — "THE PROBLEM" — the vegetable chopper story
4. Solution — "THE SOLUTION" — Research, Evaluate, Recommend cards
5. How It Works — 3 steps with embedded UI mockups
6. Why ShortList — 4 differentiator cards
7. Demo — vegetable chopper walkthrough: constraints → research → recommendation
8. CTA — "Amazon gives options. ShortList gives confidence."
9. Footer
```

---

## Breakpoints

| Breakpoint | Width | Columns |
|------------|-------|---------|
| Mobile | < 640px | 1 |
| Tablet | 640–1024px | 2 |
| Desktop | > 1024px | 12 |

---

## Accessibility

- WCAG AA contrast (4.5:1 body, 3:1 large text)
- Semantic HTML, proper heading hierarchy
- Focus rings on all interactive elements
- `prefers-reduced-motion` respected
- Alt text on all images
