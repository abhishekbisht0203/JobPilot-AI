import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  googleAuth: (token: string) =>
    api.post('/auth/google', { token }),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.patch('/auth/profile', data),
};

export const resumeApi = {
  upload: (formData: FormData) =>
    api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  list: () => api.get('/resumes'),
  get: (id: string) => api.get(`/resumes/${id}`),
  getVersions: (resumeId: string) =>
    api.get(`/resumes/${resumeId}/versions`),
  createVersion: (resumeId: string, data: { title: string; target_role: string }) =>
    api.post(`/resumes/${resumeId}/versions`, data),
  delete: (id: string) => api.delete(`/resumes/${id}`),
  exportPdf: (versionId: string) =>
    api.get(`/resumes/versions/${versionId}/export`, {
      responseType: 'blob',
    }),
};

export const coverLetterApi = {
  generate: (data: { job_description: string; company: string; job_title: string; tone: string; resume_id?: string }) =>
    api.post('/cover-letters/generate', data),
  list: () => api.get('/cover-letters'),
  get: (id: string) => api.get(`/cover-letters/${id}`),
  delete: (id: string) => api.delete(`/cover-letters/${id}`),
};

export const emailApi = {
  generate: (data: { company: string; job_title: string; recruiter_name?: string; resume_id?: string }) =>
    api.post('/cold-emails/generate', data),
  send: (id: string) => api.post(`/cold-emails/${id}/send`),
  list: () => api.get('/cold-emails'),
  get: (id: string) => api.get(`/cold-emails/${id}`),
  getTrackingStats: () => api.get('/cold-emails/tracking-stats'),
};

export const jobsApi = {
  list: (params?: { page?: number; per_page?: number; search?: string; platform?: string }) =>
    api.get('/jobs', { params }),
  get: (id: string) => api.get(`/jobs/${id}`),
  getMatchScore: (jobId: string, resumeId: string) =>
    api.post(`/jobs/${jobId}/match-score`, { resume_id: resumeId }),
  search: (query: string) => api.get('/jobs/search', { params: { q: query } }),
};

export const applicationsApi = {
  list: (params?: { status?: string; page?: number }) =>
    api.get('/applications', { params }),
  create: (data: { job_id: string; notes?: string }) =>
    api.post('/applications', data),
  update: (id: string, data: { status?: string; notes?: string }) =>
    api.patch(`/applications/${id}`, data),
  delete: (id: string) => api.delete(`/applications/${id}`),
  getStats: () => api.get('/applications/stats'),
};

export const aiApi = {
  mockInterview: (data: { job_id?: string; job_description: string }) =>
    api.post('/ai/mock-interview', data),
  skillGap: (data: { target_role: string; current_skills: string[] }) =>
    api.post('/ai/skill-gap', data),
  linkedinOptimize: (data: { profile_section: string; content: string }) =>
    api.post('/ai/linkedin-optimize', data),
};

export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getUsage: () => api.get('/analytics/usage'),
};

export default api;
