-- StudyFlow Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up all tables

-- Users table (for online sync with username + secret key)
CREATE TABLE IF NOT EXISTS sf_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL,
    secret_key TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(username, secret_key)
);

-- Study sessions
CREATE TABLE IF NOT EXISTS sf_sessions (
    id BIGINT PRIMARY KEY,
    user_id UUID REFERENCES sf_users(id) ON DELETE CASCADE,
    subject_id TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    subject_color TEXT DEFAULT '#6366f1',
    duration INTEGER NOT NULL,  -- in seconds
    mode TEXT NOT NULL,         -- 'Pomodoro', 'Stopwatch', 'Imported'
    date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Subjects
CREATE TABLE IF NOT EXISTS sf_subjects (
    id TEXT NOT NULL,
    user_id UUID REFERENCES sf_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (id, user_id)
);

-- Tasks / To-Dos
CREATE TABLE IF NOT EXISTS sf_tasks (
    id BIGINT PRIMARY KEY,
    user_id UUID REFERENCES sf_users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    done BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- User settings (timer, daily goal, etc.)
CREATE TABLE IF NOT EXISTS sf_settings (
    user_id UUID REFERENCES sf_users(id) ON DELETE CASCADE PRIMARY KEY,
    timer_settings JSONB DEFAULT '{"work": 25, "shortBreak": 5, "longBreak": 15}'::jsonb,
    daily_goal_minutes INTEGER DEFAULT 120,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sf_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sf_sessions(date);
CREATE INDEX IF NOT EXISTS idx_subjects_user ON sf_subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON sf_tasks(user_id);

-- Row Level Security (RLS)
ALTER TABLE sf_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sf_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sf_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sf_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sf_settings ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all operations for anon key (data secured by username+secret_key pair in app logic)
CREATE POLICY "Allow all for sf_users" ON sf_users FOR ALL USING (true);
CREATE POLICY "Allow all for sf_sessions" ON sf_sessions FOR ALL USING (true);
CREATE POLICY "Allow all for sf_subjects" ON sf_subjects FOR ALL USING (true);
CREATE POLICY "Allow all for sf_tasks" ON sf_tasks FOR ALL USING (true);
CREATE POLICY "Allow all for sf_settings" ON sf_settings FOR ALL USING (true);

-- Timer State for real-time sync across devices
CREATE TABLE IF NOT EXISTS sf_timer_state (
    user_id UUID REFERENCES sf_users(id) ON DELETE CASCADE PRIMARY KEY,
    is_active BOOLEAN DEFAULT false,
    mode TEXT NOT NULL DEFAULT 'stopwatch',
    pomodoro_state TEXT NOT NULL DEFAULT 'work',
    start_time TIMESTAMPTZ,
    accumulated_time INTEGER DEFAULT 0,
    pomodoro_count INTEGER DEFAULT 0,
    target_duration INTEGER DEFAULT 1500,
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sf_timer_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for sf_timer_state" ON sf_timer_state FOR ALL USING (true);
