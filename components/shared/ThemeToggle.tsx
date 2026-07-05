'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Avoid hydration mismatch — only render icon after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = theme === 'dark';

  if (!mounted) {
    return (
      <button
        id="theme-toggle-btn"
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-lg',
          'text-[#71717a] dark:text-[#71717a]'
        )}
        aria-label="Toggle theme"
        disabled
      >
        <span className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      id="theme-toggle-btn"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'flex items-center justify-center w-9 h-9 rounded-lg',
        'text-[#71717a] dark:text-[#71717a]',
        'hover:text-[#fafafa] dark:hover:text-[#fafafa]',
        'hover:bg-black/6 dark:hover:bg-white/6',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40'
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
            animate={{ rotate: 0,   opacity: 1, scale: 1   }}
            exit={{    rotate:  90, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <Moon className="w-4 h-4" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ rotate:  90, opacity: 0, scale: 0.8 }}
            animate={{ rotate: 0,   opacity: 1, scale: 1   }}
            exit={{    rotate: -90, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <Sun className="w-4 h-4 text-amber-400" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
