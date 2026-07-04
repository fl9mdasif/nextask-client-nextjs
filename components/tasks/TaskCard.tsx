'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { Calendar, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskCardProps, Priority } from '@/src/interfaces';

// ─── Priority config ──────────────────────────────────────────────────────────

const priorityConfig: Record<Priority, { label: string; border: string; badge: string; dot: string }> = {
  high:   { label: 'High',   border: 'border-l-red-500',    badge: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',    dot: 'bg-red-500'    },
  medium: { label: 'Medium', border: 'border-l-yellow-500', badge: 'bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20', dot: 'bg-yellow-500' },
  low:    { label: 'Low',    border: 'border-l-green-500',  badge: 'bg-green-500/10 text-green-400 ring-1 ring-green-500/20',  dot: 'bg-green-500'  },
};

// ─── TaskCard ─────────────────────────────────────────────────────────────────

interface TaskCardExtendedProps extends TaskCardProps {
  isDragging?: boolean;
}

export default function TaskCard({ task, onEdit, onDelete, isDragging = false }: TaskCardExtendedProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = priorityConfig[task.priority];
  const dragging = isDragging || isSortableDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-xl border-l-[3px] bg-[#111118]',
        'border border-white/8 border-l-[3px]',
        priority.border,
        'transition-all duration-200',
        dragging
          ? 'opacity-40 scale-[0.98]'
          : 'hover:border-white/16 hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5',
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'absolute left-2 top-1/2 -translate-y-1/2',
          'text-[#3f3f46] hover:text-[#71717a] cursor-grab active:cursor-grabbing',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
          'touch-none'
        )}
        aria-label="Drag task"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Card body */}
      <div className="px-4 py-3 pl-6">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-[#fafafa] leading-snug line-clamp-2 flex-1">
            {task.title}
          </h3>

          {/* Hover action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
            <button
              id={`edit-task-${task.id}`}
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg text-[#52525b] hover:text-[#8b5cf6] hover:bg-[#7c3aed]/10 transition-all duration-150"
              aria-label="Edit task"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              id={`delete-task-${task.id}`}
              onClick={() => onDelete(task.id)}
              className="p-1.5 rounded-lg text-[#52525b] hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
              aria-label="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 mt-2.5">
          {/* Priority badge */}
          <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full', priority.badge)}>
            <span className={cn('w-1.5 h-1.5 rounded-full', priority.dot)} />
            {priority.label}
          </span>

          {/* Due date */}
          <span className="inline-flex items-center gap-1 text-[10px] text-[#71717a]">
            <Calendar className="w-3 h-3" />
            {format(new Date(task.due_date + 'T00:00:00'), 'MMM d')}
          </span>

          {/* Tags */}
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#71717a] ring-1 ring-white/8"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-[10px] text-[#52525b]">+{task.tags.length - 3}</span>
          )}
        </div>
      </div>
    </div>
  );
}
