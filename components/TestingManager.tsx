
import React, { useState } from 'react';
import { DocumentVariables, ProjectConstants } from '../types';
import { Calendar, Clock, MapPin, Mail, ClipboardCheck, Save, Users, FileEdit, CheckSquare } from 'lucide-react';

interface TestingManagerProps {
  project: ProjectConstants;
  documents: DocumentVariables[];
  currentDocId: string;
  onSelectDocument: (id: string) => void;
  onUpdateDocument: (d: DocumentVariables) => void;
  onNewDocument: () => void;
  onDeleteDocument: (id: string) => void;
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
  readOnly = false
}) => {
  const currentDoc = documents.find(d => d.id === currentDocId) || documents[0];
  const [step, setStep] = useState<'info' | 'convocation' | 'eval'>('info');

  if (!currentDoc) return <div className="p-8 text-center">Nessun verbale attivo. Crea un nuovo verbale dalla dashboard.</div>;

  const handleUpdate = (updatedDoc: DocumentVariables) => {
      if (!readOnly) onUpdateDocument(updatedDoc);
  };

  // Logic for Smart Attendees Selection
  const potentialAttendees = [
      { id: 'rup', label: `RUP: ${project.subjects.rup.contact.title} ${project.subjects.rup.contact.name}`, role: 'Responsabile Unico del Progetto' },
      { id: 'dl', label: `DL: ${project.subjects.dl.contact.title} ${project.subjects.dl.contact.name}`, role: 'Direttore dei Lavori' },
      { id: 'cse', label: `CSE: ${project.subjects.cse.contact.title} ${project.subjects.cse.contact.name}`, role: 'Coord. Sicurezza Esecuzione' },
      { id: 'contractor', label: `Impresa: ${project.contractor.repName} (${project.contractor.role})`, role: `per l'Impresa ${project.contractor.name}` },
  ];

  const toggleAttendee = (label: string, role: string) => {
      if (readOnly) return;
      const textToAdd = `${role}: ${label.split(': ')[1]}`;
      const currentText = currentDoc.attendees || '';
      
      if (currentText.includes(textToAdd)) {
          // Remove
          const newText = currentText.replace(textToAdd, '').replace('\n', '').trim();
          handleUpdate({...currentDoc, attendees: newText});
      } else {
          // Add
          const separator = currentText.length > 0 ? '\n' : '';
          handleUpdate({...currentDoc, attendees: currentText + separator + textToAdd});
      }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in">
       
       {/* Header */}
       <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Verbali di Collaudo</h2>
            <p className="text-slate-500 text-sm mt-1">Gestione visite, convocazioni e valutazioni.</p>
          </div>
          <div className="flex items-center gap-3">
              <select 
                 className="p-2.5 border border-slate-300 rounded-lg font-semibold text-sm bg-white shadow-sm hover:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
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
                <button onClick={onNewDocument} className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors shadow-lg shadow-slate-900/20">
                    + Nuovo
                </button>
              )}
          </div>
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
                         <span className="text-xs text-slate-400">Modificabile manualmente</span>
                      </div>
                      
                      {/* Smart Select Area */}
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                          <p className="text-xs font-bold text-slate-500 uppercase mb-2">Aggiungi rapidamente:</p>
                          <div className="flex flex-wrap gap-2">
                              {potentialAttendees.map(p => {
                                  // Check if this person is roughly in the text
                                  const isSelected = currentDoc.attendees?.includes(p.label.split(': ')[1]);
                                  return (
                                    <button 
                                      key={p.id}
                                      onClick={() => toggleAttendee(p.label, p.role)}
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
                      <strong>Nota:</strong> I lavori eseguiti specifici di questo sopralluogo vengono importati automaticamente dalla sezione "Esecuzione &gt; Giornale Lavori". Qui inserisci solo le considerazioni del collaudatore.
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

    </div>
  );
};
