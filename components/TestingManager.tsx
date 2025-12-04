
import React, { useState } from 'react';
import { DocumentVariables, ProjectConstants, TesterVisitSummary } from '../types';
import { Calendar, Clock, Mail, ClipboardCheck, Users, CheckSquare, Plus, Trash2, ArrowDownToLine, CalendarRange, ListChecks, ArrowRight, ArrowLeft, Activity, CalendarCheck as CalendarIconNext } from 'lucide-react';

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
  const [step, setStep] = useState<'info' | 'convocation' | 'works' | 'eval'>('info');

  // State for Inputs
  const [summaryManualInput, setSummaryManualInput] = useState('');
  const [inProgressInput, setInProgressInput] = useState('');
  const [upcomingInput, setUpcomingInput] = useState('');

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

  // --- Logic for Lists stored in Document (In Progress & Upcoming) ---
  
  const addToListInDoc = (field: 'worksInProgress' | 'upcomingWorks', inputVal: string, setInputVal: (s: string) => void) => {
      if (readOnly || !inputVal.trim()) return;
      const currentText = currentDoc[field] || '';
      // Split by newline, filter empty, add new, join
      const items = currentText.split('\n').filter(i => i.trim());
      items.push(inputVal.trim());
      handleUpdate({ ...currentDoc, [field]: items.join('\n') });
      setInputVal('');
  };

  const removeFromListInDoc = (field: 'worksInProgress' | 'upcomingWorks', index: number) => {
      if (readOnly) return;
      const currentText = currentDoc[field] || '';
      const items = currentText.split('\n').filter(i => i.trim());
      items.splice(index, 1);
      handleUpdate({ ...currentDoc, [field]: items.join('\n') });
  };

  // --- Logic for Smart Attendees Selection ---
  // Updated format to include Title + Name specifically as requested
  const potentialAttendees = [
      { 
          id: 'rup', 
          label: 'RUP', 
          fullText: `Responsabile Unico del Progetto: ${project.subjects.rup.contact.title || ''} ${project.subjects.rup.contact.name}`.trim()
      },
      { 
          id: 'dl', 
          label: 'DL', 
          fullText: `Direttore dei Lavori: ${project.subjects.dl.contact.title || ''} ${project.subjects.dl.contact.name}`.trim()
      },
      { 
          id: 'cse', 
          label: 'CSE', 
          fullText: `Coord. Sicurezza Esecuzione: ${project.subjects.cse.contact.title || ''} ${project.subjects.cse.contact.name}`.trim()
      },
      { 
          id: 'contractor', 
          label: 'Impresa', 
          // Format: per l'Impresa X (Ruolo): Sig. Y
          fullText: `per l'Impresa ${project.contractor.name} (${project.contractor.role || 'Legale Rappresentante'}): ${project.contractor.repName}`
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

  // --- Logic for Tester Visit Summaries (Project Level) ---
  const execPhase = project.executionPhase || {};
  // 1-based Visit Number maps to 0-based index
  const summaryIndex = (currentDoc.visitNumber > 0 ? currentDoc.visitNumber : 1) - 1;
  const currentSummary = execPhase.testerVisitSummaries?.[summaryIndex];

  const initSummaryForCurrentVisit = () => {
      if (readOnly || !onUpdateProject) return;
      const newSummary: TesterVisitSummary = {
          id: crypto.randomUUID(),
          startDate: '',
          endDate: '',
          works: [],
          notes: ''
      };
      
      const newSummaries = [...(execPhase.testerVisitSummaries || [])];
      // Ensure array is filled up to index
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
          alert("Nessuna lavorazione trovata nei verbali/giornale del periodo selezionato.");
          return;
      }

      // Merge unique
      const currentWorks = new Set(currentSummary.works);
      worksFound.forEach(w => currentWorks.add(w));
      
      updateCurrentSummary('works', Array.from(currentWorks));
      alert(`Importate ${worksFound.length} lavorazioni da ${relevantDocs.length} verbali del giornale lavori.`);
  };

  const addManualWorkSummary = () => {
      if (readOnly || !onUpdateProject || !currentSummary) return;
      if (summaryManualInput.trim()) {
          updateCurrentSummary('works', [...currentSummary.works, summaryManualInput]);
          setSummaryManualInput('');
      }
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

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in">
       
       {/* Main Header */}
       <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Verbali di Collaudo</h2>
            <p className="text-slate-500 text-sm mt-1">Gestione completa visite e riepiloghi lavorazioni.</p>
          </div>
       </div>

       {/* Selector */}
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
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button 
            onClick={() => setStep('info')} 
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${step === 'info' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'}`}
          >
            <Calendar className="w-5 h-5"/>
            <span className="font-bold text-xs md:text-sm">Dati & Orari</span>
          </button>
          <button 
            onClick={() => setStep('convocation')} 
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${step === 'convocation' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'}`}
          >
            <Users className="w-5 h-5"/>
            <span className="font-bold text-xs md:text-sm">Presenti</span>
          </button>
          <button 
            onClick={() => setStep('works')} 
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${step === 'works' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'}`}
          >
            <ListChecks className="w-5 h-5"/>
            <span className="font-bold text-xs md:text-sm">Riepilogo & Lavori</span>
          </button>
          <button 
            onClick={() => setStep('eval')} 
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${step === 'eval' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'}`}
          >
            <ClipboardCheck className="w-5 h-5"/>
            <span className="font-bold text-xs md:text-sm">Valutazioni</span>
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
                          <div className="flex items-center gap-4">
                            <input disabled={readOnly} type="number" className="w-32 p-3 border border-slate-300 rounded-lg bg-slate-50 font-mono text-center text-lg disabled:text-slate-400"
                                value={currentDoc.visitNumber} onChange={e => handleUpdate({...currentDoc, visitNumber: parseInt(e.target.value)})} />
                            <p className="text-xs text-slate-500 flex-1">
                                Il sistema associa automaticamente il riepilogo lavori N.{currentDoc.visitNumber} a questo verbale. <br/>
                                Modifica questo numero solo se necessario riordinare la sequenza.
                            </p>
                          </div>
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

          {step === 'works' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-12">
                  
                  {/* --- SECTION 1: RIEPILOGO LAVORI PREGRESSI --- */}
                  <section>
                      <div className="flex items-center justify-between border-b pb-2 mb-4">
                          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                              Riepilogo Lavori Periodo
                          </h3>
                          {currentSummary && !readOnly && (
                             <button onClick={deleteCurrentSummary} className="text-slate-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition-colors" title="Elimina Riepilogo">
                                 <Trash2 className="w-4 h-4"/>
                             </button>
                          )}
                      </div>
                      
                      {!currentSummary ? (
                          <div className="text-center py-8 bg-blue-50 rounded-xl border border-dashed border-blue-200">
                              <p className="text-blue-800 font-medium mb-3">Nessun riepilogo per il periodo tra il verbale precedente e questo.</p>
                              {!readOnly && (
                                  <button onClick={initSummaryForCurrentVisit} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold shadow-sm transition-transform hover:scale-105 inline-flex items-center gap-2">
                                      <Plus className="w-4 h-4"/> Inizializza Riepilogo
                                  </button>
                              )}
                          </div>
                      ) : (
                          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                              {/* Date Range Block */}
                              <div className="flex flex-wrap gap-4 items-center mb-6 border-b border-blue-200 pb-4">
                                  <div className="flex items-center gap-2 text-blue-800 font-bold text-sm bg-white px-3 py-1.5 rounded border border-blue-200">
                                      <CalendarRange className="w-4 h-4"/> Periodo
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <span className="text-slate-600 font-medium text-xs">Dal:</span>
                                      <input disabled={readOnly} type="date" className="p-1.5 border border-slate-300 rounded bg-white text-xs" 
                                          value={currentSummary.startDate} onChange={e => updateCurrentSummary('startDate', e.target.value)} />
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <span className="text-slate-600 font-medium text-xs">Al:</span>
                                      <input disabled={readOnly} type="date" className="p-1.5 border border-slate-300 rounded bg-white text-xs" 
                                          value={currentSummary.endDate} onChange={e => updateCurrentSummary('endDate', e.target.value)} />
                                  </div>
                                  <div className="flex-1 text-right">
                                      {!readOnly && (
                                         <button 
                                            onClick={importWorksFromJournal}
                                            className="inline-flex items-center gap-1 text-xs bg-white text-blue-700 px-3 py-1.5 rounded hover:bg-blue-100 font-medium border border-blue-200"
                                         >
                                             <ArrowDownToLine className="w-3 h-3"/> Importa da Giornale
                                         </button>
                                      )}
                                  </div>
                              </div>

                              {/* Works List */}
                              <div className="flex gap-2 mb-3">
                                   <input disabled={readOnly} type="text" 
                                      className="flex-1 p-2 border border-blue-200 rounded text-sm bg-white" placeholder="Es. Completamento massetto..."
                                      value={summaryManualInput} onChange={(e) => setSummaryManualInput(e.target.value)}
                                      onKeyDown={(e) => e.key === 'Enter' && addManualWorkSummary()}
                                   />
                                   {!readOnly && <button onClick={addManualWorkSummary} className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700"><Plus className="w-5 h-5" /></button>}
                               </div>
                               
                               <ul className="space-y-1 bg-white p-3 rounded border border-blue-100 min-h-[100px]">
                                   {currentSummary.works.map((work, wIdx) => (
                                       <li key={wIdx} className="flex justify-between items-start text-sm p-1.5 hover:bg-slate-50 rounded group">
                                           <span className="text-slate-700">{wIdx + 1}. {work}</span>
                                           {!readOnly && <button onClick={() => removeWorkSummary(wIdx)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>}
                                       </li>
                                   ))}
                                   {currentSummary.works.length === 0 && <p className="text-slate-400 italic text-xs text-center py-2">Nessuna lavorazione inserita.</p>}
                               </ul>
                          </div>
                      )}
                  </section>

                  {/* --- SECTION 2: OPERE IN CORSO --- */}
                  <section>
                      <div className="flex items-center justify-between border-b pb-2 mb-4">
                          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                              <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                              Opere in Corso di Esecuzione
                          </h3>
                      </div>
                      
                      <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                          <div className="flex gap-2 mb-3">
                               <input disabled={readOnly} type="text" 
                                  className="flex-1 p-2 border border-amber-200 rounded text-sm bg-white" placeholder="Es. Posa pavimentazione..."
                                  value={inProgressInput} onChange={(e) => setInProgressInput(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && addToListInDoc('worksInProgress', inProgressInput, setInProgressInput)}
                               />
                               {!readOnly && <button onClick={() => addToListInDoc('worksInProgress', inProgressInput, setInProgressInput)} className="bg-amber-500 text-white px-3 rounded hover:bg-amber-600"><Plus className="w-5 h-5" /></button>}
                           </div>
                           
                           <ul className="space-y-1 bg-white p-3 rounded border border-amber-100 min-h-[100px]">
                               {(currentDoc.worksInProgress || '').split('\n').filter(i => i.trim()).map((work, idx) => (
                                   <li key={idx} className="flex justify-between items-start text-sm p-1.5 hover:bg-slate-50 rounded group">
                                       <div className="flex gap-2">
                                            <Activity className="w-4 h-4 text-amber-500 mt-0.5 shrink-0"/>
                                            <span className="text-slate-700">{work}</span>
                                       </div>
                                       {!readOnly && <button onClick={() => removeFromListInDoc('worksInProgress', idx)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>}
                                   </li>
                               ))}
                               {!(currentDoc.worksInProgress || '').trim() && <p className="text-slate-400 italic text-xs text-center py-2">Nessuna opera in corso.</p>}
                           </ul>
                      </div>
                  </section>

                  {/* --- SECTION 3: PROSSIME ATTIVITA --- */}
                  <section>
                      <div className="flex items-center justify-between border-b pb-2 mb-4">
                          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                              <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                              Prossime Attività Previste
                          </h3>
                      </div>
                      
                      <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                          <div className="flex gap-2 mb-3">
                               <input disabled={readOnly} type="text" 
                                  className="flex-1 p-2 border border-emerald-200 rounded text-sm bg-white" placeholder="Es. Montaggio infissi..."
                                  value={upcomingInput} onChange={(e) => setUpcomingInput(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && addToListInDoc('upcomingWorks', upcomingInput, setUpcomingInput)}
                               />
                               {!readOnly && <button onClick={() => addToListInDoc('upcomingWorks', upcomingInput, setUpcomingInput)} className="bg-emerald-600 text-white px-3 rounded hover:bg-emerald-700"><Plus className="w-5 h-5" /></button>}
                           </div>
                           
                           <ul className="space-y-1 bg-white p-3 rounded border border-emerald-100 min-h-[100px]">
                               {(currentDoc.upcomingWorks || '').split('\n').filter(i => i.trim()).map((work, idx) => (
                                   <li key={idx} className="flex justify-between items-start text-sm p-1.5 hover:bg-slate-50 rounded group">
                                       <div className="flex gap-2">
                                            <CalendarIconNext className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0"/>
                                            <span className="text-slate-700">{work}</span>
                                       </div>
                                       {!readOnly && <button onClick={() => removeFromListInDoc('upcomingWorks', idx)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>}
                                   </li>
                               ))}
                               {!(currentDoc.upcomingWorks || '').trim() && <p className="text-slate-400 italic text-xs text-center py-2">Nessuna attività pianificata.</p>}
                           </ul>
                      </div>
                  </section>

              </div>
          )}

          {step === 'eval' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4">Valutazioni Tecnico-Amministrative</h3>
                  <textarea disabled={readOnly} className="w-full p-5 border border-slate-300 rounded-xl h-64 text-sm leading-relaxed font-serif focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-slate-100"
                    value={currentDoc.observations} onChange={e => handleUpdate({...currentDoc, observations: e.target.value})} 
                    placeholder="Si dà atto che... Il collaudatore verifica..."/>
              </div>
          )}

       </div>

       {/* Navigation Buttons */}
       <div className="flex justify-between mt-6">
           <button 
             onClick={() => {
                if(step === 'eval') setStep('works');
                else if(step === 'works') setStep('convocation');
                else if(step === 'convocation') setStep('info');
             }}
             disabled={step === 'info'}
             className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent font-medium flex items-center gap-2"
           >
             <ArrowLeft className="w-4 h-4"/> Indietro
           </button>
           <button 
             onClick={() => {
                if(step === 'info') setStep('convocation');
                else if(step === 'convocation') setStep('works');
                else if(step === 'works') setStep('eval');
             }}
             disabled={step === 'eval'}
             className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 disabled:bg-slate-300 font-medium shadow-lg disabled:shadow-none flex items-center gap-2"
           >
             Avanti <ArrowRight className="w-4 h-4"/>
           </button>
       </div>

    </div>
  );
};
