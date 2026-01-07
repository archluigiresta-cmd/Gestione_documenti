
import React, { useState } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { 
  Gavel, Trash2, Calendar, Users, ListChecks, Mail, FileText, RefreshCw, 
  MessageSquare, Plus, Check, PlusCircle, ShieldAlert, ChevronRight, List, Info
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
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  try { return new Date(dateString).toLocaleDateString('it-IT'); } catch { return dateString; }
};

export const TestingManager: React.FC<TestingManagerProps> = ({
  project,
  documents = [],
  currentDocId,
  onSelectDocument,
  onUpdateDocument,
  onNewDocument,
  onDeleteDocument,
}) => {
  const [subTab, setSubTab] = useState<'info' | 'convocation' | 'attendees' | 'works' | 'requests' | 'invites' | 'evaluations'>('info');
  const [workInput, setWorkInput] = useState('');

  const currentDoc = documents.find(d => d.id === currentDocId);

  const CONVOCATION_METHODS = ["PEC", "Email", "Brevi vie", "Nota formale", "Raccomandata A/R"];

  const PREDEFINED_OPTIONS = {
    requests: [
      "Se rispetto al progetto appaltato vi siano previsioni di varianti e se le stesse siano state gestite formalmente.",
      "Se vi siano ritardi rispetto al cronoprogramma dei lavori e quali azioni siano in corso per l'allineamento.",
      "Copia dei certificati di prova sui materiali (calcestruzzo, acciaio) effettuati dai laboratori autorizzati.",
      "Copia delle dichiarazioni di conformità degli impianti rilasciate dalle ditte installatrici."
    ],
    invites: [
      "Ad osservare tutte le disposizioni riportate nel PSC e nel POS redatto dall’impresa.",
      "Ad astenersi dal porre in essere opere strutturali senza il preventivo assenso del collaudatore.",
      "A completare le rifiniture esterne entro la prossima visita di collaudo.",
      "Ad attenersi scrupolosamente ai prelievi di calcestruzzo secondo le indicazioni del DM 17/01/2018."
    ]
  };

  const getSubjectName = (role: 'rup' | 'dl' | 'cse') => {
    const s = project.subjects[role];
    if (!s) return '---';
    return (s.contact.title ? s.contact.title + ' ' : '') + s.contact.name;
  };

  const regenerateAttendees = () => {
    if (!currentDoc) return;
    const list = [
        `RUP: ${getSubjectName('rup')}`,
        `Direttore Lavori: ${getSubjectName('dl')}`,
        `CSE: ${getSubjectName('cse')}`,
        `Impresa: ${project.contractor.mainCompany.name || '---'} (Leg. Rappr.: ${project.contractor.mainCompany.repName || '---'})`
    ].join('\n');
    onUpdateDocument({...currentDoc, attendees: list});
  };

  const addWorkItem = () => {
    if (currentDoc && workInput.trim()) {
      onUpdateDocument({
        ...currentDoc,
        worksExecuted: [...(currentDoc.worksExecuted || []), workInput.trim()]
      });
      setWorkInput('');
    }
  };

  const removeWorkItem = (index: number) => {
    if (currentDoc) {
      const newList = [...currentDoc.worksExecuted];
      newList.splice(index, 1);
      onUpdateDocument({ ...currentDoc, worksExecuted: newList });
    }
  };

  const addPredefined = (field: 'worksExecuted' | 'testerRequests' | 'testerInvitations', text: string) => {
    if (!currentDoc) return;
    // Nota: testerRequests e testerInvitations sono salvati come stringhe nel DB per ora, 
    // ma le gestiamo come elenchi se necessario o le appendiamo. 
    // In questo caso le appendiamo con un a capo se sono stringhe.
    const currentVal = (currentDoc as any)[field];
    if (Array.isArray(currentVal)) {
        onUpdateDocument({ ...currentDoc, [field]: [...currentVal, text] });
    } else {
        const newVal = currentVal ? currentVal + "\n- " + text : "- " + text;
        onUpdateDocument({ ...currentDoc, [field]: newVal });
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in">
      {/* HEADER GESTIONE */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg"><Gavel className="w-5 h-5 text-blue-600"/></div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Inserimento Dati Collaudo</h2>
            </div>
            <div className="flex gap-2">
                <button onClick={() => onNewDocument('LET_CONVOCAZIONE_COLLAUDO')} className="flex items-center gap-2 bg-slate-50 text-slate-700 px-3 py-2 rounded-lg font-bold text-[10px] uppercase hover:bg-slate-100 transition-all border">
                    <Mail className="w-3.5 h-3.5"/> + Convocazione
                </button>
                <button onClick={() => onNewDocument('NULLAOSTA_COLLAUDO')} className="flex items-center gap-2 bg-slate-50 text-slate-700 px-3 py-2 rounded-lg font-bold text-[10px] uppercase hover:bg-slate-100 transition-all border">
                    <Check className="w-3.5 h-3.5"/> + Nullaosta
                </button>
                <button onClick={() => onNewDocument('VERBALE_COLLAUDO')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase shadow-lg hover:bg-blue-700 transition-all">
                    <PlusCircle className="w-3.5 h-3.5"/> + Nuovo Verbale
                </button>
            </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-blue-100">
            <div className="flex-1">
                <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">Stai editando l'atto:</label>
                <select className="w-full font-bold border-none bg-transparent text-slate-800 focus:ring-0 cursor-pointer text-lg" value={currentDocId} onChange={e => onSelectDocument(e.target.value)}>
                    <option value="">-- Seleziona un documento da editare --</option>
                    {documents.map(d => (
                    <option key={d.id} value={d.id}>{d.type.replace(/_/g, ' ')} - N. {d.visitNumber} del {formatDate(d.date)}</option>
                    ))}
                </select>
            </div>
            {currentDoc && (
                <button onClick={() => onDeleteDocument(currentDoc.id)} className="text-red-400 p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5"/>
                </button>
            )}
        </div>
      </div>

      {currentDoc ? (
        <>
            {/* SOTTO-NAVIGAZIONE SCHEDA EDIT */}
            <div className="flex bg-white rounded-xl p-1 mb-8 shadow-sm border overflow-x-auto no-scrollbar">
                {[
                    { id: 'info', label: 'Dati Base', icon: Calendar },
                    { id: 'convocation', label: 'Convocazione', icon: Mail },
                    { id: 'attendees', label: 'Presenti', icon: Users },
                    { id: 'works', label: 'Lavorazioni', icon: ListChecks },
                    { id: 'requests', label: 'Richieste', icon: MessageSquare },
                    { id: 'invites', label: 'Inviti', icon: List },
                    { id: 'evaluations', label: 'Note Finali', icon: FileText },
                ].map((t) => (
                    <button key={t.id} onClick={() => setSubTab(t.id as any)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${subTab === t.id ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-slate-50'}`}>
                        <t.icon className="w-3.5 h-3.5"/> {t.label}
                    </button>
                ))}
            </div>

            {/* CONTENUTO SCHEDE */}
            <div className="space-y-6">
                {subTab === 'info' && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border">
                    <h3 className="font-bold mb-6 text-xs uppercase text-slate-400 border-b pb-3 tracking-widest flex items-center gap-2"><Info className="w-4 h-4"/> Dati Generali Atto</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Numero Verbale/Atto</label><input type="number" className="w-full p-3 border rounded-xl bg-slate-50 font-bold" value={currentDoc.visitNumber} onChange={e => onUpdateDocument({...currentDoc, visitNumber: parseInt(e.target.value) || 0})} /></div>
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Data Documento</label><input type="date" className="w-full p-3 border rounded-xl bg-slate-50" value={currentDoc.date} onChange={e => onUpdateDocument({...currentDoc, date: e.target.value})} /></div>
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Ora Inizio Operazioni</label><input type="time" className="w-full p-3 border rounded-xl bg-slate-50" value={currentDoc.time} onChange={e => onUpdateDocument({...currentDoc, time: e.target.value})} /></div>
                    </div>
                </div>
                )}

                {subTab === 'convocation' && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border">
                    <h3 className="font-bold mb-6 text-xs uppercase text-slate-400 border-b pb-3 tracking-widest flex items-center gap-2"><Mail className="w-4 h-4"/> Modalità di Convocazione</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Convocata con nota via...</label>
                            <select className="w-full p-3 border rounded-xl bg-white font-bold" value={currentDoc.convocationMethod || ''} onChange={e => onUpdateDocument({...currentDoc, convocationMethod: e.target.value})}>
                                <option value="">-- Seleziona Metodo --</option>
                                {CONVOCATION_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">In data (Data della nota)</label>
                            <input type="date" className="w-full p-3 border rounded-xl bg-white" value={currentDoc.convocationDate || ''} onChange={e => onUpdateDocument({...currentDoc, convocationDate: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Ulteriori Estremi (Protocollo o Note)</label>
                        <input type="text" className="w-full p-3 border rounded-xl bg-slate-50" placeholder="Es. Prot. n. 1234/2025" value={currentDoc.convocationDetails || ''} onChange={e => onUpdateDocument({...currentDoc, convocationDetails: e.target.value})} />
                    </div>
                </div>
                )}

                {subTab === 'attendees' && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border">
                    <div className="flex justify-between items-center mb-6 border-b pb-3">
                        <h3 className="font-bold text-xs uppercase text-slate-400 tracking-widest">Soggetti Presenti</h3>
                        <button onClick={regenerateAttendees} className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 transition-colors"><RefreshCw className="w-3 h-3"/> Importa Soggetti da Parte 1</button>
                    </div>
                    <textarea className="w-full p-5 border rounded-2xl h-64 text-sm font-mono bg-slate-50 leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Elenco delle persone che partecipano alla visita..." value={currentDoc.attendees || ''} onChange={e => onUpdateDocument({...currentDoc, attendees: e.target.value})} />
                </div>
                )}

                {subTab === 'works' && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border">
                    <h3 className="font-bold mb-4 text-xs uppercase text-slate-400 border-b pb-3 tracking-widest">Lavorazioni Riscontrate (Elenco)</h3>
                    <div className="flex gap-2 mb-6">
                        <input type="text" className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Aggiungi una nuova lavorazione o rilievo..." value={workInput} onChange={e => setWorkInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addWorkItem()} />
                        <button onClick={addWorkItem} className="bg-blue-600 text-white px-6 rounded-xl hover:bg-blue-700 transition-colors font-bold"><Plus className="w-5 h-5"/></button>
                    </div>
                    <div className="space-y-2">
                        {currentDoc.worksExecuted?.map((work, idx) => (
                            <div key={idx} className="flex items-start justify-between bg-slate-50 p-4 rounded-xl border group hover:border-blue-200 transition-all">
                                <div className="flex gap-3">
                                    <span className="font-bold text-blue-600 text-sm">{idx + 1}.</span>
                                    <p className="text-sm text-slate-700 leading-relaxed">{work}</p>
                                </div>
                                <button onClick={() => removeWorkItem(idx)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
                            </div>
                        ))}
                        {(!currentDoc.worksExecuted || currentDoc.worksExecuted.length === 0) && (
                            <div className="text-center py-12 text-slate-400 italic bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">Nessuna lavorazione inserita. Usa il campo sopra per aggiungere punti elenco.</div>
                        )}
                    </div>
                </div>
                )}

                {subTab === 'requests' && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border">
                    <h3 className="font-bold mb-6 text-xs uppercase text-slate-400 border-b pb-3 tracking-widest">Richieste del Collaudatore</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {PREDEFINED_OPTIONS.requests.map((opt, i) => (
                            <button key={i} onClick={() => addPredefined('testerRequests', opt)} className="text-left p-3 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-100 flex items-start gap-2 transition-colors">
                                <PlusCircle className="w-3.5 h-3.5 shrink-0 mt-0.5"/> {opt}
                            </button>
                        ))}
                    </div>
                    <textarea className="w-full p-4 border rounded-xl h-48 text-sm bg-slate-50" placeholder="Richieste specifiche rivolte al RUP o alla DL..." value={currentDoc.testerRequests || ''} onChange={e => onUpdateDocument({...currentDoc, testerRequests: e.target.value})} />
                </div>
                )}

                {subTab === 'invites' && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border">
                    <h3 className="font-bold mb-6 text-xs uppercase text-slate-400 border-b pb-3 tracking-widest">Inviti e Disposizioni</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {PREDEFINED_OPTIONS.invites.map((opt, i) => (
                            <button key={i} onClick={() => addPredefined('testerInvitations', opt)} className="text-left p-3 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-100 flex items-start gap-2 transition-colors">
                                <PlusCircle className="w-3.5 h-3.5 shrink-0 mt-0.5"/> {opt}
                            </button>
                        ))}
                    </div>
                    <textarea className="w-full p-4 border rounded-xl h-48 text-sm bg-slate-50" placeholder="Inviti rivolti all'Impresa o alla DL..." value={currentDoc.testerInvitations || ''} onChange={e => onUpdateDocument({...currentDoc, testerInvitations: e.target.value})} />
                </div>
                )}

                {subTab === 'evaluations' && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border">
                    <h3 className="font-bold mb-6 text-xs uppercase text-slate-400 border-b pb-3 tracking-widest">Osservazioni Finali / Note</h3>
                    <textarea className="w-full p-8 border rounded-2xl h-96 text-sm leading-relaxed font-serif bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" value={currentDoc.observations || ''} onChange={e => onUpdateDocument({...currentDoc, observations: e.target.value})} placeholder="Eventuali conclusioni della visita o note tecniche aggiuntive..."/>
                </div>
                )}
            </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <ShieldAlert className="w-16 h-16 text-slate-200 mb-6"/>
            <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Nessun atto selezionato</h3>
            <p className="text-slate-400 mt-2 text-sm">Seleziona un documento dal menu a tendina o creane uno nuovo dai tasti in alto.</p>
        </div>
      )}
    </div>
  );
};
