// ============================================
// FILE: src/demo/admin/AdminCredentialsTab.tsx
// PURPOSE: Change admin username and password
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateAdminCreds, getAdminUsername } from './adminAuth';

export function AdminCredentialsTab() {
  const [username,    setUsername]    = useState(getAdminUsername());
  const [currentPass, setCurrentPass] = useState('');
  const [newPass,     setNewPass]     = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);

    if (!username.trim()) { setError('Username cannot be empty.'); return; }
    if (username.trim().length < 3) { setError('Username must be at least 3 characters.'); return; }

    if (newPass) {
      if (newPass.length < 8) { setError('New password must be at least 8 characters.'); return; }
      if (newPass !== confirmPass) { setError('Passwords do not match.'); return; }
    }

    updateAdminCreds(username.trim(), newPass || currentPass);
    setSaved(true);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-md space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-5">
          Update Admin Credentials
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#e0f2fe]0/40 transition-all"
            />
          </div>

          <div className="border-t border-white/5 pt-4">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-3">
              Change Password (leave blank to keep current)
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#e0f2fe]0/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Repeat new password"
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#e0f2fe]0/40 transition-all"
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <span className="text-rose-400">⚠</span>
                <p className="text-[11px] text-rose-400 font-medium">{error}</p>
              </motion.div>
            )}
            {saved && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <span className="text-emerald-400">✓</span>
                <p className="text-[11px] text-emerald-400 font-medium">Credentials updated successfully.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#0369a1] to-[#075985] text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#e0f2fe]0/20 hover:from-[#e0f2fe]0 hover:to-[#0369a1] transition-all">
            Save Credentials
          </button>
        </form>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1.5">⚠ Security Note</p>
        <p className="text-[11px] text-amber-300/70 leading-relaxed">
          Credentials are stored in localStorage. Change the default password before any live demo.
          Sessions expire after 8 hours automatically.
        </p>
      </div>
    </div>
  );
}

