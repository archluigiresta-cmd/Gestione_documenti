
import React, { useState, useEffect } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { Gavel, Plus, Trash2, Calendar, Clock, Users, ListChecks, Wand2, Loader2, Save, Mail, FileText, ChevronRight, ChevronLeft, CheckSquare, MessageSquare, Briefcase, Layout } from 'lucide-react';
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
  const [subTab, setSubTab] = useState<'info' | 'convocation' | 'attendees' | 'works' | 'requests' | 'invites' | 'common' | 'evaluations'>('info');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [tempText, setTempText] = useState('');

  const currentDoc = documents.find(d => d.id === currentDocId);

  // Inizializzazione automatica frase introduttiva
  useEffect(() => {
    if (currentDoc && !currentDoc.worksIntroText) {
      const prevDoc = [...documents].filter(d => d.type === currentDoc.type && d.visitNumber < currentDoc.visitNumber).sort((a,b) => b.visitNumber - a.visitNumber)[0];
      const refDate = prevDoc ? prevDoc.date : project.executionPhase.deliveryDate;
      const text = `Durante il presente sopralluogo prende atto che, nel periodo intercorrente tra ${refDate ? new Date(refDate).toLocaleDateString() : 'la consegna dei lavori'} e la data odierna sono state effettuate le seguenti lavorazioni:`;
      onUpdateDocument({ ...currentDoc, worksIntroText: text });
    }
  }, [currentDocId]);

  if (!currentDoc) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
        <Gavel className="w-16 h-16 text-slate-200 mb-4"/>
        <h3 className="text-xl font-bold">Archivio Verbali di Collaudo</h3>
        <button onClick={() => onNewDocument('VERBALE_COLLAUDO')} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Crea Primo Verbale</button>
      </div>
    );
  }

  const polish = async (field: 'premis' | 'observations') => {
    if (!process.env.API_KEY) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Agisci come esperto collaudatore italiano. Riscrivi in linguaggio tecnico-formale professionale: "${currentDoc[field]}"`;
      const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      if (res.text) onUpdateDocument({ ...currentDoc, [field]: res.text.trim() });
    } catch (e) { console.error(e); }
    finally { setIsGenerating(false); }
  };

  const getSubjectName = (role: 'rup' | 'dl' | 'cse') => {
    const s = project.subjects[role];
    if (!s) return '';
    return `${s.contact.title || ''} ${s.contact.name}`.trim();
  };

  const addAttendee = (role: string, name: string) => {
    const entry = `${role}: ${name}`.trim();
    if (!currentDoc.attendees.includes(entry)) {
      onUpdateDocument({ ...currentDoc, attendees: (currentDoc.attendees + (currentDoc.attendees ? '\n' : '') + entry).trim() });
    }
  };

  const addItemToList = (field: 'worksExecuted' | 'worksInProgress' | 'upcomingWorks') => {
    if (!newItem.trim()) return;
    onUpdateDocument({ ...currentDoc, [field]: [...(currentDoc[field] || []), newItem.trim()] });
    setNewItem('');
  };

  const addToDocumentField = (field: 'testerRequests' | 'testerInvitations' | 'commonParts', text: string) => {
    if (!text.trim()) return;
    const currentVal = currentDoc[field] || '';
    onUpdateDocument({ ...currentDoc, [field]: (currentVal + (currentVal ? '\n' : '') + text.trim()).trim() });
    setTempText('');
  };

  const OPTIONS = {
    requests: [
      "se rispetto al progetto appaltato vi siano previsioni di varianti e, in caso di riscontro positivo, se le stesse siano state gestite formalmente;",
      "se vi siano ritardi rispetto al cronoprogramma e, in caso di riscontro positivo, cosa si stia facendo per allineare le attività al cronoprogramma.",
      "Altro..."
    ],
    invites: [
      "Ad osservare tutte le disposizioni riportate nel PSC e nel POS quest’ultimo redatto dall’impresa esecutrice delle opere;",
      "ad astenersi dal porre in essere qualsivoglia opera di carattere strutturale in mancanza della verifica e del preventivo assenso da parte dello scrivente collaudatore;",
      "Ad osservare tutte le prescrizioni indicate negli elaborati tecnici esecutivi delle opere in esecuzione...",
      "Altro..."
    ],
    common: [
      "Di quanto ispezionato si è effettuato il rilievo fotografico allegato al presente verbale per farne parte integrante.",
      "Per le parti non più ispezionabili... l'impresa ha dichiarato non esservi difformità o vizi.",
      "Le parti si aggiornano, per la seconda visita di collaudo, a data da concordarsi...",
      "Altro..."
    ]
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* TOOLBAR SUPERIORE */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <Gavel className="w-6 h-6 text-blue-600"/>
          <select 
            className="font-bold border-none bg-transparent text-lg focus:ring-0" 
            value={currentDocId} 
            onChange={e => onSelectDocument(e.target.value)}
          >
                {documents.filter(d => d.type === 'VERBALE_COLLAUDO').map(d => (
                <option key={d.id} value={d.id}>Verbale Visita Collaudo n. {d.visitNumber} del {new Date(d.date).toLocaleDateString()}</option>
                ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNewDocument('VERBALE_COLLAUDO')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md">+ Nuovo Verbale</button>
          <button onClick={() => onDeleteDocument(currentDoc.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5"/></button>
        </div>
      </div>

      {/* SOTTO-NAVIGAZIONE SCHEDE */}
      <div className="flex bg-white rounded-xl p-1 mb-8 shadow-sm border border-slate-200 overflow-x-auto no-scrollbar">
          {[
              { id: 'info', label: 'Dati', icon: Calendar },
              { id: 'convocation', label: 'Convocazione', icon: Mail },
              { id: 'attendees', label: 'Presenti', icon: Users },
              { id: 'works', label: 'Lavori', icon: ListChecks },
              { id: 'requests', label: 'Richieste', icon: MessageSquare },
              { id: 'invites', label: 'Inviti', icon: Briefcase },
              { id: 'common', label: 'Parti Comuni', icon: Layout },
              { id: 'evaluations', label: 'Valutazioni', icon: FileText },
          ].map((t) => (
              <button key={t.id} onClick={() => setSubTab(t.id as any)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${subTab === t.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <t.icon className="w-4 h-4" /> {t.label}
              </button>
          ))}
      </div>

      <div className="space-y-6">
        {subTab === 'info' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold mb-6 flex items-center gap-2 uppercase text-sm tracking-widest text-slate-400 border-b pb-3"><Calendar className="w-4 h-4"/> 1. Dati Verbale</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div><label className="text-[10px] font-bold text-slate-500 uppercase">Data Sopralluogo</label><input type="date" className="w-full p-3 border rounded-xl bg-slate-50" value={currentDoc.date} onChange={e => onUpdateDocument({...currentDoc, date: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase">Ora Inizio</label><input type="time" className="w-full p-3 border rounded-xl bg-slate-50" value={currentDoc.time} onChange={e => onUpdateDocument({...currentDoc, time: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase">Numero Verbale</label><input type="number" className="w-full p-3 border rounded-xl bg-slate-50 font-bold" value={currentDoc.visitNumber} onChange={e => onUpdateDocument({...currentDoc, visitNumber: parseInt(e.target.value) || 1})} /></div>
            </div>
          </div>
        )}

        {subTab === 'convocation' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold mb-6 flex items-center gap-2 uppercase text-sm tracking-widest text-slate-400 border-b pb-3"><Mail className="w-4 h-4"/> 2. Convocazione</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Metodo Invio</label>
                <select className="w-full p-3 border rounded-xl bg-slate-50" value={currentDoc.convocationMethod} onChange={e => onUpdateDocument({...currentDoc, convocationMethod: e.target.value})}>
                    <option value="PEC">PEC</option><option value="Email">Email</option><option value="Nota Protocollata">Nota Protocollata</option><option value="Vie Brevi">Vie Brevi</option>
                </select>
              </div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase">Data Invio</label><input type="date" className="w-full p-3 border rounded-xl bg-slate-50" value={currentDoc.convocationDate} onChange={e => onUpdateDocument({...currentDoc, convocationDate: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="text-[10px] font-bold text-slate-500 uppercase">Dettagli Convocazione (Rif.)</label><input type="text" className="w-full p-3 border rounded-xl bg-slate-50" value={currentDoc.convocationDetails} onChange={e => onUpdateDocument({...currentDoc, convocationDetails: e.target.value})} placeholder="Es. PEC del 10/10/2025" /></div>
            </div>
          </div>
        )}

        {subTab === 'attendees' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h3 className="font-bold flex items-center gap-2 uppercase text-sm tracking-widest text-slate-400"><Users className="w-4 h-4"/> 3. Soggetti Presenti</h3>
                <div className="flex gap-2">
                    <button onClick={() => addAttendee('Responsabile Unico del Progetto', getSubjectName('rup'))} className="px-2 py-1 bg-blue-50 border rounded text-[10px] font-bold text-blue-600">+ RUP</button>
                    <button onClick={() => addAttendee('Direttore dei Lavori', getSubjectName('dl'))} className="px-2 py-1 bg-blue-50 border rounded text-[10px] font-bold text-blue-600">+ DL</button>
                    <button onClick={() => addAttendee('Coord. Sicurezza Esecuzione', getSubjectName('cse'))} className="px-2 py-1 bg-blue-50 border rounded text-[10px] font-bold text-blue-600">+ CSE</button>
                    <button onClick={() => addAttendee(`per l'Impresa ${project.contractor.mainCompany.name} (Legale Rappresentante)`, `Sig. ${project.contractor.mainCompany.repName}`)} className="px-2 py-1 bg-blue-50 border rounded text-[10px] font-bold text-blue-600">+ Impresa</button>
                </div>
            </div>
            <textarea className="w-full p-5 border rounded-2xl h-64 text-sm font-mono leading-relaxed bg-slate-50 shadow-inner" value={currentDoc.attendees} onChange={e => onUpdateDocument({...currentDoc, attendees: e.target.value})} placeholder="Elenco dei presenti..."/>
          </div>
        )}

        {subTab === 'works' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold mb-6 flex items-center gap-2 uppercase text-sm tracking-widest text-slate-400 border-b pb-3"><ListChecks className="w-4 h-4"/> 4. Lavorazioni Accertate</h3>
            <div className="mb-8">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Frase Introduttiva (Editabile)</label>
                <textarea className="w-full p-4 border rounded-xl h-24 text-sm italic bg-slate-50" value={currentDoc.worksIntroText} onChange={e => onUpdateDocument({...currentDoc, worksIntroText: e.target.value})}/>
            </div>
            <div className="space-y-6">
                <div>
                    <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">Riepilogo Lavori Periodo</label>
                    <div className="flex gap-2 mb-2">
                        <input type="text" className="flex-1 p-2 border rounded-lg text-sm" value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItemToList('worksExecuted')} placeholder="Aggiungi lavorazione..."/>
                        <button onClick={() => addItemToList('worksExecuted')} className="bg-blue-600 text-white px-4 rounded-lg font-bold">+</button>
                    </div>
                    <ul className="space-y-1">
                        {currentDoc.worksExecuted.map((w, i) => (
                            <li key={i} className="flex justify-between items-center bg-slate-50 p-2 rounded border text-sm">
                                <input type="text" className="bg-transparent border-none flex-1 p-0 focus:ring-0" value={w} onChange={e => { const next = [...currentDoc.worksExecuted]; next[i] = e.target.value; onUpdateDocument({...currentDoc, worksExecuted: next}); }}/>
                                <button onClick={() => { const next = [...currentDoc.worksExecuted]; next.splice(i, 1); onUpdateDocument({...currentDoc, worksExecuted: next}); }} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">In Corso di Esecuzione</label>
                        <textarea className="w-full p-3 border rounded-xl h-32 text-sm bg-slate-50" value={currentDoc.worksInProgress} onChange={e => onUpdateDocument({...currentDoc, worksInProgress: e.target.value})}/>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Prossime Attività</label>
                        <textarea className="w-full p-3 border rounded-xl h-32 text-sm bg-slate-50" value={currentDoc.upcomingWorks} onChange={e => onUpdateDocument({...currentDoc, upcomingWorks: e.target.value})}/>
                    </div>
                </div>
            </div>
          </div>
        )}

        {['requests', 'invites', 'common'].includes(subTab) && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold mb-6 flex items-center gap-2 uppercase text-sm tracking-widest text-slate-400 border-b pb-3">
                    {subTab === 'requests' ? '5. Richieste' : subTab === 'invites' ? '6. Inviti' : '7. Parti Comuni'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Seleziona Frase Standard</label>
                        <select className="w-full p-3 border rounded-xl bg-slate-50 text-sm" onChange={e => setTempText(e.target.value === 'Altro...' ? '' : e.target.value)}>
                            <option value="">-- Scegli --</option>
                            {OPTIONS[subTab as keyof typeof OPTIONS].map((opt, idx) => <option key={idx} value={opt}>{opt.substring(0, 60)}...</option>)}
                        </select>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <label className="text-[10px] font-bold text-blue-800 uppercase mb-2 block">Editabile prima dell'inserimento</label>
                            <textarea className="w-full p-3 border rounded-lg h-32 text-sm" value={tempText} onChange={e => setTempText(e.target.value)} />
                            <button onClick={() => addToDocumentField(subTab === 'requests' ? 'testerRequests' : subTab === 'invites' ? 'testerInvitations' : 'commonParts', tempText)} className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-xs uppercase shadow-md">Aggiungi al Documento</button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Contenuto nel Verbale</label>
                        <textarea className="w-full p-4 border rounded-2xl h-72 text-sm leading-relaxed bg-slate-50 font-serif" value={currentDoc[subTab === 'requests' ? 'testerRequests' : subTab === 'invites' ? 'testerInvitations' : 'commonParts']} onChange={e => onUpdateDocument({...currentDoc, [subTab === 'requests' ? 'testerRequests' : subTab === 'invites' ? 'testerInvitations' : 'commonParts']: e.target.value})}/>
                    </div>
                </div>
            </div>
        )}

        {subTab === 'evaluations' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h3 className="font-bold flex items-center gap-2 uppercase text-sm tracking-widest text-slate-400"><FileText className="w-4 h-4"/> 8. Valutazioni Conclusive</h3>
                <button onClick={() => polish('observations')} disabled={isGenerating} className="text-xs text-purple-600 font-bold flex items-center gap-1 border border-purple-200 px-3 py-1 rounded-full hover:bg-purple-50">
                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3"/>} IA Formalizza
                </button>
            </div>
            <textarea className="w-full p-6 border rounded-2xl h-96 text-sm leading-relaxed font-serif bg-slate-50 shadow-inner" value={currentDoc.observations} onChange={e => onUpdateDocument({...currentDoc, observations: e.target.value})} placeholder="Inserisci valutazioni o riserve dell'impresa..."/>
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl shadow-xl mt-8 text-white">
          <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 opacity-80"><Save className="w-4 h-4 text-green-500"/> Salvataggio Database Locale</div>
        </div>
      </div>
    </div>
  );
};
