
import React, { useState, useRef, useEffect } from 'react';
import { DocumentVariables, ProjectConstants, TesterVisitSummary, DesignerProfile } from '../types';
import { Calendar, Clock, Mail, ClipboardCheck, Users, CheckSquare, Plus, Trash2, ArrowDownToLine, CalendarRange, ListChecks, ArrowRight, ArrowLeft, Activity, CalendarCheck as CalendarIconNext, RefreshCw, MessageSquare, Bell, FileCheck2, X, TextQuote, Wand2, FileSignature, FileText } from 'lucide-react';

interface TestingManagerProps {
  project: ProjectConstants;
  documents: DocumentVariables[];
  currentDocId: string;
  onSelectDocument: (id: string) => void;
  onUpdateDocument: (d: DocumentVariables) => void;
  onNewDocument: () => void;
  onDeleteDocument: (id: string) => void;
  onUpdateProject?: (p: ProjectConstants) => void; 
  readOnly?: boolean; 
}

// STANDARD TEXT PRESETS
const REQUEST_OPTIONS = [
    "se rispetto al progetto appaltato vi siano previsioni di varianti e, in caso di riscontro positivo, se le stesse siano state gestite formalmente.",
    "se vi siano ritardi rispetto al cronoprogramma e, in caso di riscontro positivo, cosa si stia facendo per allineare le attività al cronoprogramma."
];

const INVITATION_OPTIONS = [
    "Ad osservare tutte le disposizioni riportate nel PSC e nel POS quest’ultimo redatto dall’impresa esecutrice delle opere.",
    "Ad astenersi dal porre in essere qualsivoglia opera di carattere strutturale in mancanza della verifica e del preventivo assenso da parte dello scrivente collaudatore.",
    "Ad osservare tutte le prescrizioni indicate negli elaborati tecnici esecutivi delle opere in esecuzione e a consultare la D.LL., nonché lo scrivente collaudatore in corso d’opera, nel caso in cui dovessero presentarsi varianti tecniche tali da richiedere i dovuti chiarimenti esecutivi.",
    "Ad effettuare i dovuti controlli di accettazione in cantiere dei materiali da costruzione quali, a titolo esemplificativo e non esaustivo, i Certificati di tracciabilità dei materiali da costruzione e i certificati dei centri di trasformazione.",
    "A fornire, appena individuato, le dovute informazioni sull’impianto di betonaggio (distanza dal cantiere, sistema di qualità di gestione dell’impianto, relazione di omogeneità sulla miscela del calcestruzzo che dovrà essere utilizzata).",
    "A provvedere ad effettuare la prequalifica dell’impianto di betonaggio, secondo il modello fornito dallo scrivente, al fine di attestare la qualità e l'affidabilità dell'impianto stesso.",
    "Ad attenersi, durante le fasi di getto, scrupolosamente ai prelievi di calcestruzzo secondo le indicazioni contenute al paragrafo 11.2.5.1 del DM 17/01/2018 e al paragrafo C11.2.5.1 della Circolare n° 7 del 21/01/2019.",
    "Al fine di capire se la qualità del cls fornito in cantiere rispetta le prescrizioni progettuali, sarà necessario effettuare un prelievo extra (costituito da due ulteriori cubetti di cls) rispetto a quelli normati, al fine di far schiacciare gli stessi dopo 10 giorni dal getto e vedere se la percentuale di resistenza raggiunta è in linea con la classe prescritta."
];

const COMMON_PART_OPTIONS = [
    "Di quanto ispezionato si è effettuato il rilievo fotografico allegato al presente verbale per farne parte integrante.",
    "Per le parti non più ispezionabili, di difficile ispezione o non potute controllare, la Direzione dei lavori e l’impresa hanno consegnato la documentazione fotografica in fase di esecuzione ed hanno concordemente assicurato, a seguito di esplicita richiesta del sottoscritto, la perfetta esecuzione secondo le prescrizioni contrattuali e, in particolare l’Impresa, per gli effetti dell’art. 1667 del codice civile, ha dichiarato non esservi difformità o vizi.",
    "Le parti si aggiornano, per la seconda visita di collaudo, a data da concordarsi, dando atto che sarà preceduta da convocazione da parte dello scrivente Collaudatore."
];

