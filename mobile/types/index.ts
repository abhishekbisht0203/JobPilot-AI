export interface UserProfile {
  bio?: string;
  headline?: string;
  skills?: string[];
  resume?: string;
  resumeOriginalName?: string;
  profilePhoto?: string;
  dateOfBirth?: string;
  gender?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  preferredJobRole?: string;
  preferredSalary?: string;
  employmentType?: string;
  workPreference?: string;
  certifications?: string;
  experience?: string;
  education?: string;
}

export interface UserRoles {
  jobSeeker: boolean;
  recruiter: boolean;
}

export interface User {
  _id: string;
  id: string;
  email: string;
  fullname?: string;
  name?: string;
  phoneNumber?: string;
  avatar_url?: string;
  profile?: UserProfile;
  profilePhoto?: string;
  roles?: UserRoles;
  currentRole?: string;
  profileCompleted?: boolean;
  plan_tier?: string;
  daily_usage_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Job {
  _id: string;
  id: string;
  title: string;
  company: string;
  platform: string;
  url: string;
  description: string;
  skills: string[];
  location?: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  match_score?: number;
  posted_at?: string;
  created_at?: string;
}

export interface Company {
  _id?: string;
  id: string;
  name: string;
  industry: string;
  description: string;
  open_jobs_count: number;
  locations: string[];
  skills: string[];
  employees_count?: number;
  rating?: number;
  jobs?: Job[];
}

export interface Resume {
  _id: string;
  id: string;
  original_filename: string;
  file_url?: string;
  parsed_text?: string;
  ats_score?: number;
  created_at?: string;
}

export interface Application {
  _id: string;
  id: string;
  job_id: string;
  status: string;
  notes?: string;
  applied_at?: string;
  follow_up_at?: string;
  created_at?: string;
  updated_at?: string;
  job?: Job;
}

export interface ApplicationStats {
  saved: number;
  applied: number;
  interviewing: number;
  offer: number;
  rejected: number;
  total: number;
}

export interface Notification {
  _id: string;
  id: string;
  type: string;
  title: string;
  body: string;
  message?: string;
  read: boolean;
  data?: any;
  created_at: string;
}

export interface SavedJob {
  _id: string;
  id: string;
  userId: string;
  jobId: string;
  job?: Job;
  createdAt: string;
}

export interface Resource {
  _id: string;
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  type?: string;
  category?: string;
  tags?: string[];
  image?: string;
  created_at?: string;
}

export interface CoverLetter {
  _id: string;
  id: string;
  company: string;
  job_title: string;
  tone: string;
  content: string;
  created_at?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages?: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface SubscriptionPlan {
  _id: string;
  id: string;
  name: string;
  tier: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  highlighted?: boolean;
}

export interface Message {
  _id: string;
  id: string;
  sender_id: string;
  sender_name?: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface ContactTicket {
  _id: string;
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at?: string;
}

export interface MockInterview {
  _id: string;
  id: string;
  questions: string[];
  answers?: string[];
  scores?: number[];
  overall_score?: number;
  created_at?: string;
}

export interface SkillGapAnalysis {
  _id: string;
  id: string;
  target_role: string;
  current_skills: string[];
  missing_skills: string[];
  recommendations: string[];
  created_at?: string;
}

export interface CareerTool {
  id?: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  route: string;
  status: 'available' | 'coming_soon' | 'premium';
}

export interface DashboardData {
  totalApplications?: number;
  weeklyApplications?: number;
  interviewsScheduled?: number;
  offersReceived?: number;
  responseRate?: number;
  resumeScore?: number;
  profileCompletion?: number;
}
