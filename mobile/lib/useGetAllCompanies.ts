import { useState, useEffect, useCallback } from 'react';
import { useCompanyStore } from '../store';
import { companiesApi } from './api';

export function useGetAllCompanies() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { companies, setCompanies } = useCompanyStore();

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await companiesApi.list();
      const data = res.data;
      const items = data.data || data.companies || data || [];
      setCompanies(items);
    } catch (err: any) {
      setError(err?.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  }, [setCompanies]);

  useEffect(() => { fetch(); }, [fetch]);

  return { companies, loading, error, refetch: fetch };
}
