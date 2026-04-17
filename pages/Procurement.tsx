import React, { useState, useEffect } from 'react';
import { db } from '../mockDb';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from '../mockDb';
import GlassCard from '../components/GlassCard';
import { ICONS } from '../constants';
import { extractContractTerms } from '../services/geminiService';
import { DEMO_PURCHASE_ORDERS, DEMO_REQUISITIONS, DEMO_VENDORS } from '../demoData';

const Procurement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('REQUISITIONS');
  const [activeSubTab, setActiveSubTab] = useState('PURCHASE_REQUESTS');
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>(DEMO_PURCHASE_ORDERS);
  const [requisitions, setRequisitions] = useState<any[]>(DEMO_REQUISITIONS);
  const [vendors, setVendors] = useState<any[]>(DEMO_VENDORS);
  const [loading, setLoading] = useState(true);
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [isPrModalOpen, setIsPrModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractText, setContractText] = useState('');
  const [extractedTerms, setExtractedTerms] = useState<any>(null);
  const [newPo, setNewPo] = useState({
    poNumber: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
    supplierName: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }]
  });

  const handleExtractContract = async () => {
    if (!contractText) return;
    const terms = await extractContractTerms(contractText);
    setExtractedTerms(terms);
  };

  const handleAddPoItem = () => {
    setNewPo(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const handlePoItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...newPo.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setNewPo(prev => ({ ...prev, items: updatedItems }));
  };

  const totalAmount = newPo.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const handleSubmitPo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'purchase_orders'), {
        ...newPo,
        date: new Date().toISOString(),
        totalAmount,
        status: 'PENDING',
        createdAt: serverTimestamp()
      });
      setIsPoModalOpen(false);
      setNewPo({
        poNumber: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
        supplierName: '',
        items: [{ description: '', quantity: 1, unitPrice: 0 }]
      });
    } catch (error) {
      console.error("Error adding PO:", error);
    }
  };

  const TABS = [
    { id: 'REQUISITIONS', label: 'Requisitions', subTabs: ['PURCHASE_REQUESTS', 'APPROVAL_WORKFLOW', 'MY_REQUESTS'] },
    { id: 'SOURCING', label: 'Sourcing & Tendering', subTabs: ['RFQ', 'VENDOR_RESPONSES', 'BID_EVALUATION'] },
    { id: 'PURCHASE_ORDERS', label: 'Purchase Orders', subTabs: ['ALL_ORDERS', 'RECURRING_ORDERS', 'CHANGE_ORDERS'] },
    { id: 'VENDORS', label: 'Vendor Management', subTabs: ['DIRECTORY', 'COMPLIANCE', 'PERFORMANCE'] },
    { id: 'RECEIPTING', label: 'Receipting', subTabs: ['GRN', 'SERVICE_ENTRY', 'RETURNS'] },
    { id: 'AP_INTEGRATION', label: 'AP Integration', subTabs: ['INVOICE_MATCHING', 'DEBIT_MEMOS', 'PAYMENT_STATUS'] },
    { id: 'CONTRACTS', label: 'Contracts & Catalogs', subTabs: ['MSA_REPOSITORY', 'ITEM_CATALOG'] },
    { id: 'ANALYTICS', label: 'Analytics', subTabs: ['SPEND_ANALYSIS', 'SAVINGS_TRACKER', 'LEAD_TIMES'] },
  ];

  useEffect(() => {
    const qPo = query(collection(db, 'purchase_orders'), orderBy('date', 'desc'));
    const unsubscribePo = onSnapshot(qPo, (snapshot) => {
      setPurchaseOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qPr = query(collection(db, 'requisitions'), orderBy('createdAt', 'desc'));
    const unsubscribePr = onSnapshot(qPr, (snapshot) => {
      setRequisitions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const qVendors = query(collection(db, 'vendors'));
    const unsubscribeVendors = onSnapshot(qVendors, (snapshot) => {
      setVendors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribePo();
      unsubscribePr();
      unsubscribeVendors();
    };
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const tab = TABS.find(t => t.id === tabId);
    if (tab && tab.subTabs.length > 0) {
      setActiveSubTab(tab.subTabs[0]);
    }
  };

  const renderRequisitions = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 bg-blue-500/5 border-blue-500/20">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Pending PRs</p>
          <h4 className="text-2xl font-black italic">12</h4>
          <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Awaiting Manager Review</p>
        </GlassCard>
        <GlassCard className="p-6 bg-amber-500/5 border-amber-500/20">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Urgent Requests</p>
          <h4 className="text-2xl font-black italic">4</h4>
          <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">High Priority Flagged</p>
        </GlassCard>
        <GlassCard className="p-6 bg-emerald-500/5 border-emerald-500/20">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Approved Today</p>
          <h4 className="text-2xl font-black italic">8</h4>
          <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Converted to POs</p>
        </GlassCard>
      </div>

      <GlassCard className="p-4 sm:p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-lg font-black uppercase tracking-widest italic">Purchase Requests</h3>
          <button 
            onClick={() => setIsPrModalOpen(true)}
            className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-xl font-black uppercase tracking-widest text-[10px]"
          >
            New Requisition
          </button>
        </div>
        <div className="table-wrap">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">PR #</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Requester</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Amount</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5 text-xs">
              {DEMO_REQUISITIONS.map((pr) => (
                <tr key={pr.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-4 font-black text-[var(--brand-primary)]">{pr.id}</td>
                  <td className="py-4 font-bold uppercase">{pr.requesterName}</td>
                  <td className="py-4 font-bold text-slate-500 uppercase">{pr.department}</td>
                  <td className="py-4 font-black italic">₦{pr.estimatedAmount.toLocaleString()}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                      pr.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' : 
                      pr.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                    }`}>
                      {pr.status}
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

  const renderSourcing = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-4 sm:p-8">
          <h3 className="text-lg font-black uppercase tracking-widest italic mb-6">Active RFQs</h3>
          <div className="space-y-4">
            {[
              { title: 'Laptops for Engineering', vendors: 5, deadline: '2 days left', status: 'OPEN' },
              { title: 'Office Furniture HQ', vendors: 3, deadline: 'Expired', status: 'EVALUATING' },
              { title: 'Cloud Infrastructure', vendors: 4, deadline: '1 week left', status: 'OPEN' },
            ].map((rfq, i) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tight">{rfq.title}</h4>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">{rfq.vendors} Vendors Invited � {rfq.deadline}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${
                  rfq.status === 'OPEN' ? 'bg-blue-500/10 text-blue-500' : 'bg-[#e0f2fe]0/10 text-[#e0f2fe]0'
                }`}>
                  {rfq.status}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-8">
          <h3 className="text-lg font-black uppercase tracking-widest italic mb-6">Bid Evaluation Scoring</h3>
          <div className="space-y-6">
            <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">Select a vendor based on weighted criteria: Price (40%), Quality (30%), Delivery (20%), Compliance (10%).</p>
            <div className="space-y-4">
              {[
                { name: 'Vendor A', score: 88, price: '$12k' },
                { name: 'Vendor B', score: 92, price: '$13.5k' },
                { name: 'Vendor C', score: 75, price: '$11k' },
              ].map((bid, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                    <span>{bid.name} ({bid.price})</span>
                    <span className="text-[var(--brand-primary)]">{bid.score}/100</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--brand-primary)]" style={{ width: `${bid.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );

  const renderPurchaseOrders = () => (
    <div className="space-y-6">
      <GlassCard className="p-4 sm:p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-lg font-black uppercase tracking-widest italic">All Purchase Orders</h3>
          <button 
            onClick={() => setIsPoModalOpen(true)}
            className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-xl font-black uppercase tracking-widest text-[10px]"
          >
            Create PO
          </button>
        </div>
        <div className="table-wrap">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">PO #</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5 text-xs">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-4 font-black text-[var(--brand-primary)]">{po.poNumber}</td>
                  <td className="py-4 font-bold uppercase">{po.supplierName}</td>
                  <td className="py-4 font-black italic">${po.totalAmount?.toLocaleString()}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                      po.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' : 
                      po.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                    }`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: '60%' }} />
                      </div>
                      <span className="text-[8px] font-black text-slate-400 uppercase">60%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );

  const renderVendors = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {DEMO_VENDORS.map((s, idx) => (
          <GlassCard key={idx} className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--brand-primary)]/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-[var(--brand-primary)]/10 transition-colors" />
            <h4 className="text-xs font-black uppercase tracking-tight mb-1">{s.name}</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Spend: ₦{(s.totalSpend / 1000000).toFixed(1)}M</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                <span className="text-slate-400">Score</span>
                <span className={s.rating > 4 ? 'text-emerald-500' : 'text-amber-500'}>{Math.round(s.rating * 20)}%</span>
              </div>
              <div className="h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${s.rating > 4 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${s.rating * 20}%` }} />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );

  const renderReceipting = () => (
    <div className="space-y-6">
      <GlassCard className="p-4 sm:p-8">
        <h3 className="text-lg font-black uppercase tracking-widest italic mb-8">Goods Received Notes (GRN)</h3>
        <div className="table-wrap">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">GRN #</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">PO Reference</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Items Received</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Condition</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5 text-xs">
              {[
                { id: 'GRN-8801', po: 'PO-1234', items: '10x MacBook Pro', condition: 'EXCELLENT', status: 'VERIFIED' },
                { id: 'GRN-8802', po: 'PO-1235', items: '5x Office Chairs', condition: 'DAMAGED (1)', status: 'DISCREPANCY' },
                { id: 'GRN-8803', po: 'PO-1236', items: '1x Server Rack', condition: 'GOOD', status: 'VERIFIED' },
              ].map((grn) => (
                <tr key={grn.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="py-4 font-black">{grn.id}</td>
                  <td className="py-4 font-bold text-[var(--brand-primary)]">{grn.po}</td>
                  <td className="py-4 font-bold uppercase">{grn.items}</td>
                  <td className={`py-4 font-black ${grn.condition.includes('DAMAGED') ? 'text-rose-500' : 'text-slate-500'}`}>{grn.condition}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                      grn.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {grn.status}
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

  const renderAPIntegration = () => (
    <div className="space-y-6">
      <GlassCard className="p-4 sm:p-8">
        <h3 className="text-lg font-black uppercase tracking-widest italic mb-8">Three-Way Match Verification</h3>
        <div className="space-y-4">
          {[
            { invoice: 'INV-9901', po: 'PO-1234', grn: 'GRN-8801', amount: '$35,000', match: true },
            { invoice: 'INV-9902', po: 'PO-1235', grn: 'GRN-8802', amount: '$1,200', match: false },
          ].map((item, i) => (
            <div key={i} className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">PO</p>
                    <p className="text-[10px] font-black text-blue-500">{item.po}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">GRN</p>
                    <p className="text-[10px] font-black text-[#e0f2fe]0">{item.grn}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Invoice</p>
                    <p className="text-[10px] font-black text-emerald-500">{item.invoice}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black italic">{item.amount}</p>
                  <span className={`text-[9px] font-black uppercase ${item.match ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {item.match ? '? Matched' : '? Mismatch Detected'}
                  </span>
                </div>
              </div>
              {!item.match && (
                <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-[10px] font-bold text-rose-500 uppercase">
                  Discrepancy: Invoice quantity exceeds GRN verified quantity.
                </div>
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );

  const renderContracts = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-4 sm:p-8">
          <h3 className="text-lg font-black uppercase tracking-widest italic mb-8">Master Service Agreements</h3>
          <div className="space-y-4">
            {[
              { vendor: 'Microsoft', type: 'Enterprise License', expiry: '2027-12-31', status: 'ACTIVE' },
              { vendor: 'CleanCo Services', type: 'Facility Management', expiry: '2026-06-15', status: 'RENEWAL DUE' },
            ].map((msa, i) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tight">{msa.vendor}</h4>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">{msa.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-tight">Expires: {msa.expiry}</p>
                  <span className={`text-[8px] font-black uppercase ${msa.status === 'ACTIVE' ? 'text-emerald-500' : 'text-amber-500'}`}>{msa.status}</span>
                </div>
              </div>
            ))}
            <button 
              onClick={() => setIsContractModalOpen(true)}
              className="w-full py-4 bg-[#e0f2fe]0/10 text-[#e0f2fe]0 border border-[#e0f2fe]0/20 rounded-2xl text-[10px] font-black uppercase tracking-widest"
            >
              Scan New Contract
            </button>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-8">
          <h3 className="text-lg font-black uppercase tracking-widest italic mb-8">Item Catalog</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Standard Laptop', price: '$1,200', img: '??' },
              { name: 'Ergonomic Chair', price: '$450', img: '??' },
              { name: 'Monitor 27"', price: '$300', img: '???' },
              { name: 'Wireless Mouse', price: '$45', img: '???' },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 text-center hover:border-[var(--brand-primary)]/30 transition-all cursor-pointer">
                <span className="text-2xl mb-2 block">{item.img}</span>
                <h4 className="text-[10px] font-black uppercase tracking-tight mb-1">{item.name}</h4>
                <p className="text-xs font-black italic text-[var(--brand-primary)]">{item.price}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-8">
          <h3 className="text-lg font-black uppercase tracking-widest italic mb-8">Spend Analysis by Department</h3>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Interactive Spend Visualization Loading...</p>
          </div>
        </GlassCard>
        <div className="space-y-6">
          <GlassCard id="procurement-savings-tracker" className="p-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Savings (YTD)</p>
            <h4 className="text-2xl font-black italic text-emerald-500">$142,500.00</h4>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">12% above target</p>
          </GlassCard>
          <GlassCard className="p-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Cycle Time</p>
            <h4 className="text-2xl font-black italic text-blue-500">4.2 Days</h4>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">PR to PO conversion</p>
          </GlassCard>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'REQUISITIONS': return renderRequisitions();
      case 'SOURCING': return renderSourcing();
      case 'PURCHASE_ORDERS': return renderPurchaseOrders();
      case 'VENDORS': return renderVendors();
      case 'RECEIPTING': return renderReceipting();
      case 'AP_INTEGRATION': return renderAPIntegration();
      case 'CONTRACTS': return renderContracts();
      case 'ANALYTICS': return renderAnalytics();
      default: return renderRequisitions();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4" id="procurement-analytics-header">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Procurement & <span className="text-[#0047cc]">Supply Chain</span></h2>
          <p className="text-slate-500 text-[10px] sm:text-sm font-bold uppercase tracking-widest">AI-Optimized Strategic Sourcing</p>
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

      {/* Modals (PO, PR, Contract Scan) */}
      {isPoModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-2xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black uppercase tracking-tighter italic">Create Purchase Order</h3>
              <button onClick={() => setIsPoModalOpen(false)} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmitPo} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PO Number</label>
                  <input 
                    type="text" 
                    readOnly
                    value={newPo.poNumber}
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier Name</label>
                  <input 
                    type="text" 
                    required
                    value={newPo.supplierName}
                    onChange={(e) => setNewPo(prev => ({ ...prev, supplierName: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#e0f2fe]0/20"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</label>
                  <button type="button" onClick={handleAddPoItem} className="text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-widest">+ Add Item</button>
                </div>
                {newPo.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-3">
                    <div className="col-span-6">
                      <input 
                        type="text" 
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handlePoItemChange(idx, 'description', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <input 
                        type="number" 
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handlePoItemChange(idx, 'quantity', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="col-span-4">
                      <input 
                        type="number" 
                        placeholder="Price"
                        value={item.unitPrice || ''}
                        onChange={(e) => handlePoItemChange(idx, 'unitPrice', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl flex justify-between items-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total PO Amount</p>
                <p className="text-xl font-black italic text-[var(--brand-primary)]">${totalAmount.toLocaleString()}</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsPoModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-4 bg-[var(--brand-primary)] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#e0f2fe]0/20">Submit PO</button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {isContractModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-3xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black uppercase tracking-tighter italic">AI Contract Analysis</h3>
              <button onClick={() => setIsContractModalOpen(false)} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contract Text / Paste</label>
                <textarea 
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  className="w-full h-48 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-xs focus:outline-none focus:ring-2 focus:ring-[#e0f2fe]0/20"
                  placeholder="Paste contract text here for AI extraction..."
                />
              </div>

              <button 
                onClick={handleExtractContract}
                className="w-full py-4 bg-[#e0f2fe]0 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#e0f2fe]0/20 hover:scale-[1.02] transition-all"
              >
                Extract Key Terms with Gemini
              </button>

              {extractedTerms && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4">
                  {[
                    { label: 'Supplier', value: extractedTerms.supplierName },
                    { label: 'Total Value', value: `$${extractedTerms.totalValue?.toLocaleString()}` },
                    { label: 'Expiry Date', value: extractedTerms.expiryDate },
                    { label: 'Payment Terms', value: extractedTerms.paymentTerms },
                  ].map((term, i) => (
                    <div key={i} className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{term.label}</p>
                      <p className="text-xs font-black uppercase tracking-tight">{term.value || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default Procurement;



