'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { authApi } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    const refresh = localStorage.getItem('refresh_token') ?? '';
    try {
      await authApi.logout(refresh);
    } catch {
      // ignore — still clear tokens
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // Clear cookie
    document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-40 h-14 border-b border-white/8 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        {/* ── Logo ── */}
        <div className="flex items-center gap-2.5">
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
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <path d="M14 17.5h7M17.5 14v7" />
            </svg>
          </div>
          <span className="font-bold text-[#fafafa] tracking-tight">
            Nex<span className="text-[#8b5cf6]">Task</span>
          </span>
        </div>

        {/* ── Right actions ── */}
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
      </div>
    </nav>
  );
}
