import React, { useState, useEffect } from 'react';
import { useCurrency } from '../src/context/CurrencyContext';
import { db } from '../mockDb';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from '../mockDb';
import GlassCard from '../components/GlassCard';
import { ICONS } from '../constants';
import { Sparkles } from 'lucide-react';

const Invoices: React.FC = () => {
  const { symbol, fmt } = useCurrency();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    invoiceNumber: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
    clientName: '',
    clientEmail: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    notes: '',
    template: 'PROFESSIONAL'
  });

  useEffect(() => {
    const q = query(collection(db, 'invoices'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddItem = () => {
    setNewInvoice(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...newInvoice.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setNewInvoice(prev => ({ ...prev, items: updatedItems }));
  };

  const subtotal = newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const tax = subtotal * 0.15; // 15% tax
  const total = subtotal + tax;

  const handleSubmitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'invoices'), {
        ...newInvoice,
        totalAmount: total,
        status: 'SENT',
        createdAt: serverTimestamp()
      });
      setIsBuilderOpen(false);
      setNewInvoice({
        invoiceNumber: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
        clientName: '',
        clientEmail: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [{ description: '', quantity: 1, unitPrice: 0 }],
        notes: '',
        template: 'PROFESSIONAL'
      });
    } catch (error) {
      console.error("Error adding invoice:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic">Invoices & Receipts</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-bold uppercase tracking-widest">Enterprise Billing & Revenue Management</p>
        </div>
        <button 
          onClick={() => setIsBuilderOpen(true)}
          className="w-full sm:w-auto px-6 py-3 bg-[var(--brand-primary)] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#e0f2fe]0/20 hover:scale-105 transition-transform"
        >
          Create New Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-4 sm:p-8">
          <h3 className="text-lg font-black uppercase tracking-widest italic mb-6 sm:mb-8">Billing History</h3>
          <div className="table-wrap">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice #</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 text-xs font-black text-[var(--brand-primary)]">{inv.invoiceNumber}</td>
                    <td className="py-4 text-xs font-bold uppercase tracking-tight">{inv.clientName}</td>
                    <td className="py-4 text-xs font-black italic">{fmt(inv.totalAmount ?? 0)}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                        inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 
                        inv.status === 'SENT' ? 'bg-blue-500/10 text-blue-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 text-xs font-bold text-slate-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Revenue Summary</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Outstanding</p>
                <p className="text-xl font-black italic text-amber-500">{fmt(124_500, { decimals: 2 })}</p>
              </div>
              <div className="flex justify-between items-end">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Collected (MTD)</p>
                <p className="text-xl font-black italic text-emerald-500">{fmt(482_100, { decimals: 2 })}</p>
              </div>
              <div className="flex justify-between items-end">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Overdue</p>
                <p className="text-xl font-black italic text-rose-500">{fmt(12_400, { decimals: 2 })}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 bg-[var(--brand-primary)]/5 border-[var(--brand-primary)]/20">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles size={20} className="text-[var(--brand-primary)]" />
              <p className="text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-widest">AI Smart Billing</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Based on client history, <span className="font-black text-slate-900 dark:text-white">Acme Corp</span> usually pays within 4 days of receiving an invoice.
            </p>
            <button className="w-full py-3 bg-[var(--brand-primary)] text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-[#e0f2fe]0/20">
              Schedule Auto-Reminders
            </button>
          </GlassCard>
        </div>
      </div>

      {isBuilderOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-6xl h-[90vh] flex overflow-hidden">
            {/* Form Side */}
            <div className="w-1/2 p-8 overflow-y-auto border-r border-slate-100 dark:border-white/5">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black uppercase tracking-tighter italic">Invoice Builder</h3>
                <button onClick={() => setIsBuilderOpen(false)} className="text-slate-400 hover:text-white sm:hidden">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg>
                </button>
              </div>

              <form onSubmit={handleSubmitInvoice} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice #</label>
                    <input type="text" readOnly value={newInvoice.invoiceNumber} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Name</label>
                    <input type="text" required value={newInvoice.clientName} onChange={(e) => setNewInvoice(prev => ({ ...prev, clientName: e.target.value }))} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                    <input type="date" value={newInvoice.date} onChange={(e) => setNewInvoice(prev => ({ ...prev, date: e.target.value }))} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</label>
                    <input type="date" value={newInvoice.dueDate} onChange={(e) => setNewInvoice(prev => ({ ...prev, dueDate: e.target.value }))} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs focus:outline-none" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Line Items</label>
                    <button type="button" onClick={handleAddItem} className="text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-widest">+ Add Item</button>
                  </div>
                  {newInvoice.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3">
                      <div className="col-span-6">
                        <input type="text" placeholder="Description" value={item.description} onChange={(e) => handleItemChange(idx, 'description', e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs focus:outline-none" />
                      </div>
                      <div className="col-span-2">
                        <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs focus:outline-none" />
                      </div>
                      <div className="col-span-4">
                        <input type="number" placeholder="Price" value={item.unitPrice || ''} onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs focus:outline-none" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes / Payment Instructions</label>
                  <textarea value={newInvoice.notes} onChange={(e) => setNewInvoice(prev => ({ ...prev, notes: e.target.value }))} className="w-full h-24 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-xs focus:outline-none" />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsBuilderOpen(false)} className="flex-1 px-6 py-4 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500">Cancel</button>
                  <button type="submit" className="flex-1 px-6 py-4 bg-[var(--brand-primary)] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#e0f2fe]0/20">Send Invoice</button>
                </div>
              </form>
            </div>

            {/* Preview Side */}
            <div className="w-1/2 bg-slate-50 dark:bg-white/[0.02] p-12 overflow-y-auto hidden md:block relative">
              <button onClick={() => setIsBuilderOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg>
              </button>
              
              <div className="bg-white dark:bg-[#0d0a1a] p-10 rounded-[32px] shadow-2xl border border-slate-100 dark:border-white/5 min-h-full">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h1 className="text-2xl font-black tracking-tighter italic text-[var(--brand-primary)]">HRcopilot</h1>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Enterprise Solutions</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-black uppercase tracking-widest italic">Invoice</h2>
                    <p className="text-[10px] font-bold text-slate-500">{newInvoice.invoiceNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-12">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Bill To</p>
                    <p className="text-xs font-black uppercase tracking-tight">{newInvoice.clientName || 'Client Name'}</p>
                    <p className="text-[10px] text-slate-500">{newInvoice.clientEmail || 'client@example.com'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Details</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Date: {newInvoice.date}</p>
                    <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">Due: {newInvoice.dueDate}</p>
                  </div>
                </div>

                <table className="w-full mb-12">
                  <thead>
                    <tr className="border-b-2 border-slate-900 dark:border-white/10">
                      <th className="py-3 text-left text-[9px] font-black uppercase tracking-widest">Description</th>
                      <th className="py-3 text-center text-[9px] font-black uppercase tracking-widest">Qty</th>
                      <th className="py-3 text-right text-[9px] font-black uppercase tracking-widest">Price</th>
                      <th className="py-3 text-right text-[9px] font-black uppercase tracking-widest">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {newInvoice.items.map((item, i) => (
                      <tr key={i}>
                        <td className="py-4 text-[10px] font-bold uppercase tracking-tight">{item.description || 'Item Description'}</td>
                        <td className="py-4 text-center text-[10px] font-bold">{item.quantity}</td>
                        <td className="py-4 text-right text-[10px] font-bold">{fmt(item.unitPrice ?? 0)}</td>
                        <td className="py-4 text-right text-[10px] font-black">{fmt((item.quantity ?? 0) * (item.unitPrice ?? 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end">
                  <div className="w-48 space-y-3">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span>{fmt(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <span>Tax (15%)</span>
                      <span>{fmt(tax)}</span>
                    </div>
                    <div className="pt-3 border-t border-slate-900 dark:border-white/10 flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest">Total</span>
                      <span className="text-lg font-black italic text-[var(--brand-primary)]">{fmt(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-20 pt-8 border-t border-slate-100 dark:border-white/5">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Notes</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{newInvoice.notes || 'Thank you for your business.'}</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default Invoices;



