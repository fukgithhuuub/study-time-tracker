import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import './CalendarView.css';

const CalendarView = ({ sessions = [] }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthName = currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Build session map for this month
    const sessionMap = useMemo(() => {
        const map = {};
        sessions.forEach(s => {
            const d = new Date(s.date);
            if (d.getFullYear() === year && d.getMonth() === month) {
                const day = d.getDate();
                if (!map[day]) map[day] = [];
                map[day].push(s);
            }
        });
        return map;
    }, [sessions, year, month]);

    // Calendar grid
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendarDays = [];

    // Previous month trailing days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        calendarDays.push({ day: daysInPrevMonth - i, inMonth: false, sessions: [] });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
        calendarDays.push({ day: d, inMonth: true, sessions: sessionMap[d] || [] });
    }

    // Next month leading days
    const remaining = 42 - calendarDays.length;
    for (let i = 1; i <= remaining; i++) {
        calendarDays.push({ day: i, inMonth: false, sessions: [] });
    }

    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
        weeks.push(calendarDays.slice(i, i + 7));
    }

    const today = new Date();
    const isToday = (day, inMonth) =>
        inMonth && day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    const getIntensityClass = (sessionList) => {
        if (sessionList.length === 0) return '';
        const totalMins = sessionList.reduce((a, s) => a + s.duration, 0) / 60;
        if (totalMins >= 180) return 'intensity-high';
        if (totalMins >= 60) return 'intensity-medium';
        return 'intensity-low';
    };

    // Month summary stats
    const monthSessions = sessions.filter(s => {
        const d = new Date(s.date);
        return d.getFullYear() === year && d.getMonth() === month;
    });
    const monthTotalSeconds = monthSessions.reduce((a, s) => a + s.duration, 0);
    const monthActiveDays = new Set(monthSessions.map(s => new Date(s.date).getDate())).size;

    const [selectedDay, setSelectedDay] = useState(null);

    const selectedDaySessions = selectedDay && sessionMap[selectedDay] ? sessionMap[selectedDay] : [];

    return (
        <div className="calendar-view glass-panel animate-fade-in">
            <div className="cal-header">
                <h3 className="cal-title">
                    <Calendar size={18} /> Calendar
                </h3>
                <div className="cal-nav">
                    <button className="cal-nav-btn" onClick={prevMonth}>
                        <ChevronLeft size={18} />
                    </button>
                    <span className="cal-month-label">{monthName}</span>
                    <button className="cal-nav-btn" onClick={nextMonth}>
                        <ChevronRight size={18} />
                    </button>
                    <button className="cal-today-btn" onClick={goToToday}>Today</button>
                </div>
            </div>

            {/* Month summary */}
            <div className="cal-month-summary">
                <div className="cal-summary-stat">
                    <span className="cal-summary-value">{monthSessions.length}</span>
                    <span className="cal-summary-label">Sessions</span>
                </div>
                <div className="cal-summary-stat">
                    <span className="cal-summary-value">{formatDuration(monthTotalSeconds)}</span>
                    <span className="cal-summary-label">Total</span>
                </div>
                <div className="cal-summary-stat">
                    <span className="cal-summary-value">{monthActiveDays}</span>
                    <span className="cal-summary-label">Active Days</span>
                </div>
            </div>

            {/* Calendar grid */}
            <div className="cal-grid">
                <div className="cal-weekdays">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="cal-weekday">{d}</div>
                    ))}
                </div>
                {weeks.map((week, wi) => (
                    <div key={wi} className="cal-week">
                        {week.map((cell, di) => (
                            <div
                                key={di}
                                className={`cal-day ${cell.inMonth ? '' : 'other-month'} ${isToday(cell.day, cell.inMonth) ? 'today' : ''} ${getIntensityClass(cell.sessions)} ${selectedDay === cell.day && cell.inMonth ? 'selected' : ''}`}
                                onClick={() => cell.inMonth && cell.sessions.length > 0 && setSelectedDay(selectedDay === cell.day ? null : cell.day)}
                            >
                                <span className="cal-day-number">{cell.day}</span>
                                {cell.sessions.length > 0 && (
                                    <div className="cal-day-dots">
                                        {cell.sessions.slice(0, 3).map((s, si) => (
                                            <span
                                                key={si}
                                                className="cal-dot"
                                                style={{ backgroundColor: s.subject?.color || '#6366f1' }}
                                            />
                                        ))}
                                        {cell.sessions.length > 3 && (
                                            <span className="cal-dot-more">+{cell.sessions.length - 3}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Selected day details */}
            {selectedDay && selectedDaySessions.length > 0 && (
                <div className="cal-day-detail animate-fade-in">
                    <h4 className="cal-detail-title">
                        {new Date(year, month, selectedDay).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h4>
                    <div className="cal-detail-sessions">
                        {selectedDaySessions.map((s, i) => (
                            <div key={i} className="cal-detail-session">
                                <div className="cal-detail-color" style={{ backgroundColor: s.subject?.color || '#6366f1' }} />
                                <span className="cal-detail-subject">{s.subject?.name || 'Unknown'}</span>
                                <span className="cal-detail-mode">{s.mode}</span>
                                <span className="cal-detail-duration">
                                    <Clock size={12} /> {formatDuration(s.duration)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarView;
