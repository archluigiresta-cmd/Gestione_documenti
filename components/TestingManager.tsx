
import React, { useState } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { GoogleGenAI } from '@google/genai';
import { 
  Plus, Trash2, Wand2, Loader2, Save, Gavel, Mail, Users, 
  MessageSquare, AlertCircle, ClipboardList, Clock, Calendar
} from 'lucide-react';

interface TestingManagerProps {
  project: ProjectConstants;
  documents: DocumentVariables[];
  onSaveDocument: (doc: DocumentVariables) => void;
  onDeleteDocument: (id: string) => void;
  onCreateDocument: (type: DocumentType) => void;
  onUpdateProject: (path: string, value: any) => void;
}

export const TestingManager: React.FC<TestingManagerProps> = ({
  project, documents, onSaveDocument, onDeleteDocument, onCreateDocument
}) => {
  const [activeSubTab, setActiveSubTab] = useState('dati');
  const [selectedDocId, setSelectedDocId] = useState(documents.find(d => d.type === 'VERBALE_COLLAUDO')?.id || '');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const currentDoc = documents.find(d => d.id === selectedDocId);

  const updateDoc = (field: keyof DocumentVariables, value: any) => {
    if (!currentDoc) return;
    onSaveDocument({ ...currentDoc, [field]: value });
  };

  const polishWithAi = async (field: keyof DocumentVariables) => {
    if (!currentDoc || !currentDoc[field]) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Agisci come un Collaudatore esperto. Riscrivi in un linguaggio burocratico e formale impeccabile (italiano tecnico lavori pubblici) questo appunto: "${currentDoc[field]}". Sii conciso ma professionale.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      if (response.text) updateDoc(field, response.text.trim());
    } catch (e) {
      alert("Errore durante l'ottimizzazione IA.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><Gavel className="w-6 h-6"/></div>
          <div>
             <h2 className="text-xl font-bold text-slate-800">Gestione Collaudo</h2>
             <select 
                className="mt-1 p-2 border-none bg-slate-50 rounded-lg text-sm font-bold text-blue-700 focus:ring-0"
                value={selectedDocId}
                onChange={e => setSelectedDocId(e.target.value)}
             >
                <option value="">-- Seleziona Verbale --</option>
                {documents.filter(d => d.type === 'VERBALE_COLLAUDO').map(d => (
                  <option key={d.id} value={d.id}>Verbale N. {d.visitNumber} - {new Date(d.date).toLocaleDateString()}</option>
                ))}
             </select>
          </div>
        </div>
        <button 
          onClick={() => onCreateDocument('VERBALE_COLLAUDO')}
          className="bg-slate-900 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/10"
        >
          <Plus className="w-4 h-4"/> Nuovo Atto
        </button>
      </div>

      {currentDoc ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
          <div className="flex border-b border-slate-100 overflow-x-auto bg-slate-50/50">
             {[
               { id: 'dati', label: 'Dati', icon: Clock },
               { id: 'presenti', label: 'Presenti', icon: Users },
               { id: 'lavori', label: 'Lavori', icon: ClipboardList },
               { id: 'valutazioni', label: 'Valutazioni', icon: MessageSquare }
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveSubTab(tab.id)}
                 className={`px-8 py-5 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                   activeSubTab === tab.id ? 'bg-white border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                 }`}
               >
                 <tab.icon className="w-4 h-4"/> {tab.label}
               </button>
             ))}
          </div>

          <div className="p-10 flex-1">
             {activeSubTab === 'dati' && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Sopralluogo</label>
                     <input type="date" className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={currentDoc.date} onChange={e => updateDoc('date', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ora Inizio</label>
                     <input type="time" className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={currentDoc.time} onChange={e => updateDoc('time', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Numero Atto</label>
                     <input type="number" className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={currentDoc.visitNumber} onChange={e => updateDoc('visitNumber', parseInt(e.target.value)||0)} />
                  </div>
                  <div className="md:col-span-3 space-y-1 mt-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dettagli Convocazione</label>
                     <textarea className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 h-24 text-sm" value={currentDoc.convocationDetails} onChange={e => updateDoc('convocationDetails', e.target.value)} placeholder="Es. PEC inviata in data..."/>
                  </div>
               </div>
             )}

             {activeSubTab === 'presenti' && (
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Elenco Partecipanti</h3>
                    <button onClick={() => polishWithAi('attendees')} className="text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-xl border border-purple-100 font-bold flex items-center gap-2 hover:bg-purple-100 disabled:opacity-50">
                      {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3"/>} Formalizza con IA
                    </button>
                  </div>
                  <textarea 
                    className="w-full p-6 border border-slate-200 rounded-3xl h-64 text-sm font-mono leading-relaxed bg-slate-50/50"
                    placeholder="Elenchi i presenti al sopralluogo..."
                    value={currentDoc.attendees}
                    onChange={e => updateDoc('attendees', e.target.value)}
                  />
               </div>
             )}

             {activeSubTab === 'lavori' && (
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Lavorazioni Accertate</h3>
                    <button onClick={() => polishWithAi('worksInProgress')} className="text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-xl border border-purple-100 font-bold flex items-center gap-2 hover:bg-purple-100">
                      <Wand2 className="w-3 h-3"/> Ottimizza Descrizioni
                    </button>
                  </div>
                  <textarea 
                    className="w-full p-6 border border-slate-200 rounded-3xl h-80 text-sm leading-relaxed bg-slate-50/50"
                    placeholder="Descriva lo stato dei lavori rilevato durante la visita..."
                    value={currentDoc.worksInProgress}
                    onChange={e => updateDoc('worksInProgress', e.target.value)}
                  />
               </div>
             )}

             {activeSubTab === 'valutazioni' && (
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Conclusioni e Osservazioni</h3>
                  </div>
                  <textarea 
                    className="w-full p-6 border border-slate-200 rounded-3xl h-80 text-sm leading-relaxed bg-slate-50/50"
                    placeholder="Inserisca le valutazioni tecniche conclusive del collaudatore..."
                    value={currentDoc.observations}
                    onChange={e => updateDoc('observations', e.target.value)}
                  />
               </div>
             )}
          </div>
          
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-2 text-xs font-bold text-green-600">
                <Save className="w-4 h-4"/> Salvataggio locale attivo
             </div>
             <div className="flex gap-4">
                <button onClick={() => setSelectedDocId('')} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-600">Chiudi</button>
                <button 
                  onClick={() => alert("Funzione esportazione PDF/Word attiva nel tab Esportazione")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20"
                >
                  Anteprima Stampa
                </button>
             </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 py-32 flex flex-col items-center justify-center text-center">
           <ClipboardList className="w-16 h-16 text-slate-200 mb-4"/>
           <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Nessun Atto Selezionato</h3>
           <p className="text-slate-300 mt-2">Seleziona un verbale esistente o creane uno nuovo per iniziare la redazione.</p>
        </div>
      )}
    </div>
  );
};
