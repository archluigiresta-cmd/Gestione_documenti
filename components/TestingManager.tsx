
import React, { useState, useEffect } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { Gavel, Plus, Trash2, Calendar, Clock, Users, ListChecks, Wand2, Loader2, Save, Mail, FileText, ChevronRight, ChevronLeft, CheckSquare } from 'lucide-react';
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
  project,
  documents = [],
  currentDocId,
  onSelectDocument,
  onUpdateDocument,
  onNewDocument,
  onDeleteDocument,
  readOnly = false
}) => {
  const currentDoc = documents.find(d => d.id === currentDocId);
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newItem, setNewItem] = useState('');

  // Sincronizza intro text se vuoto
  useEffect(() => {
    if (currentDoc && !currentDoc.worksIntroText) {
      const prevDoc = documents.find(d => d.type === currentDoc.type && d.visitNumber === (currentDoc.visitNumber - 1));
      const refDate = prevDoc ? prevDoc.date : project.executionPhase.deliveryDate;
      const text = `Durante il presente sopralluogo prende atto che, nel periodo intercorrente tra ${refDate ? new Date(refDate).toLocaleDateString() : 'la consegna dei lavori'} e la data odierna sono state effettuate le seguenti lavorazioni:`;
      onUpdateDocument({ ...currentDoc, worksIntroText: text });
    }
  }, [currentDocId]);

  if (!currentDoc) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
        <Gavel className="w-16 h-16 text-slate-200 mb-4"/>
        <h3 className="text-xl font-bold">Archivio Collaudi</h3>
        <button onClick={() => onNewDocument('VERBALE_COLLAUDO')} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Crea Primo Verbale</button>
      </div>
    );
  }

  const polish = async (field: 'premis' | 'observations') => {
    if (!process.env.API_KEY) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Agisci come un esperto collaudatore italiano. Riscrivi in linguaggio tecnico-formale professionale: "${currentDoc[field]}"`;
      const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      if (res.text) onUpdateDocument({ ...currentDoc, [field]: res.text.trim() });
    } catch (e) { console.error(e); }
    finally { setIsGenerating(false); }
  };

  const addAttendee = (role: string, name: string, title: string = '') => {
    const entry = `${role}: ${title} ${name}`.trim();
    if (!currentDoc.attendees.includes(entry)) {
      onUpdateDocument({ ...currentDoc, attendees: currentDoc.attendees + (currentDoc.attendees ? '\n' : '') + entry });
    }
  };

  const addItemToList = (field: 'worksExecuted' | 'worksInProgress' | 'upcomingWorks') => {
    if (!newItem.trim()) return;
    onUpdateDocument({ ...currentDoc, [field]: [...(currentDoc[field] || []), newItem.trim()] });
    setNewItem('');
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex items-center gap-3">
          <Gavel className="w-5 h-5 text-blue-600"/>
          <select className="font-bold border-none bg-transparent" value={currentDocId} onChange={e => onSelectDocument(e.target.value)}>
            {documents.filter(d => d.type === 'VERBALE_COLLAUDO').map(d => (
              <option key={d.id} value={d.id}>Verbale n. {d.visitNumber} del {new Date(d.date).toLocaleDateString()}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNewDocument('VERBALE_COLLAUDO')} className="bg-slate-100 px-4 py-2 rounded-lg text-sm font-bold">+ Nuovo</button>
          <button onClick={() => onDeleteDocument(currentDoc.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5"/></button>
        </div>
      </div>

      <div className="flex gap-4 mb-6 no-print">
        {[1, 2, 3, 4, 5].map(s => (
          <button key={s} onClick={() => setStep(s)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${step === s ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border'}`}>
            STEP {s}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {step === 1 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border animate-in fade-in">
            <h3 className="font-bold mb-6 flex items-center gap-2 uppercase text-sm tracking-widest text-slate-400"><Calendar className="w-4 h-4"/> 1. Inquadramento Visita</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div><label className="text-xs font-bold text-slate-500 uppercase">Data</label><input type="date" className="w-full p-2 border rounded mt-1" value={currentDoc.date} onChange={e => onUpdateDocument({...currentDoc, date: e.target.value})} /></div>
              <div><label className="text-xs font-bold text-slate-500 uppercase">Ora Inizio</label><input type="time" className="w-full p-2 border rounded mt-1" value={currentDoc.time} onChange={e => onUpdateDocument({...currentDoc, time: e.target.value})} /></div>
              <div><label className="text-xs font-bold text-slate-500 uppercase">Metodo Convocazione</label><select className="w-full p-2 border rounded mt-1" value={currentDoc.convocationMethod} onChange={e => onUpdateDocument({...currentDoc, convocationMethod: e.target.value})}><option value="PEC">PEC</option><option value="Email">Email</option><option value="Nota">Nota Protocollata</option><option value="Vie Brevi">Vie Brevi</option></select></div>
              <div className="md:col-span-3"><label className="text-xs font-bold text-slate-500 uppercase">Dettagli Convocazione (Data invio e Rif.)</label><input type="text" className="w-full p-2 border rounded mt-1" value={currentDoc.convocationDetails} onChange={e => onUpdateDocument({...currentDoc, convocationDetails: e.target.value})} placeholder="Es. PEC del 10/10/2025" /></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border animate-in fade-in">
            <h3 className="font-bold mb-6 flex items-center gap-2 uppercase text-sm tracking-widest text-slate-400"><Users className="w-4 h-4"/> 2. Soggetti Presenti</h3>
            <div className="mb-4 flex flex-wrap gap-2 p-4 bg-slate-50 rounded-lg border border-dashed">
              <span className="text-xs font-bold w-full mb-1 text-slate-400">Aggiunta rapida:</span>
              <button onClick={() => addAttendee('Responsabile Unico del Progetto', project.subjects.rup.contact.name, project.subjects.rup.contact.title)} className="px-2 py-1 bg-white border rounded text-[10px] hover:bg-blue-50">RUP</button>
              <button onClick={() => addAttendee('Direttore dei Lavori', project.subjects.dl.contact.name, project.subjects.dl.contact.title)} className="px-2 py-1 bg-white border rounded text-[10px] hover:bg-blue-50">DL</button>
              <button onClick={() => addAttendee('Coordinatore Sicurezza', project.subjects.cse.contact.name, project.subjects.cse.contact.title)} className="px-2 py-1 bg-white border rounded text-[10px] hover:bg-blue-50">CSE</button>
              <button onClick={() => addAttendee(`per l'Impresa ${project.contractor.mainCompany.name} (Legale Rappresentante)`, project.contractor.mainCompany.repName, 'Sig.')} className="px-2 py-1 bg-white border rounded text-[10px] hover:bg-blue-50">Impresa</button>
            </div>
            <textarea className="w-full p-4 border rounded h-48 text-sm font-mono" value={currentDoc.attendees} onChange={e => onUpdateDocument({...currentDoc, attendees: e.target.value})} placeholder="Elenco dei presenti..."/>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border animate-in fade-in">
            <h3 className="font-bold mb-4 flex items-center gap-2 uppercase text-sm tracking-widest text-slate-400"><ListChecks className="w-4 h-4"/> 3. Narrazione Storica (Premesse)</h3>
            <div className="flex justify-end mb-2">
              <button onClick={() => polish('premis')} className="text-xs text-purple-600 font-bold flex items-center gap-1 border border-purple-200 px-3 py-1 rounded-full hover:bg-purple-50">
                {isGenerating ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3"/>} IA Formalizza
              </button>
            </div>
            <textarea className="w-full p-4 border rounded h-96 text-sm leading-relaxed bg-slate-50 focus:bg-white" value={currentDoc.premis} onChange={e => onUpdateDocument({...currentDoc, premis: e.target.value})} placeholder="Punto 1. Nomina... Punto 2. Vecchi verbali..."/>
          </div>
        )}

        {step === 4 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border animate-in fade-in">
            <h3 className="font-bold mb-6 flex items-center gap-2 uppercase text-sm tracking-widest text-slate-400"><FileText className="w-4 h-4"/> 4. Lavorazioni Accertate</h3>
            <div className="mb-6"><label className="text-xs font-bold text-slate-500 uppercase">Frase Introduttiva</label><textarea className="w-full p-3 border rounded mt-1 h-20 text-sm italic" value={currentDoc.worksIntroText} onChange={e => onUpdateDocument({...currentDoc, worksIntroText: e.target.value})}/></div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Lavorazioni Verificate (Periodo)</label>
                <div className="flex gap-2 mt-1 mb-2">
                  <input type="text" className="flex-1 p-2 border rounded text-sm" value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItemToList('worksExecuted')} placeholder="Aggiungi lavorazione..."/>
                  <button onClick={() => addItemToList('worksExecuted')} className="bg-blue-600 text-white px-4 rounded">+</button>
                </div>
                <ul className="space-y-1">
                  {currentDoc.worksExecuted.map((w, i) => (
                    <li key={i} className="flex justify-between items-center bg-slate-50 p-2 rounded text-sm border group">
                      <input type="text" className="bg-transparent border-none flex-1 p-0 focus:ring-0" value={w} onChange={e => {
                        const next = [...currentDoc.worksExecuted]; next[i] = e.target.value; onUpdateDocument({...currentDoc, worksExecuted: next});
                      }}/>
                      <button onClick={() => {
                        const next = [...currentDoc.worksExecuted]; next.splice(i, 1); onUpdateDocument({...currentDoc, worksExecuted: next});
                      }} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-slate-500 uppercase">In Corso</label><textarea className="w-full p-2 border rounded h-32 text-sm" value={currentDoc.worksInProgress} onChange={e => onUpdateDocument({...currentDoc, worksInProgress: e.target.value})}/></div>
                <div><label className="text-xs font-bold text-slate-500 uppercase">Prossime</label><textarea className="w-full p-2 border rounded h-32 text-sm" value={currentDoc.upcomingWorks} onChange={e => onUpdateDocument({...currentDoc, upcomingWorks: e.target.value})}/></div>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border animate-in fade-in">
            <h3 className="font-bold mb-4 flex items-center gap-2 uppercase text-sm tracking-widest text-slate-400"><CheckSquare className="w-4 h-4"/> 5. Richieste & Osservazioni</h3>
            <div className="space-y-6">
              <div><label className="text-xs font-bold text-slate-500 uppercase">Richieste del Collaudatore</label><textarea className="w-full p-3 border rounded h-32 text-sm" value={currentDoc.testerRequests} onChange={e => onUpdateDocument({...currentDoc, testerRequests: e.target.value})}/></div>
              <div><label className="text-xs font-bold text-slate-500 uppercase">Inviti del Collaudatore</label><textarea className="w-full p-3 border rounded h-32 text-sm" value={currentDoc.testerInvitations} onChange={e => onUpdateDocument({...currentDoc, testerInvitations: e.target.value})}/></div>
              <div><label className="text-xs font-bold text-slate-500 uppercase">Parti Comuni / Chiusura</label><textarea className="w-full p-3 border rounded h-32 text-sm" value={currentDoc.commonParts} onChange={e => onUpdateDocument({...currentDoc, commonParts: e.target.value})}/></div>
              <div className="pt-4 border-t"><label className="text-xs font-bold text-slate-500 uppercase">Osservazioni Finali</label><textarea className="w-full p-3 border rounded h-32 text-sm" value={currentDoc.observations} onChange={e => onUpdateDocument({...currentDoc, observations: e.target.value})}/></div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl shadow-lg mt-8 text-white">
          <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><Save className="w-4 h-4 text-green-500"/> Salvataggio Database Locale</div>
          <div className="flex gap-2">
            <button disabled={step === 1} onClick={() => setStep(s => s - 1)} className="px-4 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1"><ChevronLeft className="w-3 h-3"/> Indietro</button>
            <button disabled={step === 5} onClick={() => setStep(s => s + 1)} className="px-4 py-1 rounded bg-blue-600 hover:bg-blue-500 text-xs font-bold flex items-center gap-1">Avanti <ChevronRight className="w-3 h-3"/></button>
          </div>
        </div>
      </div>
    </div>
  );
};
