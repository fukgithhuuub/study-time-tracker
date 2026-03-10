import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Flame, Target } from 'lucide-react';
import './Stats.css';

const Stats = ({ sessions = [] }) => {
    // Filter sessions to current week only (last 7 days) for the chart
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const thisWeekSessions = sessions.filter(s => new Date(s.date) >= sevenDaysAgo);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const subjectMap = {};

    thisWeekSessions.forEach(session => {
        const dayIndex = new Date(session.date).getDay();
        const dayName = dayNames[dayIndex];
        const subjectName = session.subject?.name || 'Other';
        const mins = Math.round(session.duration / 60);

        if (!subjectMap[dayName]) subjectMap[dayName] = {};
        subjectMap[dayName][subjectName] = (subjectMap[dayName][subjectName] || 0) + mins;
    });

    // Collect all unique subjects
    const allSubjects = [...new Set(thisWeekSessions.map(s => s.subject?.name || 'Other'))];
    const subjectColors = ['#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#38bdf8', '#fb923c'];

    // Generate chronological day names for the last 7 days
    const chartDays = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        return dayNames[d.getDay()];
    });

    const data = chartDays.map(day => {
        const row = { name: day };
        allSubjects.forEach(sub => {
            row[sub] = subjectMap[day]?.[sub] || 0;
        });
        return row;
    });

    // Calculate real consecutive streak ending today/yesterday
    const calculateStreak = () => {
        const dateSet = new Set(sessions.map(s => new Date(s.date).toDateString()));
        let streak = 0;
        const d = new Date();
        // Check if studied today — if not, start from yesterday
        if (!dateSet.has(d.toDateString())) {
            d.setDate(d.getDate() - 1);
        }
        while (dateSet.has(d.toDateString())) {
            streak++;
            d.setDate(d.getDate() - 1);
        }
        return streak;
    };

    const totalSeconds = sessions.reduce((acc, curr) => acc + curr.duration, 0);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const totalFocusedText = totalSeconds > 0 ? `${h}h ${m}m` : '0h 0m';

    const streak = calculateStreak();
    const streakText = streak === 1 ? '1 Day' : `${streak} Days`;

    // Track mount state to avoid rendering chart before layout is ready
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="stats-container animate-fade-in">
            <div className="stats-grid">
                <div className="stat-card glass-panel">
                    <div className="stat-icon flame">
                        <Flame size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{streak > 0 ? streakText : '0 Days'}</span>
                        <span className="stat-label">Current Streak</span>
                    </div>
                </div>

                <div className="stat-card glass-panel">
                    <div className="stat-icon activity">
                        <Activity size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{totalFocusedText}</span>
                        <span className="stat-label">Total Focused</span>
                    </div>
                </div>

                <div className="stat-card glass-panel">
                    <div className="stat-icon target">
                        <Target size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{sessions.length} sessions</span>
                        <span className="stat-label">Total Sessions</span>
                    </div>
                </div>
            </div>

            <div className="chart-section glass-panel">
                <h3 className="chart-title">Weekly Subject Distribution (Minutes)</h3>
                <div className="chart-wrapper">
                    {mounted && (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                            >
                                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                />
                                {allSubjects.map((sub, i) => (
                                    <Bar
                                        key={sub}
                                        dataKey={sub}
                                        stackId="a"
                                        fill={subjectColors[i % subjectColors.length]}
                                        radius={i === allSubjects.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                    />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Stats;
