import { useState, useEffect, useCallback } from 'react';
import { useJobStore } from '../store';
import { jobApi } from './api';
import { Job } from '../types';

interface UseGetAllAdminJobsResult {
  adminJobs: Job[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useGetAllAdminJobs(): UseGetAllAdminJobsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { allAdminJobs, setAllAdminJobs } = useJobStore();

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await jobApi.list();
      const data = res.data;
      const jobs: Job[] = data.data || data.jobs || data || [];
      setAllAdminJobs(jobs);
    } catch (err: any) {
      setError(err?.message || 'Failed to load admin jobs');
    } finally {
      setLoading(false);
    }
  }, [setAllAdminJobs]);

  useEffect(() => { fetch(); }, [fetch]);

  return { adminJobs: allAdminJobs, loading, error, refetch: fetch };
}
