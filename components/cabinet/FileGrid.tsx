import React from 'react';
import GlassCard from '../GlassCard';

interface FileGridProps {
  files: any[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const FileGrid: React.FC<FileGridProps> = ({ files, searchQuery, setSearchQuery }) => {
  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5"/></svg>
        <input 
          type="text" 
          id="cabinet-semantic-search"
          placeholder="Semantic Search: 'Find all employment contracts from 2023'..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-[#e0f2fe]0/20 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredFiles.map((file) => (
          <GlassCard key={file.id} className="p-6 group hover:border-[var(--brand-primary)]/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center text-2xl">
                📄
              </div>
              <div className="flex gap-1">
                {file.tags?.slice(0, 2).map((tag: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-[8px] font-black uppercase text-slate-500">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <h4 className="text-xs font-black uppercase tracking-tight mb-1 truncate">{file.name}</h4>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-4">{file.size} KB • {new Date(file.createdAt?.toDate?.() || file.createdAt).toLocaleDateString()}</p>
            
            {file.aiMetadata?.summary && (
              <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mb-4 italic">
                "{file.aiMetadata.summary}"
              </p>
            )}

            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-slate-50 dark:bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/10 transition-all">Preview (OCR)</button>
              <button className="flex-1 py-2 bg-slate-50 dark:bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/10 transition-all">Download</button>
            </div>
          </GlassCard>
        ))}
        
        {filteredFiles.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-4xl mb-4 opacity-20">📂</p>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No documents found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileGrid;

