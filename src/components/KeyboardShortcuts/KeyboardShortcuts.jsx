import React, { useState, useEffect, useCallback } from 'react';
import { Keyboard, X } from 'lucide-react';
import './KeyboardShortcuts.css';

const SHORTCUTS = [
    { keys: ['Space'], desc: 'Play / Pause timer', action: 'toggle-timer' },
    { keys: ['R'], desc: 'Reset timer', action: 'reset-timer' },
    { keys: ['S'], desc: 'Save stopwatch session', action: 'save-session' },
    { keys: ['1'], desc: 'Switch to Timer tab', action: 'tab-timer' },
    { keys: ['2'], desc: 'Switch to Dashboard tab', action: 'tab-dashboard' },
    { keys: ['3'], desc: 'Switch to Profile tab', action: 'tab-profile' },
    { keys: ['F'], desc: 'Toggle Focus Mode', action: 'toggle-focus' },
    { keys: ['M'], desc: 'Switch Stopwatch / Pomodoro', action: 'switch-mode' },
    { keys: ['?'], desc: 'Show keyboard shortcuts', action: 'show-help' },
    { keys: ['Esc'], desc: 'Close modals / Exit focus', action: 'close' },
];

const KeyboardShortcuts = ({ onShortcut }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleKeyDown = useCallback((e) => {
        // Don't capture shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
            return;
        }

        const key = e.key;

        if (key === '?') {
            e.preventDefault();
            setIsOpen(prev => !prev);
            return;
        }

        if (key === 'Escape') {
            if (isOpen) {
                setIsOpen(false);
                return;
            }
            onShortcut?.('close');
            return;
        }

        if (key === ' ' || key === 'Spacebar') {
            e.preventDefault();
            onShortcut?.('toggle-timer');
            return;
        }

        const lowerKey = key.toLowerCase();

        switch (lowerKey) {
            case 'r':
                onShortcut?.('reset-timer');
                break;
            case 's':
                onShortcut?.('save-session');
                break;
            case '1':
                onShortcut?.('tab-timer');
                break;
            case '2':
                onShortcut?.('tab-dashboard');
                break;
            case '3':
                onShortcut?.('tab-profile');
                break;
            case 'f':
                onShortcut?.('toggle-focus');
                break;
            case 'm':
                onShortcut?.('switch-mode');
                break;
            default:
                break;
        }
    }, [onShortcut, isOpen]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <>
            {/* Trigger button */}
            <button
                className="kb-trigger"
                onClick={() => setIsOpen(true)}
                title="Keyboard Shortcuts (?)"
            >
                <Keyboard size={16} />
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="kb-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>
                    <div className="kb-modal glass-panel animate-fade-in">
                        <div className="kb-modal-header">
                            <h3 className="kb-modal-title">
                                <Keyboard size={18} /> Keyboard Shortcuts
                            </h3>
                            <button className="kb-close" onClick={() => setIsOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="kb-list">
                            {SHORTCUTS.map((shortcut, i) => (
                                <div key={i} className="kb-item">
                                    <span className="kb-desc">{shortcut.desc}</span>
                                    <div className="kb-keys">
                                        {shortcut.keys.map((k, ki) => (
                                            <kbd key={ki} className="kb-key">{k}</kbd>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="kb-hint">
                            Shortcuts are disabled while typing in input fields.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default KeyboardShortcuts;
