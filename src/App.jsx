import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from './context/UserContext';
import { useTheme } from './context/ThemeContext';
import Onboarding from './components/Onboarding/Onboarding';
import Timer from './components/Timer/Timer';
import SubjectSelector from './components/SubjectSelector/SubjectSelector';
import RecentSessions from './components/RecentSessions/RecentSessions';
import Stats from './components/Stats/Stats';
import DailyTarget from './components/DailyTarget/DailyTarget';
import ContributionGraph from './components/ContributionGraph/ContributionGraph';
import AmbientSounds from './components/AmbientSounds/AmbientSounds';
import TaskList from './components/TaskList/TaskList';
import BreakStats from './components/BreakStats/BreakStats';
import Badges from './components/Badges/Badges';
import Profile from './components/Profile/Profile';
import CalendarView from './components/CalendarView/CalendarView';
import FocusMode from './components/FocusMode/FocusMode';
import WeeklyReport from './components/WeeklyReport/WeeklyReport';
import KeyboardShortcuts from './components/KeyboardShortcuts/KeyboardShortcuts';
import SpacedRepetition from './components/SpacedRepetition/SpacedRepetition';
import { LayoutDashboard, Timer as TimerIcon, User, Loader, Sun, Moon } from 'lucide-react';
import * as db from './lib/dataService';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import './App.css';

