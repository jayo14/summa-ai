# 📚 Summa AI

> *"The learning companion that never forgets—because your tutor should know you as well as you know yourself."*

---

## 🎯 The Mission

**Every student has a unique brain. Why do we teach them all the same way?**

Summa AI is an **adaptive learning companion** that builds a permanent, evolving memory of *you*—your knowledge, your gaps, your pace, your personality, your exams, your wins, and your struggles. It doesn't just answer questions; it *knows* you.

Whether you're an **undergraduate** struggling with calculus, a **master's student** diving into NLP, or a **lifelong learner** picking up guitar theory—Summa AI becomes your personal tutor that:

- 🧠 **Remembers everything** you've ever learned
- 🔍 **Knows your gaps** before you do
- 🗓️ **Tracks your exams** and reminds you proactively
- 🎯 **Adapts in real-time** to your feedback
- ⬡ **Visualizes your growth** as a dynamic proficiency hexagon
- 🧑‍🏫 **Teaches with personality**—because learning should be fun

---

## 🌟 Key Features

### 1. **Proactive Memory** 🧠
> *"How did your test go yesterday?"*

- **Automatic date detection** — Mentions "tomorrow" or "Dec 15"? Summa AI will ask: *"Should I save this to your memory?"*
- **Post-exam check-ins** — Remembers your exam dates and asks about them *without prompting*
- **Life-aware** — If you mention an event ("I have a job interview next week"), it follows up
- **Contextual reminders** — *"Your final project is due in 3 days—should we review it?"*

**Why this wins:** It feels *human*. Students are shocked when the AI remembers their schedule better than they do.

---

### 2. **Adaptive Learning Engine** 📚
> *"Learning isn't linear—neither is our teaching."*

- **Knowledge Graph** — Every concept is connected (prerequisites, related topics, applications)
- **Gap Detection** — Automatically finds what you don't know *before* you realize it
- **Personalized Study Plans** — "Before tackling Quantum Physics, brush up on Linear Algebra and Wave Mechanics. Here's a 5-day plan..."
- **Multi-level Support** — Adapts explanations for undergrads, master's students, and lifelong learners

---

### 3. **Exam-Prep Engine** 📝
> *"You have exams in 6 weeks. Here's your personalized roadmap."*

- **Upload your timetable** — Tell it your exam dates, courses, and weightings
- **Automated preparation** — Constructs a study roadmap based on your knowledge graph
- **Dynamic pacing** — As you master topics, it adjusts the plan in real-time
- **Pre-exam drills** — Generates practice papers based on your weakest areas

---

### 4. **Proficiency Hexagon** ⬡
> *"Your growth isn't one-dimensional—it's multi-faceted."*

Summa AI visualizes your skills as a **dynamic hexagon** where each vertex represents a learning dimension:

```
         Knowledge Depth
             ⬆
            /  \
     Speed /    \ Problem-Solving
          |  🟢 |
          |  🟡 |
  Consistency   Confidence
           \    /
            \  /
         Creativity
```

- **Six dimensions:** Depth, Problem-Solving, Speed, Consistency, Confidence, Creativity
- **Expands over time** — Hexagon → Octagon → Decagon as you master new skills
- **Color-coded:** 🟢 Mastered → 🟡 Learning → 🔴 Struggling
- **Track progress** — Watch your hexagon grow as you study

---

### 5. **Academic Timeline** 🗓️
> *"Your semester at a glance."*

```
Semester Timeline
├── Week 1-3: Topic A (Basics)
├── Week 4-6: Topic B (Intermediate)
├── Week 7: Midterm
├── Week 8-10: Topic C (Advanced)
├── Week 11-12: Project Work
└── Week 13: Final Exams
```

- **Automatic reminders:** "You have a midterm in 2 weeks. Ready?"
- **Retrospective review:** "Last semester, you struggled with Calculus. Want to revisit?"
- **Proactive suggestions:** "Based on your timetable, I recommend starting your project next week."

