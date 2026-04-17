import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';

const Setup: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isProvisioning) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [isProvisioning]);

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic mb-4">
          COMPANY <span className="text-[#0047cc]">PROVISIONING</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Initialize your enterprise workspace. HRcopilot will automatically configure modules based on your organizational identity.
        </p>
      </motion.div>

      <GlassCard className="p-5 sm:p-10 max-w-2xl mx-auto relative overflow-hidden">
        {isProvisioning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white/80 dark:bg-[#0d0a1a]/80 backdrop-blur-md z-10 flex flex-col items-center justify-center p-10 text-center"
          >
            <div className="w-20 h-20 mb-6 relative">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-slate-200 dark:text-white/5 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                <motion.circle 
                  className="text-[#0047cc] stroke-current" 
                  strokeWidth="8" 
                  strokeLinecap="round" 
                  cx="50" cy="50" r="40" 
                  fill="transparent"
                  initial={{ strokeDasharray: "0 251.2" }}
                  animate={{ strokeDasharray: `${(progress / 100) * 251.2} 251.2` }}
                ></motion.circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-black italic text-[#0047cc]">
                {progress}%
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-2">Deploying Infrastructure...</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest animate-pulse">
              {progress < 30 ? 'Allocating Database...' : progress < 60 ? 'Configuring Identity Provider...' : 'Finalizing UI Brand Assets...'}
            </p>
          </motion.div>
        )}

        <div className="space-y-8">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Company Identity</label>
            <input
              id="company_name"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Global Industries"
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0047cc]/20 transition-all text-lg font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Primary Sector</label>
              <select className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 text-slate-900 dark:text-white focus:outline-none transition-all font-bold">
                <option>Real Estate & Properties</option>
                <option>Technology & Software</option>
                <option>Finance & Banking</option>
                <option>Manufacturing</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Employee Count</label>
              <select className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 text-slate-900 dark:text-white focus:outline-none transition-all font-bold">
                <option>1 - 50</option>
                <option>51 - 250</option>
                <option>251 - 1000</option>
                <option>1000+</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setIsProvisioning(true)}
            className="w-full py-5 bg-[#0047cc] text-white rounded-2xl text-xs font-black uppercase tracking-[0.25em] shadow-2xl shadow-blue-500/30 hover:bg-[#0035a0] transition-all hover:scale-[1.01] active:scale-95"
          >
            Initialize Workspace
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default Setup;

