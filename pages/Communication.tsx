
import React, { useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import ChatAdminDashboard from '../components/ChatAdminDashboard';
import { UserRole } from '../types';

const Communication: React.FC = () => {
  const [activeView, setActiveView] = useState<'CHAT' | 'ADMIN'>('CHAT');
  const currentUserRole = UserRole.CEO; // Simulated role

  const isAdmin = currentUserRole === UserRole.CEO || currentUserRole === UserRole.HR_MANAGER;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-6 animate-in fade-in duration-700">
      {/* Top Header & Context Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-white/5 pb-6">
        <div>
           <div className="flex items-center gap-3">
             <div className="w-9 h-9 gradient-bg rounded-lg flex items-center justify-center shadow-lg shadow-[#e0f2fe]0/30">
               <span className="font-bold text-lg text-white italic">H</span>
             </div>
             <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">HRcopilot <span className="text-[#0047cc]">Chat</span></h2>
           </div>
        </div>

        {isAdmin && (
          <div className="flex p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl self-start sm:self-end">
            <button 
              onClick={() => setActiveView('CHAT')}
              className={`px-4 sm:px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'CHAT' ? 'bg-[#0047cc] text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
            >
              Messaging
            </button>
            <button 
              onClick={() => setActiveView('ADMIN')}
              className={`px-4 sm:px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'ADMIN' ? 'bg-[#0047cc] text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
            >
              Control Center
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {activeView === 'ADMIN' ? (
          <ChatAdminDashboard />
        ) : (
          <ChatInterface />
        )}
      </div>
    </div>
  );
};

export default Communication;

