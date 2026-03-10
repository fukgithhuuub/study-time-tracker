import { supabase } from '../lib/supabase';

// ============================================================
// Supabase Data Service
// All Supabase CRUD operations in one place.
// Each function takes userId (UUID) as first arg.
// ============================================================

// ─── Users ───────────────────────────────────────────────────

export async function findOrCreateUser(username, secretKey) {
    // Try to find existing user
    const { data: existing, error: findErr } = await supabase
        .from('sf_users')
        .select('*')
        .eq('username', username)
        .eq('secret_key', secretKey)
        .maybeSingle();

    if (findErr) throw new Error(`Supabase findUser: ${findErr.message}`);
    if (existing) return existing;

    // Create new user
    const { data: created, error: createErr } = await supabase
        .from('sf_users')
        .insert({ username, secret_key: secretKey })
        .select()
        .single();

    if (createErr) throw new Error(`Supabase createUser: ${createErr.message}`);
    return created;
}

export async function verifyUser(username, secretKey) {
    const { data, error } = await supabase
        .from('sf_users')
        .select('*')
        .eq('username', username)
        .eq('secret_key', secretKey)
        .maybeSingle();

    if (error) throw new Error(`Supabase verifyUser: ${error.message}`);
    return data; // null if not found
}

// ─── Sessions ────────────────────────────────────────────────

export async function fetchSessions(userId) {
    const { data, error } = await supabase
        .from('sf_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) throw new Error(`fetchSessions: ${error.message}`);
    // Map DB rows to app format
    return (data || []).map(row => ({
        id: row.id,
        subject: { id: row.subject_id, name: row.subject_name, color: row.subject_color },
        duration: row.duration,
        mode: row.mode,
        date: row.date,
    }));
}

export async function insertSession(userId, session) {
    const { error } = await supabase.from('sf_sessions').insert({
        id: session.id,
        user_id: userId,
        subject_id: session.subject?.id || 'uncategorized',
        subject_name: session.subject?.name || 'Uncategorized',
        subject_color: session.subject?.color || '#6366f1',
        duration: session.duration,
        mode: session.mode,
        date: session.date,
    });
    if (error) throw new Error(`insertSession: ${error.message}`);
}

export async function updateSession(userId, sessionId, updates) {
    const { error } = await supabase
        .from('sf_sessions')
        .update(updates)
        .eq('id', sessionId)
        .eq('user_id', userId);
    if (error) throw new Error(`updateSession: ${error.message}`);
}

export async function deleteSession(userId, sessionId) {
    const { error } = await supabase
        .from('sf_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId);
    if (error) throw new Error(`deleteSession: ${error.message}`);
}

// ─── Subjects ────────────────────────────────────────────────

export async function fetchSubjects(userId) {
    const { data, error } = await supabase
        .from('sf_subjects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

    if (error) throw new Error(`fetchSubjects: ${error.message}`);
    return (data || []).map(row => ({ id: row.id, name: row.name, color: row.color }));
}

export async function insertSubject(userId, subject) {
    const { error } = await supabase.from('sf_subjects').upsert({
        id: String(subject.id),
        user_id: userId,
        name: subject.name,
        color: subject.color || '#6366f1',
    }, { onConflict: 'id,user_id' });
    if (error) throw new Error(`insertSubject: ${error.message}`);
}

// ─── Tasks ───────────────────────────────────────────────────

export async function fetchTasks(userId) {
    const { data, error } = await supabase
        .from('sf_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

    if (error) throw new Error(`fetchTasks: ${error.message}`);
    return (data || []).map(row => ({ id: row.id, text: row.text, done: row.done }));
}

export async function insertTask(userId, task) {
    const { error } = await supabase.from('sf_tasks').insert({
        id: task.id,
        user_id: userId,
        text: task.text,
        done: task.done || false,
    });
    if (error) throw new Error(`insertTask: ${error.message}`);
}

export async function updateTask(userId, taskId, updates) {
    const { error } = await supabase
        .from('sf_tasks')
        .update(updates)
        .eq('id', taskId)
        .eq('user_id', userId);
    if (error) throw new Error(`updateTask: ${error.message}`);
}

export async function deleteTask(userId, taskId) {
    const { error } = await supabase
        .from('sf_tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId);
    if (error) throw new Error(`deleteTask: ${error.message}`);
}

// ─── Settings ────────────────────────────────────────────────

export async function fetchSettings(userId) {
    const { data, error } = await supabase
        .from('sf_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) throw new Error(`fetchSettings: ${error.message}`);
    if (!data) return null;
    return {
        timerSettings: data.timer_settings,
        dailyGoalMinutes: data.daily_goal_minutes,
    };
}

export async function upsertSettings(userId, settings) {
    // Fetch existing first to avoid overwriting the other field
    let existing = null;
    try {
        const result = await fetchSettings(userId);
        existing = result;
    } catch (e) { /* ignore, use defaults */ }

    const merged = {
        user_id: userId,
        timer_settings: settings.timerSettings || existing?.timerSettings || { work: 25, shortBreak: 5, longBreak: 15 },
        daily_goal_minutes: settings.dailyGoalMinutes ?? existing?.dailyGoalMinutes ?? 120,
        updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('sf_settings').upsert(merged);
    if (error) throw new Error(`upsertSettings: ${error.message}`);
}

// ─── Keep-alive Ping ─────────────────────────────────────────

export async function pingSupabase() {
    try {
        await supabase.from('sf_users').select('id').limit(1);
    } catch (err) {
        console.error('Failed to ping Supabase:', err);
    }
}

// ─── Bulk Clear ──────────────────────────────────────────────

export async function clearAllUserData(userId) {
    await supabase.from('sf_sessions').delete().eq('user_id', userId);
    await supabase.from('sf_subjects').delete().eq('user_id', userId);
    await supabase.from('sf_tasks').delete().eq('user_id', userId);
    await supabase.from('sf_settings').delete().eq('user_id', userId);
}
