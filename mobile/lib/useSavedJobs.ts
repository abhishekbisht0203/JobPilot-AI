import { useMemo, useCallback } from 'react';
import { useJobStore } from '../store';
import { useJobStore as useJobStoreType } from '../store';

export function useSavedJobs() {
  const jobs = useJobStore((s) => s.jobs);
  const savedIds = useJobStore((s) => s.savedJobs);
  const toggleSaveJob = useJobStore((s) => s.toggleSaveJob);

  const savedJobs = useMemo(
    () => jobs.filter((j) => savedIds.includes(j.id)),
    [jobs, savedIds]
  );

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  const toggleSave = useCallback(
    (id: string) => {
      toggleSaveJob(id);
    },
    [toggleSaveJob]
  );

  return { savedJobs, savedIds, isSaved, toggleSave, count: savedIds.length };
}
