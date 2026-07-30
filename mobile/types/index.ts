export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  plan_tier: 'free' | 'pro' | 'team';
  daily_usage_count: number;
  usage_reset_at: string;
  created_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  original_filename: string;
  file_url: string;
  parsed_text: string;
  ats_score: number;
  created_at: string;
}

export interface ResumeVersion {
  id: string;
  resume_id: string;
  title: string;
  content: string;
  target_role: string;
  created_at: string;
}

export interface CoverLetter {
  id: string;
  user_id: string;
  job_id?: string;
  company: string;
  job_title: string;
  tone: 'professional' | 'casual' | 'enthusiastic';
  content: string;
  created_at: string;
}

export interface ColdEmail {
  id: string;
  user_id: string;
  job_id?: string;
  recruiter_name?: string;
  recruiter_email?: string;
  company: string;
  subject: string;
  body: string;
  tracking_id: string;
  opened_at?: string;
  created_at: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  platform: string;
  url: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  location?: string;
  description: string;
  skills: string[];
  match_score?: number;
  posted_at: string;
  created_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  job_id: string;
  job?: Job;
  status: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected';
  notes?: string;
  applied_at?: string;
  follow_up_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SkillGapAnalysis {
  id: string;
  target_role: string;
  current_skills: string[];
  missing_skills: string[];
  recommendations: string[];
  created_at: string;
}

export interface MockInterview {
  id: string;
  job_id?: string;
  questions: string[];
  answers: string[];
  scores: number[];
  overall_score: number;
  created_at: string;
}

export interface JobFitScore {
  overall: number;
  ats_score: number;
  skill_match: number;
  experience_match: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  cover_url?: string;
  industry?: string;
  description?: string;
  location?: string;
  website?: string;
  size?: string;
  founded_year?: number;
  rating?: number;
  followers_count?: number;
  employees_count?: number;
  open_jobs_count?: number;
  benefits?: string[];
  tech_stack?: string[];
  hiring?: boolean;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'free' | 'pro' | 'enterprise';
  price_monthly: number;
  price_yearly: number;
  features: string[];
  highlighted?: boolean;
  popular?: boolean;
}

export interface ContactTicket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'closed' | 'pending';
  created_at: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'blog' | 'guide' | 'template' | 'question' | 'learning' | 'article' | 'help';
  content?: string;
  excerpt?: string;
  image_url?: string;
  author?: string;
  read_time?: string;
  tags?: string[];
  created_at: string;
}

export interface Notification {
  id: string;
  type: 'application' | 'interview' | 'message' | 'offer' | 'system' | 'reminder';
  title: string;
  body: string;
  read: boolean;
  data?: Record<string, any>;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface DashboardData {
  total_applications: number;
  weekly_applications: number;
  interviews_scheduled: number;
  offers_received: number;
  response_rate: number;
  resume_score: number;
  ats_score: number;
  profile_completion: number;
  current_streak: number;
  weekly_goal: number;
  weekly_progress: number;
  recently_viewed_jobs: Job[];
  recommended_jobs: Job[];
  featured_companies: Company[];
  upcoming_interviews: Application[];
  notifications_preview: Notification[];
  ai_suggestions: string[];
  job_categories: { name: string; count: number }[];
  application_stats: { status: string; count: number }[];
}

export interface CareerTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  route: string;
  status: 'available' | 'coming_soon' | 'premium';
}
