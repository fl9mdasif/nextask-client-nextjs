'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { AnimatePresence } from 'framer-motion';
import { tasksApi } from '@/lib/api';
import useTaskStore, { toApiDate } from '@/store/taskStore';
import Column from './Column';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import type { Task, Status } from '@/src/interfaces';

// ─── Column definitions ───────────────────────────────────────────────────────

const COLUMNS: { status: Status; title: 'To Do' | 'In Progress' | 'Done' }[] = [
  { status: 'todo',       title: 'To Do'       },
  { status: 'inprogress', title: 'In Progress' },
  { status: 'done',       title: 'Done'        },
];

const STATUS_IDS = new Set<string>(['todo', 'inprogress', 'done']);

// ─── Modal state type ─────────────────────────────────────────────────────────

interface ModalState {
  open: boolean;
  mode: 'create' | 'edit';
  task?: Task;
  status: Status;
}

// ─── Board ────────────────────────────────────────────────────────────────────

export default function Board() {
  const { tasks, setTasks, fetchTasks, selectedDate } = useTaskStore();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    mode: 'create',
    status: 'todo',
  });

  // ── DnD sensors (require 8px move to start, support touch) ──
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  // ── Helpers ──────────────────────────────────────────────────

  const getColumnTasks = (status: Status) =>
    tasks.filter((t) => t.status === status);

  const refetch = useCallback(() => {
    fetchTasks(toApiDate(selectedDate));
  }, [fetchTasks, selectedDate]);

  // ── Drag handlers ─────────────────────────────────────────────

  const handleDragStart = ({ active }: DragStartEvent) => {
    const task = tasks.find((t) => t.id === Number(active.id));
    setActiveTask(task ?? null);
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    if (!over) return;

    const taskId = Number(active.id);
    const overId = String(over.id);

    // Resolve new status: over a column ID or over another task
    let newStatus: Status;
    if (STATUS_IDS.has(overId)) {
      newStatus = overId as Status;
    } else {
      const overTask = tasks.find((t) => t.id === Number(overId));
      if (!overTask) return;
      newStatus = overTask.status;
    }

    const draggedTask = tasks.find((t) => t.id === taskId);
    if (!draggedTask) return;

    // No change
    if (draggedTask.status === newStatus) return;

    // Optimistic update
    const snapshot = [...tasks];
    const optimistic = tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    setTasks(optimistic);

    try {
      const newColTasks = optimistic.filter((t) => t.status === newStatus);
      const newOrder   = newColTasks.findIndex((t) => t.id === taskId);
      await tasksApi.reorder(taskId, { status: newStatus, order: newOrder });
    } catch {
      // Revert on error
      setTasks(snapshot);
    }
  };

  // ── Delete ────────────────────────────────────────────────────

  const handleDeleteTask = async (id: number) => {
    const snapshot = [...tasks];
    setTasks(tasks.filter((t) => t.id !== id));       // optimistic
    try {
      await tasksApi.delete(id);
    } catch {
      setTasks(snapshot);                               // revert
    }
  };

  // ── Modal helpers ─────────────────────────────────────────────

  const openCreate = (status: Status) =>
    setModal({ open: true, mode: 'create', status });

  const openEdit = (task: Task) =>
    setModal({ open: true, mode: 'edit', task, status: task.status });

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  // ─────────────────────────────────────────────────────────────

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Board grid */}
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1 items-start">
          {COLUMNS.map(({ status, title }) => (
            <Column
              key={status}
              title={title}
              status={status}
              tasks={getColumnTasks(status)}
              onAddTask={() => openCreate(status)}
              onEditTask={openEdit}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>

        {/* Drag ghost */}
        <DragOverlay dropAnimation={{ duration: 150 }}>
          {activeTask && (
            <div className="rotate-1 scale-105 opacity-90">
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
                isDragging
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Task modal */}
      <AnimatePresence>
        {modal.open && (
          <TaskModal
            key="task-modal"
            mode={modal.mode}
            task={modal.task}
            status={modal.status}
            onClose={closeModal}
            onSave={refetch}
          />
        )}
      </AnimatePresence>
    </>
  );
}
