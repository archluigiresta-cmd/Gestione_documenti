
import React, { useState } from 'react';
import { DocumentVariables, ProjectConstants } from '../types';
import { Calendar, Clock, Mail, ClipboardCheck, Users, Plus, Trash2, ListChecks, ArrowRight, ArrowLeft, MessageSquare, Bell, FileCheck2, Info, Wand2, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

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
    "si chiede alla D.L. se rispetto al progetto appaltato vi siano previsioni di varianti e, in caso di riscontro positivo, se le stesse siano state gestite formalmente.",
    "si chiede se vi siano ritardi rispetto al cronoprogramma e, in caso di riscontro positivo, quali azioni correttive si stiano intraprendendo.",
    "si richiede la trasmissione dei certificati di prova sui materiali (calcestruzzo e acciaio) relativi agli ultimi getti effettuati.",
    "si richiede copia del registro di contabilità aggiornato alla data odierna."
];

const INVITATION_OPTIONS = [
    "Si invita l'Impresa ad osservare scrupolosamente tutte le disposizioni riportate nel PSC e nel POS.",
    "Si invita la D.L. a vigilare affinché non vengano poste in essere opere strutturali in mancanza del preventivo assenso del collaudatore.",
    "Si invita l'Impresa ad effettuare i dovuti controlli di accettazione in cantiere dei materiali da costruzione (Certificati di tracciabilità).",
    "Si invita l'Impresa a fornire le informazioni sull'impianto di betonaggio (distanza, sistema qualità, relazioni di omogeneità).",
    "Si prescrive di attenersi, durante le fasi di getto, ai prelievi di calcestruzzo secondo il paragrafo 11.2.5.1 del DM 17/01/2018."
];

const COMMON_PART_OPTIONS = [
    "Di quanto ispezionato si è effettuato il rilievo fotografico allegato al presente verbale per farne parte integrante.",
    "Per le parti non più ispezionabili, la D.L. e l’Impresa hanno consegnato documentazione fotografica e assicurato la perfetta esecuzione secondo le prescrizioni contrattuali.",
    "L’Impresa, per gli effetti dell’art. 1667 del Codice Civile, dichiara non esservi difformità o vizi nelle opere fin qui eseguite.",
    "Le parti si aggiornano alla prossima visita di collaudo in data da concordarsi."
];

