'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  ChevronDown,
  Check,
  Tag,
  Loader2,
  Save,
} from 'lucide-react';
import { format } from 'date-fns';
import { tasksApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import useToastStore from '@/store/toastStore';
import type { TaskModalProps, Priority, Status } from '@/src/interfaces';

// ─── Select helpers ───────────────────────────────────────────────────────────

const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <Select.Item
    value={value}
    className={cn(
      'flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer',
      'text-[#a1a1aa] outline-none',
      'data-[highlighted]:bg-[#7c3aed]/15 data-[highlighted]:text-[#fafafa]',
      'data-[state=checked]:text-[#8b5cf6]'
    )}
  >
    <Select.ItemText>{children}</Select.ItemText>
    <Select.ItemIndicator>
      <Check className="w-3.5 h-3.5 text-[#8b5cf6]" />
    </Select.ItemIndicator>
  </Select.Item>
);

// ─── Field label ─────────────────────────────────────────────────────────────

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-[#71717a] mb-1.5">
      {children}
    </label>
  );
}

// ─── TaskModal ────────────────────────────────────────────────────────────────

export default function TaskModal({ mode, task, status, onClose, onSave }: TaskModalProps) {
  const isEdit = mode === 'edit';

  const [title, setTitle] = useState(task?.title ?? '');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium');
  const [taskStatus, setTaskStatus] = useState<Status>((task?.status ?? status) as Status);
  const [dueDate, setDueDate] = useState(task?.due_date ?? format(new Date(), 'yyyy-MM-dd'));
  const [tags, setTags] = useState<string[]>(task?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  // Focus title on open
  useEffect(() => {
    const t = setTimeout(() => titleRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  // Add tag on Enter
  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = tagInput.trim().toLowerCase();
      if (trimmed && !tags.includes(trimmed)) {
        setTags((prev) => [...prev, trimmed]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!dueDate)       { setError('Due date is required.'); return; }

    setLoading(true);
    setError('');

    const { addToast } = useToastStore.getState();

    try {
      if (isEdit && task) {
        await tasksApi.update(task.id, { title: title.trim(), priority, status: taskStatus, due_date: dueDate, tags });
        addToast('Task updated successfully', 'success');
      } else {
        await tasksApi.create({ title: title.trim(), priority, status: taskStatus as Status, due_date: dueDate, tags });
        addToast('Task created successfully', 'success');
      }
      onSave();
      onClose();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = cn(
    'w-full h-10 px-3 rounded-xl text-sm text-[#fafafa] bg-[#16161f]',
    'border border-white/8 outline-none',
    'hover:border-white/16 focus:border-[#7c3aed]',
    'focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)]',
    'transition-all duration-200 placeholder:text-[#3f3f46]'
  );

  const selectTriggerCls = cn(
    'flex items-center justify-between w-full h-10 px-3 rounded-xl text-sm text-[#fafafa] bg-[#16161f]',
    'border border-white/8 outline-none',
    'hover:border-white/16 data-[state=open]:border-[#7c3aed]',
    'data-[state=open]:shadow-[0_0_0_3px_rgba(124,58,237,0.15)]',
    'transition-all duration-200 cursor-pointer'
  );

  const selectContentCls = cn(
    'z-50 w-[--radix-select-trigger-width] p-1.5 rounded-xl',
    'bg-[#16161f] border border-white/8',
    'shadow-xl shadow-black/40'
  );

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />

        {/* Content */}
        <Dialog.Content
          className={cn(
            'fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-md max-h-[90vh] overflow-y-auto',
            'bg-[#111118] border border-white/8 rounded-2xl shadow-2xl',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-4',
            'focus:outline-none'
          )}
        >
          <form onSubmit={handleSubmit}>
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/8">
              <Dialog.Title className="text-base font-semibold text-[#fafafa]">
                {isEdit ? 'Edit Task' : 'New Task'}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-[#52525b] hover:text-[#fafafa] hover:bg-white/6 transition-all duration-150"
                >
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>

            {/* ── Body ── */}
            <div className="px-6 py-5 flex flex-col gap-4">
              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Title */}
              <div>
                <Label htmlFor="task-title">Title</Label>
                <input
                  ref={titleRef}
                  id="task-title"
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setError(''); }}
                  placeholder="What needs to be done?"
                  className={inputCls}
                />
              </div>

              {/* Priority + Status row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Priority */}
                <div>
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select.Root value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                    <Select.Trigger id="task-priority" className={selectTriggerCls}>
                      <Select.Value />
                      <Select.Icon><ChevronDown className="w-3.5 h-3.5 text-[#52525b]" /></Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className={selectContentCls} position="popper" sideOffset={4}>
                        <Select.Viewport>
                          <SelectItem value="high">🔴 High</SelectItem>
                          <SelectItem value="medium">🟡 Medium</SelectItem>
                          <SelectItem value="low">🟢 Low</SelectItem>
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>

                {/* Status */}
                <div>
                  <Label htmlFor="task-status">Status</Label>
                  <Select.Root value={taskStatus} onValueChange={(v) => setTaskStatus(v as Status)}>
                    <Select.Trigger id="task-status" className={selectTriggerCls}>
                      <Select.Value />
                      <Select.Icon><ChevronDown className="w-3.5 h-3.5 text-[#52525b]" /></Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className={selectContentCls} position="popper" sideOffset={4}>
                        <Select.Viewport>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="inprogress">In Progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
              </div>

              {/* Due date */}
              <div>
                <Label htmlFor="task-due-date">Due Date</Label>
                <input
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={cn(inputCls, 'text-[#a1a1aa]')}
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              {/* Tags */}
              <div>
                <Label htmlFor="task-tags">Tags</Label>
                {/* Tag pills */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#7c3aed]/15 text-[#8b5cf6] ring-1 ring-[#7c3aed]/20"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-400 transition-colors duration-150"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {/* Tag input */}
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#52525b]" />
                  <input
                    id="task-tags"
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Type tag and press Enter…"
                    className={cn(inputCls, 'pl-8')}
                  />
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-end gap-3 px-6 pb-5">
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium',
                  'text-[#71717a] hover:text-[#fafafa]',
                  'hover:bg-white/6 transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-white/10'
                )}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white',
                  'bg-gradient-to-r from-[#7c3aed] to-[#6d28d9]',
                  'hover:from-[#8b5cf6] hover:to-[#7c3aed]',
                  'shadow-[0_2px_16px_rgba(124,58,237,0.35)]',
                  'hover:shadow-[0_4px_24px_rgba(124,58,237,0.5)]',
                  'transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50',
                  'disabled:opacity-60 disabled:cursor-not-allowed'
                )}
              >
                {loading ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                ) : (
                  <><Save className="w-3.5 h-3.5" /> {isEdit ? 'Update' : 'Create'}</>
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
