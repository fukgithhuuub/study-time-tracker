import React, { useState, useMemo } from 'react';
import { useUser } from '../../context/UserContext';
import { Wifi, WifiOff, User, Key, ArrowRight, LogIn, RotateCcw, Loader } from 'lucide-react';
import './Onboarding.css';

const Onboarding = () => {
    const { setupUser, loginUser, loading, error: ctxError, clearError } = useUser();
    const [view, setView] = useState('welcome');
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [mode, setMode] = useState(null);
    const [secretKey, setSecretKey] = useState('');
    const [loginError, setLoginError] = useState('');

    const previousUser = useMemo(() => {
        try {
            const saved = localStorage.getItem('study-tracker-user');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.username) return parsed;
            }
        } catch { /* ignore */ }
        return null;
    }, []);

    const hasExistingData = useMemo(() => {
        try {
            const sessions = localStorage.getItem('study-tracker-sessions');
            if (sessions) {
                const parsed = JSON.parse(sessions);
                return Array.isArray(parsed) && parsed.length > 0;
            }
        } catch { /* ignore */ }
        return false;
    }, []);

    const handleSignupComplete = async () => {
        if (!username.trim()) return;
        if (mode === 'online' && !secretKey.trim()) return;
        try {
            await setupUser(username.trim(), mode, secretKey.trim() || null);
        } catch (err) {
            setLoginError(err.message);
        }
    };

    const handleContinueAsPrevious = async () => {
        if (!previousUser) return;
        try {
            if (previousUser.mode === 'online' && previousUser.secretKey) {
                // Re-verify with Supabase
                await loginUser(previousUser.username, previousUser.secretKey);
            } else {
                await setupUser(previousUser.username, previousUser.mode, previousUser.secretKey || null);
            }
        } catch (err) {
            setLoginError(err.message);
        }
    };

    const handleLogin = async () => {
        if (!username.trim() || !secretKey.trim()) {
            setLoginError('Please enter both username and secret key.');
            return;
        }
        try {
            const result = await loginUser(username.trim(), secretKey.trim());
            if (!result) {
                setLoginError('No account found with that username and key.');
            }
        } catch (err) {
            setLoginError(err.message);
        }
    };

    const handleKeyDown = (e, action) => {
        if (e.key === 'Enter') action();
    };

    const displayError = loginError || ctxError;

    // ---- Welcome screen ----
    if (view === 'welcome') {
        return (
            <div className="onboarding-overlay">
                <div className="onboarding-card glass-panel animate-fade-in">
                    <div className="onboarding-header">
                        <h1 className="onboarding-logo">StudyFlow</h1>
                        <p className="onboarding-subtitle">Track your study sessions effortlessly</p>
                    </div>
                    <div className="welcome-options">
                        {previousUser && (
                            <button
                                className="welcome-btn welcome-btn-continue glass-button active"
                                onClick={handleContinueAsPrevious}
                                disabled={loading}
                            >
                                {loading ? <Loader size={20} className="spin" /> : <RotateCcw size={20} />}
                                <div className="welcome-btn-text">
                                    <span className="welcome-btn-title">
                                        Continue as {previousUser.username}
                                    </span>
                                    <span className="welcome-btn-desc">
                                        {previousUser.mode === 'online' ? 'Online' : 'Offline'} mode
                                        {hasExistingData ? ' • Your data is still here' : ''}
                                    </span>
                                </div>
                                <ArrowRight size={16} />
                            </button>
                        )}

                        <button
                            className={`welcome-btn glass-button ${!previousUser ? 'active' : ''}`}
                            onClick={() => { setView('signup'); clearError(); setLoginError(''); }}
                        >
                            <User size={20} />
                            <div className="welcome-btn-text">
                                <span className="welcome-btn-title">New User</span>
                                <span className="welcome-btn-desc">Create a new study profile</span>
                            </div>
                            <ArrowRight size={16} />
                        </button>
                        <button
                            className="welcome-btn glass-button"
                            onClick={() => { setView('login'); clearError(); setLoginError(''); }}
                        >
                            <LogIn size={20} />
                            <div className="welcome-btn-text">
                                <span className="welcome-btn-title">Sync Online Account</span>
                                <span className="welcome-btn-desc">Login with your username & secret key</span>
                            </div>
                            <ArrowRight size={16} />
                        </button>

                        {displayError && (
                            <p className="login-error">{displayError}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ---- Login screen ----
    if (view === 'login') {
        return (
            <div className="onboarding-overlay">
                <div className="onboarding-card glass-panel animate-fade-in">
                    <div className="onboarding-header">
                        <h1 className="onboarding-logo">StudyFlow</h1>
                        <p className="onboarding-subtitle">Welcome back!</p>
                    </div>
                    <div className="onboarding-step animate-fade-in">
                        <label className="onboarding-label">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => { setUsername(e.target.value); setLoginError(''); }}
                            placeholder="Your username..."
                            className="glass-input onboarding-input"
                            autoFocus
                            maxLength={30}
                            onKeyDown={(e) => handleKeyDown(e, () => document.getElementById('login-key-input')?.focus())}
                        />

                        <label className="onboarding-label">Secret Key</label>
                        <input
                            id="login-key-input"
                            type="password"
                            value={secretKey}
                            onChange={(e) => { setSecretKey(e.target.value); setLoginError(''); }}
                            placeholder="Your secret key..."
                            className="glass-input onboarding-input"
                            maxLength={50}
                            onKeyDown={(e) => handleKeyDown(e, handleLogin)}
                        />

                        {displayError && (
                            <p className="login-error">{displayError}</p>
                        )}

                        <button
                            className="onboarding-next glass-button active"
                            onClick={handleLogin}
                            disabled={!username.trim() || !secretKey.trim() || loading}
                        >
                            {loading ? <Loader size={16} className="spin" /> : <LogIn size={16} />}
                            {loading ? ' Connecting...' : ' Log In'}
                        </button>

                        <button className="onboarding-back" onClick={() => { setView('welcome'); setLoginError(''); clearError(); setUsername(''); setSecretKey(''); }}>
                            ← Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ---- Signup flow ----
    const totalSteps = mode === 'online' ? 3 : 2;

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-card glass-panel animate-fade-in">
                <div className="onboarding-header">
                    <h1 className="onboarding-logo">StudyFlow</h1>
                    <p className="onboarding-subtitle">Set up your study tracker</p>
                </div>

                {step === 1 && (
                    <div className="onboarding-step animate-fade-in">
                        <label className="onboarding-label">What's your name?</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your name..."
                            className="glass-input onboarding-input"
                            autoFocus
                            maxLength={30}
                            onKeyDown={(e) => handleKeyDown(e, () => username.trim() && setStep(2))}
                        />
                        <button
                            className="onboarding-next glass-button active"
                            onClick={() => username.trim() && setStep(2)}
                            disabled={!username.trim()}
                        >
                            Continue <ArrowRight size={16} />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="onboarding-step animate-fade-in">
                        <label className="onboarding-label">Choose storage mode</label>
                        <div className="mode-cards">
                            <button
                                className={`mode-card ${mode === 'offline' ? 'selected' : ''}`}
                                onClick={() => setMode('offline')}
                            >
                                <WifiOff size={28} />
                                <span className="mode-card-title">Offline</span>
                                <span className="mode-card-desc">Data stays in this browser only</span>
                            </button>
                            <button
                                className={`mode-card ${mode === 'online' ? 'selected' : ''}`}
                                onClick={() => setMode('online')}
                            >
                                <Wifi size={28} />
                                <span className="mode-card-title">Online</span>
                                <span className="mode-card-desc">Sync across devices via Supabase</span>
                            </button>
                        </div>
                        {mode && (
                            <button
                                className="onboarding-next glass-button active"
                                onClick={() => mode === 'online' ? setStep(3) : handleSignupComplete()}
                                disabled={loading}
                            >
                                {mode === 'online' ? 'Continue' : (loading ? 'Setting up...' : 'Get Started')} <ArrowRight size={16} />
                            </button>
                        )}
                    </div>
                )}

                {step === 3 && (
                    <div className="onboarding-step animate-fade-in">
                        <label className="onboarding-label">Create a secret key for syncing</label>
                        <p className="onboarding-hint">
                            This key + your username lets you sync data across devices. Keep it safe!
                        </p>
                        <div className="secret-key-row">
                            <div className="key-prefix">
                                <User size={14} /> {username}
                            </div>
                            <Key size={16} />
                            <input
                                type="text"
                                value={secretKey}
                                onChange={(e) => setSecretKey(e.target.value)}
                                placeholder="Your secret key..."
                                className="glass-input onboarding-input"
                                autoFocus
                                maxLength={50}
                                onKeyDown={(e) => handleKeyDown(e, handleSignupComplete)}
                            />
                        </div>

                        {displayError && (
                            <p className="login-error">{displayError}</p>
                        )}

                        <button
                            className="onboarding-next glass-button active"
                            onClick={handleSignupComplete}
                            disabled={!secretKey.trim() || loading}
                        >
                            {loading ? <><Loader size={16} className="spin" /> Connecting...</> : <>Get Started <ArrowRight size={16} /></>}
                        </button>
                    </div>
                )}

                <div className="onboarding-footer">
                    <button className="onboarding-back" onClick={() => {
                        if (step > 1) { setStep(step - 1); }
                        else { setView('welcome'); setUsername(''); setMode(null); setSecretKey(''); clearError(); setLoginError(''); }
                    }}>
                        ← Back
                    </button>
                    <div className="onboarding-dots">
                        {Array.from({ length: totalSteps }, (_, i) => i + 1).map(s => (
                            <div key={s} className={`dot ${step >= s ? 'active' : ''}`} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
