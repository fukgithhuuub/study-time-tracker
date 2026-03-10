import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Settings, Check } from 'lucide-react';
import { cn } from '../lib/utils';

export function Pomodoro({
  subjects,
  onSaveSession,
  timeLeft,
  setTimeLeft,
  isRunning,
  setIsRunning,
  mode,
  setMode,
  selectedSubjectId,
  setSelectedSubjectId,
  modes: appModes,
  intervals,
  setIntervals
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [tempIntervals, setTempIntervals] = useState(intervals);

  const modes = {
    work: { ...appModes.work, color: 'bg-red-500', icon: BookOpen },
    'short-break': { ...appModes['short-break'], color: 'bg-teal-500', icon: Coffee },
    'long-break': { ...appModes['long-break'], color: 'bg-blue-500', icon: Coffee },
  };

  const handleModeChange = (newMode) => {
    if (isRunning && !window.confirm("Switching modes will reset the current timer. Continue?")) return;
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
      alert("Please select a subject first to begin your study session.");
      return;
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    if (timeLeft < modes[mode].time && !window.confirm("Reset the timer? Current session progress will be lost.")) return;
    setIsRunning(false);
    setTimeLeft(modes[mode].time);
  };

  const handleSaveSettings = () => {
    setIntervals(tempIntervals);
    setShowSettings(false);
    if (!isRunning) {
      setTimeLeft(tempIntervals[mode === 'work' ? 'work' : mode === 'short-break' ? 'short' : 'long'] * 60);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/40 backdrop-blur-[100px] rounded-[3rem] border border-zinc-800/50 shadow-2xl max-w-2xl mx-auto space-y-12 relative overflow-hidden group ring-1 ring-white/5 transition-all duration-700">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
        <BookOpen size={320} />
      </div>

      <div className="flex items-center gap-4 w-full relative z-10">
        <div className="flex-1 flex gap-4 p-2 bg-zinc-950/80 rounded-[1.5rem] border border-zinc-800 relative">
          {Object.entries(modes).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleModeChange(key)}
              className={cn(
                "flex-1 px-4 py-3 rounded-2xl text-xs font-black transition-all duration-300 tracking-widest uppercase truncate",
                mode === key ? `${value.color} text-white shadow-xl` : "text-zinc-600 hover:text-zinc-300"
              )}
            >
              {value.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 text-zinc-500 hover:text-white transition-colors"
        >
          <Settings size={24} />
        </button>
      </div>

      {showSettings && (
        <div className="w-full bg-zinc-950/50 p-6 rounded-[2rem] border border-zinc-800 animate-in zoom-in-95 duration-300 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Timer Settings (Minutes)</h3>
            <button onClick={handleSaveSettings} className="p-2 bg-emerald-600 rounded-xl text-white">
              <Check size={20} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-zinc-600">Work</label>
              <input
                type="number"
                value={tempIntervals.work}
                onChange={(e) => setTempIntervals({...tempIntervals, work: parseInt(e.target.value) || 1})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-zinc-600">Short</label>
              <input
                type="number"
                value={tempIntervals.short}
                onChange={(e) => setTempIntervals({...tempIntervals, short: parseInt(e.target.value) || 1})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-teal-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-zinc-600">Long</label>
              <input
                type="number"
                value={tempIntervals.long}
                onChange={(e) => setTempIntervals({...tempIntervals, long: parseInt(e.target.value) || 1})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      <div className={cn(
        "relative w-80 h-80 flex items-center justify-center transition-all duration-1000",
        isRunning ? "scale-110" : "scale-100"
      )}>
        <svg className="w-full h-full -rotate-90 filter drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <circle
            cx="160"
            cy="160"
            r="150"
            fill="transparent"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="12"
          />
          <circle
            cx="160"
            cy="160"
            r="150"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="12"
            strokeDasharray={2 * Math.PI * 150}
            strokeDashoffset={2 * Math.PI * 150 * (1 - timeLeft / modes[mode].time)}
            className={cn("transition-all duration-1000", modes[mode].color.replace('bg-', 'text-'))}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={cn(
            "text-8xl font-mono font-black text-white tracking-tighter transition-colors duration-500",
            isRunning && modes[mode].color.replace('bg-', 'text-')
          )}>
            {formatTime(timeLeft)}
          </span>
          <span className={cn(
            "text-zinc-500 font-black uppercase tracking-[0.3em] mt-4 text-xs",
            isRunning && "animate-pulse"
          )}>
            {modes[mode].label}ING...
          </span>
        </div>
      </div>

      {mode === 'work' && (
        <div className="w-full max-w-sm space-y-4 relative">
          <div className="flex flex-col gap-3">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-600 ml-1">Assign to Subject</label>
            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {subjects.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubjectId(s.id)}
                  className={cn(
                    "px-6 py-4 rounded-[1.2rem] text-sm font-bold border transition-all duration-300 flex flex-col items-center gap-2",
                    selectedSubjectId === s.id ? "text-white shadow-xl scale-105" : "bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300"
                  )}
                  style={{
                    backgroundColor: selectedSubjectId === s.id ? s.color : 'transparent',
                    borderColor: selectedSubjectId === s.id ? s.color : 'var(--zinc-800)'
                  }}
                  disabled={isRunning}
                >
                  <div className="w-2 h-2 rounded-full bg-white opacity-40 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                  <span className="truncate w-full text-center">{s.name}</span>
                </button>
              ))}
              {subjects.length === 0 && (
                <div className="col-span-2 text-center py-6 bg-zinc-950/50 rounded-2xl border border-dashed border-zinc-800 text-zinc-600 font-bold text-sm italic">
                  No subjects available.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6 w-full max-w-sm relative">
        <button
          onClick={toggleTimer}
          className={cn(
            "flex-[2] flex items-center justify-center gap-3 py-6 rounded-[2rem] transition-all duration-300 font-black text-xl shadow-2xl active:scale-95",
            isRunning ? "bg-zinc-800 hover:bg-zinc-700 text-white" : `${modes[mode].color} hover:brightness-110 text-white`
          )}
        >
          {isRunning ? <><Pause size={32} /> PAUSE</> : <><Play size={32} /> START</>}
        </button>

        <button
          onClick={resetTimer}
          className="flex-1 flex items-center justify-center p-6 bg-zinc-800 hover:bg-zinc-700 rounded-[2rem] transition-all duration-300 text-zinc-300 shadow-xl active:scale-95 border border-zinc-700"
        >
          <RotateCcw size={32} />
        </button>
      </div>
    </div>
  );
}
