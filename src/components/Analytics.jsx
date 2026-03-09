import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, subDays } from 'date-fns';

export function Analytics({ sessions, subjects }) {
  const subjectData = useMemo(() => {
    const data = subjects.map(subject => {
      const totalTime = sessions
        .filter(s => s.subjectId === subject.id)
        .reduce((acc, s) => acc + s.duration, 0);
      return {
        name: subject.name,
        value: Math.round(totalTime / 60), // minutes
        color: subject.color
      };
    }).filter(d => d.value > 0);
    return data;
  }, [sessions, subjects]);

  const dailyData = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const daySessions = sessions.filter(s => isSameDay(parseISO(s.timestamp), day));
      const totalMinutes = daySessions.reduce((acc, s) => acc + s.duration, 0) / 60;
      return {
        name: format(day, 'EEE'),
        minutes: Math.round(totalMinutes)
      };
    });
  }, [sessions]);

  const totalMinutes = sessions.reduce((acc, s) => acc + s.duration, 0) / 60;

  const last14DaysData = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => subDays(new Date(), 13 - i));
    return days.map(day => {
      const daySessions = sessions.filter(s => isSameDay(parseISO(s.timestamp), day));
      const totalMinutes = daySessions.reduce((acc, s) => acc + s.duration, 0) / 60;
      return {
        date: format(day, 'MMM d'),
        minutes: Math.round(totalMinutes)
      };
    });
  }, [sessions]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 text-white animate-in fade-in duration-700">
      <h2 className="text-2xl font-bold mb-6">Study Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-800 p-6 rounded-2xl border border-zinc-700">
          <p className="text-zinc-400 text-sm mb-1">Total Study Time</p>
          <p className="text-3xl font-bold">{Math.round(totalMinutes)}m</p>
        </div>
        <div className="bg-zinc-800 p-6 rounded-2xl border border-zinc-700">
          <p className="text-zinc-400 text-sm mb-1">Sessions Completed</p>
          <p className="text-3xl font-bold">{sessions.length}</p>
        </div>
        <div className="bg-zinc-800 p-6 rounded-2xl border border-zinc-700">
          <p className="text-zinc-400 text-sm mb-1">Average Session</p>
          <p className="text-3xl font-bold">
            {sessions.length ? Math.round(totalMinutes / sessions.length) : 0}m
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-800 p-6 rounded-2xl border border-zinc-700 min-h-[400px]">
          <h3 className="text-lg font-semibold mb-6">Distribution by Subject</h3>
          {subjectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subjectData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-zinc-500">
              No data yet. Start studying!
            </div>
          )}
        </div>

        <div className="bg-zinc-800 p-6 rounded-2xl border border-zinc-700 min-h-[400px]">
          <h3 className="text-lg font-semibold mb-6">Weekly Progress (Minutes)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}m`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }}
              />
              <Bar dataKey="minutes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-zinc-800 p-8 rounded-[2rem] border border-zinc-700 shadow-xl">
        <h3 className="text-xl font-bold mb-8">Study Activity (Last 14 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={last14DaysData}>
            <defs>
              <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#71717a"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#71717a"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}m`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }}
            />
            <Area type="monotone" dataKey="minutes" stroke="#6366f1" fillOpacity={1} fill="url(#colorMinutes)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-zinc-800 p-8 rounded-[2rem] border border-zinc-700 shadow-xl">
        <h3 className="text-xl font-bold mb-8">Subject Breakdown Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-700 text-zinc-500 text-xs uppercase tracking-widest">
                <th className="pb-4 font-black">Subject</th>
                <th className="pb-4 font-black">Total Time</th>
                <th className="pb-4 font-black">Sessions</th>
                <th className="pb-4 font-black">Avg Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700/50">
              {subjects.map(subject => {
                const subjectSessions = sessions.filter(s => s.subjectId === subject.id);
                const totalMins = subjectSessions.reduce((acc, s) => acc + s.duration, 0) / 60;
                if (subjectSessions.length === 0) return null;
                return (
                  <tr key={subject.id} className="hover:bg-zinc-700/30 transition-colors">
                    <td className="py-4 flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                      <span className="font-bold">{subject.name}</span>
                    </td>
                    <td className="py-4 font-mono">{Math.round(totalMins)}m</td>
                    <td className="py-4">{subjectSessions.length}</td>
                    <td className="py-4 font-mono">
                      {subjectSessions.length ? Math.round(totalMins / subjectSessions.length) : 0}m
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
