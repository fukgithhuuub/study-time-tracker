import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Save, Timer } from 'lucide-react';
import { format } from 'date-fns';

export function Stopwatch({ subjects, onSaveSession }) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    if (!selectedSubjectId) {
      alert("Please select a subject first");
      return;
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  const handleSave = () => {
    if (time < 60) {
      alert("Session too short to save (min 1 minute)");
      return;
    }
    onSaveSession({
      id: Date.now().toString(),
      subjectId: selectedSubjectId,
      duration: time,
      timestamp: new Date().toISOString()
    });
    handleReset();
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-zinc-800 rounded-3xl border border-zinc-700 shadow-xl max-w-md mx-auto text-white">
      <div className="flex items-center gap-2 mb-8 text-blue-500">
        <Timer size={24} />
        <h2 className="text-xl font-semibold uppercase tracking-widest">Stopwatch</h2>
      </div>

      <div className="text-7xl font-mono mb-12 text-white">
        {formatTime(time)}
      </div>

      <div className="w-full mb-8">
        <label className="block text-sm text-zinc-400 mb-2">Assign to Subject</label>
        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          disabled={isRunning}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-50 text-white"
        >
          <option value="">Select Subject</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-4 w-full">
        <button
          onClick={handleStartPause}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl transition-all font-bold ${
            isRunning
              ? "bg-amber-500 hover:bg-amber-600 text-black"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {isRunning ? <><Pause size={24} /> Pause</> : <><Play size={24} /> Start</>}
        </button>

        <button
          onClick={handleReset}
          className="p-4 bg-zinc-700 hover:bg-zinc-600 rounded-2xl transition-colors text-white"
        >
          <Square size={24} />
        </button>

        <button
          onClick={handleSave}
          disabled={isRunning || time === 0}
          className="p-4 bg-blue-600 hover:bg-blue-700 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
        >
          <Save size={24} />
        </button>
      </div>
    </div>
  );
}