export const TestingManager: React.FC<TestingManagerProps> = ({
  project,
  documents,
  currentDocId,
  onSelectDocument,
  onUpdateDocument,
  onNewDocument,
  onDeleteDocument,
  readOnly = false
}) => {
  const currentDoc = documents.find(d => d.id === currentDocId) || documents[0];
  const [step, setStep] = useState<'info' | 'convocation' | 'present' | 'works' | 'requests' | 'invitations' | 'common' | 'eval'>('info');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleUpdate = (updatedDoc: DocumentVariables) => {
      if (!readOnly) onUpdateDocument(updatedDoc);
  };

  const polishText = async (field: keyof DocumentVariables) => {
    if (readOnly || !currentDoc) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `Riscrivi il seguente testo tecnico per un verbale di collaudo in modo formale e professionale: "${currentDoc[field]}"`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      if (response.text) {
          handleUpdate({ ...currentDoc, [field]: response.text.trim() });
      }
    } catch (e) {
      console.error(e);
      alert("Errore IA");
    } finally {
      setIsGenerating(false);
    }
  };

  const addTextToField = (field: 'testerRequests' | 'testerInvitations' | 'commonParts', text: string) => {
      const current = currentDoc[field] || '';
      const separator = current.trim() ? '\n' : '';
      handleUpdate({ ...currentDoc, [field]: current + separator + "- " + text });
  };

  const NavButton = ({ id, label, icon: Icon }: any) => (
      <button onClick={() => setStep(id)} 
        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all min-w-[95px] flex-1 ${step === id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-slate-50'}`}
      >
        <Icon className={`w-5 h-5 ${step === id ? 'text-white' : 'text-slate-400'}`}/>
        <span className="font-bold text-[10px] md:text-xs text-center leading-tight">{label}</span>
      </button>
  );

  if (!currentDoc) return <div className="p-20 text-center text-slate-400">Caricamento documento...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in">
       
       <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Modulo Collaudo</h2>
            <p className="text-slate-500 text-sm mt-1">Configurazione analitica del sopralluogo tecnico-amministrativo.</p>
          </div>
          <div className="flex items-center gap-2">
              <button onClick={() => {}} className="text-slate-400 hover:text-blue-600 transition-colors p-2" title="Guida"><Info className="w-5 h-5"/></button>
          </div>
       </div>

       <div className="flex items-center gap-4 mb-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600"><ListChecks className="w-5 h-5"/></div>
            <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Documento Selezionato</label>
                <select 
                  className="w-full border-none p-0 font-bold text-slate-800 bg-transparent outline-none cursor-pointer text-lg"
                  value={currentDocId}
                  onChange={(e) => onSelectDocument(e.target.value)}
                >
                  {documents.map(d => (
                    <option key={d.id} value={d.id}>VISITA N. {d.visitNumber} - {new Date(d.date).toLocaleDateString()}</option>
                  ))}
                </select>
            </div>
            <div className="flex gap-2">
                {!readOnly && <button onClick={onNewDocument} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">Aggiungi Visita</button>}
                {!readOnly && documents.length > 1 && <button onClick={() => onDeleteDocument(currentDoc.id)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Elimina questo verbale"><Trash2 className="w-5 h-5"/></button>}
            </div>
       </div>

       <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <NavButton id="info" label="Data e Ora" icon={Calendar} />
          <NavButton id="convocation" label="Convocazione" icon={Mail} />
          <NavButton id="present" label="Presenti" icon={Users} />
          <NavButton id="works" label="Lavorazioni" icon={ListChecks} />
          <NavButton id="requests" label="Richieste" icon={MessageSquare} />
          <NavButton id="invitations" label="Inviti" icon={Bell} />
          <NavButton id="common" label="Clausole" icon={FileCheck2} />
          <NavButton id="eval" label="Valutazioni" icon={ClipboardCheck} />
       </div>

       <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200 min-h-[600px] relative">
          
          {isGenerating && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-50 flex items-center justify-center rounded-3xl">
                  <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 flex flex-col items-center gap-4">
                      <Loader2 className="w-10 h-10 text-blue-600 animate-spin"/>
                      <p className="font-bold text-slate-800">IA sta elaborando il testo...</p>
                  </div>
              </div>
          )}

          {step === 'info' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">Dati Cronologici della Visita</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data Sopralluogo</label>
                          <input disabled={readOnly} type="date" className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none" value={currentDoc.date} onChange={e => handleUpdate({...currentDoc, date: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ora Inizio</label>
                          <input disabled={readOnly} type="time" className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none" value={currentDoc.time} onChange={e => handleUpdate({...currentDoc, time: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ora Fine Presunta</label>
                          <input disabled={readOnly} type="time" className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none" value={currentDoc.endTime || ''} onChange={e => handleUpdate({...currentDoc, endTime: e.target.value})} />
                      </div>
                  </div>
              </div>
          )}

          {step === 'convocation' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-10">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Mail className="w-6 h-6 text-blue-600"/> Testo Lettera di Convocazione</h3>
                      <button onClick={() => polishText('letterIntro')} className="text-xs font-bold text-purple-600 flex items-center gap-1 hover:bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 transition-colors"><Wand2 className="w-3.5 h-3.5"/> IA Assist</button>
                  </div>
                  <div className="space-y-4">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Introduzione (Luogo e Ora)</label>
                      <textarea disabled={readOnly} className="w-full p-4 border border-slate-200 rounded-xl h-28 text-sm leading-relaxed" value={currentDoc.letterIntro || ''} onChange={e => handleUpdate({...currentDoc, letterIntro: e.target.value})} placeholder="Es: Il sottoscritto collaudatore convoca le parti in data... presso il cantiere situato in..." />
                  </div>
                  <div className="space-y-4">
                      <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Paragrafi del Corpo Lettera</label>
                          {!readOnly && (
                            <select className="p-2 border border-slate-200 rounded-lg text-[10px] bg-slate-50 outline-none max-w-xs" onChange={(e) => {
                                if (!e.target.value) return;
                                handleUpdate({ ...currentDoc, letterBodyParagraphs: [...(currentDoc.letterBodyParagraphs || []), e.target.value] });
                                e.target.value = "";
                            }}>
                                <option value="">Aggiungi paragrafo standard...</option>
                                {LETTER_PARAGRAPH_OPTIONS.map((opt, i) => <option key={i} value={opt}>{opt.substring(0, 50)}...</option>)}
                            </select>
                          )}
                      </div>
                      <div className="space-y-3">
                        {(currentDoc.letterBodyParagraphs || []).map((p, idx) => (
                           <div key={idx} className="flex gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 group transition-all hover:border-blue-200">
                              <p className="flex-1 text-sm text-slate-700 italic">"{p}"</p>
                              {!readOnly && <button onClick={() => {
                                  const newList = [...currentDoc.letterBodyParagraphs]; newList.splice(idx, 1); handleUpdate({...currentDoc, letterBodyParagraphs: newList});
                              }} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>}
                           </div>
                        ))}
                      </div>
                  </div>
              </div>
          )}

          {step === 'present' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Elenco dei Presenti</h3>
                  <p className="text-sm text-slate-500 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">Indicare nome, cognome e carica dei partecipanti al sopralluogo tecnico.</p>
                  <textarea disabled={readOnly} className="w-full p-6 border border-slate-200 rounded-2xl h-[400px] text-sm leading-relaxed font-mono focus:ring-2 focus:ring-blue-500/20 outline-none" value={currentDoc.attendees || ''} onChange={e => handleUpdate({...currentDoc, attendees: e.target.value})} placeholder="Es:&#10;Per il RUP: Ing. Mario Rossi&#10;Per la D.L.: Arch. Giovanni Bianchi&#10;Per l'Impresa: Sig. Roberto Verdi..." />
              </div>
          )}

          {step === 'works' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-10">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <h3 className="text-xl font-bold text-slate-900">Cronaca delle Lavorazioni</h3>
                      <button onClick={() => polishText('worksIntroText')} className="text-xs font-bold text-purple-600 flex items-center gap-1 hover:bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100"><Wand2 className="w-3.5 h-3.5"/> IA Assist</button>
                  </div>
                  <div className="space-y-4">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Testo Introduttivo Lavori</label>
                      <textarea disabled={readOnly} className="w-full p-4 border border-slate-200 rounded-xl h-40 text-sm leading-relaxed" value={currentDoc.worksIntroText || ''} onChange={e => handleUpdate({...currentDoc, worksIntroText: e.target.value})} placeholder="Il Collaudatore, coadiuvato dai presenti, procede all'ispezione delle opere riscontrando quanto segue..." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">Opere in Corso <span className="text-[10px] text-slate-300 font-normal italic">(Verifiche attuali)</span></label>
                          <textarea disabled={readOnly} className="w-full p-4 border border-slate-200 rounded-xl h-48 text-sm shadow-inner" value={currentDoc.worksInProgress || ''} onChange={e => handleUpdate({...currentDoc, worksInProgress: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">Prossime Attività <span className="text-[10px] text-slate-300 font-normal italic">(Programmazione)</span></label>
                          <textarea disabled={readOnly} className="w-full p-4 border border-slate-200 rounded-xl h-48 text-sm shadow-inner" value={currentDoc.upcomingWorks || ''} onChange={e => handleUpdate({...currentDoc, upcomingWorks: e.target.value})} />
                      </div>
                  </div>
              </div>
          )}

          {step === 'requests' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><MessageSquare className="w-6 h-6 text-blue-600"/> Richieste alle Parti</h3>
                      {!readOnly && (
                          <select className="p-2 border border-slate-200 rounded-lg text-[10px] bg-slate-50 outline-none max-w-xs" onChange={(e) => { if(e.target.value) { addTextToField('testerRequests', e.target.value); e.target.value=""; } }}>
                              <option value="">Aggiungi richiesta standard...</option>
                              {REQUEST_OPTIONS.map((opt, i) => <option key={i} value={opt}>{opt.substring(0, 50)}...</option>)}
                          </select>
                      )}
                  </div>
                  <div className="space-y-4">
                      <p className="text-xs text-slate-400 italic">Inserire i quesiti posti alla Direzione Lavori o all'Impresa durante il sopralluogo.</p>
                      <textarea disabled={readOnly} className="w-full p-6 border border-slate-200 rounded-2xl h-[400px] text-sm leading-relaxed focus:ring-2 focus:ring-blue-500/20 outline-none" value={currentDoc.testerRequests || ''} onChange={e => handleUpdate({...currentDoc, testerRequests: e.target.value})} />
                  </div>
              </div>
          )}

          {step === 'invitations' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Bell className="w-6 h-6 text-orange-500"/> Inviti e Prescrizioni</h3>
                      {!readOnly && (
                          <select className="p-2 border border-slate-200 rounded-lg text-[10px] bg-slate-50 outline-none max-w-xs" onChange={(e) => { if(e.target.value) { addTextToField('testerInvitations', e.target.value); e.target.value=""; } }}>
                              <option value="">Aggiungi prescrizione standard...</option>
                              {INVITATION_OPTIONS.map((opt, i) => <option key={i} value={opt}>{opt.substring(0, 50)}...</option>)}
                          </select>
                      )}
                  </div>
                  <div className="space-y-4">
                      <p className="text-xs text-slate-400 italic">Indicazioni vincolanti e raccomandazioni fornite dal collaudatore alle parti.</p>
                      <textarea disabled={readOnly} className="w-full p-6 border border-slate-200 rounded-2xl h-[400px] text-sm leading-relaxed focus:ring-2 focus:ring-blue-500/20 outline-none" value={currentDoc.testerInvitations || ''} onChange={e => handleUpdate({...currentDoc, testerInvitations: e.target.value})} />
                  </div>
              </div>
          )}

          {step === 'common' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><FileCheck2 className="w-6 h-6 text-green-600"/> Clausole di Chiusura</h3>
                      {!readOnly && (
                          <select className="p-2 border border-slate-200 rounded-lg text-[10px] bg-slate-50 outline-none max-w-xs" onChange={(e) => { if(e.target.value) { addTextToField('commonParts', e.target.value); e.target.value=""; } }}>
                              <option value="">Aggiungi clausola finale...</option>
                              {COMMON_PART_OPTIONS.map((opt, i) => <option key={i} value={opt}>{opt.substring(0, 50)}...</option>)}
                          </select>
                      )}
                  </div>
                  <div className="space-y-4">
                      <p className="text-xs text-slate-400 italic">Disposizioni finali riguardanti rilievi fotografici e chiusura del verbale.</p>
                      <textarea disabled={readOnly} className="w-full p-6 border border-slate-200 rounded-2xl h-[400px] text-sm leading-relaxed focus:ring-2 focus:ring-blue-500/20 outline-none" value={currentDoc.commonParts || ''} onChange={e => handleUpdate({...currentDoc, commonParts: e.target.value})} />
                  </div>
              </div>
          )}

          {step === 'eval' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <ClipboardCheck className="w-8 h-8 text-purple-600"/>
                        <h3 className="text-xl font-bold text-slate-900">Valutazioni Finali del Collaudatore</h3>
                      </div>
                      <button onClick={() => polishText('observations')} className="text-xs font-bold text-purple-600 flex items-center gap-1 hover:bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100"><Wand2 className="w-3.5 h-3.5"/> IA Assist</button>
                  </div>
                  <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex items-start gap-4 mb-6">
                      <Info className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-900 leading-relaxed">
                          <strong>Importante:</strong> Queste osservazioni costituiscono il corpo centrale del verbale dove il collaudatore esprime il proprio giudizio tecnico e amministrativo. Utilizzare un linguaggio chiaro e puntuale.
                      </div>
                  </div>
                  <textarea disabled={readOnly} className="w-full p-8 border border-slate-200 rounded-3xl h-[450px] text-sm shadow-inner bg-slate-50 focus:bg-white transition-all focus:ring-4 focus:ring-blue-500/10 outline-none" value={currentDoc.observations || ''} onChange={e => handleUpdate({...currentDoc, observations: e.target.value})} placeholder="Esponi qui il parere tecnico e le verifiche condotte..." />
              </div>
          )}
       </div>

       <div className="flex justify-between items-center mt-10">
           <button onClick={() => {
                const order: typeof step[] = ['info', 'convocation', 'present', 'works', 'requests', 'invitations', 'common', 'eval'];
                const idx = order.indexOf(step);
                if (idx > 0) setStep(order[idx-1]);
             }} disabled={step === 'info'} className="px-8 py-3.5 rounded-2xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 font-bold flex items-center gap-3 transition-all">
                <ArrowLeft className="w-5 h-5"/> Step Precedente
           </button>
           
           <div className="flex gap-2">
               {['info', 'convocation', 'present', 'works', 'requests', 'invitations', 'common', 'eval'].map((s, i) => (
                   <div key={i} className={`w-2 h-2 rounded-full transition-all ${step === s ? 'bg-blue-600 w-6' : 'bg-slate-200'}`}></div>
               ))}
           </div>

           <button onClick={() => {
                const order: typeof step[] = ['info', 'convocation', 'present', 'works', 'requests', 'invitations', 'common', 'eval'];
                const idx = order.indexOf(step);
                if (idx < order.length - 1) setStep(order[idx+1]);
             }} disabled={step === 'eval'} className="px-10 py-3.5 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 font-bold shadow-xl flex items-center gap-3 transition-all shadow-blue-500/25">
                Prossimo Step <ArrowRight className="w-5 h-5"/>
           </button>
       </div>
    </div>
  );
};
