# JobPilot AI

**One click. AI applies everywhere.**

JobPilot AI is a full-stack mobile application that serves as an AI-powered career co-pilot. It helps job seekers aggregate listings, optimize resumes, generate tailored cover letters, track applications, and prepare for interviews — all in one place.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Mobile** | React Native (Expo SDK 54), TypeScript, Expo Router |
| **State** | Zustand 4.5 with AsyncStorage persistence |
| **UI** | Custom dark-mode-first component library, Reanimated 3 |
| **Backend** | Python 3.12, FastAPI, Uvicorn |
| **Database** | MongoDB (Motor + PyMongo) |
| **Cache / Queue** | Redis 7 |
| **Async Tasks** | Celery 5.4 |
| **AI** | OpenAI GPT-4o, Gemini 1.5 Pro, Claude 3.5 Sonnet (pluggable) |
| **Auth** | JWT (access + refresh tokens), Google OAuth2 |
| **Payments** | Stripe subscriptions |
| **Email** | SendGrid / Resend |
| **Infra** | Docker Compose, Nginx |

---

## Features

### AI Resume Studio
- PDF/DOCX resume parsing with OCR
- ATS keyword scoring against job descriptions
- AI-optimized resume variants for target roles
- PDF export

### AI Cover Letters & Cold Emails
- Tailored cover letter generation with tone selection
- Cold email generation with recruiter name lookup
- Email sending via SendGrid with tracking pixels

### Job Aggregation & Matching
- Automated fetching from RemoteOK, We Work Remotely, Y Combinator
- Manual job add via bookmarklet
- Semantic skill matching with job fit scores (0–100)

### Application Tracker
- Kanban pipeline: Saved → Applied → Interviewing → Offer → Rejected
- Follow-up reminders after 7 days of inactivity
- External URL launch + mark-as-applied flow

### Advanced AI Features
- Mock interview with AI-generated questions and response scoring
- Skill-gap analysis with learning resource suggestions
- LinkedIn profile optimizer (headline, about, experience)

### Monetization
- Free tier (10 AI generations/day)
- Pro tier ($9.99/mo, 100/day)
- Team tier ($29.99/mo)
- Daily usage tracking with midnight UTC reset

---

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Docker Desktop (optional, for infrastructure)
- MongoDB + Redis 7 (if running without Docker)

### Backend Setup

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ..\.env.example ..\.env   # Configure your environment variables
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Mobile Setup

```bash
cd mobile
cp .env.example .env   # Set EXPO_PUBLIC_API_URL
npm install
npx expo start 
#or
npm start
```

Then press `a` for Android, `i` for iOS, or `w` for web.

### Docker (Full Stack)

```bash
cd infrastructure
docker-compose up -d
```

This starts: FastAPI backend, Celery worker + beat scheduler, Redis 7, and Nginx reverse proxy.

---

## Project Structure

```
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/          # REST API routers
│   │   ├── core/         # Config, security, database
│   │   ├── models/       # Pydantic models & enums
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   ├── services/     # Business logic (AI, matching, email, billing)
│   │   └── tasks/        # Celery background tasks
│   └── requirements.txt
├── mobile/               # React Native Expo app
│   ├── app/              # Expo Router screens
│   ├── components/       # Reusable UI components
│   ├── lib/              # API client, theme, helpers
│   ├── store/            # Zustand state stores
│   └── types/            # TypeScript interfaces
├── infrastructure/       # Docker & Nginx configs
│   ├── docker-compose.yml
│   └── nginx/nginx.conf
└── .env.example
```

---

## API Documentation

When the backend is running, auto-generated docs are available at:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## Environment Variables

Key variables (see `.env.example` for the full list):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MongoDB connection string |
| `SECRET_KEY` | JWT signing secret |
| `REDIS_URL` | Redis connection string |
| `OPENAI_API_KEY` | OpenAI API key (or Gemini/Anthropic) |
| `SENDGRID_API_KEY` | Email sending API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `FREE_DAILY_LIMIT` | Daily AI generations for free tier |

---

develop by- Abhishek and Darshan

## License

MIT
