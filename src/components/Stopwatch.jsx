import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Save, Timer, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export function Stopwatch({
  subjects,
  onSaveSession,
  time,
  setTime,
  isRunning,
  setIsRunning,
  selectedSubjectId,
  setSelectedSubjectId
}) {
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    if (!selectedSubjectId) {
      alert("Please select a subject first to track your progress.");
      return;
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    if (time > 0 && !window.confirm("Reset the timer? Current session progress will be lost.")) return;
    setIsRunning(false);
    setTime(0);
  };

  const handleSave = () => {
    if (time < 60) {
      alert("Sessions must be at least 1 minute long to be recorded.");
      return;
    }
    onSaveSession({
      id: Date.now().toString(),
      subjectId: selectedSubjectId,
      duration: time,
      timestamp: new Date().toISOString(),
      type: 'stopwatch'
    });
    setIsRunning(false);
    setTime(0);
  };

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/50 backdrop-blur-3xl rounded-[3rem] border border-zinc-800 shadow-2xl max-w-2xl mx-auto space-y-12 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
        <Timer size={320} />
      </div>

      <div className="flex items-center gap-4 text-blue-500 relative">
        <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
          <Timer size={32} />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-[0.3em]">Stopwatch</h2>
      </div>

      <div className="text-[10rem] font-mono font-black leading-none text-white tracking-tighter drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] relative">
        {formatTime(time)}
      </div>

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

      <div className="flex gap-6 w-full max-w-sm relative">
        <button
          onClick={handleStartPause}
          className={cn(
            "flex-[2] flex items-center justify-center gap-3 py-6 rounded-[2rem] transition-all duration-300 font-black text-xl shadow-2xl active:scale-95",
            isRunning
              ? "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-900/40"
              : "bg-green-600 hover:bg-green-500 text-white shadow-green-900/40"
          )}
        >
          {isRunning ? <><Pause size={32} /> PAUSE</> : <><Play size={32} /> START</>}
        </button>

        <button
          onClick={handleReset}
          className="flex-1 flex items-center justify-center p-6 bg-zinc-800 hover:bg-zinc-700 rounded-[2rem] transition-all duration-300 text-zinc-300 shadow-xl active:scale-95 border border-zinc-700"
        >
          <Square size={32} />
        </button>

        <button
          onClick={handleSave}
          disabled={isRunning || time === 0}
          className="flex-1 flex items-center justify-center p-6 bg-blue-600 hover:bg-blue-500 rounded-[2rem] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-blue-900/40 active:scale-95 text-white"
        >
          <Save size={32} />
        </button>
      </div>
    </div>
  );
}
