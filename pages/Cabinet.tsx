import React, { useState, useEffect } from 'react';
import { db } from '../mockDb';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, where } from '../mockDb';
import GlassCard from '../components/GlassCard';
import { ICONS } from '../constants';
import { Users, FolderOpen, Scale, Settings } from 'lucide-react';
import { extractDocumentMetadata } from '../services/geminiService';

// Import new components
import FileGrid from '../components/cabinet/FileGrid';
import AIChatInterface from '../components/cabinet/AIChatInterface';
import DynamicForm from '../components/cabinet/DynamicForm';
import AlertTimeline from '../components/cabinet/AlertTimeline';
import RoleMatrix from '../components/cabinet/RoleMatrix';

const Cabinet: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCabinet, setSelectedCabinet] = useState('HR');
  const [activeTab, setActiveTab] = useState('Explorer');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newFile, setNewFile] = useState({
    name: '',
    text: '', // Simulated OCR text
    cabinet: 'HR',
    drawer: 'EMPLOYEE_FILES',
    folder: 'GENERAL'
  });

  useEffect(() => {
    const q = query(collection(db, 'cabinet_files'), where('cabinet', '==', selectedCabinet));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFiles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [selectedCabinet]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      // Simulate AI processing
      const metadata = await extractDocumentMetadata(newFile.text);
      
      await addDoc(collection(db, 'cabinet_files'), {
        ...newFile,
        aiMetadata: metadata,
        tags: metadata?.tags || [],
        ownerId: 'system',
        createdAt: serverTimestamp(),
        size: Math.floor(Math.random() * 5000) + 100, // KB
        mimeType: 'application/pdf'
      });
      
      setIsUploadModalOpen(false);
      setNewFile({ name: '', text: '', cabinet: 'HR', drawer: 'EMPLOYEE_FILES', folder: 'GENERAL' });
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  const cabinets = [
    { id: 'HR',      label: 'Human Resources',    Icon: Users },
    { id: 'FINANCE', label: 'Finance & Tax',       Icon: FolderOpen },
    { id: 'LEGAL',   label: 'Legal & Compliance',  Icon: Scale },
    { id: 'OPS',     label: 'Operations',          Icon: Settings },
  ];

  const tabs = [
    { id: 'Explorer', label: 'Explorer', desc: 'Semantic Search & OCR' },
    { id: 'Insights', label: 'Insights', desc: 'Vector DB Retrieval' },
    { id: 'Intake', label: 'Intake', desc: 'Auto-extraction' },
    { id: 'Compliance', label: 'Compliance', desc: 'Alerts & Memos' },
    { id: 'Governance', label: 'Governance', desc: 'Role Masking' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic">Virtual Cabinet</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-bold uppercase tracking-widest">AI-Powered Document Intelligence</p>
        </div>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="w-full sm:w-auto px-5 py-3 bg-[var(--brand-primary)] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#e0f2fe]0/20 hover:scale-105 transition-transform"
        >
          Upload Document
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="tab-nav pb-2" id="cabinet-intelligence-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-start px-4 sm:px-6 py-3 rounded-2xl transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-[var(--brand-primary)] text-white shadow-lg shadow-[#e0f2fe]0/20'
                : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/[0.08]'
            }`}
          >
            <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
            <span className={`text-[9px] mt-1 hidden sm:block ${activeTab === tab.id ? 'text-white/70' : 'text-slate-400'}`}>{tab.desc}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Cabinets</p>
          {cabinets.map((cab) => (
            <button 
              key={cab.id}
              onClick={() => setSelectedCabinet(cab.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                selectedCabinet === cab.id 
                ? 'bg-slate-800 dark:bg-white/10 text-white shadow-lg' 
                : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/[0.08]'
              }`}
            >
              <cab.Icon size={18} />
              <span className="text-xs font-black uppercase tracking-tight">{cab.label}</span>
            </button>
          ))}
          
          <div className="pt-8 space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Storage Status</p>
            <GlassCard className="p-4">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-2">
                <span>Used Space</span>
                <span>4.2 GB / 10 GB</span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--brand-primary)] w-[42%]" />
              </div>
            </GlassCard>
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'Explorer' && <FileGrid files={files} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
          {activeTab === 'Insights' && <AIChatInterface />}
          {activeTab === 'Intake' && <DynamicForm />}
          {activeTab === 'Compliance' && <AlertTimeline />}
          {activeTab === 'Governance' && <RoleMatrix />}
        </div>
      </div>

      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-2xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black uppercase tracking-tighter italic">Upload to Virtual Cabinet</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg>
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Name</label>
                <input 
                  type="text" 
                  required
                  value={newFile.name}
                  onChange={(e) => setNewFile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs focus:outline-none"
                  placeholder="e.g. Employment_Contract_John_Doe.pdf"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Cabinet</label>
                  <select 
                    value={newFile.cabinet}
                    onChange={(e) => setNewFile(prev => ({ ...prev, cabinet: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs focus:outline-none"
                  >
                    {cabinets.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Drawer</label>
                  <input 
                    type="text" 
                    value={newFile.drawer}
                    onChange={(e) => setNewFile(prev => ({ ...prev, drawer: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Content (Simulated OCR)</label>
                <textarea 
                  required
                  value={newFile.text}
                  onChange={(e) => setNewFile(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full h-32 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-xs focus:outline-none"
                  placeholder="Paste document text here for AI metadata extraction..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsUploadModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500">Cancel</button>
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="flex-1 px-6 py-4 bg-[var(--brand-primary)] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#e0f2fe]0/20 disabled:opacity-50"
                >
                  {uploading ? 'Processing AI Metadata...' : 'Upload & Index'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default Cabinet;



