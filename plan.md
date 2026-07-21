# JobPilot AI — Build Plan

> **Tagline:** One click. AI applies everywhere.
> **Platform:** iOS + Android (React Native / Expo)
> **Backend:** FastAPI + PostgreSQL + Redis + Celery

---

## 1. Project Structure

```
JobPilot/
├── mobile/                          # React Native Expo app
│   ├── app/                         # Expo Router (file-based routing)
│   │   ├── (auth)/                  # Login, Register, ForgotPassword
│   │   ├── (tabs)/                  # Main tab navigation
│   │   │   ├── index.tsx            # Dashboard / Job Feed
│   │   │   ├── applications.tsx     # Application tracker
│   │   │   ├── resume.tsx           # Resume Studio
│   │   │   └── profile.tsx          # User profile & settings
│   │   ├── generate/                # AI generation screens
│   │   │   ├── cover-letter.tsx
│   │   │   ├── cold-email.tsx
│   │   │   └── resume-version.tsx
│   │   └── job/[id].tsx             # Job detail & apply screen
│   ├── components/                  # Shared UI components
│   │   ├── ui/                      # Button, Card, Input, Badge, etc.
│   │   ├── job/                     # JobCard, JobList, MatchScoreBadge
│   │   ├── resume/                  # ResumeUploader, AtsScoreCard, VersionList
│   │   ├── ai/                      # AiGenerationLoader, ToneSelector
│   │   └── tracking/                # ApplicationStatusBadge, FollowUpReminder
│   ├── lib/                         # Utilities, API client, storage
│   ├── hooks/                       # Custom React hooks
│   ├── store/                       # Zustand stores (auth, jobs, resume, app)
│   ├── services/                    # API service layer
│   ├── types/                       # TypeScript type definitions
│   └── app.json                     # Expo config
├── backend/
│   ├── app/
│   │   ├── api/                     # FastAPI routers
│   │   │   ├── auth.py              # Auth endpoints (JWT, OAuth2)
│   │   │   ├── users.py             # User profile & settings
│   │   │   ├── resumes.py           # Resume upload, ATS, versions
│   │   │   ├── cover-letters.py     # Cover letter generation
│   │   │   ├── cold-emails.py       # Cold email generation
│   │   │   ├── jobs.py              # Job listings & matching
│   │   │   ├── applications.py      # Application tracking
│   │   │   ├── analytics.py         # Usage stats & insights
│   │   │   └── webhooks.py          # Email tracking webhooks
│   │   ├── core/                    # Config, security, DB session
│   │   ├── models/                  # SQLAlchemy models
│   │   ├── schemas/                 # Pydantic schemas
│   │   ├── services/                # Business logic
│   │   │   ├── ai/                  # AI providers (OpenAI, Gemini, Claude)
│   │   │   ├── resume/              # Resume parsing (OCR), ATS scoring
│   │   │   ├── matching/            # Vector search, skill matching
│   │   │   ├── email/               # Email sending, tracking pixel
│   │   │   └── jobs/                # Job aggregation & scraping
│   │   └── tasks/                   # Celery background tasks
│   ├── alembic/                     # DB migrations
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── infrastructure/
│   ├── docker-compose.yml
│   ├── nginx/
│   └── terraform/                   # AWS/GCP provisioning
├── docs/
│   ├── api.md
│   └── architecture.md
└── README.md
```

---

## 2. Phased Build Plan

### Phase 1: Foundation (Week 1-2)

**Goal:** Auth, user profiles, and basic navigation working on both platforms.

| Task | Details |
|------|---------|
| Init Expo project | `npx create-expo-app@latest` with TypeScript, Expo Router |
| Set up backend | FastAPI + PostgreSQL + Alembic migrations |
| Auth system | Email/password + Google OAuth2; JWT access/refresh tokens |
| User model | name, email, avatar, plan tier, usage limits |
| Shared UI kit | Button, Input, Card, Badge, BottomSheet, Loader |
| Tab navigation | Dashboard, Applications, Resume, Profile |
| API client | Axios wrapper with auto token refresh |
| Docker Compose | Backend + PostgreSQL + Redis |

