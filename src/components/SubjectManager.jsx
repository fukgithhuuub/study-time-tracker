import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Palette, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';

export function SubjectManager({ subjects, setSubjects }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', color: '#3b82f6' });
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState({ name: '', color: '#3b82f6' });

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e', '#a855f7', '#14b8a6'
  ];

  const handleAdd = () => {
    if (newSubject.name.trim()) {
      setSubjects([...subjects, { ...newSubject, id: Date.now().toString() }]);
      setNewSubject({ name: '', color: '#3b82f6' });
      setIsAdding(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this subject and all its associations? Sessions and tasks will lose their subject link.")) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  const startEdit = (subject) => {
    setEditingId(subject.id);
    setEditValue({ name: subject.name, color: subject.color });
  };

  const handleUpdate = () => {
    if (editValue.name.trim()) {
      setSubjects(subjects.map(s => s.id === editingId ? { ...s, ...editValue } : s));
      setEditingId(null);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex justify-between items-end mb-6">
        <div>
           <div className="flex items-center gap-4 mb-2">
            <div className="p-4 bg-indigo-600/10 rounded-3xl border border-indigo-500/20">
              <BookOpen className="text-indigo-500" size={40} />
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tighter">Academic Subjects</h2>
              <p className="text-zinc-500 text-lg font-medium">Categorize your study efforts effectively.</p>
            </div>
          </div>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-[1.5rem] transition-all duration-300 font-black shadow-xl shadow-indigo-900/40 active:scale-95 mb-2"
          >
            <Plus size={24} /> NEW SUBJECT
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-zinc-900/50 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h3 className="text-2xl font-black">Create Subject</h3>
              <input
                type="text"
                placeholder="Math, Science, Philosophy..."
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-lg text-white"
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                autoFocus
              />
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-3">
                 <Palette size={20} className="text-zinc-500" /> Choose Theme Color
              </h3>
              <div className="grid grid-cols-5 gap-4">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewSubject({ ...newSubject, color })}
                    className={cn(
                      "w-full aspect-square rounded-2xl border-4 transition-all duration-300",
                      newSubject.color === color ? "border-white scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100 hover:scale-105"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-12">
            <button
              onClick={handleAdd}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black text-lg transition-all duration-300 active:scale-95 shadow-xl shadow-emerald-900/20"
            >
              CREATE
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-5 rounded-2xl font-black text-lg transition-all duration-300 active:scale-95"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map(subject => (
          <div
            key={subject.id}
            className="group flex items-center justify-between bg-zinc-900/40 backdrop-blur-md p-6 rounded-[2rem] border border-zinc-800/50 hover:border-zinc-700 transition-all duration-300 hover:bg-zinc-900/60"
          >
            {editingId === subject.id ? (
              <div className="w-full space-y-6">
                <input
                  type="text"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 outline-none text-lg font-bold"
                  value={editValue.name}
                  onChange={(e) => setEditValue({ ...editValue, name: e.target.value })}
                />
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setEditValue({ ...editValue, color })}
                      className={cn(
                        "w-8 h-8 rounded-xl border-2 transition-transform",
                        editValue.color === color ? "border-white scale-110" : "border-transparent opacity-50"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleUpdate} className="flex-1 p-3 bg-emerald-600 rounded-xl font-bold flex items-center justify-center gap-2">
                    <Check size={18} /> SAVE
                  </button>
                  <button onClick={() => setEditingId(null)} className="flex-1 p-3 bg-zinc-800 rounded-xl font-bold flex items-center justify-center gap-2 text-zinc-400">
                    <X size={18} /> CANCEL
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-5">
                  <div
                    className="w-6 h-6 rounded-xl shadow-2xl"
                    style={{ backgroundColor: subject.color, boxShadow: `0 0 20px ${subject.color}40` }}
                  />
                  <span className="text-xl font-black tracking-tight text-white">{subject.name}</span>
                </div>
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(subject)}
                    className="p-3 hover:bg-zinc-800 rounded-2xl text-zinc-500 hover:text-white transition-all"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(subject.id)}
                    className="p-3 hover:bg-red-900/20 rounded-2xl text-zinc-500 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {subjects.length === 0 && (
          <div className="md:col-span-2 text-center py-20 bg-zinc-900/20 rounded-[3rem] border-4 border-dashed border-zinc-900">
             <BookOpen className="mx-auto text-zinc-900 mb-6" size={80} />
             <p className="text-zinc-600 text-2xl font-black italic">Start your academic journey by adding a subject.</p>
          </div>
        )}
      </div>
    </div>
  );
}
