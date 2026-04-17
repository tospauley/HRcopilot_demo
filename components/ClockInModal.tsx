import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

const ClockInModal: React.FC<ClockInModalProps> = ({ isOpen, onClose, userName = 'Employee' }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [locationStatus, setLocationStatus] = useState<'checking' | 'verified' | 'out_of_range'>('out_of_range');
  const [networkStatus] = useState<'verified' | 'failed'>('verified');
  const [faceStatus] = useState<'not_required' | 'verified'>('not_required');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setLocationStatus('checking');
      const t = setTimeout(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            () => setLocationStatus('verified'),
            () => setLocationStatus('out_of_range')
          );
        } else {
          setLocationStatus('out_of_range');
        }
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const canClockIn = locationStatus === 'verified' && networkStatus === 'verified';

  const handleClockIn = () => {
    if (!canClockIn && !clockedIn) return;
    if (clockedIn) {
      setClockedIn(false);
      setClockInTime(null);
    } else {
      setClockedIn(true);
      setClockInTime(new Date());
    }
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  const hours = pad(currentTime.getHours());
  const minutes = pad(currentTime.getMinutes());
  const seconds = pad(currentTime.getSeconds());

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();

  const getElapsed = () => {
    if (!clockInTime) return '00:00:00';
    const diff = Math.floor((currentTime.getTime() - clockInTime.getTime()) / 1000);
    return `${pad(Math.floor(diff / 3600))}:${pad(Math.floor((diff % 3600) / 60))}:${pad(diff % 60)}`;
  };

  type BadgeStatus = 'verified' | 'out_of_range' | 'not_required' | 'checking' | 'failed';

  const badgeCfg: Record<BadgeStatus, { dot: string; text: string; label: string }> = {
    verified:      { dot: 'bg-emerald-500', text: 'text-emerald-600', label: 'VERIFIED' },
    out_of_range:  { dot: 'bg-rose-500',    text: 'text-rose-600',    label: 'OUT OF RANGE' },
    not_required:  { dot: 'bg-slate-400',   text: 'text-slate-500',   label: 'NOT REQUIRED' },
    checking:      { dot: 'bg-amber-400 animate-pulse', text: 'text-amber-600', label: 'CHECKING...' },
    failed:        { dot: 'bg-rose-500',    text: 'text-rose-600',    label: 'FAILED' },
  };

  const StatusPill = ({ label, status, icon }: { label: string; status: BadgeStatus; icon: React.ReactNode }) => {
    const cfg = badgeCfg[status];
    return (
      <div className="flex flex-col items-center gap-2 px-5 py-3 bg-white rounded-2xl shadow-sm border border-slate-100 min-w-[90px]">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{icon}</span>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <span className={`text-[9px] font-black uppercase tracking-wider ${cfg.text}`}>{cfg.label}</span>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-xl"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="relative w-full max-w-md"
            style={{
              background: 'linear-gradient(160deg, #fff5f7 0%, #fdf4ff 40%, #f0f4ff 100%)',
              borderRadius: '48px',
              boxShadow: '0 40px 100px -20px rgba(120,60,180,0.18), 0 8px 32px -8px rgba(0,0,0,0.10)',
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-all z-10 border border-slate-100"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="px-10 pt-10 pb-8">

              {/* Header */}
              <div className="text-center mb-8">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3">
                  Secure System Connection
                </p>
                <div className="flex items-center justify-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #0369a1, #38bdf8)' }}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">
                    <span className="text-slate-800">ATTENDANCE </span>
                    <span style={{ background: 'linear-gradient(90deg,#0369a1,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      SYSTEM
                    </span>
                  </h2>
                </div>
              </div>

              {/* Clock Card */}
              <div className="bg-white/70 backdrop-blur-sm rounded-[28px] px-8 py-7 mb-6 text-center border border-white shadow-[0_4px_24px_-4px_rgba(120,60,180,0.10)]">
                <div className="flex items-center justify-center gap-1.5 mb-3">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Time</span>
                </div>

                {/* Big clock */}
                <div className="flex items-end justify-center gap-0.5 mb-2">
                  <span className="text-[72px] font-black text-slate-900 tabular-nums leading-none tracking-tight">
                    {hours}:{minutes}
                  </span>
                  <span className="text-3xl font-black text-slate-400 tabular-nums mb-2 ml-1">
                    {seconds}
                  </span>
                </div>

                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.18em]">
                  {formatDate(currentTime)}
                </p>

                {/* Elapsed timer when clocked in */}
                <AnimatePresence>
                  {clockedIn && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-slate-100"
                    >
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">● Session Active</p>
                      <p className="text-2xl font-black text-emerald-600 tabular-nums">{getElapsed()}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Status Pills */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <StatusPill
                  label="Location"
                  status={locationStatus}
                  icon={
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                />
                <StatusPill
                  label="Network"
                  status={networkStatus}
                  icon={
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                  }
                />
                <StatusPill
                  label="Face ID"
                  status={faceStatus}
                  icon={
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  }
                />
              </div>

              {/* Alert / Success Banner */}
              <AnimatePresence mode="wait">
                {!clockedIn && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-4 px-5 py-4 rounded-2xl mb-6"
                    style={{
                      background: locationStatus === 'checking'
                        ? 'linear-gradient(135deg,#fffbeb,#fef3c7)'
                        : canClockIn
                        ? 'linear-gradient(135deg,#ecfdf5,#d1fae5)'
                        : 'linear-gradient(135deg,#fff1f2,#ffe4e6)',
                      border: locationStatus === 'checking'
                        ? '1px solid #fde68a'
                        : canClockIn
                        ? '1px solid #a7f3d0'
                        : '1px solid #fecdd3',
                    }}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      locationStatus === 'checking' ? 'bg-amber-400' : canClockIn ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}>
                      {locationStatus === 'checking' ? (
                        <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                      ) : canClockIn ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-wider ${
                        locationStatus === 'checking' ? 'text-amber-700' : canClockIn ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {locationStatus === 'checking' ? 'Verifying Location...' : canClockIn ? 'Ready to Clock In' : 'Validation Error'}
                      </p>
                      <p className={`text-xs font-medium mt-0.5 ${
                        locationStatus === 'checking' ? 'text-amber-600' : canClockIn ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {locationStatus === 'checking'
                          ? 'Please wait while we verify your position.'
                          : canClockIn
                          ? 'All checks passed. You may clock in.'
                          : 'Boundary: Outside Operations Zone.'}
                      </p>
                    </div>
                  </motion.div>
                )}
                {clockedIn && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-4 px-5 py-4 rounded-2xl mb-6 border border-emerald-200"
                    style={{ background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)' }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Clocked In Successfully</p>
                      <p className="text-xs font-medium text-emerald-600 mt-0.5">
                        Session started · {clockInTime?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleClockIn}
                disabled={!canClockIn && !clockedIn}
                className="w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all"
                style={
                  clockedIn
                    ? { background: 'linear-gradient(135deg,#f43f5e,#e11d48)', color: '#fff', boxShadow: '0 8px 24px -4px rgba(244,63,94,0.35)' }
                    : canClockIn
                    ? { background: 'linear-gradient(135deg,#0369a1,#38bdf8)', color: '#fff', boxShadow: '0 8px 24px -4px rgba(3,105,161,0.35)' }
                    : { background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }
                }
              >
                {clockedIn ? '⏹  Clock Out' : '▶  Clock In'}
              </motion.button>

              {/* Close text link */}
              <button
                onClick={onClose}
                className="w-full mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ClockInModal;

