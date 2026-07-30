# JobPilot Ai — Full App Documentation for React Native Recreation

## 1. Tech Stack Used

- **Frontend**: Vite + React 18 + Tailwind CSS 3 + framer-motion
- **State**: Redux Toolkit + redux-persist (blacklists `job` slice)
- **Routing**: React Router v6 with lazy loading + AnimatePresence
- **Backend**: Express.js + MongoDB (Mongoose) + Passport.js (Google/GitHub OAuth)
- **UI Library**: shadcn/ui (button, badge, avatar, popover, input components)
- **HTTP**: axios with `withCredentials: true`
- **Theming**: next-themes (dark/light)
- **Notifications**: sonner (toast)
- **Styling**: CSS utility classes like `card-shadow`, `card-shadow-hover`, `btn-primary`, `btn-secondary`, `bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`

---

## 2. Color Palette & Theming

### Light Mode (default)
- Background page: `#F3F2EF`
- Cards/white surfaces: `#FFFFFF`
- Primary brand: `#0A66C2` (LinkedIn blue)
- Primary hover: `#004182`
- Text primary: `#111827` (gray-900)
- Text secondary: `#6B7280` (gray-500)
- Borders: `#E5E7EB` (gray-200)
- Gradients: `from-[#0A66C2] to-[#2563EB]`
- Dark sections (Footer): `#1D2226`

### Dark Mode
- Page: `#0D1117` or `#030712` (gray-950)
- Cards: `#111827` (gray-900) or `#161B22`
- Primary brand: `#2F81F7`
- Text primary: `#F3F4F6` (gray-100)
- Text secondary: `#9CA3AF` (gray-400)
- Borders: `#1F2937` (gray-800)
- Dark mode uses `dark:` Tailwind variants throughout

The theme toggle animates with a 180° rotate on the sun/moon icon via `next-themes`.

---

## 3. Navigation Structure

### Navbar (`components/shared/Navbar.jsx`)
- **Position**: sticky top-0, z-50
- **With scroll**: shrinks from `h-16` to `h-14` at scrollY > 100, adds backdrop-blur-md bg-white/80
- **Logo**: `/logo.png` (40×40) + "JobPilot Ai" text
- **Desktop Nav (md+)**: 
  - **Guest (no user)**: Home, Find Jobs, Browse Companies, Career Tools (dropdown), Resources (dropdown), Pricing, About, Contact, Login button, Signup button
  - **Logged-in Job Seeker**: same as guest + avatar dropdown (View Profile, Saved Jobs, Logout)
  - **Recruiter mode**: Companies, My Jobs, Questions, Templates (admin links replace main nav)
  - **Dual-role user**: Role toggle pills (Job Seeker / Recruiter) with `dispatch(setCurrentRole(...))` shown in navbar
- **Mobile Nav (md-)**: slide-in drawer from right (w-72, spring animation). Contains same links grouped. Overlay backdrop black/50.
- **Dropdown menus**: Career Tools (6 items) and Resources (5 items) with chevron rotation, click-outside-to-close behavior
- **Theme toggle button** with rotation animation
- **Logout**: GET `/api/v1/user/logout` → dispatch clearAuth → navigate "/"

### Navigation Links
| Name | Path | Icon (lucide) |
|---|---|---|
| Home | `/` | — |
| Find Jobs | `/jobs` | — |
| Browse Companies | `/browse-companies` | — |
| Pricing | `/pricing` | CreditCard |
| About | `/about` | Info |
| Contact | `/contact` | Mail |
| AI Resume Builder | `/ai-resume` | Sparkles |
| Cover Letter | `/cover-letter` | PenTool |
| Mock Interview | `/mock-interview` | Video |
| Salary Explorer | `/salary-explorer` | DollarSign |
| Career Roadmap | `/career-roadmap` | Route |
| Resume Checker | `/resume-checker` | Search |
| Blogs | `/blogs` | BookOpen |
| Interview Questions | `/interview-questions` | Brain |
| Resume Templates | `/resume-templates` | FileText |
| Career Guides | `/career-guides` | Star |
| Help Center | `/help-center` | HelpCircle |

