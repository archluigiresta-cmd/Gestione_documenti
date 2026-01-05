
import React, { useState } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { 
    Gavel, 
    Plus, 
    Trash2, 
    Calendar, 
    Clock, 
    Users, 
    ListChecks, 
    Activity, 
    Wand2, 
    Loader2,
    Save,
    Mail
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [workInput, setWorkInput] = useState('');

  const polishText = async (field: 'premis' | 'observations') => {
    if (!currentDoc || !process.env.API_KEY) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Agisci come un esperto Collaudatore italiano. Riscrivi in linguaggio tecnico-formale appropriato per un verbale di collaudo il seguente testo: "${currentDoc[field]}"`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      if (response.text) {
        onUpdateDocument({ ...currentDoc, [field]: response.text.trim() });
      }
    } catch (error) {
      console.error(error);
      alert("Errore durante la generazione.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addWork = () => {
    if (currentDoc && workInput.trim()) {
      onUpdateDocument({
        ...currentDoc,
        worksExecuted: [...(currentDoc.worksExecuted || []), workInput]
      });
      setWorkInput('');
    }
  };

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

       <div className="space-y-6">
            {/* Sezione 1: Data e Convocazione */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-3">
                    <Calendar className="w-5 h-5 text-blue-500"/> Inquadramento dell'Atto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Data Sopralluogo</label>
                        <input disabled={readOnly} type="date" className="w-full p-2 border border-slate-300 rounded mt-1" value={currentDoc.date || ''} onChange={e => onUpdateDocument({...currentDoc, date: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Ora Inizio</label>
                        <input disabled={readOnly} type="time" className="w-full p-2 border border-slate-300 rounded mt-1" value={currentDoc.time || ''} onChange={e => onUpdateDocument({...currentDoc, time: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Numero Verbale</label>
                        <input disabled={readOnly} type="number" className="w-full p-2 border border-slate-300 rounded mt-1 font-bold text-center" value={currentDoc.visitNumber || 1} onChange={e => onUpdateDocument({...currentDoc, visitNumber: parseInt(e.target.value) || 1})} />
                    </div>
                    <div className="md:col-span-3">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Mail className="w-3 h-3"/> Dettagli Convocazione</label>
                        <textarea disabled={readOnly} className="w-full p-2 border border-slate-300 rounded mt-1 h-20 text-sm" placeholder="Es. Lettera PEC del..." value={currentDoc.convocationDetails || ''} onChange={e => onUpdateDocument({...currentDoc, convocationDetails: e.target.value})} />
                    </div>
                </div>
            </div>

            {/* Sezione 2: Presenti */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500"/> Soggetti Intervenuti
                </h3>
                <textarea disabled={readOnly} className="w-full p-3 border border-slate-300 rounded h-32 text-sm whitespace-pre-wrap" placeholder="Elenco dei presenti..." value={currentDoc.attendees || ''} onChange={e => onUpdateDocument({...currentDoc, attendees: e.target.value})} />
            </div>

            {/* Sezione 3: Premesse Storiche */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-blue-500"/> Premesse e Narrazione
                    </h3>
                    <button onClick={() => polishText('premis')} disabled={isGenerating} className="text-xs text-purple-600 font-bold hover:bg-purple-50 px-2 py-1 rounded flex items-center gap-1">
                        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3"/>} IA Formalizza
                    </button>
                </div>
                <textarea disabled={readOnly} className="w-full p-4 border border-slate-300 rounded-lg h-72 text-sm leading-relaxed font-mono bg-slate-50 focus:bg-white transition-all" value={currentDoc.premis || ""} onChange={e => onUpdateDocument({...currentDoc, premis: e.target.value})} placeholder="Riepilogo atti precedenti e storia dei lavori..." />
            </div>

            {/* Sezione 4: Lavorazioni */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500"/> Stato delle Lavorazioni
                </h3>
                <div className="flex gap-2 mb-4">
                    <input disabled={readOnly} type="text" className="flex-1 p-2 border border-slate-300 rounded" placeholder="Aggiungi lavorazione rilevata..." value={workInput} onChange={e => setWorkInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addWork()} />
                    <button onClick={addWork} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700">+</button>
                </div>
                <ul className="space-y-1 mb-6">
                    {currentDoc.worksExecuted.map((w, idx) => (
                        <li key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded text-sm">
                            <span>{idx + 1}. {w}</span>
                            <button onClick={() => {
                                const next = [...currentDoc.worksExecuted];
                                next.splice(idx, 1);
                                onUpdateDocument({...currentDoc, worksExecuted: next});
                            }} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3"/></button>
                        </li>
                    ))}
                </ul>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Lavori in Corso</label>
                        <textarea disabled={readOnly} className="w-full p-2 border border-slate-300 rounded h-24 text-sm mt-1" value={currentDoc.worksInProgress || ''} onChange={e => onUpdateDocument({...currentDoc, worksInProgress: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Prossime Attività</label>
                        <textarea disabled={readOnly} className="w-full p-2 border border-slate-300 rounded h-24 text-sm mt-1" value={currentDoc.upcomingWorks || ''} onChange={e => onUpdateDocument({...currentDoc, upcomingWorks: e.target.value})} />
                    </div>
                </div>
            </div>

            {/* Sezione 5: Osservazioni */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800">Osservazioni / Disposizioni</h3>
                    <button onClick={() => polishText('observations')} disabled={isGenerating} className="text-xs text-purple-600 font-bold flex items-center gap-1">
                        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3"/>} IA Formalizza
                    </button>
                </div>
                <textarea disabled={readOnly} className="w-full p-3 border border-slate-300 rounded h-32 text-sm" value={currentDoc.observations || ''} onChange={e => onUpdateDocument({...currentDoc, observations: e.target.value})} />
            </div>

            <div className="flex items-center justify-end text-[10px] text-green-600 font-bold uppercase gap-1">
                <Save className="w-3 h-3"/> Salvataggio automatico attivo
            </div>
       </div>
    </div>
  );
};
