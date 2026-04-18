import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { DEMO_EMPLOYEES, DEMO_OBJECTIVES, DEMO_TEAM_PERFORMANCE } from '../demoData';

// Logged-in employee = Kelly Robinson (E01)
const ME = DEMO_EMPLOYEES.find(e => e.id === 'E01')!;
const MY_DEPT_PERF = DEMO_TEAM_PERFORMANCE.find(d => d.name === ME.department);

const MyPerformance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'EVALUATION DESK' | 'INTELLIGENCE HUB' | 'ASSIGNED TO ME'>('ASSIGNED TO ME');

  const tabs = ['EVALUATION DESK', 'INTELLIGENCE HUB', 'ASSIGNED TO ME'] as const;

  const scoreHistory = [
    { week: 'W08', score: 82 },
    { week: 'W09', score: 88 },
    { week: 'W10', score: 91 },
    { week: 'W11', score: 100 },
  ];

  const radarData = [
    { subject: 'Work Quality', A: 95 },
    { subject: 'Teamwork', A: 88 },
    { subject: 'Initiative', A: 92 },
    { subject: 'Attendance', A: 100 },
    { subject: 'Communication', A: 85 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#0047cc]/10 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">🏆</div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
            Performance <span className="text-[#0047cc]">HQ</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Personal Strategy & Growth Track</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-nav border-b border-slate-200 dark:border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-[10px] font-black uppercase tracking-widest relative transition-all whitespace-nowrap flex-shrink-0 px-1 mr-4 sm:mr-6 ${
              activeTab === tab
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0047cc] shadow-[0_0_8px_#0047cc]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in slide-in-from-bottom-2 duration-500">

        {/* ASSIGNED TO ME */}
        {activeTab === 'ASSIGNED TO ME' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">My Assigned Evaluations</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.15em] mt-1">Evaluation forms assigned to you by your organization</p>
            </div>

            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Evaluations Assigned</p>
              <p className="text-[11px] text-slate-400 mt-2">You'll see forms here when your manager or HR assigns them.</p>
            </div>
          </div>
        )}

        {/* EVALUATION DESK */}
        {activeTab === 'EVALUATION DESK' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Evaluation Desk</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.15em] mt-1">Your self-appraisals and pending reviews</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard className="!p-6 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Self Appraisal</p>
                <div className="text-4xl font-black text-[#0047cc] mb-2">0</div>
                <p className="text-[9px] text-slate-500 font-bold uppercase">Pending Submission</p>
                <button className="mt-4 w-full py-2.5 bg-[#0047cc] text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-[#0035a0] transition-all">
                  Start Appraisal
                </button>
              </GlassCard>

              <GlassCard className="!p-6 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Peer Reviews</p>
                <div className="text-4xl font-black text-amber-500 mb-2">0</div>
                <p className="text-[9px] text-slate-500 font-bold uppercase">Awaiting You</p>
                <button className="mt-4 w-full py-2.5 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                  View Queue
                </button>
              </GlassCard>

              <GlassCard className="!p-6 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Completed</p>
                <div className="text-4xl font-black text-emerald-500 mb-2">2</div>
                <p className="text-[9px] text-slate-500 font-bold uppercase">This Cycle</p>
                <button className="mt-4 w-full py-2.5 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                  View History
                </button>
              </GlassCard>
            </div>

            <GlassCard title="Appraisal History">
              <div className="space-y-4">
                {[
                  { period: 'Annual Review 2023', score: '4.8/5.0', date: 'Dec 15, 2023', status: 'Finalized' },
                  { period: 'Mid-Year Sync 2023', score: '4.5/5.0', date: 'June 20, 2023', status: 'Finalized' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{item.period}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Completed: {item.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#0047cc]">{item.score}</p>
                      <p className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">{item.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* INTELLIGENCE HUB */}
        {activeTab === 'INTELLIGENCE HUB' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Intelligence Hub</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.15em] mt-1">Your performance analytics & growth insights</p>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'My Score',  val: `${ME.performanceScore}%`,                                    color: 'text-[#0047cc]',  accent: 'border-l-[#0047cc]' },
                { label: 'Dept Avg',  val: `${MY_DEPT_PERF?.avg ?? '--'}%`,                              color: 'text-amber-500',  accent: 'border-l-amber-500' },
                { label: 'Org Avg',   val: `${Math.round(DEMO_EMPLOYEES.reduce((s, e) => s + e.performanceScore, 0) / DEMO_EMPLOYEES.length)}%`, color: 'text-slate-500', accent: 'border-l-slate-400' },
                { label: 'Rank',      val: `#${DEMO_EMPLOYEES.sort((a, b) => b.performanceScore - a.performanceScore).findIndex(e => e.id === 'E01') + 1}`, color: 'text-emerald-500', accent: 'border-l-emerald-500' },
              ].map((s, i) => (
                <GlassCard key={i} className={`!p-5 border-l-4 ${s.accent}`}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
                  <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                </GlassCard>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard title="Score Trend">
                <div className="h-56 mt-4">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart data={scoreHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#00000010" vertical={false} />
                      <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} domain={[60, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', border: '1px solid var(--tooltip-border, #e2e8f0)', borderRadius: '12px', fontSize: '10px', color: 'var(--tooltip-color, #0f172a)' }} />
                      <Bar dataKey="score" fill="#0047cc" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              <GlassCard title="Competency Radar">
                <div className="h-56 mt-4">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#64748b' }} />
                      <Radar dataKey="A" stroke="#0047cc" fill="#0047cc" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>

            <GlassCard title="My Goals">
              <div className="space-y-4">
                {DEMO_OBJECTIVES.slice(0, 3).map((obj, i) => {
                  const progress = Math.round(
                    obj.keyResults.reduce((s, kr) => s + Math.min(100, (kr.currentValue / kr.targetValue) * 100), 0) / obj.keyResults.length
                  );
                  return (
                  <div key={i} className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{obj.title}</p>
                      <span className={`text-[8px] font-black uppercase px-2 py-1 rounded ${
                        obj.status === 'ON_TRACK' ? 'text-blue-500 bg-blue-500/10' :
                        obj.status === 'COMPLETED' ? 'text-emerald-500 bg-emerald-500/10' :
                        'text-rose-500 bg-rose-500/10'
                      }`}>{obj.status.replace('_', ' ')}</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${obj.status === 'COMPLETED' ? 'bg-emerald-500' : obj.status === 'BEHIND' || obj.status === 'AT_RISK' ? 'bg-rose-500' : 'bg-[#0047cc]'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">Due: {obj.endDate} · {progress}% complete</p>
                  </div>
                  );
                })}
                <button className="w-full py-3 border border-dashed border-slate-300 dark:border-white/10 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-[#0047cc] hover:text-[#0047cc] transition-all">
                  + Add New Goal
                </button>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPerformance;