### Footer (`components/shared/Footer.jsx`)
- Dark bg `#1D2226`, 5-column grid: Brand (logo + description + social icons), Quick Links, Career Tools, Resources, For Employers
- Social icons: Facebook, Twitter, LinkedIn, GitHub (lucide icons, `#` hrefs)
- Bottom bar: copyright + Privacy Policy + Terms of Service links

---

## 4. Full Routing Table (App.jsx)

All routes wrapped in `<AnimatePresence mode="wait">` with page transitions (opacity 0→1, y 12→0, 0.3s tween).

| Path | Component | Auth? | Lazy? | Notes |
|---|---|---|---|---|
| `/` | Home | No | No | Full landing page |
| `/login` | Login | No | No | Redirect param support |
| `/signup` | Signup | No | No | — |
| `/oauth/callback` | OAuthCallbackHandler | No | No | Token from ?token param → fetch profile → redirect |
| `/jobs` | Jobs | No | No | Full job listing with filters |
| `/browse` | Browse | No | No | Search results page |
| `/description/:id` | JobDescription | No | No | Job detail + apply |
| `/profile` | Profile | Yes | No | AuthGuard |
| `/saved-jobs` | SavedJobs | Yes | No | AuthGuard |
| `/browse-companies` | BrowseCompanies | No | No | Company directory |
| `/company/:id` | CompanyDetails | No | Yes | SuspenseWrapper |
| `/admin/companies` | Companies | Yes | No | AuthGuard |
| `/admin/companies/create` | CompanyCreate | Yes | No | AuthGuard |
| `/admin/companies/:id` | CompanySetup | Yes | No | AuthGuard |
| `/admin/jobs` | AdminJobs | Yes | No | AuthGuard |
| `/admin/jobs/create` | AdminJobCreate | Yes | No | AuthGuard |
| `/admin/jobs/:id` | AdminJobSetup | Yes | No | AuthGuard |
| `/admin/jobs/:id/applicants` | Applicants | Yes | No | AuthGuard |
| `/admin/questions` | AdminQuestions | Yes | No | AuthGuard |
| `/admin/resume-templates` | AdminResumeTemplates | Yes | No | AuthGuard |
| `/admin/blogs` | AdminBlogs | Yes | No | AuthGuard |
| `/admin/blogs/create` | AdminBlogCreate | Yes | No | AuthGuard |
| `/admin/blogs/:id` | AdminBlogEdit | Yes | No | AuthGuard |
| `/admin/career-guides` | AdminCareerGuides | Yes | Yes | AuthGuard |
| `/admin/career-guides/create` | AdminCareerGuideCreate | Yes | Yes | AuthGuard |
| `/ai-resume` | AiResume | Yes | Yes | AuthGuard |
| `/cover-letter` | CoverLetter | Yes | Yes | AuthGuard |
| `/mock-interview` | MockInterview | Yes | Yes | AuthGuard + `/results/:sessionId` |
| `/salary-explorer` | SalaryExplorer | Yes | Yes | AuthGuard |
| `/career-roadmap` | CareerRoadmap | Yes | Yes | AuthGuard |
| `/resume-checker` | ResumeChecker | Yes | Yes | AuthGuard |
| `/blogs` | Blogs | No | Yes | Public |
| `/blogs/:slug` | BlogDetail | No | Yes | Public |
| `/interview-questions` | InterviewQuestions | No | Yes | Public |
| `/interview-questions/:id` | QuestionDetail | No | Yes | Public |
| `/interview-questions/bookmarks` | QuestionBookmarks | Yes | Yes | AuthGuard |
| `/resume-templates` | ResumeTemplates | No | Yes | Public |
| `/career-guides` | CareerGuides | No | Yes | Public |
| `/career-guides/:slug` | CareerGuideDetail | No | Yes | Public |
| `/help-center` | HelpCenter | No | Yes | Public |
| `/pricing` | Pricing | No | Yes | Public |
| `/about` | About | No | Yes | Public |
| `/contact` | Contact | No | Yes | Public |
| `/privacy` | Privacy | No | Yes | Legal |
| `/terms` | Terms | No | Yes | Legal |
| `*` | NotFound | No | No | 404 catch-all |

