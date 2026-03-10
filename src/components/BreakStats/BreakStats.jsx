import React, { useMemo } from 'react';
import { Coffee, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import './BreakStats.css';

const BreakStats = ({ sessions = [] }) => {
    const stats = useMemo(() => {
        const pomodoroSessions = sessions.filter(s => s.mode === 'Pomodoro');
        const stopwatchSessions = sessions.filter(s => s.mode === 'Stopwatch');

        const totalPomodoros = pomodoroSessions.length;
        const totalStopwatch = stopwatchSessions.length;

        // Average pomodoro focus duration
        const avgPomodoroMins = totalPomodoros > 0
            ? Math.round(pomodoroSessions.reduce((a, s) => a + s.duration, 0) / totalPomodoros / 60)
            : 0;

        // Average stopwatch session duration
        const avgStopwatchMins = totalStopwatch > 0
            ? Math.round(stopwatchSessions.reduce((a, s) => a + s.duration, 0) / totalStopwatch / 60)
            : 0;

        // Focus ratio: What percentage of sessions are Pomodoro vs Stopwatch
        const totalSessions = sessions.length;
        const pomodoroRatio = totalSessions > 0
            ? Math.round((totalPomodoros / totalSessions) * 100)
            : 0;

        // Longest session
        const longestSession = sessions.length > 0
            ? sessions.reduce((max, s) => s.duration > max.duration ? s : max, sessions[0])
            : null;
        const longestMins = longestSession ? Math.round(longestSession.duration / 60) : 0;

        // Sessions today
        const todayStr = new Date().toDateString();
        const todaySessions = sessions.filter(s => new Date(s.date).toDateString() === todayStr).length;

        // Productivity score (simple: more sessions + longer = better)
        const totalMinutes = sessions.reduce((a, s) => a + s.duration, 0) / 60;
        const productivityScore = totalSessions > 0
            ? Math.min(100, Math.round((totalMinutes / (totalSessions * 30)) * 50 + (todaySessions * 10)))
            : 0;

        return {
            totalPomodoros,
            totalStopwatch,
            avgPomodoroMins,
            avgStopwatchMins,
            pomodoroRatio,
            longestMins,
            longestSubject: longestSession?.subject?.name || '—',
            todaySessions,
            productivityScore,
        };
    }, [sessions]);

    return (
        <div className="break-stats glass-panel animate-fade-in">
            <h3 className="bs-title">
                <Coffee size={18} /> Session Breakdown
            </h3>

            <div className="bs-grid">
                <div className="bs-card">
                    <div className="bs-card-icon pomodoro">
                        <Clock size={18} />
                    </div>
                    <div className="bs-card-info">
                        <span className="bs-card-value">{stats.totalPomodoros}</span>
                        <span className="bs-card-label">Pomodoro Sessions</span>
                    </div>
                </div>

                <div className="bs-card">
                    <div className="bs-card-icon stopwatch">
                        <Clock size={18} />
                    </div>
                    <div className="bs-card-info">
                        <span className="bs-card-value">{stats.totalStopwatch}</span>
                        <span className="bs-card-label">Stopwatch Sessions</span>
                    </div>
                </div>

                <div className="bs-card">
                    <div className="bs-card-icon avg">
                        <TrendingUp size={18} />
                    </div>
                    <div className="bs-card-info">
                        <span className="bs-card-value">{stats.avgPomodoroMins}m</span>
                        <span className="bs-card-label">Avg Pomodoro</span>
                    </div>
                </div>

                <div className="bs-card">
                    <div className="bs-card-icon avg">
                        <TrendingUp size={18} />
                    </div>
                    <div className="bs-card-info">
                        <span className="bs-card-value">{stats.avgStopwatchMins}m</span>
                        <span className="bs-card-label">Avg Stopwatch</span>
                    </div>
                </div>
            </div>

            <div className="bs-bar-section">
                <div className="bs-bar-header">
                    <span>Pomodoro vs Stopwatch</span>
                    <span className="bs-bar-percent">{stats.pomodoroRatio}% Pomodoro</span>
                </div>
                <div className="bs-bar-track">
                    <div
                        className="bs-bar-fill pomodoro"
                        style={{ width: `${stats.pomodoroRatio}%` }}
                    />
                    <div
                        className="bs-bar-fill stopwatch"
                        style={{ width: `${100 - stats.pomodoroRatio}%` }}
                    />
                </div>
            </div>

            <div className="bs-highlights">
                <div className="bs-highlight-item">
                    <AlertTriangle size={14} />
                    <span>Longest session: <strong>{stats.longestMins}m</strong> ({stats.longestSubject})</span>
                </div>
                <div className="bs-highlight-item">
                    <Clock size={14} />
                    <span>Today: <strong>{stats.todaySessions}</strong> sessions completed</span>
                </div>
            </div>
        </div>
    );
};

export default BreakStats;
