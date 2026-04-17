// ============================================
// FILE: src/demo/admin/AdminShell.tsx
// PURPOSE: Admin panel shell — sidebar + tab routing.
//          Completely isolated from the main HRcopilot app.
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminLogout, getAdminUsername } from './adminAuth';
import { NarratorInlinePanel } from '../voice/NarratorInlinePanel';
import { AdminCredentialsTab } from './AdminCredentialsTab';
import { ApiKeysTab } from './ApiKeysTab';

type AdminTab = 'narrator' | 'apikeys' | 'credentials' | 'system';

const TABS: { id: AdminTab; label: string; icon: string; description: string }[] = [
  { id: 'narrator',    label: 'Narrator System',   icon: '🎙️', description: 'Voice provider, audio cache, subtitle settings' },
  { id: 'apikeys',     label: 'API Keys',           icon: '🔑', description: 'Groq key pool (up to 10) + ElevenLabs config'   },
  { id: 'credentials', label: 'Admin Credentials', icon: '🔐', description: 'Change admin username and password'              },
  { id: 'system',      label: 'System Info',        icon: '⚙️', description: 'Demo system status and diagnostics'             },
];

interface Props { onLogout: () => void; }

export function AdminShell({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>('narrator');
  const username = getAdminUsername();

  const handleLogout = () => { adminLogout(); onLogout(); };

  return (
    <div className="min-h-screen bg-[#0d0a1a] flex text-white">

      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#0369a1]/8 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#0369a1]/6 blur-[100px] rounded-full" />
      </div>

      {/* ── Sidebar ── */}
      <aside className="relative w-64 flex-shrink-0 border-r border-white/5 flex flex-col bg-white/[0.02]">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0369a1] to-[#075985] flex items-center justify-center shadow-lg shadow-[#e0f2fe]0/30 flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-black text-white uppercase tracking-tight">HRcopilot</p>
              <p className="text-[9px] text-white/40 font-bold uppercase tracking-[0.2em]">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-[#0369a1]/20 border border-[#e0f2fe]0/30 text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className="text-lg flex-shrink-0 mt-0.5">{tab.icon}</span>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-tight">{tab.label}</p>
                <p className="text-[9px] opacity-60 mt-0.5 leading-relaxed">{tab.description}</p>
              </div>
            </button>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-4 py-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0369a1]/30 border border-[#e0f2fe]0/30 flex items-center justify-center text-[10px] font-black text-[#38bdf8] uppercase">
                {username.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] font-black text-white/80">{username}</p>
                <p className="text-[8px] text-white/30 uppercase tracking-widest">Administrator</p>
              </div>
            </div>
            <button onClick={handleLogout} title="Logout"
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-white/30 flex items-center justify-center transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="relative flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 px-8 py-4 border-b border-white/5 bg-[#0d0a1a]/80 backdrop-blur-xl flex items-center justify-between">
          <div>
            <h1 className="text-base font-black text-white uppercase tracking-tight">
              {TABS.find((t) => t.id === activeTab)?.label}
            </h1>
            <p className="text-[10px] text-white/40 mt-0.5">
              {TABS.find((t) => t.id === activeTab)?.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">System Online</span>
          </div>
        </div>

        {/* Tab content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {activeTab === 'narrator'    && <NarratorInlinePanel />}
              {activeTab === 'apikeys'     && <ApiKeysTab />}
              {activeTab === 'credentials' && <AdminCredentialsTab />}
              {activeTab === 'system'      && <SystemInfoTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ── System info tab ────────────────────────────────────────────────────────────

function SystemInfoTab() {
  const rows = [
    { label: 'App Version',       value: '1.0.0'                          },
    { label: 'Environment',       value: import.meta.env.MODE             },
    { label: 'Kokoro Package',    value: 'kokoro-js@1.2.1'                },
    { label: 'React Version',     value: '19.x'                           },
    { label: 'Vite Version',      value: '6.x'                            },
    { label: 'IndexedDB Cache',   value: 'HRcopilot_audio_cache'              },
    { label: 'Config Storage',    value: 'HRcopilot_narrator_config'          },
    { label: 'Admin Session TTL', value: '8 hours'                        },
    { label: 'Admin Route',       value: '/#/admin  or  /?admin'          },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">System Information</p>
        </div>
        <div className="divide-y divide-white/5">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-6 py-3">
              <span className="text-[11px] text-white/50 font-medium">{label}</span>
              <span className="text-[11px] text-white font-mono font-bold">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">⚠ Access Control</p>
        <p className="text-[11px] text-amber-300/70 leading-relaxed">
          This panel is only accessible at{' '}
          <span className="font-mono text-amber-300">localhost:3000/?admin</span>.
          It is completely separate from the demo login. Do not share this URL with demo attendees.
          Change the default credentials immediately after first login.
        </p>
      </div>
    </div>
  );
}