**Key files to create:**
- `mobile/app/(auth)/login.tsx`, `register.tsx`
- `mobile/app/(tabs)/index.tsx` (empty dashboard placeholder)
- `mobile/lib/api.ts`
- `backend/app/api/auth.py`
- `backend/app/models/user.py`
- `infrastructure/docker-compose.yml`

---

### Phase 2: AI Resume Studio (Week 3-4)

**Goal:** Upload, parse, ATS-score, and generate optimized resume versions.

| Task | Details |
|------|---------|
| Resume upload | PDF/DOCX parsing with OCR (pypdf2 + pytesseract) |
| ATS score engine | Keyword analysis against job description; layout scoring |
| Resume versioning | Store multiple versions; user can duplicate & edit |
| AI optimization | Prompt engineering: "Tailor this resume for {job_desc}" |
| PDF export | `react-native-html-to-pdf` on mobile; `weasyprint` on backend |
| Usage limits | Free: 10 generations/day; Pro: unlimited |

**Key files:**
- `mobile/app/(tabs)/resume.tsx`
- `mobile/app/generate/resume-version.tsx`
- `mobile/components/resume/` (ResumeUploader, AtsScoreCard)
- `backend/app/services/resume/parser.py`
- `backend/app/services/resume/ats_scorer.py`
- `backend/app/services/ai/resume_optimizer.py`
- `backend/app/api/resumes.py`

---

### Phase 3: AI Cover Letter & Cold Email (Week 5-6)

**Goal:** Generate tailored cover letters and recruiter emails.

| Task | Details |
|------|---------|
| Cover letter generator | Takes job desc + user resume + tone selector (professional, casual, enthusiastic) |
| Cold email generator | Takes company name, recruiter name (if known), job title; generates subject + body |
| Recruiter lookup | Use LinkedIn scraping / Clearbit API to find recruiter names |
| Email tracking | Embedded pixel for open tracking; webhook endpoint |
| Send email integration | SendGrid / Resend API |

**Key files:**
- `mobile/app/generate/cover-letter.tsx`
- `mobile/app/generate/cold-email.tsx`
- `mobile/components/ai/ToneSelector.tsx`
- `backend/app/services/ai/cover_letter.py`
- `backend/app/services/ai/cold_email.py`
- `backend/app/services/email/sender.py`
- `backend/app/services/email/tracking.py`

---

### Phase 4: Job Matching & Dashboard (Week 7-9)

**Goal:** Aggregate jobs from multiple platforms, match to user skills, display in a unified dashboard.

| Task | Details |
|------|---------|
| Job models | title, company, platform, url, salary, description, skills, location |
| Job aggregation | RSS feeds + Playwright for sites that allow it (focus on RemoteOK, We Work Remotely, Y Combinator via API) |
| For restricted sites | Provide "Add Manually" + bookmarklet; no automated scraping of LinkedIn/Indeed/Naukri |
| Semantic matching | Store job embeddings in pgvector; cosine similarity against user resume embedding |
| Match scoring | Skill overlap (60%) + experience level (20%) + salary range (20%) |
| Salary estimation | Use Glassdoor / Levels.fyi data + regression model |
| Dashboard feed | Infinite scroll job cards with match % badge |

**Key files:**
- `mobile/app/(tabs)/index.tsx` (job feed)
- `mobile/app/job/[id].tsx`
- `mobile/components/job/` (JobCard, MatchScoreBadge, SalaryBadge)
- `backend/app/services/jobs/aggregator.py`
- `backend/app/services/jobs/scrapers/` (remoteok, wwr, ycombinator)
- `backend/app/services/matching/skill_matcher.py`
- `backend/app/services/matching/embedder.py`
- `backend/app/api/jobs.py`

---

### Phase 5: Application Tracker (Week 10-11)

**Goal:** Track every application in one place with status, reminders, and follow-ups.

