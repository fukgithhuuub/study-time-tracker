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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timer', label: 'Study Timer', icon: Timer },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'sync', label: 'Cloud Sync', icon: Cloud },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard sessions={sessions} subjects={subjects} tasks={tasks} />;
      case 'timer':
        return (
          <div className="space-y-8">
            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={() => setTimerMode('stopwatch')}
                className={cn(
                  "px-6 py-2 rounded-full font-medium transition-all",
                  timerMode === 'stopwatch' ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"
                )}
              >
                Stopwatch
              </button>
              <button
                onClick={() => setTimerMode('pomodoro')}
                className={cn(
                  "px-6 py-2 rounded-full font-medium transition-all",
                  timerMode === 'pomodoro' ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400"
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
          />
        );
      default:
        return <Dashboard sessions={sessions} subjects={subjects} tasks={tasks} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col fixed h-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Clock className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">StudyFlow</span>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  activeTab === item.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                )}
              >
                <item.icon size={20} className={cn(
                  activeTab === item.id ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                )} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-zinc-800">
           <div className="bg-zinc-800/50 rounded-2xl p-4">
              <p className="text-xs text-zinc-500 mb-1">Weekly Streak</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">5 Days</span>
                <span className="text-orange-500">🔥</span>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
