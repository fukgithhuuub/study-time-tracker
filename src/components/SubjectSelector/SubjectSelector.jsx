import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Plus, X } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import * as db from '../../lib/dataService';
import './SubjectSelector.css';

const defaultSubjects = [
    { id: 'math-default', name: 'Mathematics', color: '#6366f1' },
    { id: 'cs-default', name: 'Computer Science', color: '#8b5cf6' },
    { id: 'physics-default', name: 'Physics', color: '#10b981' },
];

const SubjectSelector = ({ currentSubject, onSelectSubject }) => {
    const { user, isOnline } = useUser();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');
    const wrapperRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
                setIsAddingNew(false);
            }
        };
        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

    const [subjects, setSubjects] = useState([]);

    // Load subjects
    useEffect(() => {
        const loadSubjects = async () => {
            if (isOnline) {
                try {
                    const remote = await db.fetchSubjects(user.dbUserId);
                    if (remote.length > 0) {
                        setSubjects(remote);
                        return;
                    }
                    // If no subjects in DB yet, seed with defaults
                    for (const s of defaultSubjects) {
                        try { await db.insertSubject(user.dbUserId, s); } catch { /* ignore duplicates */ }
                    }
                    setSubjects(defaultSubjects);
                    return;
                } catch (err) {
                    console.error('Failed to fetch subjects from Supabase:', err);
                }
            }
            // Fallback: localStorage
            const saved = localStorage.getItem('study-tracker-subjects');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.length > 0) { setSubjects(parsed); return; }
                } catch { /* ignore */ }
            }
            setSubjects(defaultSubjects);
        };
        if (user) loadSubjects();
    }, [user, isOnline]);

    // Save to localStorage as backup
    useEffect(() => {
        if (user && subjects.length > 0) {
            localStorage.setItem('study-tracker-subjects', JSON.stringify(subjects));
        }
    }, [subjects, user]);

    const handleAddNew = async (e) => {
        e.preventDefault();
        if (newSubjectName.trim()) {
            const newSub = {
                id: Date.now(),
                name: newSubjectName.trim(),
                color: '#f59e0b',
            };
            setSubjects(prev => [...prev, newSub]);
            onSelectSubject(newSub);
            setNewSubjectName('');
            setIsAddingNew(false);
            setIsDropdownOpen(false);

            if (isOnline) {
                try { await db.insertSubject(user.dbUserId, newSub); }
                catch (err) { console.error('Failed to add subject to Supabase:', err); }
            }
        }
    };

    const selectSubject = (sub) => {
        onSelectSubject(sub);
        setIsDropdownOpen(false);
    };

    return (
        <div className="subject-selector-wrapper" ref={wrapperRef}>
            <button
                className="subject-display-btn glass-button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                <BookOpen size={18} style={{ color: currentSubject ? currentSubject.color : 'inherit' }} />
                {currentSubject ? currentSubject.name : 'Select Subject'}
            </button>

            {isDropdownOpen && (
                <div className="subject-dropdown glass-panel animate-fade-in">
                    <div className="subject-list">
                        {subjects.map(sub => (
                            <button
                                key={sub.id}
                                className={`subject-option ${currentSubject?.id === sub.id ? 'selected' : ''}`}
                                onClick={() => selectSubject(sub)}
                            >
                                <div className="subject-color-dot" style={{ backgroundColor: sub.color }}></div>
                                {sub.name}
                            </button>
                        ))}
                    </div>

                    <div className="add-subject-section">
                        {!isAddingNew ? (
                            <button className="add-subject-btn" onClick={() => setIsAddingNew(true)}>
                                <Plus size={16} /> New Subject
                            </button>
                        ) : (
                            <form onSubmit={handleAddNew} className="new-subject-form">
                                <input
                                    type="text"
                                    value={newSubjectName}
                                    onChange={(e) => setNewSubjectName(e.target.value)}
                                    placeholder="Subject name..."
                                    className="glass-input new-subject-input"
                                    autoFocus
                                />
                                <button type="submit" className="glass-button add-confirm-btn">
                                    <Plus size={16} />
                                </button>
                                <button type="button" className="glass-button close-btn" onClick={() => setIsAddingNew(false)}>
                                    <X size={16} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectSelector;
