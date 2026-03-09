import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

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

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 text-white">
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
    </div>
  );
}
