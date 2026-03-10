import React, { useState } from 'react';
import { Clock, Tag, Trash2, Pencil, Check, X } from 'lucide-react';
import './RecentSessions.css';

const RecentSessions = ({ sessions = [], onDeleteSession, onEditSession }) => {
    const [editingId, setEditingId] = useState(null);
    const [editDuration, setEditDuration] = useState('');

    const displaySessions = sessions;

    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        if (m > 0) return `${m}m`;
        return `${seconds}s`;
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        }
    };

    const startEdit = (session) => {
        setEditingId(session.id);
        setEditDuration(Math.round(session.duration / 60).toString());
    };

    const confirmEdit = (sessionId) => {
        const newDurationMins = parseInt(editDuration) || 0;
        if (newDurationMins > 0 && onEditSession) {
            onEditSession(sessionId, newDurationMins * 60);
        }
        setEditingId(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    return (
        <div className="recent-sessions-container glass-panel animate-fade-in">
            <h3 className="section-title">Recent Activity</h3>

            {displaySessions.length === 0 ? (
                <div className="empty-state">
                    <Clock size={32} opacity={0.5} />
                    <p>No recent sessions yet. Start a timer to log your first study session!</p>
                </div>
            ) : (
                <div className="sessions-list">
                    {displaySessions.map((session) => (
                        <div key={session.id} className="session-item">
                            <div className="session-subject">
                                <div
                                    className="subject-color-indicator"
                                    style={{ backgroundColor: session.subject?.color || '#6366f1' }}
                                ></div>
                                <span className="subject-name">{session.subject?.name || 'Unknown'}</span>
                            </div>

                            <div className="session-details">
                                <div className="session-stat">
                                    <Tag size={14} /> {session.mode}
                                </div>

                                {editingId === session.id ? (
                                    <div className="session-edit-row">
                                        <input
                                            type="number"
                                            min="1"
                                            value={editDuration}
                                            onChange={(e) => setEditDuration(e.target.value)}
                                            className="session-edit-input"
                                            autoFocus
                                        />
                                        <span className="edit-unit">min</span>
                                        <button className="session-action-btn confirm" onClick={() => confirmEdit(session.id)} title="Save">
                                            <Check size={14} />
                                        </button>
                                        <button className="session-action-btn cancel" onClick={cancelEdit} title="Cancel">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="session-stat duration">
                                            <Clock size={14} /> {formatDuration(session.duration)}
                                        </div>
                                        <div className="session-date">
                                            {formatDate(session.date)}
                                        </div>
                                        <div className="session-actions">
                                            <button className="session-action-btn edit" onClick={() => startEdit(session)} title="Edit duration">
                                                <Pencil size={13} />
                                            </button>
                                            <button
                                                className="session-action-btn delete"
                                                onClick={() => onDeleteSession && onDeleteSession(session.id)}
                                                title="Delete session"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecentSessions;