function App() {
  const { user, isOnline } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [currentSubject, setCurrentSubject] = useState(null);
  const [activeTab, setActiveTab] = useState('timer');
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Refs for keyboard shortcuts to access current state

  // ─── Keep-alive Supabase Ping ──────────────────────────────
  useEffect(() => {
    if (!isOnline) return;

    // Ping immediately when going online
    db.pingSupabase();

    // Then ping every 15 minutes to keep it active
    const PING_INTERVAL = 15 * 60 * 1000;
    const intervalId = setInterval(() => {
      if (isOnline) {
        db.pingSupabase();
      }
    }, PING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isOnline]);

  // ─── Android Advanced Features (Capacitor) ─────────────────
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const initAndroid = async () => {
        try {
          await StatusBar.setStyle({
            style: theme === 'dark' ? Style.Dark : Style.Light
          });
          await StatusBar.setBackgroundColor({ 
            color: theme === 'dark' ? '#111827' : '#ffffff' 
          });
          await SplashScreen.hide();
        } catch (e) {
          console.warn('StatusBar/SplashScreen plugin not setup properly', e);
        }
      };
      
      initAndroid();

      const backListener = CapApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          CapApp.exitApp();
        } else {
          window.history.back();
        }
      });
      
      return () => {
        backListener.then(listener => listener.remove());
      };
    }
  }, [theme]);

  // ─── Load sessions (localStorage or Supabase) ────────────
  useEffect(() => {
    if (!user) return;

    const loadSessions = async () => {
      setLoadingSessions(true);
      try {
        if (isOnline) {
          const remoteSessions = await db.fetchSessions(user.dbUserId);
          setSessions(remoteSessions);
        } else {
          const saved = localStorage.getItem('study-tracker-sessions');
          if (saved) {
            try { setSessions(JSON.parse(saved)); } catch { /* ignore */ }
          }
        }
      } catch (err) {
        console.error('Failed to load sessions:', err);
        // Fallback to localStorage
        const saved = localStorage.getItem('study-tracker-sessions');
        if (saved) {
          try { setSessions(JSON.parse(saved)); } catch { /* ignore */ }
        }
      }
      setLoadingSessions(false);
    };

    loadSessions();
  }, [user, isOnline]);

  // ─── Persist sessions to localStorage (always, as backup) ─
  useEffect(() => {
    if (user) {
      localStorage.setItem('study-tracker-sessions', JSON.stringify(sessions));
    }
  }, [sessions, user]);

  // ─── Keyboard Shortcut Handler ────────────────────────────
  const handleShortcut = useCallback((action) => {
    switch (action) {
      case 'tab-timer':
        setActiveTab('timer');
        break;
      case 'tab-dashboard':
        setActiveTab('dashboard');
        break;
      case 'tab-profile':
        setActiveTab('profile');
        break;
      case 'toggle-timer':
        // Dispatch a custom event the Timer can listen for
        window.dispatchEvent(new CustomEvent('studyflow-shortcut', { detail: 'toggle-timer' }));
        break;
      case 'reset-timer':
        window.dispatchEvent(new CustomEvent('studyflow-shortcut', { detail: 'reset-timer' }));
        break;
      case 'save-session':
        window.dispatchEvent(new CustomEvent('studyflow-shortcut', { detail: 'save-session' }));
        break;
      case 'switch-mode':
        window.dispatchEvent(new CustomEvent('studyflow-shortcut', { detail: 'switch-mode' }));
        break;
      case 'toggle-focus':
        window.dispatchEvent(new CustomEvent('studyflow-shortcut', { detail: 'toggle-focus' }));
        break;
      case 'close':
        // General close action — handled by individual components
        window.dispatchEvent(new CustomEvent('studyflow-shortcut', { detail: 'close' }));
        break;
      default:
        break;
    }
  }, []);

  if (!user) return <Onboarding />;

  // ─── Session CRUD ─────────────────────────────────────────
  const handleSessionComplete = async (duration, mode, forcedId = null) => {
    let subjectToLog = currentSubject;
    if (!subjectToLog) {
      subjectToLog = { id: 'uncategorized', name: 'Uncategorized', color: '#9ca3af' };
    }
    const newSessionId = forcedId || Date.now();

    // Check if a session with this ID already exists locally to prevent double-logging from sync
    if (sessions.some(s => s.id === newSessionId)) return;

    const newSession = {
      id: newSessionId,
      subject: subjectToLog,
      duration,
      mode,
      date: new Date().toISOString(),
    };

    setSessions(prev => [newSession, ...prev]);

    if (isOnline) {
      try {
        await db.insertSession(user.dbUserId, newSession);
      } catch (err) {
        console.error('Failed to save session to Supabase:', err);
      }
    }

    return true;
  };

  const handleDeleteSession = async (id) => {
    setSessions(prev => prev.filter(s => s.id !== id));

    if (isOnline) {
      try {
        await db.deleteSession(user.dbUserId, id);
      } catch (err) {
        console.error('Failed to delete session from Supabase:', err);
      }
    }
  };

  const handleEditSession = async (id, newDuration) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, duration: newDuration } : s));

    if (isOnline) {
      try {
        await db.updateSession(user.dbUserId, id, { duration: newDuration });
      } catch (err) {
        console.error('Failed to update session in Supabase:', err);
      }
    }
  };

  const handleImportSessions = async (imported) => {
    setSessions(prev => [...imported, ...prev]);

    if (isOnline) {
      try {
        for (const session of imported) {
          await db.insertSession(user.dbUserId, session);
        }
      } catch (err) {
        console.error('Failed to import sessions to Supabase:', err);
      }
    }
  };

  const handleClearAllData = async () => {
    setSessions([]);
    localStorage.removeItem('study-tracker-sessions');
    localStorage.removeItem('study-tracker-tasks');
    localStorage.removeItem('study-tracker-subjects');
    localStorage.removeItem('study-tracker-timer-settings');
    localStorage.removeItem('study-tracker-daily-goal');
    localStorage.removeItem('study-tracker-sr-cards');

    if (isOnline) {
      try {
        await db.clearAllUserData(user.dbUserId);
      } catch (err) {
        console.error('Failed to clear data from Supabase:', err);
      }
    }
  };



  return (
    <div className="app-container">
      <header className="app-header glass-panel animate-fade-in">
        <h1 className="app-title">StudyFlow</h1>
        <div className="header-right">
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="header-tabs">
            <button
              className={`tab-btn ${activeTab === 'timer' ? 'active' : ''}`}
              onClick={() => setActiveTab('timer')}
            >
              <TimerIcon size={18} /> Timer
            </button>
            <button
              className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} /> Profile
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'timer' && (
          <div className="timer-view animate-fade-in">
            <div className="timer-main-col">
              <SubjectSelector
                currentSubject={currentSubject}
                onSelectSubject={setCurrentSubject}
              />
              <Timer onSessionComplete={handleSessionComplete} />
              <FocusMode
                onSessionComplete={handleSessionComplete}
                currentSubject={currentSubject}
              />
              <AmbientSounds />
            </div>
            <div className="timer-side-col">
              {loadingSessions ? (
                <div className="loading-state" style={{ flex: 1, minHeight: '300px' }}>
                  <Loader size={24} className="spin" />
                  <p>Loading...</p>
                </div>
              ) : (
                <>
                  <DailyTarget sessions={sessions} />
                  <TaskList />
                  <SpacedRepetition />
                  <RecentSessions
                    sessions={sessions}
                    onDeleteSession={handleDeleteSession}
                    onEditSession={handleEditSession}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="dashboard-view animate-fade-in">
            {loadingSessions ? (
              <div className="loading-state">
                <Loader size={24} className="spin" />
                <p>Loading your study data...</p>
              </div>
            ) : (
              <>
                <ContributionGraph sessions={sessions} />
                <Stats sessions={sessions} />
                <CalendarView sessions={sessions} />
                <WeeklyReport sessions={sessions} username={user?.username} />
                <BreakStats sessions={sessions} />
              </>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          loadingSessions ? (
            <div className="loading-state">
              <Loader size={24} className="spin" />
              <p>Loading profile data...</p>
            </div>
          ) : (
            <Profile
              sessions={sessions}
              onImportSessions={handleImportSessions}
              onClearAllData={handleClearAllData}
            />
          )
        )}
      </main>

      {/* Watermark for Android app */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '12px',
        fontWeight: 'bold',
        color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
        pointerEvents: 'none',
        zIndex: 9999,
        whiteSpace: 'nowrap'
      }}>
        MADE WITH 💖 by Pavneet
      </div>

      {/* Keyboard Shortcuts — always rendered */}
      <KeyboardShortcuts onShortcut={handleShortcut} />
    </div>
  );
}

export default App;
