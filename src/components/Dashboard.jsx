import React, { useMemo } from 'react';
import { Clock, CheckSquare, Target, Trophy, Calendar } from 'lucide-react';
import { isToday, parseISO, format, isWithinInterval, startOfWeek, endOfWeek, differenceInDays } from 'date-fns';

export function Dashboard({ sessions, subjects, tasks }) {
  const todaySessions = useMemo(() => sessions.filter(s => isToday(parseISO(s.timestamp))), [sessions]);
  const totalMinutesToday = useMemo(() => todaySessions.reduce((acc, s) => acc + s.duration, 0) / 60, [todaySessions]);

  const dailyGoalMinutes = 180; // 3-hour goal
  const progress = Math.min((totalMinutesToday / dailyGoalMinutes) * 100, 100);

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const recentSessions = useMemo(() => [...sessions]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5), [sessions]);

  const topSubject = useMemo(() => {
    if (sessions.length === 0) return "None";
    const totals = {};
    sessions.forEach(s => {
      totals[s.subjectId] = (totals[s.subjectId] || 0) + s.duration;
    });
    const topId = Object.keys(totals).reduce((a, b) => totals[a] > totals[b] ? a : b);
    const subject = subjects.find(s => s.id === topId);
    return subject ? subject.name : "None";
  }, [sessions, subjects]);

  const streak = useMemo(() => {
    if (sessions.length === 0) return 0;
    const dates = sessions.map(s => format(parseISO(s.timestamp), 'yyyy-MM-dd'));
    const uniqueDates = Array.from(new Set(dates)).sort().reverse();

    let currentStreak = 0;
    let checkDate = new Date();

    for (const dateStr of uniqueDates) {
      const date = parseISO(dateStr);
      const diff = differenceInDays(checkDate, date);
      if (diff === 0 || diff === 1) {
          currentStreak++;
          checkDate = date;
      } else {
          break;
      }
    }
    return currentStreak;
  }, [sessions]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Welcome Back!</h1>
        <p className="text-zinc-400 text-lg">Track your progress and stay productive.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-zinc-900/50 backdrop-blur-xl p-8 rounded-[2rem] border border-zinc-800 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target size={120} />
          </div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <Target className="text-blue-500" size={24} />
              </div>
              Daily Study Goal
            </h2>
            <span className="text-zinc-400 font-mono text-lg">{Math.round(totalMinutesToday)} / {dailyGoalMinutes}m</span>
          </div>
          <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-zinc-400 font-medium italic">
            {progress >= 100 ? "Goal reached! Amazing work! 🎉" : `${Math.round(dailyGoalMinutes - totalMinutesToday)} more minutes to reach your goal.`}
          </p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-xl p-8 rounded-[2rem] border border-zinc-800 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckSquare size={120} />
          </div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-3">
               <div className="p-2 bg-emerald-500/10 rounded-xl">
                <CheckSquare className="text-emerald-500" size={24} />
              </div>
              Task Completion
            </h2>
            <span className="text-zinc-400 font-mono text-lg">{completedTasks} / {totalTasks}</span>
          </div>
          <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-teal-600 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(5,150,105,0.4)]"
              style={{ width: `${taskProgress}%` }}
            />
          </div>
          <p className="text-sm text-zinc-400 font-medium italic">
            {totalTasks === 0 ? "No tasks for today." : `${totalTasks - completedTasks} tasks remaining.`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-2xl font-bold flex items-center gap-3 mb-6">
            <div className="p-2 bg-zinc-800 rounded-xl">
              <Clock className="text-zinc-400" size={20} />
            </div>
            Recent Sessions
          </h3>
          <div className="space-y-4">
            {recentSessions.map(session => {
              const subject = subjects.find(s => s.id === session.subjectId);
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between bg-zinc-900/40 p-5 rounded-3xl border border-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-300"
                >
                  <div className="flex items-center gap-5">
                    <div
                      className="w-4 h-4 rounded-full shadow-lg"
                      style={{ backgroundColor: subject?.color || '#3f3f46', boxShadow: `0 0 15px ${subject?.color || '#3f3f46'}40` }}
                    />
                    <div>
                      <p className="font-bold text-zinc-100 text-lg">{subject?.name || 'Unknown'}</p>
                      <p className="text-xs text-zinc-500 font-medium">{format(parseISO(session.timestamp), 'MMM d, h:mm a')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-zinc-100 font-bold text-xl">{Math.round(session.duration / 60)}m</p>
                    <p className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.2em]">{session.type || 'session'}</p>
                  </div>
                </div>
              );
            })}
            {recentSessions.length === 0 && (
              <div className="bg-zinc-900/20 p-12 rounded-[2rem] border-2 border-dashed border-zinc-800 text-center">
                <Clock className="mx-auto text-zinc-800 mb-4" size={48} />
                <p className="text-zinc-500 font-medium">No sessions logged yet. Ready to start?</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <Trophy className="text-amber-500" size={20} />
            </div>
            Quick Stats
          </h3>
          <div className="bg-zinc-900/80 backdrop-blur-md p-8 rounded-[2rem] border border-zinc-800 space-y-8 shadow-2xl">
             <div className="transition-transform hover:scale-105 duration-300">
               <p className="text-zinc-500 text-xs mb-2 uppercase font-black tracking-widest">Subjects Tracked</p>
               <p className="text-4xl font-black text-white">{subjects.length}</p>
             </div>
             <div className="h-px bg-zinc-800/50" />
             <div className="transition-transform hover:scale-105 duration-300">
               <p className="text-zinc-500 text-xs mb-2 uppercase font-black tracking-widest">Weekly Top Subject</p>
               <p className="text-3xl font-black text-blue-400 truncate">{topSubject}</p>
             </div>
             <div className="h-px bg-zinc-800/50" />
              <div className="transition-transform hover:scale-105 duration-300">
               <p className="text-zinc-500 text-xs mb-2 uppercase font-black tracking-widest">Study Streak</p>
               <p className="text-3xl font-black text-orange-500 flex items-center gap-2">
                 {streak} Days <span className="animate-bounce">🔥</span>
               </p>
             </div>
             <div className="h-px bg-zinc-800/50" />
             <div className="flex items-center gap-3 text-zinc-500 pt-2">
               <Calendar size={18} className="text-zinc-600" />
               <span className="text-sm font-bold">{format(new Date(), 'EEEE, MMMM do')}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
