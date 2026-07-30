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
  withCredentials: true,
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
    api.post('/user/login', { email, password }),
  register: (fullname: string, email: string, phoneNumber: string, password: string) =>
    api.post('/user/register', { fullname, email, phoneNumber, password }),
  googleAuth: () => { window.location.href = `${API_URL}/user/google`; },
  githubAuth: () => { window.location.href = `${API_URL}/user/github`; },
  getOAuthCallback: (token: string) => api.get('/user/profile', { headers: { Authorization: `Bearer ${token}` } }),
  forgotPassword: (email: string) =>
    api.post('/user/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/user/reset-password', { token, password }),
  getProfile: () => api.get('/user/profile'),
  updateProfile: (formData: FormData) =>
    api.post('/user/updateprofile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  logout: () => api.get('/user/logout'),
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
  list: (params?: { page?: number; per_page?: number; search?: string; keyword?: string; limit?: number }) =>
    api.get('/job/get', { params }),
  get: (id: string) => api.get(`/job/get/${id}`),
  getAdminJobs: (params?: { keyword?: string }) =>
    api.get('/job/getadminjobs', { params }),
  create: (data: any) => api.post('/job/post', data),
  update: (id: string, data: any) => api.put(`/job/update/${id}`, data),
  delete: (id: string) => api.delete(`/job/delete/${id}`),
  getMatchScore: (jobId: string, resumeId: string) =>
    api.post(`/job/${jobId}/match-score`, { resume_id: resumeId }),
  search: (query: string) => api.get('/job/search', { params: { q: query } }),
};

export const applicationsApi = {
  list: (params?: { status?: string; page?: number }) =>
    api.get('/application/get', { params }),
  getByJob: (jobId: string) => api.get(`/application/${jobId}/applicants`),
  create: (data: { job_id: string; notes?: string }) =>
    api.post('/application/post', data),
  update: (id: string, data: { status?: string; notes?: string }) =>
    api.put(`/application/update/${id}`, data),
  delete: (id: string) => api.delete(`/application/delete/${id}`),
  getStats: () => api.get('/application/stats'),
};

export const savedJobsApi = {
  list: () => api.get('/saved-jobs/me'),
  save: (jobId: string) => api.post('/saved-jobs/post', { jobId }),
  remove: (jobId: string) => api.delete(`/saved-jobs/${jobId}`),
};

export const companiesApi = {
  list: (params?: { page?: number; per_page?: number; search?: string; keyword?: string }) =>
    api.get('/company/get', { params }),
  get: (id: string) => api.get(`/company/get/${id}`),
  create: (data: any) => api.post('/company/post', data),
  update: (id: string, data: any) => api.put(`/company/update/${id}`, data),
  delete: (id: string) => api.delete(`/company/delete/${id}`),
};

export const companyProfileApi = {
  get: () => api.get('/company-profiles/me'),
  update: (data: any) => api.put('/company-profiles/update', data),
};

export const aiApi = {
  mockInterview: (data: { job_id?: string; job_description: string }) =>
    api.post('/interviews/generate', data),
  getInterviewResults: (sessionId: string) =>
    api.get(`/interviews/results/${sessionId}`),
  skillGap: (data: { target_role: string; current_skills: string[] }) =>
    api.post('/resume-check/skill-gap', data),
  linkedinOptimize: (data: { profile_section: string; content: string }) =>
    api.post('/resume-check/linkedin-optimize', data),
  salaryExplorer: (params: { role?: string; location?: string }) =>
    api.get('/salaries/explore', { params }),
  careerRoadmap: (data: { current_role: string; target_role: string }) =>
    api.post('/roadmaps/generate', data),
  resumeCheck: (formData: FormData) =>
    api.post('/resume-check/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getUsage: () => api.get('/analytics/usage'),
};

export const blogsApi = {
  list: (params?: { page?: number; per_page?: number; category?: string; search?: string }) =>
    api.get('/blogs', { params }),
  get: (slug: string) => api.get(`/blogs/${slug}`),
  create: (data: any) => api.post('/blogs', data),
  update: (id: string, data: any) => api.put(`/blogs/${id}`, data),
  delete: (id: string) => api.delete(`/blogs/${id}`),
  like: (id: string) => api.post(`/blogs/${id}/like`),
  bookmark: (id: string) => api.post(`/blogs/${id}/bookmark`),
  comment: (id: string, data: { text: string }) =>
    api.post(`/blogs/${id}/comments`, data),
};

export const questionsApi = {
  list: (params?: { page?: number; per_page?: number; category?: string; difficulty?: string; company?: string }) =>
    api.get('/questions', { params }),
  get: (id: string) => api.get(`/questions/${id}`),
  create: (data: any) => api.post('/questions', data),
  update: (id: string, data: any) => api.put(`/questions/${id}`, data),
  delete: (id: string) => api.delete(`/questions/${id}`),
  bookmark: (id: string) => api.post(`/questions/${id}/bookmark`),
  getBookmarks: () => api.get('/questions/bookmarks'),
};

export const careerGuidesApi = {
  list: (params?: { category?: string; page?: number }) =>
    api.get('/career-guides', { params }),
  get: (slug: string) => api.get(`/career-guides/${slug}`),
  create: (data: any) => api.post('/career-guides', data),
  update: (id: string, data: any) => api.put(`/career-guides/${id}`, data),
  delete: (id: string) => api.delete(`/career-guides/${id}`),
};

export const resumeTemplatesApi = {
  list: (params?: { category?: string }) =>
    api.get('/resume-templates', { params }),
  get: (id: string) => api.get(`/resume-templates/${id}`),
  create: (data: any) => api.post('/resume-templates', data),
  update: (id: string, data: any) => api.put(`/resume-templates/${id}`, data),
  delete: (id: string) => api.delete(`/resume-templates/${id}`),
};

export const notificationsApi = {
  list: (params?: { page?: number }) =>
    api.get('/notifications', { params }),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};

export const messagesApi = {
  list: (params?: { page?: number }) =>
    api.get('/messages', { params }),
  send: (data: { recipient_id: string; content: string }) =>
    api.post('/messages', data),
};

export const contactApi = {
  submit: (data: { name: string; email: string; subject: string; message: string; type?: string }) =>
    api.post('/contact', data),
  listTickets: () => api.get('/contact/tickets'),
};

export const supportTicketApi = {
  create: (data: { subject: string; message: string; priority?: string }) =>
    api.post('/support-tickets', data),
  list: () => api.get('/support-tickets'),
  get: (id: string) => api.get(`/support-tickets/${id}`),
};

export const subscriptionsApi = {
  getPlans: () => api.get('/subscriptions/plans'),
  subscribe: (planId: string, interval: 'monthly' | 'yearly') =>
    api.post('/subscriptions', { plan_id: planId, interval }),
  cancel: () => api.post('/subscriptions/cancel'),
  getCurrent: () => api.get('/subscriptions/current'),
};

export const settingsApi = {
  updateNotifications: (data: Record<string, boolean>) =>
    api.patch('/users/notifications', data),
  updatePassword: (currentPassword: string, newPassword: string) =>
    api.post('/user/change-password', { current_password: currentPassword, new_password: newPassword }),
  updatePrivacy: (data: Record<string, boolean>) =>
    api.patch('/users/privacy', data),
  deleteAccount: () => api.delete('/user/delete-account'),
};

export default api;
