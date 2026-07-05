import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginCard from '@/components/auth/LoginCard';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In — NexTask',
  description: 'Sign in to NexTask to manage your tasks and annotations.',
};

// ─── Decorative background orbs (static, no client JS needed) ────────────────

function BackgroundOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(ellipse, #7c3aed 0%, transparent 60%)' }}
      />
    </div>
  );
}

// ─── Page (Server Component) ──────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 bg-animated-gradient">
      <BackgroundOrbs />

      {/* Noise texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      {/* Animated card wrapper (client) */}
      <LoginCard>
        {/* Glass card */}
        <div className="glass rounded-2xl p-8 shadow-2xl w-full max-w-sm">

          {/* ── Logo / Wordmark ── */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] flex items-center justify-center shadow-[0_0_24px_rgba(124,58,237,0.5)]">
              <svg
                className="w-6 h-6 text-white"
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

            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-[#fafafa]">
                Nex<span className="text-[#8b5cf6]">Task</span>
              </h1>
              <p className="text-sm text-[#71717a] mt-0.5">
                Sign in to your workspace
              </p>
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-[#52525b] font-medium tracking-widest uppercase">
              credentials
            </span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* ── Form (client, needs useSearchParams → Suspense required) ── */}
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>

          {/* ── Footer ── */}
          <p className="mt-6 text-center text-xs text-[#52525b]">
            Secured by JWT authentication &mdash; Md Asif Al Azad
          </p>
        </div>

        {/* Card ambient glow */}
        <div
          className="absolute inset-0 -z-10 rounded-2xl blur-2xl opacity-30"
          style={{ background: 'linear-gradient(135deg, #7c3aed22, #3b82f611)' }}
        />
      </LoginCard>
    </main>
  );
}
