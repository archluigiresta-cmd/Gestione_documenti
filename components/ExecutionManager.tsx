
import React, { useState } from 'react';
import { ProjectConstants, DocumentVariables, SALData } from '../types';
import { WorksManager } from './WorksManager';
import { PhotoManager } from './PhotoManager';
import { HardHat, Calendar, Hourglass, Plus, Trash2 } from 'lucide-react';

interface ExecutionManagerProps {
  project: ProjectConstants;
  onUpdateProject: (p: ProjectConstants) => void;
  documents: DocumentVariables[];
  currentDocId: string;
  onSelectDocument: (id: string) => void;
  onUpdateDocument: (d: DocumentVariables) => void;
  onNewDocument: () => void;
  onDeleteDocument: (id: string) => void;
  readOnly?: boolean; 
}

export const ExecutionManager: React.FC<ExecutionManagerProps> = ({
  project, onUpdateProject, documents, currentDocId, onSelectDocument, onUpdateDocument, onNewDocument, onDeleteDocument, readOnly = false
}) => {
  const [tab, setTab] = useState<'acts' | 'works' | 'photos'>('acts');
  
  const updateExec = (field: string, value: any) => {
    onUpdateProject({ ...project, executionPhase: { ...project.executionPhase, [field]: value } });
  };

  const handleDeliveryDateChange = (date: string) => {
      if (!date) return;
      const days = project.contract.durationDays || 0;
      const d = new Date(date);
      d.setDate(d.getDate() + days);
      const newCompletion = d.toISOString().split('T')[0];
      onUpdateProject({ 
          ...project, 
          executionPhase: { ...project.executionPhase, deliveryDate: date, completionDate: newCompletion } 
      });
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
       <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-200 mb-8 w-fit">
          <button onClick={() => setTab('acts')} className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-lg ${tab === 'acts' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>Amministrazione</button>
          <button onClick={() => setTab('works')} className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-lg ${tab === 'works' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>Giornale</button>
          <button onClick={() => setTab('photos')} className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-lg ${tab === 'photos' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>Foto</button>
       </div>

       {tab === 'acts' && (
         <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in">
            <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calendar className="w-3 h-3"/> Data Consegna</label>
                <input type="date" className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 font-bold outline-none focus:ring-4 focus:ring-blue-500/10" value={project.executionPhase.deliveryDate || ''} onChange={(e) => handleDeliveryDateChange(e.target.value)} />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Hourglass className="w-3 h-3"/> Giorni Contrattuali</label>
                <input type="number" className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 font-bold outline-none focus:ring-4 focus:ring-blue-500/10" value={project.contract.durationDays} onChange={(e) => {
                    const days = parseInt(e.target.value) || 0;
                    const d = new Date(project.executionPhase.deliveryDate);
                    d.setDate(d.getDate() + days);
                    onUpdateProject({ ...project, contract: { ...project.contract, durationDays: days }, executionPhase: { ...project.executionPhase, completionDate: d.toISOString().split('T')[0] } });
                }} />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calendar className="w-3 h-3"/> Data Ultimazione</label>
                <input type="date" className="w-full p-4 border border-slate-200 rounded-2xl bg-blue-50/50 font-bold text-blue-600 outline-none" value={project.executionPhase.completionDate || ''} onChange={(e) => updateExec('completionDate', e.target.value)} />
            </div>
         </div>
       )}

       {tab === 'works' && <WorksManager documents={documents} currentDocId={currentDocId} onSelectDocument={onSelectDocument} onUpdateDocument={onUpdateDocument} onNewDocument={onNewDocument} onDeleteDocument={onDeleteDocument} readOnly={readOnly} />}
       {tab === 'photos' && <PhotoManager documents={documents} currentDocId={currentDocId} onSelectDocument={onSelectDocument} onUpdateDocument={onUpdateDocument} readOnly={readOnly} />}
    </div>
  );
};
