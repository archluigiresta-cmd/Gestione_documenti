
import React from 'react';
import { DocumentVariables } from '../types';
import { Calendar, Clock, MapPin, Mail, ClipboardCheck, Save } from 'lucide-react';

interface TestingManagerProps {
  documents: DocumentVariables[];
  currentDocId: string;
  onSelectDocument: (id: string) => void;
  onUpdateDocument: (d: DocumentVariables) => void;
  onNewDocument: () => void;
  onDeleteDocument: (id: string) => void;
}

export const TestingManager: React.FC<TestingManagerProps> = ({
  documents,
  currentDocId,
  onSelectDocument,
  onUpdateDocument,
  onNewDocument,
  onDeleteDocument
}) => {
  const currentDoc = documents.find(d => d.id === currentDocId) || documents[0];

  if (!currentDoc) return <div className="p-8 text-center">Nessun verbale attivo. Crea un nuovo verbale dalla dashboard.</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in">
       <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Verbali di Collaudo</h2>
            <p className="text-slate-500 text-sm">Gestione visite, convocazioni e valutazioni tecnico-amministrative.</p>
          </div>
          <div className="flex items-center gap-3">
              <select 
                 className="p-2 border border-slate-300 rounded font-semibold text-sm"
                 value={currentDocId}
                 onChange={(e) => onSelectDocument(e.target.value)}
              >
                 {documents.map(d => (
                   <option key={d.id} value={d.id}>
                      Verbale n. {d.visitNumber} del {new Date(d.date).toLocaleDateString()}
                   </option>
                 ))}
              </select>
              <button onClick={onNewDocument} className="bg-slate-900 text-white px-3 py-2 rounded text-sm hover:bg-black transition-colors">
                  + Nuovo Verbale
              </button>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4"/> Dati Sopralluogo
                  </h3>
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Data</label>
                          <input type="date" className="w-full p-2 border rounded mt-1"
                             value={currentDoc.date} onChange={e => onUpdateDocument({...currentDoc, date: e.target.value})} />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Ora</label>
                          <input type="time" className="w-full p-2 border rounded mt-1"
                             value={currentDoc.time} onChange={e => onUpdateDocument({...currentDoc, time: e.target.value})} />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Numero Verbale</label>
                          <input type="number" className="w-full p-2 border rounded mt-1"
                             value={currentDoc.visitNumber} onChange={e => onUpdateDocument({...currentDoc, visitNumber: parseInt(e.target.value)})} />
                      </div>
                  </div>
              </div>
          </div>

          <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Mail className="w-4 h-4"/> Convocazione e Presenti
                  </h3>
                  <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Dettagli Convocazione (PEC/Brevi)</label>
                      <textarea className="w-full p-3 border rounded h-20 text-sm"
                         value={currentDoc.convocationDetails} onChange={e => onUpdateDocument({...currentDoc, convocationDetails: e.target.value})} 
                         placeholder="Es. Convocata via PEC nota prot. n..."/>
                  </div>
                  <div>
                      <label className="block text-sm font-medium mb-1">Soggetti Presenti</label>
                      <textarea className="w-full p-3 border rounded h-24 text-sm"
                         value={currentDoc.attendees} onChange={e => onUpdateDocument({...currentDoc, attendees: e.target.value})} 
                         placeholder="Elenco nominativo dei presenti..."/>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4"/> Valutazioni e Osservazioni
                  </h3>
                  <p className="text-sm text-slate-500 mb-2">Inserisci qui le valutazioni specifiche del collaudatore. I lavori eseguiti verranno importati automaticamente dalla sezione "Esecuzione".</p>
                  <textarea className="w-full p-4 border rounded h-40 text-sm leading-relaxed"
                     value={currentDoc.observations} onChange={e => onUpdateDocument({...currentDoc, observations: e.target.value})} 
                     placeholder="Si dà atto che..."/>
              </div>
          </div>
       </div>
    </div>
  );
};
