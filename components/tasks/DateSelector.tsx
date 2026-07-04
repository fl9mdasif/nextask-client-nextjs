'use client';

import { useRef } from 'react';
import { addDays, subDays, isToday, isSameDay, format } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DateSelectorProps } from '@/src/interfaces';

export default function DateSelector({ selected, onChange }: DateSelectorProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  // 7-day sliding window centred on the selected date
  const days = Array.from({ length: 7 }, (_, i) => addDays(subDays(selected, 3), i));

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Month/Year label (Clickable to trigger datepicker) */}
      <button
        onClick={() => dateInputRef.current?.showPicker()}
        className={cn(
          'flex items-center gap-1.5 text-sm text-[#71717a] min-w-[130px] px-2.5 py-1.5 rounded-lg border border-white/8 bg-white/[0.02]',
          'hover:text-[#fafafa] hover:bg-white/6 hover:border-white/16 cursor-pointer relative outline-none',
          'transition-all duration-200 focus:ring-2 focus:ring-[#7c3aed]/40'
        )}
      >
        <CalendarDays className="w-4 h-4 shrink-0" />
        <span className="font-semibold text-xs tracking-wide">{format(selected, 'MMMM yyyy')}</span>
        <input
          ref={dateInputRef}
          type="date"
          value={format(selected, 'yyyy-MM-dd')}
          onChange={(e) => {
            if (e.target.value) {
              onChange(new Date(e.target.value + 'T00:00:00'));
            }
          }}
          className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
        />
      </button>

      {/* Day strip */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          id="date-prev"
          onClick={() => onChange(subDays(selected, 1))}
          aria-label="Previous day"
          className={cn(
            'p-1.5 rounded-lg text-[#52525b]',
            'hover:text-[#fafafa] hover:bg-white/6',
            'transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Day pills */}
        <div className="flex gap-1">
          {days.map((day) => {
            const isActive = isSameDay(day, selected);
            const isCurrentDay = isToday(day);

            return (
              <button
                key={day.toISOString()}
                id={`date-${format(day, 'yyyy-MM-dd')}`}
                onClick={() => onChange(day)}
                className={cn(
                  'flex flex-col items-center justify-center w-10 h-12 rounded-xl',
                  'text-xs font-medium transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40',
                  isActive
                    ? 'bg-[#7c3aed] text-white shadow-[0_0_16px_rgba(124,58,237,0.45)]'
                    : [
                        'text-[#71717a] hover:text-[#fafafa] hover:bg-white/6',
                        isCurrentDay && 'ring-1 ring-[#7c3aed]/50',
                      ]
                )}
              >
                <span className="text-[9px] uppercase tracking-wider opacity-70">
                  {format(day, 'EEE')}
                </span>
                <span className="text-sm font-semibold mt-0.5">{format(day, 'd')}</span>
              </button>
            );
          })}
        </div>

        {/* Next */}
        <button
          id="date-next"
          onClick={() => onChange(addDays(selected, 1))}
          aria-label="Next day"
          className={cn(
            'p-1.5 rounded-lg text-[#52525b]',
            'hover:text-[#fafafa] hover:bg-white/6',
            'transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40'
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Today shortcut — only visible when not on today */}
      {!isToday(selected) && (
        <button
          id="date-today"
          onClick={() => onChange(new Date())}
          className={cn(
            'text-xs px-3 py-1.5 rounded-lg',
            'border border-white/8 text-[#71717a]',
            'hover:text-[#fafafa] hover:border-white/16 hover:bg-white/4',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40'
          )}
        >
          Today
        </button>
      )}
    </div>
  );
}
