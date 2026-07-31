import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { API_URL, API_TIMEOUT, API_RETRY_COUNT, API_RETRY_DELAY } from './config';

// Flip to true locally to see [API][...] request/response logs during debugging.
const API_DEBUG_LOGGING = false;

const log = (label: string, data: any) => {
  if (__DEV__ && API_DEBUG_LOGGING) {
    console.log(`[API][${label}]`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  }
};

log('INIT', { apiUrl: API_URL, platform: Platform.OS, timeout: API_TIMEOUT });

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Single source of truth: the Zustand auth store (persisted under the
    // 'auth-storage' key). Do not read a separately hand-maintained
    // localStorage key here — it drifts out of sync with the real store.
    let token: string | null = null;
    try {
      const { useAuthStore } = require('../store');
      token = useAuthStore.getState().token;
    } catch {}
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    log('REQUEST', { method: config.method?.toUpperCase(), url: `${config.baseURL}${config.url}` });
    return config;
  },
  (error) => Promise.reject(error)
);

let isLoggingOut = false;

api.interceptors.response.use(
  (response) => {
    log('RESPONSE', { status: response.status, url: `${response.config.baseURL}${response.config.url}` });
    return response;
  },
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

    if (error.response) {
      const data = error.response.data;
      const backendMsg = data?.message || data?.error || '';
      log('RESPONSE_ERROR', { status: error.response.status, url: `${config.baseURL}${config.url}`, message: backendMsg || error.message });

      if (backendMsg) error.message = backendMsg;

      if (error.response.status === 401 && !isLoggingOut) {
        isLoggingOut = true;
        try {
          const { useAuthStore } = require('../store');
          useAuthStore.getState().clearAuth();
        } catch {}
        setTimeout(() => { isLoggingOut = false; }, 2000);
      }
    } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network')) {
      log('NETWORK_ERROR', { url: `${config.baseURL}${config.url}`, apiUrl: API_URL });

      if (config._retryCount === undefined) config._retryCount = 0;

      if (config._retryCount! < API_RETRY_COUNT) {
        config._retryCount! += 1;
        await new Promise((r) => setTimeout(r, API_RETRY_DELAY * config._retryCount!));
        return api(config);
      }

      error.message = 'Cannot connect to server. Check if backend is running.';
    } else if (error.code === 'ECONNABORTED') {
      log('TIMEOUT', { url: `${config.baseURL}${config.url}` });
      error.message = 'Request timed out. Backend may be overloaded.';
    }

    return Promise.reject(error);
  }
);

// ─── AUTH (/api/v1/auth/*) ──────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; phoneNumber?: string }) =>
    api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};

