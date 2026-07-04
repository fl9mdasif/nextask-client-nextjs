'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Zap } from 'lucide-react';
import { authApi } from '@/lib/api';
import { cn } from '@/lib/utils';

// ─── Floating Label Input ────────────────────────────────────────────────────

interface FloatingInputProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  disabled?: boolean;
  rightElement?: React.ReactNode;
  autoComplete?: string;
}

function FloatingInput({
  id,
  label,
  type,
  value,
  onChange,
  icon,
  disabled,
  rightElement,
  autoComplete,
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const isFloated = focused || value.length > 0;

  return (
    <div className="relative">
      {/* Left icon */}
      <div
        className={cn(
          'absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200',
          isFloated ? 'text-[#8b5cf6]' : 'text-[#52525b]'
        )}
      >
        {icon}
      </div>

      {/* Floating label */}
      <label
        htmlFor={id}
        className={cn(
          'absolute left-11 transition-all duration-200 pointer-events-none select-none',
          isFloated
            ? 'top-2 text-[10px] font-medium tracking-wide text-[#8b5cf6]'
            : 'top-1/2 -translate-y-1/2 text-sm text-[#71717a]'
        )}
      >
        {label}
      </label>

      {/* Input */}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        autoComplete={autoComplete}
        className={cn(
          'w-full h-14 pl-11 pr-12 pt-4 pb-1',
          'bg-[#16161f] rounded-xl text-sm text-[#fafafa]',
          'border transition-all duration-200 outline-none',
          'placeholder-transparent',
          focused
            ? 'border-[#7c3aed] shadow-[0_0_0_3px_rgba(124,58,237,0.15)]'
            : 'border-white/8 hover:border-white/16',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />

      {/* Right element (eye toggle, etc.) */}
      {rightElement && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
  );
}

// ─── LoginForm ───────────────────────────────────────────────────────────────

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') ?? '/tasks';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  const triggerShake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      triggerShake();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await authApi.login(email, password);

      // Store in localStorage (for Axios interceptor)
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      // Store in cookie (for Next.js middleware on Edge runtime)
      document.cookie = `access_token=${data.access}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      router.push(nextPath);
      router.refresh();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? 'Invalid email or password. Please try again.';
      setError(msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('w-full', shaking && 'shake')}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* ── Error Banner ── */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Email ── */}
        <FloatingInput
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={(v) => { setEmail(v); setError(''); }}
          icon={<Mail className="w-4 h-4" />}
          disabled={loading}
          autoComplete="email"
        />

        {/* ── Password ── */}
        <FloatingInput
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(v) => { setPassword(v); setError(''); }}
          icon={<Lock className="w-4 h-4" />}
          disabled={loading}
          autoComplete="current-password"
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              tabIndex={-1}
              className="text-[#52525b] hover:text-[#a1a1aa] transition-colors duration-150"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
        />

        {/* ── Submit ── */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.015 }}
          whileTap={{ scale: loading ? 1 : 0.985 }}
          className={cn(
            'relative w-full h-12 mt-2 rounded-xl font-semibold text-sm text-white',
            'bg-gradient-to-r from-[#7c3aed] to-[#6d28d9]',
            'hover:from-[#8b5cf6] hover:to-[#7c3aed]',
            'transition-all duration-200',
            'shadow-[0_4px_24px_rgba(124,58,237,0.4)]',
            'hover:shadow-[0_6px_32px_rgba(124,58,237,0.55)]',
            'focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50',
            'disabled:opacity-70 disabled:cursor-not-allowed'
          )}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              Sign in to NexTask
            </span>
          )}
        </motion.button>
      </form>
    </div>
  );
}
