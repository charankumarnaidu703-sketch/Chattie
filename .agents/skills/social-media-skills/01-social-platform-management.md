# Social Platform Management

## instagram
**Path:** `/Users/charankumar/skills/instagram/`
**Source:** community (author: renat)

Complete Instagram integration via Graph API.

### Capabilities
- **Publishing:** Photos, videos, reels, stories, carousels
- **Scheduling:** Draft → approve → publish pipeline
- **Community:** Comments (read/reply/delete), DMs, mentions
- **Analytics:** Post metrics, account insights, best times, growth trends
- **Hashtags:** Search, track, top posts by hashtag
- **Templates:** Reusable caption + hashtag templates
- **Infrastructure:** Export (JSON/CSV), FastAPI dashboard, full sync

### Key Scripts
| Task | Command |
|------|---------|
| Post photo | `publish.py --type photo --image path.jpg --caption "text"` |
| Post reel | `publish.py --type reel --video path.mp4 --caption "text"` |
| Post carousel | `publish.py --type carousel --images img1.jpg img2.jpg --caption "text"` |
| Schedule | `schedule.py --type photo --image path.jpg --at "2026-03-01T10:00"` |
| Analytics | `insights.py --user --period day --since 7` |
| Best times | `analyze.py --best-times` |
| Reply comment | `comments.py --reply --comment-id ID --text "reply"` |
| Send DM | `messages.py --send --user-id ID --text "hello"` |
| Dashboard | `serve_api.py` (localhost:8000/dashboard) |

### Limitations
- Personal accounts not supported (Business/Creator only)
- Cannot delete published posts or edit captions after posting
- 200 requests/hr, 25 posts/day, 200 DMs/hr rate limits

### References
- `references/graph_api.md` — API endpoints and parameters
- `references/publishing_guide.md` — Media specs (dimensions, formats)
- `references/rate_limits.md` — Detailed rate limits
- `references/account_types.md` — Business vs Creator differences
- `references/permissions.md` — OAuth scopes
- `references/setup_walkthrough.md` — Meta App setup guide

---

## social-orchestrator
**Path:** `/Users/charankumar/skills/social-orchestrator/`
**Source:** community (author: renat)

Unified social channel orchestrator. Coordinates Instagram + Telegram + WhatsApp.

### Core Commands
| Command | Description |
|---------|-------------|
| `/Publish_All` | Publish same content adapted to each channel |
| `/Campaign` | Multi-channel campaign with timeline |
| `/Insights_All` | Unified metrics across all channels |
| `/Content_Plan` | Weekly/monthly multi-channel editorial calendar |

### Cross-Channel Adaptation
- **Instagram:** Optimized image (1:1 or 4:5), 2200-char caption, 5-15 hashtags, CTA in caption
- **Instagram post types:** Feed 1080x1080, Reels 1080x1920, Stories 1080x1920, Carousel (10 slides)

### Best Posting Times
| Channel | Peak Hours | Best Days |
|---------|-----------|-----------|
| Instagram | 11h, 14h, 20h | Tue, Wed, Fri |

### Error Handling
Publish-or-Skip strategy — if one channel fails, others continue.

### Related Skills
- `ai-studio-image` — Generate images for Instagram
- `stability-ai` — Generate art/illustrations
- `image-studio` — Intelligent routing between image generators
- `instagram` — Instagram publication execution

---

## instagram-automation
**Path:** `/Users/charankumar/skills/instagram-automation/`
**Source:** community

Alternative Instagram automation via Rube MCP (Composio).

### Workflows
| Task | Tool Sequence |
|------|--------------|
| Single post | `INSTAGRAM_GET_USER_INFO` -> `INSTAGRAM_CREATE_MEDIA_CONTAINER` -> `INSTAGRAM_GET_POST_STATUS` -> `INSTAGRAM_CREATE_POST` |
| Carousel | Create individual containers -> `INSTAGRAM_CREATE_CAROUSEL_CONTAINER` -> Publish |
| Get insights | `INSTAGRAM_GET_USER_MEDIA` -> `INSTAGRAM_GET_POST_INSIGHTS` / `INSTAGRAM_GET_USER_INSIGHTS` |
| Check limits | `INSTAGRAM_GET_IG_USER_CONTENT_PUBLISHING_LIMIT` |

### Requirements
- Business or Creator Instagram account
- Connected to a Facebook Page
- 25 posts per 24-hour rolling window
