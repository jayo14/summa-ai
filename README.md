# Summa AI

> **Adaptive, Mastery-Driven AI Study Platform & Intelligent Tutor**

Summa AI is an intelligent, full-stack learning platform engineered to transform academic preparation through personalized, mastery-driven pedagogy. Combining real-time cognitive retrieval-augmented generation (RAG), dynamic difficulty scaling, and interactive pedagogical components, Summa AI acts as a 24/7 personal tutor tailored to every student's learning curve.

---

## 🚀 Key Features

### 🧠 Intelligent Study Assistant
- **Unbuffered SSE Streaming**: Real-time conversational tutoring with low latency server-sent event responses.
- **Grounded Citations**: Automatic source citation extraction, footnote formatting, and verifiable source chip attribution.
- **Cognitive Context Recall**: Persistent student memory, knowledge graph integration, and misconception tracking.

### 🎯 Adaptive Mastery Engine
- **7 Pedagogical Recipes**: Dynamically adjusts lesson structure across New Topic Intro, Deep Dive, Misconception Remediation, Quick Review, Pre-Exam Drill, Teach-Back, and Spaced Retention.
- **Dynamic Difficulty Engine**: Continuously tracks comprehension depth and automatically scales question complexity up or down.
- **Misconception Detection Loop**: Flags concept confusions in real time and offers remediation paths before moving forward.

### 🧩 Interactive Activity Renderers
Rich, modular React 19 interactive study modules:
- **Core Learning**: Multiple Choice, Categorization, Matching, Ordering, Fill-in-the-Blank, Scenario-based, Short Answer, Teach-Back, and True/False.
- **Active Recall**: Rapid Recall, Retrieval Grid, Spaced Review, and Memory Checks.
- **Exam Readiness**: Past Question Drills, Topic Coverage Heatmaps, Predicted Practice Tests, and Post-Exam Reflection.

### 📅 Proactive Nudge Engine & Outcome Loop
- **Proactive Notifications**: Adaptive alerts for spaced review schedules, weak-topic reminders, and upcoming exam countdowns.
- **Exam Outcome Feedback Loop**: Captures post-exam reflection, identifies unprepared topics, and compares actual student results against prediction models.

### 🛡️ Administrative & Analytics Hub
- **AI Model Router**: Dynamic toggle and temperature management across OpenAI, Google Gemini, and Z.ai providers.
- **Analytics & Audit Logs**: Real-time telemetry, session engagement, token consumption, and role-based access control (RBAC).

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Radix UI, Lucide Icons, Wouter, Zustand, Recharts, KaTeX |
| **API Proxy** | Node.js, Express, ESBuild (Vercel Serverless Function & local development proxy) |
| **Backend API** | Python 3.13, FastAPI, Pydantic v2, SQLAlchemy 2.0, Asyncpg, Alembic, Instructor |
| **AI / Vector Store** | OpenAI API, Google Gemini API, Z.ai GLM, Qdrant Vector DB, Cognee |
| **Auth & Database** | Supabase Auth (JWT / JWKS verification), PostgreSQL |
| **CI / CD & Hosting** | GitHub Actions, Vercel (Frontend), Render (FastAPI Backend) |

---

## 📁 Repository Structure

```
summa-ai/
├── .github/workflows/      # GitHub Actions CI pipelines (frontend, backend, keep-alive)
├── api/                    # FastAPI backend service
│   ├── alembic/            # Database schema migrations
│   ├── app/                # Application routes, models, services, & core engine
│   │   ├── core/           # Security, auth, logging, and RBAC
│   │   ├── models/         # Pydantic schemas and SQLAlchemy models
│   │   ├── routes/         # API endpoints (chat, study, admin, analytics, etc.)
│   │   └── services/       # Mastery engine, difficulty engine, RAG, nudges
│   ├── tests/              # Pytest backend test suite
│   ├── requirements.txt    # Python dependencies
│   └── start_dev.sh        # Local backend server runner
├── client/                 # React 19 + Vite frontend
│   ├── src/
│   │   ├── components/     # UI design system, chat renderers, learning modules
│   │   ├── contexts/       # Auth & Theme context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities, API client, Supabase client
│   │   ├── pages/          # App views (Home, Dashboard, Admin, SEO pages)
│   │   └── stores/         # Zustand global state stores
├── server/                 # Express production server & API proxy
├── shared/                 # Shared TypeScript models and interfaces
├── vercel.json             # Vercel deployment configuration
├── render.yaml             # Render deployment configuration
└── package.json            # Frontend & server scripts and dependencies
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** >= 20.x
- **pnpm** >= 10.x
- **Python** >= 3.13
- **PostgreSQL** or a **Supabase** instance

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/jayo14/summa-ai.git
cd summa-ai

# Install frontend & server dependencies
pnpm install

# Set up Python virtual environment for backend
cd api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 2. Environment Configuration

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Key environment variables:

```ini
# Frontend & API Proxy
NEXT_PUBLIC_FASTAPI_BASE_URL=http://localhost:8000/api/v1
FASTAPI_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend Database & Auth
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/summa_ai
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret

# AI Providers
OPENAI_API_KEY=your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key
QDRANT_API_KEY=your-qdrant-api-key
QDRANT_CLUSTER_ENDPOINT=https://your-cluster.qdrant.io
```

### 3. Run Database Migrations

```bash
cd api
./run_migrations.sh
cd ..
```

### 4. Start Development Servers

In terminal 1 (FastAPI Backend):
```bash
cd api
./start_dev.sh
# Running at http://localhost:8000
```

In terminal 2 (Vite Frontend + Express Proxy):
```bash
pnpm dev
# Running at http://localhost:3000
```

---

## 🧪 Testing & Quality Checks

### Frontend
```bash
# Type check TypeScript
pnpm run check

# Run linter
pnpm run lint

# Run unit tests
pnpm run test

# Production build
pnpm run build
```

### Backend
```bash
cd api
pytest
```

---

## 🚢 Deployment

- **Frontend**: Automatically deployed to **Vercel** via GitHub integration. Configuration is handled in [`vercel.json`](file:///home/codegallantx/moi/summa-ai/vercel.json).
- **Backend API**: Configured for **Render** via [`render.yaml`](file:///home/codegallantx/moi/summa-ai/render.yaml), exposing health checks at `/health` with automatic migration triggers.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