---

### 6. **Ingest Anything** 📥
> *"Upload your materials. We'll handle the rest."*

Upload your learning materials:
- 📄 PDFs (lecture notes, textbooks, research papers)
- 🎥 YouTube videos (auto-transcribed)
- 🔗 Websites and articles
- 📝 Past quizzes and exams
- 💬 ChatGPT conversations (exported)

Summa AI structures everything into a **knowledge graph**—concepts connected by relationships.

---

### 7. **Forget What's Outdated** 🗑️
> *"You've mastered it? Let's make room for what's next."*

- Student says: *"I've mastered Newtonian mechanics now."*
- Summa AI **surgically prunes** that subgraph from memory
- Keeps the knowledge graph clean and relevant
- *Bonus:* Manually select topics to "archive" or "forget"

---

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 14** — React framework with App Router
- **Tailwind CSS** — Utility-first styling
- **shadcn/ui** — Pre-built, accessible components
- **D3.js** — Hexagon visualization
- **React Flow** — Knowledge graph explorer
- **Framer Motion** — Smooth animations
- **TypeScript** — Type safety

### **Backend**
- **Python FastAPI** — High-performance API
- **Pydantic v2** — Data validation
- **APScheduler** — Proactive reminders
- **BackgroundTasks** — Async processing
- **python-multipart** — File uploads

### **Memory Layer**
- **Cognee Cloud** — Hybrid graph-vector memory (free $35 credit with code `COGNEE-35`)
  - `remember()` — Ingest everything
  - `recall()` — Hybrid semantic + graph search
  - `improve()` — Adapt based on feedback
  - `forget()` — Prune mastered topics
- **Neo4j** — Graph database (managed by Cognee)
- **Qdrant** — Vector database (managed by Cognee)

### **AI & LLM**
- **OpenAI GPT-4o-mini** — Daily conversations (cheap, fast)
- **OpenAI GPT-4o** — Final demo (showcase quality)

### **Scheduling & Deployment**
- **APScheduler** — In-process scheduling
- **Railway** — One-click deployment

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js 14 + Tailwind + TypeScript)                │
│  - Onboarding flow (personality + academic profile)           │
│  - Chat interface (human-like conversations)                  │
│  - Proficiency Hexagon (interactive, animated)                │
│  - Timeline view (courses, exams, milestones)                 │
│  - Knowledge graph explorer (React Flow)                      │
└─────────────────────────┬───────────────────────────────────────┘
                          │ REST API / WebSocket
┌─────────────────────────▼───────────────────────────────────────┐
│  BACKEND (Python FastAPI)                                      │
│  - User profile management                                    │
│  - Material ingestion pipeline                                │
│  - Gap analysis engine (graph traversal)                      │
│  - Exam-prep orchestrator                                     │
│  - Hexagon generator (dimension calculations)                 │
│  - Proactive reminder engine (APScheduler)                    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│  MEMORY LAYER (Cognee Cloud)                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  `remember()` → Ingest text/files/URLs                 │   │
│  │  `recall()` → Hybrid semantic + graph search           │   │
│  │  `improve()` → Adapt weights based on feedback         │   │
│  │  `forget()` → Prune mastered/outdated topics          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                              │
│  🔹 Neo4j (Graph DB) → Relationship traversal               │
│  🔹 Qdrant (Vector DB) → Semantic similarity                │
│  🔹 LLM (OpenAI) → Explanation generation                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema (Simplified)

