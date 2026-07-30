import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import { User, Job, ThemeMode } from '../types';

let storage: any;
try {
  if (Platform.OS === 'web') {
    storage = {
      getItem: (key: string) => {
        try { return Promise.resolve(localStorage.getItem(key)); }
        catch { return Promise.resolve(null); }
      },
      setItem: (key: string, value: string) => {
        try { localStorage.setItem(key, value); }
        catch {}
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        try { localStorage.removeItem(key); }
        catch {}
        return Promise.resolve();
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

interface AuthState {
  loading: boolean;
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setLoading: (loading: boolean) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setAuth: (user: User, token: string) => void;
  setCredentials: (payload: { user: User; token: string }) => void;
  clearAuth: () => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
  setCurrentRole: (role: 'jobSeeker' | 'recruiter') => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      loading: false,
      user: null,
      token: null,
      isAuthenticated: false,
      setLoading: (loading) => set({ loading }),
      setUser: (user) => set({ user, isAuthenticated: user !== null }),
      setToken: (token) => {
        if (Platform.OS === 'web' && token) localStorage.setItem('token', token);
        set({ token });
      },
      setAuth: (user, token) => {
        if (Platform.OS === 'web' && token) localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true, loading: false });
      },
      setCredentials: ({ user, token }) => {
        if (Platform.OS === 'web' && token) localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true, loading: false });
      },
      clearAuth: () => {
        if (Platform.OS === 'web') localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false, loading: false });
      },
      logout: () => {
        if (Platform.OS === 'web') localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false, loading: false });
      },
      updateUser: (partial) => set({ user: get().user ? { ...get().user!, ...partial } : null }),
      setCurrentRole: (currentRole) => set({ user: get().user ? { ...get().user!, currentRole } as any : null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);

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

interface AppState {
  isOnline: boolean;
  showGenerationModal: boolean;
  generationLoading: boolean;
  dailyTip: string;
  setOnline: () => void;
  setShowGenerationModal: (v: boolean) => void;
  setGenerationLoading: (v: boolean) => void;
  setDailyTip: (tip: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOnline: true,
  showGenerationModal: false,
  generationLoading: false,
  dailyTip: 'Upload your resume to get AI-powered job matching.',
  setOnline: () => set({ isOnline: true }),
  setShowGenerationModal: (v) => set({ showGenerationModal: v }),
  setGenerationLoading: (v) => set({ generationLoading: v }),
  setDailyTip: (tip) => set({ dailyTip: tip }),
}));

interface JobState {
  allJobs: Job[];
  allAdminJobs: Job[];
  singleJob: Job | null;
  searchJobByText: string;
  allAppliedJobs: any[];
  searchedQuery: string;
  savedJobs: string[];
  setAllJobs: (jobs: Job[]) => void;
  setAllAdminJobs: (jobs: Job[]) => void;
  setSingleJob: (job: Job | null) => void;
  setSearchJobByText: (text: string) => void;
  setAllAppliedJobs: (jobs: any[]) => void;
  setSearchedQuery: (query: string) => void;
  setJobs: (jobs: Job[]) => void;
  addJobs: (jobs: Job[]) => void;
  toggleSaveJob: (id: string) => void;
  isSaved: (id: string) => boolean;
}

export const useJobStore = create<JobState>()(
  persist(
    (set, get) => ({
      allJobs: [],
      allAdminJobs: [],
      singleJob: null,
      searchJobByText: '',
      allAppliedJobs: [],
      searchedQuery: '',
      savedJobs: [],
      setAllJobs: (allJobs) => set({ allJobs }),
      setAllAdminJobs: (allAdminJobs) => set({ allAdminJobs }),
      setSingleJob: (singleJob) => set({ singleJob }),
      setSearchJobByText: (searchJobByText) => set({ searchJobByText }),
      setAllAppliedJobs: (allAppliedJobs) => set({ allAppliedJobs }),
      setSearchedQuery: (searchedQuery) => set({ searchedQuery }),
      setJobs: (jobs) => set({ allJobs: jobs }),
      addJobs: (jobs) => set({ allJobs: [...get().allJobs, ...jobs] }),
      toggleSaveJob: (id) => {
        const saved = get().savedJobs;
        set({ savedJobs: saved.includes(id) ? saved.filter(j => j !== id) : [...saved, id] });
      },
      isSaved: (id) => get().savedJobs.includes(id),
    }),
    {
      name: 'jobs-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);

interface CompanyState {
  singleCompany: any | null;
  companies: any[];
  searchCompanyByText: string;
  setSingleCompany: (c: any | null) => void;
  setCompanies: (c: any[]) => void;
  setSearchCompanyByText: (t: string) => void;
}

export const useCompanyStore = create<CompanyState>((set) => ({
  singleCompany: null,
  companies: [],
  searchCompanyByText: '',
  setSingleCompany: (singleCompany) => set({ singleCompany }),
  setCompanies: (companies) => set({ companies }),
  setSearchCompanyByText: (searchCompanyByText) => set({ searchCompanyByText }),
}));

interface ApplicationState {
  applicants: any[];
  setApplicants: (a: any[]) => void;
}

export const useApplicationStore = create<ApplicationState>((set) => ({
  applicants: [],
  setApplicants: (applicants) => set({ applicants }),
}));

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
