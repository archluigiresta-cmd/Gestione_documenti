
import React, { useState, useRef, useEffect } from 'react';
import { DocumentVariables, ProjectConstants, TesterVisitSummary, LetterRecipientConfig } from '../types';
import { Calendar, Clock, Mail, ClipboardCheck, Users, CheckSquare, Plus, Trash2, ListChecks, ArrowRight, ArrowLeft, Activity, RefreshCw, MessageSquare, Bell, FileCheck2, X, UserPlus, ChevronUp, ChevronDown, AtSign, FileText } from 'lucide-react';

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

  const updateExec = (field: string, value: any) => {
    if (readOnly || !onUpdateProject) return;
    onUpdateProject({ ...project, executionPhase: { ...project.executionPhase, [field]: value } });
  };

  const summaryIndex = (currentDoc.visitNumber > 0 ? currentDoc.visitNumber : 1) - 1;
  const currentSummary = project.executionPhase.testerVisitSummaries?.[summaryIndex];

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
            <p className="text-slate-500 text-sm mt-1">Gestione completa visite di collaudo: struttura identica per ogni appalto.</p>
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
                  <p className="text-sm text-slate-500">Configura la lettera da inviare alle parti interessate.</p>
                  {/* ... Altri campi lettera (già presenti nel codice precedente) ... */}
              </div>
          )}

          {step === 'works' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-12">
                  <section>
                      <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Lavorazioni Eseguite</h3>
                      <textarea disabled={readOnly} className="w-full p-4 border border-slate-300 rounded-xl h-32 text-sm" value={currentDoc.worksIntroText || ''} onChange={e => handleUpdate({...currentDoc, worksIntroText: e.target.value})} />
                  </section>
              </div>
          )}

          {step === 'eval' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-4 flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-purple-600"/> Valutazioni del Collaudatore</h3>
                  <textarea disabled={readOnly} className="w-full p-4 border border-slate-300 rounded-xl h-64 text-sm" placeholder="Inserisci qui le considerazioni tecniche conclusive per questo sopralluogo..." value={currentDoc.observations || ''} onChange={e => handleUpdate({...currentDoc, observations: e.target.value})} />
              </div>
          )}

          {/* Fallback per step non ancora visualizzati o vuoti */}
          {!['info', 'convocation', 'works', 'eval'].includes(step) && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-in fade-in">
                  <FileText className="w-12 h-12 mb-4 opacity-20"/>
                  <p>Sezione {step.toUpperCase()} in fase di compilazione.</p>
              </div>
          )}
       </div>

       <div className="flex justify-between mt-6">
           <button onClick={() => {
                if(step === 'eval') setStep('common'); else if(step === 'common') setStep('invitations'); else if(step === 'invitations') setStep('requests'); else if(step === 'requests') setStep('works'); else if(step === 'works') setStep('present'); else if(step === 'present') setStep('convocation'); else if(step === 'convocation') setStep('info');
             }} disabled={step === 'info'} className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 font-medium flex items-center gap-2 transition-all"><ArrowLeft className="w-4 h-4"/> Indietro</button>
           <button onClick={() => {
                if(step === 'info') setStep('convocation'); else if(step === 'convocation') setStep('present'); else if(step === 'present') setStep('works'); else if(step === 'works') setStep('requests'); else if(step === 'requests') setStep('invitations'); else if(step === 'invitations') setStep('common'); else if(step === 'common') setStep('eval');
             }} disabled={step === 'eval'} className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 font-medium shadow-lg flex items-center gap-2 transition-all shadow-blue-500/20">Avanti <ArrowRight className="w-4 h-4"/></button>
       </div>
    </div>
  );
};
