import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { User, Wifi, WifiOff, Key, LogOut, Upload, Download, Trash2, Eye, EyeOff } from 'lucide-react';
import Badges from '../Badges/Badges';
import './Profile.css';

const Profile = ({ sessions, onImportSessions, onClearAllData }) => {
    const { user, isOnline, logout } = useUser();
    const [showConfirmClear, setShowConfirmClear] = useState(false);
    const [showKey, setShowKey] = useState(false);

    // Parse a CSV line respecting quoted fields
    const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (inQuotes) {
                if (ch === '"' && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else if (ch === '"') {
                    inQuotes = false;
                } else {
                    current += ch;
                }
            } else {
                if (ch === '"') {
                    inQuotes = true;
                } else if (ch === ',') {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += ch;
                }
            }
        }
        result.push(current.trim());
        return result;
    };

    // Import CSV
    const handleImportCSV = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const text = ev.target.result;
                    const lines = text.split('\n').filter(l => l.trim());
                    if (lines.length <= 1) return;

                    const imported = [];
                    for (let i = 1; i < lines.length; i++) {
                        const parts = parseCSVLine(lines[i]);
                        if (parts.length >= 4) {
                            const dateStr = parts[0].trim();
                            const subjectName = parts[1].trim();
                            const durationMin = parseInt(parts[2].trim()) || 0;
                            const mode = parts[3].trim();

                            if (durationMin > 0) {
                                // Safely parse date — fallback to now if invalid
                                let parsedDate;
                                try {
                                    const d = new Date(dateStr);
                                    parsedDate = isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
                                } catch {
                                    parsedDate = new Date().toISOString();
                                }

                                imported.push({
                                    id: Date.now() + i,
                                    subject: { id: subjectName.toLowerCase().replace(/\s/g, '-'), name: subjectName, color: '#6366f1' },
                                    duration: durationMin * 60,
                                    mode: mode || 'Imported',
                                    date: parsedDate,
                                });
                            }
                        }
                    }
                    if (imported.length > 0 && onImportSessions) {
                        onImportSessions(imported);
                        alert(`Successfully imported ${imported.length} sessions!`);
                    }
                } catch (err) {
                    alert('Failed to parse CSV file. Please check the format.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    // Export CSV
    const handleExportCSV = () => {
        if (sessions.length === 0) {
            alert('No sessions to export!');
            return;
        }
        const escapeCSV = (val) => {
            const s = String(val);
            return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
        };
        const headers = ['Date', 'Subject', 'Duration (min)', 'Mode'];
        const rows = sessions.map(s => [
            escapeCSV(new Date(s.date).toISOString()),
            escapeCSV(s.subject?.name || 'Unknown'),
            Math.round(s.duration / 60),
            escapeCSV(s.mode),
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `studyflow-${user?.username || 'sessions'}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleClearAll = () => {
        if (onClearAllData) onClearAllData();
        setShowConfirmClear(false);
    };

    // Calculate total stats
    const totalSessions = sessions.length;
    const totalSeconds = sessions.reduce((a, s) => a + s.duration, 0);
    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMins = Math.floor((totalSeconds % 3600) / 60);
    const uniqueSubjects = new Set(sessions.map(s => s.subject?.name)).size;
    const uniqueDays = new Set(sessions.map(s => new Date(s.date).toDateString())).size;

    return (
        <div className="profile-page animate-fade-in">
            {/* User Card */}
            <div className="profile-card glass-panel">
                <div className="profile-avatar">
                    <User size={32} />
                </div>
                <div className="profile-info">
                    <h2 className="profile-name">{user?.username || 'User'}</h2>
                    <div className="profile-mode">
                        {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                        <span>{isOnline ? 'Online Mode (Syncing)' : 'Offline Mode (Local only)'}</span>
                    </div>
                    {isOnline && user?.secretKey && (
                        <div className="profile-secret">
                            <Key size={12} />
                            <span>Secret Key: </span>
                            <code>{showKey ? user.secretKey : '••••••••'}</code>
                            <button
                                className="key-toggle-btn"
                                onClick={() => setShowKey(!showKey)}
                                title={showKey ? 'Hide key' : 'Show key'}
                            >
                                {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                        </div>
                    )}
                    <span className="profile-since">
                        Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'today'}
                    </span>
                </div>
                <button className="profile-logout" onClick={logout} title="Log out">
                    <LogOut size={16} /> Log Out
                </button>
            </div>

            {/* Stats Overview */}
            <div className="profile-stats glass-panel">
                <h3 className="profile-section-title">Lifetime Stats</h3>
                <div className="profile-stat-grid">
                    <div className="profile-stat">
                        <span className="profile-stat-value">{totalSessions}</span>
                        <span className="profile-stat-label">Sessions</span>
                    </div>
                    <div className="profile-stat">
                        <span className="profile-stat-value">{totalHours}h {totalMins}m</span>
                        <span className="profile-stat-label">Total Study</span>
                    </div>
                    <div className="profile-stat">
                        <span className="profile-stat-value">{uniqueSubjects}</span>
                        <span className="profile-stat-label">Subjects</span>
                    </div>
                    <div className="profile-stat">
                        <span className="profile-stat-value">{uniqueDays}</span>
                        <span className="profile-stat-label">Active Days</span>
                    </div>
                </div>
            </div>

            {/* Badges */}
            <Badges sessions={sessions} />

            {/* Data Management */}
            <div className="profile-data glass-panel">
                <h3 className="profile-section-title">Data Management</h3>
                <div className="data-actions">
                    <button className="data-action-btn export" onClick={handleExportCSV}>
                        <Download size={18} /> Export to CSV
                    </button>
                    <button className="data-action-btn import" onClick={handleImportCSV}>
                        <Upload size={18} /> Import from CSV
                    </button>
                    <button className="data-action-btn danger" onClick={() => setShowConfirmClear(true)}>
                        <Trash2 size={18} /> Clear All Data
                    </button>
                </div>
                {showConfirmClear && (
                    <div className="clear-confirm animate-fade-in">
                        <p>⚠️ This will delete ALL sessions, tasks, and settings. Are you sure?</p>
                        <div className="clear-confirm-btns">
                            <button className="glass-button" onClick={() => setShowConfirmClear(false)}>Cancel</button>
                            <button className="glass-button danger-btn" onClick={handleClearAll}>Yes, Delete Everything</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
