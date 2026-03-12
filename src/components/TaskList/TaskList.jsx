import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Plus, X, Trash2 } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import * as db from '../../lib/dataService';
import { logger } from '../../lib/logger';
import './TaskList.css';

const TaskList = () => {
    const { user, isOnline } = useUser();
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Load tasks
    useEffect(() => {
        const loadTasks = async () => {
            if (isOnline) {
                try {
                    const remoteTasks = await db.fetchTasks(user.dbUserId);
                    setTasks(remoteTasks);
                    return;
                } catch (err) {
                    logger.error('Failed to fetch tasks from Supabase:', err);
                }
            }
            // Fallback: localStorage
            const saved = localStorage.getItem('study-tracker-tasks');
            if (saved) {
                try { setTasks(JSON.parse(saved)); } catch { /* ignore */ }
            }
        };
        if (user) loadTasks();
    }, [user, isOnline]);

    // Always save to localStorage as backup
    useEffect(() => {
        if (user) {
            localStorage.setItem('study-tracker-tasks', JSON.stringify(tasks));
        }
    }, [tasks, user]);

    const addTask = async (e) => {
        e.preventDefault();
        if (newTask.trim()) {
            const task = { id: Date.now(), text: newTask.trim(), done: false };
            setTasks(prev => [...prev, task]);
            setNewTask('');
            setIsAdding(false);

            if (isOnline) {
                try { await db.insertTask(user.dbUserId, task); }
                catch (err) { logger.error('Failed to add task to Supabase:', err); }
            }
        }
    };

    const toggleTask = async (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        const newDone = !task.done;
        setTasks(prev => prev.map(t => t.id === id ? { ...t, done: newDone } : t));

        if (isOnline) {
            try { await db.updateTask(user.dbUserId, id, { done: newDone }); }
            catch (err) { logger.error('Failed to toggle task in Supabase:', err); }
        }
    };

    const deleteTask = async (id) => {
        setTasks(prev => prev.filter(t => t.id !== id));

        if (isOnline) {
            try { await db.deleteTask(user.dbUserId, id); }
            catch (err) { logger.error('Failed to delete task from Supabase:', err); }
        }
    };

    const completedCount = tasks.filter(t => t.done).length;

    return (
        <div className="task-list glass-panel animate-fade-in">
            <div className="task-header">
                <h3 className="task-title">
                    <CheckSquare size={18} /> Tasks
                    {tasks.length > 0 && (
                        <span className="task-counter">{completedCount}/{tasks.length}</span>
                    )}
                </h3>
                <button className="task-add-btn" onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? <X size={16} /> : <Plus size={16} />}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={addTask} className="task-form animate-fade-in">
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="New task..."
                        className="glass-input task-input"
                        autoFocus
                    />
                    <button type="submit" className="glass-button task-submit">
                        <Plus size={16} />
                    </button>
                </form>
            )}

            <div className="task-items">
                {tasks.length === 0 ? (
                    <p className="task-empty">No tasks yet. Add one to get started!</p>
                ) : (
                    tasks.map(task => (
                        <div key={task.id} className={`task-item ${task.done ? 'done' : ''}`}>
                            <button className="task-check" onClick={() => toggleTask(task.id)}>
                                {task.done ? <CheckSquare size={18} /> : <Square size={18} />}
                            </button>
                            <span className="task-text">{task.text}</span>
                            <button className="task-delete" onClick={() => deleteTask(task.id)}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TaskList;
