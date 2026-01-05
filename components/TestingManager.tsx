
import React, { useState, useEffect } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { 
    Gavel, 
    FileSignature, 
    Plus, 
    Trash2, 
    Calendar, 
    Users, 
    ListChecks, 
    MessageSquare, 
    ClipboardCheck, 
    ChevronDown 
} from 'lucide-react';

interface TestingManagerProps {
  project: ProjectConstants;
  documents: DocumentVariables[];
  currentDocId: string;
  onSelectDocument: (id: string) => void;
  onUpdateDocument: (doc: DocumentVariables) => void;
  onNewDocument: (type: DocumentType) => void;
  onDeleteDocument: (id: string) => void;
  onUpdateProject: (p: ProjectConstants) => void;
  readOnly?: boolean;
}

export const TestingManager: React.FC<TestingManagerProps> = ({
  project,
  documents,
  currentDocId,
  onSelectDocument,
  onUpdateDocument,
  onNewDocument,
  onDeleteDocument,
  onUpdateProject,
  readOnly = false
}) => {
  const currentDoc = documents.find(d => d.id === currentDocId);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [step, setStep] = useState<'info' | 'convocation' | 'works' | 'requests' | 'invitations' | 'common' | 'eval' | 'admin-acts'>('info');

  if (!currentDoc) {
      return (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <Gavel className="w-16 h-16 text-slate-200 mb-4"/>
              <h3 className="text-xl font-bold text-slate-800">Nessun documento in archivio</h3>
              <p className="text-slate-500 mb-6 text-center max-w-md">Scegli il tipo di documento da predisporre.</p>
              <div className="flex gap-4">
                  <button onClick={() => onNewDocument('NULLA_OSTA_ENTE')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:bg-blue-700">
                     <FileSignature className="w-5 h-5"/> Crea Nulla Osta
                  </button>
                  <button onClick={() => onNewDocument('VERBALE_COLLAUDO')} className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:bg-slate-900">
                     <Plus className="w-5 h-5"/> Crea Primo Verbale
                  </button>
              </div>
          </div>
      );
  }

  const isVerbale = currentDoc.type === 'VERBALE_COLLAUDO';
  const isNullaOsta = currentDoc.type === 'NULLA_OSTA_ENTE';
  const isLettera = currentDoc.type === 'RICHIESTA_AUTORIZZAZIONE' || currentDoc.type === 'LETTERA_CONVOCAZIONE';

  // Se cambiamo documento e siamo su uno step non valido, torniamo a 'info'
  useEffect(() => {
    if (isNullaOsta && (step === 'works' || step === 'convocation')) setStep('info');
    if (isVerbale && step === 'admin-acts') setStep('info');
  }, [currentDocId, isNullaOsta, isVerbale, step]);

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in">
       <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                    {isNullaOsta ? <FileSignature className="w-5 h-5 text-blue-600"/> : <Gavel className="w-5 h-5 text-blue-600"/>}
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Documento Selezionato:</span>
                    <select 
                      className="p-0 border-none font-bold text-slate-800 bg-transparent focus:ring-0 cursor-pointer min-w-[200px]"
                      value={currentDocId}
                      onChange={(e) => onSelectDocument(e.target.value)}
                    >
                      {documents.map(d => (
                        <option key={d.id} value={d.id}>
                            {d.type === 'VERBALE_COLLAUDO' ? `Verbale N. ${d.visitNumber}` : 
                             d.type === 'NULLA_OSTA_ENTE' ? 'Nulla Osta' : 
                             d.type === 'RICHIESTA_AUTORIZZAZIONE' ? 'Richiesta Aut.' : 'Lettera Convoc.'} 
                            {' - '} {new Date(d.date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                </div>
            </div>
            <div className="flex gap-2">
                <div className="relative">
                    <button onClick={() => setShowNewMenu(!showNewMenu)} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 flex items-center gap-2">
                        + Nuova Predisposizione <ChevronDown className="w-4 h-4"/>
                    </button>
                    {showNewMenu && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                            <button onClick={() => { onNewDocument('VERBALE_COLLAUDO'); setShowNewMenu(false); }} className="w-full text-left p-3 hover:bg-slate-50 text-sm font-medium border-b">Nuovo Verbale di Visita</button>
                            <button onClick={() => { onNewDocument('NULLA_OSTA_ENTE'); setShowNewMenu(false); }} className="w-full text-left p-3 hover:bg-slate-50 text-sm font-medium border-b">Nuovo Nulla Osta</button>
                            <button onClick={() => { onNewDocument('RICHIESTA_AUTORIZZAZIONE'); setShowNewMenu(false); }} className="w-full text-left p-3 hover:bg-slate-50 text-sm font-medium border-b">Nuova Lettera Autorizzazione</button>
                            <button onClick={() => { onNewDocument('LETTERA_CONVOCAZIONE'); setShowNewMenu(false); }} className="w-full text-left p-3 hover:bg-slate-50 text-sm font-medium">Nuova Lettera Convocazione</button>
                        </div>
                    )}
                </div>
                {!readOnly && (
                    <button onClick={() => onDeleteDocument(currentDoc.id)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5"/>
                    </button>
                )}
            </div>
       </div>

       <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
          <button onClick={() => setStep('info')} className={`p-3 rounded-xl border flex flex-col items-center gap-2 min-w-[100px] ${step === 'info' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md' : 'bg-white text-slate-500 hover:border-blue-200'}`}><Calendar className="w-5 h-5"/><span className="font-bold text-xs">Dati Gen.</span></button>
          
          {(isNullaOsta || isLettera) && <button onClick={() => setStep('admin-acts')} className={`p-3 rounded-xl border flex flex-col items-center gap-2 min-w-[100px] ${step === 'admin-acts' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md' : 'bg-white text-slate-500 hover:border-blue-200'}`}><FileSignature className="w-5 h-5"/><span className="font-bold text-xs">Contenuti Atto</span></button>}
          
          {isVerbale && (
              <>
                  <button onClick={() => setStep('convocation')} className={`p-3 rounded-xl border flex flex-col items-center gap-2 min-w-[100px] ${step === 'convocation' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md' : 'bg-white text-slate-500 hover:border-blue-200'}`}><Users className="w-5 h-5"/><span className="font-bold text-xs">Presenti</span></button>
                  <button onClick={() => setStep('works')} className={`p-3 rounded-xl border flex flex-col items-center gap-2 min-w-[100px] ${step === 'works' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md' : 'bg-white text-slate-500 hover:border-blue-200'}`}><ListChecks className="w-5 h-5"/><span className="font-bold text-xs">Lavori</span></button>
                  <button onClick={() => setStep('requests')} className={`p-3 rounded-xl border flex flex-col items-center gap-2 min-w-[100px] ${step === 'requests' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md' : 'bg-white text-slate-500 hover:border-blue-200'}`}><MessageSquare className="w-5 h-5"/><span className="font-bold text-xs">Richieste</span></button>
                  <button onClick={() => setStep('eval')} className={`p-3 rounded-xl border flex flex-col items-center gap-2 min-w-[100px] ${step === 'eval' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md' : 'bg-white text-slate-500 hover:border-blue-200'}`}><ClipboardCheck className="w-5 h-5"/><span className="font-bold text-xs">Valutazioni</span></button>
              </>
          )}
       </div>

       <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[400px]">
          {step === 'info' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4">Inquadramento Documento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Data del Documento</label>
                          <input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                            value={currentDoc.date} onChange={e => onUpdateDocument({...currentDoc, date: e.target.value})} />
                      </div>
                      {isVerbale ? (
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">Numero Progressivo Verbale</label>
                              <input disabled={readOnly} type="number" className="w-full p-3 border border-slate-300 rounded-lg font-mono text-center text-lg"
                                value={currentDoc.visitNumber} onChange={e => onUpdateDocument({...currentDoc, visitNumber: parseInt(e.target.value) || 0})} />
                          </div>
                      ) : (
                          <div>
                             <label className="block text-sm font-bold text-slate-700 mb-2">Ora (Opzionale)</label>
                             <input disabled={readOnly} type="time" className="w-full p-3 border border-slate-300 rounded-lg"
                                value={currentDoc.time} onChange={e => onUpdateDocument({...currentDoc, time: e.target.value})} />
                          </div>
                      )}
                  </div>
              </div>
          )}

          {step === 'admin-acts' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2"><FileSignature className="w-5 h-5"/> {isNullaOsta ? 'Testi Personalizzati Nulla Osta' : 'Testi Lettera'}</h3>
                  
                  {isNullaOsta && (
                      <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Riferimenti Normativi (Sezione in alto)</label>
                            <textarea disabled={readOnly} className="w-full p-3 border border-slate-300 rounded-lg h-20 text-xs font-mono" 
                                value={currentDoc.nullaOstaLegalRefs || ""} onChange={e => onUpdateDocument({...currentDoc, nullaOstaLegalRefs: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Premessa Autorità (Vista la richiesta del Commissario...)</label>
                            <textarea disabled={readOnly} className="w-full p-3 border border-slate-300 rounded-lg h-32 text-xs font-mono" 
                                value={currentDoc.nullaOstaRequestBlock || ""} onChange={e => onUpdateDocument({...currentDoc, nullaOstaRequestBlock: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dichiarazioni Finali (Accertato che... Valutata altresì...)</label>
                            <textarea disabled={readOnly} className="w-full p-3 border border-slate-300 rounded-lg h-32 text-xs font-mono" 
                                value={currentDoc.nullaOstaObservationsBlock || ""} onChange={e => onUpdateDocument({...currentDoc, nullaOstaObservationsBlock: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Firmatario dell'Atto</label>
                                <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded-lg text-sm font-bold" 
                                    value={currentDoc.nullaOstaSignatory || ""} onChange={e => onUpdateDocument({...currentDoc, nullaOstaSignatory: e.target.value})} placeholder="Es: Dott. Marco LESTO"/>
                            </div>
                        </div>
                      </div>
                  )}

                  {(isLettera) && (
                      <div className="space-y-4">
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Oggetto Specifico Lettera</label>
                            <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded-lg text-sm" 
                                value={currentDoc.actSubject || ""} onChange={e => onUpdateDocument({...currentDoc, actSubject: e.target.value})} />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Testo del Corpo Lettera (Sovrascrive lo standard)</label>
                            <textarea disabled={readOnly} className="w-full p-3 border border-slate-300 rounded-lg h-40 text-sm" 
                                value={currentDoc.actBodyOverride || ""} onChange={e => onUpdateDocument({...currentDoc, actBodyOverride: e.target.value})} />
                         </div>
                      </div>
                  )}
              </div>
          )}
       </div>
    </div>
  );
};
