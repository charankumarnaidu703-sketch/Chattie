# Example: Full Reverse-Engineering Report

This example demonstrates the output produced by the `design-principles-extractor` skill when given a fictional modern SaaS landing page URL.

---

## Input

```
Reverse-engineer the design of https://aetheros.dev — I want to clone this site in Next.js + Tailwind.
```

---

## Output

# 🔍 Website Reverse-Engineering Report: AetherOS

**Generated:** 2026-06-15 | **Source:** `https://aetheros.dev`
**Rebuild Target:** Next.js + Tailwind CSS

---

## Tech Stack Summary

| Layer | Detected | Evidence |
|:---|:---|:---|
| **Framework** | Next.js 14 (App Router) | `<div id="__next">`, `_next/static/` asset paths |
| **CSS System** | Tailwind CSS v3.4 | Utility classes (`flex`, `bg-slate-950`, `px-6`) |
| **Fonts** | Google Fonts — Outfit (400, 500, 700) + JetBrains Mono (400) | `<link>` in `<head>` |
| **Icons** | Custom inline SVGs | No icon library classes detected |
| **Animations** | CSS transitions + `animate-pulse` (Tailwind) | No Framer Motion or GSAP detected |
| **Favicon** | SVG | `<link rel="icon" type="image/svg+xml">` |

---

## Page Blueprint: Homepage

| # | Section | Layout Type | Background | Key Elements |
|:---|:---|:---|:---|:---|
| 1 | **Navbar** | Full-width fixed, flex row, centered container | `bg-gray-950/70 backdrop-blur-md` + bottom border `border-white/5` | Logo (gradient square + text), nav links (3), CTA button |
| 2 | **Hero** | Single-column centered, `max-w-4xl` | Transparent (inherits page bg `#030712`) | Announcement badge (pulsing), gradient-text H1, subtitle paragraph, 2-button CTA group |
| 3 | **Feature Grid** | 3-column grid (`grid-cols-1 md:grid-cols-3 gap-8`), `max-w-7xl` | Transparent | 3× glass cards with icon, title, description |
| 4 | **Footer** | *(not present in sample)* | — | — |

### Vertical Spacing
- Navbar → Hero: `pt-32` (128px, accounts for fixed nav)
- Hero → Feature Grid: `mt-24` (96px)
- Feature Grid → Page bottom: `pb-20` (80px)

### Extracted Assets
- **Logo:** Inline — gradient square `from-indigo-500 to-purple-600` + text "AetherOS"
- **Favicon:** SVG (URL in `<head>`)
- **OG Image:** Not detected
- **Hero Images:** None (text-only hero)
- **Icon Library:** Custom emoji icons (⌨️ ❄️ ⚡) — should be replaced with Phosphor or Lucide in rebuild

---

## Design Tokens

### A. Color Palette

| Token Name | Class / Code | Hex | Usage |
|:---|:---|:---|:---|
| `--color-bg-primary` | `body style bg` | `#030712` | Page background |
| `--color-bg-nav` | `bg-gray-950/70` | `rgba(3,7,18,0.7)` | Navbar (translucent) |
| `--color-bg-card` | `.glass-card` | `rgba(255,255,255,0.03)` | Glass card surface |
| `--color-brand-primary` | `bg-indigo-600` | `#4f46e5` | Primary CTA button |
| `--color-brand-hover` | `hover:bg-indigo-500` | `#6366f1` | Button hover state |
| `--color-brand-gradient-start` | `from-indigo-500` | `#6366f1` | Logo, heading gradient |
| `--color-brand-gradient-end` | `to-purple-600` | `#9333ea` | Logo, heading gradient |
| `--color-brand-shadow` | `shadow-indigo-600/30` | `rgba(79,70,229,0.3)` | CTA button glow |
| `--color-badge-bg` | `bg-indigo-500/10` | `rgba(99,102,241,0.1)` | Announcement badge bg |
| `--color-badge-border` | `border-indigo-500/30` | `rgba(99,102,241,0.3)` | Announcement badge border |
| `--color-badge-text` | `text-indigo-300` | `#a5b4fc` | Badge text |
| `--color-text-primary` | `text-white` / `text-slate-100` | `#ffffff` / `#f1f5f9` | Headings, active text |
| `--color-text-secondary` | `text-slate-400` | `#94a3b8` | Body copy, descriptions |
| `--color-border-subtle` | `border-white/5` to `border-white/10` | `rgba(255,255,255,0.05–0.1)` | Nav border, card borders |
| `--color-selection-bg` | `selection:bg-indigo-500` | `#6366f1` | Text selection highlight |
| `--color-icon-purple` | `text-purple-400` | `#c084fc` | Feature icon (translucency) |
| `--color-icon-emerald` | `text-emerald-400` | `#34d399` | Feature icon (performance) |

