import React, { useState, useEffect } from 'react';
import { Target, Check } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import * as db from '../../lib/dataService';
import './DailyTarget.css';

const DailyTarget = ({ sessions = [] }) => {
    const { user, isOnline } = useUser();
    const [dailyGoal, setDailyGoal] = useState(120);
    const [isEditing, setIsEditing] = useState(false);
    const [tempGoal, setTempGoal] = useState(120);
    const [loaded, setLoaded] = useState(false);

    // Load daily goal
    useEffect(() => {
        const load = async () => {
            if (isOnline) {
                try {
                    const settings = await db.fetchSettings(user.dbUserId);
                    if (settings) {
                        setDailyGoal(settings.dailyGoalMinutes || 120);
                        setTempGoal(settings.dailyGoalMinutes || 120);
                        setLoaded(true);
                        return;
                    }
                } catch (err) {
                    console.error('Failed to fetch settings:', err);
                }
            }
            const saved = localStorage.getItem('study-tracker-daily-goal');
            const goal = saved ? parseInt(saved) : 120;
            setDailyGoal(goal);
            setTempGoal(goal);
            setLoaded(true);
        };
        if (user) load();
    }, [user, isOnline]);

    // Save to localStorage always
    useEffect(() => {
        if (loaded) {
            localStorage.setItem('study-tracker-daily-goal', dailyGoal.toString());
        }
    }, [dailyGoal, loaded]);

    const todayStr = new Date().toDateString();
    const todaySeconds = sessions
        .filter(s => new Date(s.date).toDateString() === todayStr)
        .reduce((acc, s) => acc + s.duration, 0);
    const todayMinutes = Math.round(todaySeconds / 60);
    const percentage = Math.min((todayMinutes / dailyGoal) * 100, 100);
    const isGoalMet = percentage >= 100;

    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const handleSaveGoal = async () => {
        const val = parseInt(tempGoal) || 1;
        const newGoal = Math.max(1, Math.min(600, val));
        setDailyGoal(newGoal);
        setIsEditing(false);

        if (isOnline) {
            try {
                await db.upsertSettings(user.dbUserId, { dailyGoalMinutes: newGoal });
            } catch (err) {
                console.error('Failed to save daily goal to Supabase:', err);
            }
        }
    };

    const hoursTotal = Math.floor(dailyGoal / 60);
    const minsTotal = dailyGoal % 60;
    const goalLabel = hoursTotal > 0
        ? `${hoursTotal}h${minsTotal > 0 ? ` ${minsTotal}m` : ''}`
        : `${minsTotal}m`;

    const hoursDone = Math.floor(todayMinutes / 60);
    const minsDone = todayMinutes % 60;
    const doneLabel = hoursDone > 0
        ? `${hoursDone}h ${minsDone}m`
        : `${minsDone}m`;

    return (
        <div className="daily-target glass-panel animate-fade-in">
            <div className="daily-target-header">
                <h3 className="daily-target-title">
                    <Target size={18} /> Daily Goal
                </h3>
                <button
                    className="goal-edit-btn"
                    onClick={() => { setIsEditing(!isEditing); setTempGoal(dailyGoal); }}
                >
                    {isEditing ? 'Cancel' : 'Edit'}
                </button>
            </div>

            {isEditing ? (
                <div className="goal-editor">
                    <label>Goal (minutes):</label>
                    <div className="goal-editor-row">
                        <input
                            type="number"
                            min="1"
                            max="600"
                            value={tempGoal}
                            onChange={(e) => setTempGoal(e.target.value)}
                            className="goal-input"
                        />
                        <button className="goal-save-btn glass-button" onClick={handleSaveGoal}>
                            <Check size={16} /> Save
                        </button>
                    </div>
                </div>
            ) : (
                <div className="daily-target-body">
                    <div className="target-ring-wrapper">
                        <svg className="target-ring" width="160" height="160" viewBox="0 0 160 160">
                            <circle
                                cx="80" cy="80" r={radius}
                                fill="transparent"
                                stroke="rgba(255,255,255,0.06)"
                                strokeWidth="10"
                            />
                            <circle
                                cx="80" cy="80" r={radius}
                                fill="transparent"
                                stroke={isGoalMet ? 'var(--success)' : 'var(--accent-primary)'}
                                strokeWidth="10"
                                strokeLinecap="round"
                                style={{
                                    strokeDasharray: circumference,
                                    strokeDashoffset: strokeDashoffset,
                                    transition: 'stroke-dashoffset 0.8s ease',
                                    transform: 'rotate(-90deg)',
                                    transformOrigin: '50% 50%',
                                }}
                            />
                        </svg>
                        <div className="target-ring-text">
                            <span className="target-percent">{Math.round(percentage)}%</span>
                            <span className="target-label">{doneLabel} / {goalLabel}</span>
                        </div>
                    </div>
                    {isGoalMet && (
                        <div className="goal-met-badge animate-fade-in">
                            🎉 Goal reached!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DailyTarget;
