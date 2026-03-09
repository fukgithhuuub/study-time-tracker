import React, { useState } from 'react';
import {
  LayoutDashboard,
  Timer,
  BookOpen,
  BarChart3,
  CheckSquare,
  Clock,
  Cloud
} from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSync } from './hooks/useSync';
import { Dashboard } from './components/Dashboard';
import { Stopwatch } from './components/Stopwatch';
import { Pomodoro } from './components/Pomodoro';
import { SubjectManager } from './components/SubjectManager';
import { Analytics } from './components/Analytics';
import { TaskList } from './components/TaskList';
import { SyncSettings } from './components/SyncSettings';
import { cn } from './lib/utils';
import { parseISO, format, differenceInDays } from 'date-fns';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [subjects, setSubjects] = useLocalStorage('study-subjects', [
    { id: '1', name: 'Math', color: '#3b82f6' },
    { id: '2', name: 'Science', color: '#10b981' }
  ]);
  const [sessions, setSessions] = useLocalStorage('study-sessions', []);
  const [tasks, setTasks] = useLocalStorage('study-tasks', []);
  const [secretKey, setSecretKey] = useLocalStorage('study-secret-key', '');
  const [timerMode, setTimerMode] = useState('stopwatch'); // 'stopwatch' or 'pomodoro'

  const { isSyncing, lastSynced, error, syncToCloud, syncFromCloud } = useSync(
    secretKey, subjects, sessions, tasks, setSubjects, setSessions, setTasks
  );

  const handleSaveSession = (session) => {
    setSessions([session, ...sessions]);
  };

  const streak = React.useMemo(() => {
    if (sessions.length === 0) return 0;
    const dates = sessions.map(s => format(parseISO(s.timestamp), 'yyyy-MM-dd'));
    const uniqueDates = Array.from(new Set(dates)).sort().reverse();

    let currentStreak = 0;
    let checkDate = new Date();

    for (const dateStr of uniqueDates) {
      const date = parseISO(dateStr);
      const diff = differenceInDays(checkDate, date);
      if (diff === 0 || diff === 1) {
          currentStreak++;
          checkDate = date;
      } else {
          break;
      }
    }
    return currentStreak;
  }, [sessions]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timer', label: 'Study Timer', icon: Timer },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'sync', label: 'Cloud Sync', icon: Cloud },
  ];

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear ALL data? This will reset your progress, subjects, and tasks. This cannot be undone unless you have a cloud backup.")) {
      setSubjects([]);
      setSessions([]);
      setTasks([]);
      setSecretKey('');
      localStorage.clear();
      window.location.reload();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard sessions={sessions} subjects={subjects} tasks={tasks} />;
      case 'timer':
        return (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={() => setTimerMode('stopwatch')}
                className={cn(
                  "px-8 py-3 rounded-2xl font-bold transition-all duration-300 shadow-xl",
                  timerMode === 'stopwatch' ? "bg-blue-600 text-white shadow-blue-900/40 scale-105" : "bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-800"
                )}
              >
                Stopwatch
              </button>
              <button
                onClick={() => setTimerMode('pomodoro')}
                className={cn(
                  "px-8 py-3 rounded-2xl font-bold transition-all duration-300 shadow-xl",
                  timerMode === 'pomodoro' ? "bg-rose-600 text-white shadow-rose-900/40 scale-105" : "bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-800"
                )}
              >
                Pomodoro
              </button>
            </div>
            {timerMode === 'stopwatch' ? (
              <Stopwatch subjects={subjects} onSaveSession={handleSaveSession} />
            ) : (
              <Pomodoro subjects={subjects} onSaveSession={handleSaveSession} />
            )}
          </div>
        );
      case 'subjects':
        return <SubjectManager subjects={subjects} setSubjects={setSubjects} />;
      case 'tasks':
        return <TaskList subjects={subjects} tasks={tasks} setTasks={setTasks} />;
      case 'analytics':
        return <Analytics sessions={sessions} subjects={subjects} />;
      case 'sync':
        return (
          <SyncSettings
            secretKey={secretKey}
            setSecretKey={setSecretKey}
            syncToCloud={syncToCloud}
            syncFromCloud={syncFromCloud}
            isSyncing={isSyncing}
            lastSynced={lastSynced}
            error={error}
            onClearAllData={clearAllData}
          />
        );
      default:
        return <Dashboard sessions={sessions} subjects={subjects} tasks={tasks} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Sidebar */}
      <aside className="w-72 bg-zinc-900/80 backdrop-blur-2xl border-r border-zinc-800 flex flex-col fixed h-full z-50">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[1rem] flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              <Clock className="text-white" size={28} />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tighter text-white block">StudyFlow</span>
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Ultimate Log</span>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                  activeTab === item.id
                    ? "bg-blue-600/10 text-white"
                    : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200"
                )}
              >
                {activeTab === item.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-full" />
                )}
                <item.icon size={22} className={cn(
                  "transition-transform duration-300 group-hover:scale-110",
                  activeTab === item.id ? "text-blue-500" : "text-zinc-600 group-hover:text-zinc-400"
                )} />
                <span className="font-bold text-lg">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-zinc-800">
           <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-[1.5rem] p-6 border border-zinc-700/30 shadow-xl">
              <p className="text-[10px] text-zinc-500 mb-2 uppercase font-black tracking-widest">Global Streak</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-white">{streak} Days</span>
                <span className="text-2xl animate-pulse">🔥</span>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-12 bg-zinc-950 overflow-y-auto min-h-screen">
        <div className="max-w-6xl mx-auto pb-20">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