### B. Typography

| Level | Font | Size | Weight | Leading | Tracking | Class |
|:---|:---|:---|:---|:---|:---|:---|
| Hero H1 | Outfit | 72px (4.5rem) | 700 | 1.0 | -0.025em | `text-5xl md:text-7xl font-bold tracking-tight` |
| Nav Logo | Outfit | 20px (1.25rem) | 700 | normal | -0.025em | `text-xl font-bold tracking-tight` |
| Card H3 | Outfit | 18px (1.125rem) | 700 | 1.4 | normal | `text-lg font-bold` |
| Body | Outfit | 18px (1.125rem) | 400 | 1.625 | normal | `text-lg leading-relaxed` |
| Card Body | Outfit | 14px (0.875rem) | 400 | 1.625 | normal | `text-sm leading-relaxed` |
| Nav Links | Outfit | 14px (0.875rem) | 400 | normal | normal | `text-sm` |
| Badge | Outfit | 12px (0.75rem) | 500 | normal | normal | `text-xs font-medium` |
| Buttons | Outfit | 14px / 16px | 600 | normal | normal | `text-sm font-semibold` / `text-base font-semibold` |

### C. Spacing, Borders, Shadows

| Token | Value | Source |
|:---|:---|:---|
| Page max-width | 1280px | `max-w-7xl` |
| Hero max-width | 896px | `max-w-4xl` |
| Body text max-width | 672px | `max-w-2xl` |
| Section top padding | 128px | `pt-32` |
| Section bottom padding | 80px | `pb-20` |
| Grid gap | 32px | `gap-8` |
| Card padding | 32px | `p-8` |
| Nav padding | 16px vertical, 24px horizontal | `py-4 px-6` |
| Button padding (primary) | 12px × 24px | `py-3 px-6` |
| Button padding (nav) | 8px × 16px | `py-2 px-4` |
| Card radius | 16px | `rounded-2xl` |
| Button radius | 8px | `rounded-lg` |
| Badge radius | 9999px (pill) | `rounded-full` |
| Logo square radius | (default) | `rounded` (4px) |
| Card shadow | `0 25px 50px -12px rgba(0,0,0,0.5)` | Custom in `.glass-card` |
| CTA shadow | Indigo glow | `shadow-lg shadow-indigo-600/30` |
| Backdrop blur (card) | 16px | `backdrop-filter: blur(16px)` |
| Backdrop blur (nav) | 12px | `backdrop-blur-md` |
| Card border | 1px solid `rgba(255,255,255,0.08)` | Custom in `.glass-card` |
| Nav border-bottom | 1px solid `rgba(255,255,255,0.05)` | `border-b border-white/5` |

### D. Ready-to-Use Tailwind Config

