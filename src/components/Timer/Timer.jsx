import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Coffee, Briefcase, Save, X } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { fetchTimerState, upsertTimerState, subscribeToTimer } from '../../lib/dataService';
import PiPTimer from '../PiPTimer/PiPTimer';
import './Timer.css';

const Timer = ({ onSessionComplete }) => {
    const { user, isOnline } = useUser();

    // Default Timer settings
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('study-tracker-timer-settings');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                console.error('Failed to parse timer settings');
            }
        }
        return { work: 25, shortBreak: 5, longBreak: 15 };
    });

    // We store the mode locally, and use states
    const [mode, setMode] = useState('stopwatch'); // stopwatch | pomodoro
    const [isActive, setIsActive] = useState(false);
    const [pomodoroState, setPomodoroState] = useState('work'); // work | shortBreak | longBreak
    const [pomodoroCount, setPomodoroCount] = useState(0);

    // Timing logic using absolute time
    const [startTime, setStartTime] = useState(null); // the Date.now() when timer started
    const [accumulatedTime, setAccumulatedTime] = useState(0); // previously accumulated seconds (mostly for stopwatch)

    // UI presentation states
    const [displayTime, setDisplayTime] = useState(0); // raw seconds for stopwatch
    const [timeLeft, setTimeLeft] = useState(settings.work * 60); // seconds left for Pomodoro

    const [showSettings, setShowSettings] = useState(false);

    // Refs for safe access in intervals and callbacks without triggering effect loops
    const settingsRef = useRef(settings);
    const modeRef = useRef(mode);
    const pomodoroStateRef = useRef(pomodoroState);
    const onSessionCompleteRef = useRef(onSessionComplete);
    const pomodoroCountRef = useRef(pomodoroCount);
    const isActiveRef = useRef(isActive);
    const startTimeRef = useRef(startTime);
    const accumulatedTimeRef = useRef(accumulatedTime);

    useEffect(() => { settingsRef.current = settings; }, [settings]);
    useEffect(() => { modeRef.current = mode; }, [mode]);
    useEffect(() => { pomodoroStateRef.current = pomodoroState; }, [pomodoroState]);
    useEffect(() => { onSessionCompleteRef.current = onSessionComplete; }, [onSessionComplete]);
    useEffect(() => { pomodoroCountRef.current = pomodoroCount; }, [pomodoroCount]);
    useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
    useEffect(() => { startTimeRef.current = startTime; }, [startTime]);
    useEffect(() => { accumulatedTimeRef.current = accumulatedTime; }, [accumulatedTime]);

    // Apply incoming state from cloud
    const syncStateFromCloud = (data) => {
        setMode(data.mode);
        setIsActive(data.isActive);
        setPomodoroState(data.pomodoroState);
        setStartTime(data.startTime);
        setAccumulatedTime(data.accumulatedTime);
        setPomodoroCount(data.pomodoroCount);

        if (data.targetDuration !== undefined && data.targetDuration !== null && !isActiveRef.current) {
             setTimeLeft(Math.max(0, data.targetDuration - data.accumulatedTime));
        }
    };

    // Initial load from cloud (if online) and Subscription
    useEffect(() => {
        if (!isOnline || !user?.dbUserId) return;

        let unsubscribe = () => {};

        const loadCloudData = async () => {
            try {
                // Fetch settings
                const { fetchSettings } = await import('../../lib/dataService');
                const settingsData = await fetchSettings(user.dbUserId);
                if (settingsData && settingsData.timerSettings) {
                    setSettings(settingsData.timerSettings);
                }

                // Fetch timer state
                const data = await fetchTimerState(user.dbUserId);
                if (data) {
                    syncStateFromCloud({
                        isActive: data.is_active,
                        mode: data.mode,
                        pomodoroState: data.pomodoro_state,
                        startTime: data.start_time ? new Date(data.start_time).getTime() : null,
                        accumulatedTime: data.accumulated_time,
                        pomodoroCount: data.pomodoro_count,
                        targetDuration: data.target_duration
                    });
                }
            } catch (err) {
                console.error("Failed to load cloud timer/settings:", err);
            }

            // Subscribe to remote changes
            unsubscribe = subscribeToTimer(user.dbUserId, (newData) => {
                syncStateFromCloud(newData);
            });
        };

        loadCloudData();

        return () => {
            unsubscribe();
        };

    }, [isOnline, user]);

    const getDurationForState = (state, sets) => {
        if (state === 'shortBreak') return (parseInt(sets.shortBreak) || 5) * 60;
        if (state === 'longBreak') return (parseInt(sets.longBreak) || 15) * 60;
        return (parseInt(sets.work) || 25) * 60; // Default to work
    };

    // Helper: Pushes current state to cloud
    const pushStateToCloud = async (overrideData = {}) => {
        if (!isOnline || !user?.dbUserId) return;

        try {
            await upsertTimerState(user.dbUserId, {
                isActive: overrideData.isActive !== undefined ? overrideData.isActive : isActiveRef.current,
                mode: overrideData.mode || modeRef.current,
                pomodoroState: overrideData.pomodoroState || pomodoroStateRef.current,
                startTime: overrideData.startTime !== undefined ? overrideData.startTime : startTimeRef.current,
                accumulatedTime: overrideData.accumulatedTime !== undefined ? overrideData.accumulatedTime : accumulatedTimeRef.current,
                pomodoroCount: overrideData.pomodoroCount !== undefined ? overrideData.pomodoroCount : pomodoroCountRef.current,
                targetDuration: overrideData.targetDuration !== undefined ? overrideData.targetDuration : getDurationForState(pomodoroStateRef.current, settingsRef.current)
            });
        } catch (err) {
            console.error("Failed to push timer state to cloud:", err);
        }
    };

    const handleSettingsChange = (newSettings) => {
        setSettings(newSettings);
        if (!isActiveRef.current && modeRef.current === 'pomodoro') {
            const newDur = getDurationForState(pomodoroStateRef.current, newSettings);
            setTimeLeft(newDur);
            pushStateToCloud({
                isActive: false,
                targetDuration: newDur
            });
        }
    };

    useEffect(() => {
        localStorage.setItem('study-tracker-timer-settings', JSON.stringify(settings));
    }, [settings]);

    // Global Keyboard Shortcuts
    useEffect(() => {
        const handleShortcut = (e) => {
            if (e.detail === 'toggle-timer') {
                toggleTimer();
            } else if (e.detail === 'reset-timer') {
                resetTimer();
            } else if (e.detail === 'save-session') {
                handleSaveStopwatch();
            } else if (e.detail === 'switch-mode') {
                handleModeSwitch(modeRef.current === 'stopwatch' ? 'pomodoro' : 'stopwatch');
            } else if (e.detail === 'close') {
                setShowSettings(false);
            }
        };

        window.addEventListener('studyflow-shortcut', handleShortcut);
        return () => window.removeEventListener('studyflow-shortcut', handleShortcut);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, isActive, startTime, accumulatedTime]);

    // Tick Logic for updating UI
    useEffect(() => {
        let interval = null;

        const updateDisplay = () => {
            if (!isActiveRef.current) {
                // Keep UI static if paused
                if (modeRef.current === 'stopwatch') {
                    setDisplayTime(accumulatedTimeRef.current);
                } else if (modeRef.current === 'pomodoro') {
                    // Time left is full duration minus accumulated time (if we paused halfway)
                    const fullDuration = getDurationForState(pomodoroStateRef.current, settingsRef.current);
                    setTimeLeft(Math.max(0, fullDuration - accumulatedTimeRef.current));
                }
                return;
            }

            // If active, calculate elapsed time since start
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - startTimeRef.current) / 1000);
            const totalElapsed = accumulatedTimeRef.current + elapsedSeconds;

            if (modeRef.current === 'stopwatch') {
                setDisplayTime(totalElapsed);
            } else if (modeRef.current === 'pomodoro') {
                // Determine target duration (either loaded from cloud, or locally fallback)
                // Use timeLeft state from earlier if we can? Actually, use the absolute target.
                const fullDuration = getDurationForState(pomodoroStateRef.current, settingsRef.current);
                const remaining = fullDuration - totalElapsed;

                if (remaining <= 0) {
                    // Timer finished
                    handlePomodoroFinish(fullDuration);
                } else {
                    setTimeLeft(remaining);
                }
            }
        };

        const handlePomodoroFinish = (finishedDuration) => {
            // Stop the current tick
            const currentPomState = pomodoroStateRef.current;
            const currentSettings = settingsRef.current;
            const currentStartTime = startTimeRef.current;

            let newPomState = 'work';
            let newCount = pomodoroCountRef.current;

            if (currentPomState === 'work') {
                if (onSessionCompleteRef.current) {
                    // We generate a deterministic ID using the start time so duplicate calls on different devices overwrite instead of duplicate
                    const deterministicId = currentStartTime ? currentStartTime : Date.now();
                    onSessionCompleteRef.current(finishedDuration, 'Pomodoro', deterministicId);
                }
                newCount += 1;
                setPomodoroCount(newCount);

                if (newCount % 4 === 0) {
                    newPomState = 'longBreak';
                } else {
                    newPomState = 'shortBreak';
                }
            } else {
                newPomState = 'work';
            }

            // Immediately pause and prepare next state
            setIsActive(false);
            setPomodoroState(newPomState);
            setAccumulatedTime(0);
            setStartTime(null);

            // Time left is the new state's duration
            setTimeLeft(getDurationForState(newPomState, currentSettings));

            // Sync
            pushStateToCloud({
                isActive: false,
                pomodoroState: newPomState,
                accumulatedTime: 0,
                startTime: null,
                pomodoroCount: newCount
            });
        };

        // Run UI update tick every 100ms for smooth transitions and immediate response
        interval = setInterval(updateDisplay, 100);
        updateDisplay(); // initial run

        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, mode, startTime, accumulatedTime]); // re-bind interval on critical changes


    const toggleTimer = () => {
        if (isActive) {
            // Pausing
            const now = Date.now();
            const elapsedSinceStart = startTimeRef.current ? Math.floor((now - startTimeRef.current) / 1000) : 0;
            const newAccumulated = accumulatedTimeRef.current + elapsedSinceStart;

            setIsActive(false);
            setAccumulatedTime(newAccumulated);
            setStartTime(null);

            pushStateToCloud({
                isActive: false,
                accumulatedTime: newAccumulated,
                startTime: null
            });
        } else {
            // Playing
            const now = Date.now();
            setIsActive(true);
            setStartTime(now);

            pushStateToCloud({
                isActive: true,
                startTime: now,
                accumulatedTime: accumulatedTimeRef.current // Send current accumulated to ensure sync
            });
        }
    };

    const resetTimer = () => {
        setIsActive(false);
        setStartTime(null);
        setAccumulatedTime(0);

        if (mode === 'stopwatch') {
            setDisplayTime(0);
        } else {
            setTimeLeft(getDurationForState(pomodoroState, settings));
        }

        pushStateToCloud({
            isActive: false,
            startTime: null,
            accumulatedTime: 0
        });
    };

    const handleModeSwitch = (newMode) => {
        if (mode === newMode) return;
        setIsActive(false);
        setMode(newMode);
        setStartTime(null);
        setAccumulatedTime(0);

        if (newMode === 'stopwatch') {
            setDisplayTime(0);
        } else {
            setPomodoroState('work');
            setTimeLeft(getDurationForState('work', settings));
        }

        pushStateToCloud({
            isActive: false,
            mode: newMode,
            startTime: null,
            accumulatedTime: 0,
            pomodoroState: 'work'
        });
    };

    const handlePomodoroStateSwitch = (newState) => {
        if (pomodoroState === newState) return;
        setIsActive(false);
        setPomodoroState(newState);
        setStartTime(null);
        setAccumulatedTime(0);
        setTimeLeft(getDurationForState(newState, settings));

        pushStateToCloud({
            isActive: false,
            pomodoroState: newState,
            startTime: null,
            accumulatedTime: 0
        });
    };

    const handleSaveStopwatch = () => {
        if (mode !== 'stopwatch' || displayTime === 0) return;

        // Save current active accumulated time if playing
        let totalTimeToSave = accumulatedTimeRef.current;
        const currentStartTime = startTimeRef.current;
        if (isActiveRef.current && currentStartTime) {
            const now = Date.now();
            totalTimeToSave += Math.floor((now - currentStartTime) / 1000);
        }

        if (totalTimeToSave === 0) return;

        if (onSessionComplete) {
            // Use the start time to deterministically generate the session ID
            const deterministicId = currentStartTime ? currentStartTime : Date.now();
            onSessionComplete(totalTimeToSave, 'Stopwatch', deterministicId);
        }
        resetTimer();
    };

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

    const handleSettingsClick = () => {
        setShowSettings(true);
    };

    const handleCloseSettings = async () => {
        setShowSettings(false);
        // Sync settings to Supabase
        if (isOnline && user?.dbUserId) {
            const { upsertSettings } = await import('../../lib/dataService');
            try {
                await upsertSettings(user.dbUserId, { timerSettings: settings });
            } catch (err) {
                console.error('Failed to save timer settings to Supabase:', err);
            }
        }
    };

    const circumference = 2 * Math.PI * 120;
    const strokeDashoffset = circumference - (getProgressPercentage() / 100) * circumference;

    return (
        <div className="timer-container glass-panel animate-fade-in">
            {/* Mode Switcher */}
            <div className="timer-header">
                <div className="timer-header-spacer" />
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
                <PiPTimer
                    time={formatTime(mode === 'stopwatch' ? displayTime : timeLeft)}
                    mode={mode}
                    pomodoroState={pomodoroState}
                    isActive={isActive}
                />
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
                                transition: 'stroke-dashoffset 0.1s linear' // Updated to match tick rate
                            }}
                        />
                    </svg>
                )}
                <div className="time-text">
                    {formatTime(mode === 'stopwatch' ? displayTime : timeLeft)}
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
                    <button className="control-btn glass-button" onClick={handleSaveStopwatch} title="Log Session" style={{ color: displayTime > 0 ? 'var(--success)' : 'inherit' }}>
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
                                onChange={(e) => handleSettingsChange({ ...settings, work: e.target.value === '' ? '' : parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="setting-row">
                            <label>Short Break (min)</label>
                            <input
                                type="number"
                                min="1" max="60"
                                value={settings.shortBreak}
                                onChange={(e) => handleSettingsChange({ ...settings, shortBreak: e.target.value === '' ? '' : parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="setting-row">
                            <label>Long Break (min)</label>
                            <input
                                type="number"
                                min="1" max="60"
                                value={settings.longBreak}
                                onChange={(e) => handleSettingsChange({ ...settings, longBreak: e.target.value === '' ? '' : parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Timer;
