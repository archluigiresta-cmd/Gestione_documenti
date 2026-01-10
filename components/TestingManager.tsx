
import React, { useState, useRef, useEffect } from 'react';
import { DocumentVariables, ProjectConstants, TesterVisitSummary, LetterRecipientConfig } from '../types';
import { Calendar, Clock, Mail, ClipboardCheck, Users, CheckSquare, Plus, Trash2, ListChecks, ArrowRight, ArrowLeft, Activity, RefreshCw, MessageSquare, Bell, FileCheck2, X, UserPlus, ChevronUp, ChevronDown, AtSign } from 'lucide-react';

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

const LETTER_PARAGRAPH_OPTIONS = [
    "Durante le operazioni di collaudo, la Ditta dovrà assicurare la disponibilità di personale ed attrezzature per le verifiche, i saggi e le prove necessarie.",
    "La Ditta dovrà inoltre assicurare copia del progetto completo in formato cartaceo al fine di agevolare le opportune valutazioni sul posto.",
    "Durante il suddetto incontro lo scrivente estrarrà copia, altresì, di quanto eventualmente necessario alla presa d’atto delle attività già svolte.",
    "Si invitano le parti ad astenersi dal porre in essere qualsivoglia opera di carattere strutturale in mancanza della verifica e del preventivo assenso da parte dello scrivente collaudatore.",
    "Si rammenta, altresì, l’obbligo per la D.L. di presenziare alle operazioni suddette."
];

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
  const [step, setStep] = useState<'info' | 'convocation' | 'present' | 'works' | 'requests' | 'invitations' | 'common' | 'eval'>('info');

  const [summaryManualInput, setSummaryManualInput] = useState('');
  const [activeCustomField, setActiveCustomField] = useState<'testerRequests' | 'testerInvitations' | 'commonParts' | 'letterBody' | null>(null);
  const [customText, setCustomText] = useState('');
  
  const requestsSelectRef = useRef<HTMLSelectElement>(null);
  const invitationsSelectRef = useRef<HTMLSelectElement>(null);
  const commonSelectRef = useRef<HTMLSelectElement>(null);
  const letterSelectRef = useRef<HTMLSelectElement>(null);

  const handleUpdate = (updatedDoc: DocumentVariables) => {
      if (!readOnly) onUpdateDocument(updatedDoc);
  };

  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return '...';
    try { return new Date(dateStr).toLocaleDateString('it-IT'); } catch { return dateStr; }
  };

  const generateLetterIntro = () => {
    if(readOnly) return;
    const visitNumStr = currentDoc.visitNumber === 1 ? 'I' : currentDoc.visitNumber === 2 ? 'II' : currentDoc.visitNumber === 3 ? 'III' : `${currentDoc.visitNumber}°`;
    const introText = `Sentite le parti, si comunica che la ${visitNumStr} visita di collaudo dei lavori di cui in oggetto è fissata per il giorno ${formatShortDate(currentDoc.date)}, ore ${currentDoc.time || '12.00'}, con incontro presso il luogo dei lavori.`;
    handleUpdate({...currentDoc, letterIntro: introText});
  };

  const generateIntroText = () => {
        if(readOnly) return;
        const prevDocs = documents
            .filter(d => d.visitNumber < currentDoc.visitNumber) 
            .sort((a, b) => a.visitNumber - b.visitNumber);
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
    if (!currentDoc.worksIntroText) generateIntroText();
    if (!currentDoc.letterIntro) generateLetterIntro();
    if (!currentDoc.letterBodyParagraphs || currentDoc.letterBodyParagraphs.length === 0) {
        handleUpdate({ ...currentDoc, letterBodyParagraphs: [...LETTER_PARAGRAPH_OPTIONS] });
    }
    if (!currentDoc.letterRecipients) {
        handleUpdate({ ...currentDoc, letterRecipients: [{ id: 'rup', isPc: false }, { id: 'dl', isPc: false }, { id: 'contractor', isPc: false }] });
    }
  }, [currentDoc?.id]);

  const handleCustomConfirm = () => {
      if (activeCustomField && customText.trim()) {
          if (activeCustomField === 'letterBody') {
              handleUpdate({ ...currentDoc, letterBodyParagraphs: [...(currentDoc.letterBodyParagraphs || []), customText.trim()] });
          } else {
              const current = currentDoc[activeCustomField] || '';
              const separator = current.trim() ? '\n- ' : '- ';
              handleUpdate({ ...currentDoc, [activeCustomField]: current + separator + customText.trim() });
          }
          setCustomText('');
          setActiveCustomField(null);
      }
  };

  const handleCustomCancel = () => {
      setCustomText('');
      setActiveCustomField(null);
  };

  const updateExec = (field: string, value: any) => {
    if (readOnly || !onUpdateProject) return;
    onUpdateProject({ ...project, executionPhase: { ...project.executionPhase, [field]: value } });
  };

  const execPhase = project.executionPhase || {};
  const summaryIndex = (currentDoc.visitNumber > 0 ? currentDoc.visitNumber : 1) - 1;
  const currentSummary = execPhase.testerVisitSummaries?.[summaryIndex];

  const initSummaryForCurrentVisit = () => {
      if (readOnly || !onUpdateProject) return;
      const newSummary = { id: crypto.randomUUID(), startDate: '', endDate: '', works: [], notes: '' };
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

  const addManualWorkSummary = () => {
      if (readOnly || !summaryManualInput.trim() || !currentSummary) return;
      updateCurrentSummary('works', [...currentSummary.works, summaryManualInput.trim()]);
      setSummaryManualInput('');
  };

  const getRecipientLabel = (id: string) => {
      if (id === 'rup') return 'RUP';
      if (id === 'dl') return 'D.L.';
      if (id === 'contractor') return 'Impresa';
      if (id.startsWith('other-')) {
          const idx = parseInt(id.split('-')[1]);
          return project.subjects.others?.[idx]?.contact.role || `Altro ${idx+1}`;
      }
      return id;
  };

  const toggleLetterRecipient = (id: string) => {
      if (readOnly) return;
      const current = currentDoc.letterRecipients || [];
      const exists = current.find(r => r.id === id);
      if (exists) {
          handleUpdate({ ...currentDoc, letterRecipients: current.filter(r => r.id !== id) });
      } else {
          handleUpdate({ ...currentDoc, letterRecipients: [...current, { id, isPc: false }] });
      }
  };

  const toggleRecipientPc = (id: string) => {
      if (readOnly) return;
      const current = currentDoc.letterRecipients || [];
      handleUpdate({ ...currentDoc, letterRecipients: current.map(r => r.id === id ? { ...r, isPc: !r.isPc } : r) });
  };

  const moveRecipient = (idx: number, direction: 'up' | 'down') => {
      if (readOnly) return;
      const current = [...(currentDoc.letterRecipients || [])];
      const target = direction === 'up' ? idx - 1 : idx + 1;
      if (target >= 0 && target < current.length) {
          [current[idx], current[target]] = [current[target], current[idx]];
          handleUpdate({ ...currentDoc, letterRecipients: current });
      }
  };

  const NavButton = ({ id, label, icon: Icon }: any) => (
      <button onClick={() => setStep(id)} 
        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all min-w-[90px] ${step === id ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'}`}
      >
        <Icon className="w-5 h-5"/>
        <span className="font-bold text-[10px] md:text-xs text-center">{label}</span>
      </button>
  );

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in">
       
       <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Verbali e Convocazioni</h2>
            <p className="text-slate-500 text-sm mt-1">Gestione completa visite di collaudo.</p>
          </div>
       </div>

       <div className="flex items-center gap-3 mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-sm font-bold text-slate-500 uppercase">Seleziona Verbale:</span>
            <select 
              className="flex-1 p-2.5 border border-slate-300 rounded-lg font-semibold text-sm bg-slate-50 outline-none"
              value={currentDocId}
              onChange={(e) => onSelectDocument(e.target.value)}
            >
              {documents.map(d => (
                <option key={d.id} value={d.id}>Verbale n. {d.visitNumber} del {new Date(d.date).toLocaleDateString()}</option>
              ))}
            </select>
            {!readOnly && <button onClick={onNewDocument} className="bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors">+ Nuovo</button>}
       </div>

       <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
          <NavButton id="info" label="Dati Visita" icon={Calendar} />
          <NavButton id="convocation" label="Lettera" icon={Mail} />
          <NavButton id="present" label="Presenti" icon={Users} />
          <NavButton id="works" label="Lavori" icon={ListChecks} />
          <NavButton id="requests" label="Richieste" icon={MessageSquare} />
          <NavButton id="invitations" label="Inviti" icon={Bell} />
          <NavButton id="common" label="Chiusura" icon={FileCheck2} />
          <NavButton id="eval" label="Valutazioni" icon={ClipboardCheck} />
       </div>

       <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[450px]">
          
          {step === 'info' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4">Dettagli Sopralluogo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div><label className="block text-sm font-bold text-slate-700 mb-2">Data Visita</label>
                          <input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg" value={currentDoc.date} onChange={e => handleUpdate({...currentDoc, date: e.target.value})} />
                      </div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-2">Ora Inizio</label>
                          <input disabled={readOnly} type="time" className="w-full p-3 border border-slate-300 rounded-lg" value={currentDoc.time} onChange={e => handleUpdate({...currentDoc, time: e.target.value})} />
                      </div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-2">Ora Fine (Verbale)</label>
                          <input disabled={readOnly} type="time" className="w-full p-3 border border-slate-300 rounded-lg" value={currentDoc.endTime || ''} onChange={e => handleUpdate({...currentDoc, endTime: e.target.value})} />
                      </div>
                  </div>
              </div>
          )}

          {step === 'convocation' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
                  <h3 className="text-lg font-bold text-slate-800 border-b pb-4 flex items-center gap-2"><Mail className="w-5 h-5 text-blue-600"/> Contenuti Lettera di Convocazione</h3>
                  
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                      <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-blue-500"/> Gestione Destinatari Lettera
                      </h4>
                      
                      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-4">
                          {['rup', 'dl', 'contractor', ...(project.subjects.others || []).map((_, i) => `other-${i}`)].map(id => {
                              const isSel = (currentDoc.letterRecipients || []).some(r => r.id === id);
                              return (
                                  <button key={id} onClick={() => toggleLetterRecipient(id)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${isSel ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-300 hover:border-blue-400'}`}>
                                      {getRecipientLabel(id)}
                                  </button>
                              );
                          })}
                      </div>

                      <div className="space-y-2">
                          {(currentDoc.letterRecipients || []).map((rec, idx) => (
                              <div key={rec.id} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm group">
                                  <div className="flex flex-col">
                                      <button disabled={idx === 0} onClick={() => moveRecipient(idx, 'up')} className="p-0.5 text-slate-400 hover:text-blue-600 disabled:opacity-0"><ChevronUp className="w-4 h-4"/></button>
                                      <button disabled={idx === (currentDoc.letterRecipients?.length || 0) - 1} onClick={() => moveRecipient(idx, 'down')} className="p-0.5 text-slate-400 hover:text-blue-600 disabled:opacity-0"><ChevronDown className="w-4 h-4"/></button>
                                  </div>
                                  <div className="flex-1">
                                      <p className="font-bold text-slate-800 text-sm">{getRecipientLabel(rec.id)}</p>
                                  </div>
                                  <div className="flex items-center gap-4">
                                      <label className="flex items-center gap-2 cursor-pointer">
                                          <input type="checkbox" checked={rec.isPc} onChange={() => toggleRecipientPc(rec.id)} className="w-4 h-4 rounded text-amber-500" />
                                          <span className="text-xs font-bold text-slate-500 uppercase">p.c.</span>
                                      </label>
                                      <button onClick={() => toggleLetterRecipient(rec.id)} className="text-slate-300 hover:text-red-500"><X className="w-4 h-4"/></button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-bold text-slate-700">Testo Iniziale</label>
                        {!readOnly && <button onClick={generateLetterIntro} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded hover:bg-slate-200">Rigenera</button>}
                      </div>
                      <textarea disabled={readOnly} className="w-full p-3 border border-slate-300 rounded-lg h-24 text-sm bg-slate-50" value={currentDoc.letterIntro || ''} onChange={e => handleUpdate({...currentDoc, letterIntro: e.target.value})} />
                  </div>

                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">Corpo della Lettera</label>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <select disabled={readOnly} className="w-full p-2 border border-blue-300 rounded text-sm bg-white"
                          onChange={(e) => {
                              if (!e.target.value) return;
                              if (e.target.value === 'OTHER') { setActiveCustomField('letterBody'); setCustomText(''); }
                              else { handleUpdate({ ...currentDoc, letterBodyParagraphs: [...(currentDoc.letterBodyParagraphs || []), e.target.value] }); }
                              e.target.value = '';
                          }}
                        >
                            <option value="">Aggiungi blocco standard...</option>
                            {LETTER_PARAGRAPH_OPTIONS.map((opt, i) => <option key={i} value={opt}>{opt.substring(0, 80)}...</option>)}
                            <option value="OTHER">Altro personalizzato...</option>
                        </select>
                        {activeCustomField === 'letterBody' && (
                            <div className="mt-3 flex flex-col gap-2">
                                <textarea className="w-full p-2 border border-blue-300 rounded text-sm" placeholder="Scrivi il testo..." rows={3} value={customText} onChange={e => setCustomText(e.target.value)} autoFocus />
                                <div className="flex justify-end gap-2"><button onClick={handleCustomCancel} className="text-xs font-bold text-slate-500">Annulla</button><button onClick={handleCustomConfirm} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">Aggiungi</button></div>
                            </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        {(currentDoc.letterBodyParagraphs || []).map((p, idx) => (
                           <div key={idx} className="flex gap-3 bg-white p-3 rounded border border-slate-200 group">
                              <span className="text-blue-500 mt-0.5">•</span>
                              <p className="flex-1 text-xs text-slate-700 leading-relaxed">{p}</p>
                              {!readOnly && <button onClick={() => {
                                  const newList = [...currentDoc.letterBodyParagraphs]; newList.splice(idx, 1); handleUpdate({...currentDoc, letterBodyParagraphs: newList});
                              }} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>}
                           </div>
                        ))}
                      </div>
                  </div>
              </div>
          )}

          {step === 'present' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center justify-between mb-6 border-b pb-4">
                    <h3 className="text-lg font-bold text-slate-800">Soggetti Presenti al Sopralluogo</h3>
                    {!readOnly && <button onClick={() => {
                        if(confirm("Il testo attuale verrà sostituito con i dati aggiornati dall'anagrafica. Continuare?")) {
                            const lines = [
                                project.subjects.rup.contact.name ? `RUP: ${project.subjects.rup.contact.name}` : '',
                                project.subjects.dl.contact.name ? `D.L.: ${project.subjects.dl.contact.name}` : '',
                                project.contractor.mainCompany.name ? `Impresa: ${project.contractor.mainCompany.name}` : ''
                            ].filter(l => l !== '');
                            handleUpdate({ ...currentDoc, attendees: lines.join('\n') });
                        }
                    }} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded text-slate-600 font-bold transition-colors"><RefreshCw className="w-3 h-3 inline mr-1"/> Rigenera da Anagrafica</button>}
                  </div>
                  <textarea disabled={readOnly} className="w-full p-4 border border-slate-300 rounded-xl h-48 text-sm leading-relaxed" value={currentDoc.attendees} onChange={e => handleUpdate({...currentDoc, attendees: e.target.value})} placeholder="Elenco nominativo dei presenti..."/>
              </div>
          )}

          {step === 'works' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-12">
                  <section>
                      <div className="mb-8">
                         <div className="flex items-center justify-between mb-2">
                             <h3 className="text-sm font-bold text-slate-700">Frase Introduttiva Verbale</h3>
                             {!readOnly && <button onClick={generateIntroText} className="text-xs text-blue-600 hover:underline">Rigenera Testo</button>}
                         </div>
                         <textarea disabled={readOnly} className="w-full p-4 border border-slate-300 rounded-xl h-24 text-sm bg-slate-50" value={currentDoc.worksIntroText || ''} onChange={e => handleUpdate({...currentDoc, worksIntroText: e.target.value})} />
                      </div>
                      <div className="flex items-center justify-between border-b pb-2 mb-4"><h3 className="text-lg font-bold text-slate-800">1. Riepilogo Lavori Periodo</h3></div>
                      {!currentSummary ? (
                          <div className="text-center py-8 bg-blue-50 rounded-xl border border-dashed border-blue-200">
                              <p className="text-blue-800 font-medium mb-3">Nessun riepilogo per il periodo.</p>
                              {!readOnly && <button onClick={initSummaryForCurrentVisit} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold">Inizializza Riepilogo</button>}
                          </div>
                      ) : (
                          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                               <div className="flex gap-2 mb-3">
                                   <input disabled={readOnly} type="text" className="flex-1 p-2 border border-blue-200 rounded text-sm" placeholder="Aggiungi lavorazione..." value={summaryManualInput} onChange={(e) => setSummaryManualInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addManualWorkSummary()} />
                                   {!readOnly && <button onClick={addManualWorkSummary} className="bg-blue-600 text-white px-3 rounded"><Plus className="w-5 h-5" /></button>}
                               </div>
                               <ul className="space-y-1 bg-white p-3 rounded border border-blue-100 min-h-[100px]">
                                   {currentSummary.works.map((work, wIdx) => (
                                       <li key={wIdx} className="flex justify-between items-center text-sm p-1.5 hover:bg-slate-50 rounded group gap-2">
                                           <span className="text-slate-500 font-mono text-xs">{wIdx + 1}.</span>
                                           <p className="flex-1 text-sm">{work}</p>
                                           {!readOnly && <button onClick={() => {
                                               const newList = [...currentSummary.works]; newList.splice(wIdx, 1); updateCurrentSummary('works', newList);
                                           }} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>}
                                       </li>
                                   ))}
                               </ul>
                          </div>
                      )}
                  </section>
                  <section>
                      <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">2. Opere in Corso</h3>
                      <textarea disabled={readOnly} className="w-full p-4 border border-slate-300 rounded-xl h-32 text-sm" value={currentDoc.worksInProgress || ''} onChange={e => handleUpdate({...currentDoc, worksInProgress: e.target.value})} placeholder="Elenca le opere in corso..."/>
                  </section>
                  <section>
                      <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">3. Prossime Attività</h3>
                      <textarea disabled={readOnly} className="w-full p-4 border border-slate-300 rounded-xl h-32 text-sm" value={currentDoc.upcomingWorks || ''} onChange={e => handleUpdate({...currentDoc, upcomingWorks: e.target.value})} placeholder="Attività previste..."/>
                  </section>
              </div>
          )}
       </div>

       <div className="flex justify-between mt-6">
           <button onClick={() => {
                if(step === 'eval') setStep('common'); else if(step === 'common') setStep('invitations'); else if(step === 'invitations') setStep('requests'); else if(step === 'requests') setStep('works'); else if(step === 'works') setStep('present'); else if(step === 'present') setStep('convocation'); else if(step === 'convocation') setStep('info');
             }} disabled={step === 'info'} className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 font-medium flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Indietro</button>
           <button onClick={() => {
                if(step === 'info') setStep('convocation'); else if(step === 'convocation') setStep('present'); else if(step === 'present') setStep('works'); else if(step === 'works') setStep('requests'); else if(step === 'requests') setStep('invitations'); else if(step === 'invitations') setStep('common'); else if(step === 'common') setStep('eval');
             }} disabled={step === 'eval'} className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 font-medium shadow-lg flex items-center gap-2">Avanti <ArrowRight className="w-4 h-4"/></button>
       </div>
    </div>
  );
};
