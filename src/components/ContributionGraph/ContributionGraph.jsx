import React from 'react';
import { Calendar } from 'lucide-react';
import './ContributionGraph.css';

const ContributionGraph = ({ sessions = [] }) => {
    // Helper to format date as local YYYY-MM-DD
    const getLocalDateStr = (dateObj) => {
        return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    };

    // Build a map of date -> total minutes
    const dateMap = {};
    sessions.forEach(s => {
        const dateKey = getLocalDateStr(new Date(s.date));
        dateMap[dateKey] = (dateMap[dateKey] || 0) + Math.round(s.duration / 60);
    });

    // Generate last 91 days (13 weeks)
    const today = new Date();
    const days = [];
    for (let i = 90; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = getLocalDateStr(d);
        days.push({
            date: key,
            minutes: dateMap[key] || 0,
            dayOfWeek: d.getDay(),
            label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        });
    }

    // Determine intensity levels
    const maxMins = Math.max(...days.map(d => d.minutes), 1);
    const getLevel = (mins) => {
        if (mins === 0) return 0;
        const ratio = mins / maxMins;
        if (ratio <= 0.25) return 1;
        if (ratio <= 0.5) return 2;
        if (ratio <= 0.75) return 3;
        return 4;
    };

    // Group into weeks (columns)
    const weeks = [];
    let currentWeek = [];
    // Pad the first week
    if (days.length > 0) {
        for (let i = 0; i < days[0].dayOfWeek; i++) {
            currentWeek.push(null);
        }
    }
    days.forEach(day => {
        currentWeek.push(day);
        if (day.dayOfWeek === 6) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });
    if (currentWeek.length > 0) {
        weeks.push(currentWeek);
    }

    const monthLabels = [];
    let lastMonth = '';
    weeks.forEach((week, wi) => {
        const firstDay = week.find(d => d !== null);
        if (firstDay) {
            const month = new Date(firstDay.date).toLocaleDateString(undefined, { month: 'short' });
            if (month !== lastMonth) {
                monthLabels.push({ label: month, index: wi });
                lastMonth = month;
            }
        }
    });

    return (
        <div className="contribution-graph glass-panel animate-fade-in">
            <h3 className="cg-title">
                <Calendar size={18} /> Study Activity
            </h3>
            <div className="cg-scroll">
                <div className="cg-months">
                    {monthLabels.map((m, i) => (
                        <span key={i} className="cg-month-label" style={{ gridColumnStart: m.index + 1 }}>
                            {m.label}
                        </span>
                    ))}
                </div>
                <div className="cg-grid-wrapper">
                    <div className="cg-day-labels">
                        <span></span>
                        <span>Mon</span>
                        <span></span>
                        <span>Wed</span>
                        <span></span>
                        <span>Fri</span>
                        <span></span>
                    </div>
                    <div className="cg-grid">
                        {weeks.map((week, wi) => (
                            <div key={wi} className="cg-week">
                                {week.map((day, di) => (
                                    day ? (
                                        <div
                                            key={di}
                                            className={`cg-cell level-${getLevel(day.minutes)}`}
                                            title={`${day.label}: ${day.minutes}m studied`}
                                        />
                                    ) : (
                                        <div key={di} className="cg-cell empty" />
                                    )
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="cg-legend">
                <span className="cg-legend-label">Less</span>
                <div className="cg-cell level-0" />
                <div className="cg-cell level-1" />
                <div className="cg-cell level-2" />
                <div className="cg-cell level-3" />
                <div className="cg-cell level-4" />
                <span className="cg-legend-label">More</span>
            </div>
        </div>
    );
};

export default ContributionGraph;