### AuthGuard Component
- Reads `user` from Redux auth slice
- If no user, `<Navigate to="/login?redirect={currentPath}" />`
- Otherwise renders children

---

## 5. Redux Store

### Store Config (`store/store.js`)
- `combineReducers({ auth, job, company, application })`
- `persistReducer` with `redux-persist` using localStorage
- `blacklist: ["job"]` — job slice is NOT persisted (fetched fresh)
- `serializableCheck` ignores persist action types

### authSlice (`store/slices/authSlice.js`)
```js
initialState: {
  loading: false,
  user: null,           // Full user object from backend
  token: localStorage.getItem("token") || null,
}
reducers: {
  setLoading, setUser, setToken,
  setCredentials: (state, { user, token }) => { saves token to localStorage },
  clearAuth: () => { removes token from localStorage },
  updateUser: merges payload into user,
  setCurrentRole: sets user.currentRole,
}
```

### jobSlice (`store/slices/jobSlice.js`)
```js
initialState: {
  allJobs: [],              // All fetched jobs
  allAdminJobs: [],         // Admin's posted jobs
  singleJob: null,          // Currently viewed job detail
  searchJobByText: "",      // Admin search filter
  allAppliedJobs: [],       // User's applied jobs
  searchedQuery: "",        // Current search query
}
```

### companySlice (`store/slices/companySlice.js`)
```js
initialState: {
  singleCompany: null,
  companies: [],
  searchCompanyByText: "",
}
```

### applicationSlice (`store/slices/applicationSlice.js`)
```js
initialState: {
  Applicants: [],           // Applicants for admin review
}
```

---

## 6. Custom Hooks

### `useGetAllJobs()`
- Fetches `GET /api/v1/job/get?keyword={searchedQuery}&limit=1000` with `withCredentials: true`
- On success dispatches `setAllJobs(jobs)`
- Re-fetches when `searchedQuery` changes
- Used on Home, Jobs, Browse pages

### `useGetAllAdminJobs()`
- Fetches `GET /api/v1/job/getadminjobs` → dispatches `setAllAdminJobs`

### `useGetAllCompanies()`
- Used in admin Companies page
- Fetches company list → dispatches `setCompanies`

### `useSavedJobs()`
```js
returns: { handleToggleSaved, loadingSavedJobs, loadSavedJobs, savedJobIds }
```
- On mount: GET `/api/v1/saved-jobs/me` → builds Set of saved job IDs
- `handleToggleSaved(jobId, currentlySaved)`:
  - Optimistically updates local Set
  - If currentlySaved → DELETE `/api/v1/saved-jobs/{jobId}`
  - If not saved → POST `/api/v1/saved-jobs/post` with `{ jobId }`
  - Reverts on error
- Used in Jobs, Browse, SavedJobs pages
- Shows toast error if not logged in, redirects to `/login`

### `useDebounce(value, delay)` — standard debounce hook

---

## 7. API Constants (`utils/constant.js`)

