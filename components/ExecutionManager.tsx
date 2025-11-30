
import React, { useState } from 'react';
import { ProjectConstants, DocumentVariables } from '../types';
import { WorksManager } from './WorksManager';
import { PhotoManager } from './PhotoManager';
import { FileText, HardHat, Camera, Save } from 'lucide-react';

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

  const updateExec = (field: string, value: any) => {
    onUpdateProject({
        ...project,
        executionPhase: {
            ...project.executionPhase,
            [field]: value
        }
    });
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
       <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Fase di Esecuzione</h2>
          <div className="flex bg-white rounded-lg p-1 shadow border border-slate-200">
             <button onClick={() => setTab('acts')} className={`px-4 py-2 text-sm font-medium rounded ${tab === 'acts' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-2"><FileText className="w-4 h-4"/> Atti Amm.</div>
             </button>
             <button onClick={() => setTab('works')} className={`px-4 py-2 text-sm font-medium rounded ${tab === 'works' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-2"><HardHat className="w-4 h-4"/> Giornale Lavori</div>
             </button>
             <button onClick={() => setTab('photos')} className={`px-4 py-2 text-sm font-medium rounded ${tab === 'photos' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-2"><Camera className="w-4 h-4"/> Foto</div>
             </button>
          </div>
       </div>

       {tab === 'acts' && (
         <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="font-bold text-slate-800 mb-4">Atti Fondamentali</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-sm font-medium text-slate-700">Consegna Lavori (Data)</label>
                      <input type="date" className="w-full p-3 border border-slate-300 rounded mt-1"
                         value={project.executionPhase.deliveryDate} onChange={(e) => updateExec('deliveryDate', e.target.value)} />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700">Ultimazione Lavori (Data)</label>
                      <input type="date" className="w-full p-3 border border-slate-300 rounded mt-1"
                         value={project.executionPhase.completionDate} onChange={(e) => updateExec('completionDate', e.target.value)} />
                  </div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="font-bold text-slate-800 mb-4">Sospensioni e Riprese</h3>
               <p className="text-sm text-slate-500 italic mb-4">Aggiungi qui le date chiave che modificano la durata contrattuale.</p>
               {/* Semplificazione: Lista statica per ora, da espandere in lista dinamica */}
               <div className="p-4 bg-slate-50 rounded text-center text-slate-400">
                  Funzionalità gestione lista Sospensioni/Riprese/Varianti in arrivo...
               </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4">Documenti Consegnati (AINOP, POS, ecc.)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Prot. AINOP</label>
                        <input type="text" className="w-full p-2 border rounded" 
                          value={project.executionPhase.handoverDocs.ainopProtocol} 
                          onChange={e => {
                              const hd = { ...project.executionPhase.handoverDocs, ainopProtocol: e.target.value };
                              updateExec('handoverDocs', hd);
                          }}/>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Data AINOP</label>
                        <input type="date" className="w-full p-2 border rounded" 
                          value={project.executionPhase.handoverDocs.ainopDate} 
                          onChange={e => {
                              const hd = { ...project.executionPhase.handoverDocs, ainopDate: e.target.value };
                              updateExec('handoverDocs', hd);
                          }}/>
                     </div>
                     <div className="col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                           <input type="checkbox" 
                             checked={project.executionPhase.handoverDocs.hasUpdatedPOS}
                             onChange={e => {
                                const hd = { ...project.executionPhase.handoverDocs, hasUpdatedPOS: e.target.checked };
                                updateExec('handoverDocs', hd);
                             }}
                           />
                           <span className="text-sm">POS Aggiornato consegnato</span>
                        </label>
                     </div>
                </div>
            </div>
         </div>
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
