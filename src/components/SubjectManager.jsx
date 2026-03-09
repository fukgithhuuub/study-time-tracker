import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function SubjectManager({ subjects, setSubjects }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', color: '#3b82f6' });
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState({ name: '', color: '#3b82f6' });

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#71717a'
  ];

  const handleAdd = () => {
    if (newSubject.name.trim()) {
      setSubjects([...subjects, { ...newSubject, id: Date.now().toString() }]);
      setNewSubject({ name: '', color: '#3b82f6' });
      setIsAdding(false);
    }
  };

  const handleDelete = (id) => {
    setSubjects(subjects.filter(s => s.id !== id));
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
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Subjects</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} /> Add Subject
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-zinc-800 p-4 rounded-xl mb-6 border border-zinc-700">
          <div className="grid gap-4">
            <input
              type="text"
              placeholder="Subject Name"
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 outline-none focus:border-blue-500 text-white"
              value={newSubject.name}
              onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
            />
            <div className="flex flex-wrap gap-2">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setNewSubject({ ...newSubject, color })}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-transform",
                    newSubject.color === color ? "border-white scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
              >
                Add Subject
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-3 text-white">
        {subjects.map(subject => (
          <div
            key={subject.id}
            className="flex items-center justify-between bg-zinc-800 p-4 rounded-xl border border-zinc-700"
          >
            {editingId === subject.id ? (
              <div className="flex-1 grid gap-4">
                <input
                  type="text"
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1 outline-none text-white"
                  value={editValue.name}
                  onChange={(e) => setEditValue({ ...editValue, name: e.target.value })}
                />
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setEditValue({ ...editValue, color })}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 transition-transform",
                        editValue.color === color ? "border-white scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleUpdate} className="p-2 bg-green-600 rounded-lg"><Check size={16} /></button>
                  <button onClick={() => setEditingId(null)} className="p-2 bg-zinc-700 rounded-lg"><X size={16} /></button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="font-medium">{subject.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(subject)}
                    className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(subject.id)}
                    className="p-2 hover:bg-red-900/30 rounded-lg text-zinc-400 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