```js
BACKEND_URL = resolveBackendUrl()  // Env var → production "https://job-pilot-web-ovjk.onrender.com" | local "http://localhost:8000"
USER_API_END_POINT           = `${BACKEND_URL}/api/v1/user`
JOB_API_END_POINT            = `${BACKEND_URL}/api/v1/job`
APPLICATION_API_END_POINT    = `${BACKEND_URL}/api/v1/application`
COMPANY_API_END_POINT        = `${BACKEND_URL}/api/v1/company`
SAVED_JOB_API_END_POINT      = `${BACKEND_URL}/api/v1/saved-jobs`
RESUME_API_END_POINT         = `${BACKEND_URL}/api/v1/resumes`
COVER_LETTER_API_END_POINT   = `${BACKEND_URL}/api/v1/cover-letters`
INTERVIEW_API_END_POINT      = `${BACKEND_URL}/api/v1/interviews`
SALARY_API_END_POINT         = `${BACKEND_URL}/api/v1/salaries`
ROADMAP_API_END_POINT        = `${BACKEND_URL}/api/v1/roadmaps`
RESUME_CHECK_API_END_POINT   = `${BACKEND_URL}/api/v1/resume-check`
BLOG_API_END_POINT           = `${BACKEND_URL}/api/v1/blogs`
QUESTION_API_END_POINT       = `${BACKEND_URL}/api/v1/questions`
CAREER_GUIDE_API_END_POINT   = `${BACKEND_URL}/api/v1/career-guides`
RESUME_TEMPLATE_API_END_POINT = `${BACKEND_URL}/api/v1/resume-templates`
CONTACT_API_END_POINT        = `${BACKEND_URL}/api/v1/contact`
SUPPORT_TICKET_API_END_POINT = `${BACKEND_URL}/api/v1/support-tickets`
SUBSCRIPTION_API_END_POINT   = `${BACKEND_URL}/api/v1/subscriptions`
NOTIFICATION_API_END_POINT   = `${BACKEND_URL}/api/v1/notifications`
COMPANY_PROFILE_API_END_POINT = `${BACKEND_URL}/api/v1/company-profiles`
```

---

## 8. Authentication Flow

### Standard Login
1. User submits email + password → POST `/api/v1/user/login`
2. Backend returns `{ success, user, token, message }`
3. Frontend calls `dispatch(setCredentials({ user, token }))`
4. Token saved to localStorage, user to Redux persist
5. Redirects to `?redirect` param or "/"

### Standard Signup
1. POST `/api/v1/user/register` with `{ fullname, email, phoneNumber, password }`
2. Shows success toast, navigates to `/login` after 1.2s delay

### Social Login (Google/GitHub)
1. Click "Continue with Google" → `window.location.href = "${BACKEND_URL}/api/v1/user/google"`
2. Backend handles Passport.js OAuth flow, redirects back to `{FRONTEND_URL}/oauth/callback?token=xxx`
3. `OAuthCallbackHandler` component reads `?token`, stores it, fetches `/api/v1/user/profile`, dispatches `setCredentials`
4. If `user.profileCompleted === false` → redirect to `/profile`, else `/`
5. GitHub follows same pattern at `/api/v1/user/github`

### Logout
- GET `/api/v1/user/logout` → dispatch `clearAuth()` → navigate "/"

### Profile Update
- POST `/api/v1/user/updateprofile` (multipart/form-data via FormData)
- Sends all profile fields + optional profilePhoto + resume file
- Response: `{ success, user }` → dispatch `updateUser(user)`
- On page load: GET `/api/v1/user/profile` → dispatch `setUser(user)` to refresh from DB

### OAuth flow (express backend)
- Google OAuth `/auth/google` → redirects to Google → callback at `/auth/google/callback` → creates/updates user → generates JWT → redirects to `FRONTEND_URL/oauth/callback?token=JWT`
- GitHub OAuth follows same pattern

---

## 9. Common UI Patterns & Components

### Page Loaders
- `PageLoader` — full-page centered spinner with logo for lazy-loaded routes
- `LoadingSkeleton` — shimmer placeholder matching the content structure
- `JobSkeleton` — skeleton card matching Job component dimensions
- `CompanySkeleton` — skeleton card for company list

### Key Shared Components

**CompanyLogo** (`components/shared/CompanyLogo.jsx`)
- Props: `companyName`, `logo`, `className`
- Local SVGs from `/logos/{companyName.toLowerCase()}.svg` (31 company logos + default-company.svg)
- Falls back to default SVG on error via `onError`
- Styling: white bg, `rounded-xl`, light border, `p-1`, `object-contain`, `loading="lazy"`

**Badge** (`components/ui/badge.jsx`)
- Variants: default (gray), secondary, outline, destructive
- Used for job type, salary, location, skills, hiring status tags

**Button** (`components/ui/button.jsx`)
- Variants: default (primary blue), outline, ghost, secondary, destructive, link
- Sizes: default, sm, lg, icon
- `btn-primary` class: gradient from `#0A66C2` to `#2563EB`, white text, shadow
- `btn-secondary` class: light gray border, dark text

