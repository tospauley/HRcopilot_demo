import React, { useState } from 'react';
import { User, Palette, DollarSign, HardDrive, CheckSquare, Shield, AlertTriangle, Camera, Info, Cloud, Download, Upload, Trash2, Clock, Palmtree, FileText, Building2, Globe, Edit2, ChevronRight, Loader2, CheckCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { BrandSettings, UserProfile } from '../types';
import { saveBrandSettings } from '../src/db/settingsDb';

interface SettingsProps {
  brand: BrandSettings;
  onUpdate: (b: BrandSettings) => void;
  userProfile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

const Settings: React.FC<SettingsProps> = ({ brand, onUpdate, userProfile, onUpdateProfile }) => {
  const [localBrand, setLocalBrand] = useState<BrandSettings>(brand);
  const [localProfile, setLocalProfile] = useState<UserProfile>(userProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveBrand = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await saveBrandSettings(localBrand);
      onUpdate(localBrand);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = () => {
    onUpdateProfile(localProfile);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalProfile({ ...localProfile, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'profile',    label: 'My Profile',           Icon: User },
    { id: 'brand',      label: 'Company Branding',      Icon: Palette },
    { id: 'currency',   label: 'Currency Settings',     Icon: DollarSign },
    { id: 'backup',     label: 'Backup & Restore',      Icon: HardDrive },
    { id: 'payroll',    label: 'Payroll Approval',      Icon: CheckSquare },
    { id: 'governance', label: 'Corporate Governance',  Icon: Shield },
    { id: 'danger',     label: 'Danger Zone',           Icon: AlertTriangle },
  ] as const;

  type TabId = typeof tabs[number]['id'];
  const [activeTab, setActiveTab] = useState<TabId>('governance');

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Platform <span className="text-[#0047cc]">Governance</span></h2>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1 opacity-70">Configure Identity and Systemic Parameters</p>
      </header>

      <div className="tab-nav border-b border-slate-200 dark:border-white/5">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            id={tab.id === 'brand' ? 'nav-settings-brand' : undefined}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-[10px] font-black uppercase tracking-widest relative transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 px-1 mr-4 sm:mr-6 ${activeTab === tab.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
          >
            <tab.Icon size={13} className="opacity-70" />
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0047cc] shadow-[0_0_8px_rgba(0,71,204,0.5)]" />}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {activeTab === 'profile' && (
            <GlassCard title="Personal Identity" className="animate-in slide-in-from-bottom-2 duration-500 !p-10">
              <div className="space-y-10">
                <div className="flex flex-col md:flex-row gap-12 items-start">
                  {/* Avatar Upload Area */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Profile Picture</label>
                    <div className="relative group cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                      />
                      <div className="w-40 h-40 rounded-[48px] border-2 border-dashed border-slate-300 dark:border-white/10 group-hover:border-[#0047cc]/50 transition-all flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-white/5 relative shadow-inner">
                        {localProfile.avatar ? (
                          <img src={localProfile.avatar} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Avatar Preview" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 opacity-40">
                            <Camera size={32} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[9px] font-black text-white uppercase tracking-widest">Update</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">Recommended: 400x400 JPG/PNG</p>
                  </div>

                  <div className="flex-1 space-y-8 w-full">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Full Display Name</label>
                      <input 
                        type="text" 
                        value={localProfile.name}
                        onChange={(e) => setLocalProfile({...localProfile, name: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-8 py-4 text-sm text-slate-900 dark:text-white focus:border-[#0047cc] focus:ring-4 focus:ring-[#0047cc]/10 outline-none transition-all font-medium"
                        placeholder="e.g. Emily Johnson" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Preferred Username</label>
                      <div className="relative">
                        <span className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                        <input 
                          type="text" 
                          value={localProfile.username}
                          onChange={(e) => setLocalProfile({...localProfile, username: e.target.value.toLowerCase().replace(/\s+/g, '')})}
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-12 py-4 text-sm text-slate-900 dark:text-white focus:border-[#0047cc] focus:ring-4 focus:ring-[#0047cc]/10 outline-none transition-all font-medium"
                          placeholder="username" 
                        />
                      </div>
                      <p className="text-[9px] text-slate-400 mt-3 font-black uppercase tracking-widest opacity-60">This is how you will be identified in team mentions and chat.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                   <button 
                    onClick={handleSaveProfile}
                    className="px-12 py-4 bg-[#0047cc] text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                   >
                     Update Profile Identity
                   </button>
                </div>
              </div>
            </GlassCard>
          )}

          {activeTab === 'brand' && (
            <GlassCard title="Brand Identity" className="animate-in slide-in-from-bottom-2 duration-500 !p-10">
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Company Trading Name</label>
                      <input 
                        type="text" 
                        value={localBrand.companyName}
                        onChange={(e) => setLocalBrand({...localBrand, companyName: e.target.value})}
                        placeholder="e.g. Acme Corp" 
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-8 py-4 text-sm text-slate-900 dark:text-white focus:border-[#0047cc] outline-none transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Company Logo URL</label>
                      <input 
                        type="text" 
                        value={localBrand.logoUrl}
                        onChange={(e) => setLocalBrand({...localBrand, logoUrl: e.target.value})}
                        placeholder="https://assets.acme.com/logo.png" 
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-8 py-4 text-sm text-slate-900 dark:text-white focus:border-[#0047cc] outline-none transition-all font-medium"
                      />
                      <p className="text-[9px] text-slate-400 mt-3 font-black uppercase tracking-widest opacity-60">Leave empty to use dynamic initial-based logo.</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center p-10 bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 rounded-[40px] gap-6">
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Logo Preview</div>
                     <div 
                      className="w-32 h-32 rounded-[40px] flex items-center justify-center shadow-2xl relative overflow-hidden ring-8 ring-white dark:ring-white/5"
                      style={{ backgroundColor: localBrand.primaryColor }}
                     >
                       {localBrand.logoUrl ? (
                         <img src={localBrand.logoUrl} className="w-full h-full object-cover" alt="Preview" />
                       ) : (
                         <span className="text-white text-5xl font-black italic">{localBrand.companyName.charAt(0)}</span>
                       )}
                     </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-100 dark:border-white/5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-6">Primary Brand Color</label>
                  <div className="flex items-center gap-8">
                    <div className="relative group" id="brand-color-picker">
                      <input 
                        type="color" 
                        value={localBrand.primaryColor}
                        onChange={(e) => setLocalBrand({...localBrand, primaryColor: e.target.value})}
                        className="w-20 h-20 rounded-3xl bg-transparent border-0 p-0 cursor-pointer relative z-10"
                      />
                      <div className="absolute inset-0 rounded-3xl bg-white dark:bg-white/10 shadow-xl ring-4 ring-white dark:ring-white/5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">{localBrand.primaryColor}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed opacity-70">This color will be applied to buttons, active navigation states, and systemic highlights across the entire workspace.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                   <button 
                    onClick={handleSaveBrand}
                    className="px-12 py-4 bg-[#10b981] text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                   >
                     Apply Corporate Branding
                   </button>
                </div>
              </div>
            </GlassCard>
          )}

          {activeTab === 'currency' && (
            <GlassCard title="Financial Localization" className="animate-in slide-in-from-bottom-2 duration-500 !p-10">
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Base Currency</label>
                      <select
                        value={localBrand.currency}
                        onChange={(e) => setLocalBrand({ ...localBrand, currency: e.target.value as any })}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-8 py-4 text-sm text-slate-900 dark:text-white focus:border-[#0047cc] outline-none transition-all font-medium"
                      >
                        <option value="USD">USD - US Dollar ($)</option>
                        <option value="EUR">EUR - Euro (€)</option>
                        <option value="GBP">GBP - British Pound (£)</option>
                        <option value="NGN">NGN - Nigerian Naira (₦)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Number Format</label>
                      <select className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-8 py-4 text-sm text-slate-900 dark:text-white focus:border-[#0047cc] outline-none transition-all font-medium">
                        <option>1,234.56</option>
                        <option>1.234,56</option>
                        <option>1 234,56</option>
                      </select>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Preview</p>
                      <p className="text-2xl font-black italic text-[#0047cc]">
                        {{ USD: '$', EUR: '€', GBP: '£', NGN: '₦' }[localBrand.currency]}1,234,567.00
                      </p>
                    </div>
                  </div>
                  <div className="p-4 sm:p-8 bg-blue-500/5 border border-blue-500/10 rounded-[32px] flex gap-4">
                    <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Changing the base currency will affect how all financial figures are displayed across Payroll, CRM, Finance, and Invoices. Historical data will not be converted automatically.</p>
                  </div>
                </div>
                <div className="flex justify-end items-center gap-4 pt-6">
                  {saveSuccess && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-in fade-in slide-in-from-right-2 duration-300">
                      <CheckCircle size={14} className="text-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Currency saved</span>
                    </div>
                  )}
                  <button
                    onClick={handleSaveBrand}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-12 py-4 bg-[#0047cc] text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] hover:bg-[#0035a0] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {isSaving ? (
                      <><Loader2 size={14} className="animate-spin" /> Saving...</>
                    ) : (
                      'Save Localization Settings'
                    )}
                  </button>
                </div>
              </div>
            </GlassCard>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
              <GlassCard title="Data Redundancy" className="!p-10">
                <div className="space-y-10">
                  <div className="flex items-center justify-between p-8 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[32px]">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[24px] bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner"><Cloud size={28} /></div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Automated Cloud Backup</p>
                        <p className="text-[10px] text-slate-500 font-black uppercase mt-1 tracking-widest opacity-70">Last backup: Today at 04:00 AM</p>
                      </div>
                    </div>
                    <button className="px-6 py-3 bg-white dark:bg-white/10 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/20 transition-all shadow-sm">Run Backup Now</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button className="p-10 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[40px] text-center space-y-4 hover:bg-slate-100 dark:hover:bg-white/10 transition-all group">
                      <Download size={36} className="mx-auto group-hover:scale-110 transition-transform text-slate-400" />
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Download Full Export</p>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest opacity-60">JSON/CSV Format</p>
                    </button>
                    <button className="p-10 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[40px] text-center space-y-4 hover:bg-slate-100 dark:hover:bg-white/10 transition-all group">
                      <Upload size={36} className="mx-auto group-hover:scale-110 transition-transform text-slate-400" />
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Restore from File</p>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest opacity-60">Upload .bak file</p>
                    </button>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {activeTab === 'payroll' && (
            <GlassCard title="Approval Workflow" className="animate-in slide-in-from-bottom-2 duration-500 !p-10">
               <div className="space-y-10">
                  <div className="space-y-6">
                     <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Define the hierarchy required for payroll finalization. Each level must approve before the next level is notified.</p>
                     <div className="space-y-4">
                        {[
                          { level: 1, role: 'HR Manager', user: 'Emily Johnson' },
                          { level: 2, role: 'Finance Director', user: 'Michael Chen' },
                          { level: 3, role: 'CEO', user: 'Sarah Williams' },
                        ].map((step, i) => (
                          <div key={i} className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[32px] relative group">
                             <div className="w-10 h-10 rounded-full bg-[#0047cc] text-white text-xs font-black flex items-center justify-center shadow-xl shadow-blue-500/20">{step.level}</div>
                             <div className="flex-1">
                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{step.role}</p>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 opacity-70">{step.user}</p>
                             </div>
                             <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Edit2 size={14} /></button>
                             {i < 2 && <div className="absolute -bottom-4 left-11 w-0.5 h-4 bg-slate-200 dark:bg-white/10" />}
                          </div>
                        ))}
                     </div>
                  </div>
                  <button className="w-full py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
                     Add Approval Level
                  </button>
               </div>
            </GlassCard>
          )}

          {activeTab === 'danger' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
              <GlassCard className="border-rose-500/20 bg-rose-500/[0.02] !p-10">
                 <div className="space-y-10">
                    <div className="flex items-start gap-6">
                       <div className="w-16 h-16 rounded-[24px] bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-inner"><Trash2 size={28} /></div>
                       <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Critical Actions</h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-2 font-medium">These actions are irreversible and will impact all organizational data. Please proceed with extreme caution.</p>
                       </div>
                    </div>
                    
                    <div className="space-y-6 pt-10 border-t border-rose-500/10">
                       <div className="flex items-center justify-between p-6 bg-rose-500/[0.03] rounded-[32px] border border-rose-500/10">
                          <div>
                             <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Reset All Data</p>
                             <p className="text-[9px] text-slate-500 font-black uppercase mt-1 tracking-widest opacity-70">Wipe all employee, payroll, and attendance records</p>
                          </div>
                          <button className="px-6 py-3 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all">Reset Workspace</button>
                       </div>
                       <div className="flex items-center justify-between p-6 bg-rose-500/[0.03] rounded-[32px] border border-rose-500/10">
                          <div>
                             <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Deactivate Account</p>
                             <p className="text-[9px] text-slate-500 font-black uppercase mt-1 tracking-widest opacity-70">Suspend all organization access immediately</p>
                          </div>
                          <button className="px-6 py-3 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all">Deactivate Now</button>
                       </div>
                    </div>
                 </div>
              </GlassCard>
            </div>
          )}

          {activeTab === 'governance' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[32px] mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#eff6ff]0/10 text-[#eff6ff]0 flex items-center justify-center shadow-inner"><Shield size={20} className="text-[#0047cc]" /></div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">CORPORATE GOVERNANCE</h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 opacity-70">ORGANISATION-WIDE POLICY � APPLIES TO ALL BRANCHES BY DEFAULT</p>
                </div>
                <div className="flex bg-slate-200 dark:bg-white/10 p-1 rounded-2xl">
                   <button className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm flex items-center gap-2">
                     <Globe size={13} /> CORPORATE POLICY
                   </button>
                   <button className="px-6 py-3 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2">
                     <Building2 size={13} /> BRANCH OVERRIDES
                   </button>
                </div>
              </div>

              <div className="p-6 bg-[#eff6ff]0/5 border border-[#eff6ff]0/10 rounded-[24px] flex gap-4 mb-8">
                <Info size={18} className="text-[#2563eb] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#2563eb] dark:text-[#60a5fa] leading-relaxed font-medium">Corporate Policy is the organisation-wide standard. It applies to every branch automatically � no branch configuration required. Set it once and it works everywhere.</p>
              </div>

              {/* ATTENDANCE & TIME */}
              <div className="border border-slate-200 dark:border-white/10 rounded-[32px] overflow-hidden mb-6">
                <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl"><Clock size={22} className="text-slate-500" /></div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">ATTENDANCE & TIME</h4>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">Work hours, grace periods, overtime thresholds</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                  </button>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-white/[0.02] space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">WORK START TIME</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">09:00</span>
                      <Edit2 size={12} className="text-slate-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">WORK END TIME</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">--:--</span>
                      <Edit2 size={12} className="text-slate-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">GRACE PERIOD (MINUTES)</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">15</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">DAILY OT THRESHOLD (HOURS)</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">8</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">AUTO CLOCK-OUT TIME</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">20:00</span>
                      <Edit2 size={12} className="text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* LEAVE POLICY */}
              <div className="border border-slate-200 dark:border-white/10 rounded-[32px] overflow-hidden mb-6">
                <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl"><Palmtree size={22} className="text-slate-500" /></div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">LEAVE POLICY</h4>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">Entitlements, carry-over, sick leave</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                  </button>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-white/[0.02] space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">ANNUAL LEAVE (DAYS)</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">20</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">SICK LEAVE (DAYS)</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">10</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">MAX CARRY-OVER (DAYS)</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">5</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PAYROLL & COMPLIANCE */}
              <div className="border border-slate-200 dark:border-white/10 rounded-[32px] overflow-hidden mb-6">
                <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl"><FileText size={22} className="text-slate-500" /></div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">PAYROLL & COMPLIANCE</h4>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">Tax engine, pension rates, pay frequency</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                  </button>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-white/[0.02] space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">TAX COMPLIANCE ENGINE</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">nigerian</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">PENSION RATE � EMPLOYEE (%)</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">8</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">PENSION RATE � EMPLOYER (%)</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">10</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">PAY FREQUENCY</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">monthly</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


        </div>

        <div className="lg:col-span-4 space-y-8">
          <GlassCard title="Live Identity Preview" className="!bg-white dark:!bg-[#0d0a1a] border-slate-200 dark:border-white/5 overflow-hidden !p-8">
            <div className="space-y-8">
               <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-white/[0.03] rounded-[32px] border border-slate-200 dark:border-white/5 shadow-inner">
                  <div className="w-14 h-14 rounded-2xl border-2 border-orange-500 overflow-hidden bg-orange-500/10 flex items-center justify-center shadow-lg">
                    {localProfile.avatar ? (
                      <img src={localProfile.avatar} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <span className="text-orange-500 font-black italic text-xl">{localProfile.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">{localProfile.name}</p>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest truncate mt-0.5">@{localProfile.username}</p>
                  </div>
               </div>

               <div className="space-y-6 opacity-60 pointer-events-none">
                  <div className="flex gap-3">
                    <div className="px-5 py-2 rounded-xl text-[9px] font-black uppercase text-white shadow-lg" style={{ backgroundColor: '#0047cc' }}>Active Tab</div>
                    <div className="px-5 py-2 rounded-xl text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">Normal Tab</div>
                  </div>
                  <div className="h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full shadow-[0_0_8px_rgba(0,71,204,0.5)]" style={{ width: '65%', backgroundColor: '#0047cc' }} />
                  </div>
                  <button className="w-full py-4 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl" style={{ backgroundColor: '#94a3b8' }}>
                    Branded Action Button
                  </button>
               </div>
            </div>
          </GlassCard>

          <GlassCard title="Privacy & Security" className="!p-8">
             <p className="text-[10px] text-slate-400 leading-relaxed font-black uppercase tracking-[0.2em] mb-6 opacity-60">Account Metadata</p>
             <ul className="space-y-5">
                <li className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                  <span>Last Login</span>
                  <span className="text-slate-900 dark:text-white">Just Now</span>
                </li>
                <li className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                  <span>Device Linked</span>
                  <span className="text-emerald-500">Authorized</span>
                </li>
                <li className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500 border-t border-slate-100 dark:border-white/5 pt-5 mt-5">
                  <span>Access Level</span>
                  <span className="text-[#0047cc] font-black uppercase text-[10px] tracking-widest">Root Admin</span>
                </li>
             </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Settings;


