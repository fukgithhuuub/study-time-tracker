import React, { useMemo } from 'react';
import { Award, Star, Zap, Trophy, Flame, BookOpen, Clock, Target } from 'lucide-react';
import './Badges.css';

const BADGE_DEFINITIONS = [
    { id: 'first_session', label: 'First Step', desc: 'Complete your first session', icon: Star, color: '#f59e0b', check: (s) => s.length >= 1 },
    { id: 'five_sessions', label: 'Getting Started', desc: 'Complete 5 sessions', icon: Zap, color: '#6366f1', check: (s) => s.length >= 5 },
    { id: 'ten_sessions', label: 'Dedicated', desc: 'Complete 10 sessions', icon: Flame, color: '#ef4444', check: (s) => s.length >= 10 },
    { id: 'twenty_five', label: 'Scholar', desc: 'Complete 25 sessions', icon: BookOpen, color: '#10b981', check: (s) => s.length >= 25 },
    { id: 'fifty_sessions', label: 'Master', desc: 'Complete 50 sessions', icon: Trophy, color: '#8b5cf6', check: (s) => s.length >= 50 },
    { id: 'one_hour', label: 'Hour Power', desc: 'Study for 1+ hour total', icon: Clock, color: '#38bdf8', check: (s) => s.reduce((a, x) => a + x.duration, 0) >= 3600 },
    { id: 'five_hours', label: 'Deep Diver', desc: 'Study for 5+ hours total', icon: Target, color: '#f472b6', check: (s) => s.reduce((a, x) => a + x.duration, 0) >= 18000 },
    { id: 'three_subjects', label: 'Well Rounded', desc: 'Study 3+ different subjects', icon: BookOpen, color: '#fb923c', check: (s) => new Set(s.map(x => x.subject?.name)).size >= 3 },
    { id: 'ten_hours', label: 'Marathon', desc: 'Study for 10+ hours total', icon: Flame, color: '#ef4444', check: (s) => s.reduce((a, x) => a + x.duration, 0) >= 36000 },
];

const LEVELS = [
    { level: 1, xpNeeded: 0, title: 'Beginner' },
    { level: 2, xpNeeded: 50, title: 'Novice' },
    { level: 3, xpNeeded: 150, title: 'Student' },
    { level: 4, xpNeeded: 300, title: 'Learner' },
    { level: 5, xpNeeded: 500, title: 'Scholar' },
    { level: 6, xpNeeded: 800, title: 'Expert' },
    { level: 7, xpNeeded: 1200, title: 'Master' },
    { level: 8, xpNeeded: 1800, title: 'Grandmaster' },
    { level: 9, xpNeeded: 2500, title: 'Legend' },
    { level: 10, xpNeeded: 3500, title: 'Sage' },
];

const Badges = ({ sessions = [] }) => {
    const { earnedBadges, totalXP, currentLevel, nextLevel, xpProgress } = useMemo(() => {
        const earned = BADGE_DEFINITIONS.filter(b => b.check(sessions));

        // XP calculation: 10 XP per session + 5 XP per 10 minutes studied + badge bonuses
        const sessionXP = sessions.length * 10;
        const minuteXP = Math.floor(sessions.reduce((a, s) => a + s.duration, 0) / 600) * 5;
        const badgeXP = earned.length * 25;
        const totalXP = sessionXP + minuteXP + badgeXP;

        // Find current level
        let currentLevel = LEVELS[0];
        let nextLevel = LEVELS[1] || null;
        for (let i = LEVELS.length - 1; i >= 0; i--) {
            if (totalXP >= LEVELS[i].xpNeeded) {
                currentLevel = LEVELS[i];
                nextLevel = LEVELS[i + 1] || null;
                break;
            }
        }

        const xpIntoLevel = totalXP - currentLevel.xpNeeded;
        const xpForNextLevel = nextLevel ? nextLevel.xpNeeded - currentLevel.xpNeeded : 1;
        const xpProgress = nextLevel ? Math.min((xpIntoLevel / xpForNextLevel) * 100, 100) : 100;

        return { earnedBadges: earned, totalXP, currentLevel, nextLevel, xpProgress };
    }, [sessions]);

    return (
        <div className="badges glass-panel animate-fade-in">
            <h3 className="badges-title">
                <Award size={18} /> Level & Badges
            </h3>

            {/* Level Progress */}
            <div className="level-section">
                <div className="level-header">
                    <div className="level-info">
                        <span className="level-number">Lv.{currentLevel.level}</span>
                        <span className="level-name">{currentLevel.title}</span>
                    </div>
                    <span className="xp-text">{totalXP} XP</span>
                </div>
                <div className="xp-bar-track">
                    <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
                </div>
                {nextLevel && (
                    <div className="xp-next">
                        {nextLevel.xpNeeded - totalXP} XP to Lv.{nextLevel.level} ({nextLevel.title})
                    </div>
                )}
            </div>

            {/* Badges Grid */}
            <div className="badges-grid">
                {BADGE_DEFINITIONS.map(badge => {
                    const Icon = badge.icon;
                    const earned = earnedBadges.some(b => b.id === badge.id);
                    return (
                        <div
                            key={badge.id}
                            className={`badge-item ${earned ? 'earned' : 'locked'}`}
                            title={`${badge.label}: ${badge.desc}`}
                        >
                            <div
                                className="badge-icon"
                                style={{ backgroundColor: earned ? `${badge.color}20` : 'rgba(255,255,255,0.03)', color: earned ? badge.color : 'var(--text-muted)' }}
                            >
                                <Icon size={20} />
                            </div>
                            <span className="badge-label">{badge.label}</span>
                            <span className="badge-desc">{badge.desc}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Badges;
