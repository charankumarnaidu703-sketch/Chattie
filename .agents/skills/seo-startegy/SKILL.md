---
name: seo-strategy
description: >
  Master SEO Strategy Orchestrator — the first skill to use when a user wants to plan, build, 
  launch, or grow SEO for any website. Triggers whenever a user says: "help me with SEO", 
  "create an SEO strategy", "how do I rank my website", "build my SEO plan", "I want to grow 
  organic traffic", "start SEO for my site", "do SEO for my business", "SEO roadmap", 
  "SEO for my [niche/business]", or any variation of needing end-to-end SEO guidance.
  This skill acts as the central brain: it understands the website/business, then 
  orchestrates all other specialist SEO skills in the correct order — from keyword research 
  through content creation, on-page, link building, technical, and AI search visibility.
  ALWAYS use this skill first before any other SEO skill when the user hasn't started yet 
  or needs a full-picture SEO strategy.
---

# 🧠 SEO Strategy — Master Orchestrator Skill

> **Philosophy:** SEO = Search Everywhere Optimization. Get visible on Google, Bing, AND every AI assistant (ChatGPT, Perplexity, Gemini, Claude). Traditional SEO is the infrastructure AI search is built on. Win one, win both.

---

## HOW TO USE THIS SKILL

This skill runs in **three phases**:

1. **INTAKE + ANALYSIS** — Ask the user questions AND scan the codebase/files simultaneously (parallel tracks)
2. **CROSS-CHECK** — Reconcile user answers against what the code actually reveals; surface hidden issues
3. **STRATEGY BUILD** — Output a phased roadmap tailored to real findings, invoking the right specialist skill at each step

Never skip Phase 1. A strategy built on assumptions — instead of actual code evidence — will miss the most critical issues.

---

## PHASE 1 — PARALLEL INTAKE + CODEBASE ANALYSIS

Phase 1 runs **two tracks simultaneously** — do NOT wait for one to finish before starting the other. Both must complete before Phase 2 begins.

```
TRACK A (Ask User)          ║   TRACK B (Analyze Codebase/Files)
════════════════════════════╬══════════════════════════════════════════
Run in parallel →           ║   Run in parallel →
```

---

### TRACK A — USER INTAKE QUESTIONS

Ask the user all of these. Collect answers while Track B runs.

```
INTAKE QUESTIONS:

1. What is your website about? (niche, product, service)
2. What type of business is it?
   [ ] SaaS / Software    [ ] E-commerce    [ ] Local Business
   [ ] Blog / Media       [ ] Agency        [ ] B2B Service
   [ ] Other: ___
3. Who is your target customer/audience?
4. What is the #1 business goal for SEO?
   (more sales / more leads / more subscribers / brand awareness)
5. What is your website's current state?
   [ ] Brand new (0 content)
   [ ] Exists but no SEO done
   [ ] Has some SEO, needs improvement
6. Do you have any existing content or blog posts?
7. Who are your top 2-3 competitors? (URLs if possible)
8. Is your business location-dependent? (local SEO needed?)
9. Is your website image-heavy? (photography, art, products, portfolio?)
10. What platform is your site on? (WordPress / Shopify / Webflow / custom)
```

---

### TRACK B — CODEBASE & FILE ANALYSIS (Run Simultaneously)

While the user answers Track A, independently analyze all available files, code, and website assets. Do not ask for permission — just scan what's there.

**Step B1 — Scan all uploaded/available files:**
```
Look for and read:
- HTML / template files → extract page titles, H1s, meta tags, URL structures
- CSS / JS files → detect platform clues, site architecture patterns
- sitemap.xml → list all pages, identify content gaps and orphan pages
- robots.txt → spot blocked pages, crawl restrictions
- package.json / config files → identify framework (Next.js, Nuxt, etc.)
- Content files (MD, MDX, JSON, CSV) → extract existing topics, categories, slugs
- Image files → check naming conventions, alt text presence
- Schema/structured data blocks → validate existing markup
```

**Step B2 — Auto-detect from codebase:**

| Signal to Detect | What It Reveals |
|-----------------|-----------------|
| `<title>` tags across pages | Current title tag quality + keyword usage |
| `<meta name="description">` | Meta description existence + optimization level |
| `<h1>`, `<h2>`, `<h3>` tags | Header structure + content hierarchy |
| URL patterns (`/blog/`, `/product/`, `/category/`) | Site architecture, content organization |
| Internal `<a href>` patterns | Internal linking density + orphan pages |
| Image `src` + `alt` attributes | Image SEO health, missing alt text |
| `robots.txt` + `noindex` tags | Crawl/index issues hiding content from Google |
| `sitemap.xml` entries | Total page count, last modified dates |
| Schema.org JSON-LD blocks | Existing structured data types and gaps |
| Page load indicators (asset sizes) | Site speed risk signals |
| `hreflang` tags | Multi-language SEO setup (or absence) |

