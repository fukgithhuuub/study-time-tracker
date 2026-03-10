import React, { useState } from 'react';
import { Plus, Check, Trash2, CheckSquare, Target } from 'lucide-react';
import { cn } from '../lib/utils';

export function TaskList({ subjects, tasks, setTasks }) {
  const [newTask, setNewTask] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, {
        id: Date.now().toString(),
        text: newTask,
        subjectId: selectedSubjectId,
        completed: false
      }]);
      setNewTask('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center gap-4 mb-2">
        <div className="p-4 bg-emerald-600/10 rounded-3xl border border-emerald-500/20">
          <CheckSquare className="text-emerald-500" size={40} />
        </div>
        <div>
          <h2 className="text-4xl font-black tracking-tighter">Study Tasks</h2>
          <p className="text-zinc-500 text-lg font-medium">Break down your goals into actionable items.</p>
        </div>
      </div>

      <div className="bg-zinc-900/50 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-zinc-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <Target size={240} />
        </div>
        <div className="flex flex-col gap-6 relative">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="What needs to be done?"
              className="flex-1 bg-zinc-950/80 border border-zinc-800 rounded-2xl px-6 py-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-lg text-white"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
            />
            <button
              onClick={addTask}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-2xl transition-all duration-300 font-black shadow-xl shadow-emerald-900/40 active:scale-95 text-lg"
            >
              ADD
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-600 ml-1">Assign Subject (Optional)</label>
            <div className="flex flex-wrap gap-2">
               <button
                  onClick={() => setSelectedSubjectId('')}
                  className={cn(
                    "px-6 py-3 rounded-xl text-sm font-bold border transition-all duration-300",
                    selectedSubjectId === '' ? "bg-zinc-100 text-zinc-900 border-zinc-100 shadow-xl" : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300"
                  )}
                >
                  General Task
                </button>
              {subjects.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubjectId(s.id)}
                  className={cn(
                    "px-6 py-3 rounded-xl text-sm font-bold border transition-all duration-300 flex items-center gap-3",
                    selectedSubjectId === s.id ? "text-white shadow-xl" : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300"
                  )}
                  style={{
                    backgroundColor: selectedSubjectId === s.id ? s.color : 'transparent',
                    borderColor: selectedSubjectId === s.id ? s.color : 'var(--zinc-800)'
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-white opacity-40" />
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map(task => {
          const subject = subjects.find(s => s.id === task.subjectId);
          return (
            <div
              key={task.id}
              className="flex items-center justify-between bg-zinc-900/40 backdrop-blur-md p-6 rounded-[2rem] border border-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-300 group"
            >
              <div className="flex items-center gap-6">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    "w-8 h-8 rounded-xl border-4 flex items-center justify-center transition-all duration-300 transform active:scale-90",
                    task.completed ? "bg-emerald-600 border-emerald-600 shadow-xl shadow-emerald-900/20" : "bg-zinc-950 border-zinc-800 hover:border-zinc-600"
                  )}
                >
                  {task.completed && <Check size={20} className="text-white font-black" />}
                </button>
                <div className="space-y-1">
                  <p className={cn(
                    "text-xl font-bold transition-all duration-300",
                    task.completed ? "line-through text-zinc-600" : "text-zinc-100"
                  )}>
                    {task.text}
                  </p>
                  {subject && (
                    <span
                      className="text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest inline-block"
                      style={{ backgroundColor: `${subject.color}20`, color: subject.color, border: `1px solid ${subject.color}40` }}
                    >
                      {subject.name}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-4 bg-red-950/20 text-red-500 hover:bg-red-600 hover:text-white rounded-2xl transition-all duration-300"
              >
                <Trash2 size={24} />
              </button>
            </div>
          );
        })}
        {tasks.length === 0 && (
          <div className="text-center py-24 bg-zinc-900/10 rounded-[3rem] border-4 border-dashed border-zinc-900 animate-pulse">
            <CheckSquare className="mx-auto text-zinc-900 mb-6" size={80} />
            <p className="text-zinc-600 text-2xl font-black italic">Focus your mind. What's the next step?</p>
          </div>
        )}
      </div>
    </div>
  );
}
