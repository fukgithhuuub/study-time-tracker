import React from 'react';
import { Clock, CheckSquare, Target, Trophy, Calendar } from 'lucide-react';
import { isToday, parseISO, format } from 'date-fns';

export function Dashboard({ sessions, subjects, tasks }) {
  const todaySessions = sessions.filter(s => isToday(parseISO(s.timestamp)));
  const totalMinutesToday = todaySessions.reduce((acc, s) => acc + s.duration, 0) / 60;

  const dailyGoalMinutes = 180; // Example 3-hour goal
  const progress = Math.min((totalMinutesToday / dailyGoalMinutes) * 100, 100);

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 text-white">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
        <p className="text-zinc-400">Track your progress and stay productive.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-zinc-800 p-6 rounded-3xl border border-zinc-700 shadow-xl overflow-hidden relative group">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Target className="text-blue-500" size={24} /> Daily Study Goal
            </h2>
            <span className="text-zinc-400 font-medium">{Math.round(totalMinutesToday)} / {dailyGoalMinutes}m</span>
          </div>
          <div className="w-full h-4 bg-zinc-900 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-blue-600 transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-zinc-400">
            {progress >= 100 ? "Goal reached! Amazing work! 🎉" : `${Math.round(dailyGoalMinutes - totalMinutesToday)} more minutes to reach your goal.`}
          </p>
        </div>

        <div className="bg-zinc-800 p-6 rounded-3xl border border-zinc-700 shadow-xl overflow-hidden relative group">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CheckSquare className="text-green-500" size={24} /> Task Completion
            </h2>
            <span className="text-zinc-400 font-medium">{completedTasks} / {totalTasks}</span>
          </div>
          <div className="w-full h-4 bg-zinc-900 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-green-600 transition-all duration-1000 ease-out"
              style={{ width: `${taskProgress}%` }}
            />
          </div>
          <p className="text-sm text-zinc-400">
            {totalTasks === 0 ? "No tasks for today." : `${totalTasks - completedTasks} tasks remaining.`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Clock className="text-zinc-400" size={20} /> Recent Sessions
          </h3>
          <div className="space-y-3">
            {recentSessions.map(session => {
              const subject = subjects.find(s => s.id === session.subjectId);
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: subject?.color || '#3f3f46' }}
                    />
                    <div>
                      <p className="font-medium text-white">{subject?.name || 'Unknown'}</p>
                      <p className="text-xs text-zinc-500">{format(parseISO(session.timestamp), 'MMM d, h:mm a')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-zinc-300">{Math.round(session.duration / 60)}m</p>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">{session.type || 'session'}</p>
                  </div>
                </div>
              );
            })}
            {recentSessions.length === 0 && (
              <div className="bg-zinc-800/30 p-8 rounded-2xl border border-dashed border-zinc-700 text-center text-zinc-500">
                No sessions logged yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Trophy className="text-amber-500" size={20} /> Quick Stats
          </h3>
          <div className="bg-zinc-800 p-6 rounded-3xl border border-zinc-700 space-y-4">
             <div>
               <p className="text-zinc-500 text-xs mb-1 uppercase tracking-tighter">Subjects Tracked</p>
               <p className="text-2xl font-bold">{subjects.length}</p>
             </div>
             <div className="h-px bg-zinc-700" />
             <div>
               <p className="text-zinc-500 text-xs mb-1 uppercase tracking-tighter">Weekly Top Subject</p>
               <p className="text-2xl font-bold text-blue-400 truncate">Math</p> {/* Placeholder for now */}
             </div>
             <div className="h-px bg-zinc-700" />
             <div className="flex items-center gap-3 text-zinc-400">
               <Calendar size={16} />
               <span className="text-xs">{format(new Date(), 'EEEE, MMMM do')}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
