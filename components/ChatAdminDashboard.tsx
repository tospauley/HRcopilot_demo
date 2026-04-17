
import React from 'react';
import GlassCard from './GlassCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const activityData = [
  { name: 'Jveg', val: 40 }, { name: 'Glodops', val: 65 }, { name: 'Daily', val: 50 },
  { name: 'Ssers', val: 85 }, { name: 'Innotis', val: 70 }, { name: 'New', val: 95 },
  { name: 'Smithat', val: 80 }
];

const ChatAdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 overflow-y-auto pr-2">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Chat Admin <span className="text-slate-400 dark:text-slate-500 font-normal italic">Dashboard</span></h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Users', val: '840', sub: 'Online: 168', icon: '👤', color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Active Chat', val: '215', sub: 'Last Created', icon: '💬', color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Total Messages', val: '485K', sub: '+1.6K today', icon: '📈', color: 'text-[#0047cc]' },
        ].map((s, i) => (
          <GlassCard key={i} className="!p-4">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[24px] font-black text-slate-900 dark:text-white">{s.val}</p>
                 <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{s.label}</p>
               </div>
               <span className="text-xl opacity-40">{s.icon}</span>
             </div>
             <p className={`text-[8px] font-bold uppercase mt-2 ${s.color}`}>{s.sub}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard title="Chat Analytics" action={<span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase">Last 30 Days ›</span>}>
        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Message Activity</p>
        <div className="h-48 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#00000010" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a' }} />
              <Bar dataKey="val" fill="#0047cc" radius={[4, 4, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard title="Keyword Management" action={<span className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase">Audit History</span>}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase border-b border-slate-200 dark:border-white/5">
                  <th className="py-2">Channel</th>
                  <th className="py-2">Members</th>
                  <th className="py-2">Messages (today)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {[
                  { n: 'General', m: 278, t: '32 / 158' },
                  { n: 'Engineering', m: '057', t: '184 / 11' },
                  { n: 'Sales', m: 670, t: '6E / 89' },
                ].map((ch, i) => (
                  <tr key={i} className="text-[10px] text-slate-500 dark:text-slate-300">
                    <td className="py-3 font-bold text-slate-900 dark:text-white"># {ch.n}</td>
                    <td className="py-3">{ch.m}</td>
                    <td className="py-3">{ch.t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard title="Monitoring & Profanity Filter">
          <div className="space-y-3">
             {['confidential', 'leaked', 'meeting//11_identity'].map((word, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-transparent">
                 <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{word}</span>
                 <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 text-[8px] font-black uppercase rounded">Block</span>
               </div>
             ))}
             <button className="w-full py-2 bg-[#0047cc] text-white text-[9px] font-black uppercase tracking-widest rounded-lg mt-2 shadow-lg shadow-[#e0f2fe]0/20">Add New Trigger</button>
          </div>
        </GlassCard>
      </div>

      <GlassCard title="Compliance Settings">
         <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">Data Retention</span>
            <select className="bg-slate-50 dark:bg-white/5 text-[10px] text-slate-900 dark:text-white p-1 rounded outline-none border border-slate-200 dark:border-white/10">
              <option>180 days</option>
              <option>1 year</option>
              <option>Forever</option>
            </select>
         </div>
         <div className="flex justify-between items-center py-4">
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">Chat Policy</span>
            <div className="w-8 h-4 bg-emerald-500 rounded-full p-0.5 flex justify-end">
              <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
            </div>
         </div>
      </GlassCard>
    </div>
  );
};

export default ChatAdminDashboard;

