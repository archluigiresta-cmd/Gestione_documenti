
import React from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { 
    Gavel, 
    Plus, 
    Trash2, 
    Calendar, 
    Clock, 
    ListChecks,
    Save
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
  documents = [],
  currentDocId,
  onSelectDocument,
  onUpdateDocument,
  onNewDocument,
  onDeleteDocument,
  readOnly = false
}) => {
  const currentDoc = documents.find(d => d.id === currentDocId);

  if (!currentDoc) {
      return (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <Gavel className="w-16 h-16 text-slate-200 mb-4"/>
              <h3 className="text-xl font-bold text-slate-800">Archivio Verbali di Collaudo</h3>
              <p className="text-slate-500 mb-6 text-center max-w-md">Nessun verbale presente. Clicca il tasto sotto per iniziare.</p>
              <button onClick={() => onNewDocument('VERBALE_COLLAUDO')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-all">
                 <Plus className="w-5 h-5"/> Crea Primo Verbale
              </button>
          </div>
      );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in">
       {/* Toolbar */}
       <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <Gavel className="w-5 h-5 text-blue-600"/>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verbale Selezionato:</span>
                    <select 
                      className="p-0 border-none font-bold text-slate-800 bg-transparent focus:ring-0 cursor-pointer min-w-[200px]"
                      value={currentDocId}
                      onChange={(e) => onSelectDocument(e.target.value)}
                    >
                      {documents.filter(d => d.type === 'VERBALE_COLLAUDO').map(d => (
                        <option key={d.id} value={d.id}>
                            Verbale n. {d.visitNumber || 1} del {d.date ? new Date(d.date).toLocaleDateString() : 'N/D'}
                        </option>
                      ))}
                    </select>
                </div>
            </div>
            <div className="flex gap-2">
                {!readOnly && (
                    <>
                        <button onClick={() => onNewDocument('VERBALE_COLLAUDO')} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 flex items-center gap-2">
                            <Plus className="w-4 h-4"/> Nuovo
                        </button>
                        <button onClick={() => onDeleteDocument(currentDoc.id)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-5 h-5"/>
                        </button>
                    </>
                )}
            </div>
       </div>

       {/* Editor */}
       <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Data Sopralluogo</label>
                    <input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg" value={currentDoc.date || ''} onChange={e => onUpdateDocument({...currentDoc, date: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Ora Inizio</label>
                    <input disabled={readOnly} type="time" className="w-full p-3 border border-slate-300 rounded-lg" value={currentDoc.time || ''} onChange={e => onUpdateDocument({...currentDoc, time: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Numero Verbale</label>
                    <input disabled={readOnly} type="number" className="w-full p-3 border border-slate-300 rounded-lg font-bold text-center" value={currentDoc.visitNumber || 1} onChange={e => onUpdateDocument({...currentDoc, visitNumber: parseInt(e.target.value) || 1})} />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest flex items-center gap-2">
                    <ListChecks className="w-4 h-4"/> Premesse e Narrazione
                </label>
                <textarea disabled={readOnly} className="w-full p-4 border border-slate-300 rounded-lg h-96 text-sm leading-relaxed font-mono bg-slate-50 focus:bg-white transition-all" 
                    placeholder="Inserisci qui le premesse storiche e la descrizione delle attività..."
                    value={currentDoc.premis || ""} 
                    onChange={e => onUpdateDocument({...currentDoc, premis: e.target.value})} />
            </div>

            <div className="flex items-center justify-end text-[10px] text-green-600 font-bold uppercase gap-1">
                <Save className="w-3 h-3"/> Dati salvati automaticamente nel database locale
            </div>
       </div>
    </div>
  );
};
