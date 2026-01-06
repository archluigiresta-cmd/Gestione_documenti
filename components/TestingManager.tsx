
import React, { useState, useEffect } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { Gavel, Plus, Trash2, Calendar, Clock, Users, ListChecks, Wand2, Loader2, Save, Mail, FileText, ChevronRight, CheckSquare, MessageSquare, Briefcase, Layout, RefreshCw } from 'lucide-react';
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

  // Generazione automatica frase introduttiva lavori
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
        <button onClick={() => onNewDocument('VERBALE_COLLAUDO')} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg">+ Crea Primo Verbale</button>
      </div>
    );
  }

  const getSubjectName = (role: 'rup' | 'dl' | 'cse') => {
    const s = project.subjects[role];
    if (!s) return '';
    // Se società, prendi il primo tecnico operativo o il rappresentante
    if ('isLegalEntity' in s && (s as any).isLegalEntity) {
        const firmatario = (s as any).operatingDesigners?.[0];
        if (firmatario) return `${firmatario.title || ''} ${firmatario.name} per ${(s as any).contact.name}`;
        return `(Legale Rappr.) ${(s as any).contact.repName} per ${(s as any).contact.name}`;
    }
    return `${s.contact.title || ''} ${s.contact.name}`.trim();
  };

  const regenerateAttendees = () => {
    const list = [
        `Responsabile Unico del Progetto: ${getSubjectName('rup')}`,
        `Direttore dei Lavori: ${getSubjectName('dl')}`,
        `Coord. Sicurezza Esecuzione: ${getSubjectName('cse')}`,
        `per l'Impresa ${project.contractor.mainCompany.name} (Legale Rappresentante): ${project.contractor.mainCompany.repTitle || 'Sig.'} ${project.contractor.mainCompany.repName}`
    ].filter(s => !s.includes(': ')).join('\n');
    onUpdateDocument({...currentDoc, attendees: list});
  };

  const addItemToList = (field: 'worksExecuted' | 'worksInProgress' | 'upcomingWorks') => {
    if (!newItem.trim()) return;
    onUpdateDocument({ ...currentDoc, [field]: [...(currentDoc[field] || []), newItem.trim()] });
    setNewItem('');
  };

  const OPTIONS = {
    requests: ["se rispetto al progetto appaltato vi siano previsioni di varianti e, in caso di riscontro positivo, se le stesse siano state gestite formalmente;", "se vi siano ritardi rispetto al cronoprogramma e, in caso di riscontro positivo, cosa si stia facendo per allineare le attività al cronoprogramma.", "Altro..."],
    invites: ["Ad osservare tutte le disposizioni riportate nel PSC e nel POS quest’ultimo redatto dall’impresa esecutrice delle opere;", "ad astenersi dal porre in essere qualsivoglia opera di carattere strutturale in mancanza della verifica e del preventivo assenso da parte dello scrivente collaudatore;", "Ad osservare tutte le prescrizioni indicate negli elaborati tecnici esecutivi...", "Altro..."],
    common: ["Di quanto ispezionato si è effettuato il rilievo fotografico allegato al presente verbale per farne parte integrante.", "Per le parti non più ispezionabili... l'impresa ha dichiarato non esservi difformità o vizi.", "Le parti si aggiornano, per la seconda visita di collaudo, a data da concordarsi...", "Altro..."]
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <Gavel className="w-6 h-6 text-blue-600"/>
          <select className="font-bold border-none bg-transparent text-lg focus:ring-0" value={currentDocId} onChange={e => onSelectDocument(e.target.value)}>
                {documents.filter(d => d.type === 'VERBALE_COLLAUDO').map(d => (
                <option key={d.id} value={d.id}>Verbale Collaudo n. {d.visitNumber} del {new Date(d.date).toLocaleDateString()}</option>
                ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNewDocument('VERBALE_COLLAUDO')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md">+ Nuovo</button>
          <button onClick={() => onDeleteDocument(currentDoc.id)} className="text-red-400 p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5"/></button>
        </div>
      </div>

      {/* Tabs */}
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
              <button key={t.id} onClick={() => setSubTab(t.id as any)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${subTab === t.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <t.icon className="w-4 h-4" /> {t.label}
              </button>
          ))}
      </div>

      <div className="space-y-6">
        {subTab === 'info' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold mb-6 flex items-center gap-2 uppercase text-xs text-slate-400 border-b pb-3"><Calendar className="w-4 h-4"/> 1. Dati Verbale</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div><label className="text-[10px] font-bold text-slate-500 uppercase">Data Sopralluogo</label><input type="date" className="w-full p-3 border rounded-xl" value={currentDoc.date} onChange={e => onUpdateDocument({...currentDoc, date: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase">Ora Inizio</label><input type="time" className="w-full p-3 border rounded-xl" value={currentDoc.time} onChange={e => onUpdateDocument({...currentDoc, time: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase">N. Verbale</label><input type="number" className="w-full p-3 border rounded-xl font-bold" value={currentDoc.visitNumber} onChange={e => onUpdateDocument({...currentDoc, visitNumber: parseInt(e.target.value) || 1})} /></div>
            </div>
          </div>
        )}

        {subTab === 'attendees' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h3 className="font-bold flex items-center gap-2 uppercase text-xs text-slate-400"><Users className="w-4 h-4"/> 3. Soggetti Presenti</h3>
                <button onClick={regenerateAttendees} className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline"><RefreshCw className="w-3 h-3"/> Rigenera da Anagrafica</button>
            </div>
            <textarea className="w-full p-5 border rounded-2xl h-80 text-sm font-mono leading-relaxed bg-slate-50 shadow-inner" value={currentDoc.attendees} onChange={e => onUpdateDocument({...currentDoc, attendees: e.target.value})} placeholder="Elenco presenti..."/>
          </div>
        )}

        {subTab === 'works' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h3 className="font-bold flex items-center gap-2 uppercase text-xs text-slate-400"><ListChecks className="w-4 h-4"/> 4. Lavorazioni Accertate</h3>
                <button onClick={generateIntroText} className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline"><RefreshCw className="w-3 h-3"/> Rigenera Frase Intro</button>
            </div>
            <div className="mb-8">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block italic">Frase Introduttiva (Editabile)</label>
                <textarea className="w-full p-4 border rounded-xl h-24 text-sm bg-slate-50" value={currentDoc.worksIntroText} onChange={e => onUpdateDocument({...currentDoc, worksIntroText: e.target.value})}/>
            </div>
            <div className="space-y-6">
                <div>
                    <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">Riepilogo Lavori Periodo</label>
                    <div className="flex gap-2 mb-3">
                        <input type="text" className="flex-1 p-2 border rounded text-sm" value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItemToList('worksExecuted')} placeholder="Aggiungi lavorazione..."/>
                        <button onClick={() => addItemToList('worksExecuted')} className="bg-blue-600 text-white px-4 rounded font-bold">+</button>
                    </div>
                    <ul className="space-y-1">
                        {currentDoc.worksExecuted.map((w, i) => (
                            <li key={i} className="flex justify-between items-center bg-slate-50 p-2 rounded border text-sm group">
                                <input type="text" className="bg-transparent border-none flex-1 p-0 focus:ring-0 text-sm" value={w} onChange={e => { const n = [...currentDoc.worksExecuted]; n[i] = e.target.value; onUpdateDocument({...currentDoc, worksExecuted: n}); }}/>
                                <button onClick={() => { const n = [...currentDoc.worksExecuted]; n.splice(i, 1); onUpdateDocument({...currentDoc, worksExecuted: n}); }} className="text-slate-300 hover:text-red-500 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
          </div>
        )}

        {/* Altri subTab seguono la stessa logica di UI pulita e professionale */}
        <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl shadow-xl mt-8 text-white"><div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 opacity-80"><Save className="w-4 h-4 text-green-500"/> Salvataggio Database Locale</div></div>
      </div>
    </div>
  );
};