```js
// Extracted from https://aetheros.dev on 2026-06-15
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        'bg-primary': '#030712',
        'bg-nav': 'rgba(3,7,18,0.7)',
        'bg-card': 'rgba(255,255,255,0.03)',
        'brand': {
          DEFAULT: '#4f46e5',
          hover: '#6366f1',
          shadow: 'rgba(79,70,229,0.3)',
        },
        'badge': {
          bg: 'rgba(99,102,241,0.1)',
          border: 'rgba(99,102,241,0.3)',
          text: '#a5b4fc',
        },
        'text-primary': '#f1f5f9',
        'text-secondary': '#94a3b8',
        'border-subtle': 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'card': '1rem',       // 16px
        'button': '0.5rem',   // 8px
      },
      maxWidth: {
        'hero': '56rem',      // 896px (max-w-4xl)
        'body-text': '42rem', // 672px (max-w-2xl)
      },
      boxShadow: {
        'card': '0 25px 50px -12px rgba(0,0,0,0.5)',
        'cta': '0 10px 15px -3px rgba(79,70,229,0.3)',
      },
    },
  },
}
```

### CSS Custom Properties

```css
/* Extracted from https://aetheros.dev on 2026-06-15 */
:root {
  --color-bg-primary: #030712;
  --color-bg-nav: rgba(3,7,18,0.7);
  --color-bg-card: rgba(255,255,255,0.03);
  --color-brand: #4f46e5;
  --color-brand-hover: #6366f1;
  --color-brand-shadow: rgba(79,70,229,0.3);
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-border-subtle: rgba(255,255,255,0.08);
  --font-sans: 'Outfit', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius-card: 1rem;
  --radius-button: 0.5rem;
  --shadow-card: 0 25px 50px -12px rgba(0,0,0,0.5);
  --shadow-cta: 0 10px 15px -3px rgba(79,70,229,0.3);
  --blur-card: 16px;
  --blur-nav: 12px;
}
```

---

## Component Catalog

### Navbar
- **Position:** Fixed top, full-width, z-50
- **Background:** Translucent dark (`bg-gray-950/70`) + `backdrop-blur-md` + bottom border `border-white/5`
- **Container:** `max-w-7xl mx-auto`, flex row, `justify-between`, `items-center`
- **Logo:** Gradient square (16×16, `rounded`, `bg-gradient-to-tr from-indigo-500 to-purple-600`) + bold text "AetherOS" (`text-xl font-bold tracking-tight text-white`)
- **Links:** `text-sm text-slate-400`, `hover:text-white`, `transition-colors duration-200`, gap-8 between items
- **CTA Button:** `bg-white text-gray-950 hover:bg-slate-200 active:scale-95 transition-all duration-150 px-4 py-2 rounded-lg text-sm font-semibold`
- **Mobile:** Links hidden (`hidden md:flex`), presumably burger menu (not in sample)

### Hero Badge
- **Shape:** Pill (`rounded-full`), inline-flex
- **Background:** `bg-indigo-500/10`, border `border-indigo-500/30`
- **Text:** `text-xs text-indigo-300 font-medium`
- **Animation:** `animate-pulse` (infinite soft glow)
- **Content:** "✨ Version 2.0 has arrived"

### Hero Headline
- **Tag:** `<h1>`
- **Style:** `text-5xl md:text-7xl font-bold tracking-tight`
- **Special:** Gradient text via `bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400`
- **Copy:** "Weightless interfaces for heavy workflows."

### Primary CTA Button
- **Style:** `bg-indigo-600 text-white px-6 py-3 rounded-lg text-base font-semibold shadow-lg shadow-indigo-600/30`
- **Hover:** `hover:bg-indigo-500`
- **Active:** `active:scale-95`
- **Transition:** `transition-all duration-150`
- **Copy:** "Deploy Instantly"

### Secondary CTA Button
- **Style:** `border border-white/10 px-6 py-3 rounded-lg text-base font-semibold text-white` (ghost/outline)
- **Hover:** `hover:border-white/20 hover:bg-white/5`
- **Active:** `active:scale-95`
- **Transition:** `transition-all duration-150`
- **Copy:** "Read Documentation"