// ─── BACKWARD-COMPATIBLE userApi (merges auth + user endpoints) ──────
export const userApi = {
  login: (email: string, password: string) => authApi.login(email, password),
  register: (data: { name: string; email: string; password: string; phoneNumber?: string }) =>
    authApi.register(data),
  getProfile: () => authApi.getProfile(),
  logout: () => authApi.logout(),
  forgotPassword: (email: string) => authApi.forgotPassword(email),
  resetPassword: (token: string, password: string) => authApi.resetPassword(token, password),
  updateProfile: (data: FormData) =>
    api.patch('/users/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateSettings: (data: Record<string, any>) =>
    api.patch('/users/notifications', data),
  updatePrivacy: (data: Record<string, any>) =>
    api.patch('/users/privacy', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/users/change-password', { currentPassword, newPassword }),
  deleteAccount: () => api.delete('/users/account'),
};

// ─── JOBS (/api/v1/jobs/*) ──────────────────────────────────────────────
export const jobApi = {
  list: (params?: { search?: string; page?: number; per_page?: number; platform?: string }) =>
    api.get('/jobs', { params }),
  search: (q: string) =>
    api.get('/jobs/search', { params: { q } }),
  get: (id: string) => api.get(`/jobs/${id}`),
  getMatchScore: (jobId: string, resumeId: string) =>
    api.post(`/jobs/${jobId}/match-score`, { resume_id: resumeId }),
};

// ─── COMPANIES (/api/v1/jobs/companies/*) ──────────────────────────────
export const companyApi = {
  list: (params?: { search?: string; page?: number; per_page?: number }) =>
    api.get('/jobs/companies', { params }),
  get: (name: string) => api.get(`/jobs/companies/${encodeURIComponent(name)}`),
};

// ─── APPLICATIONS (/api/v1/applications/*) ─────────────────────────────
export const applicationApi = {
  list: (params?: { status?: string; page?: number }) =>
    api.get('/applications', { params }),
  create: (data: { job_id: string; notes?: string }) =>
    api.post('/applications', data),
  update: (id: string, data: { status?: string; notes?: string }) =>
    api.patch(`/applications/${id}`, data),
  delete: (id: string) => api.delete(`/applications/${id}`),
  getStats: () => api.get('/applications/stats'),
};

// ─── RESUMES (/api/v1/resumes/*) ───────────────────────────────────────
export const resumeApi = {
  upload: (formData: FormData) =>
    api.post('/resumes/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  list: () => api.get('/resumes'),
  get: (id: string) => api.get(`/resumes/${id}`),
  delete: (id: string) => api.delete(`/resumes/${id}`),
  analyzeAts: (resumeId: string, jobDescription: string) =>
    api.post(`/resumes/${resumeId}/analyze-ats`, null, { params: { job_description: jobDescription } }),
  createVersion: (resumeId: string, data: { title: string; target_role: string }) =>
    api.post(`/resumes/${resumeId}/versions`, data),
  getVersions: (resumeId: string) => api.get(`/resumes/${resumeId}/versions`),
};

// ─── COVER LETTERS (/api/v1/cover-letters/*) ───────────────────────────
export const coverLetterApi = {
  generate: (data: { job_description: string; company: string; job_title: string; tone?: string; resume_id?: string }) =>
    api.post('/cover-letters/generate', data),
  list: () => api.get('/cover-letters'),
  get: (id: string) => api.get(`/cover-letters/${id}`),
  delete: (id: string) => api.delete(`/cover-letters/${id}`),
};

// ─── AI FEATURES (/api/v1/ai/*) ────────────────────────────────────────
export const aiApi = {
  mockInterview: (data: { job_description: string; job_id?: string }) =>
    api.post('/ai/mock-interview', data),
  skillGap: (data: { target_role: string; current_skills: string[] }) =>
    api.post('/ai/skill-gap', data),
  linkedinOptimize: (data: { profile_section: string; content: string }) =>
    api.post('/ai/linkedin-optimize', data),
};

// ─── ANALYTICS (/api/v1/analytics/*) ────────────────────────────────────
export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard'),
  usage: () => api.get('/analytics/usage'),
};

// ─── NOTIFICATIONS (/api/v1/notifications/*) ────────────────────────────
export const notificationApi = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get('/notifications', { params }),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};

// ─── CONTACT (/api/v1/contact/*) ────────────────────────────────────────
export const contactApi = {
  submit: (data: { name: string; email: string; subject: string; message: string; type?: string }) =>
    api.post('/contact', data),
  getTickets: () => api.get('/contact/tickets'),
};

// ─── MESSAGES (/api/v1/messages/*) ──────────────────────────────────────
export const messageApi = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get('/messages', { params }),
  send: (data: { recipient_id: string; content: string }) =>
    api.post('/messages', data),
};

// ─── SUBSCRIPTIONS (/api/v1/subscriptions/*) ────────────────────────────
export const subscriptionApi = {
  getPlans: () => api.get('/subscriptions/plans'),
  create: (data: { plan_id: string; interval: string }) =>
    api.post('/subscriptions', data),
  getCurrent: () => api.get('/subscriptions/current'),
  cancel: () => api.post('/subscriptions/cancel'),
};

// ─── SAVED JOBS (/api/v1/saved-jobs/*) ────────────────────────────────
export const savedJobApi = {
  list: () => api.get('/saved-jobs'),
  save: (jobId: string) => api.post('/saved-jobs', { job_id: jobId }),
  remove: (id: string) => api.delete(`/saved-jobs/${id}`),
};

// ─── COLD EMAILS (/api/v1/cold-emails/*) ────────────────────────────────
export const coldEmailApi = {
  generate: (data: { company: string; job_title: string; recruiter_name?: string; resume_id?: string }) =>
    api.post('/cold-emails/generate', data),
  list: () => api.get('/cold-emails'),
  get: (id: string) => api.get(`/cold-emails/${id}`),
  send: (id: string) => api.post(`/cold-emails/${id}/send`),
};

// ─── RESOURCES (/api/v1/resources/*) ────────────────────────────────────
export const resourceApi = {
  list: (params?: { type?: string; page?: number; per_page?: number }) =>
    api.get('/resources', { params }),
  get: (id: string) => api.get(`/resources/${id}`),
};

export default api;
