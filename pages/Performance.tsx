import React, { useState, useEffect } from 'react';
import { Heart, CheckCircle2, Trophy, Shield, ClipboardList, HelpCircle, Globe, Building2, Users, Check } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import FormBuilder from '../components/FormBuilder';
import EvaluationForm from '../components/EvaluationForm';
import Button from '../components/Button';
import { FormTemplate, NotificationType } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { summarizePerformance } from '../services/geminiService';
import { DEMO_TEAM_PERFORMANCE, DEMO_OBJECTIVES, DEMO_EMPLOYEES } from '../demoData';

const teamPerformanceData = DEMO_TEAM_PERFORMANCE.map(d => ({
  name: d.name.slice(0, 4),
  kpi: d.kpi,
  behavioral: d.behavioral,
  attendance: d.attendance,
  avg: d.avg,
}));

interface PerformanceProps {
  onNotify?: (title: string, message: string, type: NotificationType) => void;
}

const Performance: React.FC<PerformanceProps> = ({ onNotify }) => {
  const [activeTab, setActiveTab] = useState('Performance Dashboard');
  const [evaluationSubTab, setEvaluationSubTab] = useState('EVALUATION TEMPLATES');
  const [templateFilter, setTemplateFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('ALL');
  const [view, setView] = useState<'DASHBOARD' | 'BUILDER' | 'EVALUATION'>('DASHBOARD');
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [activeEmployee, setActiveEmployee] = useState<string | null>(null);
  
  const [templates, setTemplates] = useState<FormTemplate[]>([
    {
      id: '26',
      title: 'GENERAL EMPLOYEE EVALUATION',
      description: 'Default evaluation template for all employees.',
      scope: 'GLOBAL',
      editingId: '26',
      createdAt: '2024-01-01',
      status: 'PUBLISHED',
      sections: [
        { id: 's1', title: 'Work Quality', fields: [] },
        { id: 's2', title: 'Teamwork & Communication', fields: [] },
        { id: 's3', title: 'Initiative & Growth', fields: [] },
        { id: 's4', title: 'Attendance & Punctuality', fields: [] }
      ]
    },
    {
      id: '25',
      title: 'IT WEEKLY PERFORMANCE',
      description: 'Weekly performance tracking for IT team',
      scope: 'DEPT: IT',
      editingId: '25',
      createdAt: '2024-01-01',
      status: 'PUBLISHED',
      sections: [
        { id: 's1', title: 'Technical Tasks', fields: [] },
        { id: 's2', title: 'System Reliability', fields: [] }
      ]
    },
    {
      id: '21',
      title: 'SALES WEEKLY PERFORMANCE',
      description: 'Weekly performance tracking for sales team',
      scope: 'DEPT: SALES',
      editingId: '21',
      createdAt: '2024-01-01',
      status: 'PUBLISHED',
      sections: [
        { id: 's1', title: 'Lead Generation', fields: [] },
        { id: 's2', title: 'Conversion Rate', fields: [] },
        { id: 's3', title: 'Revenue Target', fields: [] }
      ]
    },
    {
      id: '22',
      title: 'MARKETING WEEKLY PERFORMANCE',
      description: 'Weekly performance tracking for marketing team',
      scope: 'DEPT: MARKETING',
      editingId: '22',
      createdAt: '2024-01-01',
      status: 'DRAFT',
      sections: [
        { id: 's1', title: 'Campaign Reach', fields: [] }
      ]
    },
    {
      id: '23',
      title: 'ENGINEERING WEEKLY PERFORMANCE',
      description: 'Weekly performance tracking for engineering team',
      scope: 'DEPT: ENGINEERING',
      editingId: '23',
      createdAt: '2024-01-01',
      status: 'DRAFT',
      sections: [
        { id: 's1', title: 'Code Quality', fields: [] }
      ]
    },
    {
      id: '24',
      title: 'HR WEEKLY PERFORMANCE',
      description: 'Weekly performance tracking for HR team',
      scope: 'DEPT: HUMAN RESOURCES',
      editingId: '24',
      createdAt: '2024-01-01',
      status: 'DRAFT',
      sections: [
        { id: 's1', title: 'Employee Engagement', fields: [] }
      ]
    }
  ]);

  const [aiSummary, setAiSummary] = useState<string>('Analyzing organizational trends...');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    handleGenerateAISummary();
  }, []);

  const handleGenerateAISummary = async () => {
    setIsGenerating(true);
    try {
      const summary = await summarizePerformance(teamPerformanceData);
      setAiSummary(summary.narrative || 'No summary available.');
    } catch (error) {
      setAiSummary('Failed to generate AI insight.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLaunchCycle = () => {
    if (onNotify) {
      onNotify(
        'Cycle Event: Q2 Appraisal Launched',
        'System has initialized the Q2 appraisal period for 400 nodes. Managers notified via secure channel.',
        'CYCLE_EVENT'
      );
    }
  };

  const handleEvaluationSubmit = (employeeName: string) => {
    if (onNotify) {
      onNotify(
        'Evaluation Completed',
        `The appraisal for ${employeeName} has been submitted and encrypted in the document vault.`,
        'EVALUATION_COMPLETE'
      );
    }
    setView('DASHBOARD');
  };

  const [editingScopeId, setEditingScopeId] = useState<string | null>(null);
  const [showScopeModal, setShowScopeModal] = useState(false);
  const [modalScope, setModalScope] = useState<'GLOBAL' | 'BRANCH' | 'DEPT'>('GLOBAL');
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  
  const departments = ['GLOBAL', 'IT', 'SALES', 'MARKETING', 'ENGINEERING', 'HUMAN RESOURCES', 'OPERATIONS', 'FINANCE'];

  const handleUpdateTemplateScope = (templateId: string, newScope: string) => {
    setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, scope: newScope === 'GLOBAL' ? 'GLOBAL' : `DEPT: ${newScope}` } : t));
    setEditingScopeId(null);
  };

  const handleStatusChange = (templateId: string, newStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
    setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, status: newStatus } : t));
    if (onNotify) {
      const titles = { DRAFT: 'Draft Saved', PUBLISHED: 'Template Published', ARCHIVED: 'Template Archived' };
      onNotify(titles[newStatus], `Template status updated to ${newStatus}.`, 'SYSTEM');
    }
  };

  const handleCreateNew = () => {
    const scopeStr = modalScope === 'GLOBAL' ? 'GLOBAL' : modalScope === 'BRANCH' ? 'BRANCH: HQ' : `DEPT: ${selectedDepts.join(', ')}`;
    const newT: FormTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'NEW EVALUATION TEMPLATE',
      description: 'Enter description here...',
      scope: scopeStr,
      editingId: Math.floor(Math.random() * 100).toString(),
      createdAt: new Date().toISOString().split('T')[0],
      status: 'DRAFT',
      sections: [
        { id: 's1', title: 'Work Quality', fields: [] }
      ]
    };
    setTemplates(prev => [newT, ...prev]);
    setSelectedTemplate(newT);
    setShowScopeModal(false);
    setView('BUILDER');
  };

  const tabs = ['Performance Dashboard', 'Review Cycles', 'Goals & OKRs', 'Evaluations', 'Appraisals', 'Reporting', 'Settings'];

  if (view === 'BUILDER') {
    return (
      <FormBuilder 
        initialTemplate={selectedTemplate || undefined}
        onBack={() => setView('DASHBOARD')}
        onSave={(t) => {
          setTemplates(prev => {
            const exists = prev.find(item => item.id === t.id);
            if (exists) {
              return prev.map(item => item.id === t.id ? t : item);
            }
            return [t, ...prev];
          });
          setView('DASHBOARD');
        }}
      />
    );
  }

  if (view === 'EVALUATION' && activeEmployee) {
    return (
      <EvaluationForm 
        template={selectedTemplate || templates[0]}
        employeeName={activeEmployee}
        onClose={() => setView('DASHBOARD')}
        onSubmit={() => handleEvaluationSubmit(activeEmployee)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 cursor-pointer hover:text-[#0047cc] transition-colors">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeWidth="2.5" /></svg>
            Back to Performance
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
            Performance <span className="text-[#0047cc]">Management</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2 italic">Templates, Review Cycles & Governance</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button variant="primary" size="md" onClick={() => setShowScopeModal(true)} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3" /></svg>}>
            New Cycle
          </Button>
          <Button variant="secondary" size="md" onClick={() => setView('BUILDER')}>
            New Template
          </Button>
        </div>
      </div>

      <div className="tab-nav border-b border-slate-200 dark:border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab}
            data-demo-id={`performance-tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-[10px] font-black uppercase tracking-widest relative transition-all whitespace-nowrap flex-shrink-0 px-1 mr-4 sm:mr-6 ${activeTab === tab ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0047cc] shadow-[0_0_8px_#0047cc]" />}
          </button>
        ))}
      </div>

      <div className="animate-in slide-in-from-bottom-2 duration-500">
        {activeTab === 'Performance Dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3" id="performance-health-grid" data-demo-id="performance-health-grid">
              {[
                { label: 'Org Health Score', val: '86.5', delta: '+2.1%', color: 'text-emerald-500', accent: '#10b981', Icon: Heart },
                { label: 'Completion Rate', val: '94%', delta: 'Goal: 100%', color: 'text-[#0047cc]', accent: '#0047cc', Icon: CheckCircle2 },
                { label: 'Top Performers', val: '42', delta: '11% of workforce', color: 'text-amber-500', accent: '#f59e0b', Icon: Trophy },
                { label: 'Risk of Turnover', val: 'LOW', delta: 'AI Prediction', color: 'text-emerald-500', accent: '#10b981', Icon: Shield },
              ].map((s, idx) => (
                <GlassCard key={idx} accentColor={s.accent} className="!p-4">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
                    <s.Icon size={14} className="opacity-50" />
                  </div>
                  <p className={`text-2xl font-black tracking-tighter leading-none ${s.color}`}>{s.val}</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase mt-2">{s.delta}</p>
                </GlassCard>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                 <GlassCard title="Organization Competency Levels">
                    <div className="chart-md mt-4">
                       <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                          <BarChart data={teamPerformanceData}>
                             <CartesianGrid strokeDasharray="3 3" stroke="#00000010" vertical={false} />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} />
                             <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} />
                             <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} />
                             <Bar dataKey="kpi" fill="#0047cc" radius={[4, 4, 0, 0]} />
                             <Bar dataKey="behavioral" fill="#0047cc" radius={[4, 4, 0, 0]} />
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </GlassCard>
              </div>
              <div className="lg:col-span-4">
                 <GlassCard id="performance-ai-insights" title="AI Strategic Insights" className="!bg-[#0047cc]/5 border-[#0047cc]/20">
                    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                       <p className={`text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic ${isGenerating ? 'animate-pulse' : ''}`}>
                         {aiSummary}
                       </p>
                    </div>
                 </GlassCard>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Review Cycles' && (
          <div className="space-y-6">
            <GlassCard title="Active & Upcoming Cycles">
              <div className="space-y-4">
                {[
                  { title: 'Q2 Annual Appraisal 2024', status: 'In Progress', progress: 65, deadline: 'June 30, 2024', participants: 450 },
                  { title: 'Mid-Year Probation Review', status: 'Scheduled', progress: 0, deadline: 'July 15, 2024', participants: 24 },
                  { title: 'Q1 Performance Sync (Closed)', status: 'Completed', progress: 100, deadline: 'March 31, 2024', participants: 442 },
                ].map((cycle, i) => (
                  <div key={i} className="p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{cycle.title}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{cycle.participants} Participants � Deadline: {cycle.deadline}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                        cycle.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500' : 
                        cycle.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                        'bg-slate-500/10 text-slate-500'
                      }`}>
                        {cycle.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <span>Cycle Progress</span>
                        <span>{cycle.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0047cc]" style={{ width: `${cycle.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'Goals & OKRs' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard id="performance-goals" title="Company Strategic OKRs">
              <div className="space-y-6">
                {DEMO_OBJECTIVES.slice(0, 3).map((obj, i) => {
                  const progress = Math.round(
                    obj.keyResults.reduce((s, kr) => s + Math.min(100, (kr.currentValue / kr.targetValue) * 100), 0) / obj.keyResults.length
                  );
                  return (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{obj.title}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Owner: {obj.ownerName}</p>
                        </div>
                        <span className="text-xs font-black text-[#0047cc]">{progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0047cc] rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
            <GlassCard title="My Personal Goals">
              <div className="space-y-4">
                {[
                  { title: 'Complete Advanced React Certification', status: 'On Track', date: 'May 2024' },
                  { title: 'Mentor 2 Junior Developers', status: 'At Risk', date: 'Ongoing' },
                  { title: 'Optimize HR Portal Performance', status: 'Completed', date: 'March 2024' },
                ].map((goal, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{goal.title}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Due: {goal.date}</p>
                    </div>
                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded ${
                      goal.status === 'On Track' ? 'text-blue-500' : 
                      goal.status === 'Completed' ? 'text-emerald-500' : 
                      'text-rose-500'
                    }`}>
                      {goal.status}
                    </span>
                  </div>
                ))}
                <button className="w-full py-3 border border-dashed border-slate-300 dark:border-white/10 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-[#0047cc] hover:text-[#0047cc] transition-all">
                  + Add New Goal
                </button>
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'Evaluations' && (
          <div className="space-y-6">
            <div className="flex items-center gap-8 border-b border-slate-200 dark:border-white/5 pb-0">
              {['EVALUATION TEMPLATES', 'REVIEW CYCLES'].map((sub) => (
                <button
                  key={sub}
                  data-demo-id={`performance-subtab-${sub.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setEvaluationSubTab(sub)}
                  className={`pb-4 text-[10px] font-black uppercase tracking-widest relative transition-all ${evaluationSubTab === sub ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                >
                  {sub}
                  {evaluationSubTab === sub && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0047cc]" />}
                </button>
              ))}
            </div>

            {evaluationSubTab === 'EVALUATION TEMPLATES' && (
              <div className="space-y-6">
                <GlassCard className="!p-4">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative flex-1 w-full">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5" /></svg>
                      <input 
                        type="text" 
                        placeholder="Search by template name or ID..." 
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-[#0047cc] transition-all"
                      />
                    </div>
                    <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                      {['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setTemplateFilter(filter as any)}
                          className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${templateFilter === filter ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>
                </GlassCard>

                <div data-demo-id="evaluation-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates
                    .filter(t => templateFilter === 'ALL' || t.status === templateFilter)
                    .map((template, i) => (
                    <GlassCard key={template.id} className="group relative overflow-hidden flex flex-col h-full">
                      <div className="absolute -right-4 -bottom-8 text-[120px] font-black text-slate-900/5 dark:text-white/5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                        {template.editingId}
                      </div>
                      
                      <div className="flex justify-between items-start mb-4">
                        <span className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                          template.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                          template.status === 'DRAFT' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                          'bg-slate-500/10 text-slate-500 border-slate-500/20'
                        }`}>
                          <div className={`w-1 h-1 rounded-full ${template.status === 'PUBLISHED' ? 'bg-emerald-500 animate-pulse' : template.status === 'DRAFT' ? 'bg-blue-500' : 'bg-slate-500'}`} />
                          {template.status}
                        </span>
                      </div>

                      <div className="flex-1">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 group-hover:text-[#0047cc] transition-colors">{template.title}</h4>
                        <p className="text-[10px] text-slate-500 font-medium mb-4">{template.description}</p>
                        
                        <div className="relative mb-6">
                          {editingScopeId === template.id ? (
                            <select 
                              autoFocus
                              onBlur={() => setEditingScopeId(null)}
                              onChange={(e) => handleUpdateTemplateScope(template.id, e.target.value)}
                              className="w-full bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-amber-500/20 px-2 py-1 outline-none focus:ring-1 focus:ring-amber-500/50"
                              value={template.scope.replace('DEPT: ', '')}
                            >
                              {departments.map(dept => (
                                <option key={dept} value={dept} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{dept}</option>
                              ))}
                            </select>
                          ) : (
                            <button 
                              onClick={() => setEditingScopeId(template.id)}
                              className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                            >
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" strokeWidth="2.5" /></svg>
                              {template.scope}
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center shadow-sm"><ClipboardList size={14} className="text-slate-500" /></div>
                            <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sections</p>
                              <p className="text-xs font-black text-slate-900 dark:text-white">{template.sections.length}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center shadow-sm"><HelpCircle size={14} className="text-slate-500" /></div>
                            <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Questions</p>
                              <p className="text-xs font-black text-slate-900 dark:text-white">
                                {template.sections.reduce((acc, s) => acc + s.fields.length, 0)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-auto relative z-10">
                        <button 
                          disabled={template.status === 'ARCHIVED'}
                          onClick={() => { setSelectedTemplate(template); setView('BUILDER'); }}
                          className={`py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl border flex items-center justify-center gap-2 transition-all ${
                            template.status === 'ARCHIVED' 
                            ? 'bg-slate-50 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/5 cursor-not-allowed' 
                            : 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10'
                          }`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth="2.5" /></svg>
                          Edit
                        </button>
                        
                        {template.status === 'DRAFT' ? (
                          <Button variant="primary" size="sm" onClick={() => handleStatusChange(template.id, 'PUBLISHED')} icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" /></svg>}>Publish</Button>
                        ) : template.status === 'PUBLISHED' ? (
                          <Button variant="warning" size="sm" onClick={() => handleStatusChange(template.id, 'ARCHIVED')} icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" strokeWidth="2.5" /></svg>}>Archive</Button>
                        ) : (
                          <Button variant="secondary" size="sm" onClick={() => handleStatusChange(template.id, 'DRAFT')} icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2.5" /></svg>}>Restore</Button>
                        )}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {evaluationSubTab === 'REVIEW CYCLES' && (
              <GlassCard className="!p-0 overflow-hidden">
                <div className="table-wrap">
                  <table className="w-full text-left">
                    <thead className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01]">
                      <tr>
                        <th className="px-6 py-5">Employee Identity</th>
                        <th className="px-6 py-5">Department</th>
                        <th className="px-6 py-5">Status</th>
                        <th className="px-6 py-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {DEMO_EMPLOYEES.slice(0, 5).map((emp, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 dark:border-white/10"><img src={emp.avatar} className="w-full h-full object-cover" alt="" /></div>
                              <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">{emp.name}</p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase">{emp.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-xs text-slate-500 dark:text-slate-400">{emp.department}</td>
                          <td className="px-6 py-5">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${i % 3 === 2 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                              {i % 3 === 2 ? 'Completed' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button 
                              onClick={() => { 
                                setActiveEmployee(emp.name); 
                                const publishedTemplates = templates.filter(t => t.status === 'PUBLISHED');
                                const deptTemplate = publishedTemplates.find(t => t.scope.includes(emp.department.toUpperCase())) || publishedTemplates[0];
                                setSelectedTemplate(deptTemplate);
                                setView('EVALUATION'); 
                              }}
                              className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-4 py-1.5 rounded-lg transition-all"
                              data-demo-id="open-evaluation-btn"
                            >
                              {emp.status === 'Completed' ? 'View Results' : 'Fill Evaluation'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}
          </div>
        )}

        {activeTab === 'Appraisals' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard title="Self Appraisals" className="text-center">
                <div className="text-4xl font-black text-[#0047cc] my-4">12</div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Awaiting Submission</p>
                <Button variant="primary" size="sm" fullWidth className="mt-6">Start My Appraisal</Button>
              </GlassCard>
              <GlassCard title="Manager Reviews" className="text-center">
                <div className="text-4xl font-black text-blue-500 my-4">08</div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Pending Action</p>
                <button className="mt-6 w-full py-2 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white text-[9px] font-black uppercase tracking-widest rounded-lg">View Queue</button>
              </GlassCard>
              <GlassCard title="Final Approvals" className="text-center">
                <div className="text-4xl font-black text-emerald-500 my-4">02</div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Ready for Sign-off</p>
                <button className="mt-6 w-full py-2 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white text-[9px] font-black uppercase tracking-widest rounded-lg">Open Vault</button>
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

        {activeTab === 'Reporting' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard title="Performance Distribution">
                <div className="h-64 flex items-center justify-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  Bell Curve Distribution Chart
                </div>
              </GlassCard>
              <GlassCard title="Competency Gap Analysis">
                <div className="h-64 flex items-center justify-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  Radar Chart: Required vs Actual
                </div>
              </GlassCard>
            </div>
            <GlassCard title="Available Reports">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  'High Potential (HiPo) List',
                  'Underperformer Recovery Plans',
                  'Departmental Performance Comparison',
                  'Goal Alignment Report',
                  'Skill Matrix Export',
                  'Appraisal Completion Audit'
                ].map((report, i) => (
                  <button key={i} className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl text-left hover:border-[#0047cc] transition-all group">
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#0047cc]">{report}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Generate PDF/XLSX</p>
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard title="Evaluation Parameters">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Enable Self-Appraisal</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">Allow employees to rate themselves</p>
                  </div>
                  <div className="w-10 h-5 bg-[#0047cc] rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Anonymous Peer Review</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">Hide reviewer identity from subject</p>
                  </div>
                  <div className="w-10 h-5 bg-slate-200 dark:bg-white/10 rounded-full relative">
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </GlassCard>
            <GlassCard title="Rating Scales">
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-lg">
                  <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Standard 5-Point Scale</p>
                  <p className="text-[9px] text-slate-500 font-bold mt-1">1: Poor, 2: Fair, 3: Good, 4: Great, 5: Elite</p>
                </div>
                <button className="w-full py-2 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-white/10">
                  Manage Scales
                </button>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
      {/* Scope Selection Modal */}
      {showScopeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0f172a] w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-300">
            <div className="p-4 sm:p-8 space-y-8">
              <div className="space-y-2">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Select Visibility Scope:</h3>
              </div>

              <div className="space-y-4">
                {/* Global Scope */}
                <button 
                  onClick={() => setModalScope('GLOBAL')}
                  className={`w-full p-6 rounded-2xl border-2 text-left transition-all flex items-center gap-6 ${modalScope === 'GLOBAL' ? 'border-[#0047cc] bg-[#0047cc]/5' : 'border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${modalScope === 'GLOBAL' ? 'bg-[#0047cc] text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                    <Globe size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Global Scope</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">Available fallback for all employees in the organization.</p>
                  </div>
                  {modalScope === 'GLOBAL' && <div className="w-5 h-5 rounded-full bg-[#0047cc] flex items-center justify-center text-white"><Check size={10} /></div>}
                </button>

                {/* Branch Specific */}
                <button 
                  onClick={() => setModalScope('BRANCH')}
                  className={`w-full p-6 rounded-2xl border-2 text-left transition-all flex items-center gap-6 ${modalScope === 'BRANCH' ? 'border-[#0047cc] bg-[#0047cc]/5' : 'border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${modalScope === 'BRANCH' ? 'bg-[#0047cc] text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                    <Building2 size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Branch Specific</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">Overrides global template for employees in chosen branch.</p>
                  </div>
                  {modalScope === 'BRANCH' && <div className="w-5 h-5 rounded-full bg-[#0047cc] flex items-center justify-center text-white"><Check size={10} /></div>}
                </button>

                {/* Department Specific */}
                <div className={`rounded-2xl border-2 transition-all ${modalScope === 'DEPT' ? 'border-[#0047cc] bg-[#0047cc]/5' : 'border-slate-100 dark:border-white/5'}`}>
                  <button 
                    onClick={() => setModalScope('DEPT')}
                    className="w-full p-6 text-left flex items-center gap-6"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${modalScope === 'DEPT' ? 'bg-[#0047cc] text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                      <Users size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Department Specific</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">Highest priority. Can be assigned to multiple departments.</p>
                    </div>
                    {modalScope === 'DEPT' && <div className="w-5 h-5 rounded-full bg-[#0047cc] flex items-center justify-center text-white"><Check size={10} /></div>}
                  </button>

                  {modalScope === 'DEPT' && (
                    <div className="px-6 pb-6 pt-2 grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-300">
                      {['Administration', 'Human Resources', 'MANAGEMENT', 'Marketing', 'Engineering', 'Sales'].map(dept => (
                        <label key={dept} className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 cursor-pointer hover:border-[#0047cc]/30 transition-all">
                          <input 
                            type="checkbox"
                            checked={selectedDepts.includes(dept)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedDepts([...selectedDepts, dept]);
                              else setSelectedDepts(selectedDepts.filter(d => d !== dept));
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-[#0047cc] focus:ring-[#0047cc]"
                          />
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tight">{dept}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 p-4 bg-[#e0f2fe]0/5 rounded-xl border border-[#e0f2fe]0/10">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0047cc]" />
                <p className="text-[9px] text-slate-500 font-medium italic">Note: Employees will always see the most specific published template.</p>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                <button 
                  onClick={() => setShowScopeModal(false)}
                  className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateNew}
                  className="px-10 py-3 bg-[#0047cc] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-[#e0f2fe]0/20 hover:bg-[#6d39e0] transition-all"
                >
                  Continue to Editor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performance;