| Task | Details |
|------|---------|
| Application model | job_id, user_id, status (saved/applied/interviewing/offer/rejected), notes, date |
| Manual apply flow | User clicks "Apply" → app opens external URL → user marks as applied |
| Status updates | User manually updates status; push notifications for reminders |
| Follow-up reminders | "It's been 7 days — send a follow-up email?" |
| Kanban-style board | Optional view for pipeline overview |
| Usage limits check | Decrement generation quota on AI features |

**Key files:**
- `mobile/app/(tabs)/applications.tsx`
- `components/tracking/` (StatusBadge, FollowUpReminder, KanbanBoard)
- `backend/app/models/application.py`
- `backend/app/api/applications.py`
- `backend/app/tasks/reminders.py` (Celery beat: daily digest)

---

### Phase 6: AI Features Expansion (Week 12-14)

**Goal:** Mock interviews, skill-gap analysis, LinkedIn profile optimization.

| Task | Details |
|------|---------|
| Mock interview | AI asks questions based on job desc; user answers via text/voice; AI scores response |
| Skill-gap analysis | Compare user skills against target role requirements; suggest learning resources |
| LinkedIn optimizer | Analyze headline, about, experience sections; suggest rewrites |
| Job fit score | Aggregate ATS score + skill match + experience match into 0-100 score |
| Rate limiting | Redis-based sliding window per user per feature |

**Key files:**
- `mobile/app/(tabs)/profile.tsx` (skill gap, LinkedIn tips)
- `mobile/app/ai/mock-interview.tsx`
- `backend/app/services/ai/interview.py`
- `backend/app/services/ai/skill_gap.py`
- `backend/app/services/ai/linkedin_optimizer.py`

---

### Phase 7: Monetization & Polish (Week 15-16)

**Goal:** Stripe integration, analytics dashboard, performance optimization.

| Task | Details |
|------|---------|
| Stripe integration | Subscriptions (Free, Pro $9.99/mo, Team $29.99/mo) |
| Usage tracking | Track daily generations per user; reset at midnight UTC |
| Analytics | Dashboard showing applications/week, interview rate, top job sources |
| Push notifications | Firebase Cloud Messaging for reminders & job alerts |
| Performance | Image caching, lazy loading, pagination, DB query optimization |
| Offline support | AsyncStorage for cached job listings; queue AI requests |

**Key files:**
- `backend/app/api/payments.py` (Stripe webhooks)
- `backend/app/api/analytics.py`
- `backend/app/services/billing/`
- `mobile/services/notifications.ts` (Expo Notifications)
- `mobile/services/offline.ts` (NetInfo + queue)

---

## 3. AI Provider Strategy

Use **OpenAI GPT-4o** as primary (best quality). Fallback options:

| Provider | Use Case |
|----------|----------|
| OpenAI GPT-4o | Resume optimization, cover letters, cold emails, interview scoring |
| Gemini 1.5 Pro | Resume parsing (larger context for long docs) |
| Claude 3.5 Sonnet | LinkedIn optimization, tone-sensitive content |
| Local model (via Ollama) | Offline ATS scoring, keyword extraction |

**Implementation pattern:**

```python
# backend/app/services/ai/client.py
class AIClient:
    def __init__(self, provider: str = "openai"):
        self.provider = provider
        self.client = self._get_client()

    async def generate(self, prompt: str, system: str = "") -> str:
        if self.provider == "openai":
            return await self._openai(prompt, system)
        elif self.provider == "gemini":
            return await self._gemini(prompt, system)
        # ...
```

---

## 4. Database Schema (Core Tables)

```
users
  id, email, password_hash, name, avatar_url, plan_tier,
  daily_usage_count, usage_reset_at, created_at, updated_at

resumes
  id, user_id, original_filename, file_url, parsed_text,
  ats_score, created_at

resume_versions
  id, resume_id, title, content, target_role, created_at

cover_letters
  id, user_id, job_id, company, tone, content, created_at

cold_emails
  id, user_id, job_id, recruiter_name, recruiter_email,
  subject, body, tracking_id, opened_at, created_at

jobs
  id, title, company, platform, url, salary_min, salary_max,
  currency, location, description, skills, embeddings, posted_at,
  created_at

applications
  id, user_id, job_id, status, notes, applied_at,
  follow_up_at, created_at, updated_at

skill_gap_analyses
  id, user_id, target_role, current_skills, missing_skills,
  recommendations, created_at

mock_interviews
  id, user_id, job_id, questions, answers, scores,
  overall_score, created_at

usage_logs
  id, user_id, feature, timestamp
```

