# PrepMate AI

> Master the Interview with Quiet Intelligence.

An adaptive, AI-powered interview preparation platform built with React + Vite (frontend) and FastAPI (backend), featuring a multi-provider AI fallback system.

## Architecture

```
web/
├── frontend/          # React + TypeScript + Tailwind CSS + Vite
│   ├── src/
│   │   ├── api/       # Axios API client with JWT interceptors
│   │   ├── components/common/  # SideNav, TopNav, PebbleCard, Button, etc.
│   │   ├── layouts/   # AppLayout, AuthLayout, InterviewLayout, TopNavLayout
│   │   ├── pages/     # 11 pages: Landing, Auth, Dashboard, Resume, etc.
│   │   ├── routes/    # React Router v6 configuration
│   │   ├── store/     # Zustand state management (auth, interview, settings)
│   │   ├── styles/    # Global CSS with Tailwind + Geist font
│   │   └── types/     # TypeScript type definitions
│   └── ...
│
├── backend/           # FastAPI + SQLAlchemy + SQLite
│   ├── app/
│   │   ├── api/       # Interview session routes
│   │   ├── auth/      # JWT authentication routes
│   │   ├── analytics/ # Performance analytics routes
│   │   ├── core/      # Configuration & settings
│   │   ├── db/        # Database setup (SQLAlchemy)
│   │   ├── models/    # Database models
│   │   ├── resume/    # Resume upload & parsing routes
│   │   └── services/  # AI service with multi-provider fallback
│   └── ...
│
└── docs/              # Documentation
```

## AI Fallback Stack

The system uses 4 AI providers in priority order. If one fails (rate limit, timeout, error), it automatically falls to the next:

| Priority | Provider | Model | Best For |
|---|---|---|---|
| 1 | **Google Gemini** | gemini-2.5-flash | Highest quality output |
| 2 | **Groq** | llama-3.3-70b-versatile | Fast inference, strong model |
| 3 | **OpenRouter** | gemini-2.0-flash-001 | Reliable routing fallback |
| 4 | **Cerebras** | llama3.1-8b | Ultra-fast, smaller model |

## Quick Start

### Frontend

```bash
cd web/frontend
npm install
npm run dev
```

### Backend

```bash
cd web/backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Environment Variables

Create a `.env` file in `web/backend/`:

```env
DATABASE_URL=sqlite:///./prepmate.db
SECRET_KEY=your-secret-key
GEMINI_API_KEY=your-key
GROQ_API_KEY=your-key
OPENROUTER_API_KEY=your-key
CEREBRAS_API_KEY=your-key
```

## Design System — Pebble

- **Colors**: Strictly monochromatic (black, white, greys)
- **Typography**: Geist font family (display, headline, body, label scales)
- **Geometry**: 32px radius cards ("pebbles"), 8px spacing grid
- **Philosophy**: Japanese minimalism meets Swiss typography

## Pages

1. **Landing** — Hero, features, workflow, testimonials, CTA
2. **Login / Signup** — Centered auth forms
3. **Dashboard** — Bento grid with readiness score, sessions, weak topics
4. **Resume Upload** — Drag & drop with AI-parsed extraction preview
5. **Interview Setup** — Role/company selection, persona cards, rigor slider
6. **Mock Interview** — Full-screen session with timer, question, confidence selector
7. **Feedback** — Score donut, strengths/improvements, confidence timeline
8. **Analytics** — Topic heatmap, progression chart, weakness intervention
9. **Company Prep** — Company-specific philosophy cards and question bank
10. **Settings** — Profile, resume, preferences, appearance toggle

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 3 |
| State | Zustand (with persistence) |
| Routing | React Router v6 |
| Auth | Firebase Auth & Supabase Auth |
| HTTP | Axios |
| Backend | FastAPI, SQLAlchemy, PostgreSQL (Supabase) |
| Document Parsing | pypdf |
| AI | Gemini (Primary), Groq, OpenRouter, Cerebras |
| Deployment | Vercel (Frontend), Render (Backend) |

## Deployment

The project is pre-configured for zero-config deployments.
- **Frontend**: Connect Vercel to `web/frontend/`. Uses `vercel.json` for SPA routing.
- **Backend**: Connect Render to `web/backend/`. Uses `render.yaml` for Uvicorn configuration. Ensure you add your production `.env` variables to your cloud host.