**Avatar** (`components/ui/avatar.jsx`)
- With AvatarImage + AvatarFallback
- Used in navbar user dropdown

**FilterCard** (`components/filters/FilterCard.jsx`)
- Collapsible sections: Location, Industry/Role, Salary Range, Experience Level
- Each section toggleable with chevron rotation
- Active filters shown as removable chips
- "Clear All" button (disabled when none active)
- Responsive: becomes overlay on mobile (lg: sticky sidebar, max-lg: fixed fullscreen)

**Hero Section** (`components/HeroSection.jsx`)
- Two-column layout: left has search inputs (title + location) + CTA buttons + stats counters + trusted companies
- Right column: SVG dashboard mockup + floating job cards with y-float animation
- Animated counters count up from 0 on mount

### Animation Patterns
- **Page transitions**: opacity 0→1, y 12→0, duration 0.3s, tween easeOut
- **Card stagger**: containerVariants with staggerChildren: 0.05, cardVariants with opacity + y + spring
- **Hover effects**: cards lift -1.5px to -6px, border color changes to primary, shadow increases
- **Fade-in sections**: initial opacity 0, y 10-20 → animate to visible
- **Floating elements**: infinite y oscillation 4-6s duration
- **Loading shimmer**: animated gradient across gray placeholder
- **AnimatePresence**: mode "wait" for routes, "popLayout" for saved jobs list

---

## 10. Customer-Facing Pages

### Home Page (`/`)
```
Layout: PageWrapper → motion.div
Sections:
1. Navbar (sticky)
2. HeroSection — dual search inputs, stats counters, SVG dashboard, floating job cards
3. CategoryCarousel — horizontal scrollable categories (icon + label + count)
4. PopularCompanies — grid of popular companies with logos
5. FeaturedJobs — grid of featured job cards
6. LatestJobs — grid of latest job cards
7. Testimonials — testimonial cards
8. Footer
Uses: useGetAllJobs() hook
```

### Jobs Page (`/jobs`)
```
Layout: PageWrapper
Top: Search form (title/location) with "Search" button + mobile filter toggle
Body: Two-column layout
  Left Sidebar (lg: sticky): FilterCard component with collapsible sections
  Right Main:
    - Results header: count + searched query indicator
    - Loading: 6x JobSkeleton
    - Empty: icon + "No jobs found" + Clear All button
    - Results: 3-column grid of Job cards (staggered spring animation)
    - Load More button (12 per page, shows remaining count)
Uses: useGetAllJobs(), useSavedJobs(), client-side filtering via useMemo
Filters: location, industry, salary range, experience level
```
- Salary ranges: 0-3, 3-6, 6-12, 12-20, 20+ LPA
- Experience mapping: Entry(≤1yr), Mid(2-4yr), Senior(5-8yr), Lead(8+yr)
- Pagination: "Load More" button, increments currentPage, shows JOBS_PER_PAGE=12 at a time

### Browse Page (`/browse`)
```
Layout: PageWrapper
Back button, Search form, results header
Loading → Empty → Results grid (3 cols)
Uses URL search params (?query=...), dispatches setSearchQuery
Results filtered client-side by title/description/location/company name
```

### Saved Jobs Page (`/saved-jobs`)
```
Layout: AuthGuard + PageWrapper
Greeting header (time-based: Good morning/afternoon/evening, {userName})
Stats row: 4 StatCard (Saved Jobs, Saved Today, Remote Jobs, Urgent)
Search + Filter + Sort + View toggle (grid/list) row
Sidebar (lg: fixed w-80): ProfileCompletionCard, ResumeScoreCard, QuickActionsCard, CareerTipsCard, RecentlyViewedCard
Main content: PremiumJobCard list (rich cards with match score, skills, badges, actions)
- Each card: company logo, verified badge, title, location, salary, job type, experience, skills (colored tags), match score bar, View Details / Remove / Share buttons
Empty state: Animated bookmark icon + "No saved jobs yet" + Browse Jobs CTA
Filters: all, remote, hybrid, onsite, fulltime, internship
Sort: recent, salary, experience
```
- Rich card with hover effects, gradient backgrounds, floating badges
- Skill tags color-cycled through 6 color schemes
- Match badge with animated progress bar
- Stats row with count-up animation
- Profile completion tracker on sidebar
- Quick actions grid: Upload Resume, Browse Jobs, Career Roadmap, Interview Prep

