import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Maximize2, Minimize2, Play, Pause, RotateCcw, X, Volume2, VolumeX } from 'lucide-react';
import './FocusMode.css';

const FocusMode = ({ onSessionComplete, currentSubject }) => {
    const [isActive, setIsActive] = useState(false);
    const [isFocusActive, setIsFocusActive] = useState(false);
    const [time, setTime] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef(null);
    const intervalRef = useRef(null);

    // Fullscreen handling
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen?.().then(() => {
                setIsFullscreen(true);
            }).catch(() => { });
        } else {
            document.exitFullscreen?.().then(() => {
                setIsFullscreen(false);
            }).catch(() => { });
        }
    }, []);

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    // Timer tick
    useEffect(() => {
        if (isFocusActive) {
            intervalRef.current = setInterval(() => {
                setTime(t => t + 1);
            }, 1000);
        }
        return () => clearInterval(intervalRef.current);
    }, [isFocusActive]);

    const toggleTimer = () => {
        setIsFocusActive(prev => !prev);
    };

    const resetTimer = () => {
        setIsFocusActive(false);
        setTime(0);
    };

    const saveAndExit = async () => {
        if (time > 0 && onSessionComplete) {
            await onSessionComplete(time, 'Focus');
        }
        setIsFocusActive(false);
        setTime(0);
        setIsActive(false);
        if (document.fullscreenElement) {
            document.exitFullscreen?.();
        }
    };

    const exitFocusMode = () => {
        if (time > 0) {
            if (!window.confirm('You have unsaved study time. Exit anyway?')) return;
        }
        setIsFocusActive(false);
        setTime(0);
        setIsActive(false);
        if (document.fullscreenElement) {
            document.exitFullscreen?.();
        }
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) {
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Motivational quotes that rotate
    const quotes = [
        "Deep work creates an unmatched advantage.",
        "Focus is the gateway to all thinking.",
        "Small consistent effort beats sporadic bursts.",
        "The present moment is your greatest asset.",
        "Discipline is choosing between what you want now and what you want most.",
        "Every minute of focus compounds into mastery.",
    ];
    const quoteIndex = Math.floor(time / 30) % quotes.length;

    if (!isActive) {
        return (
            <button className="focus-mode-trigger glass-button" onClick={() => setIsActive(true)} title="Enter Focus Mode">
                <Maximize2 size={16} /> Focus Mode
            </button>
        );
    }

    return (
        <div className={`focus-mode-overlay ${isFullscreen ? 'fullscreen' : ''}`} ref={containerRef}>
            <div className="focus-mode-backdrop" />

            <div className="focus-mode-content">
                <div className="focus-mode-header">
                    <button className="focus-close-btn" onClick={exitFocusMode} title="Exit Focus Mode">
                        <X size={20} />
                    </button>
                    <button className="focus-fs-btn" onClick={toggleFullscreen} title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                </div>

                <div className="focus-mode-center">
                    <div className="focus-subject-label">
                        {currentSubject ? (
                            <>
                                <span className="focus-subject-dot" style={{ backgroundColor: currentSubject.color }} />
                                {currentSubject.name}
                            </>
                        ) : (
                            'Free Focus Session'
                        )}
                    </div>

                    <div className="focus-timer-ring">
                        <svg width="320" height="320" viewBox="0 0 320 320">
                            {/* Animated orbit */}
                            <circle
                                cx="160" cy="160" r="140"
                                fill="transparent"
                                stroke="rgba(255,255,255,0.04)"
                                strokeWidth="4"
                            />
                            {isFocusActive && (
                                <circle
                                    className="focus-orbit-dot"
                                    cx="160" cy="20"
                                    r="4"
                                    fill="var(--accent-primary)"
                                >
                                    <animateTransform
                                        attributeName="transform"
                                        type="rotate"
                                        from="0 160 160"
                                        to="360 160 160"
                                        dur="8s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                            )}
                        </svg>
                        <div className="focus-time-display">
                            {formatTime(time)}
                        </div>
                    </div>

                    <p className="focus-quote">{quotes[quoteIndex]}</p>

                    <div className="focus-controls">
                        <button className="focus-ctrl-btn glass-button" onClick={resetTimer} title="Reset">
                            <RotateCcw size={24} />
                        </button>
                        <button className="focus-ctrl-btn primary glass-button active" onClick={toggleTimer}>
                            {isFocusActive ? <Pause size={36} /> : <Play size={36} style={{ marginLeft: '3px' }} />}
                        </button>
                        <button
                            className="focus-ctrl-btn save glass-button"
                            onClick={saveAndExit}
                            title="Save & Exit"
                            style={{ color: time > 0 ? 'var(--success)' : 'inherit' }}
                        >
                            Save & Exit
                        </button>
                    </div>
                </div>

                {/* Breathing animation indicator */}
                {isFocusActive && (
                    <div className="focus-breathing">
                        <div className="breathing-circle" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default FocusMode;
