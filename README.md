# StudyFlow - Ultimate Study Time Tracker

StudyFlow is a modern, offline-first study productivity application designed to help you log sessions, manage subjects, track tasks, and visualize your progress with beautiful analytics.

## ✨ Features

- **Subject-Wise Logging**: Organize your study sessions by subjects with custom colors.
- **Dual Timer Modes**:
  - **Live Stopwatch**: Real-time session tracking.
  - **Pomodoro Timer**: Structured focus and break intervals (25/5/15 mins).
- **Comprehensive Dashboard**: View your daily study goals, task completion, and recent history at a glance.
- **Task Management**: Integrated todo lists for each subject to keep your study sessions focused.
- **Advanced Analytics**: Visualize your study distribution and weekly performance trends using interactive charts.
- **Offline & Online Sync**:
  - **Local First**: All data is saved instantly to your browser's local storage.
  - **Cloud Backup**: Use a **Secret Key** to backup and restore your data via **Supabase**. No account registration required!

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd study-time-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## ☁️ Supabase Schema Setup

To enable cloud sync, create a table named `study_data` in your Supabase database with the following structure:

```sql
create table public.study_data (
  secret_key text not null,
  subjects jsonb default '[]'::jsonb,
  sessions jsonb default '[]'::jsonb,
  tasks jsonb default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()),

  constraint study_data_pkey primary key (secret_key)
);

-- Enable RLS (Row Level Security)
alter table public.study_data enable row level security;

-- Create a policy that allows anyone to upsert/select based on secret_key
create policy "Allow public access by secret key"
on public.study_data
for all
using (true)
with check (true);
```

## 🛠️ Built With

- **React** - Frontend framework
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons
- **Recharts** - Data visualization
- **Supabase** - Cloud storage
- **Date-fns** - Date manipulation

## 💡 Future Ideas

Check out `IDEAS.md` for a list of planned features and community suggestions!
