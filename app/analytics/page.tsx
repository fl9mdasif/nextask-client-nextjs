'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  TrendingUp,
  Inbox,
  ArrowRight,
} from 'lucide-react';
import { tasksApi } from '@/lib/api';
import type { Task, Status, Priority } from '@/src/interfaces';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
    payload: {
      fill?: string;
    };
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-[#111118]/90 text-[#1a1625] dark:text-[#fafafa] p-3 rounded-xl border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-md text-xs">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} style={{ color: item.color || item.payload.fill || '#8b5cf6' }}>
            {item.name}: <span className="font-bold text-current">{item.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('access_token');
    if (!token) {
      document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
      router.replace('/login');
      return;
    }

    const loadData = async () => {
      try {
        const res = await tasksApi.getAll();
        setTasks(res.data.data || []);
      } catch (err) {
        console.error('[Analytics] fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  // Overdue logic: due_date < today and status !== 'done'
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const getOverdueTasks = (allTasks: Task[]) => {
    return allTasks.filter(
      (t) => t.status !== 'done' && t.due_date && t.due_date < todayStr
    );
  };

  const totalCount = tasks.length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const inProgressCount = tasks.filter((t) => t.status === 'inprogress').length;
  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const overdueTasks = getOverdueTasks(tasks);
  const overdueCount = overdueTasks.length;

  // Sorting overdue tasks by due_date descending to list recent overdue first
  const recentOverdue = [...overdueTasks]
    .sort((a, b) => b.due_date.localeCompare(a.due_date))
    .slice(0, 5);

  // Chart 1: Tasks by status
  const statusData = [
    { name: 'To Do', value: todoCount, fill: '#71717a' },
    { name: 'In Progress', value: inProgressCount, fill: '#8b5cf6' },
    { name: 'Done', value: doneCount, fill: '#22c55e' },
  ];

  // Chart 2: Tasks by priority
  const lowCount = tasks.filter((t) => t.priority === 'low').length;
  const mediumCount = tasks.filter((t) => t.priority === 'medium').length;
  const highCount = tasks.filter((t) => t.priority === 'high').length;

  const priorityData = [
    { name: 'Low', value: lowCount, color: '#22c55e' },
    { name: 'Medium', value: mediumCount, color: '#eab308' },
    { name: 'High', value: highCount, color: '#ef4444' },
  ].filter((d) => d.value > 0); // Don't show empty priority slices

  // Chart 3: Tasks created per day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return {
      dateStr: format(d, 'yyyy-MM-dd'),
      label: format(d, 'MMM d'),
      count: 0,
    };
  });

  tasks.forEach((t) => {
    if (t.created_at) {
      const taskDate = t.created_at.slice(0, 10);
      const day = last7Days.find((d) => d.dateStr === taskDate);
      if (day) {
        day.count++;
      }
    }
  });

  const creationData = last7Days.map((d) => ({
    name: d.label,
    'Tasks Created': d.count,
  }));



  if (loading || !mounted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#8b5cf6] mb-3" />
        <p className="text-sm text-[#71717a]">Loading dashboard metrics...</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Tasks',
      value: totalCount,
      icon: Inbox,
      colorClass: 'text-[#8b5cf6] bg-[#7c3aed]/10',
    },
    {
      label: 'Completed Tasks',
      value: doneCount,
      icon: CheckCircle2,
      colorClass: 'text-green-500 bg-green-500/10',
    },
    {
      label: 'In Progress',
      value: inProgressCount,
      icon: Clock,
      colorClass: 'text-blue-500 bg-blue-500/10',
    },
    {
      label: 'Overdue Tasks',
      value: overdueCount,
      icon: AlertTriangle,
      colorClass: 'text-red-500 bg-red-500/10',
    },
  ];

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.35)]">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1a1625] dark:text-[#fafafa] tracking-tight">
              Analytics Dashboard
            </h1>
            <p className="text-sm text-[#6b7280] dark:text-[#71717a] mt-0.5">
              Workspace productivity statistics and task summaries.
            </p>
          </div>
        </div>
        <div className="mt-5 h-px bg-black/8 dark:bg-white/6" />
      </motion.div>

      {/* ── Metric Cards Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05, ease: 'easeOut' }}
              className="glass rounded-2xl p-6 flex items-center justify-between shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#71717a]">
                  {card.label}
                </span>
                <h3 className="text-3xl font-bold text-[#1a1625] dark:text-[#fafafa] mt-1">
                  {card.value}
                </h3>
              </div>
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', card.colorClass)}>
                <Icon className="w-6 h-6" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Chart 1: Tasks by Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="glass rounded-2xl p-6 shadow-xl"
        >
          <h2 className="text-sm font-semibold text-[#1a1625] dark:text-[#fafafa] mb-6">
            Task Status Distribution
          </h2>
          <div className="h-64">
            {totalCount === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-xs text-[#6b7280] dark:text-[#71717a]">
                <Inbox className="w-8 h-8 mb-2 opacity-50" />
                No tasks available to chart
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 58, 237, 0.04)' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Chart 2: Tasks by Priority */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="glass rounded-2xl p-6 shadow-xl"
        >
          <h2 className="text-sm font-semibold text-[#1a1625] dark:text-[#fafafa] mb-6">
            Tasks by Priority
          </h2>
          <div className="h-64 flex items-center justify-center">
            {priorityData.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center text-xs text-[#6b7280] dark:text-[#71717a]">
                <Inbox className="w-8 h-8 mb-2 opacity-50" />
                No tasks available to chart
              </div>
            ) : (
              <div className="w-full h-full flex flex-col sm:flex-row items-center justify-around gap-4">
                <div className="w-48 h-48 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend list */}
                <div className="flex flex-col gap-3">
                  {priorityData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-semibold text-[#1a1625] dark:text-[#fafafa]">
                        {item.name}
                      </span>
                      <span className="text-xs text-[#6b7280] dark:text-[#71717a] ml-1">
                        ({item.value} task{item.value !== 1 ? 's' : ''})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Chart 3: Tasks Created Per Day (Full Width) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="glass rounded-2xl p-6 shadow-xl mb-8"
      >
        <h2 className="text-sm font-semibold text-[#1a1625] dark:text-[#fafafa] mb-6">
          Task Creation Trend (Last 7 Days)
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={creationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="Tasks Created"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                activeDot={{ r: 6 }}
                dot={{ r: 4, stroke: '#7c3aed', strokeWidth: 1.5, fill: '#fafafa' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── Bottom Section: Overdue Tasks Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="glass rounded-2xl p-6 shadow-xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-black/8 dark:border-white/6 pb-4">
          <div>
            <h2 className="text-base font-bold text-[#1a1625] dark:text-[#fafafa]">
              Recent Overdue Tasks
            </h2>
            <p className="text-xs text-[#6b7280] dark:text-[#71717a] mt-0.5">
              Uncompleted tasks that passed their due date limit.
            </p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 shrink-0">
            {overdueCount} Total Overdue
          </span>
        </div>

        {recentOverdue.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-green-500/[0.02] border border-dashed border-green-500/15 rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-green-500 mb-2 opacity-80" />
            <p className="text-xs font-semibold text-green-600 dark:text-green-400">All tasks on track!</p>
            <p className="text-[10px] text-[#6b7280] dark:text-[#71717a] mt-0.5">No overdue tasks in your workspace.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 text-[10px] uppercase font-bold tracking-wider text-[#6b7280] dark:text-[#71717a]">
                  <th className="pb-3 pl-1">Task Title</th>
                  <th className="pb-3">Priority</th>
                  <th className="pb-3 text-right">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 text-xs">
                {recentOverdue.map((task) => (
                  <tr key={task.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors duration-150">
                    <td className="py-3.5 pl-1 font-semibold text-[#1a1625] dark:text-[#fafafa] truncate max-w-xs sm:max-w-md">
                      {task.title}
                    </td>
                    <td className="py-3.5 capitalize">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full font-semibold text-[10px]',
                          task.priority === 'high' && 'bg-red-500/10 text-red-500',
                          task.priority === 'medium' && 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
                          task.priority === 'low' && 'bg-green-500/10 text-green-600 dark:text-green-400'
                        )}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-medium text-red-500">
                      {format(new Date(task.due_date), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
