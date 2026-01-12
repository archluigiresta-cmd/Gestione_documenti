
import React, { useState, useRef, useEffect } from 'react';
import { DocumentVariables, ProjectConstants, TesterVisitSummary } from '../types';
import { Calendar, Clock, Mail, ClipboardCheck, Users, Plus, Trash2, ListChecks, ArrowRight, ArrowLeft, RefreshCw, MessageSquare, Bell, FileCheck2, X, UserPlus, ChevronUp, ChevronDown, Wand2, Info, CheckSquare } from 'lucide-react';

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
  onUpdateProject,
  readOnly = false
}) => {
  const currentDoc = documents.find(d => d.id === currentDocId) || documents[0];
  const [step, setStep] = useState<'info' | 'convocation' | 'present' | 'works' | 'requests' | 'invitations' | 'common' | 'eval'>('info');

  const handleUpdate = (updatedDoc: DocumentVariables) => {
      if (!readOnly) onUpdateDocument(updatedDoc);
  };

  const addTextToField = (field: 'testerRequests' | 'testerInvitations' | 'commonParts', text: string) => {
      const current = currentDoc[field] || '';
      const separator = current.trim() ? '\n' : '';
      handleUpdate({ ...currentDoc, [field]: current + separator + "- " + text });
  };

  const NavButton = ({ id, label, icon: Icon }: any) => (
      <button onClick={() => setStep(id)} 
        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all min-w-[90px] ${step === id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'}`}
      >
        <Icon className={`w-5 h-5 ${step === id ? 'text-white' : 'text-slate-400'}`}/>
        <span className="font-bold text-[10px] md:text-xs text-center">{label}</span>
      </button>
  );

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in">
       
       <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Verbali e Convocazioni</h2>
            <p className="text-slate-500 text-sm mt-1">Configurazione analitica del sopralluogo di collaudo.</p>
          </div>
       </div>

       <div className="flex items-center gap-3 mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-sm font-bold text-slate-500 uppercase">Documento Attivo:</span>
            <select 
              className="flex-1 p-2.5 border border-slate-300 rounded-lg font-semibold text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500/20"
              value={currentDocId}
              onChange={(e) => onSelectDocument(e.target.value)}
            >
              {documents.map(d => (
                <option key={d.id} value={d.id}>Verbale n. {d.visitNumber} del {new Date(d.date).toLocaleDateString()}</option>
              ))}
            </select>
            {!readOnly && <button onClick={onNewDocument} className="bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors">+ Nuovo</button>}
       </div>

       <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          <NavButton id="info" label="Dati Visita" icon={Calendar} />
          <NavButton id="convocation" label="Lettera" icon={Mail} />
          <NavButton id="present" label="Presenti" icon={Users} />
          <NavButton id="works" label="Lavori" icon={ListChecks} />
          <NavButton id="requests" label="Richieste" icon={MessageSquare} />
          <NavButton id="invitations" label="Inviti" icon={Bell} />
          <NavButton id="common" label="Chiusura" icon={FileCheck2} />
          <NavButton id="eval" label="Valutazioni" icon={ClipboardCheck} />
       </div>

       <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[500px]">
          
          {step === 'info' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4">Dettagli Temporali Sopralluogo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div><label className="block text-sm font-bold text-slate-700 mb-2">Data Visita</label>
                          <input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg" value={currentDoc.date} onChange={e => handleUpdate({...currentDoc, date: e.target.value})} />
                      </div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-2">Ora Inizio</label>
                          <input disabled={readOnly} type="time" className="w-full p-3 border border-slate-300 rounded-lg" value={currentDoc.time} onChange={e => handleUpdate({...currentDoc, time: e.target.value})} />
                      </div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-2">Ora Fine Presunta</label>
                          <input disabled={readOnly} type="time" className="w-full p-3 border border-slate-300 rounded-lg" value={currentDoc.endTime || ''} onChange={e => handleUpdate({...currentDoc, endTime: e.target.value})} />
                      </div>
                  </div>
              </div>
          )}

          {step === 'convocation' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
                  <h3 className="text-lg font-bold text-slate-800 border-b pb-4 flex items-center gap-2"><Mail className="w-5 h-5 text-blue-600"/> Configurazione Lettera di Convocazione</h3>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                      <p className="text-sm text-blue-800">Questa sezione definisce il testo che apparirà nella <strong>Lettera di Convocazione</strong>. Il verbale di sopralluogo userà invece i dati degli step successivi.</p>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Introduzione (Data e Luogo)</label>
                      <textarea disabled={readOnly} className="w-full p-3 border border-slate-300 rounded-lg h-24 text-sm" value={currentDoc.letterIntro || ''} onChange={e => handleUpdate({...currentDoc, letterIntro: e.target.value})} />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Corpo Lettera (Blocchi Testo)</label>
                      <div className="space-y-2">
                        {(currentDoc.letterBodyParagraphs || []).map((p, idx) => (
                           <div key={idx} className="flex gap-2 bg-slate-50 p-3 rounded border border-slate-200 group">
                              <p className="flex-1 text-sm text-slate-700">{p}</p>
                              {!readOnly && <button onClick={() => {
                                  const newList = [...currentDoc.letterBodyParagraphs]; newList.splice(idx, 1); handleUpdate({...currentDoc, letterBodyParagraphs: newList});
                              }} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>}
                           </div>
                        ))}
                      </div>
                      {!readOnly && (
                        <select className="w-full mt-3 p-2 border border-slate-300 rounded-lg text-sm bg-white" onChange={(e) => {
                            if (!e.target.value) return;
                            handleUpdate({ ...currentDoc, letterBodyParagraphs: [...(currentDoc.letterBodyParagraphs || []), e.target.value] });
                            e.target.value = "";
                        }}>
                            <option value="">Aggiungi paragrafo standard...</option>
                            {LETTER_PARAGRAPH_OPTIONS.map((opt, i) => <option key={i} value={opt}>{opt.substring(0, 70)}...</option>)}
                        </select>
                      )}
                  </div>
              </div>
          )}

          {step === 'present' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-4">Soggetti Presenti al Sopralluogo</h3>
                  <p className="text-sm text-slate-500 mb-4">Elenca i nominativi e le qualifiche dei soggetti intervenuti alla visita.</p>
                  <textarea disabled={readOnly} className="w-full p-4 border border-slate-300 rounded-xl h-64 text-sm leading-relaxed font-mono" value={currentDoc.attendees || ''} onChange={e => handleUpdate({...currentDoc, attendees: e.target.value})} placeholder="Es: Per il RUP: Ing. Mario Rossi&#10;Per la D.L.: Arch. Giovanni Bianchi&#10;Per l'Impresa: Sig. Roberto Verdi..." />
              </div>
          )}

          {step === 'works' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 border-b pb-4">Lavorazioni Eseguite e in Corso</h3>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Descrizione Lavori (per il Verbale)</label>
                      <textarea disabled={readOnly} className="w-full p-4 border border-slate-300 rounded-xl h-48 text-sm" value={currentDoc.worksIntroText || ''} onChange={e => handleUpdate({...currentDoc, worksIntroText: e.target.value})} placeholder="Durante il sopralluogo si è preso atto dell'esecuzione delle seguenti opere..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Opere in Corso</label>
                          <textarea disabled={readOnly} className="w-full p-3 border border-slate-300 rounded-lg h-32 text-sm" value={currentDoc.worksInProgress || ''} onChange={e => handleUpdate({...currentDoc, worksInProgress: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Prossime Attività</label>
                          <textarea disabled={readOnly} className="w-full p-3 border border-slate-300 rounded-lg h-32 text-sm" value={currentDoc.upcomingWorks || ''} onChange={e => handleUpdate({...currentDoc, upcomingWorks: e.target.value})} />
                      </div>
                  </div>
              </div>
          )}

          {step === 'requests' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                  <div className="flex justify-between items-center border-b pb-4">
                      <h3 className="text-lg font-bold text-slate-800">Richieste del Collaudatore</h3>
                      {!readOnly && (
                          <select className="p-2 border border-slate-300 rounded text-xs bg-slate-50" onChange={(e) => { if(e.target.value) { addTextToField('testerRequests', e.target.value); e.target.value=""; } }}>
                              <option value="">Inserisci richiesta standard...</option>
                              {REQUEST_OPTIONS.map((opt, i) => <option key={i} value={opt}>{opt.substring(0, 50)}...</option>)}
                          </select>
                      )}
                  </div>
                  <textarea disabled={readOnly} className="w-full p-4 border border-slate-300 rounded-xl h-64 text-sm" value={currentDoc.testerRequests || ''} onChange={e => handleUpdate({...currentDoc, testerRequests: e.target.value})} placeholder="Inserisci le richieste formulate alle parti..." />
              </div>
          )}

          {step === 'invitations' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                  <div className="flex justify-between items-center border-b pb-4">
                      <h3 className="text-lg font-bold text-slate-800">Inviti e Prescrizioni</h3>
                      {!readOnly && (
                          <select className="p-2 border border-slate-300 rounded text-xs bg-slate-50" onChange={(e) => { if(e.target.value) { addTextToField('testerInvitations', e.target.value); e.target.value=""; } }}>
                              <option value="">Inserisci invito/prescrizione standard...</option>
                              {INVITATION_OPTIONS.map((opt, i) => <option key={i} value={opt}>{opt.substring(0, 50)}...</option>)}
                          </select>
                      )}
                  </div>
                  <textarea disabled={readOnly} className="w-full p-4 border border-slate-300 rounded-xl h-64 text-sm" value={currentDoc.testerInvitations || ''} onChange={e => handleUpdate({...currentDoc, testerInvitations: e.target.value})} placeholder="Inserisci inviti o prescrizioni all'Impresa o alla D.L...." />
              </div>
          )}

          {step === 'common' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                  <div className="flex justify-between items-center border-b pb-4">
                      <h3 className="text-lg font-bold text-slate-800">Parti Comuni e Chiusura</h3>
                      {!readOnly && (
                          <select className="p-2 border border-slate-300 rounded text-xs bg-slate-50" onChange={(e) => { if(e.target.value) { addTextToField('commonParts', e.target.value); e.target.value=""; } }}>
                              <option value="">Inserisci clausola di chiusura...</option>
                              {COMMON_PART_OPTIONS.map((opt, i) => <option key={i} value={opt}>{opt.substring(0, 50)}...</option>)}
                          </select>
                      )}
                  </div>
                  <textarea disabled={readOnly} className="w-full p-4 border border-slate-300 rounded-xl h-64 text-sm" value={currentDoc.commonParts || ''} onChange={e => handleUpdate({...currentDoc, commonParts: e.target.value})} placeholder="Clausole di rito, rilievo fotografico, aggiornamento prossima visita..." />
              </div>
          )}

          {step === 'eval' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-4">
                  <div className="flex items-center gap-2 border-b pb-4">
                      <ClipboardCheck className="w-6 h-6 text-purple-600"/>
                      <h3 className="text-lg font-bold text-slate-800">Valutazioni Tecniche del Collaudatore</h3>
                  </div>
                  <p className="text-sm text-slate-500 italic">Queste note rappresentano il giudizio tecnico del collaudatore sullo stato delle opere e sulla conformità alle prescrizioni contrattuali rilevata in questo specifico sopralluogo.</p>
                  <textarea disabled={readOnly} className="w-full p-5 border border-slate-300 rounded-2xl h-80 text-sm shadow-inner bg-slate-50 focus:bg-white transition-all" value={currentDoc.observations || ''} onChange={e => handleUpdate({...currentDoc, observations: e.target.value})} placeholder="Inserisci qui le considerazioni tecniche conclusive per questo sopralluogo..." />
              </div>
          )}
       </div>

       <div className="flex justify-between mt-6">
           <button onClick={() => {
                const order: typeof step[] = ['info', 'convocation', 'present', 'works', 'requests', 'invitations', 'common', 'eval'];
                const idx = order.indexOf(step);
                if (idx > 0) setStep(order[idx-1]);
             }} disabled={step === 'info'} className="px-6 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 font-bold flex items-center gap-2 transition-all"><ArrowLeft className="w-4 h-4"/> Indietro</button>
           <button onClick={() => {
                const order: typeof step[] = ['info', 'convocation', 'present', 'works', 'requests', 'invitations', 'common', 'eval'];
                const idx = order.indexOf(step);
                if (idx < order.length - 1) setStep(order[idx+1]);
             }} disabled={step === 'eval'} className="px-6 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 font-bold shadow-lg flex items-center gap-2 transition-all shadow-blue-500/20">Avanti <ArrowRight className="w-4 h-4"/></button>
       </div>
    </div>
  );
};