**Step B3 — Generate a Codebase SEO Snapshot:**

After scanning, produce this internal summary (use it to cross-check Track A answers):

```
CODEBASE SEO SNAPSHOT:
━━━━━━━━━━━━━━━━━━━━━
Platform detected:        [WordPress / Next.js / Shopify / etc. / Unknown]
Total pages found:        [number or "unknown"]
Title tags present:       [X of Y pages / missing on Z pages]
Meta descriptions:        [present / missing / partial]
H1 structure:             [correct / multiple H1s / missing]
URL structure:            [clean / messy / mixed]
Internal linking:         [strong / weak / none detected]
Image alt text:           [present / partial / missing]
Schema markup:            [types found / none]
Sitemap:                  [found / missing]
Robots.txt:               [found / issues detected / missing]
Existing content topics:  [list detected topics/categories]
Obvious SEO gaps:         [list critical findings]
━━━━━━━━━━━━━━━━━━━━━
```

---

### TRACK A + B CROSS-CHECK (Before Phase 2)

Once both tracks complete, reconcile findings:

- **Validate user answers against codebase reality.** Example: User says "we have no SEO done" but codebase shows existing schema markup → flag this discrepancy and investigate.
- **Upgrade understanding with hard evidence.** What the code actually shows overrides assumptions from answers alone.
- **Surface hidden issues immediately.** If Track B finds critical blockers (noindex on all pages, broken sitemap, duplicate H1s site-wide), flag these as PRIORITY ZERO before any strategy work begins.

**Cross-Check Questions to Resolve:**
```
✅ Does the user's stated platform match what the code shows?
✅ Does the user's content volume claim match pages found in sitemap/files?
✅ Are there indexation blockers (robots, noindex) the user may not know about?
✅ Does current URL structure support or fight the intended keyword strategy?
✅ Are there existing pages worth optimizing vs. creating new ones?
✅ What is the realistic starting point vs. what the user thinks it is?
```

Once cross-check is complete, summarize findings to the user, then proceed to Phase 2.

---

## PHASE 2 — THE 8-STEP SEO STRATEGY ROADMAP

Output this full roadmap adapted to the user's answers. For each step, name the specialist skill to invoke with `/skill-name`.

---

### STEP 1 — FOUNDATION & AUDIT
**Goal:** Know where you stand before building anything.

**What to do:**
- If site exists → Run a full SEO health check
- Set up Google Search Console
- Identify crawl/index issues, missing tags, broken links
- Establish a technical baseline

**Skills to invoke:**
- `/seo-audit` → Full site audit, find all issues
- `/seo-technical` → Fix crawlability, indexation, site speed
- `/seo-sitemap` → Generate/fix XML sitemap for Google

**Deliverable:** A clean, crawlable, indexed website ready for content.

---

### STEP 2 — KEYWORD RESEARCH & INTENT MAPPING
**Goal:** Find the exact phrases your customers type — and match what they mean.

**The Keyword Sweet Spot Framework (evaluate every keyword on these 4):**
| Attribute | Question |
|-----------|----------|
| Demand | Are people searching for it? |
| Fit | Is it relevant to your funnel? |
| Intent | Informational / Commercial / Transactional / Navigational? |
| Difficulty | Can your site realistically rank for it? |

**Keyword priority order:**
1. Transactional keywords → Money pages (buy, sign up, hire)
2. Commercial keywords → Comparison & best-of pages
3. Informational keywords → Educational blog cluster content

**Skills to invoke:**
- `/seo-aeo-keyword-research` → Discover, validate, and cluster keywords
- `/seo-keyword-strategist` → Build keyword strategy aligned to business goals
- `/seo-competitor-pages` → Spy on competitor keywords and content gaps
- `/seo-fundamentals` → Apply if user is new and needs keyword basics explained

**Deliverable:** A prioritized keyword list grouped into topic clusters.

---

### STEP 3 — MONEY PAGES (BOTTOM OF FUNNEL FIRST)
**Goal:** Build or optimize your highest-converting pages. These pages = revenue.

**Money pages include:**
- Product / Service pages
- Pricing pages
- Feature pages
- "Hire us" / "Get a quote" pages

