import React, { useState, useEffect, useMemo } from 'react';
import { Brain, Plus, X, Check, RotateCcw, Trash2, Clock, Star } from 'lucide-react';
import './SpacedRepetition.css';

const SR_INTERVALS = [1, 3, 7, 14, 30]; // Days between reviews

const SpacedRepetition = () => {
    const [cards, setCards] = useState(() => {
        const saved = localStorage.getItem('study-tracker-sr-cards');
        if (saved) {
            try { return JSON.parse(saved); } catch { /* ignore */ }
        }
        return [];
    });

    const [isAdding, setIsAdding] = useState(false);
    const [newFront, setNewFront] = useState('');
    const [newBack, setNewBack] = useState('');
    const [reviewingCard, setReviewingCard] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [filter, setFilter] = useState('due'); // 'due', 'all'

    // Persist
    useEffect(() => {
        localStorage.setItem('study-tracker-sr-cards', JSON.stringify(cards));
    }, [cards]);

    const addCard = (e) => {
        e.preventDefault();
        if (newFront.trim() && newBack.trim()) {
            const card = {
                id: Date.now(),
                front: newFront.trim(),
                back: newBack.trim(),
                level: 0, // 0-4 index into SR_INTERVALS
                nextReview: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                totalReviews: 0,
            };
            setCards(prev => [...prev, card]);
            setNewFront('');
            setNewBack('');
            setIsAdding(false);
        }
    };

    const deleteCard = (id) => {
        setCards(prev => prev.filter(c => c.id !== id));
        if (reviewingCard?.id === id) {
            setReviewingCard(null);
            setShowAnswer(false);
        }
    };

    const getDueCards = useMemo(() => {
        const now = new Date();
        return cards.filter(c => new Date(c.nextReview) <= now);
    }, [cards]);

    const displayCards = filter === 'due' ? getDueCards : cards;

    const startReview = (card) => {
        setReviewingCard(card);
        setShowAnswer(false);
    };

    const handleReviewResult = (remembered) => {
        if (!reviewingCard) return;

        setCards(prev => prev.map(c => {
            if (c.id !== reviewingCard.id) return c;

            let newLevel;
            if (remembered) {
                newLevel = Math.min(c.level + 1, SR_INTERVALS.length - 1);
            } else {
                newLevel = 0; // Reset to beginning
            }

            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + SR_INTERVALS[newLevel]);

            return {
                ...c,
                level: newLevel,
                nextReview: nextDate.toISOString(),
                totalReviews: c.totalReviews + 1,
            };
        }));

        setReviewingCard(null);
        setShowAnswer(false);
    };

    const getNextReviewLabel = (isoDate) => {
        const next = new Date(isoDate);
        const now = new Date();
        const diffMs = next - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return 'Due now';
        if (diffDays === 1) return 'Tomorrow';
        return `In ${diffDays} days`;
    };

    const getLevelStars = (level) => {
        return Array.from({ length: SR_INTERVALS.length }, (_, i) => i < level + 1);
    };

    const totalDue = getDueCards.length;
    const totalMastered = cards.filter(c => c.level >= SR_INTERVALS.length - 1).length;

    return (
        <div className="sr-container glass-panel animate-fade-in">
            <div className="sr-header">
                <h3 className="sr-title">
                    <Brain size={18} /> Spaced Repetition
                </h3>
                <button className="sr-add-btn" onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? <X size={16} /> : <Plus size={16} />}
                </button>
            </div>

            {/* Stats row */}
            <div className="sr-stats-row">
                <span className="sr-stat">
                    <span className={`sr-stat-val ${totalDue > 0 ? 'due' : ''}`}>{totalDue}</span> due
                </span>
                <span className="sr-stat">
                    <span className="sr-stat-val">{cards.length}</span> total
                </span>
                <span className="sr-stat">
                    <span className="sr-stat-val mastered">{totalMastered}</span> mastered
                </span>
            </div>

            {/* Add card form */}
            {isAdding && (
                <form onSubmit={addCard} className="sr-add-form animate-fade-in">
                    <input
                        type="text"
                        value={newFront}
                        onChange={e => setNewFront(e.target.value)}
                        placeholder="Question / Front..."
                        className="glass-input sr-input"
                        autoFocus
                    />
                    <input
                        type="text"
                        value={newBack}
                        onChange={e => setNewBack(e.target.value)}
                        placeholder="Answer / Back..."
                        className="glass-input sr-input"
                    />
                    <button type="submit" className="glass-button sr-submit" disabled={!newFront.trim() || !newBack.trim()}>
                        <Plus size={14} /> Add Card
                    </button>
                </form>
            )}

            {/* Review modal */}
            {reviewingCard && (
                <div className="sr-review-card animate-fade-in">
                    <div className="sr-review-front">
                        <span className="sr-review-label">Question</span>
                        <p className="sr-review-text">{reviewingCard.front}</p>
                    </div>

                    {showAnswer ? (
                        <>
                            <div className="sr-review-back animate-fade-in">
                                <span className="sr-review-label">Answer</span>
                                <p className="sr-review-text answer">{reviewingCard.back}</p>
                            </div>
                            <div className="sr-review-actions">
                                <button className="sr-review-btn forgot" onClick={() => handleReviewResult(false)}>
                                    <RotateCcw size={14} /> Forgot
                                </button>
                                <button className="sr-review-btn remembered" onClick={() => handleReviewResult(true)}>
                                    <Check size={14} /> Remembered
                                </button>
                            </div>
                        </>
                    ) : (
                        <button className="sr-reveal-btn glass-button" onClick={() => setShowAnswer(true)}>
                            Show Answer
                        </button>
                    )}
                </div>
            )}

            {/* Filter tabs */}
            <div className="sr-filter-tabs">
                <button className={`sr-filter-tab ${filter === 'due' ? 'active' : ''}`} onClick={() => setFilter('due')}>
                    Due ({totalDue})
                </button>
                <button className={`sr-filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                    All ({cards.length})
                </button>
            </div>

            {/* Card list */}
            <div className="sr-card-list">
                {displayCards.length === 0 ? (
                    <p className="sr-empty">
                        {filter === 'due' ? 'No cards due for review! 🎉' : 'No flashcards yet. Add one to begin.'}
                    </p>
                ) : (
                    displayCards.map(card => (
                        <div key={card.id} className="sr-card-item">
                            <div className="sr-card-content">
                                <span className="sr-card-front">{card.front}</span>
                                <div className="sr-card-meta">
                                    <div className="sr-card-stars">
                                        {getLevelStars(card.level).map((filled, i) => (
                                            <Star key={i} size={10} fill={filled ? '#f59e0b' : 'transparent'} color={filled ? '#f59e0b' : 'var(--text-muted)'} />
                                        ))}
                                    </div>
                                    <span className="sr-card-next">
                                        <Clock size={10} /> {getNextReviewLabel(card.nextReview)}
                                    </span>
                                </div>
                            </div>
                            <div className="sr-card-actions">
                                {new Date(card.nextReview) <= new Date() && (
                                    <button className="sr-card-review-btn" onClick={() => startReview(card)} title="Review">
                                        <Brain size={14} />
                                    </button>
                                )}
                                <button className="sr-card-delete-btn" onClick={() => deleteCard(card.id)} title="Delete">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SpacedRepetition;