### Browse Companies Page (`/browse-companies`)
```
Layout: PageWrapper
Hero section: gradient blue bg, company count pill, title, search input, stats row
Body: Two-column
  Left sidebar (lg: w-64): FilterPanel (Industry, Hiring Status, Location, Salary Range, Min Rating)
  Right main:
    - Controls bar: result count, mobile filter button, grid/list toggle, sort dropdown
    - Mobile filter panel (collapsible, lg:hidden)
    - Loading/Empty states
    - Results: grid (2 cols) or list view
    - Infinite scroll via IntersectionObserver sentinel
Each company card: logo (h-16), name, industry, location, hiring badge, open job count, salary, tech stack tags, rating, growth score, hover arrow animation
Sort options: Most Jobs, Newest, Highest Rated, Highest Paying, Fastest Growing, Recently Active, Alphabetical
```

### Company Details Page (`/company/:id`)
```
Layout: PageWrapper
Back button
Hero banner: gradient blue, company logo (h-24), name, industry, location, joined date
Info badges: hiring status, open positions count, salary, company size, locations
Tab bar: About Us | Open Roles | Tech Stack | AI Insights
About tab: description, mission/vision, stats widgets, ratings (5 metrics), salary chart, salary percentiles, culture, benefits (with icon matching), locations, social links
Jobs tab: grid of Job cards for linked jobs
Tech Stack tab: technology badges, AI tech stack analysis
AI Insights tab: score gauges (Growth, Stability), hiring trend, velocity, insight cards (Salary Prediction, Competition Level, etc.), AI analysis explanation box
```

### Job Description Page (`/description/:id`)
```
Layout: PageWrapper
Back button, Two-column layout
Left column:
  - Job header: CompanyLogo (h-16), title, company name, bookmark + share buttons
  - Badges row: position count, job type, salary, location
  - Posted date + applicant count
  - Job Description section (whitespace-preserved)
  - Requirements (numbered list with blue circle numbers)
  - Responsibilities (with green check icons)
Right column (sticky):
  - Apply button (states: "Apply Now" → "Applied" green disabled)
  - Job Details sidebar: salary, experience, job type, location
  - Share this job section
  - Company sidebar: logo, name, industry, description
Related Jobs section at bottom (3 cards matching same title)
```

---

## 11. Authentication Pages

### Login Page (`/login`)
```
Layout: AuthLayout (centered card with logo)
Floating label inputs: Email + Password
Password show/hide toggle
"Sign in" button with loading spinner
"or continue with" divider + Google/GitHub social buttons
"Don't have an account?" → Sign Up link
Trust row: Secure Login, Google OAuth, GitHub OAuth, Encrypted Auth
Shake animation on validation error (key-based re-render)
Client-side validation: required fields, email format
```

### Signup Page (`/signup`)
```
Layout: AuthLayout
Floating label inputs: Full name, Email, Phone (optional), Password, Confirm Password
Password strength meter (5 segments): Weak → Fair → Good → Strong → Excellent
4 requirement checklist: 8+ chars, uppercase, number, special character (animated with checkmarks)
Passwords-match indicator
"Create account" button
"or sign up with" divider + Google/GitHub buttons
"Already have an account?" → Log In link
Same trust row as login
```

### AuthLayout (`components/auth/AuthLayout.jsx`)
- Centered card (max-w-md) with gradient background
- Logo at top + page title
- Background: radial gradient pattern with 24px dots

---

## 12. Profile Page (`/profile`)

