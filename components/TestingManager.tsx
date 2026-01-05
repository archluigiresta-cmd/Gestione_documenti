
import React, { useState, useEffect } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { 
    Gavel, Plus, Trash2, Calendar, Clock, Users, ListChecks, Wand2, 
    Loader2, Save, Mail, FileText, ChevronRight, ChevronLeft, 
    CheckSquare, Info, MessageSquare, Briefcase, Layout
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
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 animate-in fade-in">
        <Gavel className="w-16 h-16 text-slate-200 mb-4"/>
        <h3 className="text-xl font-bold text-slate-800">Archivio Verbali di Collaudo</h3>
        <p className="text-slate-500 mt-2 mb-6">Nessun verbale presente per questo appalto.</p>
        <button onClick={() => onNewDocument('VERBALE_COLLAUDO')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
            <Plus className="w-5 h-5"/> Crea Primo Verbale
        </button>
      </div>
    );
  }

  const polish = async (field: 'premis' | 'observations') => {
    if (!process.env.API_KEY) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Agisci come un esperto collaudatore italiano. Riscrivi in linguaggio tecnico-formale professionale il seguente testo per un verbale: "${currentDoc[field]}"`;
      const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      if (res.text) onUpdateDocument({ ...currentDoc, [field]: res.text.trim() });
    } catch (e) { console.error(e); }
    finally { setIsGenerating(false); }
  };

  const addAttendee = (role: string, name: string, title: string = '') => {
    const entry = `${role}: ${title} ${name}`.trim();
    if (!currentDoc.attendees.includes(entry)) {
      onUpdateDocument({ ...currentDoc, attendees: (currentDoc.attendees + (currentDoc.attendees ? '\n' : '') + entry).trim() });
    }
  };

  const addItemToList = (field: 'worksExecuted' | 'worksInProgress' | 'upcomingWorks') => {
    if (!newItem.trim()) return;
    onUpdateDocument({ ...currentDoc, [field]: [...(currentDoc[field] || []), newItem.trim()] });
    setNewItem('');
  };

  const removeListItem = (field: 'worksExecuted' | 'worksInProgress' | 'upcomingWorks', index: number) => {
    const next = [...(currentDoc[field] || [])];
    next.splice(index, 1);
    onUpdateDocument({ ...currentDoc, [field]: next });
  };

  const editListItem = (field: 'worksExecuted' | 'worksInProgress' | 'upcomingWorks', index: number, val: string) => {
    const next = [...(currentDoc[field] || [])];
    next[index] = val;
    onUpdateDocument({ ...currentDoc, [field]: next });
  };

  // Fixed type error by expanding allowed fields in addToDocumentField
  const addToDocumentField = (field: 'testerRequests' | 'testerInvitations' | 'commonParts' | 'worksInProgress' | 'upcomingWorks', text: string) => {
    if (!text.trim()) return;
    const currentVal = (currentDoc[field] as string) || '';
    onUpdateDocument({ ...currentDoc, [field]: (currentVal + (currentVal ? '\n' : '') + text.trim()).trim() });
    setTempText('');
  };

  const REQUEST_OPTIONS = [
    "se rispetto al progetto appaltato vi siano previsioni di varianti e, in caso di riscontro positivo, se le stesse siano state gestite formalmente;",
    "se vi siano ritardi rispetto al cronoprogramma e, in caso di riscontro positivo, cosa si stia facendo per allineare le attività al cronoprogramma.",
    "Altro..."
  ];

  const INVITE_OPTIONS = [
    "Ad osservare tutte le disposizioni riportate nel PSC e nel POS quest’ultimo redatto dall’impresa esecutrice delle opere;",
    "ad astenersi dal porre in essere qualsivoglia opera di carattere strutturale in mancanza della verifica e del preventivo assenso da parte dello scrivente collaudatore;",
    "Ad osservare tutte le prescrizioni indicate negli elaborati tecnici esecutivi delle opere in esecuzione e a consultare la D.LL., nonché lo scrivente collaudatore in corso d’opera, nel caso in cui dovessero presentarsi varianti tecniche tali da richiedere i dovuti chiarimenti esecutivi.",
    "ad effettuare i dovuti controlli di accettazione in cantiere dei materiali da costruzione quali, a titolo esemplificativo e non esaustivo, i Certificati di tracciabilità dei materiali da costruzione e i certificati dei centri di trasformazione (per il ferro di armatura della platea e per il cls C32/40);",
    "A fornire, appena individuato, le dovute informazioni sull’impianto di betonaggio (distanza dal cantiere, sistema di qualità di gestione dell’impianto, relazione di omogeneità sulla miscela del calcestruzzo che dovrà essere utilizzata);",
    "A provvedere ad effettuare la prequalifica dell’impianto di betonaggio, secondo il modello fornito dallo scrivente, al fine di attestare la qualità e l'affidabilità dell'impianto stesso;",
    "Ad attenersi, durante le fasi di getto, scrupolosamente ai prelievi di calcestruzzo secondo le indicazioni contenute al paragrafo 11.2.5.1 del DM 17/01/2018 e al paragrafo C11.2.5.1 della Circolare n° 7 del 21/01/2019;",
    "al fine di capire se la qualità del cls fornito in cantiere rispetta le prescrizioni progettuali, sarà necessario effettuare un prelievo extra (costituito da due ulteriori cubetti di cls) rispetto a quelli normati, al fine di far schiacciare gli stessi dopo 10 giorni dal getto e vedere se la percentuale di resistenza raggiunta è in linea con la classe prescritta;",
    "Altro..."
  ];

  const COMMON_OPTIONS = [
    "Di quanto ispezionato si è effettuato il rilievo fotografico allegato al presente verbale per farne parte integrante.",
    "Per le parti non più ispezionabili, di difficile ispezione o non potute controllare, la Direzione dei lavori e l’impresa hanno consegnato la documentazione fotografica in fase di esecuzione ed hanno concordemente assicurato, a seguito di esplicita richiesta del sottoscritto, la perfetta esecuzione secondo le prescrizioni contrattuali e, in particolare l’Impresa, per gli effetti dell’art. 1667 del codice civile, ha dichiarato non esservi difformità o vizi.",
    "Le parti si aggiornano, per la seconda visita di collaudo, a data da concordarsi, dando atto che sarà preceduta da convocazione da parte dello scrivente Collaudatore.",
    "Altro..."
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in">
      
      {/* TOOLBAR */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-50 rounded-lg">
             <Gavel className="w-5 h-5 text-blue-600"/>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seleziona Verbale:</span>
            <select 
              className="font-bold border-none bg-transparent p-0 focus:ring-0 text-slate-800 cursor-pointer" 
              value={currentDocId} 
              onChange={e => onSelectDocument(e.target.value)}
            >
                {documents.filter(d => d.type === 'VERBALE_COLLAUDO').map(d => (
                <option key={d.id} value={d.id}>Verbale n. {d.visitNumber} del {new Date(d.date).toLocaleDateString()}</option>
                ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNewDocument('VERBALE_COLLAUDO')} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 flex items-center gap-2">
            <Plus className="w-4 h-4"/> Nuovo
          </button>
          <button onClick={() => onDeleteDocument(currentDoc.id)} className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-5 h-5"/>
          </button>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
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
              <button
                key={t.id}
                onClick={() => setSubTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    subTab === t.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                  <t.icon className="w-4 h-4" />
                  {t.label}
              </button>
          ))}
      </div>

      <div className="space-y-6">
        
        {subTab === 'info' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in slide-in-from-right-4">
            <h3 className="font-bold mb-8 flex items-center gap-2 uppercase text-sm tracking-widest text-slate-400 border-b pb-3">
               <Calendar className="w-4 h-4"/> 1. Informazioni Visita
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Data Sopralluogo</label>
                <input type="date" className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-blue-500/20" value={currentDoc.date} onChange={e => onUpdateDocument({...currentDoc, date: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Ora Inizio</label>
                <input type="time" className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-blue-500/20" value={currentDoc.time} onChange={e => onUpdateDocument({...currentDoc, time: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Numero Verbale</label>
                <input type="number" className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white font-bold transition-all outline-none focus:ring-2 focus:ring-blue-500/20" value={currentDoc.visitNumber} onChange={e => onUpdateDocument({...currentDoc, visitNumber: parseInt(e.target.value) || 1})} />
              </div>
            </div>
          </div>
        )}

        {subTab === 'convocation' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in slide-in-from-right-4">
            <h3 className="font-bold mb-8 flex items-center gap-2 uppercase text-sm tracking-widest text-slate-400 border-b pb-3">
               <Mail className="w-4 h-4"/> 2. Dettagli Convocazione
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Metodo</label>
                <select className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white transition-all" value={currentDoc.convocationMethod} onChange={e => onUpdateDocument({...currentDoc, convocationMethod: e.target.value})}>
                    <option value="PEC">PEC</option>
                    <option value="Email">Email</option>
                    <option value="Nota Protocollata">Nota Protocollata</option>
                    <option value="Vie Brevi">Vie Brevi</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Data Invio</label>
                <input type="date" className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white transition-all" value={currentDoc.convocationDate} onChange={e => onUpdateDocument({...currentDoc, convocationDate: e.target.value})} />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Dettagli Aggiuntivi (Riferimento)</label>
                <input type="text" className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white transition-all" value={currentDoc.convocationDetails} onChange={e => onUpdateDocument({...currentDoc, convocationDetails: e.target.value})} placeholder="Es. PEC del 10/10/2025 o comunicazione dell'impresa..." />
              </div>
            </div>
          </div>
        )}

        {subTab === 'attendees' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in slide-in-from-right-4">
            <div className="flex justify-between items-center mb-8 border-b pb-3">
                <h3 className="font-bold flex items-center gap-2 uppercase text-sm tracking-widest text-slate-400">
                   <Users className="w-4 h-4"/> 3. Soggetti Presenti
                </h3>
                <div className="flex gap-2">
                    <button onClick={() => addAttendee('Responsabile Unico del Progetto', project.subjects.rup.contact.name, project.subjects.rup.contact.title)} className="px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg text-[10px] font-bold text-blue-600 hover:bg-blue-100">+ RUP</button>
                    <button onClick={() => addAttendee('Direttore dei Lavori', project.subjects.dl.contact.name, project.subjects.dl.contact.title)} className="px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg text-[10px] font-bold text-blue-600 hover:bg-blue-100">+ DL</button>
                    <button onClick={() => addAttendee('Coord. Sicurezza Esecuzione', project.subjects.cse.contact.name, project.subjects.cse.contact.title)} className="px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg text-[10px] font-bold text-blue-600 hover:bg-blue-100">+ CSE</button>
                    <button onClick={() => addAttendee(`per l'Impresa ${project.contractor.mainCompany.name} (Legale Rappresentante)`, project.contractor.mainCompany.repName, 'Sig.')} className="px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg text-[10px] font-bold text-blue-600 hover:bg-blue-100">+ Impresa</button>
                </div>
            </div>
            <textarea className="w-full p-5 border rounded-2xl h-64 text-sm font-mono leading-relaxed bg-slate-50 focus:bg-white transition-all shadow-inner" value={currentDoc.attendees} onChange={e => onUpdateDocument({...currentDoc, attendees: e.target.value})} placeholder="Elenco dettagliato dei presenti..."/>
          </div>
        )}

        {subTab === 'works' && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold mb-4 flex items-center gap-2 uppercase text-sm tracking-widest text-slate-400 border-b pb-3">
                   <ListChecks className="w-4 h-4"/> 4. Lavorazioni e Accertamenti
                </h3>
                <div className="mb-8">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Frase Introduttiva (Editabile)</label>
                    <textarea className="w-full p-4 border rounded-xl h-24 text-sm italic bg-slate-50" value={currentDoc.worksIntroText} onChange={e => onUpdateDocument({...currentDoc, worksIntroText: e.target.value})}/>
                </div>
                
                <div className="space-y-8">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
                    <label className="text-xs font-bold text-slate-700 uppercase mb-4 block">Riepilogo Lavori Eseguiti (Accertamenti Periodo)</label>
                    <div className="flex gap-2 mb-4">
                      <input type="text" className="flex-1 p-3 border rounded-xl text-sm shadow-sm" value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItemToList('worksExecuted')} placeholder="Aggiungi una lavorazione o accertamento..."/>
                      <button onClick={() => addItemToList('worksExecuted')} className="bg-blue-600 text-white px-5 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-all">+</button>
                    </div>
                    <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                      {currentDoc.worksExecuted.map((w, i) => (
                        <li key={i} className="flex justify-between items-center bg-white p-3 rounded-xl text-sm border shadow-sm group">
                          <input type="text" className="bg-transparent border-none flex-1 p-0 focus:ring-0" value={w} onChange={e => editListItem('worksExecuted', i, e.target.value)}/>
                          <button onClick={() => removeListItem('worksExecuted', i)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 className="w-4 h-4"/></button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><Clock className="w-3 h-3"/> Opere in Corso di Esecuzione</label>
                        <div className="flex gap-2">
                             <input type="text" className="flex-1 p-2 border rounded-lg text-xs" onKeyDown={e => { if(e.key === 'Enter') { addToDocumentField('worksInProgress', (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }} placeholder="Aggiungi..." />
                        </div>
                        <textarea className="w-full p-3 border rounded-xl h-32 text-sm bg-slate-50" value={currentDoc.worksInProgress} onChange={e => onUpdateDocument({...currentDoc, worksInProgress: e.target.value})} placeholder="Descrizione opere in corso..."/>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><Plus className="w-3 h-3"/> Prossime Attività Previste</label>
                        <div className="flex gap-2">
                             <input type="text" className="flex-1 p-2 border rounded-lg text-xs" onKeyDown={e => { if(e.key === 'Enter') { addToDocumentField('upcomingWorks', (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }} placeholder="Aggiungi..." />
                        </div>
                        <textarea className="w-full p-3 border rounded-xl h-32 text-sm bg-slate-50" value={currentDoc.upcomingWorks} onChange={e => onUpdateDocument({...currentDoc, upcomingWorks: e.target.value})} placeholder="Pianificazione prossime lavorazioni..."/>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        )}

        {['requests', 'invites', 'common'].includes(subTab) && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in slide-in-from-right-4">
                <h3 className="font-bold mb-6 flex items-center gap-2 uppercase text-sm tracking-widest text-slate-400 border-b pb-3">
                    {subTab === 'requests' && <MessageSquare className="w-4 h-4" />}
                    {subTab === 'invites' && <Briefcase className="w-4 h-4" />}
                    {subTab === 'common' && <Layout className="w-4 h-4" />}
                    {subTab === 'requests' ? '5. Richieste del Collaudatore' : subTab === 'invites' ? '6. Inviti del Collaudatore' : '7. Parti Comuni / Chiusura'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Seleziona Frase Standard</label>
                        <select 
                            className="w-full p-3 border rounded-xl bg-slate-50 text-sm"
                            onChange={e => setTempText(e.target.value === 'Altro...' ? '' : e.target.value)}
                        >
                            <option value="">-- Scegli un'opzione --</option>
                            {(subTab === 'requests' ? REQUEST_OPTIONS : subTab === 'invites' ? INVITE_OPTIONS : COMMON_OPTIONS).map((opt, idx) => (
                                <option key={idx} value={opt}>{opt.length > 60 ? opt.substring(0, 60) + '...' : opt}</option>
                            ))}
                        </select>
                        
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <label className="text-[10px] font-bold text-blue-800 uppercase mb-2 block">Modifica ed Inserisci</label>
                            <textarea 
                                className="w-full p-3 border rounded-lg h-32 text-sm focus:ring-2 focus:ring-blue-500"
                                value={tempText}
                                onChange={e => setTempText(e.target.value)}
                                placeholder="Scrivi qui per personalizzare la frase prima di aggiungerla..."
                            />
                            <button 
                                onClick={() => addToDocumentField(subTab === 'requests' ? 'testerRequests' : subTab === 'invites' ? 'testerInvitations' : 'commonParts', tempText)}
                                className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-xs uppercase shadow-md hover:bg-blue-700 transition-all"
                            >
                                Aggiungi al Documento
                            </button>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Contenuto nel Verbale</label>
                        <textarea 
                            className="w-full p-4 border rounded-2xl h-72 text-sm leading-relaxed bg-slate-50 font-serif"
                            value={currentDoc[subTab === 'requests' ? 'testerRequests' : subTab === 'invites' ? 'testerInvitations' : 'commonParts']}
                            onChange={e => onUpdateDocument({...currentDoc, [subTab === 'requests' ? 'testerRequests' : subTab === 'invites' ? 'testerInvitations' : 'commonParts']: e.target.value})}
                        />
                    </div>
                </div>
            </div>
        )}

        {subTab === 'evaluations' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in slide-in-from-right-4">
            <div className="flex justify-between items-center mb-8 border-b pb-3">
                <h3 className="font-bold flex items-center gap-2 uppercase text-sm tracking-widest text-slate-400">
                   <FileText className="w-4 h-4"/> 8. Valutazioni Tecnico-Amministrative
                </h3>
                <button onClick={() => polish('observations')} disabled={isGenerating} className="text-xs text-purple-600 font-bold flex items-center gap-1 border border-purple-200 px-3 py-1 rounded-full hover:bg-purple-50">
                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3"/>} IA Formalizza
                </button>
            </div>
            <textarea className="w-full p-6 border rounded-2xl h-[400px] text-sm leading-relaxed font-serif bg-slate-50 focus:bg-white transition-all shadow-inner" value={currentDoc.observations} onChange={e => onUpdateDocument({...currentDoc, observations: e.target.value})} placeholder="Inserisci qui le valutazioni, riserve dell'impresa o disposizioni finali..."/>
          </div>
        )}

        {/* PERSISTENCE INDICATOR */}
        <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl shadow-xl mt-8 text-white">
          <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 opacity-80">
            <Save className="w-4 h-4 text-green-500"/> Salvataggio automatico nel database locale
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">
            Protocollo EdilApp v2.5
          </div>
        </div>
      </div>
    </div>
  );
};
