import React, { useState } from 'react';
import { BrandSettings, UserRole, UserProfile } from '../types';
import { ThemeToggle } from '../App';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
  onBackToLanding: () => void;
  initialMode?: 'login' | 'register';
  brand: BrandSettings;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const DEMO_ROLES: { label: string; username: string; name: string; role: UserRole; color: string; icon: string; desc: string }[] = [
  { label: 'CEO',        username: 'ceo',        name: 'Sarah Chen',   role: UserRole.CEO,        color: '#0047cc', icon: '👔', desc: 'Executive overview'   },
  { label: 'HR Manager', username: 'hrmanager',  name: 'David Kim',    role: UserRole.HR_MANAGER, color: '#0ea5e9', icon: '👥', desc: 'People & operations'  },
  { label: 'Accountant', username: 'accountant', name: 'Maria Garcia', role: UserRole.ACCOUNTANT, color: '#f59e0b', icon: '💰', desc: 'Finance & payroll'    },
  { label: 'Employee',   username: 'employee',   name: 'Alex Rivera',  role: UserRole.EMPLOYEE,   color: '#10b981', icon: '🧑‍💻', desc: 'Self-service portal' },
];

const Login: React.FC<LoginProps> = ({ onLogin, onBackToLanding, brand, theme, onToggleTheme }) => {
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState(false);
  const [loading, setLoading]           = useState(false);
  const [activeRole, setActiveRole]     = useState<string | null>(null);

  const doLogin = (profile: UserProfile) => {
    setLoading(true);
    setTimeout(() => onLogin(profile), 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = DEMO_ROLES.find(r => r.username === username.trim().toLowerCase());
    if (match && password === 'password123') {
      doLogin({ name: match.name, username: match.username, avatar: `https://picsum.photos/40/40?sig=${match.username}`, role: match.role });
    } else {
      setError(true);
      setTimeout(() => setError(false), 2500);
    }
  };

  const handleRoleClick = (r: typeof DEMO_ROLES[0]) => {
    setActiveRole(r.username);
    setUsername(r.username);
    setPassword('password123');
    setTimeout(() => {
      doLogin({ name: r.name, username: r.username, avatar: `https://picsum.photos/40/40?sig=${r.username}`, role: r.role });
    }, 300);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50 dark:bg-[#080614] flex flex-col font-['Plus_Jakarta_Sans'] text-slate-900 dark:text-white transition-colors duration-500 overflow-hidden">

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[80%] bg-[#e0f2fe]0/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Nav */}
      <header className="relative z-20 flex items-center justify-between px-4 md:px-14 h-16 md:h-20 border-b border-slate-200 dark:border-white/5 bg-white/60 dark:bg-white/[0.02] backdrop-blur-2xl">
        <button onClick={onBackToLanding} className="flex items-center gap-3 group">
          <img src="/Analytictosin_Logo.png" alt="Analytictosin Logo" className="h-9 w-auto object-contain drop-shadow-sm" />
          <span className="text-lg font-black tracking-tighter uppercase italic text-slate-900 dark:text-white group-hover:text-[#0047cc] transition-colors">
            {brand.companyName}<span className="text-orange-500 font-normal">.</span>
          </span>
        </button>
        <div className="flex items-center gap-4">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-start lg:items-center justify-center p-4 md:p-6 py-6 md:py-10 overflow-y-auto">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* ── Left: Login form ── */}
          <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-xl backdrop-blur-xl">
            <div className="mb-6 md:mb-8">
              <img src="/Analytictosin_Logo.png" alt="Analytictosin Logo" className="h-12 md:h-14 w-auto object-contain mb-4 md:mb-5 drop-shadow-md" />
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Welcome back</h1>
              <p className="text-sm text-slate-500 mt-1">Sign in to your HRcopilot workspace</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Username</label>
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    type="text"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError(false); }}
                    placeholder="e.g. admin"
                    className={`w-full bg-slate-50 dark:bg-white/5 border rounded-xl py-3.5 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${error ? 'border-rose-400 focus:ring-rose-400/20' : 'border-slate-200 dark:border-white/10 focus:ring-blue-500/20'}`}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Password</label>
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(false); }}
                    placeholder="password123"
                    className={`w-full bg-slate-50 dark:bg-white/5 border rounded-xl py-3.5 pl-11 pr-12 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${error ? 'border-rose-400 focus:ring-rose-400/20' : 'border-slate-200 dark:border-white/10 focus:ring-blue-500/20'}`}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                    {showPassword
                      ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl animate-in fade-in duration-200">
                  <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">Invalid username or password. Use a demo role below.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-lg hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60 mt-2 bg-[#0047cc] shadow-blue-500/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 text-center">
              <p className="text-xs text-slate-400">All demo accounts use password: <span className="font-black text-slate-600 dark:text-slate-300">password123</span></p>
            </div>
          </div>

          {/* ── Right: Demo role selector ── */}
          <div>
            <div className="mb-4">
              <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white tracking-tight">Demo Accounts</h2>
              <p className="text-sm text-slate-500 mt-0.5">Tap any role to sign in instantly</p>
            </div>

            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {DEMO_ROLES.map(r => (
                <button
                  key={r.username}
                  onClick={() => handleRoleClick(r)}
                  disabled={loading}
                  className={`relative flex items-center gap-4 p-4 rounded-2xl border text-left transition-all group hover:scale-[1.02] active:scale-[0.99] disabled:opacity-50 ${
                    activeRole === r.username
                      ? 'border-transparent shadow-lg scale-[1.02]'
                      : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:border-transparent hover:shadow-md'
                  }`}
                  style={activeRole === r.username ? { backgroundColor: r.color + '15', borderColor: r.color + '40', boxShadow: `0 8px 24px -6px ${r.color}30` } : {}}
                >
                  {/* Color accent bar */}
                  <div className="absolute left-0 top-3 bottom-3 w-1 rounded-full transition-all" style={{ backgroundColor: activeRole === r.username ? r.color : 'transparent' }} />

                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-lg md:text-xl flex-shrink-0 transition-all" style={{ backgroundColor: r.color + '20' }}>
                    {activeRole === r.username && loading
                      ? <svg className="w-5 h-5 animate-spin" style={{ color: r.color }} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      : r.icon
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-black text-slate-900 dark:text-white truncate">{r.label}</p>
                    <p className="text-[9px] md:text-[10px] text-slate-500 font-medium mt-0.5 hidden sm:block">{r.desc}</p>
                    <p className="text-[9px] md:text-[10px] font-black mt-0.5 font-mono" style={{ color: r.color }}>{r.username}</p>
                  </div>

                  <svg className="w-3 h-3 md:w-4 md:h-4 text-slate-300 dark:text-white/20 group-hover:text-slate-500 dark:group-hover:text-white/50 transition-colors flex-shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>

            <div className="mt-3 md:mt-4 p-3 md:p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex items-start gap-3">
              <span className="text-lg flex-shrink-0">💡</span>
              <div>
                <p className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wide">Demo Mode</p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">All accounts share the password <span className="font-black">password123</span>. Each role shows a different view of the platform.</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="relative z-10 text-center py-6 border-t border-slate-200 dark:border-white/5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2024 {brand.companyName} · Enterprise HR Platform</p>
      </footer>
    </div>
  );
};

export default Login;

