import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import { User, Job, Company, ThemeMode } from '../types';

let storage: any;
try {
  if (Platform.OS === 'web') {
    storage = {
      getItem: async (key: string) => {
        try { return localStorage.getItem(key); } catch { return null; }
      },
      setItem: async (key: string, value: string) => {
        try { localStorage.setItem(key, value); } catch {}
      },
      removeItem: async (key: string) => {
        try { localStorage.removeItem(key); } catch {}
      },
    };
  } else {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    storage = AsyncStorage;
  }
} catch {
  storage = {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  };
}

// ─── AUTH STORE (matches frontend authSlice) ──────────────────────────
interface AuthState {
  loading: boolean;
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setLoading: (loading: boolean) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setCredentials: (payload: { user: User; token: string }) => void;
  clearAuth: () => void;
  updateUser: (partial: Partial<User>) => void;
  setCurrentRole: (role: 'jobSeeker' | 'recruiter') => void;
  logout: () => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      loading: false,
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,
      setLoading: (loading) => set({ loading }),
      setUser: (user) => set({ user, isAuthenticated: user !== null }),
      // Persistence to storage is handled entirely by the `persist` middleware
      // below via `partialize`. Do not hand-write a parallel 'token' key here
      // — that duplicate previously drifted out of sync with the real store.
      setToken: (token) => set({ token }),
      setCredentials: ({ user, token }) => set({ user, token, isAuthenticated: true, loading: false }),
      clearAuth: () => set({ user: null, token: null, isAuthenticated: false, loading: false }),
      updateUser: (partial) => set({ user: get().user ? { ...get().user!, ...partial } : null }),
      setCurrentRole: (currentRole) => set({ user: get().user ? { ...get().user!, currentRole } as any : null }),
      logout: () => set({ user: null, token: null, isAuthenticated: false, loading: false }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// ─── THEME STORE ──────────────────────────────────────────────────────
interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);

// ─── JOB STORE (matches frontend jobSlice) ────────────────────────────
interface JobState {
  allJobs: Job[];
  allAdminJobs: Job[];
  singleJob: Job | null;
  searchJobByText: string;
  allAppliedJobs: any[];
  searchedQuery: string;
  setAllJobs: (jobs: Job[]) => void;
  setAllAdminJobs: (jobs: Job[]) => void;
  setSingleJob: (job: Job | null) => void;
  setSearchJobByText: (text: string) => void;
  setAllAppliedJobs: (jobs: any[]) => void;
  setSearchedQuery: (query: string) => void;
}

export const useJobStore = create<JobState>()(
  persist(
    (set) => ({
      allJobs: [],
      allAdminJobs: [],
      singleJob: null,
      searchJobByText: '',
      allAppliedJobs: [],
      searchedQuery: '',
      setAllJobs: (allJobs) => set({ allJobs }),
      setAllAdminJobs: (allAdminJobs) => set({ allAdminJobs }),
      setSingleJob: (singleJob) => set({ singleJob }),
      setSearchJobByText: (searchJobByText) => set({ searchJobByText }),
      setAllAppliedJobs: (allAppliedJobs) => set({ allAppliedJobs }),
      setSearchedQuery: (searchedQuery) => set({ searchedQuery }),
    }),
    {
      name: 'jobs-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);

// ─── COMPANY STORE (matches frontend companySlice) ────────────────────
interface CompanyState {
  singleCompany: Company | null;
  companies: Company[];
  searchCompanyByText: string;
  setSingleCompany: (c: Company | null) => void;
  setCompanies: (c: Company[]) => void;
  setSearchCompanyByText: (t: string) => void;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      singleCompany: null,
      companies: [],
      searchCompanyByText: '',
      setSingleCompany: (singleCompany) => set({ singleCompany }),
      setCompanies: (companies) => set({ companies }),
      setSearchCompanyByText: (searchCompanyByText) => set({ searchCompanyByText }),
    }),
    {
      name: 'company-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);

// ─── APPLICATION STORE (matches frontend applicationSlice) ────────────
interface ApplicationState {
  applicants: any[];
  setApplicants: (a: any[]) => void;
}

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set) => ({
      applicants: [],
      setApplicants: (applicants) => set({ applicants }),
    }),
    {
      name: 'application-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);

// ─── APP STORE (misc app state) ───────────────────────────────────────
interface AppState {
  isOnline: boolean;
  generationLoading: boolean;
  setOnline: () => void;
  setGenerationLoading: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOnline: true,
  generationLoading: false,
  setOnline: () => set({ isOnline: true }),
  setGenerationLoading: (v) => set({ generationLoading: v }),
}));

// ─── DRAWER STORE ─────────────────────────────────────────────────────
interface DrawerState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useDrawerStore = create<DrawerState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));

// ─── DASHBOARD STORE ──────────────────────────────────────────────────
interface DashboardState {
  totalApplications: number;
  weeklyApplications: number;
  interviewsScheduled: number;
  offersReceived: number;
  responseRate: number;
  resumeScore: number;
  atsScore: number;
  profileCompletion: number;
  currentStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  loading: boolean;
  setDashboardData: (data: Partial<DashboardState>) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  totalApplications: 0,
  weeklyApplications: 0,
  interviewsScheduled: 0,
  offersReceived: 0,
  responseRate: 0,
  resumeScore: 0,
  atsScore: 0,
  profileCompletion: 0,
  currentStreak: 0,
  weeklyGoal: 10,
  weeklyProgress: 0,
  loading: true,
  setDashboardData: (data) => set((s) => ({ ...s, ...data, loading: false })),
}));

// ─── SAVED JOBS STORE (client-side for quick toggle) ──────────────────
interface SavedJobsState {
  savedIds: string[];
  toggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
  setSavedIds: (ids: string[]) => void;
}

export const useSavedJobsStore = create<SavedJobsState>()(
  persist(
    (set, get) => ({
      savedIds: [],
      toggleSave: (id) => set({ savedIds: get().savedIds.includes(id) ? get().savedIds.filter(i => i !== id) : [...get().savedIds, id] }),
      isSaved: (id) => get().savedIds.includes(id),
      setSavedIds: (savedIds) => set({ savedIds }),
    }),
    {
      name: 'saved-jobs-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);
