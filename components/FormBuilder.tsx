
import React, { useState, useMemo } from 'react';
import GlassCard from './GlassCard';
import { FormField, FormFieldType, FormTemplate, FormSection } from '../types';
import { generateFormTemplate } from '../services/geminiService';
import { 
  Plus, Trash2, Save, ArrowLeft, Globe, 
  Type, AlignLeft, Star, List, CheckSquare, 
  ChevronDown, Calendar, FileText, DollarSign, Hash 
} from 'lucide-react';

interface FormBuilderProps {
  onBack: () => void;
  initialTemplate?: FormTemplate;
  onSave: (template: FormTemplate) => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ onBack, initialTemplate, onSave }) => {
  const [template, setTemplate] = useState<FormTemplate>(initialTemplate || {
    id: Math.random().toString(36).substr(2, 9),
    title: 'General Employee Evaluation',
    description: 'Default evaluation template for all employees.',
    status: 'DRAFT',
    sections: [
      { id: 's1', title: 'Work Quality', fields: [] },
      { id: 's2', title: 'Teamwork & Communication', fields: [] },
      { id: 's3', title: 'Initiative & Growth', fields: [] },
      { id: 's4', title: 'Attendance & Punctuality', fields: [] }
    ],
    scope: 'GLOBAL',
    editingId: '26',
    createdAt: new Date().toISOString()
  });

  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);

  const departments = ['GLOBAL', 'IT', 'SALES', 'MARKETING', 'ENGINEERING', 'HUMAN RESOURCES', 'OPERATIONS', 'FINANCE'];

  const totalWeight = useMemo(() => {
    return template.sections.reduce((acc, section) => {
      return acc + section.fields.reduce((sAcc, field) => sAcc + (field.weight || 0), 0);
    }, 0);
  }, [template.sections]);

  const handleAddSection = () => {
    const newSection: FormSection = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Section',
      fields: []
    };
    setTemplate({ ...template, sections: [...template.sections, newSection] });
  };

  const handleRemoveSection = (sectionId: string) => {
    setTemplate({
      ...template,
      sections: template.sections.filter(s => s.id !== sectionId)
    });
  };

  const handleUpdateSectionTitle = (sectionId: string, title: string) => {
    setTemplate({
      ...template,
      sections: template.sections.map(s => s.id === sectionId ? { ...s, title } : s)
    });
  };

  const handleAddField = (sectionId: string, type: FormFieldType) => {
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: `New ${type.replace('_', ' ')} Question`,
      required: true,
      weight: 0
    };
    setTemplate({
      ...template,
      sections: template.sections.map(s => s.id === sectionId ? { ...s, fields: [...s.fields, newField] } : s)
    });
  };

  const fieldTypes: { type: FormFieldType; label: string; icon: React.ReactNode }[] = [
    { type: 'SHORT_TEXT', label: 'SHORT TEXT', icon: <Type size={14} /> },
    { type: 'PARAGRAPH', label: 'PARAGRAPH', icon: <AlignLeft size={14} /> },
    { type: 'RATING', label: 'RATING', icon: <Star size={14} /> },
    { type: 'MULTIPLE_CHOICE', label: 'MULTIPLE CHOICE', icon: <List size={14} /> },
    { type: 'CHECKBOXES', label: 'CHECKBOXES', icon: <CheckSquare size={14} /> },
    { type: 'DROPDOWN', label: 'DROPDOWN', icon: <ChevronDown size={14} /> },
    { type: 'DATE', label: 'DATE', icon: <Calendar size={14} /> },
    { type: 'FILE', label: 'FILE', icon: <FileText size={14} /> },
    { type: 'CURRENCY', label: 'CURRENCY', icon: <DollarSign size={14} /> },
    { type: 'NUMBER', label: 'NUMBER', icon: <Hash size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0d0a1a] p-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-[#0047cc] transition-colors"
            >
              <ArrowLeft size={12} strokeWidth={3} />
              Back to Templates
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#0047cc] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#e0f2fe]0/20">
                <Plus size={24} strokeWidth={3} />
              </div>
              <div>
                <input 
                  type="text" 
                  value={template.title}
                  onChange={(e) => setTemplate({ ...template, title: e.target.value })}
                  className="text-3xl font-black text-slate-900 dark:text-white bg-transparent border-none outline-none focus:ring-0 p-0 tracking-tight"
                />
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-2 px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
                    <Globe size={10} />
                    <select 
                      value={template.scope}
                      onChange={(e) => setTemplate({ ...template, scope: e.target.value })}
                      className="bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{dept}</option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Editing ID: {template.editingId}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onSave({ ...template, status: 'DRAFT' })}
              className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Save Draft
            </button>
            <button 
              onClick={() => onSave({ ...template, status: 'PUBLISHED' })}
              className="px-8 py-3 bg-[#0047cc] text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-[#e0f2fe]0/20 hover:bg-[#6d39e0] transition-all flex items-center gap-2"
            >
              <Save size={14} strokeWidth={3} />
              Save & Publish
            </button>
          </div>
        </div>

        {/* Top Section: Description & Weight */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <GlassCard className="!p-8">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4">Description & Instructions</label>
              <textarea 
                value={template.description}
                onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                className="w-full h-32 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-sm text-slate-600 dark:text-slate-300 outline-none focus:border-[#0047cc]/50 transition-all resize-none leading-relaxed"
                placeholder="Enter template description..."
              />
            </GlassCard>
          </div>
          <div className="lg:col-span-4">
            <GlassCard className="!p-8 flex flex-col items-center justify-center text-center h-full">
              <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-white/5" />
                  <circle 
                    cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" 
                    className="text-[#0047cc]" 
                    strokeDasharray={364.4} 
                    strokeDashoffset={364.4 - (364.4 * Math.min(totalWeight, 100)) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{totalWeight}%</span>
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Total Scoring Weight</p>
              <p className="text-[9px] text-amber-500 font-bold uppercase mt-1">
                {totalWeight < 100 ? `Missing ${100 - totalWeight}% more` : totalWeight > 100 ? `Exceeds by ${totalWeight - 100}%` : 'Perfectly balanced'}
              </p>
            </GlassCard>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {template.sections.map((section, sIdx) => (
            <div key={section.id} className="space-y-6">
              <div className="flex justify-between items-end border-b border-slate-200 dark:border-white/10 pb-4">
                <div>
                  <input 
                    type="text" 
                    value={section.title}
                    onChange={(e) => handleUpdateSectionTitle(section.id, e.target.value)}
                    className="text-2xl font-black text-slate-900 dark:text-white bg-transparent border-none outline-none focus:ring-0 p-0 tracking-tight uppercase"
                  />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Section {sIdx + 1} • {section.fields.length} Questions</p>
                </div>
                <button 
                  onClick={() => handleRemoveSection(section.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Questions in Section */}
              <div className="space-y-4">
                {section.fields.map((field, fIdx) => (
                  <div key={field.id} className="p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center gap-6 group">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 font-black text-xs">
                      {fIdx + 1}
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-6">
                        <input 
                          type="text" 
                          value={field.label}
                          onChange={(e) => {
                            const newSections = [...template.sections];
                            newSections[sIdx].fields[fIdx].label = e.target.value;
                            setTemplate({ ...template, sections: newSections });
                          }}
                          className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/10 px-2 py-1 rounded">
                          {field.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="md:col-span-3 flex items-center gap-3">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Weight</label>
                        <input 
                          type="number" 
                          value={field.weight}
                          onChange={(e) => {
                            const newSections = [...template.sections];
                            newSections[sIdx].fields[fIdx].weight = parseInt(e.target.value) || 0;
                            setTemplate({ ...template, sections: newSections });
                          }}
                          className="w-16 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white outline-none focus:border-[#0047cc]/50"
                        />
                        <button 
                          onClick={() => {
                            const newSections = [...template.sections];
                            newSections[sIdx].fields.splice(fIdx, 1);
                            setTemplate({ ...template, sections: newSections });
                          }}
                          className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Question Area */}
              <div className="p-8 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[32px] bg-slate-50/50 dark:bg-white/[0.01]">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Add Question:</span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {fieldTypes.map((ft) => (
                      <button
                        key={ft.type}
                        onClick={() => handleAddField(section.id, ft.type)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest hover:border-[#0047cc] hover:text-[#0047cc] transition-all shadow-sm"
                      >
                        {ft.icon}
                        {ft.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Section Button */}
        <div className="flex justify-center pt-8">
          <button 
            onClick={handleAddSection}
            className="px-10 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-[0.2em] hover:border-[#0047cc] hover:text-[#0047cc] transition-all shadow-xl flex items-center gap-3 group"
          >
            <Plus size={16} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
            Add New Section
          </button>
        </div>

      </div>
    </div>
  );
};

export default FormBuilder;

