
import React, { useState } from 'react';
import { ProjectConstants, DocumentVariables, SALData } from '../types';
import { WorksManager } from './WorksManager';
import { PhotoManager } from './PhotoManager';
import { FileText, HardHat, Camera, Calendar, FileClock, FolderOpen, Euro, Plus, Trash2, Copy } from 'lucide-react';

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
  project,
  onUpdateProject,
  documents,
  currentDocId,
  onSelectDocument,
  onUpdateDocument,
  onNewDocument,
  onDeleteDocument,
  readOnly = false
}) => {
  const [tab, setTab] = useState<'acts' | 'works' | 'photos'>('acts');
  const [actsSubTab, setActsSubTab] = useState<'dates' | 'suspensions' | 'docs' | 'sals'>('dates');

  // Helper to safely update execution phase
  const updateExec = (field: string, value: any) => {
    if (readOnly) return;
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

  const addSAL = () => {
    if (readOnly) return;
    const newSAL: SALData = {
        id: crypto.randomUUID(),
        number: String((execPhase.sals?.length || 0) + 1),
        date: '',
        periodFrom: '',
        periodTo: '',
        netAmount: '',
        paymentCertificateDate: '',
        paymentCertificateAmount: '',
        localFolderLink: '',
        notes: ''
    };
    updateExec('sals', [...(execPhase.sals || []), newSAL]);
  };

  const updateSAL = (index: number, field: keyof SALData, value: string) => {
    if (readOnly) return;
    const newSALs = [...(execPhase.sals || [])];
    newSALs[index] = { ...newSALs[index], [field]: value };
    updateExec('sals', newSALs);
  };

  const removeSAL = (index: number) => {
    if (readOnly) return;
    const newSALs = [...(execPhase.sals || [])];
    newSALs.splice(index, 1);
    updateExec('sals', newSALs);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
       <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Esecuzione</h2>
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
            <div className="flex gap-4 mb-6 border-b border-slate-200 overflow-x-auto">
                 <button onClick={() => setActsSubTab('dates')} className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${actsSubTab === 'dates' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>
                    <Calendar className="w-4 h-4"/> Date Chiave
                 </button>
                 <button onClick={() => setActsSubTab('suspensions')} className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${actsSubTab === 'suspensions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>
                    <FileClock className="w-4 h-4"/> Sospensioni & Varianti
                 </button>
                 <button onClick={() => setActsSubTab('docs')} className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${actsSubTab === 'docs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>
                    <FolderOpen className="w-4 h-4"/> Documenti Consegna
                 </button>
                 <button onClick={() => setActsSubTab('sals')} className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${actsSubTab === 'sals' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>
                    <Euro className="w-4 h-4"/> Contabilità & SAL
                 </button>
            </div>

            {actsSubTab === 'dates' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-right-4">
                    <h3 className="font-bold text-slate-800 mb-6">Atti Fondamentali</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Consegna Lavori (Data)</label>
                            <input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-slate-100"
                                value={execPhase.deliveryDate || ''} onChange={(e) => updateExec('deliveryDate', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Ultimazione Lavori (Data)</label>
                            <input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-slate-100"
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
                        {!readOnly && <button className="text-blue-600 font-medium hover:underline">Aggiungi Evento +</button>}
                    </div>
                </div>
            )}

            {actsSubTab === 'docs' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-right-4">
                    <h3 className="font-bold text-slate-800 mb-6">Documenti Consegnati e Avvio</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Prot. AINOP</label>
                            <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                            value={execPhase.handoverDocs?.ainopProtocol || ''} 
                            onChange={e => {
                                const hd = { ...execPhase.handoverDocs, ainopProtocol: e.target.value };
                                updateExec('handoverDocs', hd);
                            }}/>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Data AINOP</label>
                            <input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                            value={execPhase.handoverDocs?.ainopDate || ''} 
                            onChange={e => {
                                const hd = { ...execPhase.handoverDocs, ainopDate: e.target.value };
                                updateExec('handoverDocs', hd);
                            }}/>
                        </div>
                        <div className="col-span-2 pt-4 border-t border-slate-100">
                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                            <input disabled={readOnly} type="checkbox" className="w-5 h-5 text-blue-600 rounded"
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

            {actsSubTab === 'sals' && (
                <div className="animate-in slide-in-from-right-4">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-800">Stati Avanzamento Lavori (SAL)</h3>
                        {!readOnly && (
                            <button onClick={addSAL} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
                                <Plus className="w-5 h-5"/> Nuovo SAL
                            </button>
                        )}
                    </div>
                    
                    <div className="space-y-6">
                        {(execPhase.sals || []).map((sal, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative">
                                {!readOnly && (
                                    <button onClick={() => removeSAL(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-2">
                                        <Trash2 className="w-5 h-5"/>
                                    </button>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-4">
                                    <div className="md:col-span-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">N. SAL</label>
                                        <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded mt-1 font-bold text-center" 
                                            value={sal.number} onChange={e => updateSAL(idx, 'number', e.target.value)} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Periodo (Dal - Al)</label>
                                        <div className="flex gap-2">
                                            <input disabled={readOnly} type="date" className="w-full p-2 border border-slate-300 rounded mt-1 text-sm" 
                                                value={sal.periodFrom} onChange={e => updateSAL(idx, 'periodFrom', e.target.value)} />
                                            <input disabled={readOnly} type="date" className="w-full p-2 border border-slate-300 rounded mt-1 text-sm" 
                                                value={sal.periodTo} onChange={e => updateSAL(idx, 'periodTo', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Imp. Lavori Netto (€)</label>
                                        <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded mt-1 text-sm" 
                                            value={sal.netAmount} onChange={e => updateSAL(idx, 'netAmount', e.target.value)} />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Data SAL</label>
                                        <input disabled={readOnly} type="date" className="w-full p-2 border border-slate-300 rounded mt-1 text-sm" 
                                            value={sal.date} onChange={e => updateSAL(idx, 'date', e.target.value)} />
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                                    <h5 className="font-bold text-blue-800 text-sm mb-3 flex items-center gap-2">
                                        <Euro className="w-4 h-4"/> Certificato di Pagamento
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Data Certificato</label>
                                            <input disabled={readOnly} type="date" className="w-full p-2 border border-blue-200 rounded text-sm" 
                                                value={sal.paymentCertificateDate || ''} onChange={e => updateSAL(idx, 'paymentCertificateDate', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Importo Rata (€)</label>
                                            <input disabled={readOnly} type="text" className="w-full p-2 border border-blue-200 rounded text-sm font-semibold" placeholder="0,00"
                                                value={sal.paymentCertificateAmount || ''} onChange={e => updateSAL(idx, 'paymentCertificateAmount', e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Link Cartella Locale (Riferimento)</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <FolderOpen className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
                                            <input disabled={readOnly} type="text" className="w-full p-2 pl-9 border border-slate-300 rounded text-sm text-slate-600 font-mono" 
                                                placeholder="C:\Progetti\SAL01..."
                                                value={sal.localFolderLink || ''} onChange={e => updateSAL(idx, 'localFolderLink', e.target.value)} />
                                        </div>
                                        <button onClick={() => {navigator.clipboard.writeText(sal.localFolderLink); alert("Link copiato!");}} className="p-2 border border-slate-300 rounded hover:bg-slate-50" title="Copia percorso">
                                            <Copy className="w-4 h-4 text-slate-500"/>
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">Incolla qui il percorso della cartella sul tuo PC per riferimento futuro.</p>
                                </div>
                            </div>
                        ))}
                        {(execPhase.sals || []).length === 0 && (
                            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
                                Nessun SAL registrato.
                            </div>
                        )}
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
            readOnly={readOnly}
         />
       )}

       {tab === 'photos' && (
         <PhotoManager 
            documents={documents}
            currentDocId={currentDocId}
            onSelectDocument={onSelectDocument}
            onUpdateDocument={onUpdateDocument}
            readOnly={readOnly}
         />
       )}
    </div>
  );
};
