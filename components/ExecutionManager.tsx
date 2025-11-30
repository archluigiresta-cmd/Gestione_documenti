
import React, { useState } from 'react';
import { ProjectConstants, DocumentVariables } from '../types';
import { WorksManager } from './WorksManager';
import { PhotoManager } from './PhotoManager';
import { FileText, HardHat, Camera, Calendar, FileClock, FolderOpen } from 'lucide-react';

interface ExecutionManagerProps {
  project: ProjectConstants;
  onUpdateProject: (p: ProjectConstants) => void;
  documents: DocumentVariables[];
  currentDocId: string;
  onSelectDocument: (id: string) => void;
  onUpdateDocument: (d: DocumentVariables) => void;
  onNewDocument: () => void;
  onDeleteDocument: (id: string) => void;
}

export const ExecutionManager: React.FC<ExecutionManagerProps> = ({
  project,
  onUpdateProject,
  documents,
  currentDocId,
  onSelectDocument,
  onUpdateDocument,
  onNewDocument,
  onDeleteDocument
}) => {
  const [tab, setTab] = useState<'acts' | 'works' | 'photos'>('acts');
  const [actsSubTab, setActsSubTab] = useState<'dates' | 'suspensions' | 'docs'>('dates');

  // Helper to safely update execution phase
  const updateExec = (field: string, value: any) => {
    onUpdateProject({
        ...project,
        executionPhase: {
            ...project.executionPhase,
            [field]: value
        }
    });
  };

  // Safety check: ensure executionPhase exists before rendering
  const execPhase = project.executionPhase || {
      deliveryDate: '',
      deliveryType: 'ordinary',
      suspensions: [],
      resumptions: [],
      sals: [],
      variants: [],
      completionDate: '',
      handoverDocs: {
          projectApprovalType: '', projectApprovalNumber: '', projectApprovalDate: '',
          ainopProtocol: '', ainopDate: '',
          municipalityProtocol: '', municipalityDate: '',
          hasWasteNotes: false, hasUpdatedPOS: false, hasUpdatedSchedule: false,
          hasPreliminaryNotification: false, preliminaryNotifNumber: '', preliminaryNotifDate: ''
      }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
       <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Fase di Esecuzione</h2>
          <div className="flex bg-white rounded-lg p-1 shadow border border-slate-200">
             <button onClick={() => setTab('acts')} className={`px-4 py-2 text-sm font-medium rounded transition-all ${tab === 'acts' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-2"><FileText className="w-4 h-4"/> Atti Amm.</div>
             </button>
             <button onClick={() => setTab('works')} className={`px-4 py-2 text-sm font-medium rounded transition-all ${tab === 'works' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-2"><HardHat className="w-4 h-4"/> Giornale Lavori</div>
             </button>
             <button onClick={() => setTab('photos')} className={`px-4 py-2 text-sm font-medium rounded transition-all ${tab === 'photos' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-2"><Camera className="w-4 h-4"/> Foto</div>
             </button>
          </div>
       </div>

       {tab === 'acts' && (
         <>
            {/* Sub Nav for Acts */}
            <div className="flex gap-4 mb-6 border-b border-slate-200">
                 <button onClick={() => setActsSubTab('dates')} className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${actsSubTab === 'dates' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>
                    <Calendar className="w-4 h-4"/> Date Chiave
                 </button>
                 <button onClick={() => setActsSubTab('suspensions')} className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${actsSubTab === 'suspensions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>
                    <FileClock className="w-4 h-4"/> Sospensioni & Varianti
                 </button>
                 <button onClick={() => setActsSubTab('docs')} className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${actsSubTab === 'docs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>
                    <FolderOpen className="w-4 h-4"/> Documenti Consegna
                 </button>
            </div>

            {actsSubTab === 'dates' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-right-4">
                    <h3 className="font-bold text-slate-800 mb-6">Atti Fondamentali</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Consegna Lavori (Data)</label>
                            <input type="date" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                                value={execPhase.deliveryDate || ''} onChange={(e) => updateExec('deliveryDate', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Ultimazione Lavori (Data)</label>
                            <input type="date" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                                value={execPhase.completionDate || ''} onChange={(e) => updateExec('completionDate', e.target.value)} />
                        </div>
                    </div>
                </div>
            )}

            {actsSubTab === 'suspensions' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-right-4">
                    <h3 className="font-bold text-slate-800 mb-4">Registro Eventi</h3>
                    <div className="p-10 bg-slate-50 rounded-xl text-center border border-dashed border-slate-300">
                        <FileClock className="w-12 h-12 text-slate-300 mx-auto mb-3"/>
                        <p className="text-slate-500 mb-2">Gestione cronologica di Sospensioni, Riprese e Varianti.</p>
                        <button className="text-blue-600 font-medium hover:underline">Aggiungi Evento +</button>
                    </div>
                </div>
            )}

            {actsSubTab === 'docs' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-right-4">
                    <h3 className="font-bold text-slate-800 mb-6">Documenti Consegnati e Avvio</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Prot. AINOP</label>
                            <input type="text" className="w-full p-3 border border-slate-300 rounded-lg mt-1" 
                            value={execPhase.handoverDocs?.ainopProtocol || ''} 
                            onChange={e => {
                                const hd = { ...execPhase.handoverDocs, ainopProtocol: e.target.value };
                                updateExec('handoverDocs', hd);
                            }}/>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Data AINOP</label>
                            <input type="date" className="w-full p-3 border border-slate-300 rounded-lg mt-1" 
                            value={execPhase.handoverDocs?.ainopDate || ''} 
                            onChange={e => {
                                const hd = { ...execPhase.handoverDocs, ainopDate: e.target.value };
                                updateExec('handoverDocs', hd);
                            }}/>
                        </div>
                        <div className="col-span-2 pt-4 border-t border-slate-100">
                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                            <input type="checkbox" className="w-5 h-5 text-blue-600 rounded"
                                checked={execPhase.handoverDocs?.hasUpdatedPOS || false}
                                onChange={e => {
                                    const hd = { ...execPhase.handoverDocs, hasUpdatedPOS: e.target.checked };
                                    updateExec('handoverDocs', hd);
                                }}
                            />
                            <span className="font-medium text-slate-700">POS Aggiornato consegnato</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}
         </>
       )}

       {tab === 'works' && (
         <WorksManager 
            documents={documents}
            currentDocId={currentDocId}
            onSelectDocument={onSelectDocument}
            onUpdateDocument={onUpdateDocument}
            onNewDocument={onNewDocument}
            onDeleteDocument={onDeleteDocument}
         />
       )}

       {tab === 'photos' && (
         <PhotoManager 
            documents={documents}
            currentDocId={currentDocId}
            onSelectDocument={onSelectDocument}
            onUpdateDocument={onUpdateDocument}
         />
       )}
    </div>
  );
};
