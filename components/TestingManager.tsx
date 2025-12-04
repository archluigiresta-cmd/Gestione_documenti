
import React, { useState } from 'react';
import { DocumentVariables, ProjectConstants, TesterVisitSummary } from '../types';
import { Calendar, Clock, Mail, ClipboardCheck, Users, CheckSquare, Plus, Trash2, ArrowDownToLine, CalendarRange, ListChecks } from 'lucide-react';

interface TestingManagerProps {
  project: ProjectConstants;
  documents: DocumentVariables[];
  currentDocId: string;
  onSelectDocument: (id: string) => void;
  onUpdateDocument: (d: DocumentVariables) => void;
  onNewDocument: () => void;
  onDeleteDocument: (id: string) => void;
  onUpdateProject?: (p: ProjectConstants) => void; // New prop for saving summaries
  readOnly?: boolean; 
}

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
  const [activeTab, setActiveTab] = useState<'minutes' | 'summaries'>('minutes');
  const [step, setStep] = useState<'info' | 'convocation' | 'eval'>('info');

  // State for Tester Works Summary
  const [summaryManualInput, setSummaryManualInput] = useState('');
  const [activeSummaryIndex, setActiveSummaryIndex] = useState<number | null>(null);

  if (!currentDoc) return <div className="p-8 text-center">Nessun verbale attivo. Crea un nuovo verbale dalla dashboard.</div>;

  const handleUpdate = (updatedDoc: DocumentVariables) => {
      if (!readOnly) onUpdateDocument(updatedDoc);
  };

  // Helper to safely update execution phase
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

  // Logic for Smart Attendees Selection
  const potentialAttendees = [
      { 
          id: 'rup', 
          label: 'RUP', 
          fullText: `Responsabile Unico del Progetto: ${project.subjects.rup.contact.title} ${project.subjects.rup.contact.name}` 
      },
      { 
          id: 'dl', 
          label: 'DL', 
          fullText: `Direttore dei Lavori: ${project.subjects.dl.contact.title} ${project.subjects.dl.contact.name}` 
      },
      { 
          id: 'cse', 
          label: 'CSE', 
          fullText: `Coord. Sicurezza Esecuzione: ${project.subjects.cse.contact.title} ${project.subjects.cse.contact.name}` 
      },
      { 
          id: 'contractor', 
          label: 'Impresa', 
          fullText: `per l'Impresa ${project.contractor.name}: ${project.contractor.repName} (${project.contractor.role || 'Legale Rappresentante'})` 
      },
  ];

  const toggleAttendee = (fullText: string) => {
      if (readOnly) return;
      const currentText = currentDoc.attendees || '';
      
      if (currentText.includes(fullText)) {
          // Remove
          const newText = currentText.replace(fullText, '').replace('\n\n', '\n').trim();
          handleUpdate({...currentDoc, attendees: newText});
      } else {
          // Add
          const separator = currentText.length > 0 ? '\n' : '';
          handleUpdate({...currentDoc, attendees: currentText + separator + fullText});
      }
  };

  // --- Logic for Tester Visit Summaries (Moved from ExecutionManager) ---
  const execPhase = project.executionPhase || {};

  const createNewSummary = () => {
      if (readOnly || !onUpdateProject) return;
      const newSummary: TesterVisitSummary = {
          id: crypto.randomUUID(),
          startDate: '',
          endDate: '',
          works: [],
          notes: ''
      };
      updateExec('testerVisitSummaries', [...(execPhase.testerVisitSummaries || []), newSummary]);
      setActiveSummaryIndex((execPhase.testerVisitSummaries || []).length);
  };

  const updateSummary = (index: number, field: keyof TesterVisitSummary, value: any) => {
      if (readOnly || !onUpdateProject) return;
      const list = [...(execPhase.testerVisitSummaries || [])];
      list[index] = { ...list[index], [field]: value };
      updateExec('testerVisitSummaries', list);
  };
  
  const importWorksFromJournal = (index: number) => {
      if (readOnly || !onUpdateProject) return;
      const summary = execPhase.testerVisitSummaries?.[index];
      if (!summary || !summary.startDate || !summary.endDate) {
          alert("Inserisci prima le date 'Dal' e 'Al'.");
          return;
      }
      
      const relevantDocs = documents.filter(d => d.date >= summary.startDate && d.date <= summary.endDate);
      const worksFound = relevantDocs.flatMap(d => d.worksExecuted);
      
      // Merge unique
      const currentWorks = new Set(summary.works);
      worksFound.forEach(w => currentWorks.add(w));
      
      updateSummary(index, 'works', Array.from(currentWorks));
      alert(`Importate ${worksFound.length} lavorazioni da ${relevantDocs.length} verbali.`);
  };

  const addManualWorkToSummary = (index: number) => {
      if (readOnly || !onUpdateProject) return;
      if (summaryManualInput.trim()) {
          const summary = execPhase.testerVisitSummaries?.[index];
          if (summary) {
              updateSummary(index, 'works', [...summary.works, summaryManualInput]);
              setSummaryManualInput('');
          }
      }
  };

  const removeWorkFromSummary = (summaryIndex: number, workIndex: number) => {
      if (readOnly || !onUpdateProject) return;
      const summary = execPhase.testerVisitSummaries?.[summaryIndex];
      if (summary) {
          const newWorks = [...summary.works];
          newWorks.splice(workIndex, 1);
          updateSummary(summaryIndex, 'works', newWorks);
      }
  };

  const deleteSummary = (index: number) => {
      if (readOnly || !onUpdateProject) return;
      if (confirm("Eliminare questo riepilogo?")) {
          const list = [...(execPhase.testerVisitSummaries || [])];
          list.splice(index, 1);
          updateExec('testerVisitSummaries', list);
          setActiveSummaryIndex(null);
      }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in">
       
       {/* Main Header */}
       <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Verbali di Collaudo</h2>
            <p className="text-slate-500 text-sm mt-1">Gestione completa visite e riepiloghi lavorazioni.</p>
          </div>
          <div className="flex bg-white rounded-lg p-1 shadow border border-slate-200 overflow-hidden">
             <button onClick={() => setActiveTab('minutes')} className={`px-4 py-2 text-sm font-medium rounded transition-all whitespace-nowrap ${activeTab === 'minutes' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-2"><ClipboardCheck className="w-4 h-4"/> Verbale Corrente</div>
             </button>
             <button onClick={() => setActiveTab('summaries')} className={`px-4 py-2 text-sm font-medium rounded transition-all whitespace-nowrap ${activeTab === 'summaries' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-2"><ListChecks className="w-4 h-4"/> Riepiloghi Lavori</div>
             </button>
          </div>
       </div>

       {/* --- TAB: MINUTES (Existing Wizard) --- */}
       {activeTab === 'minutes' && (
         <>
           <div className="flex items-center gap-3 mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-sm font-bold text-slate-500 uppercase">Seleziona Verbale:</span>
                <select 
                  className="flex-1 p-2.5 border border-slate-300 rounded-lg font-semibold text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
                  value={currentDocId}
                  onChange={(e) => onSelectDocument(e.target.value)}
                >
                  {documents.map(d => (
                    <option key={d.id} value={d.id}>
                        Verbale n. {d.visitNumber} del {new Date(d.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {!readOnly && (
                  <button onClick={onNewDocument} className="bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors">
                      + Nuovo
                  </button>
                )}
           </div>

           {/* Step Navigation */}
           <div className="grid grid-cols-3 gap-4 mb-8">
              <button 
                onClick={() => setStep('info')} 
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${step === 'info' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'}`}
              >
                <Calendar className="w-6 h-6"/>
                <span className="font-bold text-sm">Dati & Orari</span>
              </button>
              <button 
                onClick={() => setStep('convocation')} 
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${step === 'convocation' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'}`}
              >
                <Users className="w-6 h-6"/>
                <span className="font-bold text-sm">Presenti</span>
              </button>
              <button 
                onClick={() => setStep('eval')} 
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${step === 'eval' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'}`}
              >
                <ClipboardCheck className="w-6 h-6"/>
                <span className="font-bold text-sm">Valutazioni</span>
              </button>
           </div>

           {/* Content Area */}
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
                              <input disabled={readOnly} type="number" className="w-32 p-3 border border-slate-300 rounded-lg bg-slate-50 font-mono text-center text-lg disabled:text-slate-400"
                                value={currentDoc.visitNumber} onChange={e => handleUpdate({...currentDoc, visitNumber: parseInt(e.target.value)})} />
                              <p className="text-xs text-slate-500 mt-2">Modificare solo se necessario riordinare la sequenza.</p>
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
                            <span className="text-xs text-slate-400">Clicca sui tasti per aggiungere/rimuovere i soggetti dai dati di progetto.</span>
                          </div>
                          
                          {/* Smart Select Area */}
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Inserimento Rapido:</p>
                              <div className="flex flex-wrap gap-2">
                                  {potentialAttendees.map(p => {
                                      // Check using partial match if possible or exact
                                      const isSelected = currentDoc.attendees?.includes(p.fullText);
                                      return (
                                        <button 
                                          key={p.id}
                                          onClick={() => toggleAttendee(p.fullText)}
                                          disabled={readOnly}
                                          className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-1 transition-all ${
                                              isSelected 
                                              ? 'bg-blue-600 text-white border-blue-600' 
                                              : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
                                          }`}
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

              {step === 'eval' && (
                  <div className="animate-in fade-in slide-in-from-right-4">
                      <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4">Valutazioni Tecnico-Amministrative</h3>
                      <p className="text-sm text-slate-500 mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-800">
                          <strong>Nota:</strong> I lavori eseguiti vengono gestiti nel tab "Riepiloghi Lavori". Qui inserisci le considerazioni del collaudatore.
                      </p>
                      <textarea disabled={readOnly} className="w-full p-5 border border-slate-300 rounded-xl h-64 text-sm leading-relaxed font-serif focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-slate-100"
                        value={currentDoc.observations} onChange={e => handleUpdate({...currentDoc, observations: e.target.value})} 
                        placeholder="Si dà atto che... Il collaudatore verifica..."/>
                  </div>
              )}

           </div>

           {/* Navigation Buttons */}
           <div className="flex justify-between mt-6">
               <button 
                 onClick={() => setStep(prev => prev === 'eval' ? 'convocation' : 'info')}
                 disabled={step === 'info'}
                 className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent font-medium"
               >
                 &larr; Indietro
               </button>
               <button 
                 onClick={() => setStep(prev => prev === 'info' ? 'convocation' : 'eval')}
                 disabled={step === 'eval'}
                 className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 disabled:bg-slate-300 font-medium shadow-lg disabled:shadow-none"
               >
                 Avanti &rarr;
               </button>
           </div>
         </>
       )}

       {/* --- TAB: SUMMARIES (Moved from ExecutionManager) --- */}
       {activeTab === 'summaries' && (
         <div className="animate-in fade-in slide-in-from-right-4">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
                 <div className="flex items-center justify-between mb-4">
                     <div>
                         <h3 className="text-lg font-bold text-slate-800">Riepilogo Lavori per Visita Collaudatore</h3>
                         <p className="text-slate-500 text-sm">Crea un elenco sintetico delle lavorazioni per ogni periodo tra una visita e l'altra.</p>
                     </div>
                     {!readOnly && (
                         <button onClick={createNewSummary} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm">
                             <Plus className="w-4 h-4"/> Nuovo Periodo
                         </button>
                     )}
                 </div>
                 
                 {(execPhase.testerVisitSummaries || []).length === 0 && (
                     <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                         Nessun riepilogo creato. Clicca su "Nuovo Periodo" per iniziare.
                     </div>
                 )}
                 
                 <div className="space-y-8">
                     {(execPhase.testerVisitSummaries || []).map((summary, idx) => (
                         <div key={summary.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 animate-in slide-in-from-bottom-2">
                             <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
                                 <div className="flex gap-4 items-center">
                                     <span className="font-bold text-slate-700 bg-white px-2 py-1 rounded text-sm border shadow-sm flex items-center gap-2">
                                        <CalendarRange className="w-3 h-3 text-blue-500"/>
                                        Periodo Verbale #{idx + 1}
                                     </span>
                                     <div className="flex items-center gap-2 text-sm">
                                         <span className="text-slate-500 font-medium">Dal:</span>
                                         <input disabled={readOnly} type="date" className="p-1 border border-slate-300 rounded bg-white text-xs" 
                                             value={summary.startDate} onChange={e => updateSummary(idx, 'startDate', e.target.value)} />
                                         <span className="text-slate-500 font-medium">Al:</span>
                                         <input disabled={readOnly} type="date" className="p-1 border border-slate-300 rounded bg-white text-xs" 
                                             value={summary.endDate} onChange={e => updateSummary(idx, 'endDate', e.target.value)} />
                                     </div>
                                 </div>
                                 {!readOnly && (
                                     <div className="flex gap-2">
                                         <button 
                                            onClick={() => importWorksFromJournal(idx)}
                                            className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-200 font-medium border border-blue-200"
                                            title="Importa dal Giornale Lavori in base alle date"
                                         >
                                             <ArrowDownToLine className="w-3 h-3"/> Importa da Giornale
                                         </button>
                                         <button onClick={() => deleteSummary(idx)} className="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors">
                                             <Trash2 className="w-4 h-4"/>
                                         </button>
                                     </div>
                                 )}
                             </div>
                             
                             <div className="p-4 bg-white">
                                 <div className="flex gap-2 mb-4">
                                     <input disabled={readOnly}
                                        type="text" 
                                        className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors"
                                        placeholder="Aggiungi lavorazione manualmente..."
                                        value={activeSummaryIndex === idx ? summaryManualInput : ''}
                                        onChange={(e) => {
                                            setActiveSummaryIndex(idx);
                                            setSummaryManualInput(e.target.value);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                setActiveSummaryIndex(idx);
                                                addManualWorkToSummary(idx);
                                            }
                                        }}
                                     />
                                     {!readOnly && (
                                         <button onClick={() => { setActiveSummaryIndex(idx); addManualWorkToSummary(idx); }} className="bg-slate-800 text-white px-3 rounded-lg hover:bg-black transition-colors">
                                             <Plus className="w-4 h-4" />
                                         </button>
                                     )}
                                 </div>
                                 
                                 <div className="space-y-2">
                                     {summary.works.length === 0 ? (
                                         <p className="text-slate-400 italic text-sm text-center py-4 bg-slate-50 rounded border border-dashed border-slate-200">Nessuna lavorazione in elenco.</p>
                                     ) : (
                                         <ul className="list-disc pl-5 space-y-1">
                                             {summary.works.map((work, wIdx) => (
                                                 <li key={wIdx} className="text-sm text-slate-700 pl-1 group flex justify-between items-start hover:bg-slate-50 rounded p-1 -ml-1">
                                                     <span>{work}</span>
                                                     {!readOnly && (
                                                         <button onClick={() => removeWorkFromSummary(idx, wIdx)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 px-2">
                                                             <Trash2 className="w-3 h-3"/>
                                                         </button>
                                                     )}
                                                 </li>
                                             ))}
                                         </ul>
                                     )}
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
         </div>
       )}

    </div>
  );
};
