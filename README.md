# ⏳ StudyFlow: Advanced Study Time Tracker

**StudyFlow** is a modern, beautifully designed web application built to help students and professionals track their study sessions, manage their daily tasks, and visualize their productivity. It features robust time-tracking mechanics (Pomodoro & Stopwatch), advanced data visualizations, an integrated gamification system (XP and Badges), and seamless online/offline data synchronization powered by Supabase.

---

## ✨ Features

### 🕒 Smart Time Tracking
- **Pomodoro Timer:** Fully customizable focus, short break, and long break intervals. Automatically cycles between work and rest states.
- **Stopwatch Mode:** Open-ended time tracking for deep work sessions without predefined limits.
- **Ambient Sounds:** Built-in low-fi ambient noise (Rain, Cafe, Wind, etc.) to boost focus.

### 📊 Advanced Analytics & Dashboard
- **Weekly & Lifetime Stats:** Track your total study duration, active days streak, and session counts.
- **Heatmap (Contribution Graph):** A GitHub-style activity graph to visualize your daily study intensity over the last 90 days.
- **Visual Charts:** Bar charts showing session distribution across different subjects and days of the week using `recharts`.
- **Breakdown Analytics:** Compare the ratio of Pomodoro vs. Stopwatch sessions and calculate your "Productivity Score".

### 🎮 Gamification & Achievements
- **Leveling System:** Earn XP for every minute you study and session you complete. Level up from "Beginner" to "Sage".
- **Dynamic Badges:** Unlock achievements (e.g., "Dedicated," "Marathon," "Well Rounded") by reaching specific study milestones.

### 💾 Flexible Data Management (Online & Offline)
- **Offline-First Mode:** Don't want an account? Use the app entirely offline. Everything is saved locally via `localStorage`.
- **Online Cloud Sync:** Sign in securely using a unique Username & Secret Key combination to sync your data instantly across multiple devices using **Supabase**.
- **Data Export/Import:** Export your sessions locally to a `.csv` file or import historical data to continue your streak.

### 🎨 Premium UI/UX
- **Glassmorphism Design:** A stunning, translucent interface with smooth micro-animations.
- **Responsive Navigation:** Desktop scaling and a highly ergonomic **bottom navigation bar** for mobile users.
- **Subject Categorization:** Tag your sessions with specific subjects and assign distinct colors to them.

---

## 🛠️ Technology Stack

- **Frontend Framework:** React 18 + Vite
- **Styling:** Vanilla CSS3 (Custom variables, CSS Grid/Flexbox, standard media queries)
- **Icons:** `lucide-react`
- **Charts:** `recharts`
- **Database & Auth:** Supabase (PostgreSQL + Row Level Security)
- **Storage:** Browser `localStorage` for offline fallback & data caching

---

## 🚀 Setup & Installation

### 1. Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16.x or later)
- `npm` or `yarn`
- A [Supabase](https://supabase.com/) account (Required for Online Syncing features)

### 2. Clone the Repository
```bash
git clone https://github.com/Pavneet-1/study-time-tracker.git
cd study-time-tracker
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup (Supabase)
To enable the Online Mode, you must set up your Supabase project:
1. Create a new project in your Supabase Dashboard.
2. Go to the **SQL Editor** in Supabase.
3. Open the `supabase/schema.sql` file provided in this repository and copy its contents.
4. Paste the SQL script into the editor and click **Run**. This will create the required tables (`sf_users`, `sf_sessions`, `sf_subjects`, `sf_tasks`, `sf_settings`) and Row Level Security (RLS) policies.

*(Note: RLS is configured to only allow inserts/selects if the backend confirms the identity. You can strict-lock this via Supabase Auth if needed, though this app uses a lightweight Custom Auth token approach using Secret Keys.)*

### 5. Environment Variables
Create a `.env.local` file in the root of the project to securely house your API keys.

```env
# .env.local
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```
You can find these keys in your Supabase Dashboard under **Project Settings -> API**.

### 6. Start the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`. 

---

## 📱 Mobile Responsiveness

The application is fully responsive. When viewed on devices under `900px` (such as tablets or mobile phones):
- The header navigation magically transitions into an ergonomic **fixed bottom navigation bar**.
- Complex graphs switch to scrollable overlays.
- Timer control rings scale automatically without breaking spacing.

## 🤝 Contribution Guidelines

Contributions, issues, and feature requests are welcome!
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
