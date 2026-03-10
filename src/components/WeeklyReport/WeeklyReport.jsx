import React, { useMemo, useRef } from 'react';
import { FileText, Download, Mail, Calendar, Clock, Target, Flame } from 'lucide-react';
import './WeeklyReport.css';

const WeeklyReport = ({ sessions = [], username = 'User' }) => {
    const reportRef = useRef(null);

    const report = useMemo(() => {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);

        const weekSessions = sessions.filter(s => new Date(s.date) >= weekStart);
        const totalSeconds = weekSessions.reduce((a, s) => a + s.duration, 0);
        const totalMinutes = Math.round(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const remainMins = totalMinutes % 60;

        // Active days this week
        const activeDays = new Set(weekSessions.map(s => new Date(s.date).toDateString())).size;

        // Subject breakdown
        const subjectMap = {};
        weekSessions.forEach(s => {
            const name = s.subject?.name || 'Uncategorized';
            if (!subjectMap[name]) subjectMap[name] = { minutes: 0, sessions: 0, color: s.subject?.color || '#6366f1' };
            subjectMap[name].minutes += Math.round(s.duration / 60);
            subjectMap[name].sessions += 1;
        });

        const subjectBreakdown = Object.entries(subjectMap)
            .sort((a, b) => b[1].minutes - a[1].minutes)
            .map(([name, data]) => ({ name, ...data }));

        // Daily breakdown
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dailyMap = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dayKey = d.toDateString();
            dailyMap[dayKey] = { label: dayNames[d.getDay()], date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), minutes: 0, sessions: 0 };
        }
        weekSessions.forEach(s => {
            const key = new Date(s.date).toDateString();
            if (dailyMap[key]) {
                dailyMap[key].minutes += Math.round(s.duration / 60);
                dailyMap[key].sessions += 1;
            }
        });
        const dailyBreakdown = Object.values(dailyMap);

        // Averages
        const avgMinsPerDay = activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0;
        const avgSessionMins = weekSessions.length > 0 ? Math.round(totalMinutes / weekSessions.length) : 0;

        // Mode breakdown
        const pomodoroCount = weekSessions.filter(s => s.mode === 'Pomodoro').length;
        const stopwatchCount = weekSessions.filter(s => s.mode === 'Stopwatch').length;
        const focusCount = weekSessions.filter(s => s.mode === 'Focus').length;

        // Best day
        const bestDay = dailyBreakdown.reduce((best, d) => d.minutes > best.minutes ? d : best, { minutes: 0, label: '—', date: '' });

        return {
            weekStart: weekStart.toLocaleDateString(undefined, { month: 'long', day: 'numeric' }),
            weekEnd: now.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }),
            totalSessions: weekSessions.length,
            totalHours,
            remainMins,
            totalMinutes,
            activeDays,
            avgMinsPerDay,
            avgSessionMins,
            subjectBreakdown,
            dailyBreakdown,
            pomodoroCount,
            stopwatchCount,
            focusCount,
            bestDay,
        };
    }, [sessions]);

    const generateTextReport = () => {
        let text = `📊 WEEKLY STUDY REPORT\n`;
        text += `Prepared for: ${username}\n`;
        text += `Period: ${report.weekStart} — ${report.weekEnd}\n`;
        text += `${'═'.repeat(50)}\n\n`;

        text += `📈 OVERVIEW\n`;
        text += `  Total Sessions: ${report.totalSessions}\n`;
        text += `  Total Study Time: ${report.totalHours}h ${report.remainMins}m\n`;
        text += `  Active Days: ${report.activeDays}/7\n`;
        text += `  Avg per Active Day: ${report.avgMinsPerDay}m\n`;
        text += `  Avg per Session: ${report.avgSessionMins}m\n\n`;

        text += `🏆 Best Day: ${report.bestDay.label} (${report.bestDay.date}) — ${report.bestDay.minutes}m\n\n`;

        text += `🕐 MODE BREAKDOWN\n`;
        text += `  Pomodoro: ${report.pomodoroCount} sessions\n`;
        text += `  Stopwatch: ${report.stopwatchCount} sessions\n`;
        text += `  Focus: ${report.focusCount} sessions\n\n`;

        text += `📚 SUBJECTS\n`;
        report.subjectBreakdown.forEach(s => {
            text += `  ${s.name}: ${s.minutes}m (${s.sessions} sessions)\n`;
        });
        text += `\n`;

        text += `📅 DAILY BREAKDOWN\n`;
        report.dailyBreakdown.forEach(d => {
            const bar = '█'.repeat(Math.min(20, Math.round(d.minutes / 10))) || '░';
            text += `  ${d.label.padEnd(10)} ${d.date.padEnd(8)} ${bar} ${d.minutes}m\n`;
        });

        text += `\n${'═'.repeat(50)}\n`;
        text += `Generated by StudyFlow on ${new Date().toLocaleString()}\n`;

        return text;
    };

    const handleDownloadReport = () => {
        const text = generateTextReport();
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `StudyFlow-WeeklyReport-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleEmailDraft = () => {
        const text = generateTextReport();
        const subject = encodeURIComponent(`StudyFlow Weekly Report — ${report.weekStart} to ${report.weekEnd}`);
        const body = encodeURIComponent(text);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
    };

    const maxSubjectMins = report.subjectBreakdown.length > 0 ? report.subjectBreakdown[0].minutes : 1;

    return (
        <div className="weekly-report glass-panel animate-fade-in" ref={reportRef}>
            <div className="wr-header">
                <h3 className="wr-title">
                    <FileText size={18} /> Weekly Report
                </h3>
                <div className="wr-actions">
                    <button className="wr-action-btn" onClick={handleDownloadReport} title="Download Report">
                        <Download size={14} /> Download
                    </button>
                    <button className="wr-action-btn" onClick={handleEmailDraft} title="Draft Email">
                        <Mail size={14} /> Email
                    </button>
                </div>
            </div>

            <div className="wr-period">
                <Calendar size={14} /> {report.weekStart} — {report.weekEnd}
            </div>

            {/* Overview cards */}
            <div className="wr-overview">
                <div className="wr-stat">
                    <Clock size={16} />
                    <span className="wr-stat-value">{report.totalHours}h {report.remainMins}m</span>
                    <span className="wr-stat-label">Total</span>
                </div>
                <div className="wr-stat">
                    <Target size={16} />
                    <span className="wr-stat-value">{report.totalSessions}</span>
                    <span className="wr-stat-label">Sessions</span>
                </div>
                <div className="wr-stat">
                    <Flame size={16} />
                    <span className="wr-stat-value">{report.activeDays}/7</span>
                    <span className="wr-stat-label">Active Days</span>
                </div>
            </div>

            {/* Subject bars */}
            {report.subjectBreakdown.length > 0 && (
                <div className="wr-subjects">
                    <h4 className="wr-section-title">Subject Breakdown</h4>
                    {report.subjectBreakdown.map((s, i) => (
                        <div key={i} className="wr-subject-row">
                            <div className="wr-subject-name">
                                <span className="wr-subject-dot" style={{ backgroundColor: s.color }} />
                                {s.name}
                            </div>
                            <div className="wr-subject-bar-track">
                                <div
                                    className="wr-subject-bar-fill"
                                    style={{
                                        width: `${(s.minutes / maxSubjectMins) * 100}%`,
                                        backgroundColor: s.color,
                                    }}
                                />
                            </div>
                            <span className="wr-subject-mins">{s.minutes}m</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Daily breakdown */}
            <div className="wr-daily">
                <h4 className="wr-section-title">Daily Activity</h4>
                <div className="wr-daily-grid">
                    {report.dailyBreakdown.map((d, i) => {
                        const maxDailyMins = Math.max(...report.dailyBreakdown.map(x => x.minutes), 1);
                        const height = d.minutes > 0 ? Math.max(8, (d.minutes / maxDailyMins) * 100) : 4;
                        return (
                            <div key={i} className="wr-daily-col">
                                <div className="wr-daily-bar-wrapper">
                                    <div
                                        className="wr-daily-bar"
                                        style={{ height: `${height}%` }}
                                        title={`${d.minutes}m`}
                                    />
                                </div>
                                <span className="wr-daily-label">{d.label.slice(0, 3)}</span>
                                <span className="wr-daily-mins">{d.minutes}m</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Best day highlight */}
            {report.bestDay.minutes > 0 && (
                <div className="wr-best-day">
                    🏆 Best day: <strong>{report.bestDay.label}</strong> ({report.bestDay.date}) — {report.bestDay.minutes} minutes
                </div>
            )}
        </div>
    );
};

export default WeeklyReport;
