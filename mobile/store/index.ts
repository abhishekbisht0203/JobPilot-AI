import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, ThemeMode, Job } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
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
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

interface AppState {
  isOnline: boolean;
  setOnline: (online: boolean) => void;
  showGenerationModal: boolean;
  setShowGenerationModal: (show: boolean) => void;
  generationLoading: boolean;
  setGenerationLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  isOnline: true,
  setOnline: (online) => set({ isOnline: online }),
  showGenerationModal: false,
  setShowGenerationModal: (show) => set({ showGenerationModal: show }),
  generationLoading: false,
  setGenerationLoading: (loading) => set({ generationLoading: loading }),
}));

interface JobState {
  jobs: Job[];
  savedJobs: string[];
  setJobs: (jobs: Job[]) => void;
  addJobs: (jobs: Job[]) => void;
  toggleSaveJob: (jobId: string) => void;
  isSaved: (jobId: string) => boolean;
}

export const useJobStore = create<JobState>()(
  persist(
    (set, get) => ({
      jobs: [],
      savedJobs: [],
      setJobs: (jobs) => set({ jobs }),
      addJobs: (newJobs) =>
        set((state) => ({ jobs: [...state.jobs, ...newJobs] })),
      toggleSaveJob: (jobId) =>
        set((state) => ({
          savedJobs: state.savedJobs.includes(jobId)
            ? state.savedJobs.filter((id) => id !== jobId)
            : [...state.savedJobs, jobId],
        })),
      isSaved: (jobId) => get().savedJobs.includes(jobId),
    }),
    {
      name: 'jobs-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