```
Layout: PageWrapper → AuthGuard
Two-column: left sidebar (w-280) + right form
Left sidebar:
  - Photo upload (circular, camera overlay button)
  - Name + Headline
  - Profile completion bar with checklist: Basic Info, Photo, Role, Resume, Skills, Experience
  - Tab navigation: Personal Info | Role & Skills | Resume & Portfolio | Company (if recruiter)
Right form (changes by active tab):
  Personal Info: Full Name, Email, Phone, DOB, Gender, Location, Headline, Bio, Social Links (Website, LinkedIn, GitHub, Portfolio)
  Role & Skills: Role toggle (Job Seeker / Recruiter), Preferred Role/Salary/Employment/Work Type, Skills (comma-separated), Certifications, Experience (dynamic add/remove list with title, company, dates, current checkbox), Education (dynamic add/remove with degree, institution, field, dates, grade)
  Resume & Portfolio: PDF upload (drag-drop + click), current resume display with "View CV" link, Portfolio/GitHub/Certifications
  Company (recruiter): Company Name, Designation, Company Email, Website, Size, Industry. Verification status banner (pending/verified/rejected)
Save button at bottom with loading spinner
Data: fetched fresh from GET /api/v1/user/profile on mount
Submission: POST /api/v1/user/updateprofile (multipart FormData)
```

---

## 13. Admin Pages

### Admin Companies (`/admin/companies`)
- Search input + "New Company" button
- CompanyTable component showing all registered companies
- Each row: logo, name, date, actions (edit/delete)

### Admin Company Create (`/admin/companies/create`)
- Form: name, description, website, location, file upload for logo

### Admin Company Setup (`/admin/companies/:id`)
- Update existing company details

### Admin Jobs (`/admin/jobs`)
- Search + "New Job" button
- AdminJobsTable: title, company, created date, status, applicants count, actions

### Admin Job Create (`/admin/jobs/create`)
- Full job posting form: title, description, requirements, responsibilities, salary, type, location, company, etc.

### Admin Applicants (`/admin/jobs/:id/applicants`)
- List of applicants for a specific job
- Status update: pending → reviewed → interviewing → accepted/rejected/hired

### Admin Blogs (`/admin/blogs`)
- Blog list with create/edit/delete

### Admin Questions (`/admin/questions`)
- Interview question management
- Admin Resume Templates, Career Guides, etc.

---

## 14. Career Tools Pages (all lazy-loaded, auth-guarded)

### AI Resume Builder (`/ai-resume`)
- Rich resume builder with templates, sections, drag-and-drop
- ATS scoring, suggestions, improvements

### Cover Letter Generator (`/cover-letter`)
- AI-powered cover letter creation
- Recipient, company, job title inputs → generated content

### Mock Interview (`/mock-interview`)
- Category selection → timed interview with questions
- Audio recording, scoring, feedback
- Results page at `/mock-interview/results/:sessionId`

### Salary Explorer (`/salary-explorer`)
- Search roles + locations → salary data
- Charts, percentiles, company comparisons

### Career Roadmap (`/career-roadmap`)
- Current role → target role → generated step-by-step plan
- Skill gap analysis, weekly plan, resources
- AI mentor chat, resume integration

### Resume Checker (`/resume-checker`)
- Upload resume → ATS analysis, grammar check, keyword analysis
- Detailed feedback per section, improved version

---

## 15. Content Pages (public, lazy-loaded)

- **Blogs** (`/blogs`) — list with categories, search, trending, featured
- **Blog Detail** (`/blogs/:slug`) — full content, likes, bookmarks, comments
- **Interview Questions** (`/interview-questions`) — categories, difficulty, company filter
- **Question Detail** (`/interview-questions/:id`) — question + answer + explanation
- **Question Bookmarks** (`/interview-questions/bookmarks`) — auth-guarded
- **Resume Templates** (`/resume-templates`) — gallery with categories, preview
- **Career Guides** (`/career-guides`) — categorized guides list
- **Career Guide Detail** (`/career-guides/:slug`) — full guide content
- **Help Center** (`/help-center`) — FAQ, support resources
- **Pricing** (`/pricing`) — subscription plans comparison
- **About** (`/about`) — company info
- **Contact** (`/contact`) — contact form
- **Privacy** (`/privacy`) — privacy policy
- **Terms** (`/terms`) — terms of service
- **NotFound** (`*`) — 404 page

