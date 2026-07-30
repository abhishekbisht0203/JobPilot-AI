import { useMemo, useCallback, useState } from 'react';
import { useJobStore } from '../store';
import { savedJobsApi } from './api';

export function useSavedJobs() {
  const jobs = useJobStore((s) => s.allJobs);
  const savedIds = useJobStore((s) => s.savedJobs);
  const toggleSaveJob = useJobStore((s) => s.toggleSaveJob);
  const [loadingSavedJobs, setLoadingSavedJobs] = useState(false);

  const savedJobs = useMemo(
    () => jobs.filter((j) => savedIds.includes(j.id)),
    [jobs, savedIds]
  );

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  const handleToggleSaved = useCallback(
    async (jobId: string, currentlySaved?: boolean) => {
      const isCurrently = currentlySaved ?? savedIds.includes(jobId);
      toggleSaveJob(jobId);

      try {
        if (isCurrently) {
          await savedJobsApi.remove(jobId);
        } else {
          await savedJobsApi.save(jobId);
        }
      } catch {
        toggleSaveJob(jobId);
      }
    },
    [savedIds, toggleSaveJob]
  );

  const loadSavedJobs = useCallback(async () => {
    try {
      setLoadingSavedJobs(true);
      const res = await savedJobsApi.list();
      const data = res.data;
      const items = data.data || data.savedJobs || data || [];
      const ids = items.map((item: any) =>
        typeof item === 'string' ? item : item.jobId || item.job?._id || item.job?.id
      ).filter(Boolean);
      ids.forEach((id: string) => {
        if (!savedIds.includes(id)) toggleSaveJob(id);
      });
    } catch {} finally {
      setLoadingSavedJobs(false);
    }
  }, [savedIds, toggleSaveJob]);

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
