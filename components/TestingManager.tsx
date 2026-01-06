
import React, { useState } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { Gavel, Trash2, Calendar, Users, ListChecks, Mail, FileText, RefreshCw, MessageSquare, Briefcase, Layout, Save, Check } from 'lucide-react';

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

export const TestingManager: React.FC<TestingManagerProps> = ({
  project,
  documents = [],
  currentDocId,
  onSelectDocument,
  onUpdateDocument,
  onNewDocument,
  onDeleteDocument,
  onUpdateProject
}) => {
  const [subTab, setSubTab] = useState<'info' | 'convocation' | 'attendees' | 'works' | 'requests' | 'invites' | 'common' | 'evaluations'>('info');
  const [newItem, setNewItem] = useState('');
  const [tempText, setTempText] = useState('');

  const currentDoc = documents.find(d => d.id === currentDocId);

  const OPTIONS = {
    requests: [
      "se rispetto al progetto appaltato vi siano previsioni di varianti e, in caso di riscontro positivo, se le stesse siano state gestite formalmente;",
      "se vi siano ritardi rispetto al cronoprogramma dei lavori e, in caso di riscontro positivo, cosa si stia facendo per allineare le attività al cronoprogramma."
    ],
    invites: [
      "Ad osservare tutte le disposizioni riportate nel PSC e nel POS quest’ultimo redatto dall’impresa esecutrice delle opere;",
      "ad astenersi dal porre in essere qualsivoglia opera di carattere strutturale in mancanza della verifica e del preventivo assenso da parte dello scrivente collaudatore;",
      "Ad osservare tutte le prescrizioni indicate negli elaborati tecnici esecutivi delle opere in esecuzione e a consultare la D.LL., nonché lo scrivente collaudatore in corso d’opera, nel caso in cui dovessero presentarsi varianti tecniche tali da richiedere i dovuti chiarimenti esecutivi.",
      "ad effettuare i dovuti controlli di accettazione in cantiere dei materiali da costruzione quali i Certificati di tracciabilità dei materiali e i certificati dei centri di trasformazione;",
      "A fornire le dovute informazioni sull’impianto di betonaggio (distanza, sistema di qualità, relazione di omogeneità sulla miscela del calcestruzzo);",
      "A provvedere ad effettuare la prequalifica dell’impianto di betonaggio al fine di attestare la qualità e l'affidabilità dell'impianto;",
      "Ad attenersi scrupolosamente ai prelievi di calcestruzzo secondo le indicazioni del DM 17/01/2018;",
      "effettuare un prelievo extra (costituito da due ulteriori cubetti di cls) rispetto a quelli normati, al fine di far schiacciare gli stessi dopo 10 giorni."
    ],
    common: [
      "Di quanto ispezionato si è effettuato il rilievo fotografico allegato al presente verbale per farne parte integrante.",
      "Per le parti non più ispezionabili, la D.L. e l’impresa hanno consegnato documentazione fotografica assicurando la perfetta esecuzione secondo le prescrizioni contrattuali.",
      "Le parti si aggiornano, per la successiva visita di collaudo, a data da concordarsi previa convocazione."
    ]
  };

  const getSubjectName = (role: 'rup' | 'dl' | 'cse') => {
    const s = project.subjects[role];
    if (!s) return '---';
    const title = s.contact.title ? s.contact.title + ' ' : '';
    return title + s.contact.name;
  };

  const regenerateAttendees = () => {
    if (!currentDoc) return;
    const list = [
        `Responsabile Unico del Progetto: ${getSubjectName('rup')}`,
        `Direttore dei Lavori: ${getSubjectName('dl')}`,
        `Coord. Sicurezza Esecuzione: ${getSubjectName('cse')}`,
        `Impresa ${project.contractor.mainCompany.name || '---'} (Legale Rappresentante): ${project.contractor.mainCompany.repTitle || 'Sig.'} ${project.contractor.mainCompany.repName || '---'}`
    ].join('\n');
    onUpdateDocument({...currentDoc, attendees: list});
  };

  const addToField = (field: 'testerRequests' | 'testerInvitations' | 'commonParts') => {
    if (!currentDoc) return;
    const currentVal = (currentDoc as any)[field] || '';
    onUpdateDocument({ ...currentDoc, [field]: (currentVal + (currentVal ? '\n' : '') + tempText).trim() });
    setTempText('');
  };

  const addItemToList = () => {
    if (!currentDoc || !newItem.trim()) return;
    onUpdateDocument({ ...currentDoc, worksExecuted: [...currentDoc.worksExecuted, newItem.trim()] });
    setNewItem('');
  };

  if (!currentDoc) return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed">
      <Gavel className="w-12 h-12 text-slate-200 mb-4"/>
      <button onClick={() => onNewDocument('VERBALE_COLLAUDO')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg">
        + Inizia Primo Verbale di Collaudo
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in">
      <div className="flex bg-white p-4 rounded-xl shadow-sm border mb-8 justify-between items-center">
        <div className="flex items-center gap-4">
          <Gavel className="w-5 h-5 text-blue-600"/>
          <select className="font-bold border-none bg-transparent text-lg focus:ring-0 cursor-pointer" value={currentDocId} onChange={e => onSelectDocument(e.target.value)}>
                {documents.filter(d => d.type === 'VERBALE_COLLAUDO').map(d => (
                <option key={d.id} value={d.id}>Verbale di Visita di Collaudo n. {d.visitNumber} del {new Date(d.date).toLocaleDateString('it-IT')}</option>
                ))}
          </select>
        </div>
        <div className="flex gap-2">
            <button onClick={() => onNewDocument('VERBALE_COLLAUDO')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs shadow hover:bg-blue-700">+ Nuovo Verbale</button>
            <button onClick={() => onDeleteDocument(currentDoc.id)} className="text-red-400 p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5"/></button>
        </div>
      </div>

      <div className="flex bg-white rounded-xl p-1 mb-8 shadow-sm border overflow-x-auto no-scrollbar">
          {[
              { id: 'info', label: '1. Dati & Tipologia', icon: Calendar },
              { id: 'convocation', label: '2. Convocazione', icon: Mail },
              { id: 'attendees', label: '3. Presenti', icon: Users },
              { id: 'works', label: '4. Lavori', icon: ListChecks },
              { id: 'requests', label: '5. Richieste', icon: MessageSquare },
              { id: 'invites', label: '6. Inviti', icon: Briefcase },
              { id: 'common', label: '7. Parti Comuni', icon: Layout },
              { id: 'evaluations', label: '8. Valutazioni', icon: FileText },
          ].map((t) => (
              <button key={t.id} onClick={() => setSubTab(t.id as any)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${subTab === t.id ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-slate-50'}`}>
                  {t.label}
              </button>
          ))}
      </div>

      <div className="space-y-6">
        {subTab === 'info' && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border">
                <h3 className="font-bold mb-6 text-xs uppercase text-slate-400 border-b pb-3 tracking-widest">Dati Sopralluogo</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div><label className="text-[10px] font-bold text-slate-500 uppercase">Data</label><input type="date" className="w-full p-3 border rounded-xl bg-slate-50" value={currentDoc.date} onChange={e => onUpdateDocument({...currentDoc, date: e.target.value})} /></div>
                  <div><label className="text-[10px] font-bold text-slate-500 uppercase">N. Progressivo</label><input type="number" className="w-full p-3 border rounded-xl font-bold bg-slate-50" value={currentDoc.visitNumber} onChange={e => onUpdateDocument({...currentDoc, visitNumber: parseInt(e.target.value) || 1})} /></div>
                </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border">
                <h3 className="font-bold mb-6 text-xs uppercase text-slate-400 border-b pb-3 tracking-widest">Oggetto del Sopralluogo</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <label className="flex items-center gap-3 p-5 border rounded-2xl hover:bg-blue-50 cursor-pointer transition-all border-slate-200">
                        <input type="checkbox" className="w-6 h-6 text-blue-600 rounded" checked={project.subjects.testerAppointment.isAdmin} onChange={e => onUpdateProject({...project, subjects: {...project.subjects, testerAppointment: {...project.subjects.testerAppointment, isAdmin: e.target.checked}}})} />
                        <span className="text-sm font-bold text-slate-700">Tecnico-Amministrativo</span>
                    </label>
                    <label className="flex items-center gap-3 p-5 border rounded-2xl hover:bg-blue-50 cursor-pointer transition-all border-slate-200">
                        <input type="checkbox" className="w-6 h-6 text-blue-600 rounded" checked={project.subjects.testerAppointment.isStatic} onChange={e => onUpdateProject({...project, subjects: {...project.subjects, testerAppointment: {...project.subjects.testerAppointment, isStatic: e.target.checked}}})} />
                        <span className="text-sm font-bold text-slate-700">Statico</span>
                    </label>
                    <label className="flex items-center gap-3 p-5 border rounded-2xl hover:bg-blue-50 cursor-pointer transition-all border-slate-200">
                        <input type="checkbox" className="w-6 h-6 text-blue-600 rounded" checked={project.subjects.testerAppointment.isFunctional} onChange={e => onUpdateProject({...project, subjects: {...project.subjects, testerAppointment: {...project.subjects.testerAppointment, isFunctional: e.target.checked}}})} />
                        <span className="text-sm font-bold text-slate-700">Funzionale</span>
                    </label>
                </div>
            </div>
          </div>
        )}

        {subTab === 'convocation' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border">
            <h3 className="font-bold mb-6 text-xs uppercase text-slate-400 border-b pb-3 tracking-widest">Dettagli Convocazione</h3>
            <textarea className="w-full p-5 border rounded-2xl h-48 text-sm bg-slate-50" value={currentDoc.convocationDetails || ''} onChange={e => onUpdateDocument({...currentDoc, convocationDetails: e.target.value})} placeholder="Esempio: Convocata con nota PEC prot. n. 1234 del 01/01/2025..."/>
          </div>
        )}

        {subTab === 'attendees' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h3 className="font-bold text-xs uppercase text-slate-400 tracking-widest">Soggetti Presenti</h3>
                <button onClick={regenerateAttendees} className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-3 py-1 rounded-full border border-blue-100"><RefreshCw className="w-3 h-3"/> Rigenera da Anagrafica</button>
            </div>
            <textarea className="w-full p-5 border rounded-2xl h-96 text-sm font-mono bg-slate-50 leading-relaxed" value={currentDoc.attendees || ''} onChange={e => onUpdateDocument({...currentDoc, attendees: e.target.value})} />
          </div>
        )}

        {['requests', 'invites', 'common'].includes(subTab) && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border animate-in slide-in-from-right-4">
                <h3 className="font-bold mb-6 text-xs uppercase text-slate-400 border-b pb-3 tracking-widest">
                    {subTab === 'requests' ? 'Richieste Collaudatore' : subTab === 'invites' ? 'Inviti Collaudatore' : 'Parti Comuni'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-5">
                        <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                            <label className="text-[10px] font-bold text-blue-600 uppercase mb-3 block italic tracking-widest">Menu clausole:</label>
                            <select className="w-full p-4 border border-blue-200 rounded-xl bg-white text-sm outline-none" onChange={e => setTempText(e.target.value)} value="">
                                <option value="">-- Seleziona --</option>
                                {OPTIONS[subTab as keyof typeof OPTIONS].map((opt, idx) => (
                                    <option key={idx} value={opt}>{opt.substring(0, 70)}...</option>
                                ))}
                            </select>
                            <div className="mt-8">
                                <textarea className="w-full p-5 border border-blue-100 rounded-2xl h-56 text-sm bg-white outline-none" value={tempText} onChange={e => setTempText(e.target.value)} placeholder="Modifica la frase qui..."/>
                                <button onClick={() => addToField(subTab === 'requests' ? 'testerRequests' : subTab === 'invites' ? 'testerInvitations' : 'commonParts' as any)} className="mt-4 w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-xs uppercase hover:bg-blue-700 transition-all flex items-center justify-center gap-2 tracking-widest">
                                    <Check className="w-4 h-4"/> Aggiungi al Verbale
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block tracking-widest">Testo finale:</label>
                        <textarea className="w-full p-6 border rounded-2xl h-[550px] text-sm bg-slate-50 font-serif outline-none" value={(currentDoc as any)[subTab === 'requests' ? 'testerRequests' : (subTab === 'invites' ? 'testerInvitations' : 'commonParts')] || ''} onChange={e => onUpdateDocument({...currentDoc, [subTab === 'requests' ? 'testerRequests' : (subTab === 'invites' ? 'testerInvitations' : 'commonParts')]: e.target.value})}/>
                    </div>
                </div>
            </div>
        )}

        {subTab === 'evaluations' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border">
            <h3 className="font-bold mb-6 text-xs uppercase text-slate-400 border-b pb-3 tracking-widest">Valutazioni Finali</h3>
            <textarea className="w-full p-8 border rounded-2xl h-96 text-sm leading-relaxed font-serif bg-slate-50" value={currentDoc.observations || ''} onChange={e => onUpdateDocument({...currentDoc, observations: e.target.value})} />
          </div>
        )}

        <div className="flex items-center justify-center p-4 bg-slate-900 rounded-2xl text-white gap-3 shadow-xl mt-10">
            <Save className="w-4 h-4 text-green-500"/>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Backup locale database attivo</span>
        </div>
      </div>
    </div>
  );
};
