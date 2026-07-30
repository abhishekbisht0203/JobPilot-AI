import { useMemo, useCallback, useState } from 'react';
import { useSavedJobsStore } from '../store';
import { savedJobApi } from './api';

export function useSavedJobs() {
  const savedIds = useSavedJobsStore((s) => s.savedIds);
  const toggleSave = useSavedJobsStore((s) => s.toggleSave);
  const isSavedCheck = useSavedJobsStore((s) => s.isSaved);
  const [loadingSavedJobs, setLoadingSavedJobs] = useState(false);

  const savedJobs: any[] = [];

  const isSaved = useCallback((id: string) => isSavedCheck(id), [isSavedCheck]);

  const handleToggleSaved = useCallback(
    async (jobId: string, currentlySaved?: boolean) => {
      const isCurrently = currentlySaved ?? savedIds.includes(jobId);
      toggleSave(jobId);

      try {
        if (isCurrently) {
          await savedJobApi.remove(jobId);
        } else {
          await savedJobApi.save(jobId);
        }
      } catch {
        toggleSave(jobId);
      }
    },
    [savedIds, toggleSave]
  );

  const loadSavedJobs = useCallback(async () => {
    try {
      setLoadingSavedJobs(true);
      const res = await savedJobApi.list();
      const data = res.data;
      const items = data.data || data.savedJobs || data || [];
      const ids = items.map((item: any) =>
        typeof item === 'string' ? item : item.jobId || item.job?._id || item.job?.id
      ).filter(Boolean);
      ids.forEach((id: string) => {
        if (!savedIds.includes(id)) toggleSave(id);
      });
    } catch {} finally {
      setLoadingSavedJobs(false);
    }
  }, [savedIds, toggleSave]);

  return {
    savedJobs,
    savedIds,
    isSaved,
    toggleSave: handleToggleSaved,
    count: savedIds.length,
    loadingSavedJobs,
    loadSavedJobs,
    handleToggleSaved,
  };
}
