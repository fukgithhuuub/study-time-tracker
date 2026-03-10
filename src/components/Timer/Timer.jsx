import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings, Coffee, Briefcase, Save, X } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import * as db from '../../lib/dataService';
import './Timer.css';

const Timer = ({ onSessionComplete }) => {
    const { user, isOnline } = useUser();
    const [mode, setMode] = useState('stopwatch');
    const [pomodoroState, setPomodoroState] = useState('work');

    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('study-tracker-timer-settings');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse timer settings');
            }
        }
        return { work: 25, shortBreak: 5, longBreak: 15 };
    });

    const getDurationForState = (state, currentSettings) => {
        const w = parseInt(currentSettings.work) || 1;
        const s = parseInt(currentSettings.shortBreak) || 1;
        const l = parseInt(currentSettings.longBreak) || 1;

        if (state === 'work') return w * 60;
        if (state === 'shortBreak') return s * 60;
        if (state === 'longBreak') return l * 60;
        return 25 * 60;
    };

    const [time, setTime] = useState(0);
    const [timeLeft, setTimeLeft] = useState(() => getDurationForState('work', settings));
    const [isActive, setIsActive] = useState(false);
    const [pomodoroCount, setPomodoroCount] = useState(0);
    const [showSettings, setShowSettings] = useState(false);

    // Use refs to avoid stale closures in the interval callback
    const pomodoroStateRef = useRef(pomodoroState);
    const pomodoroCountRef = useRef(pomodoroCount);
    const settingsRef = useRef(settings);
    const onSessionCompleteRef = useRef(onSessionComplete);

    useEffect(() => { pomodoroStateRef.current = pomodoroState; }, [pomodoroState]);
    useEffect(() => { pomodoroCountRef.current = pomodoroCount; }, [pomodoroCount]);
    useEffect(() => { settingsRef.current = settings; }, [settings]);
    useEffect(() => { onSessionCompleteRef.current = onSessionComplete; }, [onSessionComplete]);

    // Keyboard shortcut handler
    useEffect(() => {
        const handleShortcut = (e) => {
            const action = e.detail;
            switch (action) {
                case 'toggle-timer':
                    setIsActive(prev => !prev);
                    break;
                case 'reset-timer':
                    setIsActive(false);
                    if (mode === 'stopwatch') {
                        setTime(0);
                    } else {
                        setTimeLeft(getDurationForState(pomodoroStateRef.current, settingsRef.current));
                    }
                    break;
                case 'save-session':
                    if (mode === 'stopwatch' && time > 0 && onSessionCompleteRef.current) {
                        onSessionCompleteRef.current(time, 'Stopwatch').then(() => {
                            setTime(0);
                            setIsActive(false);
                        }).catch(err => console.error('Failed to save:', err));
                    }
                    break;
                case 'switch-mode':
                    setIsActive(false);
                    if (mode === 'stopwatch') {
                        setMode('pomodoro');
                        setPomodoroState('work');
                        setTimeLeft(getDurationForState('work', settingsRef.current));
                    } else {
                        setMode('stopwatch');
                        setTime(0);
                    }
                    break;
            }
        };
        window.addEventListener('studyflow-shortcut', handleShortcut);
        return () => window.removeEventListener('studyflow-shortcut', handleShortcut);
    }, [mode, time]);

    // Load settings from Supabase on mount
    useEffect(() => {
        const loadSettings = async () => {
            if (isOnline) {
                try {
                    const remote = await db.fetchSettings(user.dbUserId);
                    if (remote?.timerSettings) {
                        setSettings(remote.timerSettings);
                    }
                } catch (err) {
                    console.error('Failed to load timer settings from Supabase:', err);
                }
            }
        };
        if (user) loadSettings();
    }, [user, isOnline]);

    useEffect(() => {
        localStorage.setItem('study-tracker-timer-settings', JSON.stringify(settings));
        if (!isActive && mode === 'pomodoro') {
            setTimeLeft(getDurationForState(pomodoroState, settings));
        }
    }, [settings]);

    const toggleTimer = () => {
        setIsActive(prev => !prev);
    };

    const resetTimer = () => {
        setIsActive(false);
        if (mode === 'stopwatch') {
            setTime(0);
        } else {
            setTimeLeft(getDurationForState(pomodoroState, settings));
        }
    };

    const handleSaveStopwatch = async () => {
        if (time > 0 && onSessionComplete) {
            try {
                await onSessionComplete(time, 'Stopwatch');
                setTime(0);
                setIsActive(false);
            } catch (err) {
                console.error('Failed to save session:', err);
            }
        }
    };

    const handleSettingsClick = () => {
        setShowSettings(true);
    };

    const handleCloseSettings = async () => {
        setShowSettings(false);
        // Sync settings to Supabase
        if (isOnline) {
            try {
                await db.upsertSettings(user.dbUserId, { timerSettings: settings });
            } catch (err) {
                console.error('Failed to save timer settings to Supabase:', err);
            }
        }
    };

    const handleModeSwitch = (newMode) => {
        setIsActive(false);
        setMode(newMode);
        if (newMode === 'stopwatch') {
            setTime(0);
        } else {
            setPomodoroState('work');
            setTimeLeft(getDurationForState('work', settings));
        }
    };

    const handlePomodoroStateSwitch = useCallback((newState) => {
        setIsActive(false);
        setPomodoroState(newState);
        setTimeLeft(getDurationForState(newState, settingsRef.current));
    }, []);

    // Main tick logic — uses refs to always get fresh values
    useEffect(() => {
        let interval = null;

        if (isActive) {
            if (mode === 'stopwatch') {
                interval = setInterval(() => {
                    setTime(t => t + 1);
                }, 1000);
            } else if (mode === 'pomodoro') {
                interval = setInterval(() => {
                    setTimeLeft((prevTime) => {
                        if (prevTime <= 1) {
                            // Use refs for fresh state inside interval
                            setIsActive(false);
                            const currentPomState = pomodoroStateRef.current;
                            const currentSettings = settingsRef.current;

                            if (currentPomState === 'work') {
                                if (onSessionCompleteRef.current) {
                                    onSessionCompleteRef.current(getDurationForState('work', currentSettings), 'Pomodoro');
                                }
                                const newCount = pomodoroCountRef.current + 1;
                                setPomodoroCount(newCount);

                                if (newCount % 4 === 0) {
                                    setPomodoroState('longBreak');
                                    return getDurationForState('longBreak', currentSettings);
                                } else {
                                    setPomodoroState('shortBreak');
                                    return getDurationForState('shortBreak', currentSettings);
                                }
                            } else {
                                setPomodoroState('work');
                                return getDurationForState('work', currentSettings);
                            }
                        }
                        return prevTime - 1;
                    });
                }, 1000);
            }
        }

        return () => clearInterval(interval);
    }, [isActive, mode]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (mode === 'stopwatch' && h > 0) {
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const getProgressPercentage = () => {
        if (mode === 'stopwatch') return 100;
        const total = getDurationForState(pomodoroState, settings);
        if (total <= 0) return 0;
        return Math.max(0, Math.min(100, (timeLeft / total) * 100));
    };

    const circumference = 2 * Math.PI * 120;
    const strokeDashoffset = circumference - (getProgressPercentage() / 100) * circumference;

    return (
        <div className="timer-container glass-panel animate-fade-in">
            {/* Mode Switcher */}
            <div className="timer-header">
                <div className="mode-toggle">
                    <button
                        className={`toggle-btn ${mode === 'stopwatch' ? 'active' : ''}`}
                        onClick={() => handleModeSwitch('stopwatch')}
                    >
                        Stopwatch
                    </button>
                    <button
                        className={`toggle-btn ${mode === 'pomodoro' ? 'active' : ''}`}
                        onClick={() => handleModeSwitch('pomodoro')}
                    >
                        Pomodoro
                    </button>
                </div>
            </div>

            {/* Pomodoro States */}
            {mode === 'pomodoro' && (
                <div className="pomodoro-states">
                    <button
                        className={`state-btn ${pomodoroState === 'work' ? 'active' : ''}`}
                        onClick={() => handlePomodoroStateSwitch('work')}
                    >
                        <Briefcase size={16} /> Focus
                    </button>
                    <button
                        className={`state-btn ${pomodoroState === 'shortBreak' ? 'active' : ''}`}
                        onClick={() => handlePomodoroStateSwitch('shortBreak')}
                    >
                        <Coffee size={16} /> Short Break
                    </button>
                    <button
                        className={`state-btn ${pomodoroState === 'longBreak' ? 'active' : ''}`}
                        onClick={() => handlePomodoroStateSwitch('longBreak')}
                    >
                        <Coffee size={16} /> Long Break
                    </button>
                </div>
            )}

            {/* Timer Display */}
            <div className="timer-display-wrapper">
                {mode === 'pomodoro' && (
                    <svg className="progress-ring" width="280" height="280">
                        <circle
                            className="progress-ring-circle-bg"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="12"
                            fill="transparent"
                            r="120"
                            cx="140"
                            cy="140"
                        />
                        <circle
                            className={`progress-ring-circle ${pomodoroState}`}
                            stroke="var(--accent-primary)"
                            strokeWidth="12"
                            fill="transparent"
                            r="120"
                            cx="140"
                            cy="140"
                            style={{
                                strokeDasharray: circumference,
                                strokeDashoffset: strokeDashoffset,
                                transition: 'stroke-dashoffset 1s linear'
                            }}
                        />
                    </svg>
                )}
                <div className="time-text">
                    {formatTime(mode === 'stopwatch' ? time : timeLeft)}
                </div>
            </div>

            {/* Controls */}
            <div className="timer-controls">
                <button className="control-btn glass-button" onClick={resetTimer} title="Reset Timer">
                    <RotateCcw size={32} />
                </button>
                <button className="control-btn primary glass-button active" onClick={toggleTimer}>
                    {isActive ? <Pause size={48} /> : <Play size={48} style={{ marginLeft: '4px' }} />}
                </button>
                {mode === 'stopwatch' ? (
                    <button className="control-btn glass-button" onClick={handleSaveStopwatch} title="Log Session" style={{ color: time > 0 ? 'var(--success)' : 'inherit' }}>
                        <Save size={32} />
                    </button>
                ) : (
                    <button className="control-btn glass-button" onClick={handleSettingsClick} title="Settings">
                        <Settings size={32} />
                    </button>
                )}
            </div>

            {mode === 'pomodoro' && isActive && pomodoroState === 'work' && (
                <div className="pomodoro-focus-message fade-in-out">
                    Deep Work in Progress
                </div>
            )}

            {/* Settings Modal */}
            {showSettings && (
                <div className="settings-overlay animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) handleCloseSettings(); }}>
                    <div className="settings-modal glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Timer Settings</h3>
                            <button className="control-btn" style={{ width: '32px', height: '32px' }} onClick={handleCloseSettings}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="setting-row">
                            <label>Work (min)</label>
                            <input
                                type="number"
                                min="1" max="120"
                                value={settings.work}
                                onChange={(e) => setSettings({ ...settings, work: e.target.value === '' ? '' : parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="setting-row">
                            <label>Short Break (min)</label>
                            <input
                                type="number"
                                min="1" max="60"
                                value={settings.shortBreak}
                                onChange={(e) => setSettings({ ...settings, shortBreak: e.target.value === '' ? '' : parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="setting-row">
                            <label>Long Break (min)</label>
                            <input
                                type="number"
                                min="1" max="60"
                                value={settings.longBreak}
                                onChange={(e) => setSettings({ ...settings, longBreak: e.target.value === '' ? '' : parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Timer;
