import React, { useState } from 'react';
import GlassCard from '../GlassCard';

const AIChatInterface: React.FC = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I can search across all your documents using semantic search and vector retrieval. What insights are you looking for today?' }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setMessages([...messages, { role: 'user', content: query }]);
    setQuery('');
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Based on the retrieved documents, I found 3 relevant contracts. The key summary is that all standard employment agreements include a 3-month probationary period.' 
      }]);
    }, 1500);
  };

  return (
    <GlassCard className="flex flex-col h-[600px] overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
        <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#e0f2fe]0 animate-pulse" />
          Document Insights AI
        </h3>
        <p className="text-[10px] text-slate-500 mt-1">Vector DB Retrieval & Summarization</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-[var(--brand-primary)] text-white rounded-tr-sm' 
                : 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 rounded-tl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-white/10">
        <div className="relative">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your documents..."
            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#e0f2fe]0/20"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          </button>
        </div>
      </form>
    </GlassCard>
  );
};

export default AIChatInterface;

