---
name: generative-ai-seo
description: >
  Expert guidance for optimizing websites to appear in Google's generative AI search features,
  including AI Overviews and AI Mode. Use this skill whenever a user asks about: GEO (generative
  engine optimization), AEO (answer engine optimization), AI SEO, appearing in AI Overviews,
  optimizing for AI Mode, Google AI search visibility, ranking in generative search, AI search
  strategy, llms.txt, structured data for AI, agentic SEO, or any variation of "how do I show
  up in AI search results." Also trigger for general SEO audits when the user mentions AI
  search, for content strategy questions where generative AI visibility is a goal, and for
  technical SEO reviews of sites aiming for AI search presence. This skill is grounded in
  Google's official AI optimization documentation (last updated May 2026).
---
# Generative AI Search Optimization Skill

> Grounded in Google's official guide: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
> Last doc update: May 15, 2026

## Core Principle (Read This First)

Google's generative AI features (AI Overviews, AI Mode) are **extensions of core Search**, not
a separate system. They use the same ranking index via **Retrieval-Augmented Generation (RAG)**
and **query fan-out**. This means:

- ✅ Traditional SEO still works and is the foundation
- ✅ "AEO" and "GEO" are just SEO by another name, per Google
- ❌ Special AI-specific hacks are unnecessary or harmful

---

## How to Use This Skill