**Rule:** Always optimize money pages BEFORE writing blog content. Traffic means nothing without conversion.

**Skills to invoke:**
- `/seo-aeo-landing-page-writer` → Write high-converting, SEO-optimized landing pages
- `/seo-page` → On-page SEO optimization for money pages
- `/seo-meta-optimizer` → Craft perfect title tags + meta descriptions
- `/seo-aeo-meta-descript...enerator` → Generate AEO-optimized meta descriptions

**Deliverable:** Fully optimized money pages ready to rank and convert.

---

### STEP 4 — CONTENT CLUSTER STRATEGY
**Goal:** Build topical authority by covering a full subject area, not random posts.

**The Cluster Model:**
```
MONEY PAGE (pillar)
    ├── Commercial content (best X, X vs Y, top X for [audience])
    ├── Informational content (how to X, what is X, X guide)
    └── Supporting content (FAQs, tutorials, case studies)
```

**Rule:** Complete ONE full cluster before starting another. Depth beats breadth for Google trust.

**Skills to invoke:**
- `/seo-aeo-content-cluster` → Design full topic cluster architecture
- `/seo-content-planner` → Plan a content calendar for the cluster
- `/seo-plan` → Build the full editorial SEO plan

**Deliverable:** A mapped content cluster with titles, keywords, intent, and priority order.

---

### STEP 5 — CONTENT CREATION
**Goal:** Write content that beats the top 5 Google results AND beats AI summaries.

**The 4-Phase Content Creation Process:**
1. **Research** — Analyze top 5 results, find content gaps
2. **Structure** — Build an outline that covers everything + adds unique value
3. **Write** — Combine expertise with SEO; AI helps structure, humans add insight
4. **Optimize** — Hit content score targets; add original data, stories, expert quotes

**Rule:** 96% of web pages get zero Google traffic (Ahrefs). Average content fails. Only publish content with a unique angle, original insight, or deeper coverage than anything that exists.

**Skills to invoke:**
- `/seo-aeo-blog-writer` → Write SEO + AEO optimized blog posts
- `/seo-content-writer` → Write long-form SEO content pieces
- `/seo-content` → General SEO content creation workflow
- `/seo-aeo-content-quality-auditor` → Score and improve content quality before publishing
- `/seo-content-auditor` → Audit existing content for gaps and improvements
- `/seo-content-refresher` → Update old/underperforming content to regain rankings

**If the website is image-heavy (photography, art, e-commerce, portfolio):**
- `/seo-image-gen` → Generate SEO-optimized images with proper naming and alt text
- `/seo-images` → Full image SEO optimization (alt text, WebP, compression, filenames)

**Deliverable:** Published content that is comprehensive, unique, and optimized.

---

### STEP 6 — ON-PAGE SEO OPTIMIZATION
**Goal:** Make sure Google perfectly understands every page.

**On-Page Checklist for every page:**
- ✅ Title tag: target keyword + under 60 chars + compelling for clicks
- ✅ H1: matches title tag intent, one per page
- ✅ H2/H3: section headers with natural keyword usage
- ✅ URL: short, descriptive, keyword-rich (e.g. /topic/keyword-slug)
- ✅ Meta description: 150-160 chars, keyword + action word
- ✅ Internal links: connect to money pages and cluster siblings
- ✅ Images: descriptive filenames, alt text, WebP format, compressed

**Skills to invoke:**
- `/seo-page` → Full on-page SEO implementation
- `/seo-meta-optimizer` → Title + meta description optimization
- `/seo-aeo-internal-linking` → Build internal linking structure across the site
- `/seo-structure-...` → Fix site architecture and URL structure
- `/seo-snippet-...` → Optimize for featured snippets / People Also Ask boxes
- `/seo-aeo-schema-generator` → Generate structured data markup
- `/seo-schema` → Implement schema.org for rich results
- `/seo-images` → Optimize all images for SEO

**Deliverable:** Every page fully optimized for Google understanding and clicks.

---

### STEP 7 — AUTHORITY & LINK BUILDING
**Goal:** Earn backlinks that signal trust and authority to Google.

**Quality > Quantity always. One link from an authoritative industry site > 100 random directories.**

**Link Building Tactics:**
| Tactic | Description |
|--------|-------------|
| Be the Source | Create original data/research journalists cite |
| Journalist Queries | Use Source of Sources / HARO for expert quote placements |
| Linkable Assets | Free tools, calculators, templates, comprehensive guides |
| Best-of Roundups | Appear in "best X" articles — critical for AI citations too |