```python
# Pydantic Models (backend/app/models.py)

class UserProfile:
    id: str
    name: str
    degree: str  # "Undergraduate" | "Master's" | "Lifelong Learner"
    field_of_study: str
    learning_style: str  # "visual" | "auditory" | "kinesthetic"
    personality_traits: dict  # {"humor": 0.8, "concise": 0.3}
    goals: list[str]
    created_at: datetime

class Exam:
    id: str
    user_id: str
    course_name: str
    exam_type: str  # "Midterm" | "Final" | "Quiz"
    date: datetime
    weight: float  # % of final grade
    topics: list[str]  # Linked to knowledge graph nodes
    status: str  # "Upcoming" | "Completed" | "Missed"

class KnowledgeNode:
    id: str
    user_id: str
    concept: str
    parent_concepts: list[str]  # Prerequisites
    child_concepts: list[str]   # Advanced topics
    proficiency: dict  # {"depth": 0.8, "speed": 0.6, ...}
    last_reviewed: datetime
    mastery_level: str  # "Mastered" | "Learning" | "Struggling"

class HexagonDimension:
    user_id: str
    dimension: str  # "Depth" | "Problem-Solving" | "Speed" | etc.
    score: float  # 0.0 - 1.0
    updated_at: datetime
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Cognee Cloud account ([free $35 credit with code `COGNEE-35`](https://app.cognee.ai))

### Quick Setup (2 Hours)

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/summa-ai.git
cd summa-ai
```

#### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Cognee API key and OpenAI key
```

#### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

#### 4. Run the Application
```bash
# Terminal 1: Backend
cd backend
uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit `http://localhost:3000` to start using Summa AI!

---

## 📁 Project Structure

```
summa-ai/
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Landing + Onboarding
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # Hexagon + Timeline
│   │   │   └── chat/page.tsx     # Chat interface
│   │   └── api/
│   │       └── chat/route.ts     # API route to backend
│   ├── components/
│   │   ├── Hexagon.tsx           # D3.js hexagon visualization
│   │   ├── GraphExplorer.tsx     # React Flow knowledge graph
│   │   ├── ChatInterface.tsx     # Chat UI
│   │   ├── Timeline.tsx          # Academic timeline
│   │   └── OnboardingFlow.tsx    # Multi-step onboarding
│   ├── lib/
│   │   ├── cognee-client.ts      # Cognee API wrapper
│   │   └── utils.ts              # Helper functions
│   └── tailwind.config.js
│
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI entry point
│   │   ├── models.py             # Pydantic schemas
│   │   ├── cognee_client.py      # Cognee wrapper
│   │   ├── scheduler.py          # APScheduler (proactive reminders)
│   │   ├── routes/
│   │   │   ├── chat.py           # /chat endpoint
│   │   │   ├── memory.py         # /remember, /recall, /forget
│   │   │   ├── exam.py           # /exams, /schedule
│   │   │   └── hexagon.py        # /hexagon endpoint
│   │   └── services/
│   │       ├── hexagon_calculator.py  # Dimension algorithms
│   │       ├── timeline_builder.py    # Academic timeline
│   │       └── onboarding.py          # User profiling
│   └── requirements.txt
│
├── .env.example
├── docker-compose.yml            # (Optional) Self-hosted Cognee
├── README.md
└── LICENSE
```

---

## 🔧 Environment Variables

