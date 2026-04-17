import React, { useState, useEffect } from 'react';
import { useCurrency } from '../src/context/CurrencyContext';
import { db } from '../mockDb';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, updateDoc, doc } from '../mockDb';
import GlassCard from '../components/GlassCard';
import { ICONS } from '../constants';
import { Trophy, Send, Phone, UserPlus, TrendingUp, ArrowUp } from 'lucide-react';
import { scoreDeal } from '../services/geminiService';
import { DEMO_CRM_DEALS, DEMO_CRM_CONTACTS, DEMO_DASHBOARD_KPIS } from '../demoData';

const CRM: React.FC = () => {
  const { symbol, fmt } = useCurrency();
  const [activeTab, setActiveTab] = useState('SALES_INTELLIGENCE');
  const [activeSubTab, setActiveSubTab] = useState('SALES_PIPELINE');
  const [deals, setDeals] = useState<any[]>(DEMO_CRM_DEALS);
  const [loading, setLoading] = useState(true);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [newDeal, setNewDeal] = useState({
    title: '',
    companyName: '',
    value: 0,
    stage: 'LEAD',
    ownerId: 'system'
  });
  const [scoringDealId, setScoringDealId] = useState<string | null>(null);

  const TABS = [
    { id: 'SALES_INTELLIGENCE', label: 'Sales Intelligence', subTabs: ['SALES_PIPELINE', 'LEADERBOARD', 'FORECASTING', 'ACTIVITY_FEED'] },
    { id: 'RELATIONSHIPS', label: 'Relationships', subTabs: ['LEADS', 'CONTACTS', 'ACCOUNTS', 'ABM_TARGETS'] },
    { id: 'OPPORTUNITIES', label: 'Opportunities', subTabs: ['ACTIVE_DEALS', 'CLOSED_HISTORY', 'QUOTATIONS', 'RENEWALS'] },
    { id: 'ENGAGEMENT', label: 'Activities & Engagement', subTabs: ['TASKS', 'CALENDAR', 'COMMUNICATIONS', 'CAMPAIGNS'] },
    { id: 'SUPPORT', label: 'Support & Success', subTabs: ['TICKETS', 'SLA_MONITOR', 'HEALTH_SCORE', 'KNOWLEDGE_BASE'] },
    { id: 'PRICING', label: 'Product & Pricing', subTabs: ['CATALOG', 'PRICE_BOOKS', 'INVENTORY'] },
    { id: 'ANALYTICS', label: 'Reports & Analytics', subTabs: ['CONVERSION', 'CHURN', 'MARKETING_ROI', 'AUDIT_LOGS'] },
  ];

  useEffect(() => {
    const q = query(collection(db, 'crm_deals'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDeals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const tab = TABS.find(t => t.id === tabId);
    if (tab && tab.subTabs.length > 0) {
      setActiveSubTab(tab.subTabs[0]);
    }
  };

  const handleScoreDeal = async (deal: any) => {
    setScoringDealId(deal.id);
    const score = await scoreDeal(JSON.stringify(deal));
    if (score) {
      await updateDoc(doc(db, 'crm_deals', deal.id), {
        aiScore: score,
        probability: score.probability,
        updatedAt: serverTimestamp()
      });
    }
    setScoringDealId(null);
  };

  const handleSubmitDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'crm_deals'), {
        ...newDeal,
        createdAt: serverTimestamp(),
        probability: 10
      });
      setIsDealModalOpen(false);
      setNewDeal({ title: '', companyName: '', value: 0, stage: 'LEAD', ownerId: 'system' });
    } catch (error) {
      console.error("Error adding deal:", error);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6 bg-[#e0f2fe]0/5 border-[#e0f2fe]0/20">
          <p className="text-[10px] font-black text-[#e0f2fe]0 uppercase tracking-widest mb-1">Pipeline Value</p>
          <h4 className="text-2xl font-black italic">{fmt(DEMO_DASHBOARD_KPIS.pipelineValue, { compact: true })}</h4>
          <p className="text-[9px] text-slate-500 font-bold uppercase mt-2"><TrendingUp size={10} className="inline mr-1" />12% vs last month</p>
        </GlassCard>
        <GlassCard className="p-6 bg-emerald-500/5 border-emerald-500/20">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Closed Won (QTD)</p>
          <h4 className="text-2xl font-black italic">{fmt(DEMO_DASHBOARD_KPIS.revenueYTD, { compact: true })}</h4>
          <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Target: {fmt(500_000_000, { compact: true })}</p>
        </GlassCard>
        <GlassCard className="p-6 bg-blue-500/5 border-blue-500/20">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Avg. Deal Size</p>
          <h4 className="text-2xl font-black italic">{fmt(Math.round(DEMO_CRM_DEALS.reduce((s, d) => s + d.value, 0) / DEMO_CRM_DEALS.length), { compact: true })}</h4>
          <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Stable trend</p>
        </GlassCard>
        <GlassCard className="p-6 bg-amber-500/5 border-amber-500/20">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Win Rate</p>
          <h4 className="text-2xl font-black italic">{Math.round((DEMO_CRM_DEALS.filter(d => d.status === 'WON').length / DEMO_CRM_DEALS.length) * 100)}%</h4>
          <p className="text-[9px] text-slate-500 font-bold uppercase mt-2"><ArrowUp size={10} className="inline mr-1" />4% improvement</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black uppercase tracking-widest italic">Sales Pipeline Funnel</h3>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-slate-100 dark:bg-white/5 rounded text-[8px] font-black uppercase">By Stage</span>
              <span className="px-2 py-1 bg-slate-100 dark:bg-white/5 rounded text-[8px] font-black uppercase">By Value</span>
            </div>
          </div>
          <div className="space-y-6">
            {[
              { stage: 'Prospecting', count: 45, value: `${symbol}1.2M`, color: 'bg-slate-400' },
              { stage: 'Qualification', count: 28, value: `${symbol}850k`, color: 'bg-blue-400' },
              { stage: 'Proposal', count: 15, value: `${symbol}600k`, color: 'bg-[#0ea5e9]' },
              { stage: 'Negotiation', count: 8, value: `${symbol}450k`, color: 'bg-amber-400' },
              { stage: 'Closing', count: 4, value: `${symbol}220k`, color: 'bg-emerald-400' },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="flex justify-between items-center mb-2 text-[10px] font-black uppercase tracking-widest">
                  <span>{item.stage} ({item.count})</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} transition-all duration-1000`} 
                    style={{ width: `${(item.count / 45) * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-8">
          <h3 className="text-lg font-black uppercase tracking-widest italic mb-6">Activity Feed</h3>
          <div className="space-y-6">
            {[
              { user: 'Sarah J.', action: 'Closed Won',    target: 'Acme Corp', time: '10m ago', Icon: Trophy },
              { user: 'Mike R.', action: 'Sent Proposal',  target: 'Globex',    time: '1h ago',  Icon: Send },
              { user: 'Emma W.', action: 'Logged Call',    target: 'Stark Ind', time: '3h ago',  Icon: Phone },
              { user: 'System',  action: 'Lead Assigned',  target: 'Wayne Ent', time: '5h ago',  Icon: UserPlus },
            ].map((act, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center"><act.Icon size={14} className="text-slate-500" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-tight">
                    <span className="text-[var(--brand-primary)]">{act.user}</span> {act.action}
                  </p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase truncate">{act.target}</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );

  const [selectedLead, setSelectedLead] = useState<any>(null);

  const renderRelationships = () => (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className={`flex-1 space-y-6 transition-all duration-500 ${selectedLead ? 'lg:w-2/3' : 'w-full'}`}>
        <GlassCard className="p-4 sm:p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black uppercase tracking-widest italic">Lead Management</h3>
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="Search leads..." 
                className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold uppercase focus:outline-none"
              />
              <button className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-xl font-black uppercase tracking-widest text-[10px]">Import Leads</button>
            </div>
          </div>
          <div className="table-wrap">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Name</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Company</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5 text-xs">
                {[
                  { id: 1, name: 'John Smith', company: 'TechFlow', source: 'Webinar', score: 85, status: 'NEW', email: 'john@techflow.com', ltv: `${symbol}12k`, tickets: 2, deals: 1 },
                  { id: 2, name: 'Alice Wong', company: 'DataViz', source: 'LinkedIn', score: 92, status: 'CONTACTED', email: 'alice@dataviz.io', ltv: `${symbol}45k`, tickets: 0, deals: 2 },
                  { id: 3, name: 'Bob Miller', company: 'EcoPower', source: 'Referral', score: 64, status: 'NURTURING', email: 'bob@ecopower.net', ltv: `${symbol}0`, tickets: 1, deals: 0 },
                ].map((lead, i) => (
                  <tr 
                    key={i} 
                    className={`hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors ${selectedLead?.id === lead.id ? 'bg-[#e0f2fe]0/5' : ''}`}
                    onClick={() => setSelectedLead(lead)}
                  >
                    <td className="py-4 font-black">{lead.name}</td>
                    <td className="py-4 font-bold uppercase text-slate-500">{lead.company}</td>
                    <td className="py-4 font-bold uppercase text-slate-400">{lead.source}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${lead.score > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${lead.score}%` }} />
                        </div>
                        <span className="text-[9px] font-black">{lead.score}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-lg text-[9px] font-black uppercase">{lead.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {selectedLead && (
        <div className="w-full lg:w-80 animate-in slide-in-from-right-4 lg:slide-in-from-right-4 slide-in-from-bottom-4 lg:slide-in-from-bottom-0 duration-500">
          <GlassCard className="p-6 h-full border-l-4 border-l-[var(--brand-primary)]">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[var(--brand-primary)]/10 flex items-center justify-center text-xl">??</div>
              <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-slate-600">?</button>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-black uppercase tracking-tight">{selectedLead.name}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedLead.company}</p>
              <p className="text-[10px] text-slate-500 font-bold mt-1">{selectedLead.email}</p>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Value</p>
                <p className="text-xl font-black italic text-[var(--brand-primary)]">{selectedLead.ltv}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Open Deals</p>
                  <p className="text-lg font-black italic">{selectedLead.deals}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Tickets</p>
                  <p className="text-lg font-black italic">{selectedLead.tickets}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Interactions</p>
                {[
                  { type: 'Call', date: 'Yesterday', desc: 'Discussed Q3 expansion' },
                  { type: 'Email', date: '2 days ago', desc: 'Sent case study' },
                ].map((int, i) => (
                  <div key={i} className="p-3 border border-slate-100 dark:border-white/5 rounded-xl">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] font-black uppercase text-[var(--brand-primary)]">{int.type}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">{int.date}</span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold leading-tight">{int.desc}</p>
                  </div>
                ))}
              </div>

              <button className="w-full py-3 bg-[var(--brand-primary)] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#e0f2fe]0/20">
                Log Activity
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );

  const renderOpportunities = () => (
    <div className="space-y-6">
      <div className="flex gap-4 lg:gap-6 overflow-x-auto pb-8 min-h-[600px] snap-x">
        {[
          { id: 'LEAD', label: 'Lead' },
          { id: 'QUALIFIED', label: 'Qualified' },
          { id: 'PROPOSAL', label: 'Proposal' },
          { id: 'NEGOTIATION', label: 'Negotiation' },
          { id: 'CLOSED_WON', label: 'Closed Won' },
        ].map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-[85vw] md:w-80 space-y-4 snap-center">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stage.label}</h3>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-lg text-[9px] font-black text-slate-500">
                {deals.filter(d => d.stage === stage.id).length}
              </span>
            </div>
            
            <div className="space-y-4">
              {deals.filter(d => d.stage === stage.id).map((deal) => (
                <GlassCard key={deal.id} className="p-5 hover:border-[var(--brand-primary)]/30 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{deal.companyName}</p>
                    {deal.aiScore && (
                      <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${
                        deal.aiScore.riskLevel === 'LOW' ? 'bg-emerald-500/10 text-emerald-500' : 
                        deal.aiScore.riskLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {deal.aiScore.probability}% WIN
                      </div>
                    )}
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-tight mb-4">{deal.title}</h4>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Deal Value</p>
                      <p className="text-sm font-black italic text-[var(--brand-primary)]">{fmt(deal.value ?? 0)}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleScoreDeal(deal); }}
                      disabled={scoringDealId === deal.id}
                      className="w-8 h-8 rounded-xl bg-[#e0f2fe]0/10 text-[#e0f2fe]0 flex items-center justify-center hover:bg-[#e0f2fe]0/20 transition-all"
                    >
                      {scoringDealId === deal.id ? (
                        <div className="w-4 h-4 border-2 border-[#e0f2fe]0 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span className="text-lg">?</span>
                      )}
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEngagement = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-4 sm:p-8">
          <h3 className="text-lg font-black uppercase tracking-widest italic mb-8">Upcoming Tasks</h3>
          <div className="space-y-4">
            {[
              { task: 'Follow up on proposal', due: 'Today', priority: 'HIGH', user: 'Sarah' },
              { task: 'Contract review with legal', due: 'Tomorrow', priority: 'MEDIUM', user: 'Mike' },
              { task: 'Quarterly business review', due: 'In 3 days', priority: 'LOW', user: 'Emma' },
            ].map((t, i) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]" />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-tight">{t.task}</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Due: {t.due} � Assigned to {t.user}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${
                  t.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                }`}>
                  {t.priority}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-8">
          <h3 className="text-lg font-black uppercase tracking-widest italic mb-8">Marketing Campaigns</h3>
          <div className="space-y-4">
            {[
              { name: 'Q2 Tech Webinar', leads: 450, roi: '3.5x', status: 'ACTIVE' },
              { name: 'LinkedIn Ad Blitz', leads: 120, roi: '1.2x', status: 'PAUSED' },
              { name: 'Email Newsletter', leads: 85, roi: '5.0x', status: 'ACTIVE' },
            ].map((c, i) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tight">{c.name}</h4>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">{c.leads} Leads Generated � ROI: {c.roi}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${
                  c.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Open Tickets</p>
          <h4 className="text-2xl font-black italic">24</h4>
          <p className="text-[9px] text-rose-500 font-bold uppercase mt-2">4 Overdue SLA</p>
        </GlassCard>
        <GlassCard className="p-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Response Time</p>
          <h4 className="text-2xl font-black italic">1.2h</h4>
          <p className="text-[9px] text-emerald-500 font-bold uppercase mt-2"><ArrowUp size={10} className="inline mr-1" />15% improvement</p>
        </GlassCard>
        <GlassCard className="p-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Health Score</p>
          <h4 className="text-2xl font-black italic">8.4/10</h4>
          <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Based on usage & feedback</p>
        </GlassCard>
      </div>

      <GlassCard className="p-4 sm:p-8">
        <h3 className="text-lg font-black uppercase tracking-widest italic mb-8">Active Support Tickets</h3>
        <div className="table-wrap">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket #</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">SLA Status</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5 text-xs">
              {[
                { id: 'TKT-1021', customer: 'Acme Corp', issue: 'API Integration Error', sla: '2h left', priority: 'URGENT' },
                { id: 'TKT-1022', customer: 'Globex', issue: 'Billing Discrepancy', sla: 'Overdue', priority: 'HIGH' },
                { id: 'TKT-1023', customer: 'Stark Ind', issue: 'Feature Request', sla: '2 days left', priority: 'LOW' },
              ].map((t, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-4 font-black text-[var(--brand-primary)]">{t.id}</td>
                  <td className="py-4 font-bold uppercase">{t.customer}</td>
                  <td className="py-4 font-bold text-slate-500 uppercase">{t.issue}</td>
                  <td className={`py-4 font-black ${t.sla === 'Overdue' ? 'text-rose-500' : 'text-slate-500'}`}>{t.sla}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                      t.priority === 'URGENT' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );

  const renderPricing = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-4 sm:p-8">
          <h3 className="text-lg font-black uppercase tracking-widest italic mb-8">Product Catalog</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Enterprise License', price: `${symbol}5,000/yr`, stock: 'Unlimited' },
              { name: 'API Access (Tier 1)', price: `${symbol}200/mo`, stock: 'Unlimited' },
              { name: 'On-site Training', price: `${symbol}2,500`, stock: 'Available' },
              { name: 'Premium Support', price: `${symbol}1,000/yr`, stock: 'Available' },
            ].map((prod, i) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                <h4 className="text-[10px] font-black uppercase tracking-tight mb-1">{prod.name}</h4>
                <p className="text-xs font-black italic text-[var(--brand-primary)] mb-2">{prod.price}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Stock: {prod.stock}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-8">
          <h3 className="text-lg font-black uppercase tracking-widest italic mb-8">Regional Price Books</h3>
          <div className="space-y-4">
            {[
              { region: 'North America', currency: 'USD', adjustment: 'Base' },
              { region: 'European Union', currency: 'EUR', adjustment: '+5%' },
              { region: 'Asia Pacific', currency: 'SGD', adjustment: '-2%' },
            ].map((pb, i) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tight">{pb.region}</h4>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Currency: {pb.currency}</p>
                </div>
                <span className="text-[10px] font-black uppercase text-[#e0f2fe]0">{pb.adjustment}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-4 sm:p-8">
          <h3 className="text-lg font-black uppercase tracking-widest italic mb-8">Conversion Funnel Analysis</h3>
          <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-3xl">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conversion Chart Visualization</p>
          </div>
        </GlassCard>
        <GlassCard className="p-4 sm:p-8">
          <h3 className="text-lg font-black uppercase tracking-widest italic mb-8">Marketing ROI by Channel</h3>
          <div className="space-y-6">
            {[
              { channel: 'Google Ads', spend: `${symbol}12k`, revenue: `${symbol}45k`, roi: '3.75x' },
              { channel: 'LinkedIn', spend: `${symbol}8k`, revenue: `${symbol}12k`, roi: '1.5x' },
              { channel: 'Email', spend: `${symbol}2k`, revenue: `${symbol}25k`, roi: '12.5x' },
            ].map((ch, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                  <span>{ch.channel}</span>
                  <span className="text-emerald-500">{ch.roi} ROI</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${(parseFloat(ch.roi) / 12.5) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'SALES_INTELLIGENCE': return renderDashboard();
      case 'RELATIONSHIPS': return renderRelationships();
      case 'OPPORTUNITIES': return renderOpportunities();
      case 'ENGAGEMENT': return renderEngagement();
      case 'SUPPORT': return renderSupport();
      case 'PRICING': return renderPricing();
      case 'ANALYTICS': return renderAnalytics();
      default: return renderDashboard();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">CRM & <span className="text-[#0047cc]">Sales Intelligence</span></h2>
          <p className="text-slate-500 text-xs sm:text-sm font-bold uppercase tracking-widest">Enterprise Revenue Operations Hub</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setIsDealModalOpen(true)}
            className="flex-1 sm:flex-none px-5 py-3 bg-[var(--brand-primary)] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#e0f2fe]0/20 hover:scale-105 transition-transform"
          >
            New Deal
          </button>
        </div>
      </div>

      {/* Primary Navigation */}
      <div className="tab-nav pb-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`tab-btn ${
              activeTab === tab.id 
              ? 'bg-[var(--brand-primary)] text-white shadow-lg shadow-[#e0f2fe]0/20' 
              : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/[0.08]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Secondary Navigation */}
      <div className="tab-nav border-b border-slate-100 dark:border-white/5 pb-3">
        {TABS.find(t => t.id === activeTab)?.subTabs.map(subTab => (
          <button
            key={subTab}
            onClick={() => setActiveSubTab(subTab)}
            className={`text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 mr-4 ${
              activeSubTab === subTab 
              ? 'text-[var(--brand-primary)]' 
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {subTab.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="animate-in fade-in duration-500">
        {renderContent()}
      </div>

      {isDealModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black uppercase tracking-tighter italic">New Sales Deal</h3>
              <button onClick={() => setIsDealModalOpen(false)} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmitDeal} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deal Title</label>
                <input 
                  type="text" 
                  required
                  value={newDeal.title}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#e0f2fe]0/20"
                  placeholder="e.g. Enterprise License Expansion"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company Name</label>
                <input 
                  type="text" 
                  required
                  value={newDeal.companyName}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#e0f2fe]0/20"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deal Value ($)</label>
                <input 
                  type="number" 
                  required
                  value={newDeal.value || ''}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, value: Number(e.target.value) }))}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#e0f2fe]0/20"
                  placeholder="e.g. 50000"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Stage</label>
                <select 
                  value={newDeal.stage}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, stage: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs focus:outline-none"
                >
                  {[
                    { id: 'LEAD', label: 'Lead' },
                    { id: 'QUALIFIED', label: 'Qualified' },
                    { id: 'PROPOSAL', label: 'Proposal' },
                    { id: 'NEGOTIATION', label: 'Negotiation' },
                    { id: 'CLOSED_WON', label: 'Closed Won' },
                  ].map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsDealModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-4 bg-[var(--brand-primary)] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#e0f2fe]0/20">Create Deal</button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default CRM;