**Skills to invoke:**
- `/seo-authority-builder` → Build domain authority and backlink strategy
- `/seo-cannibal...detector` → Find and fix keyword cannibalization hurting rankings
- `/seo-forensic-incident-response` → Diagnose and recover from traffic drops or penalties
- `/seo-competitor-pages` → Reverse-engineer competitor backlink sources

**Deliverable:** A backlink acquisition plan + fixes for any authority issues.

---

### STEP 8 — AI SEARCH & AEO VISIBILITY
**Goal:** Appear in ChatGPT, Perplexity, Gemini, Google AI Overviews, and all AI assistants.

**Key insight:** AI assistants cite sources based on authority, relevance, and clear direct answers. If you rank on Google, you'll likely appear in AI search. But AEO requires extra steps.

**To rank in AI search:**
1. Create comprehensive content with clear subheadings and direct answers
2. Build topical authority through full cluster coverage
3. Earn citations from authoritative sources (especially best-of roundup articles)
4. Add schema markup so AI can parse your content structure

**Critical:** Google Search Console cannot track AI assistant traffic. You must monitor AI visibility separately.

**Skills to invoke:**
- `/generative-ai-seo` → Full AEO/GEO strategy for AI search visibility
- `/seo-geo` → Generative Engine Optimization tactics
- `/seo-aeo-schema-generator` → Schema markup optimized for AI parsing
- `/seo-aeo-content-quality-auditor` → Ensure content meets AI citation standards

**For international/multilingual sites:**
- `/seo-hreflang` → Implement hreflang for multi-language SEO

**Deliverable:** Brand visibility across all AI search platforms + schema-optimized pages.

---

## BONUS — ONGOING & ADVANCED

### Programmatic SEO (for scale)
If the site needs thousands of pages at scale (directories, templates, location pages):
- `/seo-programmatic` → Programmatic SEO page generation strategy

### Data-Driven SEO
If using DataForSEO API for keyword data or SERP analysis:
- `/seo-dataforseo` → Pull live keyword data and SERP metrics

### Monitoring & Reporting
- Review Google Search Console weekly (impressions, clicks, new keywords, ranking changes)
- Monitor AI visibility manually or via AI tracking tools
- Plan next topical cluster once current one is complete

---

## BUSINESS TYPE QUICK PRESETS

Use these to fast-track the strategy based on the user's business type:

### 🛒 E-commerce
Priority: Product page SEO → Category page optimization → Buying guide content → Image SEO
Must-use: `/seo-aeo-landing-page-writer` `/seo-images` `/seo-image-gen` `/seo-schema` `/seo-programmatic`

### 💻 SaaS / Software
Priority: Feature/pricing pages → Comparison content (X vs Y) → Use-case blog cluster → Integration pages
Must-use: `/seo-aeo-landing-page-writer` `/seo-aeo-content-cluster` `/seo-competitor-pages` `/seo-aeo-schema-generator`

### 📍 Local Business
Priority: Google Business Profile → Location pages → Local keyword targeting → Review signals
Must-use: `/seo-page` `/seo-schema` `/seo-technical` `/seo-sitemap`

### 📝 Blog / Media / Creator
Priority: Keyword-driven content clusters → Topical authority → Monetization content
Must-use: `/seo-aeo-blog-writer` `/seo-content-writer` `/seo-aeo-content-cluster` `/seo-content-planner`

### 🏢 B2B / Agency / Service
Priority: Service pages → Case study content → Authority building → Thought leadership
Must-use: `/seo-aeo-landing-page-writer` `/seo-authority-builder` `/seo-aeo-blog-writer` `/generative-ai-seo`

### 🖼️ Image-Heavy (Photography / Art / Portfolio / Products)
Priority: Image optimization → Alt text strategy → Visual content SEO → Image sitemaps
Must-use: `/seo-image-gen` `/seo-images` `/seo-schema` `/seo-sitemap`

---

## GOLDEN RULES (Always Apply)

1. **Business goals first** — SEO serves revenue, leads, and customers. Not rankings for vanity.
2. **Intent always wins** — Match what the searcher actually wants, not just the keyword.
3. **Money pages before blog posts** — Optimize what converts before what informs.
4. **Clusters over random posts** — Topical authority beats isolated articles.
5. **Quality over quantity** — One 10x piece beats ten average ones.
6. **SEO + AI = same foundation** — Great traditional SEO automatically improves AI visibility.
7. **Link building is last** — Get content right first, then amplify with links.
8. **Track what matters** — Impressions, clicks, rankings, conversions. Not just traffic.