export const TestingManager: React.FC<TestingManagerProps> = ({
  project,
  documents,
  currentDocId,
  onSelectDocument,
  onUpdateDocument,
  onNewDocument,
  onDeleteDocument,
  onUpdateProject,
  readOnly = false
}) => {
  const currentDoc = documents.find(d => d.id === currentDocId) || documents[0];
  const [step, setStep] = useState<'info' | 'convocation' | 'works' | 'requests' | 'invitations' | 'common' | 'eval' | 'admin-acts'>('info');

  const [summaryManualInput, setSummaryManualInput] = useState('');
  const [inProgressInput, setInProgressInput] = useState('');
  const [upcomingInput, setUpcomingInput] = useState('');

  const [activeCustomField, setActiveCustomField] = useState<'testerRequests' | 'testerInvitations' | 'commonParts' | null>(null);
  const [customText, setCustomText] = useState('');
  
  const requestsSelectRef = useRef<HTMLSelectElement>(null);
  const invitationsSelectRef = useRef<HTMLSelectElement>(null);
  const commonSelectRef = useRef<HTMLSelectElement>(null);

  const handleUpdate = (updatedDoc: DocumentVariables) => {
      if (!readOnly) onUpdateDocument(updatedDoc);
  };

  const generateIntroText = () => {
        if(readOnly) return;
        
        const prevDocs = documents
            .filter(d => d.visitNumber < currentDoc.visitNumber) 
            .sort((a, b) => a.visitNumber - b.visitNumber);

        const formatShortDate = (dateStr: string) => {
            if (!dateStr) return '...';
            try { return new Date(dateStr).toLocaleDateString('it-IT'); } catch { return dateStr; }
        };

        let prevDateDesc = 'la consegna dei lavori';
        if (prevDocs.length > 0) {
            const lastDoc = prevDocs[prevDocs.length - 1];
            prevDateDesc = `il ${formatShortDate(lastDoc.date)}`;
        } else if (project.executionPhase.deliveryDate) {
            prevDateDesc = `il ${formatShortDate(project.executionPhase.deliveryDate)}`;
        }

        const defaultText = `Durante il presente sopralluogo prende atto che, nel periodo intercorrente tra ${prevDateDesc} e la data odierna sono state effettuate le seguenti lavorazioni:`;
        
        handleUpdate({...currentDoc, worksIntroText: defaultText});
  };

  useEffect(() => {
    if (!currentDoc || readOnly) return;
    if (!currentDoc.worksIntroText || currentDoc.worksIntroText.trim() === '') {
        generateIntroText();
    }
  }, [currentDoc?.id]);

  if (!currentDoc) return <div className="p-8 text-center">Nessun verbale attivo.</div>;

  const handlePresetInsert = (field: 'testerRequests' | 'testerInvitations' | 'commonParts', text: string) => {
      if (readOnly) return;
      const current = currentDoc[field] || '';
      const separator = current.trim() ? '\n- ' : '- ';
      handleUpdate({ ...currentDoc, [field]: current + separator + text });
  };

  const handleCustomConfirm = () => {
      if (activeCustomField && customText.trim()) {
          handlePresetInsert(activeCustomField, customText.trim());
          setCustomText('');
          setActiveCustomField(null);
          if (activeCustomField === 'testerRequests' && requestsSelectRef.current) requestsSelectRef.current.value = "";
          if (activeCustomField === 'testerInvitations' && invitationsSelectRef.current) invitationsSelectRef.current.value = "";
          if (activeCustomField === 'commonParts' && commonSelectRef.current) commonSelectRef.current.value = "";
      }
  };

  const handleCustomCancel = () => {
      setCustomText('');
      setActiveCustomField(null);
       if (activeCustomField === 'testerRequests' && requestsSelectRef.current) requestsSelectRef.current.value = "";
       if (activeCustomField === 'testerInvitations' && invitationsSelectRef.current) invitationsSelectRef.current.value = "";
       if (activeCustomField === 'commonParts' && commonSelectRef.current) commonSelectRef.current.value = "";
  };

  const updateExec = (field: string, value: any) => {
    if (readOnly || !onUpdateProject) return;
    onUpdateProject({
        ...project,
        executionPhase: {
            ...project.executionPhase,
            [field]: value
        }
    });
  };

  const addToListInDoc = (field: 'worksInProgress' | 'upcomingWorks', inputVal: string, setInputVal: (s: string) => void) => {
      if (readOnly || !inputVal.trim()) return;
      const currentText = currentDoc[field] || '';
      const items = currentText.split('\n').filter(i => i.trim());
      items.push(inputVal.trim());
      handleUpdate({ ...currentDoc, [field]: items.join('\n') });
      setInputVal('');
  };

  const updateListInDoc = (field: 'worksInProgress' | 'upcomingWorks', index: number, newValue: string) => {
      if (readOnly) return;
      const currentText = currentDoc[field] || '';
      const items = currentText.split('\n').filter(i => i.trim());
      items[index] = newValue;
      handleUpdate({ ...currentDoc, [field]: items.join('\n') });
  };

  const removeFromListInDoc = (field: 'worksInProgress' | 'upcomingWorks', index: number) => {
      if (readOnly) return;
      const currentText = currentDoc[field] || '';
      const items = currentText.split('\n').filter(i => i.trim());
      items.splice(index, 1);
      handleUpdate({ ...currentDoc, [field]: items.join('\n') });
  };

  const getSubjectName = (profile: any) => {
      if (!profile || !profile.contact || !profile.contact.name) return '';
      if (profile.isLegalEntity) {
          if (profile.operatingDesigners && profile.operatingDesigners.length > 0) {
              const names = profile.operatingDesigners.map((op: any) => {
                  const title = op.title ? `${op.title} ` : '';
                  return `${title}${op.name}`;
              }).join('; ');
              return `${names} (per ${profile.contact.name})`;
          }
          if (profile.contact.repName) {
              const repTitle = profile.contact.repTitle ? `${profile.contact.repTitle} ` : '';
              return `${repTitle}${profile.contact.repName} (Leg. Rep. ${profile.contact.name})`;
          }
          return profile.contact.name; 
      }
      const title = profile.contact.title ? `${profile.contact.title} ` : '';
      return `${title}${profile.contact.name}`;
  };

  const potentialAttendees = [
      { id: 'rup', label: 'RUP', fullText: project.subjects.rup.contact.name ? `Responsabile Unico del Progetto: ${getSubjectName(project.subjects.rup)}` : '' },
      { id: 'dl', label: 'DL', fullText: project.subjects.dl.contact.name ? `Direttore dei Lavori: ${getSubjectName(project.subjects.dl)}` : '' },
      { id: 'cse', label: 'CSE', fullText: project.subjects.cse.contact.name ? `Coord. Sicurezza Esecuzione: ${getSubjectName(project.subjects.cse)}` : '' },
      { id: 'contractor', label: 'Impresa', fullText: (() => {
              const c = project.contractor.mainCompany;
              if (!c || !c.name) return '';
              const role = c.role || 'Legale Rappresentante';
              const repTitle = c.repTitle ? `${c.repTitle} ` : 'Sig. ';
              const repName = c.repName || '...';
              return `per l'Impresa ${c.name} (${role}): ${repTitle}${repName}`;
          })()
      },
  ].filter(p => p.fullText !== '');

  const toggleAttendee = (fullText: string) => {
      if (readOnly) return;
      const currentText = currentDoc.attendees || '';
      if (currentText.includes(fullText)) {
          const newText = currentText.replace(fullText, '').replace('\n\n', '\n').trim();
          handleUpdate({...currentDoc, attendees: newText});
      } else {
          const separator = currentText.length > 0 ? '\n' : '';
          handleUpdate({...currentDoc, attendees: currentText + separator + fullText});
      }
  };

  const regenerateAttendees = () => {
      if(readOnly) return;
      if(confirm("Attenzione: Il testo attuale dei presenti verrà sostituito con i dati aggiornati dall'anagrafica. Continuare?")) {
          const lines = potentialAttendees.map(p => p.fullText);
          handleUpdate({ ...currentDoc, attendees: lines.join('\n') });
      }
  };

  const execPhase = project.executionPhase || {};
  const summaryIndex = (currentDoc.visitNumber > 0 ? currentDoc.visitNumber : 1) - 1;
  const currentSummary = execPhase.testerVisitSummaries?.[summaryIndex];

  const initSummaryForCurrentVisit = () => {
      if (readOnly || !onUpdateProject) return;
      const newSummary: TesterVisitSummary = { id: crypto.randomUUID(), startDate: '', endDate: '', works: [], notes: '' };
      const newSummaries = [...(execPhase.testerVisitSummaries || [])];
      newSummaries[summaryIndex] = newSummary;
      updateExec('testerVisitSummaries', newSummaries);
  };

  const updateCurrentSummary = (field: keyof TesterVisitSummary, value: any) => {
      if (readOnly || !onUpdateProject || !currentSummary) return;
      const list = [...(execPhase.testerVisitSummaries || [])];
      list[summaryIndex] = { ...list[summaryIndex], [field]: value };
      updateExec('testerVisitSummaries', list);
  };
  
  const importWorksFromJournal = () => {
      if (readOnly || !onUpdateProject || !currentSummary) return;
      if (!currentSummary.startDate || !currentSummary.endDate) {
          alert("Inserisci prima le date 'Dal' e 'Al' per definire il periodo di ricerca.");
          return;
      }
      const relevantDocs = documents.filter(d => d.date >= currentSummary.startDate && d.date <= currentSummary.endDate);
      const worksFound = relevantDocs.flatMap(d => d.worksExecuted);
      if (worksFound.length === 0) {
          alert("Nessuna lavorazione trovata.");
          return;
      }
      const currentWorks = new Set(currentSummary.works);
      worksFound.forEach(w => currentWorks.add(w));
      updateCurrentSummary('works', Array.from(currentWorks));
  };

  const addManualWorkSummary = () => {
      if (readOnly || !onUpdateProject || !currentSummary) return;
      if (summaryManualInput.trim()) {
          updateCurrentSummary('works', [...currentSummary.works, summaryManualInput]);
          setSummaryManualInput('');
      }
  };

  const updateWorkSummaryItem = (index: number, newValue: string) => {
      if (readOnly || !onUpdateProject || !currentSummary) return;
      const newWorks = [...currentSummary.works];
      newWorks[index] = newValue;
      updateCurrentSummary('works', newWorks);
  };

  const removeWorkSummary = (workIndex: number) => {
      if (readOnly || !onUpdateProject || !currentSummary) return;
      const newWorks = [...currentSummary.works];
      newWorks.splice(workIndex, 1);
      updateCurrentSummary('works', newWorks);
  };

  const deleteCurrentSummary = () => {
      if (readOnly || !onUpdateProject) return;
      if (confirm("Attenzione: questo eliminerà il riepilogo lavori associato a questo verbale. Continuare?")) {
          const list = [...(execPhase.testerVisitSummaries || [])];
          delete list[summaryIndex]; 
          updateExec('testerVisitSummaries', list);
      }
  };

  const NavButton = ({ id, label, icon: Icon }: any) => (
      <button 
        onClick={() => setStep(id)} 
        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all min-w-[100px] ${step === id ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'}`}
      >
        <Icon className="w-5 h-5"/>
        <span className="font-bold text-xs md:text-sm text-center">{label}</span>
      </button>
  );

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in">
       
       <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Verbali e Atti di Collaudo</h2>
            <p className="text-slate-500 text-sm mt-1">Gestione visite, riepiloghi e atti amministrativi preliminari.</p>
          </div>
       </div>

       <div className="flex items-center gap-3 mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <span className="text-sm font-bold text-slate-500 uppercase whitespace-nowrap">Seleziona Verbale / Atti:</span>
            <select 
              className="flex-1 p-2.5 border border-slate-300 rounded-lg font-semibold text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer min-w-[250px]"
              value={currentDocId}
              onChange={(e) => onSelectDocument(e.target.value)}
            >
              {documents.map(d => (
                <option key={d.id} value={d.id}>
                    Verbale N. {d.visitNumber} del {new Date(d.date).toLocaleDateString()}
                </option>
              ))}
            </select>
            {!readOnly && (
              <button onClick={onNewDocument} className="bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors whitespace-nowrap">
                  + Nuovo
              </button>
            )}
       </div>

       <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
          <NavButton id="info" label="Dati Visita" icon={Calendar} />
          <NavButton id="admin-acts" label="Atti e Lettere" icon={FileSignature} />
          <NavButton id="convocation" label="Presenti" icon={Users} />
          <NavButton id="works" label="Lavori" icon={ListChecks} />
          <NavButton id="requests" label="Richieste" icon={MessageSquare} />
          <NavButton id="invitations" label="Inviti" icon={Bell} />
          <NavButton id="common" label="Chiusura" icon={FileCheck2} />
          <NavButton id="eval" label="Valutazioni" icon={ClipboardCheck} />
       </div>

       <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[400px]">
          
          {step === 'info' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4">Dettagli Temporali del Sopralluogo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Data Visita</label>
                          <input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-slate-100"
                            value={currentDoc.date} onChange={e => handleUpdate({...currentDoc, date: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Ora Inizio</label>
                          <input disabled={readOnly} type="time" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-slate-100"
                            value={currentDoc.time} onChange={e => handleUpdate({...currentDoc, time: e.target.value})} />
                      </div>
                      <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-slate-700 mb-2">Numero Progressivo Verbale</label>
                          <div className="flex items-center gap-4">
                            <input disabled={readOnly} type="number" className="w-32 p-3 border border-slate-300 rounded-lg bg-slate-50 font-mono text-center text-lg disabled:text-slate-400"
                                value={currentDoc.visitNumber} onChange={e => handleUpdate({...currentDoc, visitNumber: parseInt(e.target.value)})} />
                            <p className="text-xs text-slate-500 flex-1">Il sistema associa automaticamente il riepilogo lavori N.{currentDoc.visitNumber} a questo verbale.</p>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {step === 'admin-acts' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4 flex items-center gap-2"><FileSignature className="w-5 h-5"/> Atti Amministrativi e Lettere</h3>
                  <p className="text-sm text-slate-500 mb-6">In questa sezione puoi definire i dettagli per le lettere di richiesta autorizzazione, nulla osta e convocazione. Questi dati verranno usati nei rispettivi modelli di esportazione.</p>
                  
                  <div className="space-y-8">
                      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                          <label className="block text-sm font-bold text-slate-700 mb-2">Oggetto della Lettera (Custom)</label>
                          <textarea 
                             disabled={readOnly}
                             className="w-full p-3 border border-slate-300 rounded-lg h-20 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                             placeholder="Inserisci un oggetto specifico se diverso da quello standard del progetto..."
                             value={currentDoc.actSubject || ''}
                             onChange={e => handleUpdate({...currentDoc, actSubject: e.target.value})}
                          />
                      </div>

                      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                          <label className="block text-sm font-bold text-slate-700 mb-2">Destinatario della Lettera (se diverso dall'Ente)</label>
                          <input 
                             disabled={readOnly}
                             type="text"
                             className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                             placeholder="Es: All'attenzione del Dirigente del Settore III..."
                             value={currentDoc.actRecipient || ''}
                             onChange={e => handleUpdate({...currentDoc, actRecipient: e.target.value})}
                          />
                      </div>

                      <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                          <div className="flex items-center justify-between mb-4">
                              <label className="block text-sm font-bold text-blue-900 flex items-center gap-2"><FileText className="w-4 h-4"/> Integrazioni Testo Atti (Opzionale)</label>
                          </div>
                          <textarea 
                             disabled={readOnly}
                             className="w-full p-4 border border-blue-200 rounded-lg h-40 text-sm leading-relaxed focus:ring-2 focus:ring-blue-500/20 outline-none"
                             placeholder="Inserisci qui eventuali parti variabili specifiche per le lettere (richieste documenti extra, note particolari per la convocazione ecc.). Questo testo verrà integrato nel modello base."
                             value={currentDoc.actBodyOverride || ''}
                             onChange={e => handleUpdate({...currentDoc, actBodyOverride: e.target.value})}
                          />
                      </div>
                  </div>
              </div>
          )}

          {step === 'convocation' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4">Partecipanti e Convocazione</h3>
                  
                  <div className="mb-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
                      <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2"><Mail className="w-5 h-5"/> Estremi Convocazione</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className="block text-xs font-bold text-blue-700 uppercase mb-1">Mezzo di Invio</label>
                              <select disabled={readOnly} className="w-full p-3 border border-blue-200 rounded-lg bg-white"
                                  value={currentDoc.convocationMethod || 'PEC'} 
                                  onChange={e => handleUpdate({...currentDoc, convocationMethod: e.target.value})}
                              >
                                  <option value="PEC">PEC</option>
                                  <option value="email">Email</option>
                                  <option value="raccomandata a mano">Raccomandata a mano</option>
                                  <option value="nota protocollata">Nota protocollata</option>
                                  <option value="comunicazione breve">Comunicazione vie brevi</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-blue-700 uppercase mb-1">Data Invio</label>
                              <input disabled={readOnly} type="date" className="w-full p-3 border border-blue-200 rounded-lg bg-white"
                                  value={currentDoc.convocationDate || ''} 
                                  onChange={e => handleUpdate({...currentDoc, convocationDate: e.target.value})}
                              />
                          </div>
                      </div>
                  </div>

                  <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-bold text-slate-700 flex items-center gap-2"><Users className="w-4 h-4"/> Elenco Soggetti Presenti</label>
                        {!readOnly && (
                            <button onClick={regenerateAttendees} className="text-xs flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded text-slate-600 font-bold transition-colors">
                                <RefreshCw className="w-3 h-3"/> Rigenera da Anagrafica
                            </button>
                        )}
                      </div>
                      
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                          <p className="text-xs font-bold text-slate-500 uppercase mb-2">Inserimento Rapido:</p>
                          <div className="flex flex-wrap gap-2">
                              {potentialAttendees.map(p => {
                                  const isSelected = (currentDoc.attendees || '').includes(p.fullText);
                                  return (
                                    <button 
                                      key={p.id}
                                      onClick={() => toggleAttendee(p.fullText)}
                                      disabled={readOnly}
                                      className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-1 transition-all ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'}`}
                                    >
                                        {isSelected ? <CheckSquare className="w-3 h-3"/> : <span className="w-3 h-3 block border rounded-sm border-slate-300"></span>}
                                        {p.label}
                                    </button>
                                  );
                              })}
                          </div>
                      </div>

                      <textarea disabled={readOnly} className="w-full p-4 border border-slate-300 rounded-xl h-40 text-sm leading-relaxed focus:ring-2 focus:ring-blue-500/20 outline-none resize-none disabled:bg-slate-100"
                            value={currentDoc.attendees} onChange={e => handleUpdate({...currentDoc, attendees: e.target.value})} 
                            placeholder="Elenco nominativo dei presenti..."/>
                  </div>
              </div>
          )}

          {step === 'works' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-12">
                  <section>
                      <div className="mb-8">
                         <div className="flex items-center justify-between mb-2">
                             <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <TextQuote className="w-4 h-4 text-slate-500"/> Frase Introduttiva (Editabile)
                             </h3>
                             {!readOnly && (
                                <button onClick={generateIntroText} className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded">
                                    <Wand2 className="w-3 h-3"/> Rigenera Testo
                                </button>
                             )}
                         </div>
                         <textarea disabled={readOnly} className="w-full p-4 border border-slate-300 rounded-xl h-24 text-sm leading-relaxed focus:ring-2 focus:ring-blue-500/20 outline-none resize-none disabled:bg-slate-100 bg-slate-50"
                            value={currentDoc.worksIntroText || ''} onChange={e => handleUpdate({...currentDoc, worksIntroText: e.target.value})} placeholder="Frase introduttiva..."/>
                      </div>

                      <div className="flex items-center justify-between border-b pb-2 mb-4">
                          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span> Riepilogo Lavori Periodo
                          </h3>
                          {currentSummary && !readOnly && (
                             <button onClick={deleteCurrentSummary} className="text-slate-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4"/></button>
                          )}
                      </div>
                      
                      {!currentSummary ? (
                          <div className="text-center py-8 bg-blue-50 rounded-xl border border-dashed border-blue-200">
                              <p className="text-blue-800 font-medium mb-3">Nessun riepilogo inizializzato.</p>
                              {!readOnly && (
                                  <button onClick={initSummaryForCurrentVisit} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold shadow-sm transition-transform hover:scale-105 inline-flex items-center gap-2"><Plus className="w-4 h-4"/> Inizializza</button>
                              )}
                          </div>
                      ) : (
                          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                              <div className="flex flex-wrap gap-4 items-center mb-6 border-b border-blue-200 pb-4">
                                  <div className="flex items-center gap-2 text-blue-800 font-bold text-sm bg-white px-3 py-1.5 rounded border border-blue-200"><CalendarRange className="w-4 h-4"/> Periodo</div>
                                  <input disabled={readOnly} type="date" className="p-1.5 border border-slate-300 rounded bg-white text-xs" value={currentSummary.startDate} onChange={e => updateCurrentSummary('startDate', e.target.value)} />
                                  <input disabled={readOnly} type="date" className="p-1.5 border border-slate-300 rounded bg-white text-xs" value={currentSummary.endDate} onChange={e => updateCurrentSummary('endDate', e.target.value)} />
                                  <div className="flex-1 text-right">
                                      {!readOnly && <button onClick={importWorksFromJournal} className="inline-flex items-center gap-1 text-xs bg-white text-blue-700 px-3 py-1.5 rounded hover:bg-blue-100 font-medium border border-blue-200"><ArrowDownToLine className="w-3 h-3"/> Importa</button>}
                                  </div>
                              </div>
                              <div className="flex gap-2 mb-3">
                                   <input disabled={readOnly} type="text" className="flex-1 p-2 border border-blue-200 rounded text-sm bg-white" placeholder="Es. Completamento massetto..." value={summaryManualInput} onChange={(e) => setSummaryManualInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addManualWorkSummary()}/>
                                   {!readOnly && <button onClick={addManualWorkSummary} className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700"><Plus className="w-5 h-5" /></button>}
                               </div>
                               <ul className="space-y-1 bg-white p-3 rounded border border-blue-100 min-h-[100px]">
                                   {currentSummary.works.map((work, wIdx) => (
                                       <li key={wIdx} className="flex justify-between items-center text-sm p-1.5 hover:bg-slate-50 rounded group gap-2">
                                           <span className="text-slate-500 font-mono text-xs w-6">{wIdx + 1}.</span>
                                           <input disabled={readOnly} type="text" className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm text-slate-700" value={work} onChange={(e) => updateWorkSummaryItem(wIdx, e.target.value)}/>
                                           {!readOnly && <button onClick={() => removeWorkSummary(wIdx)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>}
                                       </li>
                                   ))}
                               </ul>
                          </div>
                      )}
                  </section>

                  <section>
                      <div className="flex items-center justify-between border-b pb-2 mb-4">
                          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span> Opere in Corso</h3>
                      </div>
                      <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                          <div className="flex gap-2 mb-3">
                               <input disabled={readOnly} type="text" className="flex-1 p-2 border border-amber-200 rounded text-sm bg-white" placeholder="Es. Posa pavimentazione..." value={inProgressInput} onChange={(e) => setInProgressInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addToListInDoc('worksInProgress', inProgressInput, setInProgressInput)}/>
                               {!readOnly && <button onClick={() => addToListInDoc('worksInProgress', inProgressInput, setInProgressInput)} className="bg-amber-500 text-white px-3 rounded hover:bg-amber-600"><Plus className="w-5 h-5" /></button>}
                           </div>
                           <ul className="space-y-1 bg-white p-3 rounded border border-amber-100 min-h-[100px]">
                               {(currentDoc.worksInProgress || '').split('\n').filter(i => i.trim()).map((work, idx) => (
                                   <li key={idx} className="flex justify-between items-center text-sm p-1.5 hover:bg-slate-50 rounded group gap-2">
                                       <Activity className="w-4 h-4 text-amber-500 mt-0.5 shrink-0"/>
                                       <input disabled={readOnly} type="text" className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm text-slate-700" value={work} onChange={(e) => updateListInDoc('worksInProgress', idx, e.target.value)}/>
                                       {!readOnly && <button onClick={() => removeFromListInDoc('worksInProgress', idx)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>}
                                   </li>
                               ))}
                           </ul>
                      </div>
                  </section>
              </div>
          )}

          {step === 'requests' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5"/> Richieste del Collaudatore</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <select ref={requestsSelectRef} disabled={readOnly} className="w-full p-2 border border-blue-300 rounded text-sm bg-white" onChange={(e) => { const val = e.target.value; if (!val) return; setActiveCustomField('testerRequests'); setCustomText(val === 'OTHER' ? '' : val); e.target.value = ''; }}>
                          <option value="">Seleziona una richiesta standard...</option>
                          {REQUEST_OPTIONS.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                          <option value="OTHER">Altro...</option>
                      </select>
                      {activeCustomField === 'testerRequests' && (
                          <div className="mt-3 flex flex-col gap-2 animate-in fade-in">
                              <textarea className="w-full p-2 border border-blue-300 rounded text-sm" placeholder="Scrivi la richiesta..." rows={3} value={customText} onChange={e => setCustomText(e.target.value)} autoFocus />
                              <div className="flex justify-end gap-2">
                                <button onClick={handleCustomCancel} className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded text-xs font-bold">Annulla</button>
                                <button onClick={handleCustomConfirm} className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1">Aggiungi</button>
                              </div>
                          </div>
                      )}
                  </div>
                  <textarea disabled={readOnly} className="w-full p-5 border border-slate-300 rounded-xl h-64 text-sm leading-relaxed font-serif focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-slate-100" value={currentDoc.testerRequests || ''} onChange={e => handleUpdate({...currentDoc, testerRequests: e.target.value})} placeholder="Elenco delle richieste..."/>
              </div>
          )}

          {step === 'invitations' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4 flex items-center gap-2"><Bell className="w-5 h-5"/> Inviti del Collaudatore</h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <select ref={invitationsSelectRef} disabled={readOnly} className="w-full p-2 border border-amber-300 rounded text-sm bg-white" onChange={(e) => { const val = e.target.value; if (!val) return; setActiveCustomField('testerInvitations'); setCustomText(val === 'OTHER' ? '' : val); e.target.value = ''; }}>
                          <option value="">Seleziona un invito standard...</option>
                          {INVITATION_OPTIONS.map((opt, i) => <option key={i} value={opt}>{opt.substring(0, 100)}...</option>)}
                          <option value="OTHER">Altro...</option>
                      </select>
                      {activeCustomField === 'testerInvitations' && (
                          <div className="mt-3 flex flex-col gap-2 animate-in fade-in">
                              <textarea className="w-full p-2 border border-amber-300 rounded text-sm" placeholder="Scrivi l'invito..." rows={3} value={customText} onChange={e => setCustomText(e.target.value)} autoFocus />
                              <div className="flex justify-end gap-2">
                                <button onClick={handleCustomCancel} className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded text-xs font-bold">Annulla</button>
                                <button onClick={handleCustomConfirm} className="bg-amber-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1">Aggiungi</button>
                              </div>
                          </div>
                      )}
                  </div>
                  <textarea disabled={readOnly} className="w-full p-5 border border-slate-300 rounded-xl h-64 text-sm leading-relaxed font-serif focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-slate-100" value={currentDoc.testerInvitations || ''} onChange={e => handleUpdate({...currentDoc, testerInvitations: e.target.value})} placeholder="Elenco degli inviti..."/>
              </div>
          )}

          {step === 'common' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4 flex items-center gap-2"><FileCheck2 className="w-5 h-5"/> Chiusura Verbale</h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                      <select ref={commonSelectRef} disabled={readOnly} className="w-full p-2 border border-slate-300 rounded text-sm bg-white" onChange={(e) => { const val = e.target.value; if (!val) return; setActiveCustomField('commonParts'); setCustomText(val === 'OTHER' ? '' : val); e.target.value = ''; }}>
                          <option value="">Seleziona una frase standard...</option>
                          {COMMON_PART_OPTIONS.map((opt, i) => <option key={i} value={opt}>{opt.substring(0, 100)}...</option>)}
                          <option value="OTHER">Altro...</option>
                      </select>
                      {activeCustomField === 'commonParts' && (
                          <div className="mt-3 flex flex-col gap-2 animate-in fade-in">
                              <textarea className="w-full p-2 border border-slate-300 rounded text-sm" placeholder="Scrivi la frase..." rows={3} value={customText} onChange={e => setCustomText(e.target.value)} autoFocus />
                              <div className="flex justify-end gap-2">
                                <button onClick={handleCustomCancel} className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded text-xs font-bold">Annulla</button>
                                <button onClick={handleCustomConfirm} className="bg-slate-800 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1">Aggiungi</button>
                              </div>
                          </div>
                      )}
                  </div>
                  <textarea disabled={readOnly} className="w-full p-5 border border-slate-300 rounded-xl h-64 text-sm leading-relaxed font-serif focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-slate-100" value={currentDoc.commonParts || ''} onChange={e => handleUpdate({...currentDoc, commonParts: e.target.value})} placeholder="Frasi di chiusura..."/>
              </div>
          )}

          {step === 'eval' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4">Valutazioni Tecnico-Amministrative</h3>
                  <textarea disabled={readOnly} className="w-full p-5 border border-slate-300 rounded-xl h-64 text-sm leading-relaxed font-serif focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-slate-100" value={currentDoc.observations} onChange={e => handleUpdate({...currentDoc, observations: e.target.value})} placeholder="Valutazioni del collaudatore..."/>
              </div>
          )}
       </div>

       <div className="flex justify-between mt-6">
           <button onClick={() => {
                if(step === 'eval') setStep('common');
                else if(step === 'common') setStep('invitations');
                else if(step === 'invitations') setStep('requests');
                else if(step === 'requests') setStep('works');
                else if(step === 'works') setStep('convocation');
                else if(step === 'convocation') setStep('admin-acts');
                else if(step === 'admin-acts') setStep('info');
             }} disabled={step === 'info'} className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 font-medium flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Indietro</button>
           <button onClick={() => {
                if(step === 'info') setStep('admin-acts');
                else if(step === 'admin-acts') setStep('convocation');
                else if(step === 'convocation') setStep('works');
                else if(step === 'works') setStep('requests');
                else if(step === 'requests') setStep('invitations');
                else if(step === 'invitations') setStep('common');
                else if(step === 'common') setStep('eval');
             }} disabled={step === 'eval'} className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 font-medium shadow-lg flex items-center gap-2">Avanti <ArrowRight className="w-4 h-4"/></button>
       </div>
    </div>
  );
};
