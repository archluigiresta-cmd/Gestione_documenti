
import React, { useState } from 'react';
import { DocumentVariables } from '../types';
import { Calendar, Clock, Plus, Trash2, Wand2, Loader2, Save } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface WorksManagerProps {
  documents: DocumentVariables[];
  currentDocId: string;
  onSelectDocument: (id: string) => void;
  onUpdateDocument: (doc: DocumentVariables) => void;
  onNewDocument: () => void;
  onDeleteDocument: (id: string) => void;
  readOnly?: boolean; // NEW
}

export const WorksManager: React.FC<WorksManagerProps> = ({ 
  documents, 
  currentDocId, 
  onSelectDocument, 
  onUpdateDocument,
  onNewDocument,
  onDeleteDocument,
  readOnly = false
}) => {
  const currentDoc = documents.find(d => d.id === currentDocId) || documents[0];
  const [workInput, setWorkInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Helper to safely get API Key
  const getApiKey = () => {
    try {
      if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        return process.env.API_KEY;
      }
    } catch (e) {
      console.warn("Process env not available");
    }
    return null;
  };

  const polishText = async (field: 'premis' | 'observations') => {
    if (readOnly) return;
    const apiKey = getApiKey();
    if (!apiKey) {
      alert("API Key mancante. Impossibile usare l'IA.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Riscrivi in linguaggio tecnico/burocratico per verbale lavori pubblici: "${currentDoc[field]}"`;
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      if (response.text) onUpdateDocument({ ...currentDoc, [field]: response.text.trim() });
    } catch (error) {
      console.error(error);
      alert("Errore durante la generazione del testo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addWork = () => {
    if (readOnly) return;
    if (workInput.trim()) {
      onUpdateDocument({
        ...currentDoc,
        worksExecuted: [...currentDoc.worksExecuted, workInput]
      });
      setWorkInput('');
    }
  };

  const removeWork = (index: number) => {
    if (readOnly) return;
    const newWorks = [...currentDoc.worksExecuted];
    newWorks.splice(index, 1);
    onUpdateDocument({ ...currentDoc, worksExecuted: newWorks });
  };

  if (!currentDoc) return <div>Nessun documento selezionato</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* Header with Selector */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
         <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800">Giornale dei Lavori</h2>
            <select 
               className="p-2 border border-blue-200 bg-blue-50 text-blue-800 rounded font-semibold"
               value={currentDocId}
               onChange={(e) => onSelectDocument(e.target.value)}
            >
               {documents.map(d => (
                 <option key={d.id} value={d.id}>
                    Verbale n. {d.visitNumber} del {new Date(d.date).toLocaleDateString()}
                 </option>
               ))}
            </select>
            {!readOnly && (
                <button onClick={onNewDocument} className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded hover:bg-slate-700">
                   + Nuovo
                </button>
            )}
            {documents.length > 1 && !readOnly && (
               <button onClick={() => onDeleteDocument(currentDoc.id)} className="text-xs text-red-500 hover:text-red-700 px-3 py-1.5">
                 Elimina
               </button>
            )}
         </div>
         <div className="flex items-center gap-2 text-green-600 text-xs font-medium">
             <Save className="w-3 h-3" /> Salvataggio automatico
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Left Column: Details */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="font-bold text-slate-800 mb-4">Dettagli Temporali</h3>
               <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-1">
                       <Calendar className="w-3 h-3" /> Data
                    </label>
                    <input disabled={readOnly}
                      type="date" 
                      className="w-full p-2 border border-slate-300 rounded disabled:bg-slate-100" 
                      value={currentDoc.date}
                      onChange={(e) => onUpdateDocument({...currentDoc, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-1">
                       <Clock className="w-3 h-3" /> Ora Inizio
                    </label>
                    <input disabled={readOnly}
                      type="time" 
                      className="w-full p-2 border border-slate-300 rounded disabled:bg-slate-100" 
                      value={currentDoc.time}
                      onChange={(e) => onUpdateDocument({...currentDoc, time: e.target.value})}
                    />
                  </div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="font-bold text-slate-800 mb-4">Convocazione e Presenti</h3>
               <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dettagli Convocazione</label>
                    <textarea disabled={readOnly}
                      className="w-full p-2 border border-slate-300 rounded text-sm h-20 disabled:bg-slate-100"
                      placeholder="Es. PEC del..."
                      value={currentDoc.convocationDetails}
                      onChange={(e) => onUpdateDocument({...currentDoc, convocationDetails: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Soggetti Presenti</label>
                    <textarea disabled={readOnly}
                      className="w-full p-2 border border-slate-300 rounded text-sm h-32 disabled:bg-slate-100"
                      placeholder="Elenco presenti..."
                      value={currentDoc.attendees}
                      onChange={(e) => onUpdateDocument({...currentDoc, attendees: e.target.value})}
                    />
                  </div>
               </div>
            </div>
         </div>

         {/* Right Column: Content */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* Works Executed */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="text-lg font-bold text-slate-800 mb-2">Lavorazioni Eseguite Oggi</h3>
               <div className="flex gap-2 mb-4">
                  <input disabled={readOnly}
                     type="text" 
                     className="flex-1 p-3 border border-slate-300 rounded-lg disabled:bg-slate-100"
                     placeholder="Descrivi la lavorazione..."
                     value={workInput}
                     onChange={(e) => setWorkInput(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && addWork()}
                  />
                  {!readOnly && (
                    <button onClick={addWork} className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700">
                        <Plus className="w-5 h-5" />
                    </button>
                  )}
               </div>
               <ul className="space-y-2">
                  {currentDoc.worksExecuted.map((work, idx) => (
                     <li key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-100">
                        <span className="text-sm text-slate-700"><span className="font-mono text-slate-400 mr-2">{idx+1}.</span> {work}</span>
                        {!readOnly && (
                            <button onClick={() => removeWork(idx)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                        )}
                     </li>
                  ))}
                  {currentDoc.worksExecuted.length === 0 && <p className="text-slate-400 italic text-sm text-center py-4">Nessuna lavorazione inserita.</p>}
               </ul>
            </div>

            {/* Premis */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-slate-800">Premesse</h3>
                  {!readOnly && (
                    <button onClick={() => polishText('premis')} className="text-xs text-purple-600 flex items-center gap-1 hover:bg-purple-50 px-2 py-1 rounded">
                        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3"/>} IA Assist
                    </button>
                  )}
               </div>
               <textarea disabled={readOnly}
                  className="w-full p-4 border border-slate-300 rounded-lg text-sm h-32 disabled:bg-slate-100"
                  value={currentDoc.premis}
                  onChange={(e) => onUpdateDocument({...currentDoc, premis: e.target.value})}
               />
            </div>

            {/* Observations */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-slate-800">Osservazioni / Disposizioni</h3>
                  {!readOnly && (
                    <button onClick={() => polishText('observations')} className="text-xs text-purple-600 flex items-center gap-1 hover:bg-purple-50 px-2 py-1 rounded">
                        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3"/>} IA Assist
                    </button>
                  )}
               </div>
               <textarea disabled={readOnly}
                  className="w-full p-4 border border-slate-300 rounded-lg text-sm h-32 disabled:bg-slate-100"
                  value={currentDoc.observations}
                  onChange={(e) => onUpdateDocument({...currentDoc, observations: e.target.value})}
               />
            </div>
         </div>
      </div>
    </div>
  );
};