---

## 5. External Integrations

| Service | Purpose | Cost |
|---------|---------|------|
| OpenAI API | AI generation | Pay-per-token |
| PGVector | Semantic job matching | Free (PostgreSQL extension) |
| SendGrid / Resend | Send emails | Free tier available |
| Stripe | Subscriptions | 2.9% + $0.30 |
| Firebase Cloud Messaging | Push notifications | Free |
| Expo EAS | Build & deploy | Free tier |
| AWS S3 / Cloudinary | Resume file storage | Pay-per-GB |
| Clearbit (optional) | Recruiter name lookup | Free tier |

---

## 6. Safety & Compliance

- **No automated applying.** App opens external job URL; user manually completes and marks as applied.
- **Rate-limited AI.** Redis sliding window per user per feature.
- **Terms-aware.** Only aggregate jobs from sites that allow it in their ToS. For restricted sites, provide manual add.
- **Data privacy.** Resumes deleted upon account deletion. Encryption at rest.
- **GDPR ready.** Export user data endpoint. Account deletion with cascade.

---

## 7. Key UI/UX Decisions

- **Theme:** Dark mode first with light mode support (use `expo-system-ui` + `ColorSchemeContext`)
- **Navigation:** Bottom tabs (Dashboard, Applications, Resume, Profile) + stack screens for generation flows
- **Loading states:** Skeleton placeholders for job cards and resume analysis
- **Empty states:** Illustrations + CTA for each empty screen
- **AI generation:** Full-screen modal with streaming text effect
- **Match scores:** Circular progress indicator on job cards (0-100%)

---

## 8. First Build Order (for Claude)

1. **Scaffold** — `npx create-expo-app` + FastAPI project structure + Docker Compose
2. **Auth** — Login/Register screens + JWT backend + token storage
3. **UI Kit** — Shared components (Button, Card, Input, Badge, BottomSheet)
4. **Resume Upload** — File picker → backend parsing → ATS score display
5. **Resume Versioning** — "Create variant for {role}" → AI generation → stored
6. **Cover Letters** — Form (job desc + tone) → AI generation → copy/share
7. **Cold Emails** — Company name + optional recruiter → AI generation → send via SendGrid
8. **Job Feed** — Aggregated job list → match scoring → infinite scroll
9. **Application Tracker** — Manual apply flow → status updates → follow-up reminders
10. **AI Expansion** — Mock interviews, skill-gap analysis, LinkedIn optimization
11. **Monetization** — Stripe subscriptions + usage limits
12. **Polish** — Notifications, offline support, analytics dashboard

---

## 9. Reusable Prompts (for AI features)

### Resume Optimizer Prompt
```
You are an expert resume writer and ATS consultant. Given the following
resume content and job description, rewrite the resume to maximize ATS
score while keeping it truthful. Focus on:
1. Keyword alignment with job description
2. Quantifiable achievements
3. Strong action verbs
4. Role-appropriate formatting

Resume: {parsed_resume}
Job Description: {job_description}
Target Role: {role}
```

### Cover Letter Prompt
```
Write a professional cover letter for {company} for the role of {title}.
The tone should be {tone}. Use the candidate's resume below to highlight
relevant experience. Keep it to 3 paragraphs.
Resume: {parsed_resume}
```

### Cold Email Prompt
```
Write a cold email to a recruiter at {company} regarding the {title}
position. Address the recruiter by name if provided. Keep it concise
(150 words max), professional, and include a clear call to action.
Recruiter Name: {recruiter_name}
Candidate Resume: {parsed_resume}
```
