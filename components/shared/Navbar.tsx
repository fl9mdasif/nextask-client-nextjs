'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Menu, X, LayoutGrid, ScanEye, BarChart3 } from 'lucide-react';
import { authApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/shared/ThemeToggle';

const NAV_LINKS = [
  { href: '/tasks',     label: 'Tasks',     icon: LayoutGrid },
  { href: '/annotate',  label: 'Annotate',  icon: ScanEye      },
  { href: '/analytics', label: 'Analytics', icon: BarChart3    },
];

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    const refresh = localStorage.getItem('refresh_token') ?? '';
    try { await authApi.logout(refresh); } catch { /* ignore */ }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
    router.push('/login');
    router.refresh();
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-white/8 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <Link href="/tasks" className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] flex items-center justify-center shadow-[0_0_12px_rgba(124,58,237,0.4)]">
              <svg
                className="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="3"  y="3"  width="7" height="7" rx="1.5" />
                <rect x="14" y="3"  width="7" height="7" rx="1.5" />
                <rect x="3"  y="14" width="7" height="7" rx="1.5" />
                <path d="M14 17.5h7M17.5 14v7" />
              </svg>
            </div>
            <span className="font-bold text-[#1a1625] dark:text-[#fafafa] tracking-tight">
              Nex<span className="text-[#8b5cf6]">Task</span>
            </span>
          </Link>

          {/* ── Desktop nav links ── */}
          <div className="hidden sm:flex items-center gap-1 flex-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                    active
                      ? 'text-[#8b5cf6]'
                      : 'text-[#71717a] hover:text-[#fafafa] hover:bg-white/6'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {/* active underline bar */}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#7c3aed]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ── Right: logout + hamburger ── */}
          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <ThemeToggle />

            {/* Divider */}
            <span className="w-px h-5 bg-white/10 dark:bg-white/10 mx-1" />

            {/* Logout — always visible */}
            <button
              id="logout-btn"
              onClick={handleLogout}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                'text-sm font-medium text-[#71717a]',
                'hover:text-[#fafafa] hover:bg-white/6',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40'
              )}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Hamburger — mobile only */}
            <button
              id="mobile-menu-btn"
              className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg text-[#71717a] hover:text-[#fafafa] hover:bg-white/6 transition-all duration-200"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0,   opacity: 1 }}
                    exit={{   rotate:  90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ rotate: 90,  opacity: 0 }}
                    animate={{ rotate: 0,   opacity: 1 }}
                    exit={{   rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile slide-down drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{    height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="sm:hidden sticky top-14 z-30 overflow-hidden border-b border-white/8 bg-[#0a0a0f]/95 backdrop-blur-xl"
          >
            <div className="flex flex-col px-4 py-3 gap-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                      active
                        ? 'bg-[#7c3aed]/15 text-[#8b5cf6] border border-[#7c3aed]/25'
                        : 'text-[#71717a] hover:text-[#fafafa] hover:bg-white/6'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
                    )}
                  </Link>
                );
              })}

              {/* Theme toggle row */}
              <div className="flex items-center justify-between px-4 py-3 mt-1 rounded-xl border border-white/6">
                <span className="text-sm font-medium text-[#71717a]">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