1. **Audit request** → Follow the [Content Audit Checklist](#content-audit-checklist)
2. **Technical review** → Follow the [Technical Structure Checklist](#technical-structure-checklist)
3. **Myth-busting** → Reference [What NOT to Do](#what-not-to-do-myth-busting)
4. **Agentic/advanced** → See [Agentic Experiences](#agentic-experiences)
5. **Full strategy** → See `references/full-strategy-playbook.md`

---

## Content Audit Checklist

When reviewing or creating content for generative AI search visibility, evaluate against these criteria:

### ✅ Unique Point of View

- Does the content reflect **first-hand experience**, expert knowledge, or original research?
- Example of commodity (avoid): "7 Tips for First-Time Homebuyers"
- Example of non-commodity (aim for): "Why We Waived the Inspection & Saved Money: A Look Inside the Sewer Line"
- Ask: *Could a generative AI model have written this from public data alone?* If yes → rewrite.

### ✅ Helpful, Reliable, People-First

- Is the content written **for humans**, not for search engines or AI scrapers?
- Check: Would a visitor feel *satisfied* after reading this page?
- Does it go **beyond common knowledge** available everywhere else?

### ✅ Content Organization

- Are paragraphs and sections **logically structured**?
- Are headings used to create **scannable navigation**?
- Is the writing **easy to follow** for a non-expert reader?

### ✅ Rich Media

- Where appropriate, are there **high-quality images and/or videos** supporting the text?
- Are images following [Google Image SEO best practices](https://developers.google.com/search/docs/appearance/google-images)?
- Are videos following [Video SEO documentation](https://developers.google.com/search/docs/appearance/video)?

### ✅ AI-Assisted Content Guardrails

- If AI tools were used in writing, does the content still meet **Search Essentials** and **spam policies**?
- Reference: [Google&#39;s guidance on AI-generated content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content)

---

## Technical Structure Checklist

### ✅ Indexability (Non-Negotiable)

- Page must be **indexed** and **eligible for snippets** in Google Search
- Verify with [Search Console](https://search.google.com/search-console) → URL Inspection Tool
- No `noindex` tags blocking AI-eligible pages
- No `nosnippet` meta tags unless intentional

### ✅ Crawlability

- Content is **publicly accessible** (not behind login walls for key pages)
- `robots.txt` is not blocking important content
- For large/frequently updated sites: review **crawl budget optimization**
- Reference: [Crawl budget guide](https://developers.google.com/crawling/docs/crawl-budget)

### ✅ JavaScript SEO

- If using JS frameworks (React, Vue, Next.js, etc.): verify content is **server-side rendered or statically generated** where possible
- JavaScript content that isn't blocked *can* be indexed, but adds complexity
- Reference: [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)

### ✅ HTML Semantics

- Use **semantic HTML** (`<article>`, `<section>`, `<nav>`, `<main>`, `<h1>`–`<h6>`) — not for AI parsing but for **accessibility and agent compatibility**
- Perfect HTML validity is NOT required; human readability is the goal

### ✅ Page Experience

- Site works well across **all devices** (mobile-first)
- **Core Web Vitals** are healthy (check via [PageSpeed Insights](https://pagespeed.web.dev))
- Main content is **easy to distinguish** from ads/sidebars/navigation

### ✅ Duplicate Content

- Canonical tags (`rel="canonical"`) are correctly set
- Redirect chains are clean
- Duplicate pages are consolidated or de-indexed

### ✅ Local/Ecommerce (if applicable)

- **Google Business Profile** is claimed and complete (for local businesses)
- **Google Merchant Center** feed is up-to-date (for ecommerce)
- Consider **Business Agent** for conversational brand experiences in Search

---

## What NOT to Do (Myth-Busting)

Google explicitly debunks these common "GEO/AEO" tactics. Flag these as **wasted effort**:

| Tactic                                                    | Reality                                                |
| --------------------------------------------------------- | ------------------------------------------------------ |
| Creating `llms.txt` files                               | Google does NOT treat these specially — skip it       |
| "Chunking" content for AI parsing                         | Not required; Google understands multi-topic pages     |
| Rewriting content with specific AI phrasing               | AI understands synonyms; exact phrasing irrelevant     |
| Buying/seeking inauthentic brand mentions                 | Spam systems detect and discount these                 |
| Adding special AI-specific schema.org markup              | No such thing exists; standard structured data is fine |
| Creating separate pages for every fan-out query variation | Violates Google's scaled content abuse spam policy     |

**Key ruling:** Structured data is **not required** for generative AI search. Keep using it for rich results eligibility, but don't add it solely for AI visibility.

---

## Agentic Experiences

AI agents (browser agents, booking agents, etc.) are an **emerging** area. Only prioritize this if:

- Your business involves transactions (bookings, purchases, comparisons)
- You have capacity after foundational SEO is solid

### How Agents Access Your Site

Browser agents analyze:

1. **Visual renderings** (screenshots of the page)
2. **DOM structure** (HTML hierarchy)
3. **Accessibility tree** (ARIA roles, labels)

### Agent-Readiness Actions

- Ensure **semantic HTML** and proper **ARIA labels**
- Make key actions (book, buy, compare) accessible without JavaScript interactions where possible
- Review: [agent-friendly website best practices](https://web.dev/articles/ai-agent-site-ux)
- Monitor: **Universal Commerce Protocol (UCP)** at ucp.dev — emerging standard for Search agents

---

## Prioritized Action Framework

When advising a user, recommend actions in this order:

**Tier 1 — Foundation (Always Do First)**

1. Verify indexability via Search Console
2. Fix any crawl or snippet-blocking issues
3. Audit content for commodity vs. non-commodity quality

**Tier 2 — Quality Amplification**
4. Rewrite top pages to include unique POV / first-hand expertise
5. Add supporting images/video where missing
6. Improve content structure (headings, paragraphs)

**Tier 3 — Technical Polish**
7. Address Core Web Vitals issues
8. Fix duplicate content / canonicalization
9. JS SEO audit if using a JS framework

**Tier 4 — Business-Specific**
10. Merchant Center / Business Profile optimization (ecommerce/local)
11. Structured data for rich results (not specifically for AI)

**Tier 5 — Future-Proofing (Optional)**
12. Accessibility and semantic HTML for agent compatibility
13. Monitor UCP and agentic experience protocols

---

## Monitoring & Iteration

- **Search Console** → Performance report → filter by "Search type: AI Overviews" when available
- **Search Console** → Coverage report → identify indexing issues
- **Google Trends** → Identify demand shifts in your topic area
- Re-audit content quarterly using the Content Audit Checklist above

---

## Quick Reference: Key Google Resources

| Resource                         | URL                                                                                          |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| AI Optimization Guide (official) | https://developers.google.com/search/docs/fundamentals/ai-optimization-guide                 |
| Helpful Content Guidelines       | https://developers.google.com/search/docs/fundamentals/creating-helpful-content              |
| Search Essentials                | https://developers.google.com/search/docs/essentials                                         |
| Spam Policies                    | https://developers.google.com/search/docs/essentials/spam-policies                           |
| JS SEO Basics                    | https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics |
| Agent-Friendly Sites             | https://web.dev/articles/ai-agent-site-ux                                                    |
| Image SEO                        | https://developers.google.com/search/docs/appearance/google-images                           |
| Search Console                   | https://search.google.com/search-console                                                     |
| PageSpeed Insights               | https://pagespeed.web.dev                                                                    |

---

## Extended Reference

For deeper strategy, implementation templates, and content examples, read:
`references/full-strategy-playbook.md`
