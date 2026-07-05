'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, LayoutList } from 'lucide-react';
import { cn } from '@/lib/utils';
import TaskCard from './TaskCard';
import type { Task, Status } from '@/src/interfaces';

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig = {
  todo:       { label: 'To Do',       dot: 'bg-[#71717a]',  count: 'bg-[#71717a]/15 text-[#71717a] dark:bg-[#71717a]/15 dark:text-[#71717a]'  },
  inprogress: { label: 'In Progress', dot: 'bg-[#8b5cf6]',  count: 'bg-[#7c3aed]/15 text-[#7c3aed] dark:text-[#8b5cf6]'                       },
  done:       { label: 'Done',        dot: 'bg-green-500',  count: 'bg-green-500/10 text-green-600 dark:text-green-400'                        },
} satisfies Record<Status, { label: string; dot: string; count: string }>;

// ─── Column Props ─────────────────────────────────────────────────────────────

interface ColumnExtendedProps {
  title: 'To Do' | 'In Progress' | 'Done';
  status: Status;
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
}

// ─── Column ───────────────────────────────────────────────────────────────────

export default function Column({
  status,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: ColumnExtendedProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = statusConfig[status];

  return (
    <div className="flex flex-col w-full min-w-[280px] max-w-[320px] shrink-0">
      {/* ── Column header ── */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', config.dot)} />
          <h2 className="text-sm font-semibold text-[#1a1625] dark:text-[#fafafa]">{config.label}</h2>
          {/* Task count badge */}
          <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', config.count)}>
            {tasks.length}
          </span>
        </div>

        {/* Add task button */}
        <button
          id={`add-task-${status}`}
          onClick={onAddTask}
          className={cn(
            'flex items-center gap-1 text-xs px-2 py-1 rounded-lg',
            'text-[#6b7280] dark:text-[#71717a] hover:text-[#8b5cf6] hover:bg-[#7c3aed]/10',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40'
          )}
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      {/* ── Droppable task list ── */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={cn(
            'flex flex-col gap-2.5 flex-1 min-h-[120px] rounded-xl p-2',
            'transition-all duration-200',
            isOver
              ? 'bg-[#7c3aed]/8 ring-1 ring-[#7c3aed]/30'
              : 'bg-black/[0.02] dark:bg-white/[0.02]'
          )}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}

          {/* ── Empty state ── */}
          {tasks.length === 0 && (
            <button
              onClick={onAddTask}
              className={cn(
                'flex flex-col items-center justify-center gap-2',
                'h-24 rounded-xl border border-dashed',
                'border-black/10 dark:border-white/8',
                'text-[#9ca3af] dark:text-[#3f3f46]',
                'hover:text-[#71717a] hover:border-black/20 dark:hover:border-white/16',
                'transition-all duration-200 group',
                'focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30'
              )}
            >
              <LayoutList className="w-5 h-5 group-hover:text-[#8b5cf6] transition-colors duration-200" />
              <span className="text-xs">Add a task</span>
            </button>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
