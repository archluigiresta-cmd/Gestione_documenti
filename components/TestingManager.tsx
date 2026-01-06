
import React, { useState, useEffect } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { Gavel, Plus, Trash2, Calendar, Clock, Users, ListChecks, Wand2, Loader2, Save, Mail, FileText, RefreshCw, MessageSquare, Briefcase, Layout } from 'lucide-react';
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

  const generateIntroText = () => {
    if (!currentDoc) return;
    const sorted = [...documents].filter(d => d.type === 'VERBALE_COLLAUDO' && d.visitNumber < currentDoc.visitNumber).sort((a,b) => b.visitNumber - a.visitNumber);
    const last = sorted[0];
    const refDate = last ? new Date(last.date).toLocaleDateString() : 'la consegna dei lavori';
    const text = `Durante il presente sopralluogo prende atto che, nel periodo intercorrente tra ${refDate} e la data odierna sono state effettuate le seguenti lavorazioni:`;
    onUpdateDocument({ ...currentDoc, worksIntroText: text });
  };

  useEffect(() => {
    if (currentDoc && !currentDoc.worksIntroText) generateIntroText();
  }, [currentDocId]);

  if (!currentDoc) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
        <Gavel className="w-16 h-16 text-slate-200 mb-4"/>
        <h3 className="text-xl font-bold">Archivio Verbali di Collaudo</h3>
        <button onClick={() => onNewDocument('VERBALE_COLLAUDO')} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-all hover:bg-blue-700">+ Crea Primo Verbale</button>
      </div>
    );
  }

  const getSubjectName = (role: 'rup' | 'dl' | 'cse') => {
    const s = project.subjects[role];
    if (!s) return '';
    if ('isLegalEntity' in s && (s as any).isLegalEntity) {
        const firmatario = (s as any).operatingDesigners?.[0];
        if (firmatario) return `${firmatario.title || ''} ${firmatario.name} per ${(s as any).contact.name}`;
        return `${(s as any).contact.repName} per ${(s as any).contact.name}`;
    }
    return `${s.contact.title || ''} ${s.contact.name}`.trim();
  };

  const regenerateAttendees = () => {
    const list = [
        `Responsabile Unico del Progetto: ${getSubjectName('rup')}`,
        `Direttore dei Lavori: ${getSubjectName('dl')}`,
        `Coord. Sicurezza Esecuzione: ${getSubjectName('cse')}`,
        `per l'Impresa ${project.contractor.mainCompany.name} (Legale Rappresentante): ${project.contractor.mainCompany.repTitle || 'Sig.'} ${project.contractor.mainCompany.repName}`
    ].filter(s => !s.endsWith(': ')).join('\n');
    onUpdateDocument({...currentDoc, attendees: list});
  };

  const addItemToList = (field: 'worksExecuted' | 'worksInProgress' | 'upcomingWorks') => {
    if (!newItem.trim()) return;
    onUpdateDocument({ ...currentDoc, [field]: [...(currentDoc[field] || []), newItem.trim()] });
    setNewItem('');
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
      "Ad osservare tutte le prescrizioni indicate negli elaborati tecnici esecutivi...",
      "ad effettuare i dovuti controlli di accettazione in cantiere dei materiali...",
      "A fornire le dovute informazioni sull’impianto di betonaggio...",
      "Altro..."
    ],
    common: [
      "Di quanto ispezionato si è effettuato il rilievo fotografico allegato al presente verbale per farne parte integrante.",
      "Per le parti non più ispezionabili... l'impresa ha dichiarato non esservi difformità o vizi.",
      "Le parti si aggiornano, per la seconda visita di collaudo, a data da concordarsi...",
      "Altro..."
    ]
  };

  const addToField = (field: 'testerRequests' | 'testerInvitations' | 'commonParts') => {
    const currentVal = currentDoc[field] || '';
    onUpdateDocument({ ...currentDoc, [field]: (currentVal + (currentVal ? '\n' : '') + tempText).trim() });
    setTempText('');
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <Gavel className="w-6 h-6 text-blue-600"/>
          <select className="font-bold border-none bg-transparent text-lg focus:ring-0 cursor-pointer" value={currentDocId} onChange={e => onSelectDocument(e.target.value)}>
                {documents.filter(d => d.type === 'VERBALE_COLLAUDO').map(d => (
                <option key={d.id} value={d.id}>Verbale Collaudo n. {d.visitNumber} del {new Date(d.date).toLocaleDateString()}</option>
                ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNewDocument('VERBALE_COLLAUDO')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow hover:bg-blue-700">+ Nuovo</button>
          <button onClick={() => onDeleteDocument(currentDoc.id)} className="text-red-400 p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5"/></button>
        </div>
      </div>

      {/* Wizard Tabs */}
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
              <button key={t.id} onClick={() => setSubTab(t.id as any)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${subTab === t.id ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <t.icon className="w-4 h-4" /> {t.label}
              </button>
          ))}
      </div>

      <div className="space-y-6">
        {subTab === 'info' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in slide-in-from-bottom-2">
            <h3 className="font-bold mb-6 flex items-center gap-2 uppercase text-xs text-slate-400 border-b pb-3"><Calendar className="w-4 h-4"/> 1. Dati del Verbale</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div><label className="text-[10px] font-bold text-slate-500 uppercase">Data Sopralluogo</label><input type="date" className="w-full p-3 border rounded-xl" value={currentDoc.date} onChange={e => onUpdateDocument({...currentDoc, date: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase">Ora Inizio</label><input type="time" className="w-full p-3 border rounded-xl" value={currentDoc.time} onChange={e => onUpdateDocument({...currentDoc, time: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase">N. Verbale Progressivo</label><input type="number" className="w-full p-3 border rounded-xl font-bold" value={currentDoc.visitNumber} onChange={e => onUpdateDocument({...currentDoc, visitNumber: parseInt(e.target.value) || 1})} /></div>
            </div>
          </div>
        )}

        {subTab === 'convocation' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in slide-in-from-bottom-2">
            <h3 className="font-bold mb-6 flex items-center gap-2 uppercase text-xs text-slate-400 border-b pb-3"><Mail className="w-4 h-4"/> 2. Convocazione Visita</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Metodo Invio</label>
                <select className="w-full p-3 border rounded-xl" value={currentDoc.convocationMethod} onChange={e => onUpdateDocument({...currentDoc, convocationMethod: e.target.value})}>
                  <option value="PEC">PEC</option><option value="Email">Email</option><option value="Nota Protocollata">Nota Protocollata</option><option value="Vie Brevi">Vie Brevi</option>
                </select>
              </div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase">Data Invio Nota</label><input type="date" className="w-full p-3 border rounded-xl" value={currentDoc.convocationDate} onChange={e => onUpdateDocument({...currentDoc, convocationDate: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="text-[10px] font-bold text-slate-500 uppercase">Ulteriori Dettagli (Testo libero)</label><textarea className="w-full p-3 border rounded-xl h-20" placeholder="Es: convocata a seguito di comunicazione dell'impresa..." value={currentDoc.convocationDetails} onChange={e => onUpdateDocument({...currentDoc, convocationDetails: e.target.value})} /></div>
            </div>
          </div>
        )}

        {subTab === 'attendees' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h3 className="font-bold flex items-center gap-2 uppercase text-xs text-slate-400"><Users className="w-4 h-4"/> 3. Soggetti Presenti</h3>
                <button onClick={regenerateAttendees} className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline transition-all"><RefreshCw className="w-3 h-3"/> Rigenera da Anagrafica</button>
            </div>
            <textarea className="w-full p-5 border rounded-2xl h-80 text-sm font-mono leading-relaxed bg-slate-50 shadow-inner focus:ring-2 focus:ring-blue-500/20 outline-none" value={currentDoc.attendees} onChange={e => onUpdateDocument({...currentDoc, attendees: e.target.value})} placeholder="Elenco dei presenti..."/>
          </div>
        )}

        {subTab === 'works' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h3 className="font-bold flex items-center gap-2 uppercase text-xs text-slate-400"><ListChecks className="w-4 h-4"/> 4. Lavorazioni Accertate</h3>
                <button onClick={generateIntroText} className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline transition-all"><RefreshCw className="w-3 h-3"/> Rigenera Frase Intro</button>
            </div>
            <div className="mb-8">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block italic">Frase Introduttiva (Editabile)</label>
                <textarea className="w-full p-4 border rounded-xl h-24 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500/20 outline-none" value={currentDoc.worksIntroText} onChange={e => onUpdateDocument({...currentDoc, worksIntroText: e.target.value})}/>
            </div>
            <div className="space-y-8">
                <div>
                    <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">Riepilogo Lavori Periodo</label>
                    <div className="flex gap-2 mb-3">
                        <input type="text" className="flex-1 p-2 border rounded-lg text-sm" value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItemToList('worksExecuted')} placeholder="Aggiungi lavorazione..."/>
                        <button onClick={() => addItemToList('worksExecuted')} className="bg-blue-600 text-white px-4 rounded-lg font-bold hover:bg-blue-700 transition-colors">+</button>
                    </div>
                    <ul className="space-y-1">
                        {currentDoc.worksExecuted.map((w, i) => (
                            <li key={i} className="flex justify-between items-center bg-slate-50 p-2 rounded border text-sm group transition-all hover:bg-slate-100">
                                <input type="text" className="bg-transparent border-none flex-1 p-0 focus:ring-0 text-sm" value={w} onChange={e => { const n = [...currentDoc.worksExecuted]; n[i] = e.target.value; onUpdateDocument({...currentDoc, worksExecuted: n}); }}/>
                                <button onClick={() => { const n = [...currentDoc.worksExecuted]; n.splice(i, 1); onUpdateDocument({...currentDoc, worksExecuted: n}); }} className="text-slate-300 hover:text-red-500 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                            </li>
                        ))}
                        {currentDoc.worksExecuted.length === 0 && <p className="text-center py-4 text-slate-400 text-xs italic">Nessun lavoro inserito.</p>}
                    </ul>
                </div>
            </div>
          </div>
        )}

        {['requests', 'invites', 'common'].includes(subTab) && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in slide-in-from-bottom-2">
                <h3 className="font-bold mb-6 flex items-center gap-2 uppercase text-xs text-slate-400 border-b pb-3">{subTab === 'requests' ? '5. Richieste' : subTab === 'invites' ? '6. Inviti' : '7. Parti Comuni'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Seleziona Frase Standard</label>
                        <select className="w-full p-3 border rounded-xl bg-slate-50 text-sm cursor-pointer" onChange={e => setTempText(e.target.value === 'Altro...' ? '' : e.target.value)}><option value="">-- Scegli un'opzione --</option>{OPTIONS[subTab as keyof typeof OPTIONS].map((opt, idx) => <option key={idx} value={opt}>{opt.substring(0, 60)}...</option>)}</select>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <label className="text-[10px] font-bold text-blue-800 uppercase mb-2 block">Modifica prima dell'inserimento</label>
                            <textarea className="w-full p-3 border border-blue-200 rounded-lg h-32 text-sm bg-white" value={tempText} onChange={e => setTempText(e.target.value)} />
                            <button onClick={() => addToField(subTab === 'requests' ? 'testerRequests' : subTab === 'invites' ? 'testerInvitations' : 'commonParts' as any)} className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-xs uppercase shadow-md hover:bg-blue-700 transition-all">Aggiungi al Documento</button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Contenuto nel Verbale</label>
                        <textarea className="w-full p-4 border rounded-2xl h-72 text-sm leading-relaxed bg-slate-50 font-serif shadow-inner focus:ring-2 focus:ring-blue-500/20 outline-none" value={currentDoc[subTab === 'requests' ? 'testerRequests' : subTab === 'invites' ? 'testerInvitations' : 'commonParts' as any]} onChange={e => onUpdateDocument({...currentDoc, [subTab === 'requests' ? 'testerRequests' : subTab === 'invites' ? 'testerInvitations' : 'commonParts' as any]: e.target.value})}/>
                    </div>
                </div>
            </div>
        )}

        {subTab === 'evaluations' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in slide-in-from-bottom-2">
            <h3 className="font-bold mb-6 flex items-center gap-2 uppercase text-xs text-slate-400 border-b pb-3"><FileText className="w-4 h-4"/> 8. Valutazioni Conclusive</h3>
            <textarea className="w-full p-6 border rounded-2xl h-96 text-sm leading-relaxed font-serif bg-slate-50 shadow-inner focus:ring-2 focus:ring-blue-500/20 outline-none" value={currentDoc.observations} onChange={e => onUpdateDocument({...currentDoc, observations: e.target.value})} placeholder="Osservazioni e valutazioni del collaudatore..."/>
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl shadow-xl mt-8 text-white"><div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 opacity-80"><Save className="w-4 h-4 text-green-500"/> Stato: Salvataggio Database Locale</div><div className="text-[10px] font-bold uppercase tracking-widest opacity-30">Versione EdilApp 2.6</div></div>
      </div>
    </div>
  );
};
