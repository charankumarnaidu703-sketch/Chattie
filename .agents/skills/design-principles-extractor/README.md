# Website Design Reverse-Engineer

**Reverse-engineer any website's full design system, layout, components, and motion — from a single URL or a batch of competitor sites — into a clone-ready rebuild specification.**

---

## What This Skill Does

This skill turns the AI into a **Principal Design Systems Reverse-Engineer**. Give it one or more website URLs and it will:

1. **Fingerprint the tech stack** — Detect the framework (Next.js, Astro, WordPress, Webflow), CSS system (Tailwind, Bootstrap, vanilla), animation library (Framer Motion, GSAP), icon set, and fonts.
2. **Blueprint every section** — Map the full page structure from top to bottom: Hero → Features → Social Proof → Pricing → CTA → Footer — with layout type, background treatment, and spacing.
3. **Extract all design tokens** — Colors, typography scale, spacing, shadows, borders, border-radius — output as human-readable tables AND ready-to-paste `tailwind.config.js` + CSS custom properties.
4. **Catalog every component** — Buttons, cards, navbars, heroes, footers, forms, testimonials, pricing tables, modals, badges — with exact classes, hover states, and responsive behavior.
5. **Map responsive breakpoints** — What changes at mobile, tablet, desktop: column shifts, font scaling, hidden elements, layout flips.
6. **Spec all motion & interactions** — Hover effects, scroll animations, entrance transitions, parallax — with exact durations, easing curves, and library used.
7. **Extract copy & tone** — Headline patterns, CTA copy, brand voice profile.
8. **Produce a clone-ready rebuild checklist** — A prioritized step-by-step list for recreating the site.

---

## Three Operating Modes

| Mode | Input | Output |
|:---|:---|:---|
| **Single Site Deep-Dive** | 1 URL (+ optional subpages) | Full reverse-engineering report |
| **Single Site Multi-Page** | 1 domain, multiple page URLs | Unified design system with page-specific variations |
| **Batch Multi-Site** | 2+ URLs from different sites | Individual reports + Cross-Site Comparison Matrix |

---

## Trigger Phrases

```
reverse-engineer the design of https://example.com
extract the design system from https://site1.com and https://site2.com
clone this website's design: https://example.com
audit and extract design tokens from https://example.com
compare the design of these 3 sites: [url1] [url2] [url3]
scrape design principles from https://example.com/pricing and https://example.com/about
```

---

## Installation

### Global (Recommended)
```bash
ln -sf "/Users/charankumar/skills/design-principles-extractor" ~/.claude/skills/design-principles-extractor
```

### Workspace-Only
No installation needed if working inside the `/Users/charankumar/skills/` directory.

---

## Consolidated Sub-Skills

This skill acts as a package, bundling the following design and scraping skills inside the [related-skills/](file:///Users/charankumar/skills/design-principles-extractor/related-skills/) folder:
- **`design-taste-frontend`**: High-end styling/motion guidelines & Bento layouts.
- **`redesign-existing-projects`**: Detailed audit and upgrade checklists (typography, layout, states).
- **`high-end-visual-design`**: Awwwards-tier visual guidelines & clean aesthetics.
- **`ux-audit`**: Nielsen heuristics & usability/mobile ergonomics.
- **`firecrawl-scraper`**: Deep web-scraping & asset-crawling directives.

---

## Output Includes

| Section | What You Get |
|:---|:---|
| Tech Stack Summary | Framework, CSS system, fonts, icons, animation lib |
| Page Blueprint | Ordered section list with layout types and assets |
| Design Tokens | Color palette, typography scale, spacing — as tables + `tailwind.config.js` + CSS variables |
| Component Catalog | Every UI component with classes, states, responsive behavior |
| Responsive Map | Breakpoint table showing what changes at each screen size |
| Motion Spec | Transitions, hover effects, scroll animations with timing |
| Copy & Tone | Brand voice, headline patterns, CTA copy |
| Rebuild Checklist | Step-by-step order to recreate the site |
| Cross-Site Matrix | (Batch mode) Side-by-side comparison of all sites' design decisions |

---

## Version

**v2.0.0** — Full rewrite. Added batch multi-site support, tech stack fingerprinting, page blueprints, asset extraction, responsive mapping, config output generation, and clone-ready rebuild spec.
