import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';

export function Pomodoro({ subjects, onSaveSession }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work'); // 'work', 'short-break', 'long-break'
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const timerRef = useRef(null);

  const modes = {
    work: { label: 'Work', time: 25 * 60, color: 'bg-red-500', icon: BookOpen },
    'short-break': { label: 'Short Break', time: 5 * 60, color: 'bg-teal-500', icon: Coffee },
    'long-break': { label: 'Long Break', time: 15 * 60, color: 'bg-blue-500', icon: Coffee },
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      handleSessionComplete();
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft]);

  const handleSessionComplete = () => {
    if (mode === 'work' && selectedSubjectId) {
      onSaveSession({
        id: Date.now().toString(),
        subjectId: selectedSubjectId,
        duration: modes.work.time,
        timestamp: new Date().toISOString(),
        type: 'pomodoro'
      });
      alert("Great job! Session complete. Take a break!");
    } else {
      alert("Break complete! Ready to focus?");
    }
  };

  const handleModeChange = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(modes[newMode].time);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (mode === 'work' && !selectedSubjectId) {
      alert("Please select a subject first");
      return;
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(modes[mode].time);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-zinc-800 rounded-3xl border border-zinc-700 shadow-xl max-w-md mx-auto text-white">
      <div className="flex gap-2 p-1 bg-zinc-900 rounded-2xl mb-8 border border-zinc-700">
        {Object.entries(modes).map(([key, value]) => (
          <button
            key={key}
            onClick={() => handleModeChange(key)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all",
              mode === key ? `${value.color} text-white` : "text-zinc-400 hover:text-white"
            )}
          >
            {value.label}
          </button>
        ))}
      </div>

      <div className="relative w-64 h-64 mb-10 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="transparent"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - timeLeft / modes[mode].time)}
            className={cn("transition-all duration-1000", modes[mode].color.replace('bg-', 'text-'))}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-5xl font-mono font-bold">{formatTime(timeLeft)}</span>
          <span className="text-zinc-500 text-sm mt-2">{modes[mode].label}ing...</span>
        </div>
      </div>

      {mode === 'work' && (
        <div className="w-full mb-8">
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            disabled={isRunning}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 disabled:opacity-50 text-white"
          >
            <option value="">Select Subject</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-4 w-full">
        <button
          onClick={toggleTimer}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl transition-all font-semibold",
            isRunning ? "bg-zinc-700 hover:bg-zinc-600 text-white" : `${modes[mode].color} hover:brightness-110 text-white`
          )}
        >
          {isRunning ? <><Pause size={24} /> Pause</> : <><Play size={24} /> Start</>}
        </button>

        <button
          onClick={resetTimer}
          className="p-4 bg-zinc-700 hover:bg-zinc-600 rounded-2xl transition-colors text-zinc-300"
        >
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  );
}
