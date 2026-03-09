import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useSync(secretKey, subjects, sessions, tasks, setSubjects, setSessions, setTasks) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [error, setError] = useState(null);

  const syncToCloud = useCallback(async () => {
    if (!supabase) {
      setError("Cloud sync is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }
    if (!secretKey) {
      setError("Please set a secret key first.");
      return;
    }

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
      setError(err.message || "An unknown error occurred during cloud backup.");
    } finally {
      setIsSyncing(false);
    }
  }, [secretKey, subjects, sessions, tasks]);

  const syncFromCloud = useCallback(async () => {
    if (!supabase) {
      setError("Cloud sync is not configured.");
      return;
    }
    if (!secretKey) {
      setError("Please set a secret key first.");
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('study_data')
        .select('*')
        .eq('secret_key', secretKey)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError("No cloud backup found for this secret key.");
          return;
        }
        throw fetchError;
      }

      if (data) {
        if (Array.isArray(data.subjects)) setSubjects(data.subjects);
        if (Array.isArray(data.sessions)) setSessions(data.sessions);
        if (Array.isArray(data.tasks)) setTasks(data.tasks);
        setLastSynced(new Date(data.updated_at));
      }
    } catch (err) {
      console.error('Sync from cloud failed:', err);
      setError(err.message || "An unknown error occurred during restoration.");
    } finally {
      setIsSyncing(false);
    }
  }, [secretKey, setSubjects, setSessions, setTasks]);

  return { isSyncing, lastSynced, error, syncToCloud, syncFromCloud };
}
