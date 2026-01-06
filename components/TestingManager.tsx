
import React, { useState, useEffect } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { Gavel, Plus, Trash2, Calendar, Clock, Users, ListChecks, Mail, FileText, RefreshCw, MessageSquare, Briefcase, Layout, Save, Check } from 'lucide-react';

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
  const [newItem, setNewItem] = useState('');
  const [tempText, setTempText] = useState('');

  const currentDoc = documents.find(d => d.id === currentDocId);

  const generateIntroText = () => {
    if (!currentDoc) return;
    const sorted = [...documents].filter(d => d.type === 'VERBALE_COLLAUDO' && d.visitNumber < currentDoc.visitNumber).sort((a,b) => b.visitNumber - a.visitNumber);
    const last = sorted[0];
    const refDate = last ? new Date(last.date).toLocaleDateString('it-IT') : 'la consegna dei lavori';
    const text = `Durante il presente sopralluogo prende atto che, nel periodo intercorrente tra ${refDate} e la data odierna sono state effettuate le seguenti lavorazioni:`;
    onUpdateDocument({ ...currentDoc, worksIntroText: text });
  };

  useEffect(() => {
    if (currentDoc && !currentDoc.worksIntroText) generateIntroText();
  }, [currentDocId]);

  if (!currentDoc) return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed">
      <Gavel className="w-12 h-12 text-slate-200 mb-4"/>
      <button onClick={() => onNewDocument('VERBALE_COLLAUDO')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-transform hover:scale-105">
        + Inizia Primo Verbale di Collaudo
      </button>
    </div>
  );

  const getSubjectName = (role: 'rup' | 'dl' | 'cse') => {
    const s = project.subjects[role];
    if (!s) return '';
    const title = s.contact.title ? s.contact.title + ' ' : '';
    return title + s.contact.name;
  };

  const regenerateAttendees = () => {
    const list = [
        `Responsabile Unico del Progetto: ${getSubjectName('rup')}`,
        `Direttore dei Lavori: ${getSubjectName('dl')}`,
        `Coord. Sicurezza Esecuzione: ${getSubjectName('cse')}`,
        `per l'Impresa ${project.contractor.mainCompany.name} (Legale Rappresentante): ${project.contractor.mainCompany.repTitle || 'Sig.'} ${project.contractor.mainCompany.repName}`
    ].join('\n');
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
      "se vi siano ritardi rispetto al cronoprogramma dei lavori e, in caso di riscontro positivo, cosa si stia facendo per allineare le attività al cronoprogramma.",
      "Altro..."
    ],
    invites: [
      "Ad osservare tutte le disposizioni riportate nel PSC e nel POS quest’ultimo redatto dall’impresa esecutrice delle opere;",
      "ad astenersi dal porre in essere qualsivoglia opera di carattere strutturale in mancanza della verifica e del preventivo assenso da parte dello scrivente collaudatore;",
      "Ad osservare tutte le prescrizioni indicate negli elaborati tecnici esecutivi delle opere in esecuzione e a consultare la D.LL., nonché lo scrivente collaudatore in corso d’opera, nel caso in cui dovessero presentarsi varianti tecniche tali da richiedere i dovuti chiarimenti esecutivi.",
      "ad effettuare i dovuti controlli di accettazione in cantiere dei materiali da costruzione quali, a titolo esemplificativo e non esaustivo, i Certificati di tracciabilità dei materiali da costruzione e i certificati dei centri di trasformazione (per il ferro di armatura della platea e per il cls C32/40);",
      "A fornire, appena individuato, le dovute informazioni sull’impianto di betonaggio (distanza dal cantiere, sistema di qualità di gestione dell’impianto, relazione di omogeneità sulla miscela del calcestruzzo che dovrà essere utilizzata);",
      "A provvedere ad effettuare la prequalifica dell’impianto di betonaggio, secondo il modello fornito dallo scrivente, al fine di attestare la qualità e l'affidabilità dell'impianto stesso;",
      "Ad attenersi, durante le fasi di getto, scrupolosamente ai prelievi di calcestruzzo secondo le indicazioni contenute al paragrafo 11.2.5.1 del DM 17/01/2018 e al paragrafo C11.2.5.1 della Circolare n° 7 del 21/01/2019;",
      "al fine di capire se la qualità del cls fornito in cantiere rispetta le prescrizioni progettuali, sarà necessario effettuare un prelievo extra (costituito da due ulteriori cubetti di cls) rispetto a quelli normati, al fine di far schiacciare gli stessi dopo 10 giorni dal getto e vedere se la percentuale di resistenza raggiunta è in linea con la classe prescritta;",
      "Altro..."
    ],
    common: [
      "Di quanto ispezionato si è effettuato il rilievo fotografico allegato al presente verbale per farne parte integrante.",
      "Per le parti non più ispezionabili, di difficile ispezione o non potute controllare, la Direzione dei lavori e l’impresa hanno consegnato la documentazione fotografica in fase di esecuzione ed hanno concordemente assicurato, a seguito di esplicita richiesta del sottoscritto, la perfetta esecuzione secondo le prescrizioni contrattuali e, in particolare l’Impresa, per gli effetti dell’art. 1667 del codice civile, ha dichiarato non esservi difformità o vizi.",
      "Le parti si aggiornano, per la seconda visita di collaudo, a data da concordarsi, dando atto che sarà preceduta da convocazione da parte dello scrivente Collaudatore.",
      "Altro..."
    ]
  };

  const addToField = (field: 'testerRequests' | 'testerInvitations' | 'commonParts') => {
    const currentVal = (currentDoc as any)[field] || '';
    onUpdateDocument({ ...currentDoc, [field]: (currentVal + (currentVal ? '\n' : '') + tempText).trim() });
    setTempText('');
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in">
      {/* Header */}
      <div className="flex bg-white p-4 rounded-xl shadow-sm border mb-8 justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-lg"><Gavel className="w-5 h-5 text-white"/></div>
          <select className="font-bold border-none bg-transparent text-lg focus:ring-0 cursor-pointer text-slate-800" value={currentDocId} onChange={e => onSelectDocument(e.target.value)}>
                {documents.filter(d => d.type === 'VERBALE_COLLAUDO').map(d => (
                <option key={d.id} value={d.id}>Verbale Collaudo n. {d.visitNumber} del {new Date(d.date).toLocaleDateString('it-IT')}</option>
                ))}
          </select>
        </div>
        <div className="flex gap-2">
            <button onClick={() => onNewDocument('VERBALE_COLLAUDO')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs shadow hover:bg-blue-700 transition-colors">+ Nuovo Verbale</button>
            <button onClick={() => onDeleteDocument(currentDoc.id)} className="text-red-400 p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5"/></button>
        </div>
      </div>

      {/* Wizard Step Navigation */}
      <div className="flex bg-white rounded-xl p-1 mb-8 shadow-sm border overflow-x-auto no-scrollbar">
          {[
              { id: 'info', label: '1. Dati', icon: Calendar },
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
        {/* Tab 1: Dati */}
        {subTab === 'info' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border animate-in slide-in-from-bottom-2">
            <h3 className="font-bold mb-6 text-xs uppercase text-slate-400 border-b pb-3">Dati Cronologici Verbale</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div><label className="text-[10px] font-bold text-slate-500 uppercase">Data Sopralluogo</label><input type="date" className="w-full p-3 border rounded-xl" value={currentDoc.date} onChange={e => onUpdateDocument({...currentDoc, date: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase">Ora Inizio</label><input type="time" className="w-full p-3 border rounded-xl" value={currentDoc.time} onChange={e => onUpdateDocument({...currentDoc, time: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase">Numero Progressivo</label><input type="number" className="w-full p-3 border rounded-xl font-bold" value={currentDoc.visitNumber} onChange={e => onUpdateDocument({...currentDoc, visitNumber: parseInt(e.target.value) || 1})} /></div>
            </div>
          </div>
        )}

        {/* Tab 2: Convocazione */}
        {subTab === 'convocation' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border animate-in slide-in-from-bottom-2">
            <h3 className="font-bold mb-6 text-xs uppercase text-slate-400 border-b pb-3">Dettagli Convocazione Visita</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Metodo Invio</label>
                <select className="w-full p-3 border rounded-xl" value={currentDoc.convocationMethod} onChange={e => onUpdateDocument({...currentDoc, convocationMethod: e.target.value})}>
                  <option value="PEC">PEC</option><option value="Email">Email</option><option value="Nota Protocollata">Nota Protocollata</option><option value="Vie Brevi">Vie Brevi</option>
                </select>
              </div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase">Data Invio Nota</label><input type="date" className="w-full p-3 border rounded-xl" value={currentDoc.convocationDate} onChange={e => onUpdateDocument({...currentDoc, convocationDate: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="text-[10px] font-bold text-slate-500 uppercase">Dettagli Testuali</label><textarea className="w-full p-3 border rounded-xl h-24" placeholder="Es: convocata a seguito di comunicazione dell'impresa..." value={currentDoc.convocationDetails} onChange={e => onUpdateDocument({...currentDoc, convocationDetails: e.target.value})} /></div>
            </div>
          </div>
        )}

        {/* Tab 3: Presenti */}
        {subTab === 'attendees' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border animate-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h3 className="font-bold text-xs uppercase text-slate-400">Soggetti Presenti al Sopralluogo</h3>
                <button onClick={regenerateAttendees} className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline"><RefreshCw className="w-3 h-3"/> Rigenera da Anagrafica Appalto</button>
            </div>
            <textarea className="w-full p-5 border rounded-2xl h-80 text-sm font-mono bg-slate-50 shadow-inner" value={currentDoc.attendees} onChange={e => onUpdateDocument({...currentDoc, attendees: e.target.value})} placeholder="Elenco dei presenti..."/>
          </div>
        )}

        {/* Tab 4: Lavori */}
        {subTab === 'works' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border animate-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h3 className="font-bold text-xs uppercase text-slate-400">Lavorazioni Accertate</h3>
                <button onClick={generateIntroText} className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline"><RefreshCw className="w-3 h-3"/> Rigenera Frase Introduttiva</button>
            </div>
            <div className="mb-8">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block italic">Testo Introduttivo Lavorazioni</label>
                <textarea className="w-full p-4 border rounded-xl h-24 text-sm bg-slate-50 shadow-inner" value={currentDoc.worksIntroText} onChange={e => onUpdateDocument({...currentDoc, worksIntroText: e.target.value})}/>
            </div>
            
            <div className="space-y-6">
                <div>
                    <label className="text-xs font-bold text-slate-700 uppercase mb-3 block">Elenco Lavorazioni Rilevate</label>
                    <div className="flex gap-2 mb-4">
                        <input type="text" className="flex-1 p-3 border rounded-xl text-sm shadow-sm" value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItemToList('worksExecuted')} placeholder="Esempio: Completamento intonaci interni..."/>
                        <button onClick={() => addItemToList('worksExecuted')} className="bg-blue-600 text-white px-5 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-all">+</button>
                    </div>
                    <ul className="space-y-2">
                        {currentDoc.worksExecuted.map((w, i) => (
                            <li key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border group">
                                <input type="text" className="bg-transparent border-none flex-1 p-0 focus:ring-0 text-sm" value={w} onChange={e => { const n = [...currentDoc.worksExecuted]; n[i] = e.target.value; onUpdateDocument({...currentDoc, worksExecuted: n}); }}/>
                                <button onClick={() => { const n = [...currentDoc.worksExecuted]; n.splice(i, 1); onUpdateDocument({...currentDoc, worksExecuted: n}); }} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                            </li>
                        ))}
                        {currentDoc.worksExecuted.length === 0 && <p className="text-center py-6 text-slate-400 text-xs italic">Nessuna lavorazione aggiunta. Usa il campo sopra.</p>}
                    </ul>
                </div>
            </div>
          </div>
        )}

        {/* Tabs 5, 6, 7: Richieste, Inviti e Parti Comuni con MENU A FINESTRA */}
        {['requests', 'invites', 'common'].includes(subTab) && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border animate-in slide-in-from-bottom-2">
                <h3 className="font-bold mb-6 text-xs uppercase text-slate-400 border-b pb-3">
                    {subTab === 'requests' ? '5. Richieste del Collaudatore' : subTab === 'invites' ? '6. Inviti del Collaudatore' : '7. Parti Comuni e Conclusioni'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Menu a finestra (Selezione frasi) */}
                    <div className="space-y-5">
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-3 block">Menu a finestra: Seleziona frase standard</label>
                            <select 
                                className="w-full p-3 border rounded-xl bg-white text-sm shadow-sm cursor-pointer" 
                                onChange={e => setTempText(e.target.value === 'Altro...' ? '' : e.target.value)}
                            >
                                <option value="">-- Seleziona una disposizione --</option>
                                {OPTIONS[subTab as keyof typeof OPTIONS].map((opt, idx) => (
                                    <option key={idx} value={opt}>{opt.substring(0, 60)}...</option>
                                ))}
                            </select>

                            <div className="mt-6">
                                <label className="text-[10px] font-bold text-blue-800 uppercase mb-2 block">Modifica testo selezionato prima dell'inserimento:</label>
                                <textarea 
                                    className="w-full p-4 border border-blue-200 rounded-xl h-48 text-sm bg-white shadow-inner focus:ring-2 focus:ring-blue-500/20 outline-none" 
                                    value={tempText} 
                                    onChange={e => setTempText(e.target.value)}
                                    placeholder="Il testo apparirà qui dopo la selezione..."
                                />
                                <button 
                                    onClick={() => addToField(subTab === 'requests' ? 'testerRequests' : subTab === 'invites' ? 'testerInvitations' : 'commonParts' as any)} 
                                    className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-xs uppercase shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4"/> Aggiungi al Verbale
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Editor finale del documento */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Testo inserito nel documento finale:</label>
                        <textarea 
                            className="w-full p-5 border rounded-2xl h-[450px] text-sm leading-relaxed bg-slate-50 font-serif shadow-inner focus:ring-2 focus:ring-blue-500/20 outline-none" 
                            value={(currentDoc as any)[subTab === 'requests' ? 'testerRequests' : (subTab === 'invites' ? 'testerInvitations' : 'commonParts')]} 
                            onChange={e => onUpdateDocument({...currentDoc, [subTab === 'requests' ? 'testerRequests' : (subTab === 'invites' ? 'testerInvitations' : 'commonParts')]: e.target.value})}
                        />
                    </div>
                </div>
            </div>
        )}

        {/* Tab 8: Valutazioni */}
        {subTab === 'evaluations' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border animate-in slide-in-from-bottom-2">
            <h3 className="font-bold mb-6 text-xs uppercase text-slate-400 border-b pb-3">Valutazioni e Osservazioni Conclusive</h3>
            <textarea className="w-full p-8 border rounded-2xl h-96 text-sm leading-relaxed font-serif bg-slate-50 shadow-inner" value={currentDoc.observations} onChange={e => onUpdateDocument({...currentDoc, observations: e.target.value})} placeholder="Esito dei controlli, osservazioni tecniche e valutazioni del collaudatore..."/>
          </div>
        )}

        <div className="flex items-center justify-center p-4 bg-slate-900 rounded-2xl text-white gap-3 shadow-xl">
            <Save className="w-4 h-4 text-green-500 animate-pulse"/>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Backup locale database attivo</span>
        </div>
      </div>
    </div>
  );
};
