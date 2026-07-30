import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { useAuthStore } from '../store';
import { API_URL, API_TIMEOUT, API_RETRY_COUNT, API_RETRY_DELAY } from './config';

const log = (label: string, data: any) => {
  if (__DEV__) {
    console.log(`[API][${label}]`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  }
};

log('INIT', { apiUrl: API_URL, platform: Platform.OS, timeout: API_TIMEOUT });

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    log('REQUEST', {
      method: config.method?.toUpperCase(),
      url: config.baseURL ? `${config.baseURL}${config.url}` : config.url,
      platform: Platform.OS,
    });
    return config;
  },
  (error) => Promise.reject(error)
);

let isLoggingOut = false;

api.interceptors.response.use(
  (response) => {
    log('RESPONSE', {
      status: response.status,
      url: `${response.config.baseURL}${response.config.url}`,
    });
    return response;
  },
  async (error: AxiosError<{ detail?: string; error?: string; message?: string }>) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

    if (error.response) {
      const data = error.response.data;
      const backendMsg = data?.detail || data?.error || data?.message || '';
      const status = error.response.status;

      log('RESPONSE_ERROR', {
        status,
        url: `${config.baseURL}${config.url}`,
        body: data,
        message: backendMsg || error.message,
      });

      if (backendMsg) {
        error.message = backendMsg;
      }

      if (status === 401 && !isLoggingOut) {
        isLoggingOut = true;
        useAuthStore.getState().logout();
        setTimeout(() => { isLoggingOut = false; }, 2000);
      }
    } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network')) {
      log('NETWORK_ERROR', {
        url: `${config.baseURL}${config.url}`,
        platform: Platform.OS,
        apiUrl: API_URL,
      });

      if (config._retryCount === undefined) {
        config._retryCount = 0;
      }

      if (config._retryCount! < API_RETRY_COUNT) {
        config._retryCount! += 1;
        log('RETRY', { attempt: config._retryCount, url: `${config.baseURL}${config.url}` });
        await new Promise((r) => setTimeout(r, API_RETRY_DELAY * config._retryCount!));
        return api(config);
      }

      error.message = 'Cannot connect to server. Check if backend is running.';
    } else if (error.code === 'ECONNABORTED') {
      log('TIMEOUT', { url: `${config.baseURL}${config.url}`, timeout: API_TIMEOUT });
      error.message = 'Request timed out. Backend may be overloaded.';
    } else {
      log('UNKNOWN_ERROR', { code: error.code, message: error.message });
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
