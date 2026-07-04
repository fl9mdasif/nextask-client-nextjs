'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import useToastStore, { type ToastType } from '@/store/toastStore';
import { cn } from '@/lib/utils';

const iconMap = {
  success: <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />,
  error:   <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />,
  info:    <Info className="w-4 h-4 text-[#8b5cf6] shrink-0" />,
};

const borderMap = {
  success: 'border-l-green-500/50',
  error:   'border-l-red-500/50',
  info:    'border-l-[#7c3aed]/50',
};

export default function ToastProvider() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } }}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl glass border-l-[3px] shadow-lg shadow-black/20',
              borderMap[toast.type]
            )}
          >
            {/* Icon */}
            <div className="mt-0.5">{iconMap[toast.type]}</div>

            {/* Message */}
            <p className="text-sm font-medium text-[#fafafa] flex-1 leading-snug">
              {toast.message}
            </p>

            {/* Close */}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#52525b] hover:text-[#fafafa] transition-colors duration-150 p-0.5 rounded-lg hover:bg-white/6 shrink-0"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
