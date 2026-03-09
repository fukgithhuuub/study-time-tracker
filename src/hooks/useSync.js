import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useSync(secretKey, subjects, sessions, tasks, setSubjects, setSessions, setTasks) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [error, setError] = useState(null);

  const syncToCloud = useCallback(async () => {
    if (!supabase || !secretKey) return;

    setIsSyncing(true);
    setError(null);

    try {
      const data = {
        secret_key: secretKey,
        subjects,
        sessions,
        tasks,
        updated_at: new Date().toISOString()
      };

      const { error: upsertError } = await supabase
        .from('study_data')
        .upsert(data, { onConflict: 'secret_key' });

      if (upsertError) throw upsertError;

      setLastSynced(new Date());
    } catch (err) {
      console.error('Sync to cloud failed:', err);
      setError(err.message);
    } finally {
      setIsSyncing(false);
    }
  }, [secretKey, subjects, sessions, tasks]);

  const syncFromCloud = useCallback(async () => {
    if (!supabase || !secretKey) return;

    setIsSyncing(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('study_data')
        .select('*')
        .eq('secret_key', secretKey)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (data) {
        if (data.subjects) setSubjects(data.subjects);
        if (data.sessions) setSessions(data.sessions);
        if (data.tasks) setTasks(data.tasks);
        setLastSynced(new Date(data.updated_at));
      }
    } catch (err) {
      console.error('Sync from cloud failed:', err);
      setError(err.message);
    } finally {
      setIsSyncing(false);
    }
  }, [secretKey, setSubjects, setSessions, setTasks]);

  return { isSyncing, lastSynced, error, syncToCloud, syncFromCloud };
}
