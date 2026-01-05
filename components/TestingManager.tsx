
import React, { useState } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { 
    Gavel, 
    FileSignature, 
    Plus, 
    Trash2, 
    Calendar, 
    Users, 
    ListChecks, 
    ChevronDown,
    Mail,
    FileText
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
  readOnly = false
}) => {
  const currentDoc = documents.find(d => d.id === currentDocId);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [step, setStep] = useState<'info' | 'admin-acts' | 'works'>('info');

  if (!currentDoc) {
      return (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <Gavel className="w-16 h-16 text-slate-200 mb-4"/>
              <h3 className="text-xl font-bold text-slate-800">Archivio Collaudo</h3>
              <p className="text-slate-500 mb-6 text-center max-w-md">Inizia creando un nuovo atto per questo intervento.</p>
              <div className="flex gap-4">
                  <button onClick={() => onNewDocument('LETTERA_CONVOCAZIONE')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-all">
                     <Mail className="w-5 h-5"/> Lettera Convocazione
                  </button>
                  <button onClick={() => onNewDocument('VERBALE_COLLAUDO')} className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:bg-slate-900 transition-all">
                     <Plus className="w-5 h-5"/> Verbale di Visita
                  </button>
              </div>
          </div>
      );
  }

  const isVerbale = currentDoc.type === 'VERBALE_COLLAUDO';
  const isNullaOsta = currentDoc.type === 'NULLA_OSTA_ENTE';
  const isLettera = currentDoc.type === 'RICHIESTA_AUTORIZZAZIONE' || currentDoc.type === 'LETTERA_CONVOCAZIONE';

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in">
       {/* Toolbar Superiore */}
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
                            {d.type.replace(/_/g, ' ')} {' - '} {new Date(d.date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                </div>
            </div>
            <div className="flex gap-2">
                <div className="relative">
                    <button onClick={() => setShowNewMenu(!showNewMenu)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2">
                        + Nuovo Atto <ChevronDown className="w-4 h-4"/>
                    </button>
                    {showNewMenu && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                            <button onClick={() => { onNewDocument('LETTERA_CONVOCAZIONE'); setShowNewMenu(false); }} className="w-full text-left p-3 hover:bg-slate-50 text-sm font-medium border-b flex items-center gap-2"><Mail className="w-4 h-4 text-blue-500"/> Lettera Convocazione</button>
                            <button onClick={() => { onNewDocument('VERBALE_COLLAUDO'); setShowNewMenu(false); }} className="w-full text-left p-3 hover:bg-slate-50 text-sm font-medium border-b flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500"/> Verbale di Visita</button>
                            <button onClick={() => { onNewDocument('NULLA_OSTA_ENTE'); setShowNewMenu(false); }} className="w-full text-left p-3 hover:bg-slate-50 text-sm font-medium flex items-center gap-2"><FileSignature className="w-4 h-4 text-blue-500"/> Nulla Osta</button>
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

       {/* Step Selection */}
       <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
          <button onClick={() => setStep('info')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 min-w-[120px] transition-all ${step === 'info' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:border-blue-200'}`}><Calendar className="w-5 h-5"/><span className="font-bold text-xs uppercase">Data e Ora</span></button>
          {isLettera && <button onClick={() => setStep('admin-acts')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 min-w-[120px] transition-all ${step === 'admin-acts' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:border-blue-200'}`}><Users className="w-5 h-5"/><span className="font-bold text-xs uppercase">Destinatari</span></button>}
          {isVerbale && <button onClick={() => setStep('works')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 min-w-[120px] transition-all ${step === 'works' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:border-blue-200'}`}><ListChecks className="w-5 h-5"/><span className="font-bold text-xs uppercase">Premesse</span></button>}
       </div>

       {/* Editor Container */}
       <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[500px]">
          {step === 'info' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-500"/> Inquadramento Temporale</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Data Appuntamento</label>
                          <input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20" value={currentDoc.date} onChange={e => onUpdateDocument({...currentDoc, date: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Ora Inizio</label>
                          <input disabled={readOnly} type="time" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20" value={currentDoc.time} onChange={e => onUpdateDocument({...currentDoc, time: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Numero Ordinale Atto</label>
                          <input disabled={readOnly} type="number" className="w-full p-3 border border-slate-300 rounded-lg font-bold text-center focus:ring-2 focus:ring-blue-500/20" value={currentDoc.visitNumber} onChange={e => onUpdateDocument({...currentDoc, visitNumber: parseInt(e.target.value) || 1})} />
                      </div>
                  </div>
              </div>
          )}

          {step === 'admin-acts' && isLettera && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2"><Users className="w-5 h-5 text-blue-500"/> Destinatari e Contenuti</h3>
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800 italic">
                      Compila il blocco destinatari separando i soggetti con un a capo. Verrà visualizzato in alto a destra.
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Blocco Destinatari (Formato Libero)</label>
                      <textarea disabled={readOnly} className="w-full p-4 border border-slate-300 rounded-lg h-48 text-sm font-mono leading-tight bg-slate-50 focus:bg-white transition-all shadow-inner" 
                          placeholder={"SPETT.LE COMMISSARIO...\nALLA C.A. DEL RUP...\nPEC: ...\n\nSIDOTI ENGINEERING..."}
                          value={currentDoc.actRecipientsBlock || ""} 
                          onChange={e => onUpdateDocument({...currentDoc, actRecipientsBlock: e.target.value})} />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Corpo della Lettera (Sovrascrivi Testo Standard)</label>
                      <textarea disabled={readOnly} className="w-full p-4 border border-slate-300 rounded-lg h-64 text-sm leading-relaxed bg-slate-50 focus:bg-white transition-