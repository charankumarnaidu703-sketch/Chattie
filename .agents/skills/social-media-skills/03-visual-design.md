# Visual Design & Assets

## canva-automation
**Path:** `/Users/charankumar/skills/canva-automation/`
**Source:** community

Automate Canva design operations via Rube MCP (Composio). Create, export, organize, and autofill designs programmatically.

### Core Workflows

#### 1. List and Browse Designs
- `CANVA_LIST_USER_DESIGNS` — Search/filter existing designs

#### 2. Create New Designs
- `CANVA_CREATE_CANVA_DESIGN_WITH_OPTIONAL_ASSET` — Create from scratch or template
- Supports design types: Presentation, Poster, SocialMedia, etc.

#### 3. Upload Assets
- `CANVA_CREATE_ASSET_UPLOAD_JOB` — Upload images/files to Canva
- `CANVA_FETCH_ASSET_UPLOAD_JOB_STATUS` — Poll until ready
- Supported formats: PNG, JPG, SVG, MP4, GIF

#### 4. Export Designs
- `CANVA_CREATE_CANVA_DESIGN_EXPORT_JOB` -> `CANVA_GET_DESIGN_EXPORT_JOB_RESULT`
- Formats: PDF, PNG, JPG, SVG, MP4, GIF, PPTX

#### 5. Organize with Folders
- `CANVA_POST_FOLDERS` — Create folders
- `CANVA_MOVE_ITEM_TO_SPECIFIED_FOLDER` — Organize designs

#### 6. Autofill from Brand Templates
- `CANVA_ACCESS_USER_SPECIFIC_BRAND_TEMPLATES_LIST` — Browse templates
- `CANVA_INITIATE_CANVA_DESIGN_AUTOFILL_JOB` — Fill placeholders with data

### Quick Reference
| Task | Tool | Key Params |
|------|------|------------|
| List designs | CANVA_LIST_USER_DESIGNS | query, continuation |
| Create design | CANVA_CREATE_CANVA_DESIGN_WITH_OPTIONAL_ASSET | design_type, title |
| Upload asset | CANVA_CREATE_ASSET_UPLOAD_JOB | name, url |
| Export design | CANVA_CREATE_CANVA_DESIGN_EXPORT_JOB | design_id, format |
| Autofill template | CANVA_INITIATE_CANVA_DESIGN_AUTOFILL_JOB | brand_template_id, data |
| Create folder | CANVA_POST_FOLDERS | name, parent_folder_id |

### Async Pattern
Many operations are async: Initiate -> Poll (2-3s intervals) -> Extract result

### Prerequisites
- Rube MCP connected (RUBE_SEARCH_TOOLS available)
- Active Canva connection via RUBE_MANAGE_CONNECTIONS

---

## visual-emotion-engineer
**Path:** `/Users/charankumar/skills/visual-emotion-engineer/`
**Source:** community

Visual psychologist that maps colors, typography, spacing, imagery, and layout to target emotions and conversion goals.

### Framework: Arousal-Valence Visual Mapping

**Step 1** — Define target emotion (calm, trust, urgency, prestige, warmth, excitement)
**Step 2** — Map color to context (audience, culture, category)
**Step 3** — Set typography personality (match emotional register)
**Step 4** — Control whitespace and hierarchy (direct attention, reduce load)
**Step 5** — Choose imagery intentionally (reinforce emotional state)

### Emotional Goal → Visual Decisions
| Goal | Visual Approach |
|------|----------------|
| Calm | Low contrast, clear hierarchy, generous whitespace |
| Trust | Restrained color, transparent structure, realistic imagery |
| Urgency | Higher contrast, tighter focal points |
| Prestige | Minimalism, controlled spacing, premium cues |
| Warmth | Softer hues, human imagery, approachable type |

### Failure Modes to Avoid
- Applying color psychology as if universal (calibrate to audience/culture)
- Over-decorating (visual clutter raises cognitive load)
- Picking visuals from taste rather than intent

### Skill Chaining
**Before:** `@customer-psychographic-profiler`
**After:** `@brand-perception-psychologist`, `@copywriting-psychologist`

### Ethical Guardrails
- Respect accessibility and contrast requirements
- Avoid deceptive emotional manipulation
- Use cultural sensitivity in color and imagery
