// ============================================
// FILE: src/demo/admin/AdminLogin.tsx
// PURPOSE: Isolated admin login page — no connection to main app
// ============================================

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminLogin } from './adminAuth';

interface Props {
  onSuccess: () => void;
}

export function AdminLogin({ onSuccess }: Props) {
  const [username,  setUsername]  = useState('');
  const [password,  setPassword]  = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [showPass,  setShowPass]  = useState(false);
  const [attempts,  setAttempts]  = useState(0);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { usernameRef.current?.focus(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || attempts >= 5) return;

    setLoading(true);
    setError('');

    // Artificial delay — prevents brute force timing attacks
    await new Promise((r) => setTimeout(r, 600));

    const ok = adminLogin(username.trim(), password);
    setLoading(false);

    if (ok) {
      onSuccess();
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setPassword('');
      setError(
        next >= 5
          ? 'Too many failed attempts. Refresh the page to try again.'
          : `Invalid credentials. ${5 - next} attempt${5 - next === 1 ? '' : 's'} remaining.`,
      );
    }
  };

  const locked = attempts >= 5;

  return (
    <div className="min-h-screen bg-[#0d0a1a] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#0369a1]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-[#0369a1]/8 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[28px] p-8 shadow-2xl">

          {/* Logo + title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#0369a1] to-[#075985] flex items-center justify-center shadow-lg shadow-[#e0f2fe]0/30">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-white uppercase tracking-tight">
              HRcopilot Admin
            </h1>
            <p className="text-[11px] text-white/40 font-medium mt-1 uppercase tracking-[0.2em]">
              Demo System Control Panel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1.5">
                Username
              </label>
              <input
                ref={usernameRef}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={locked}
                autoComplete="username"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#e0f2fe]0/40 focus:border-[#e0f2fe]0/40 transition-all disabled:opacity-40"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={locked}
                  autoComplete="current-password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#e0f2fe]0/40 focus:border-[#e0f2fe]0/40 transition-all disabled:opacity-40"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl"
              >
                <span className="text-rose-400 text-sm">⚠</span>
                <p className="text-[11px] text-rose-400 font-medium">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading || locked || !username || !password}
              className="w-full py-3 bg-gradient-to-r from-[#0369a1] to-[#075985] text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#e0f2fe]0/20 hover:shadow-[#e0f2fe]0/30 hover:from-[#e0f2fe]0 hover:to-[#0369a1] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying…
                </>
              ) : 'Access Admin Panel'}
            </button>
          </form>

          {/* Default creds hint — only in dev */}
          {import.meta.env.DEV && (
            <p className="text-center text-[9px] text-white/20 mt-6 font-mono">
              Default: admin / HRcopilotadmin
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[9px] text-white/20 mt-4 uppercase tracking-widest">
          HRcopilot · Restricted Access · Admin Only
        </p>
      </motion.div>
    </div>
  );
}