```env
# Cognee
COGNEE_API_KEY=your_cognee_api_key
COGNEE_API_URL=https://api.cognee.ai

# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini  # Use gpt-4o for final demo

# Database (Optional)
DATABASE_URL=postgresql://user:pass@localhost:5432/summa

# Application
SECRET_KEY=your_secret_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📸 Demo Walkthrough

### Step 1: Onboarding
> *"Hey there! I'm Summa AI—your learning companion that never forgets. Tell me a bit about yourself..."*

| **Question** | **Student Answers** |
|--------------|-------------------|
| What's your name? | "Alex" |
| What are you studying? | "Master's in Computer Science" |
| What's your goal? | "I want to understand Natural Language Processing" |
| How do you learn best? | "Videos and hands-on coding" |
| When are your exams? | "NLP Final: Dec 15, DL Final: Dec 18" |

### Step 2: Upload Materials
Alex uploads:
- 📄 PDF: "Speech and Language Processing" by Jurafsky
- 🔗 YouTube: "Stanford CS224N"
- 📝 Past quiz results

### Step 3: Knowledge Graph Construction
Summa AI builds a knowledge graph:
```
NLP
├── Prerequisite: Probability Theory ✅ (Mastered)
├── Prerequisite: Linear Algebra ✅ (Mastered)
├── Topic: Word Embeddings 🟡 (Learning)
│   ├── Sub-topic: Word2Vec ✅
│   └── Sub-topic: GloVe 🔴 (Struggling)
├── Topic: Transformers 🔴 (Gap)
└── Topic: Sequence Models 🟡 (Learning)
```

### Step 4: Adaptive Tutoring
**Alex:** *"How do Transformers work?"*

**Summa AI:** *"Great question! Before we dive into Transformers, let me check if you've covered the Attention Mechanism first..."*  
*[Detects gap]*  
*"It looks like you haven't studied Attention yet. Would you like me to teach you that first? It'll take about 20 minutes."*

**Alex:** *"Yes, please!"*

### Step 5: Hexagon Update
After 3 months, Alex's hexagon shows:
- 🟢 **Knowledge Depth:** Mastered
- 🟡 **Problem-Solving:** Improving (75% accuracy)
- 🔴 **Speed:** Slow—needs improvement

**Summa AI:** *"Your speed is lagging. Let's do 5-minute timed quizzes for the next week."*

### Step 6: Proactive Check-in
**AI (day after exam, unprompted):** *"How did your NLP final go? I remember you prepared for 20 hours!"*

**Alex:** *"It went well! I think I got an A!"*

**AI:** *"🎉 Amazing! Your hexagon is expanding—I'm adding a new dimension: 'Application.'"*

---

## 🏆 Why This Wins

| **Criterion** | **How Summa AI Dominates** |
|---------------|---------------------------|
| **Impact** | Solves *real* student pain—not knowing what to study, forgetting deadlines, feeling lost |
| **Creativity** | Hexagon visualization, proactive memory, dynamic adaptation—*no one* is doing this |
| **Technical Excellence** | Deep Cognee integration (full lifecycle + proactive triggers) + graph visualization + timeline engine |
| **Best Use of Cognee** | Uses `remember()` for EVERYTHING—exams, conversations, events; `recall()` with temporal context; `improve()` for hexagon adaptation; `forget()` for pruning |
| **UX** | The hexagon is *addictive*. Proactive reminders feel *human*. Students will check it daily |
| **Presentation** | Your personal story + visually stunning hexagon = emotional connection with judges |

---

## 🤝 Contributing

We're looking for:
- **Frontend wizards** → Make the dashboard gorgeous
- **Graph nerds** → Optimize Neo4j queries
- **UX designers** → Make onboarding *delightful*
- **Educators** → Help design the pedagogy

Join our Discord and say hi!

---

## 📜 License
MIT — Build on it, remix it, make it yours.

---

## 🙏 Acknowledgments
- **Cognee** — For building the memory layer that makes this possible
- **WeMakeDevs** — For hosting this hackathon and believing in developers
- **Every student who's ever felt lost** — This one's for you

---

## 📬 Contact

- **Discord:** [Join our community](https://discord.gg/wemakedevs)
- **Email:** contact@wemakedevs.org
- **Twitter:** [@summa_ai](https://twitter.com/summa_ai)

---

> *"The best teachers don't just teach—they remember your name, your struggles, your wins, and your dreams."*

**Summa AI does exactly that.**

---

## 🎯 Next Steps

1. **Share this README** in the WeMakeDevs Discord `#find-teammates` channel
2. **Claim your Cognee Cloud credit** — Use code `COGNEE-35`
3. **Start building!** — Install Cognee and test `remember()` with a sample PDF
4. **Let's win this hackathon!** 🏆

---

*Built with ❤️ for the WeMakeDevs "The Hangover Part AI" Hackathon (June 29 – July 5, 2026)*
