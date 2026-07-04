import { create } from 'zustand';
import { format } from 'date-fns';
import { tasksApi } from '@/lib/api';
import type { Task, TaskStore } from '@/src/interfaces';

const useTaskStore = create<TaskStore>((set) => ({
  // ─── State ──────────────────────────────────────────────────────────────────
  selectedDate: new Date(),
  tasks: [],

  // ─── Actions ─────────────────────────────────────────────────────────────────

  setSelectedDate: (date: Date) => set({ selectedDate: date }),

  setTasks: (tasks: Task[]) => set({ tasks }),

  /**
   * Fetch tasks from the Django backend filtered by date.
   * Date is formatted as 'YYYY-MM-DD' using date-fns.
   */
  fetchTasks: async (date: string) => {
    try {
      const response = await tasksApi.getByDate(date);
      set({ tasks: response.data.data });
    } catch (error) {
      console.error('[taskStore] fetchTasks error:', error);
      set({ tasks: [] });
    }
  },
}));

export default useTaskStore;

/**
 * Helper: format a Date object to 'YYYY-MM-DD' for API calls.
 * Usage: fetchTasks(toApiDate(selectedDate))
 */
export const toApiDate = (date: Date): string => format(date, 'yyyy-MM-dd');