---

## 16. Job Card Component (`components/job/Job.jsx`)

```jsx
Props: { job, isSaved, onToggleSaved }
```
- CompanyLogo (h-12 w-12 lg:h-14 lg:w-14), company name, location with MapPin icon
- Posted date (days ago calculation)
- Job title
- Description (line-clamp-2)
- Badges: position count, jobType, salary LPA
- Footer: "View Details" button → `/description/${job._id}`, Bookmark toggle
- Hover: lift -1.5px, border `#0A66C2`, card-shadow-hover
- Bookmark: filled blue if saved

---

## 17. Company Logo System

- **31 local SVG files** in `/public/logos/` (google, microsoft, amazon, meta, netflix, spotify, uber, airbnb, linkedin, twitter, salesforce, oracle, ibm, adobe, apple, stripe, shopify, paypal, slack, github, zoom, dropbox, pinterest, snapchat, twilio, atlassian, notion, figma, vercel, docker, + default-company)
- **Mapping function** `getCompanyLogo(companyName)` in `lib/companyLogo.js`:
  - Takes company name, lowercases, removes special chars, tries to match
  - Returns `/logos/{matched}.svg` or `/logos/default-company.svg`
- **CompanyLogo component** renders `<img>` with the mapped path, onError fallback to default
- Also accepts a `logo` prop (URL from backend) which takes priority over local mapping

---

## 18. Dark Mode Implementation

- Uses `next-themes` `ThemeProvider` wrapping the app
- `useTheme()` hook returns `{ theme, setTheme }`
- All components use Tailwind `dark:` variants:
  - Backgrounds: `dark:bg-gray-950`, `dark:bg-[#0D1117]`, `dark:bg-[#161B22]`
  - Cards: `dark:bg-gray-900`, `dark:border-gray-800`
  - Text: `dark:text-white`, `dark:text-gray-300`, `dark:text-gray-400`
  - Inputs: `dark:bg-[#161B22]`, `dark:border-gray-700`
- Theme toggle button in Navbar: sun/moon icon with rotate animation
- Persisted in localStorage via next-themes

---

## 19. Backend Models Summary (for React Native API integration)

| Model | Key Fields |
|---|---|
| User | fullname, email, phoneNumber, password (hashed), roles{jobSeeker, recruiter}, profile{skills[], experience[], education[], resume, profilePhoto, headline, location, ...}, currentRole |
| Job | title, description, requirements[], responsibilities[], salary, experienceLevel, location, jobType, workType, position, company (ref), isActive, featured, trending, applications[] (ref), aiMatch, source |
| Company | name, description, website, location, logo, userId |
| Application | job (ref), applicant (ref), status (pending/reviewed/interviewing/accepted/rejected/hired) |
| SavedJob | userId, jobId (unique compound) |
| CompanyProfile | name, description, logo, industry, companySize, headquarters, techStack[], locations[], ratings{}, salaries{}, hiringStatus, aiInsights{}, linkedJobs[] |

---

## 20. Key Patterns to Note

1. **No direct third-party API calls from frontend** — all data comes through backend
2. **withCredentials: true** on all axios calls for cookie-based auth
3. **Redux persist** keeps auth state across refreshes, but job data is re-fetched
4. **Blacklisted job slice** from persist because it's large and changes frequently
5. **Optimistic updates** — saved jobs toggle updates UI immediately, reverts on error
6. **Client-side filtering** on Jobs page (location, industry, salary, experience) from allJobs[]
7. **Server-side pagination/search** on BrowseCompanies page
8. **IntersectionObserver** for infinite scroll on BrowseCompanies
9. **Lazy loading** for career tools, content pages, company details
10. **Login-only features** protected by AuthGuard component
11. **Dual-role support** — users can be both jobSeeker + recruiter, toggled via Navbar pills
12. **Local SVG logos** stored in public folder, mapped via company name normalization
13. **Toast notifications** via sonner for success/error feedback
14. **FormData + multipart** for profile updates with file uploads
