<![CDATA[<div align="center">

# 🌿 Chattie

### AI-Powered Customer Service Dashboard for Landscaping Businesses

*Automated lead qualification across WhatsApp & Email — built with Next.js, Supabase, and n8n*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![n8n](https://img.shields.io/badge/n8n-Workflows-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)](https://n8n.io)

---

**Chattie** is an AI-driven CRM dashboard designed specifically for landscaping companies *(hoveniersbedrijven)*. It automates customer conversations on WhatsApp and Email, qualifies leads through a structured multi-step flow, and provides a unified operations dashboard — so business owners can focus on the garden, not the inbox.

</div>

---

## ✨ Features

### 📊 Operations Dashboard
- **Real-time stats** — Today's leads, active bots, paused conversations, and email volume at a glance
- **Attention alerts** — Paused bot conversations surfaced instantly with one-tap resume
- **Activity feed** — Live stream of system events (messages sent/received, qualifications, errors)
- **Dutch-localized UI** — Greetings, dates, and labels all in Dutch

### 💬 WhatsApp Conversations
- **AI-powered bot** — Automated qualification through structured questions (address, wishes, dimensions, photos, email)
- **5-step qualification flow** — Visual progress tracking for each lead
- **Bot pause/resume** — Take over conversations manually when needed
- **Real-time messaging** — Powered by Supabase Realtime subscriptions
- **Multi-media support** — Text, images, video, audio, and document messages

### 📧 Email Management
- **Auto-classification** — Incoming emails categorized as Customer, Supplier, Spam, Internal, or Other
- **Gmail integration** — Thread-based email view with draft creation
- **Email bot** — Automated qualification via email with debounce processing
- **Smart filtering** — Filter by classification, search by sender or subject

### 📞 Call Notes
- **Call logging** — Record notes and outcomes for each contact
- **Follow-up scheduling** — Set follow-up dates with automatic reminders
- **Gmail sync** — Call summaries sent via email automatically

### ⏰ Follow-ups & Reminders
- **Scheduled follow-ups** — Track upcoming callbacks and tasks
- **Reminder automation** — n8n workflows handle reminder scheduling

### 🏢 Company Knowledge Base
- **Editable company info** — Manage business details the AI bot references
- **Category-based organization** — Structured knowledge for accurate bot responses

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Chattie Dashboard                       │
│                  (Next.js 16 + React 19)                    │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────┐ ┌────────┐  │
│  │Dashboard │ │Conver-   │ │ Emails │ │ Call │ │Company │  │
│  │  Stats   │ │sations   │ │  View  │ │Notes │ │  Info  │  │
│  └────┬─────┘ └────┬─────┘ └───┬────┘ └──┬───┘ └───┬────┘  │
│       │            │           │         │         │        │
│       └────────────┴─────┬─────┴─────────┴─────────┘        │
│                          │                                  │
│                    Supabase Client                           │
│                   (SSR + Realtime)                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │    Supabase (Backend)   │
              │                        │
              │  ┌────────────────┐    │
              │  │   PostgreSQL   │    │
              │  │  (contacts,    │    │
              │  │  conversations,│    │
              │  │  messages,     │    │
              │  │  email_threads,│    │
              │  │  call_notes,   │    │
              │  │  system_events)│    │
              │  └────────────────┘    │
              │  ┌────────────────┐    │
              │  │   Realtime     │    │
              │  │  Subscriptions │    │
              │  └────────────────┘    │
              │  ┌────────────────┐    │
              │  │    Storage     │    │
              │  │ (Photo uploads)│    │
              │  └────────────────┘    │
              └────────────┬───────────┘
                           │
              ┌────────────┴────────────┐
              │    n8n (Automation)     │
              │                        │
              │  • WhatsApp Handler     │
              │  • Debounce Processor   │
              │  • Gmail Poller         │
              │  • Qualification Bot    │
              │  • Manual Message API   │
              │  • Call Notes Sender    │
              │  • Reminder Scheduler   │
              │  • Email Debounce       │
              └────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 (App Router) | Server-side rendering, routing |
| **UI** | React 19 + Tailwind CSS 4 | Component library, styling |
| **Language** | TypeScript 5 | Type-safe development |
| **Backend** | Supabase | PostgreSQL, Auth, Realtime, Storage |
| **Automation** | n8n | Workflow orchestration (7 workflows) |
| **Messaging** | WhatsApp (via Unipile) | Customer communication |
| **Email** | Gmail API | Email classification & responses |
| **Forms** | React Hook Form + Zod | Validated form handling |
| **Icons** | Lucide React | Consistent icon system |
| **Notifications** | Sonner | Toast notifications |
| **Date/Time** | date-fns | Dutch-localized date formatting |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** / **pnpm** / **yarn**
- **Supabase** project (with database setup)
- **n8n** instance (self-hosted or cloud)

### 1. Clone the Repository

```bash
git clone https://github.com/charankumarnaidu703-sketch/Chattie.git
cd Chattie
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_N8N_MANUAL_MESSAGE_URL=https://your-n8n.com/webhook/manual-message
NEXT_PUBLIC_N8N_CALL_NOTE_URL=https://your-n8n.com/webhook/call-note
```

### 4. Set Up the Database

Run the migration SQL against your Supabase project to create the required tables:

- `contacts` — Customer contact records
- `conversations` — WhatsApp conversation threads
- `messages` — Individual WhatsApp messages
- `email_threads` — Gmail thread metadata
- `email_messages` — Individual email messages
- `call_notes` — Phone call records
- `system_events` — System activity log
- `settings` — App configuration
- `company_knowledge` — AI bot knowledge base

### 5. Import n8n Workflows

Import the included `.json` workflow files into your n8n instance:

| Workflow | File | Purpose |
|----------|------|---------|
| WhatsApp Handler | `Workflow 1 — WhatsApp Message Handler (Collector).json` | Captures incoming WhatsApp messages |
| Debounce Processor | `Workflow 1B — Debounce Processor.json` | Batches messages before AI processing |
| Gmail Poller | `2-Gmail Poller.json` | Polls and classifies incoming emails |
| Qualification Bot | `3-Qualification Summary.json` | AI-driven lead qualification |
| Manual Message | `4-Manual Message.json` | Sends manual WhatsApp messages |
| Call Notes | `5-Call Notes.json` | Logs and emails call summaries |
| Reminder Scheduler | `6-Reminder Scheduler.json` | Automated follow-up reminders |
| Email Debounce | `7-Email Debounce Processor.json` | Batches email replies |

### 6. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the dashboard.

---

## 📁 Project Structure

```
Chattie/
├── src/
│   ├── app/
│   │   ├── (app)/                    # App route group (with sidebar layout)
│   │   │   ├── dashboard/            # 📊 Operations overview
│   │   │   ├── conversations/        # 💬 WhatsApp conversations
│   │   │   │   └── [id]/             # Individual conversation view
│   │   │   ├── emails/               # 📧 Email thread management
│   │   │   │   └── [id]/             # Individual email thread view
│   │   │   ├── call-notes/           # 📞 Call logging
│   │   │   ├── follow-ups/           # ⏰ Follow-up tracker
│   │   │   ├── company-info/         # 🏢 Knowledge base editor
│   │   │   └── layout.tsx            # Sidebar + mobile nav wrapper
│   │   ├── globals.css               # Design tokens & global styles
│   │   ├── layout.tsx                # Root layout (fonts, toaster)
│   │   └── page.tsx                  # Root redirect
│   ├── components/
│   │   ├── ui/                       # Reusable UI primitives
│   │   │   ├── badge.tsx             # Status badges
│   │   │   ├── button.tsx            # Button variants
│   │   │   ├── card.tsx              # Card containers
│   │   │   ├── confirm-dialog.tsx    # Confirmation modals
│   │   │   ├── input.tsx             # Form inputs
│   │   │   ├── tabs.tsx              # Tab navigation
│   │   │   ├── sheet.tsx             # Slide-over panels
│   │   │   ├── skeleton.tsx          # Loading skeletons
│   │   │   ├── separator.tsx         # Dividers
│   │   │   └── textarea.tsx          # Multi-line inputs
│   │   ├── ConversationCard.tsx      # Conversation list item
│   │   ├── EmptyState.tsx            # Empty state placeholder
│   │   ├── LoadingSkeleton.tsx       # Page-level loading states
│   │   ├── MobileNav.tsx             # Bottom nav + desktop sidebar
│   │   ├── QualificationProgress.tsx # 5-step progress indicator
│   │   └── StatusBadge.tsx           # Status pill component
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts             # Browser Supabase client
│       │   └── server.ts             # Server-side Supabase client (SSR)
│       ├── database.types.ts         # Auto-generated Supabase types
│       ├── types.ts                  # App-level TypeScript types
│       ├── env.ts                    # Environment variable validation
│       └── utils.ts                  # Utility functions (cn)
├── stitch_dashboard/                 # Design reference mockups
├── *.json                            # n8n workflow definitions
├── migration_email_agent.sql         # Email agent DB migration
└── package.json                      # Project dependencies
```

---

## 🔄 n8n Workflow Architecture

The backend automation is powered by **7 interconnected n8n workflows** that handle the entire customer lifecycle:

```
  Customer sends WhatsApp message
           │
           ▼
  ┌─── WF1: Message Handler ───┐
  │  • Store message in Supabase│
  │  • Start debounce timer     │
  └─────────┬───────────────────┘
            │
            ▼
  ┌─── WF1B: Debounce Processor ───┐
  │  • Wait for message batch       │
  │  • Send to AI for processing    │
  │  • Generate qualification reply  │
  └─────────┬───────────────────────┘
            │
            ▼
  ┌─── WF3: Qualification Summary ──┐
  │  • Extract lead data             │
  │  • Update qualification step     │
  │  • Send summary on completion    │
  └──────────────────────────────────┘

  Gmail inbox
      │
      ▼
  ┌─── WF2: Gmail Poller ──────────┐
  │  • Fetch new emails              │
  │  • AI-classify (Customer/Spam..) │
  │  • Store thread in Supabase      │
  │  • Create draft reply if needed  │
  └──────────────────────────────────┘

  ┌─── WF6: Reminder Scheduler ────┐
  │  • Check for stale conversations │
  │  • Send follow-up reminders      │
  └──────────────────────────────────┘
```

---

## 🌍 Localization

The entire UI is built in **Dutch (Nederlands)**, tailored for Dutch landscaping businesses:

- Greetings: *Goedemorgen / Goedemiddag / Goedenavond*
- Status labels: *Actief, Gepauzeerd, Gekwalificeerd, Gesloten*
- Navigation: *Dashboard, Gesprekken, E-mails, Bellijst, Follow-ups, Bedrijf*
- Date formatting: Dutch locale via `date-fns/locale/nl`

---

## 📱 Responsive Design

- **Mobile-first** — Floating bottom navigation bar with glassmorphism
- **Desktop** — Fixed sidebar with full labels
- **Material Design 3** — Custom design tokens with ambient shadows and rounded containers
- **Adaptive layouts** — Conversation detail views with slide-over panels on mobile

---

## 🧑‍💻 Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## 📄 License

This project is proprietary and not licensed for public use.

---

<div align="center">

**Built with 🌿 for the landscaping industry**

*Chattie — AI die voor je klanten zorgt, zodat jij voor de tuin kunt zorgen.*

</div>
]]>
