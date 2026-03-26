import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { PictureInPicture, PictureInPicture2 } from 'lucide-react';
import './PiPTimer.css';

const PIP_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #0a0a0f;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    overflow: hidden;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
  .pip-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 12px 20px;
    user-select: none;
    width: 100%;
  }
  .pip-label {
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #94a3b8;
  }
  .pip-time {
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    font-size: 2.8rem;
    font-weight: 700;
    color: #f8fafc;
    letter-spacing: -2px;
    line-height: 1;
  }
  .pip-status {
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.5px;
    color: #f59e0b;
  }
  .pip-status.running {
    color: #10b981;
  }
`;

const STATE_LABELS = {
  work: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

const PiPTimerContent = ({ time, mode, pomodoroState, isActive }) => {
  const label = mode === 'pomodoro' ? (STATE_LABELS[pomodoroState] ?? 'Pomodoro') : 'Stopwatch';
  return (
    <div className="pip-content">
      <div className="pip-label">{label}</div>
      <div className="pip-time">{time}</div>
      <div className={`pip-status ${isActive ? 'running' : ''}`}>
        {isActive ? '▶ Running' : '⏸ Paused'}
      </div>
    </div>
  );
};

const PiPTimer = ({ time, mode, pomodoroState, isActive }) => {
  const [pipContainer, setPipContainer] = useState(null);
  const pipWindowRef = useRef(null);

  const isSupported = typeof window !== 'undefined' && 'documentPictureInPicture' in window;

  const openPiP = async () => {
    try {
      const pip = await window.documentPictureInPicture.requestWindow({
        width: 220,
        height: 130,
        disallowReturnToOpener: false,
      });

      // Inject Google Fonts for matching typography
      const fontLink = pip.document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@500;600&family=Outfit:wght@700&display=swap';
      pip.document.head.appendChild(fontLink);

      // Inject styles
      const style = pip.document.createElement('style');
      style.textContent = PIP_STYLES;
      pip.document.head.appendChild(style);

      const container = pip.document.createElement('div');
      pip.document.body.appendChild(container);

      pip.addEventListener('pagehide', () => {
        setPipContainer(null);
        pipWindowRef.current = null;
      });

      pipWindowRef.current = pip;
      setPipContainer(container);
    } catch (err) {
      console.error('Failed to open PiP window:', err);
    }
  };

  const closePiP = () => {
    if (pipWindowRef.current) {
      pipWindowRef.current.close();
      pipWindowRef.current = null;
      setPipContainer(null);
    }
  };

  const togglePiP = () => {
    if (pipContainer) {
      closePiP();
    } else {
      openPiP();
    }
  };

  // Close PiP when the component unmounts
  useEffect(() => {
    return () => {
      if (pipWindowRef.current) {
        pipWindowRef.current.close();
      }
    };
  }, []);

  if (!isSupported) return null;

  return (
    <>
      <button
        className={`pip-btn glass-button ${pipContainer ? 'pip-btn--active' : ''}`}
        onClick={togglePiP}
        title={pipContainer ? 'Close floating timer' : 'Open floating timer (always on top)'}
        aria-label={pipContainer ? 'Close floating timer' : 'Open floating timer'}
        aria-pressed={!!pipContainer}
      >
        {pipContainer ? <PictureInPicture2 size={18} /> : <PictureInPicture size={18} />}
      </button>

      {pipContainer &&
        ReactDOM.createPortal(
          <PiPTimerContent
            time={time}
            mode={mode}
            pomodoroState={pomodoroState}
            isActive={isActive}
          />,
          pipContainer
        )}
    </>
  );
};

export default PiPTimer;
