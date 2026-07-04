'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import useTaskStore, { toApiDate } from '@/store/taskStore';
import Navbar from '@/components/shared/Navbar';
import DateSelector from '@/components/tasks/DateSelector';
import Board from '@/components/tasks/Board';

export default function TasksPage() {
  const { selectedDate, setSelectedDate, fetchTasks, tasks } = useTaskStore();
  const router = useRouter();

  // Guard: if localStorage has no token the middleware cookie may still let us
  // through, but Axios won't send an Authorization header → 401 loop.
  // Clear the stale cookie and redirect to login instead.
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
      router.replace('/login');
      return;
    }
    fetchTasks(toApiDate(selectedDate));
  }, [selectedDate, fetchTasks, router]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Title */}
            <div>
              <h1 className="text-xl font-bold text-[#fafafa] tracking-tight">
                Task Board
              </h1>
              <p className="text-sm text-[#71717a] mt-0.5">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')} &mdash;{' '}
                <span className="text-[#a1a1aa]">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
              </p>
            </div>

            {/* Date selector */}
            <DateSelector selected={selectedDate} onChange={handleDateChange} />
          </div>

          {/* Divider */}
          <div className="mt-4 h-px bg-white/6" />
        </motion.div>

        {/* ── Board ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
        >
          <Board />
        </motion.div>
      </main>
    </div>
  );
}
