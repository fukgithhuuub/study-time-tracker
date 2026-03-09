import React, { useState } from 'react';
import { Plus, Check, Trash2 } from 'lucide-react';

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
    <div className="p-6 max-w-2xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-6">Study Tasks</h2>

      <div className="bg-zinc-800 p-4 rounded-xl mb-6 border border-zinc-700">
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="What needs to be done?"
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 outline-none focus:border-blue-500 text-white"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <div className="flex gap-2">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 outline-none text-white"
            >
              <option value="">General Task</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button
              onClick={addTask}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map(task => {
          const subject = subjects.find(s => s.id === task.subjectId);
          return (
            <div
              key={task.id}
              className="flex items-center justify-between bg-zinc-800 p-4 rounded-xl border border-zinc-700 group"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    task.completed ? "bg-green-600 border-green-600" : "border-zinc-600 hover:border-zinc-400"
                  }`}
                >
                  {task.completed && <Check size={14} className="text-white" />}
                </button>
                <div>
                  <p className={`font-medium ${task.completed ? "line-through text-zinc-500" : ""}`}>
                    {task.text}
                  </p>
                  {subject && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full inline-block mt-1"
                      style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
                    >
                      {subject.name}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-red-500 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          );
        })}
        {tasks.length === 0 && (
          <div className="text-center py-12 text-zinc-500 border-2 border-dashed border-zinc-800 rounded-xl">
            No tasks yet. Add one to get started!
          </div>
        )}
      </div>
    </div>
  );
}
