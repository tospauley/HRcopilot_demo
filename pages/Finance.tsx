import React, { useState, useEffect } from 'react';
import { useCurrency } from '../src/context/CurrencyContext';
import { db } from '../mockDb';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, setDoc, doc } from '../mockDb';
import GlassCard from '../components/GlassCard';
import { ICONS } from '../constants';
import { categorizeTransaction } from '../services/geminiService';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { CHART_OF_ACCOUNTS, MOCK_JOURNALS, FINANCIAL_METRICS, AGING_DATA, CUSTOMERS, MOCK_INVOICES } from '../services/financeData';

const Finance: React.FC = () => {
  const { symbol, fmt } = useCurrency();
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [activeSubTab, setActiveSubTab] = useState('CASH_FLOW');
  const [journalEntries, setJournalEntries] = useState<any[]>(MOCK_JOURNALS);
  const [accounts, setAccounts] = useState<any[]>(CHART_OF_ACCOUNTS);
  const [loading, setLoading] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    description: '',
    lines: [{ accountId: '', accountName: '', debit: 0, credit: 0 }]
  });
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>(MOCK_INVOICES);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    customerId: '',
    customerName: '',
    date: new Date().toISOString().split('T')[0],
    due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lines: [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }]
  });

  const TABS = [
    { id: 'DASHBOARD', label: 'Dashboard', subTabs: ['CASH_FLOW', 'PL_OVERVIEW', 'AGING', 'KPIS'] },
    { id: 'GENERAL_LEDGER', label: 'General Ledger', subTabs: ['CHART_OF_ACCOUNTS', 'JOURNAL_ENTRIES', 'TRIAL_BALANCE', 'GL_REPORT'] },
    { id: 'ACCOUNTS_RECEIVABLE', label: 'Accounts Receivable', subTabs: ['INVOICING', 'CUSTOMER_CREDITS', 'PAYMENTS_RECEIVED', 'AGING_REPORT'] },
    { id: 'ACCOUNTS_PAYABLE', label: 'Accounts Payable', subTabs: ['VENDOR_BILLS', 'PURCHASE_ORDERS', 'VENDOR_CREDITS', 'PAYMENT_RUNS'] },
    { id: 'CASH_BANKING', label: 'Cash & Banking', subTabs: ['BANK_FEEDS', 'RECONCILIATION', 'CASH_FLOW_FORECAST'] },
    { id: 'REPORTING', label: 'Financial Reporting', subTabs: ['BALANCE_SHEET', 'INCOME_STATEMENT', 'CONSOLIDATION', 'TAX_REPORTS'] },
    { id: 'BUDGETING', label: 'Budgeting & Planning', subTabs: ['BUDGET_VS_ACTUAL', 'FORECASTS', 'DEPT_BUDGETS'] },
    { id: 'AUDIT_COMPLIANCE', label: 'Audit & Compliance', subTabs: ['AUDIT_LOGS', 'INTERNAL_CONTROLS', 'COMPLIANCE_DOCS'] },
    { id: 'FIXED_ASSETS', label: 'Fixed Assets', subTabs: ['ASSET_REGISTRY', 'DEPRECIATION', 'DISPOSALS'] },
    { id: 'SETTINGS', label: 'Settings', subTabs: ['FISCAL_YEARS', 'CURRENCIES', 'TAX_RULES'] },
  ];

  useEffect(() => {
    setLoading(true);
    
    const initializeData = async () => {
      // Robust Seeding for Journal Entries
      const qEntries = query(collection(db, 'journal_entries'), orderBy('date', 'desc'));
      const entriesSnapshot = await new Promise<any>(resolve => {
        let unsub: () => void;
        unsub = onSnapshot(qEntries, (snapshot) => {
          if (unsub) unsub();
          resolve(snapshot);
        });
      });

      if (entriesSnapshot.docs.length === 0) {
        for (const entry of MOCK_JOURNALS) {
          await setDoc(doc(db, 'journal_entries', entry.id), entry);
        }
      }

      // Robust Seeding for Accounts
      const qAccounts = query(collection(db, 'accounts'));
      const accountsSnapshot = await new Promise<any>(resolve => {
        let unsub: () => void;
        unsub = onSnapshot(qAccounts, (snapshot) => {
          if (unsub) unsub();
          resolve(snapshot);
        });
      });

      if (accountsSnapshot.docs.length === 0) {
        for (const acc of CHART_OF_ACCOUNTS) {
          await setDoc(doc(db, 'accounts', acc.id), acc);
        }
      }

      // Robust Seeding for Invoices
      const qInvoices = query(collection(db, 'invoices'), orderBy('date', 'desc'));
      const invoicesSnapshot = await new Promise<any>(resolve => {
        let unsub: () => void;
        unsub = onSnapshot(qInvoices, (snapshot) => {
          if (unsub) unsub();
          resolve(snapshot);
        });
      });

      if (invoicesSnapshot.docs.length === 0) {
        for (const inv of MOCK_INVOICES) {
          await setDoc(doc(db, 'invoices', inv.id), inv);
        }
      }

      // Now start long-running listeners
      const unsubscribeEntries = onSnapshot(qEntries, (snapshot) => {
        setJournalEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      });

      const unsubscribeAccounts = onSnapshot(qAccounts, (snapshot) => {
        setAccounts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      const unsubscribeInvoices = onSnapshot(qInvoices, (snapshot) => {
        setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return () => {
        unsubscribeEntries();
        unsubscribeAccounts();
        unsubscribeInvoices();
      };
    };

    const cleanupPromise = initializeData();
    return () => {
      cleanupPromise.then(cleanup => cleanup && cleanup());
    };
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const tab = TABS.find(t => t.id === tabId);
    if (tab && tab.subTabs.length > 0) {
      setActiveSubTab(tab.subTabs[0]);
    }
  };

  const handleAddLine = () => {
    setNewEntry(prev => ({
      ...prev,
      lines: [...prev.lines, { accountId: '', accountName: '', debit: 0, credit: 0 }]
    }));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const updatedLines = [...newEntry.lines];
    if (field === 'accountId') {
      const account = accounts.find(a => a.id === value);
      updatedLines[index] = { ...updatedLines[index], accountId: value, accountName: account?.name || '' };
    } else {
      updatedLines[index] = { ...updatedLines[index], [field]: value };
    }
    setNewEntry(prev => ({ ...prev, lines: updatedLines }));
  };

  const totalDebit = newEntry.lines.reduce((sum, l) => sum + Number(l.debit), 0);
  const totalCredit = newEntry.lines.reduce((sum, l) => sum + Number(l.credit), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleAiCategorize = async () => {
    if (!newEntry.description) return;
    const suggestion = await categorizeTransaction(newEntry.description, totalDebit);
    setAiSuggestion(suggestion);
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestion) return;
    const updatedLines = [...newEntry.lines];
    updatedLines[0] = { 
      ...updatedLines[0], 
      accountId: aiSuggestion.accountId, 
      accountName: aiSuggestion.accountName 
    };
    setNewEntry(prev => ({ ...prev, lines: updatedLines }));
    setAiSuggestion(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;

    try {
      await addDoc(collection(db, 'journal_entries'), {
        ...newEntry,
        date: new Date().toISOString(),
        totalDebit,
        totalCredit,
        status: 'POSTED',
        createdAt: serverTimestamp()
      });
      setIsEntryModalOpen(false);
      setNewEntry({ description: '', lines: [{ accountId: '', accountName: '', debit: 0, credit: 0 }] });
    } catch (error) {
      console.error("Error adding journal entry:", error);
    }
  };

  const handleAddInvoiceLine = () => {
    setNewInvoice(prev => ({
      ...prev,
      lines: [...prev.lines, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]
    }));
  };

  const handleInvoiceLineChange = (index: number, field: string, value: any) => {
    const updatedLines = [...newInvoice.lines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
       updatedLines[index].amount = updatedLines[index].quantity * updatedLines[index].unitPrice;
    }
    setNewInvoice(prev => ({ ...prev, lines: updatedLines }));
  };

  const totalInvoiceAmount = newInvoice.lines.reduce((sum, l) => sum + (l.amount || 0), 0);

  const handleSubmitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalInvoiceAmount <= 0 || !newInvoice.customerId) return;

    try {
      await addDoc(collection(db, 'invoices'), {
        ...newInvoice,
        amount: totalInvoiceAmount,
        status: 'SENT',
        createdAt: serverTimestamp()
      });
      setIsInvoiceModalOpen(false);
      setNewInvoice({
        customerId: '',
        customerName: '',
        date: new Date().toISOString().split('T')[0],
        due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lines: [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }]
      });
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  const renderInvoiceModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsInvoiceModalOpen(false)} />
      <GlassCard className="w-full max-w-4xl relative z-10 !p-0 overflow-hidden shadow-2xl border-none">
        <div className="p-4 sm:p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-slate-900">
          <div>
            <p className="text-[10px] font-black text-[#0047cc] uppercase tracking-[0.2em] mb-1">Accounts Receivable</p>
            <h3 className="text-2xl font-black uppercase tracking-tighter italic">Generate New Invoice</h3>
          </div>
          <button onClick={() => setIsInvoiceModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-center transition-colors text-slate-400">?</button>
        </div>

        <form onSubmit={handleSubmitInvoice} className="p-10 space-y-10 max-h-[70vh] overflow-y-auto bg-slate-50/30 dark:bg-white/[0.01]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer Entity</label>
              <select 
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-[#0047cc] transition-all"
                value={newInvoice.customerId}
                onChange={(e) => {
                  const cust = CUSTOMERS.find(c => c.id === e.target.value);
                  setNewInvoice(prev => ({ ...prev, customerId: e.target.value, customerName: cust?.name || '' }));
                }}
                required
              >
                <option value="">Select Customer...</option>
                {CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Invoice Date</label>
              <input 
                type="date"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-[#0047cc] transition-all"
                value={newInvoice.date}
                onChange={(e) => setNewInvoice(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Due Date</label>
              <input 
                type="date"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-[#0047cc] transition-all"
                value={newInvoice.due}
                onChange={(e) => setNewInvoice(prev => ({ ...prev, due: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <h4 className="text-xs font-black uppercase tracking-widest italic text-slate-900 dark:text-white">Billing Line Items</h4>
              <button 
                type="button"
                onClick={handleAddInvoiceLine}
                className="text-[10px] font-black text-[#0047cc] uppercase tracking-widest hover:underline"
              >
                + Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {newInvoice.lines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-4 items-end bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                  <div className="col-span-12 md:col-span-6 space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400">Description</label>
                    <input 
                      type="text"
                      placeholder="Service or product description..."
                      className="w-full bg-slate-50 dark:bg-white/5 border border-transparent rounded-lg px-4 py-2 text-xs font-bold focus:border-[#0047cc] transition-all"
                      value={line.description}
                      onChange={(e) => handleInvoiceLineChange(idx, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2 space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400">Qty</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-50 dark:bg-white/5 border border-transparent rounded-lg px-4 py-2 text-xs font-bold focus:border-[#0047cc] transition-all"
                      value={line.quantity}
                      onChange={(e) => handleInvoiceLineChange(idx, 'quantity', Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2 space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400">Price</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-50 dark:bg-white/5 border border-transparent rounded-lg px-4 py-2 text-xs font-bold focus:border-[#0047cc] transition-all"
                      value={line.unitPrice}
                      onChange={(e) => handleInvoiceLineChange(idx, 'unitPrice', Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2 text-right">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Total</p>
                    <p className="text-xs font-black italic tracking-tighter">{fmt(line.amount || 0)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-10 border-t border-slate-100 dark:border-white/10 flex justify-between items-center">
            <div className="bg-[#0047cc] p-6 rounded-2xl text-white">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Total Receivable</p>
               <p className="text-3xl font-black italic tracking-tighter">{fmt(totalInvoiceAmount)}</p>
            </div>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
              >
                Launch Invoice
              </button>
            </div>
          </div>
        </form>
      </GlassCard>
    </div>
  );

  const cashflowData = [
    { name: 'Jan', inflow: 4000, outflow: 2400 },
    { name: 'Feb', inflow: 3000, outflow: 1398 },
    { name: 'Mar', inflow: 2000, outflow: 9800 },
    { name: 'Apr', inflow: 2780, outflow: 3908 },
    { name: 'May', inflow: 1890, outflow: 4800 },
    { name: 'Jun', inflow: 2390, outflow: 3800 },
  ];

  const renderDashboard = () => (
    <div className="space-y-4">
      {/* Top Level KPIs - Standard Application Structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Liquidity Index', 
            value: FINANCIAL_METRICS.currentRatio.toFixed(2), 
            status: 'OUTPERFORM', 
            accent: '#0ea5e9', // Purple to match sample
            trend: '+4.2%',
            trendColor: 'text-emerald-500'
          },
          { 
            label: 'Operational Velocity', 
            value: FINANCIAL_METRICS.quickRatio.toFixed(2), 
            status: 'HEALTHY', 
            accent: '#0ea5e9',
            trend: '+1.8%',
            trendColor: 'text-emerald-500'
          },
          { 
            label: 'EBITDA Margin', 
            value: fmt(FINANCIAL_METRICS.ebitda, { compact: true }), 
            status: 'HEALTHY', 
            accent: '#0ea5e9',
            trend: '+12.5%',
            trendColor: 'text-emerald-500'
          },
          { 
            label: 'Net Burn Rate', 
            value: fmt(FINANCIAL_METRICS.burnRate, { compact: true }), 
            status: 'OPTIMIZED', 
            accent: '#0ea5e9',
            trend: '-2.4%',
            trendColor: 'text-slate-400'
          },
        ].map((kpi, i) => (
          <GlassCard key={i} accentColor={kpi.accent} className="!p-4 hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</h3>
              <span className={`text-[9px] font-black ${kpi.trendColor} uppercase`}>{kpi.trend}</span>
            </div>
            <div>
              <p className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white group-hover:text-[var(--brand-primary)] transition-colors">
                {kpi.value}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>

      {activeSubTab === 'CASH_FLOW' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <GlassCard id="finance-chart" className="lg:col-span-8 !p-6 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tighter italic">Capital Flow Analytics</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Simulated Multi-Entity Treasury Forecast</p>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-lg bg-[#0047cc] shadow-lg shadow-blue-500/20" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Gross Inflow</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-lg bg-rose-500 shadow-lg shadow-rose-500/20" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Gross Outflow</span>
                  </div>
                </div>
              </div>
              <div className="h-[260px] min-w-0 w-full relative">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={cashflowData}>
                    <defs>
                      <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0047cc" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#0047cc" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 9, fontWeight: '900', fill: '#94a3b8', letterSpacing: '0.1em'}} 
                      dy={15}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 9, fontWeight: '900', fill: '#94a3b8'}} 
                      tickFormatter={(v) => `${symbol}${v}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0d0a1a', 
                        border: '1px solid rgba(255,255,255,0.05)', 
                        borderRadius: '24px', 
                        padding: '20px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                      }}
                      itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}
                      cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="inflow" 
                      stroke="#0047cc" 
                      fillOpacity={1} 
                      fill="url(#colorInflow)" 
                      strokeWidth={4} 
                      animationDuration={2000}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="outflow" 
                      stroke="#f43f5e" 
                      fillOpacity={1} 
                      fill="url(#colorOutflow)" 
                      strokeWidth={4} 
                      animationDuration={2500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#0047cc]/[0.03] rounded-full blur-3xl -mr-48 -mt-48 group-hover:bg-[#0047cc]/[0.05] transition-colors duration-1000" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/[0.02] rounded-full blur-3xl -ml-32 -mb-32" />
          </GlassCard>

          <div className="lg:col-span-4 space-y-3">
            <GlassCard className="!p-5 bg-gradient-to-br from-[#0047cc] to-[#002b7a] border-none text-white relative overflow-hidden group">
               <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200/60 mb-1">Consolidated Assets</p>
                 <h4 className="text-3xl font-black italic tracking-tighter mb-3">{fmt(4_280_500)}</h4>
                 <div className="flex items-center gap-3 py-3 border-t border-white/10">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                       <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeWidth="3"/></svg>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">+12.5% Annualized</span>
                 </div>
               </div>
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-1000" />
            </GlassCard>

            <GlassCard className="!p-5 bg-white dark:bg-[#0d0a1a] shadow-xl">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Total Liabilities</p>
               <h4 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white mb-3">{fmt(1_120_400)}</h4>
               <div className="flex items-center gap-3 py-3 border-t border-slate-100 dark:border-white/5">
                  <div className="w-7 h-7 rounded-full bg-rose-500/10 flex items-center justify-center">
                     <svg className="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" strokeWidth="3"/></svg>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">+2.1% Expenditure</span>
               </div>
            </GlassCard>

            <GlassCard className="!p-5 bg-white dark:bg-[#0d0a1a] shadow-xl border-t-[6px] border-[#0ea5e9]">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Net Income (QTD)</p>
               <h4 className="text-3xl font-black italic tracking-tighter text-[#0ea5e9] mb-3">{fmt(840_200)}</h4>
               <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0ea5e9] w-[84%] shadow-[0_0_12px_rgba(14,165,233,0.5)]" />
               </div>
            </GlassCard>
          </div>
        </div>
      )}

      {activeSubTab === 'PL_OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <GlassCard className="!p-10">
              <h3 className="text-xl font-black uppercase tracking-widest italic mb-10">Revenue vs Expenditures</h3>
              <div className="h-[400px] min-w-0 w-full relative">
                 <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart data={[
                       { name: 'SaaS Revenue', value: 1250000, color: '#0047cc' },
                       { name: 'Prof Services', value: 450000, color: '#0047cc' },
                       { name: 'Opex Sal', value: -850000, color: '#f43f5e' },
                       { name: 'Infrastructure', value: -120000, color: '#f43f5e' },
                    ]}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: '900', fill: '#94a3b8'}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: '900', fill: '#94a3b8'}} />
                       <Tooltip contentStyle={{ backgroundColor: '#0d0a1a', border: 'none', borderRadius: '16px' }} />
                       <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {[0, 1, 2, 3].map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={index < 2 ? '#0047cc' : '#f43f5e'} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </GlassCard>

           <div className="space-y-8">
              <GlassCard className="!p-8">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Gross Margin Velocity</p>
                 <div className="flex items-end gap-1 h-32 mb-8">
                    {[40, 60, 45, 90, 70, 85, 95].map((h, i) => (
                       <div key={i} className="flex-1 bg-[#0047cc]/10 dark:bg-white/5 rounded-t-lg group relative overflow-hidden">
                          <div className="absolute bottom-0 w-full bg-[#0047cc]/40 transition-all duration-1000" style={{ height: `${h}%` }} />
                       </div>
                    ))}
                 </div>
                 <div className="flex justify-between items-center bg-slate-50 dark:bg-white/5 p-6 rounded-[24px]">
                    <div>
                       <p className="text-[9px] font-black uppercase text-slate-400">Target Efficiency</p>
                       <p className="text-2xl font-black italic">82.4%</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-black uppercase text-emerald-500">+4.2% Optimization</p>
                    </div>
                 </div>
              </GlassCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <GlassCard className="!p-6 border-l-4 border-emerald-500">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Operating Income</p>
                    <p className="text-2xl font-black italic">{fmt(310_200)}</p>
                 </GlassCard>
                 <GlassCard className="!p-6 border-l-4 border-rose-500">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-1">EBITDA Loss Calc</p>
                    <p className="text-2xl font-black italic">-{fmt(12_400)}</p>
                 </GlassCard>
              </div>
           </div>
        </div>
      )}

      {activeSubTab === 'AGING' && (
        <div className="space-y-8">
           <GlassCard className="!p-10">
              <div className="flex justify-between items-end mb-12">
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">Receivable Exposure Matrix</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2">DSO: 34 Days (Regional Average: 42)</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-[#0047cc] uppercase tracking-widest">Total Outstanding</p>
                    <p className="text-3xl font-black italic">{fmt(840_200, { decimals: 2 })}</p>
                 </div>
              </div>

              <div className="space-y-12">
                 {[
                    { label: 'Current (0-30)', value: 450000, color: '#0047cc', pct: 54 },
                    { label: '31-60 Days', value: 180000, color: '#0ea5e9', pct: 21 },
                    { label: '61-90 Days', value: 125000, color: '#f59e0b', pct: 15 },
                    { label: '90+ Days (Critical)', value: 85200, color: '#f43f5e', pct: 10 },
                 ].map((row, i) => (
                    <div key={i} className="space-y-3">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest overflow-hidden">
                          <span className="text-slate-900 dark:text-white shrink-0">{row.label}</span>
                          <span className="text-slate-400 truncate mx-4 opacity-20">....................................................................................................................................</span>
                          <span className="shrink-0">{fmt(row.value)} ({row.pct}%)</span>
                       </div>
                       <div className="h-3 w-full bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden flex">
                          <div 
                            className="h-full rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(0,0,0,0.2)]" 
                            style={{ width: `${row.pct}%`, backgroundColor: row.color, opacity: 0.8 }} 
                          />
                       </div>
                    </div>
                 ))}
              </div>
           </GlassCard>

           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                 { label: 'Collection Rate', value: '96.4%', trend: '+0.2%' },
                 { label: 'Bad Debt Prov', value: '1.2%', trend: '-0.1%' },
                 { label: 'Avg Payment Term', value: '28d', trend: 'Stable' },
                 { label: 'Credit Risk Score', value: 'A-', trend: '+1 Notch' },
              ].map((m, i) => (
                 <GlassCard key={i} className="!p-5 text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</p>
                    <p className="text-xl font-black italic tracking-tighter">{m.value}</p>
                    <p className="text-[8px] font-black text-emerald-500 uppercase mt-1">{m.trend}</p>
                 </GlassCard>
              ))}
           </div>
        </div>
      )}

      {activeSubTab === 'KPIS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[
              { label: 'Quick Ratio', value: '1.42', goal: '1.50', status: 'WARN', color: '#f59e0b' },
              { label: 'Inventory Turnover', value: '12.4x', goal: '10.0x', status: 'PASS', color: '#10b981' },
              { label: 'Debt to Equity', value: '0.65', goal: '0.80', status: 'PASS', color: '#10b981' },
              { label: 'Profit Margin', value: '18.2%', goal: '20.0%', status: 'WARN', color: '#f59e0b' },
              { label: 'ROI (Project X)', value: '24.5%', goal: '15.0%', status: 'HIGH', color: '#0ea5e9' },
              { label: 'Cash Runway', value: '14mo', goal: '12mo', status: 'PASS', color: '#10b981' },
           ].map((kpi, i) => (
              <GlassCard key={i} className="!p-8 group hover:border-[#0047cc]/20 transition-all">
                 <div className="flex justify-between items-center mb-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
                    <span className={`text-[8px] font-black px-2 py-1 rounded ${
                       kpi.status === 'PASS' || kpi.status === 'HIGH' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>{kpi.status}</span>
                 </div>
                 <div className="flex items-end justify-between">
                    <div>
                       <p className="text-4xl font-black italic tracking-tighter" style={{ color: kpi.color }}>{kpi.value}</p>
                       <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Target Benchmark: {kpi.goal}</p>
                    </div>
                    <div className="w-16 h-16 relative">
                       <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100 dark:stroke-white/5" strokeWidth="3" />
                          <circle 
                            cx="18" 
                            cy="18" 
                            r="16" 
                            fill="none" 
                            stroke={kpi.color} 
                            strokeWidth="3" 
                            strokeDasharray="100" 
                            strokeDashoffset={100 - (parseFloat(kpi.value) / parseFloat(kpi.goal) * 50)} 
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                          />
                       </svg>
                       <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black uppercase text-slate-400">Score</div>
                    </div>
                 </div>
              </GlassCard>
           ))}
        </div>
      )}
    </div>
  );

  const renderGeneralLedger = () => (
    <div className="space-y-6">
      {activeSubTab === 'JOURNAL_ENTRIES' && (
        <GlassCard className="p-4 sm:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black uppercase tracking-widest italic">Journal Entries</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{journalEntries.length} entries � Double-Entry Verified</p>
            </div>
            <button
              onClick={() => setIsEntryModalOpen(true)}
              className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 transition-transform"
            >
              + New Entry
            </button>
          </div>
          <div className="table-wrap">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  <th className="pb-4 pr-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-28">Date</th>
                  <th className="pb-4 pr-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-32">Reference</th>
                  <th className="pb-4 pr-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="pb-4 pr-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-24">Source</th>
                  <th className="pb-4 pr-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-32 text-right">Debit</th>
                  <th className="pb-4 pr-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-32 text-right">Credit</th>
                  <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-24 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {journalEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No journal entries yet</p>
                      <p className="text-[9px] text-slate-300 mt-1">Click + New Entry to post your first journal</p>
                    </td>
                  </tr>
                ) : journalEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all group cursor-pointer">
                    <td className="py-4 pr-4 text-[10px] font-bold text-slate-500 whitespace-nowrap">
                      {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-[9px] font-black text-[#0047cc] font-mono">{entry.reference || entry.id}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center text-xs group-hover:bg-[#0047cc]/10 transition-colors shrink-0">
                          {entry.description?.toLowerCase().includes('payroll') ? '??'
                            : entry.description?.toLowerCase().includes('revenue') ? '??'
                            : entry.description?.toLowerCase().includes('depreciation') ? '??'
                            : entry.description?.toLowerCase().includes('tax') ? '???'
                            : entry.description?.toLowerCase().includes('lease') ? '??'
                            : '??'}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-tight group-hover:text-[#0047cc] transition-colors">{entry.description}</p>
                          {entry.lines && (
                            <p className="text-[8px] text-slate-400 mt-0.5">
                              {entry.lines.map((l: any) => l.accountCode).join(' � ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-[9px] text-slate-400 font-bold">{entry.source || 'Manual'}</span>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <span className="text-[11px] font-black text-emerald-600 font-mono">
                        {symbol}{entry.totalDebit?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <span className="text-[11px] font-black text-rose-500 font-mono">
                        {symbol}{entry.totalCredit?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          entry.status === 'POSTED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                        }`}>{entry.status}</span>
                        {entry.status === 'POSTED' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              {journalEntries.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-slate-200 dark:border-white/10">
                    <td colSpan={4} className="pt-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Period Totals</td>
                    <td className="pt-4 text-right text-[11px] font-black text-emerald-600 font-mono">
                      {symbol}{journalEntries.reduce((s, e) => s + (e.totalDebit || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="pt-4 text-right text-[11px] font-black text-rose-500 font-mono">
                      {symbol}{journalEntries.reduce((s, e) => s + (e.totalCredit || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="pt-4 text-center">
                      <span className="text-[8px] font-black text-emerald-500 uppercase">? Balanced</span>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </GlassCard>
      )}

      {activeSubTab === 'CHART_OF_ACCOUNTS' && (() => {
        const CLASS_META: Record<string, { label: string; range: string; color: string; bg: string; icon: string }> = {
          Asset:     { label: 'Assets',     range: '1000�1999', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: '??' },
          Liability: { label: 'Liabilities', range: '2000�2999', color: 'text-rose-500',    bg: 'bg-rose-500/10',    icon: '??' },
          Equity:    { label: 'Equity',      range: '3000�3999', color: 'text-violet-500',  bg: 'bg-violet-500/10',  icon: '??' },
          Revenue:   { label: 'Revenue',     range: '4000�4999', color: 'text-[#0047cc]',   bg: 'bg-[#0047cc]/10',   icon: '??' },
          Expense:   { label: 'Expenses',    range: '5000�8999', color: 'text-amber-500',   bg: 'bg-amber-500/10',   icon: '??' },
        };
        const CLASSES = ['Asset','Liability','Equity','Revenue','Expense'] as const;

        const fmtAmt = (n: number) => `${symbol}${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

        return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0047cc] animate-pulse" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Institutional Ledger Registry</h3>
            </div>
            <button onClick={() => setIsAccountModalOpen(true)}
              className="px-6 py-3 bg-[#0047cc] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">
              + Add Account
            </button>
          </div>

          {/* Balance Sheet Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {CLASSES.map(cls => {
              const meta  = CLASS_META[cls];
              const total = accounts.filter(a => a.type === cls).reduce((s, a) => s + (a.balance || 0), 0);
              const count = accounts.filter(a => a.type === cls).length;
              return (
                <GlassCard key={cls} className="!p-4">
                  <div className={`w-8 h-8 rounded-xl ${meta.bg} flex items-center justify-center text-base mb-3`}>{meta.icon}</div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{meta.label}</p>
                  <p className={`text-lg font-black italic tracking-tighter ${meta.color}`}>{fmtAmt(total)}</p>
                  <p className="text-[8px] text-slate-400 mt-1">{count} accounts � {meta.range}</p>
                </GlassCard>
              );
            })}
          </div>

          {/* Grouped Account Tables */}
          {CLASSES.map(cls => {
            const meta     = CLASS_META[cls];
            const clsAccts = accounts.filter(a => a.type === cls);
            if (!clsAccts.length) return null;

            // Group by subType
            const subTypes = [...new Set(clsAccts.map(a => a.subType))];

            return (
              <GlassCard key={cls} className="!p-0 overflow-hidden border-none">
                {/* Class header */}
                <div className={`flex items-center justify-between px-6 py-4 ${meta.bg} border-b border-white/5`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{meta.icon}</span>
                    <div>
                      <h4 className={`text-xs font-black uppercase tracking-widest ${meta.color}`}>
                        Class {cls === 'Asset' ? '1' : cls === 'Liability' ? '2' : cls === 'Equity' ? '3' : cls === 'Revenue' ? '4' : '5'} � {meta.label}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Account Range {meta.range} � {clsAccts.length} accounts</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Class Total</p>
                    <p className={`text-base font-black italic tracking-tighter ${meta.color}`}>
                      {fmtAmt(clsAccts.reduce((s, a) => s + (a.balance || 0), 0))}
                    </p>
                  </div>
                </div>

                {/* Sub-type sections */}
                {subTypes.map(sub => {
                  const subAccts = clsAccts.filter(a => a.subType === sub);
                  return (
                    <div key={sub}>
                      {/* Sub-type label */}
                      <div className="px-6 py-2 bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{sub}</p>
                      </div>

                      {/* Table */}
                      <div className="table-wrap">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-100 dark:border-white/5">
                              <th className="px-6 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400 w-20">Code</th>
                              <th className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400">Account Name</th>
                              <th className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400">Group</th>
                              <th className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400 w-24 text-center">Normal Bal.</th>
                              <th className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400 w-28 text-center">Reconcile</th>
                              <th className="px-6 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400 w-36 text-right">Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {subAccts.map((acct, idx) => {
                              const isContra = acct.balance < 0;
                              return (
                                <tr key={acct.id}
                                  className={`border-b border-slate-50 dark:border-white/[0.03] hover:bg-[#0047cc]/[0.03] transition-colors group cursor-pointer ${idx % 2 === 0 ? '' : 'bg-slate-50/30 dark:bg-white/[0.01]'}`}>
                                  <td className="px-6 py-3">
                                    <span className="text-[10px] font-black text-slate-500 font-mono">{acct.code}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div>
                                      <p className="text-[10px] font-black text-slate-800 dark:text-white group-hover:text-[#0047cc] transition-colors">
                                        {acct.name}
                                        {isContra && <span className="ml-2 text-[8px] font-black text-rose-400 uppercase">(Contra)</span>}
                                      </p>
                                      <p className="text-[8px] text-slate-400 mt-0.5 line-clamp-1">{acct.description}</p>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="text-[9px] font-bold text-slate-500">{acct.group}</span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${
                                      acct.normalBalance === 'Debit' ? 'bg-amber-500/10 text-amber-600' : 'bg-[#0047cc]/10 text-[#0047cc]'
                                    }`}>{acct.normalBalance}</span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {acct.isReconcilable
                                      ? <span className="text-[8px] font-black text-emerald-500 uppercase flex items-center justify-center gap-1">? Yes</span>
                                      : <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase">�</span>
                                    }
                                  </td>
                                  <td className="px-6 py-3 text-right">
                                    <span className={`text-[11px] font-black italic tracking-tight ${
                                      acct.balance === 0 ? 'text-slate-400' :
                                      isContra ? 'text-rose-500' : meta.color
                                    }`}>
                                      {acct.balance === 0 ? '—' : fmtAmt(acct.balance)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                            {/* Sub-type subtotal */}
                            <tr className="bg-slate-50 dark:bg-white/[0.03] border-t border-slate-200 dark:border-white/10">
                              <td colSpan={5} className="px-6 py-2">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Subtotal � {sub}</span>
                              </td>
                              <td className="px-6 py-2 text-right">
                                <span className={`text-[10px] font-black italic ${meta.color}`}>
                                  {fmtAmt(subAccts.reduce((s, a) => s + (a.balance || 0), 0))}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </GlassCard>
            );
          })}
        </div>
        );
      })()}
      {activeSubTab === 'TRIAL_BALANCE' && (
        <div className="space-y-6">
           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-slate-900 dark:bg-white p-8 rounded-[32px] gap-6">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-[#0047cc] rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl shadow-blue-500/20">??</div>
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white dark:text-slate-900">Trial Balance - Consolidated</h3>
                    <p className="text-[10px] text-blue-400 dark:text-blue-600 font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-500" />
                       Status: Ledger Balanced & Authenticated
                    </p>
                 </div>
              </div>
              <div className="flex gap-8 border-l border-white/10 dark:border-slate-200 pl-8">
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Debits</p>
                    <p className="text-2xl font-black italic text-white dark:text-slate-900 tracking-tighter">{symbol}{accounts.filter(a => a.balance > 0).reduce((sum, a) => sum + a.balance, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Credits</p>
                    <p className="text-2xl font-black italic text-rose-500 tracking-tighter">{symbol}{Math.abs(accounts.filter(a => a.balance < 0).reduce((sum, a) => sum + a.balance, 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                 </div>
              </div>
           </div>

           <GlassCard className="!p-0 overflow-hidden border-2 border-slate-100 dark:border-white/5">
             <div className="p-5 sm:p-10 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50 dark:bg-white/[0.01]">
               <div>
                  <h3 className="text-lg font-black uppercase tracking-widest italic">Ledger Verification Matrix</h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Fiscal Year 2024 � Q1 Finalization</p>
               </div>
               <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all">Generate PDF Package</button>
                  <button className="px-4 py-2 bg-[#0047cc] text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">Audit Trail</button>
               </div>
             </div>
             
             <div className="table-wrap">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-slate-50 dark:bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <th className="px-10 py-6">Code</th>
                     <th className="px-10 py-6">Account Descriptor</th>
                     <th className="px-10 py-6 text-right">Debit ($)</th>
                     <th className="px-10 py-6 text-right">Credit ($)</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                   {accounts.map(account => (
                     <tr key={account.id} className="hover:bg-[#0047cc]/[0.02] group transition-all">
                       <td className="px-10 py-6 font-mono text-[11px] text-slate-400 font-bold group-hover:text-[#0047cc]">{account.code}</td>
                       <td className="px-10 py-6">
                          <p className="text-xs font-black uppercase tracking-tight group-hover:translate-x-1 transition-transform">{account.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{account.type}</span>
                             <span className="w-1 h-1 rounded-full bg-slate-300" />
                             <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{account.group}</span>
                          </div>
                       </td>
                       <td className="px-10 py-6 text-right font-black italic text-xs text-slate-900 dark:text-white">
                         {account.balance > 0 ? account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 }) : <span className="opacity-10 text-slate-400">�</span>}
                       </td>
                       <td className="px-10 py-6 text-right font-black italic text-xs text-rose-500">
                         {account.balance < 0 ? Math.abs(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2 }) : <span className="opacity-10 text-slate-400">�</span>}
                       </td>
                     </tr>
                   ))}
                 </tbody>
                 <tfoot>
                   <tr className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black">
                      <td colSpan={2} className="px-10 py-10 uppercase tracking-[0.3em] text-[12px] italic">Grand Consolidated Equilibrium</td>
                      <td className="px-10 py-10 text-right italic text-3xl tracking-tighter">
                         {symbol}{accounts.filter(a => a.balance > 0).reduce((sum, a) => sum + a.balance, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-10 py-10 text-right italic text-3xl tracking-tighter">
                         {symbol}{Math.abs(accounts.filter(a => a.balance < 0).reduce((sum, a) => sum + a.balance, 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                   </tr>
                 </tfoot>
               </table>
             </div>
           </GlassCard>
        </div>
      )}
      {activeSubTab === 'GL_REPORT' && (
        <div className="space-y-12">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="!p-8 bg-gradient-to-br from-[#0047cc] to-[#002b7a] border-none text-white overflow-hidden relative group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                 <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-4 text-blue-100">Consolidated Assets Liquidity</p>
                    <h4 className="text-4xl font-black italic tracking-tighter mb-8">{fmt(4_280_500, { decimals: 2 })}</h4>
                    <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                       <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 w-[65%] shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
                       </div>
                       <span className="text-[10px] font-black uppercase">Goal: 65%</span>
                    </div>
                 </div>
              </GlassCard>
              <GlassCard className="!p-8 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 group">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Account Growth Velocity</p>
                 <h4 className="text-4xl font-black italic tracking-tighter mb-8 text-slate-900 dark:text-white">+14.2% <span className="text-sm font-bold uppercase tracking-widest text-[#0047cc]">YoY</span></h4>
                 <div className="h-[40px] w-full flex items-end gap-1">
                    {[30, 45, 35, 60, 55, 80, 70, 90].map((h, i) => (
                       <div key={i} className="flex-1 bg-[#0047cc]/10 dark:bg-white/5 rounded-t-sm group-hover:bg-[#0047cc] transition-all" style={{ height: `${h}%` }} />
                    ))}
                 </div>
              </GlassCard>
           </div>
           
           <div className="space-y-12">
              {accounts.slice(0, 8).map((acc, i) => (
                 <div key={acc.id} className="space-y-4">
                    <div className="flex justify-between items-end border-b-2 border-slate-900 dark:border-white pb-4">
                       <div>
                          <p className="text-[10px] font-black text-[#0047cc] uppercase tracking-[0.4em] mb-1">{acc.code}</p>
                          <h4 className="text-2xl font-black uppercase tracking-tighter italic">{acc.name}</h4>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fiscal Balance</p>
                          <p className="text-2xl font-black italic tracking-tighter text-[#0047cc]">${Math.abs(acc.balance).toLocaleString()}</p>
                       </div>
                    </div>

                    <div className="overflow-x-auto bg-white dark:bg-slate-900/50 rounded-[24px] border border-slate-100 dark:border-white/5">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="bg-slate-50 dark:bg-white/[0.03] text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <th className="px-8 py-4">Transaction Date</th>
                                <th className="px-8 py-4 text-center">Reference</th>
                                <th className="px-8 py-4">Descriptor / Entity</th>
                                <th className="px-8 py-4 text-right">Debit ($)</th>
                                <th className="px-8 py-4 text-right">Credit ($)</th>
                                <th className="px-8 py-4 text-right">Closing ($)</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 dark:divide-white/5 text-[11px]">
                             {[
                                { date: 'Mar 15, 2024', ref: 'JE-001', desc: 'Payroll Disbursement HQ', val: 180000, type: 'dr' },
                                { date: 'Mar 18, 2024', ref: 'JE-005', desc: 'Operational Adjustments', val: 12400, type: 'cr' },
                             ].map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                   <td className="px-8 py-5 font-bold text-slate-400 uppercase">{row.date}</td>
                                   <td className="px-8 py-5 text-center">
                                      <span className="px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-md font-mono text-[10px] font-bold">{row.ref}</span>
                                   </td>
                                   <td className="px-8 py-5 font-black uppercase italic tracking-tight group-hover:text-[#0047cc] transition-colors">{row.desc}</td>
                                   <td className="px-8 py-5 text-right font-black text-[#0047cc] font-mono">{row.type === 'dr' ? row.val.toLocaleString() : '-'}</td>
                                   <td className="px-8 py-5 text-right font-black text-rose-500 font-mono">{row.type === 'cr' ? row.val.toLocaleString() : '-'}</td>
                                   <td className="px-8 py-5 text-right font-black italic text-slate-400">$1,160,000.00</td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              ))}
           </div>
           
           <div className="mt-12 text-center p-20 border-4 border-double border-slate-200 dark:border-white/10 rounded-[60px] bg-slate-50/50 dark:bg-white/[0.01]">
              <div className="max-w-xl mx-auto">
                 <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex items-center justify-center text-4xl mx-auto mb-8 animate-bounce">??</div>
                 <h4 className="text-2xl font-black uppercase tracking-widest italic mb-4">Integrity Verification Complete</h4>
                 <p className="text-[11px] text-slate-500 font-bold uppercase leading-relaxed tracking-widest mb-10">Cross-referencing 13 internal ledgers against blockchain audits and global banking standards. No discrepancies detected in current fiscal window.</p>
                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-[1.05] active:scale-95 transition-all">Download Audit Trail</button>
                    <button className="px-10 py-5 bg-[#0047cc] text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-[1.05] active:scale-95 transition-all">Verify on Blockchain</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );

  const renderAccountsReceivable = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Outstanding', value: '$1,240,500', accent: '#0ea5e9', trend: '+12.4%', trendColor: 'text-emerald-500' },
          { label: 'Overdue > 30 Days', value: '$420,000', accent: '#f43f5e', trend: '+2.1%', trendColor: 'text-rose-500' },
          { label: 'Collected Monthly', value: '$850,000', accent: '#10b981', trend: '+18.5%', trendColor: 'text-emerald-500' },
          { label: 'DSO (Avg Days)', value: '14 Days', accent: '#0047cc', trend: '-2 Days', trendColor: 'text-emerald-500' },
        ].map((stat, i) => (
          <GlassCard key={i} accentColor={stat.accent} className="!p-5 hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</h3>
              <span className={`text-[9px] font-black ${stat.trendColor} uppercase`}>{stat.trend}</span>
            </div>
            <div>
              <p className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white group-hover:text-[var(--brand-primary)] transition-colors">
                {stat.value}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>

      {activeSubTab === 'INVOICING' && (
        <GlassCard className="p-4 sm:p-8 border-none bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-lg font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Customer Invoices</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                 Accounts Receivable Registry � {invoices.length} Active Invoices
              </p>
            </div>
            <button 
              onClick={() => setIsInvoiceModalOpen(true)}
              className="px-6 py-3 bg-[var(--brand-primary)] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3" strokeLinecap="round"/></svg>
              Create New Invoice
            </button>
          </div>
          <div className="table-wrap">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice #</th>
                  <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Entity</th>
                  <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Impact</th>
                  <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Maturity Date</th>
                  <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all group cursor-pointer">
                    <td className="py-6 font-black text-[var(--brand-primary)] group-hover:translate-x-1 transition-transform italic text-sm">{inv.id}</td>
                    <td className="py-6">
                       <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xs group-hover:bg-[#0047cc]/10 group-hover:text-[#0047cc] transition-colors">
                             ??
                          </div>
                          <div>
                             <p className="text-xs font-black uppercase tracking-tight">{inv.customerName}</p>
                             <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Ref: {inv.customerId}</p>
                          </div>
                       </div>
                    </td>
                    <td className="py-6">
                       <p className="text-sm font-black italic tracking-tighter text-slate-900 dark:text-white">${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                       <p className="text-[9px] text-emerald-500 font-black uppercase mt-1">+ Tax Invoiced</p>
                    </td>
                    <td className="py-6">
                       <p className="text-xs font-bold text-slate-500">
                          {new Date(inv.due).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                       </p>
                       {new Date(inv.due) < new Date() && inv.status !== 'PAID' && (
                          <p className="text-[9px] text-rose-500 font-black uppercase mt-1">Past Maturity</p>
                       )}
                    </td>
                    <td className="py-6">
                      <div className="flex items-center gap-2">
                         <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                           inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 
                           inv.status === 'OVERDUE' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'
                         }`}>
                           {inv.status}
                         </span>
                         <div className={`w-2 h-2 rounded-full ${inv.status === 'PAID' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
      {activeSubTab === 'AGING_REPORT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           <GlassCard className="lg:col-span-8 p-10">
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter italic">AR Aging Analysis</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Institutional Credit Exposure</p>
                 </div>
                 <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400">Export PDF</button>
                    <button className="px-4 py-2 bg-[#0047cc] text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">Send Reminders</button>
                 </div>
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={AGING_DATA}>
                    <defs>
                       <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0047cc" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#0047cc" stopOpacity={0.2}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} />
                    <Tooltip 
                       cursor={{fill: 'rgba(255,255,255,0.02)'}}
                       contentStyle={{ backgroundColor: '#0f1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                    />
                    <Bar dataKey="amount" fill="url(#barGradient)" radius={[8, 8, 0, 0]} barSize={60}>
                       {AGING_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index > 2 ? '#f43f5e' : '#0047cc'} />
                       ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </GlassCard>
           <div className="lg:col-span-4 space-y-6">
              <GlassCard className="p-6">
                 <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Risk Concentration</h4>
                 <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                       <PieChart>
                          <Pie
                             data={[
                                { name: 'Tier 1', value: 70 },
                                { name: 'Tier 2', value: 20 },
                                { name: 'At Risk', value: 10 },
                             ]}
                             innerRadius={60}
                             outerRadius={80}
                             paddingAngle={5}
                             dataKey="value"
                          >
                             <Cell fill="#10b981" />
                             <Cell fill="#3b82f6" />
                             <Cell fill="#f43f5e" />
                          </Pie>
                          <Tooltip contentStyle={{ display: 'none' }} />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-bold uppercase mt-4">
                    <span className="text-emerald-500">Tier 1: 70%</span>
                    <span className="text-rose-500">At Risk: 10%</span>
                 </div>
              </GlassCard>
              <GlassCard className="p-6 bg-amber-500/5 border-amber-500/20">
                 <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-4 italic">Collector Insight</p>
                 <p className="text-xs font-bold leading-relaxed text-slate-300">
                   "Accounts in 60-90 day bucket are primarily from the EMEA region. Payment velocity likely impacted by local banking holiday cycle."
                 </p>
              </GlassCard>
           </div>
        </div>
      )}
    </div>
  );

  const renderAccountsPayable = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Payable', value: '$840,200', accent: '#f43f5e', trend: '+4.2%', trendColor: 'text-rose-500' },
          { label: 'Due This Week', value: '$125,000', accent: '#f59e0b', trend: 'Critical', trendColor: 'text-amber-500' },
          { label: 'Open POs', value: '24 Active', accent: '#0047cc', trend: 'In Progress', trendColor: 'text-blue-500' },
          { label: 'Vendor Credits', value: '$12,400', accent: '#10b981', trend: '-1.5%', trendColor: 'text-emerald-500' },
        ].map((stat, i) => (
          <GlassCard key={i} accentColor={stat.accent} className="!p-5 hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</h3>
              <span className={`text-[9px] font-black ${stat.trendColor} uppercase`}>{stat.trend}</span>
            </div>
            <div>
              <p className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors">
                {stat.value}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>

      {activeSubTab === 'VENDOR_BILLS' && (
        <GlassCard className="p-4 sm:p-8 border-none bg-rose-50/10 dark:bg-white/[0.02]">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-lg font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Vendor Billing Registry</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                 Accounts Payable Ledger � Institutional Commitments
              </p>
            </div>
            <button className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3" strokeLinecap="round"/></svg>
              Record Bill
            </button>
          </div>
          <div className="table-wrap">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bill Reference</th>
                  <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor Entity</th>
                  <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Settlement Amount</th>
                  <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Commitment Date</th>
                  <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Funding Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {[
                  { id: 'BILL-992', vendor: 'Amazon Web Services', amount: 4200, due: '2026-04-10', status: 'PENDING' },
                  { id: 'BILL-993', vendor: 'Office Depot', amount: 840, due: '2026-04-05', status: 'OVERDUE' },
                  { id: 'BILL-994', vendor: 'Local Utility Co', amount: 1200, due: '2026-04-25', status: 'PAID' },
                ].map((bill) => (
                  <tr key={bill.id} className="hover:bg-rose-500/5 dark:hover:bg-white/[0.03] transition-all group cursor-pointer">
                    <td className="py-6 font-black text-rose-500 group-hover:translate-x-1 transition-transform italic text-sm">{bill.id}</td>
                    <td className="py-6">
                       <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xs group-hover:bg-rose-500/10 group-hover:text-rose-500 transition-colors">
                             ??
                          </div>
                          <p className="text-xs font-black uppercase tracking-tight">{bill.vendor}</p>
                       </div>
                    </td>
                    <td className="py-6 font-black italic text-sm text-slate-900 dark:text-white">${bill.amount.toLocaleString()}</td>
                    <td className="py-6 text-xs font-bold text-slate-500">{new Date(bill.due).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="py-6">
                      <div className="flex items-center gap-2">
                         <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                           bill.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 
                           bill.status === 'OVERDUE' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                         }`}>
                           {bill.status}
                         </span>
                         <div className={`w-2 h-2 rounded-full ${bill.status === 'PAID' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );

  const renderCashBanking = () => (
    <div className="space-y-6">
      {activeSubTab === 'RECONCILIATION' && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6">
                 <GlassCard className="!p-8 bg-white dark:bg-[#0d0a1a] shadow-xl">
                    <h3 className="text-lg font-black uppercase tracking-tighter italic mb-8 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-[#0047cc] animate-pulse" />
                       Match Reconciliation
                    </h3>
                    <div className="space-y-8">
                       <div className="space-y-6">
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Treasury Balance (Bank)</p>
                             <p className="text-3xl font-black italic text-[#0047cc] tracking-tighter">$1,250,400.00</p>
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ledger Balance (Books)</p>
                             <p className="text-3xl font-black italic text-slate-400 tracking-tighter">$1,250,000.00</p>
                          </div>
                       </div>
                       
                       <div className="p-6 bg-emerald-500/5 rounded-[24px] border border-emerald-500/10">
                          <div className="flex justify-between items-center mb-4">
                             <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">Target Variance</span>
                             <span className="text-2xl font-black italic text-emerald-500">$400.00</span>
                          </div>
                          <div className="flex items-start gap-3">
                             <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2.5"/></svg>
                             </div>
                             <p className="text-[10px] font-bold text-emerald-500/80 leading-relaxed uppercase tracking-tight">AI MATCH SUGGESTION: SERVICE CHARGE (ACC-5100)</p>
                          </div>
                       </div>
                       
                       <button className="w-full py-5 bg-[#0047cc] text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all">Execute Precision Match</button>
                    </div>
                 </GlassCard>
              </div>
              <div className="lg:col-span-8">
                 <GlassCard className="p-5 sm:p-10 border-none bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
                       <div>
                          <h3 className="text-xl font-black uppercase tracking-tighter italic">Reconciliation Workbench</h3>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter mt-1 flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:animate-ping" />
                             Direct Treasury API Sync � Chase-04-A1
                          </p>
                       </div>
                       <div className="flex gap-2">
                          <button className="p-3 bg-white dark:bg-white/5 border border-white/10 rounded-xl hover:text-[#0047cc] transition-colors">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>
                       </div>
                    </div>
                    <div className="space-y-4">
                       {[
                          { date: 'Apr 03, 2024', desc: 'SaaS Payment - Acme Sub', amt: 1200, status: 'MATCHED', color: 'emerald' },
                          { date: 'Apr 04, 2024', desc: 'ATM Transaction #992', amt: -400, status: 'UNMATCHED', color: 'amber' },
                          { date: 'Apr 05, 2024', desc: 'Inbound Wire - Globex', amt: 25000, status: 'PENDING', color: 'blue' },
                       ].map((item, i) => (
                          <div key={i} className="flex items-center gap-6 p-6 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[28px] hover:bg-white/[0.08] transition-all group cursor-pointer shadow-sm hover:shadow-lg">
                             <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:bg-[#0047cc] group-hover:text-white transition-all transform group-hover:scale-110">
                                {item.amt > 0 ? '??' : '??'}
                             </div>
                             <div className="flex-1">
                                <p className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-[#0047cc] transition-colors">{item.desc}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{item.date}</p>
                             </div>
                             <div className="text-right">
                                <p className={`text-lg font-black italic tracking-tighter ${item.amt > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                   {item.amt > 0 ? '+' : '-'}${Math.abs(item.amt).toLocaleString()}
                                </p>
                                <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full bg-${item.color}-500/10 text-${item.color}-500 tracking-widest`}>{item.status}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 </GlassCard>
              </div>
           </div>
        </div>
      )}

      {activeSubTab !== 'RECONCILIATION' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassCard className="p-4 sm:p-8">
            <h3 className="text-lg font-black uppercase tracking-tighter italic mb-10 border-b border-white/5 pb-4">Treasury Connections</h3>
            <div className="space-y-6">
              {[
                { name: 'Chase Operating Account', balance: 1250400, lastSync: '10 mins ago', status: 'CONNECTED', pct: 100 },
                { name: 'Silicon Valley Bank - Savings', balance: 3500000, lastSync: '1 hour ago', status: 'CONNECTED', pct: 100 },
                { name: 'Stripe Payouts', balance: 84200, lastSync: '2 mins ago', status: 'SYNCING', pct: 75 },
              ].map((bank, i) => (
                <div key={i} className="p-6 bg-slate-50 dark:bg-white/[0.03] rounded-[28px] border border-slate-100 dark:border-white/5 group cursor-pointer hover:border-[#0047cc]/30 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-tight group-hover:text-[#0047cc] transition-colors">{bank.name}</h4>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Last Sync: {bank.lastSync}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black italic tracking-tighter text-slate-900 dark:text-white group-hover:text-[#0047cc] transition-colors">${bank.balance.toLocaleString()}</p>
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">{bank.status}</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-[#0047cc] rounded-full transition-all duration-1000" style={{ width: `${bank.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="!p-0 border-none overflow-hidden relative group">
            <div className="p-10 relative z-10">
               <h3 className="text-lg font-black uppercase tracking-tighter italic mb-10 border-b border-white/5 pb-4">Integrity Monitoring</h3>
               <div className="space-y-10">
                  <div className="space-y-4">
                     <div className="flex justify-between items-end">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unresolved Variations</p>
                        <p className="text-4xl font-black italic text-amber-500 tracking-tighter">12</p>
                     </div>
                     <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-emerald-500 w-[92%] transition-all duration-1000 shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
                     </div>
                     <div className="flex justify-between items-center bg-[#0047cc]/5 p-4 rounded-2xl">
                        <p className="text-[10px] text-[#0047cc] font-black uppercase tracking-[0.2em]">Match Accuracy Index</p>
                        <p className="text-lg font-black italic text-[#0047cc]">92.4%</p>
                     </div>
                  </div>
                  
                  <button 
                     onClick={() => setActiveSubTab('RECONCILIATION')}
                     className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[32px] text-xs font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                  >
                     <span>Launch Workbench</span>
                     <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
               </div>
            </div>
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0047cc]/5 rounded-full blur-3xl -mr-32 -mt-32" />
          </GlassCard>
        </div>
      )}
    </div>
  );

  const renderReporting = () => (
    <div className="space-y-6">
      {activeSubTab === 'BALANCE_SHEET' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <GlassCard className="p-5 sm:p-10">
              <div className="flex justify-between items-start mb-10 border-b border-slate-100 dark:border-white/5 pb-6">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic">Consolidated Balance Sheet</h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">As of {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="text-right">
                   <p className="text-xl font-black italic text-[#0047cc] underline underline-offset-8 decoration-2">$4,940,200.00</p>
                   <p className="text-[9px] font-black text-slate-400 uppercase mt-2">Total Net Worth</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Assets Section */}
                <section>
                   <h4 className="text-xs font-black uppercase tracking-widest text-[#0047cc] mb-4 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-[#0047cc] animate-pulse" />
                     Assets
                   </h4>
                   <div className="space-y-1">
                      {accounts.filter(a => a.type === 'Asset').map(a => (
                        <div key={a.id} className="flex justify-between py-2 text-xs border-b border-dotted border-slate-100 dark:border-white/5">
                           <span className="font-bold text-slate-400 uppercase tracking-tight">{a.name}</span>
                           <span className="font-black italic">${Math.abs(a.balance).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between py-4 text-xs font-black bg-slate-50/50 dark:bg-white/[0.02] px-4 rounded-xl mt-2">
                         <span className="uppercase tracking-widest">Total Assets</span>
                         <span className="italic">$4,940,200.00</span>
                      </div>
                   </div>
                </section>

                {/* Liabilities Section */}
                <section>
                   <h4 className="text-xs font-black uppercase tracking-widest text-rose-500 mb-4 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-rose-500" />
                     Liabilities
                   </h4>
                   <div className="space-y-1">
                      {accounts.filter(a => a.type === 'Liability').map(a => (
                        <div key={a.id} className="flex justify-between py-2 text-xs border-b border-dotted border-slate-100 dark:border-white/5">
                           <span className="font-bold text-slate-400 uppercase tracking-tight">{a.name}</span>
                           <span className="font-black italic">${Math.abs(a.balance).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between py-4 text-xs font-black bg-rose-500/5 px-4 rounded-xl mt-2">
                         <span className="uppercase tracking-widest">Total Liabilities</span>
                         <span className="italic">$2,565,500.00</span>
                      </div>
                   </div>
                </section>
              </div>
            </GlassCard>
          </div>
          <div className="lg:col-span-4 space-y-6">
             <GlassCard className="p-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Liquidity Scorecard</h4>
                <div className="space-y-6">
                   <div>
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-1">
                         <span>Cash Ratio</span>
                         <span className="text-emerald-500">Exceeds</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 w-[88%]" />
                      </div>
                   </div>
                   <div>
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-1">
                         <span>Solvency Margin</span>
                         <span className="text-[#0047cc]">Steady</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-[#0047cc] w-[62%]" />
                      </div>
                   </div>
                </div>
             </GlassCard>
             <GlassCard className="p-6 bg-[#0047cc]/5 border-[#0047cc]/20 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#0047cc]/10 rounded-full blur-3xl group-hover:bg-[#0047cc]/20 transition-all" />
                <p className="text-[9px] font-black text-[#0047cc] uppercase tracking-[0.2em] mb-4">Strategic Insight</p>
                <p className="text-xs font-bold leading-relaxed italic text-slate-300">
                  "Current asset velocity is trending 14% higher than Q3 projection. Recommended allocation of surplus cash to Fixed Asset rejuvenation."
                </p>
                <div className="mt-6 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[8px] font-black uppercase text-emerald-500">AI Verified Analysis</span>
                </div>
             </GlassCard>
          </div>
        </div>
      )}

      {activeSubTab === 'INCOME_STATEMENT' && (
        <GlassCard className="p-5 sm:p-10 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-black uppercase tracking-tighter italic">Income Statement (P&L)</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Fiscal Period: Jan - Jun 2024</p>
          </div>

          <div className="space-y-2">
             {/* Revenue Component */}
             <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[24px]">
                <div className="flex justify-between items-center mb-6">
                   <h4 className="text-sm font-black uppercase tracking-widest italic text-[#0047cc]">Total Revenue</h4>
                   <span className="text-xl font-black italic">$2,840,500.00</span>
                </div>
                <div className="space-y-3 px-4">
                   <div className="flex justify-between text-xs text-slate-400 font-bold">
                      <span>SaaS Subscriptions</span>
                      <span className="text-slate-200">$2,400,000.00</span>
                   </div>
                   <div className="flex justify-between text-xs text-slate-400 font-bold">
                      <span>Professional Services</span>
                      <span className="text-slate-200">$440,500.00</span>
                   </div>
                </div>
             </div>

             <div className="h-8 flex items-center justify-center">
                <div className="w-0.5 h-full bg-slate-100 dark:bg-white/10" />
             </div>

             {/* COGS (Simplified for Demo) */}
             <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-[24px]">
                <div className="flex justify-between items-center">
                   <h4 className="text-sm font-black uppercase tracking-widest italic text-rose-500">Cost of Goods Sold</h4>
                   <span className="text-lg font-black italic text-rose-500">($840,200.00)</span>
                </div>
             </div>

             <div className="py-6 border-y-2 border-slate-100 dark:border-white/5 my-4 flex justify-between items-center px-6">
                <h4 className="text-lg font-black uppercase italic tracking-widest">Gross Profit</h4>
                <span className="text-2xl font-black italic underline decoration-4 decoration-[#0047cc]/30 underline-offset-8">$2,000,300.00</span>
             </div>

             {/* Net Income */}
             <div className="pt-10 flex justify-between items-end border-t-2 border-slate-200 dark:border-white/20">
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Met</p>
                   <h4 className="text-2xl font-black uppercase italic tracking-tighter text-emerald-500">Net Income (QTD)</h4>
                </div>
                <div className="text-right">
                   <p className="text-3xl font-black italic text-emerald-500 animate-pulse">$1,160,100.00</p>
                   <p className="text-[9px] font-black text-slate-400 uppercase mt-1">Margin: 40.8%</p>
                </div>
             </div>
          </div>
        </GlassCard>
      )}

      {activeSubTab === 'CONSOLIDATION' && (
        <GlassCard className="p-4 sm:p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black uppercase tracking-widest italic">Multi-Entity Consolidation</h3>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black uppercase">Consolidated FY 2026</span>
          </div>
          <div className="table-wrap">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity / Branch</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expenses</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Profit</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Eliminations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5 text-xs">
                {[
                  { name: 'HQ - North America', rev: 2500000, exp: 1200000, profit: 1300000, elim: 0 },
                  { name: 'Branch - EMEA', rev: 1200000, exp: 800000, profit: 400000, elim: 50000 },
                  { name: 'Branch - APAC', rev: 800000, exp: 600000, profit: 200000, elim: 20000 },
                  { name: 'Inter-company Eliminations', rev: -70000, exp: -70000, profit: 0, elim: 0 },
                ].map((entity, i) => (
                  <tr key={i} className={entity.name.includes('Eliminations') ? 'bg-slate-50 dark:bg-white/5 font-black' : ''}>
                    <td className="py-4 font-black uppercase">{entity.name}</td>
                    <td className="py-4 font-black italic">${entity.rev.toLocaleString()}</td>
                    <td className="py-4 font-black italic text-rose-500">${entity.exp.toLocaleString()}</td>
                    <td className="py-4 font-black italic text-emerald-500">${entity.profit.toLocaleString()}</td>
                    <td className="py-4 text-slate-400">${entity.elim.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 dark:border-white/10 font-black">
                  <td className="py-6 uppercase tracking-widest text-lg">Consolidated Total</td>
                  <td className="py-6 italic text-xl">$4,430,000</td>
                  <td className="py-6 italic text-xl text-rose-500">$2,530,000</td>
                  <td className="py-6 italic text-xl text-emerald-500">$1,900,000</td>
                  <td className="py-6"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </GlassCard>
      )}

      {activeSubTab === 'TAX_REPORTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <GlassCard className="!p-10 border-none bg-[#0047cc]/5 dark:bg-white/[0.02]">
              <div className="flex justify-between items-center mb-10">
                 <h4 className="text-sm font-black uppercase tracking-tighter italic flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[#0047cc] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">???</span>
                    VAT/GST Reconciliation Registry
                 </h4>
                 <span className="text-[9px] font-black text-[#0047cc] uppercase tracking-widest bg-[#0047cc]/10 px-3 py-1 rounded-full animate-pulse">Live Sync</span>
              </div>
              <div className="space-y-6">
                 <div className="flex justify-between items-center py-5 border-b border-white/5 group hover:bg-white/[0.02] transition-all px-4 rounded-xl">
                    <div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Output VAT (Sales)</span>
                       <p className="text-[9px] text-emerald-500 font-bold uppercase mt-1">Verified Revenue Streams</p>
                    </div>
                    <span className="text-lg font-black italic text-emerald-500 tracking-tighter">$426,075.00</span>
                 </div>
                 <div className="flex justify-between items-center py-5 border-b border-white/5 group hover:bg-white/[0.02] transition-all px-4 rounded-xl">
                    <div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Input VAT (Direct Costs)</span>
                       <p className="text-[9px] text-rose-400 font-bold uppercase mt-1">Authorized Deductions</p>
                    </div>
                    <span className="text-lg font-black italic text-rose-500 tracking-tighter">($126,200.00)</span>
                 </div>
                 <div className="flex justify-between items-center pt-8 px-4">
                    <span className="text-sm font-black uppercase italic tracking-widest">Consolidated Net Payable</span>
                    <div className="text-right">
                       <span className="text-3xl font-black text-[#0047cc] tracking-tighter italic decoration-wavy decoration-1 underline underline-offset-8 decoration-blue-500/30">$299,875.00</span>
                    </div>
                 </div>
              </div>
           </GlassCard>
           
           <GlassCard className="!p-10 flex flex-col justify-center items-center text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-emerald-500/10 transition-all" />
              <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-[32px] flex items-center justify-center text-4xl mb-8 text-emerald-500 border border-emerald-500/20 shadow-xl group-hover:scale-110 transition-transform">
                 ???
              </div>
              <h4 className="text-base font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Institutional Compliance Engine</h4>
              <p className="text-3xl font-black text-emerald-500 mt-4 tracking-tighter uppercase italic drop-shadow-sm">Audit Prepared</p>
              <div className="mt-8 flex gap-4">
                 <div className="px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Security Score</p>
                    <p className="text-sm font-black text-white">98.4%</p>
                 </div>
                 <div className="px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Health Index</p>
                    <p className="text-sm font-black text-emerald-500">Perfect</p>
                 </div>
              </div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-10 opacity-60">Verified by Global Compliance AI Protocol 14-X</p>
           </GlassCard>
        </div>
      )}

      {activeSubTab !== 'BALANCE_SHEET' && activeSubTab !== 'INCOME_STATEMENT' && activeSubTab !== 'CONSOLIDATION' && activeSubTab !== 'TAX_REPORTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { id: 'BALANCE_SHEET', title: 'Asset & Equity Matrix', icon: '??', desc: 'Real-time structural snapshot of institutional net worth.', color: 'blue' },
            { id: 'INCOME_STATEMENT', title: 'Revenue Momentum', icon: '??', desc: 'P&L velocity analysis across operational cycles.', color: 'purple' },
            { id: 'CONSOLIDATION', title: 'Global Settlement', icon: '??', desc: 'Multi-entity financial aggregation and eliminations.', color: 'emerald' },
            { id: 'TAX_REPORTS', title: 'Compliance Engine', icon: '???', desc: 'Sovereign tax obligations and audit readiness metrics.', color: 'amber' },
          ].map((report, i) => (
            <GlassCard key={i} onClick={() => setActiveSubTab(report.id)} className="!p-8 hover:border-[var(--brand-primary)]/30 transition-all cursor-pointer group hover:bg-white/[0.04] flex flex-col h-full shadow-lg">
              <div className={`w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-[#0047cc] transition-all transform group-hover:scale-110 group-hover:rotate-6 shadow-inner`}>
                {report.icon}
              </div>
              <h4 className="text-sm font-black uppercase tracking-tighter mb-3 group-hover:text-[#0047cc] transition-colors">{report.title}</h4>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed mb-8 flex-1 uppercase tracking-tight opacity-80">{report.desc}</p>
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <span className="text-[9px] font-black text-[#0047cc] uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                  Access Intelligence
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );

  const renderFixedAssets = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Asset Valuation (Gross)', value: '$92,000', accent: '#0ea5e9', trend: 'Audit Verified', trendColor: 'text-emerald-500' },
          { label: 'Accumulated Depreciation', value: '$22,500', accent: '#f59e0b', trend: 'Fiscal Period', trendColor: 'text-amber-500' },
          { label: 'Net Book Value', value: '$69,500', accent: '#0047cc', trend: 'Equities', trendColor: 'text-[#0047cc]' },
        ].map((stat, i) => (
          <GlassCard key={i} accentColor={stat.accent} className="!p-5 hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</h3>
              <span className={`text-[9px] font-black ${stat.trendColor} uppercase`}>{stat.trend}</span>
            </div>
            <div>
              <p className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white group-hover:text-[var(--brand-primary)] transition-colors">
                {stat.value}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="!p-8 border-none bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Fixed Asset Registry</h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
               Institutional Capital Assets � Depreciable Registry
            </p>
          </div>
          <button className="px-6 py-3 bg-[var(--brand-primary)] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3" strokeLinecap="round"/></svg>
            Add Asset
          </button>
        </div>
        <div className="table-wrap">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Entity</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Purchase Value</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Book Value</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Depr. Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {[
                { name: 'MacBook Pro M3 Max (10 units)', cat: 'IT Equipment', value: 35000, book: 28000, dep: 'Straight Line', pct: 80 },
                { name: 'Office Furniture - HQ', cat: 'Furniture', value: 12000, book: 9500, dep: 'Reducing Balance', pct: 79 },
                { name: 'Company Vehicle - Tesla Model 3', cat: 'Vehicles', value: 45000, book: 38000, dep: 'Straight Line', pct: 84 },
              ].map((asset, i) => (
                <tr key={i} className="hover:bg-white/[0.04] transition-all group cursor-pointer">
                  <td className="py-6 font-black uppercase text-xs text-slate-900 dark:text-white group-hover:text-[#0047cc] transition-colors">{asset.name}</td>
                  <td className="py-6">
                     <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400">{asset.cat}</span>
                  </td>
                  <td className="py-6 font-black italic text-sm text-slate-400">${asset.value.toLocaleString()}</td>
                  <td className="py-6">
                     <div className="flex flex-col gap-2">
                        <span className="text-sm font-black italic text-[#0047cc]">${asset.book.toLocaleString()}</span>
                        <div className="h-1 w-24 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-[#0047cc] rounded-full" style={{ width: `${asset.pct}%` }} />
                        </div>
                     </div>
                  </td>
                  <td className="py-6 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">{asset.dep}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard className="!p-8 bg-white dark:bg-[#0d0a1a] shadow-xl">
          <h3 className="text-lg font-black uppercase tracking-tighter italic mb-10 border-b border-white/5 pb-4 flex items-center gap-3">
             <span className="w-2 h-2 rounded-full bg-[#0047cc] animate-pulse" />
             Fiscal & Temporal Control center
          </h3>
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Start Interval</label>
                <div className="relative group">
                   <select className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-xs font-bold focus:outline-none focus:border-[#0047cc]/50 transition-all appearance-none cursor-pointer group-hover:bg-white/[0.08]">
                     <option>January</option>
                     <option>April</option>
                     <option>July</option>
                   </select>
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                   </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Maturity Interval</label>
                <div className="relative group">
                   <select className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-xs font-bold focus:outline-none focus:border-[#0047cc]/50 transition-all appearance-none cursor-pointer group-hover:bg-white/[0.08]">
                     <option>December</option>
                     <option>March</option>
                     <option>June</option>
                   </select>
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                   </div>
                </div>
              </div>
            </div>
            <button className="w-full py-5 border-2 border-slate-200 dark:border-white/10 rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-[#0047cc] hover:border-[#0047cc]/30 hover:bg-[#0047cc]/5 transition-all flex items-center justify-center gap-3 group">
               Verify & Close Current Period
               <svg className="w-4 h-4 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </GlassCard>

        <GlassCard className="!p-8 border-none bg-slate-50/50 dark:bg-white/[0.02]">
          <h3 className="text-lg font-black uppercase tracking-tighter italic mb-10 border-b border-white/5 pb-4">Sovereign Tax Protocols</h3>
          <div className="space-y-4">
            {[
              { name: 'Standard VAT', rate: '15%', type: 'Direct Sales', accent: 'emerald' },
              { name: 'Corporate Income Tax', rate: '25%', type: 'Institutional Income', accent: 'purple' },
              { name: 'Withholding Tax', rate: '5%', type: 'Services Rendered', accent: 'amber' },
            ].map((tax, i) => (
              <div key={i} className="flex justify-between items-center p-6 bg-white dark:bg-white/5 rounded-[28px] border border-slate-100 dark:border-white/5 hover:border-[#0047cc]/30 transition-all group cursor-pointer shadow-sm">
                <div className="flex items-center gap-4">
                   <div className={`w-2 h-10 rounded-full bg-${tax.accent}-500/20 group-hover:bg-${tax.accent}-500 transition-colors`} />
                   <div>
                     <h4 className="text-xs font-black uppercase tracking-tight group-hover:text-[#0047cc] transition-colors">{tax.name}</h4>
                     <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{tax.type}</p>
                   </div>
                </div>
                <span className="text-xl font-black italic text-[#0047cc] tracking-tighter">{tax.rate}</span>
              </div>
            ))}
            <button className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[28px] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.03] transition-all mt-4">Initialize Protocol</button>
          </div>
        </GlassCard>
      </div>
    </div>
  );

  const renderBudgeting = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <GlassCard className="lg:col-span-8 !p-10 border-none bg-white dark:bg-white/[0.01]">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic">Budget vs Actual Velocity</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-[#0047cc] animate-pulse" />
                 Fiscal Period 2026 � Real-time Spend Index
              </p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#0047cc]" />
                  <span className="text-[9px] font-black text-slate-400 uppercase">Actual Expenditure</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-dashed border-slate-400" />
                  <span className="text-[9px] font-black text-slate-400 uppercase">Allocated Budget</span>
               </div>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={[
                { name: 'Jan', budget: 400000, actual: 380000 },
                { name: 'Feb', budget: 400000, actual: 410000 },
                { name: 'Mar', budget: 450000, actual: 480000 },
                { name: 'Apr', budget: 450000, actual: 440000 },
                { name: 'May', budget: 500000, actual: 520000 },
                { name: 'Jun', budget: 500000, actual: 490000 },
              ]}>
                <defs>
                   <filter id="shadow" height="200%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                      <feOffset dx="0" dy="4" result="offsetblur" />
                      <feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
                      <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                   </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} />
                <Tooltip 
                   cursor={{stroke: 'rgba(0,71,204,0.1)', strokeWidth: 30}}
                   contentStyle={{ backgroundColor: '#0f1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} 
                />
                <Line type="monotone" dataKey="budget" stroke="#64748b" strokeDasharray="8 8" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="actual" stroke="#0047cc" strokeWidth={4} dot={{ r: 6, fill: '#0047cc', strokeWidth: 0 }} activeDot={{ r: 8, strokeWidth: 0 }} filter="url(#shadow)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-4 !p-8 bg-[#0047cc]/5 dark:bg-white/[0.02]">
          <h3 className="text-lg font-black uppercase tracking-tighter italic mb-10">Departmental Variance</h3>
          <div className="space-y-6">
            {[
              { dept: 'Marketing Operations', variance: '+12.4%', status: 'OVER', pct: 112, color: 'rose' },
              { dept: 'Strategic Engineering', variance: '-4.2%', status: 'UNDER', pct: 95, color: 'emerald' },
              { dept: 'Research & Intelligence', variance: '+2.1%', status: 'OVER', pct: 102, color: 'amber' },
              { dept: 'Human Capital', variance: '-8.5%', status: 'UNDER', pct: 91, color: 'emerald' },
            ].map((v, i) => (
              <div key={i} className="space-y-3 group cursor-pointer">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400 group-hover:text-white transition-colors">{v.dept}</span>
                  <span className={`italic ${v.status === 'OVER' ? 'text-rose-500' : 'text-emerald-500'}`}>{v.variance}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                   <div className={`h-full bg-${v.color}-500 transition-all duration-1000 shadow-[0_0_8px_rgba(255,255,255,0.1)]`} style={{ width: `${Math.min(v.pct, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-5 border-2 border-[#0047cc]/20 text-[#0047cc] rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em] mt-10 hover:bg-[#0047cc] hover:text-white transition-all transform active:scale-95 shadow-xl">Re-allocate Surplus</button>
        </GlassCard>
      </div>
    </div>
  );

  const renderAuditCompliance = () => (
    <div className="space-y-6">
      <GlassCard className="!p-8 border-none bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="flex justify-between items-center mb-10">
          <div>
             <h3 className="text-xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white underline decoration-4 decoration-[#0047cc]/10 underline-offset-8">Institutional Audit Registry</h3>
             <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-4 flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0047cc] animate-pulse" />
                Security Access Logs � Immutable Hash Chains Active
             </p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-white dark:bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#0047cc] shadow-xl hover:bg-[#0047cc] hover:text-white transition-all transform active:scale-95">Download Protocol</button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="pb-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Temporal Signature</th>
                <th className="pb-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Authorized Identity</th>
                <th className="pb-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Execution Protocol</th>
                <th className="pb-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Target Resource</th>
                <th className="pb-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Access Point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {[
                { time: '2026-04-03 10:45', user: 'admin@HRcopilot.com', action: 'POST_JOURNAL', resource: 'JE-1024', ip: '192.168.1.45', alert: false },
                { time: '2026-04-03 09:12', user: 'finance_mgr@HRcopilot.com', action: 'VOID_INVOICE', resource: 'INV-002', ip: '192.168.1.12', alert: true },
                { time: '2026-04-02 16:30', user: 'system_core', action: 'AUTO_RECONCILE', resource: 'BANK_CHASE_01', ip: 'Internal-Node', alert: false },
              ].map((log, i) => (
                <tr key={i} className="hover:bg-white/[0.04] transition-all group cursor-pointer group/row">
                  <td className="py-8">
                     <p className="text-xs font-bold text-slate-400 font-mono group-hover/row:text-[#0047cc] transition-colors">{log.time}</p>
                  </td>
                  <td className="py-8">
                     <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/5 border border-white/5 flex items-center justify-center text-xs group-hover/row:border-[#0047cc]/50 transition-all">
                           ??
                        </div>
                        <p className="text-xs font-black tracking-tight text-slate-900 dark:text-white uppercase">{log.user}</p>
                     </div>
                  </td>
                  <td className="py-8">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] ${
                      log.alert ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/10'
                    }`}>
                       {log.action}
                    </span>
                  </td>
                  <td className="py-8">
                     <p className="text-xs font-black uppercase text-slate-500 tracking-widest">{log.resource}</p>
                  </td>
                  <td className="py-8 text-right">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono group-hover/row:text-white">{log.ip}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-10 py-6 border-t border-white/5 flex justify-center">
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Full integrity verification completed via Blockchain-X Ledger Sync</p>
        </div>
      </GlassCard>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'DASHBOARD': return renderDashboard();
      case 'GENERAL_LEDGER': return renderGeneralLedger();
      case 'ACCOUNTS_RECEIVABLE': return renderAccountsReceivable();
      case 'ACCOUNTS_PAYABLE': return renderAccountsPayable();
      case 'CASH_BANKING': return renderCashBanking();
      case 'REPORTING': return renderReporting();
      case 'BUDGETING': return renderBudgeting();
      case 'AUDIT_COMPLIANCE': return renderAuditCompliance();
      case 'FIXED_ASSETS': return renderFixedAssets();
      case 'SETTINGS': return renderSettings();
      default: return renderDashboard();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Accounting & <span className="text-[#0047cc]">Finance</span></h2>
          <p className="text-slate-500 text-[10px] sm:text-sm font-bold uppercase tracking-widest">AI-Driven Strategic Fiscal Management</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 hover:text-[var(--brand-primary)] transition-all flex justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2"/></svg>
          </button>
          <button className="flex-1 sm:flex-none p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 hover:text-[var(--brand-primary)] transition-all flex justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" strokeWidth="2"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2"/></svg>
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

      {/* Journal Entry Modal (Global Access) */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-3xl p-0 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 sm:p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center sticky top-0 bg-white dark:bg-[#0d0a1a] z-10">
              <h3 className="text-xl font-black uppercase tracking-tighter italic">New Journal Entry</h3>
              <button onClick={() => setIsEntryModalOpen(false)} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    required
                    value={newEntry.description}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                    className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#e0f2fe]0/20"
                    placeholder="e.g. Monthly Rent Payment"
                  />
                  <button 
                    type="button"
                    onClick={handleAiCategorize}
                    className="px-4 bg-[#e0f2fe]0/10 text-[#e0f2fe]0 border border-[#e0f2fe]0/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#e0f2fe]0/20 transition-all"
                  >
                    AI Suggest
                  </button>
                </div>
                {aiSuggestion && (
                  <div className="p-3 bg-[#e0f2fe]0/5 border border-[#e0f2fe]0/10 rounded-xl flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                    <div className="text-[10px]">
                      <span className="font-black text-[#e0f2fe]0 uppercase">AI Suggestion:</span>
                      <span className="ml-2 text-slate-400 font-bold uppercase tracking-tight">{aiSuggestion.accountName} ({Math.round(aiSuggestion.confidence * 100)}% confidence)</span>
                    </div>
                    <button 
                      type="button"
                      onClick={applyAiSuggestion}
                      className="text-[9px] font-black text-[#e0f2fe]0 uppercase hover:underline"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Lines</label>
                  <button 
                    type="button"
                    onClick={handleAddLine}
                    className="text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-widest hover:underline"
                  >
                    + Add Line
                  </button>
                </div>

                {newEntry.lines.map((line, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-5">
                      <select 
                        required
                        value={line.accountId}
                        onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs focus:outline-none"
                      >
                        <option value="">Select Account</option>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <input 
                        type="number" 
                        placeholder="Debit"
                        value={line.debit || ''}
                        onChange={(e) => handleLineChange(idx, 'debit', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="col-span-3">
                      <input 
                        type="number" 
                        placeholder="Credit"
                        value={line.credit || ''}
                        onChange={(e) => handleLineChange(idx, 'credit', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="col-span-1">
                      <button 
                        type="button"
                        onClick={() => setNewEntry(prev => ({ ...prev, lines: prev.lines.filter((_, i) => i !== idx) }))}
                        className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl flex justify-between items-center sticky bottom-0 z-10">
                <div className="flex gap-8">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Debit</p>
                    <p className="text-lg font-black italic text-emerald-500">${totalDebit.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Credit</p>
                    <p className="text-lg font-black italic text-rose-500">${totalCredit.toLocaleString()}</p>
                  </div>
                </div>
                {!isBalanced && totalDebit > 0 && (
                  <div className="text-right">
                    <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Out of Balance</p>
                    <p className="text-xs font-bold text-rose-500">Difference: ${Math.abs(totalDebit - totalCredit).toLocaleString()}</p>
                  </div>
                )}
                {isBalanced && (
                  <div className="flex items-center gap-2 text-emerald-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3"/></svg>
                    <span className="text-[10px] font-black uppercase tracking-widest">Balanced</span>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsEntryModalOpen(false)}
                  className="flex-1 px-6 py-4 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!isBalanced}
                  className={`flex-1 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all ${
                    isBalanced ? 'bg-[var(--brand-primary)] shadow-lg shadow-[#e0f2fe]0/20 hover:scale-[1.02]' : 'bg-slate-300 dark:bg-white/10 cursor-not-allowed opacity-50'
                  }`}
                >
                  Post Entry
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
      {isInvoiceModalOpen && renderInvoiceModal()}
    </div>
  );
};

export default Finance;