### Glass Feature Card
- **Background:** `rgba(255,255,255,0.03)` + `backdrop-filter: blur(16px)`
- **Border:** `1px solid rgba(255,255,255,0.08)`
- **Shadow:** `0 25px 50px -12px rgba(0,0,0,0.5)`
- **Radius:** `rounded-2xl`
- **Padding:** `p-8`
- **Layout:** Flex column
- **Hover:** `hover:-translate-y-2 transition-transform duration-300` (float up effect)
- **Icon container:** `h-10 w-10 rounded-lg bg-[color]-500/20 text-[color]-400 flex items-center justify-center mb-6`
- **Title:** `text-lg font-bold text-white mb-2`
- **Description:** `text-sm text-slate-400 leading-relaxed`

---

## Responsive Map

| Element | Mobile (default) | `md` (768px+) |
|:---|:---|:---|
| Nav links | `hidden` | `flex` row with `gap-8` |
| Hero headline | `text-5xl` | `text-7xl` |
| Hero subtitle | `text-lg` | `text-xl` |
| CTA buttons | Stacked column (`flex-col`) | Side-by-side row (`sm:flex-row`) |
| Feature grid | 1 column (`grid-cols-1`) | 3 columns (`md:grid-cols-3`) |

---

## Motion & Interaction Spec

| Element | Trigger | Effect | Duration | Easing |
|:---|:---|:---|:---|:---|
| Nav CTA button | Hover | `bg-white → bg-slate-200` | 150ms | `ease-in-out` |
| Nav CTA button | Click | `scale(0.95)` | instant | — |
| Primary CTA | Hover | `bg-indigo-600 → bg-indigo-500` | 150ms | `ease-in-out` |
| Primary CTA | Click | `scale(0.95)` | instant | — |
| Secondary CTA | Hover | Border brightens + subtle bg fill | 150ms | `ease-in-out` |
| Glass cards | Hover | `translateY(-8px)` float up | 300ms | `ease` |
| Nav links | Hover | `text-slate-400 → text-white` | 200ms | `ease` |
| Hero badge | Always | Pulsing glow | infinite | `animate-pulse` |

**Animation Library:** Pure CSS/Tailwind (no JS animation library detected).

---

## Copywriting & Tone

| Dimension | Value |
|:---|:---|
| **Tone** | Technical-premium, developer-focused, confident |
| **Person** | Impersonal / second-person implied ("Re-imagine your workspace") |
| **Formality** | Medium-high |
| **Jargon** | Medium (designer/developer terms: "glassmorphic depth", "spatial transitions") |

### CTA Patterns
| Location | Primary | Secondary | Style |
|:---|:---|:---|:---|
| Hero | "Deploy Instantly" | "Read Documentation" | Action-verb first, zero friction |
| Nav | "Start Free" | — | Benefit-focused |

---

## Clone-Ready Rebuild Checklist

1. [ ] `npx create-next-app@latest aetheros-clone --ts --tailwind --app --src-dir`
2. [ ] Add Google Fonts: Outfit (400, 500, 700) + JetBrains Mono (400)
3. [ ] Copy the `tailwind.config.js` extension above into your project
4. [ ] Set global body: `bg-[#030712] text-slate-100 font-sans selection:bg-indigo-500`
5. [ ] Build `<Navbar />` — fixed, translucent, backdrop-blur, 3 links + CTA button
6. [ ] Build `<HeroBadge />` — pill shape, pulsing, indigo-tinted
7. [ ] Build `<HeroSection />` — centered column, gradient-text H1, subtitle, 2-button CTA row
8. [ ] Build `<GlassCard />` — reusable component with glass styling, icon slot, hover float
9. [ ] Build `<FeatureGrid />` — 3-column grid of GlassCards
10. [ ] Wire up responsive: stack CTAs on mobile, hide nav links, single-column grid
11. [ ] Add hover/active transitions per the motion spec
12. [ ] Replace emoji icons with Phosphor or Lucide SVG icons
13. [ ] Final polish: spacing, shadow alignment, animation timing
