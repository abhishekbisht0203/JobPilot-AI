import { useState, useEffect, useCallback } from 'react';
import { jobApi } from './api';
import { useJobStore } from '../store';
import { Job } from '../types';

interface UseGetAllJobsOptions {
  page?: number;
  perPage?: number;
  search?: string;
  keyword?: string;
  platform?: string;
}

interface UseGetAllJobsResult {
  jobs: Job[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  fetchNextPage: () => void;
  hasMore: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

export function useGetAllJobs(options: UseGetAllJobsOptions = {}): UseGetAllJobsResult {
  const { page: initialPage = 1, perPage = 20, search, keyword } = options;
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const setAllJobs = useJobStore((s) => s.setAllJobs);
  const jobs = useJobStore((s) => s.allJobs);

  const fetchJobs = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      if (!append) setLoading(true);
      setError(null);
      const res = await jobApi.list({ page: pageNum, per_page: perPage, search: search || keyword });
      const data = res.data;
      const items: Job[] = data.data || data.jobs || data.items || data || [];
      const totalCount = data.total || items.length;
      const pages = data.total_pages || Math.ceil(totalCount / perPage);

      if (append) {
        const currentJobs = useJobStore.getState().allJobs;
        setAllJobs([...currentJobs, ...items]);
      } else {
        setAllJobs(items);
      }
      setTotal(totalCount);
      setTotalPages(pages || 1);
    } catch (err: any) {
      setError(err?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [perPage, search, keyword, setAllJobs]);

  useEffect(() => {
    fetchJobs(page, page > 1);
  }, [page]);

  const refetch = useCallback(() => {
    setPage(1);
    fetchJobs(1);
  }, [fetchJobs]);

  const fetchNextPage = useCallback(() => {
    if (!loading && page < totalPages) {
      setPage((p) => p + 1);
    }
  }, [loading, page, totalPages]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchJobs(1);
  }, [fetchJobs]);

  return {
    jobs,
    total,
    totalPages,
    loading,
    error,
    refetch,
    fetchNextPage,
    hasMore: page < totalPages,
    refreshing,
    onRefresh,
  };
}
