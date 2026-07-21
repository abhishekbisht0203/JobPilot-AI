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
