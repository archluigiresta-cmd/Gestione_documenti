
import React, { useState } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { Plus, Gavel, Users, Clock, ClipboardList, Check, Trash2 } from 'lucide-react';

interface TestingManagerProps {
  project: ProjectConstants;
  documents: DocumentVariables[];
  onSaveDocument: (doc: DocumentVariables) => void;
  onDeleteDocument: (id: string) => void;
  onCreateDocument: (type: DocumentType) => void;
}

export const TestingManager: React.FC<TestingManagerProps> = ({
  project, documents, onSaveDocument, onDeleteDocument, onCreateDocument
}) => {
  const [activeTab, setActiveTab] = useState('visite');
  const [activeSubTab, setActiveSubTab] = useState('dati');
  const [selectedDocId, setSelectedDocId] = useState(documents.find(d => d.type === 'VERBALE_COLLAUDO')?.id || '');

  const currentDoc = documents.find(d => d.id === selectedDocId);

  const updateDoc = (field: keyof DocumentVariables, value: any) => {
    if (currentDoc) onSaveDocument({ ...currentDoc, [field]: value });
  };

  const toggleAttendee = (label: string) => {
    if (!currentDoc) return;
    const list = currentDoc.attendeesList || [];
    const newList = list.includes(label) ? list.filter(l => l !== label) : [...list, label];
    onSaveDocument({ ...currentDoc, attendeesList: newList, attendees: newList.join(',\n') });
  };

  const subjects = [
    { label: `RUP: ${project.subjects.rup.contact.name}`, title: project.subjects.rup.contact.title },
    { label: `DL: ${project.subjects.dl.contact.name}`, title: project.subjects.dl.contact.title },
    { label: `CSE: ${project.subjects.cse.contact.name}`, title: project.subjects.cse.contact.title },
    { label: `Impresa: ${project.contractor.repName}`, title: project.contractor.repTitle }
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-200 w-fit">
          <button onClick={() => setActiveTab('corrispondenza')} className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg ${activeTab === 'corrispondenza' ? 'bg-slate-950 text-white' : 'text-slate-400 hover:text-slate-600'}`}>Corrispondenza</button>
          <button onClick={() => setActiveTab('visite')} className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg ${activeTab === 'visite' ? 'bg-slate-950 text-white' : 'text-slate-400 hover:text-slate-600'}`}>Verbali di Visita</button>
          <button onClick={() => setActiveTab('relazioni')} className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg ${activeTab === 'relazioni' ? 'bg-slate-950 text-white' : 'text-slate-400 hover:text-slate-600'}`}>Relazioni Finali</button>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Gavel className="w-6 h-6"/></div>
          <select className="p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm font-bold text-blue-800 w-80 outline-none" value={selectedDocId} onChange={e => setSelectedDocId(e.target.value)}>
            <option value="">-- Seleziona Documento --</option>
            {documents.filter(d => {
                if(activeTab === 'corrispondenza') return d.type.startsWith('LET_');
                if(activeTab === 'visite') return d.type === 'VERBALE_COLLAUDO';
                return d.type.startsWith('REL_');
            }).map(d => <option key={d.id} value={d.id}>{d.type.replace(/_/g, ' ')} n. {d.visitNumber}</option>)}
          </select>
        </div>
        <button onClick={() => onCreateDocument(activeTab === 'visite' ? 'VERBALE_COLLAUDO' : 'LET_CONVOCAZIONE_COLLAUDO' as any)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4"/> Nuovo Documento</button>
      </div>

      {currentDoc ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
          <div className="flex border-b border-slate-100 bg-slate-50/50">
            <button onClick={() => setActiveSubTab('dati')} className={`px-8 py-5 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${activeSubTab === 'dati' ? 'bg-white border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><Clock className="w-4 h-4"/> Dati Sopralluogo</button>
            <button onClick={() => setActiveSubTab('presenti')} className={`px-8 py-5 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${activeSubTab === 'presenti' ? 'bg-white border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><Users className="w-4 h-4"/> Presenti</button>
            <button onClick={() => setActiveSubTab('operazioni')} className={`px-8 py-5 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${activeSubTab === 'operazioni' ? 'bg-white border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><ClipboardList className="w-4 h-4"/> Accertamenti</button>
          </div>

          <div className="p-10 flex-1">
             {activeSubTab === 'dati' && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metodo Invio Convocazione</label>
                        <select className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" value={currentDoc.convocationMethod || ''} onChange={e => updateDoc('convocationMethod', e.target.value)}><option value="PEC">PEC</option><option value="E-mail">E-mail</option><option value="Brevi vie">Brevi vie</option></select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Invio Nota</label>
                        <input type="date" className="w-full p-4 border rounded-2xl bg-slate-50" value={currentDoc.convocationDate || ''} onChange={e => updateDoc('convocationDate', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Effettiva Visita</label>
                        <input type="date" className="w-full p-4 border rounded-2xl bg-slate-50 font-bold" value={currentDoc.date} onChange={e => updateDoc('date', e.target.value)} />
                    </div>
               </div>
             )}

             {activeSubTab === 'presenti' && (
                <div className="space-y-8">
                    <div className="flex flex-wrap gap-3">
                        {subjects.map(s => (
                            <button key={s.label} onClick={() => toggleAttendee(`${s.title} ${s.label}`)} className={`px-5 py-3 rounded-2xl border text-xs font-bold transition-all ${(currentDoc.attendeesList || []).includes(`${s.title} ${s.label}`) ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200'}`}>
                                {s.label}
                            </button>
                        ))}
                    </div>
                    <textarea className="w-full p-6 border rounded-3xl h-48 text-sm font-medium bg-slate-50/50" value={currentDoc.attendees} onChange={e => updateDoc('attendees', e.target.value)} placeholder="Dettaglio presenti per il verbale..." />
                </div>
             )}

             {activeSubTab === 'operazioni' && (
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Lavorazioni Accertate (Una per riga)</label>
                        <textarea className="w-full p-4 border rounded-2xl text-sm h-32 bg-slate-50" value={currentDoc.worksExecuted.join('\n')} onChange={e => updateDoc('worksExecuted', e.target.value.split('\n'))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <textarea className="w-full p-4 border rounded-2xl text-sm h-32 bg-amber-50/20" value={currentDoc.worksInProgress || ''} onChange={e => updateDoc('worksInProgress', e.target.value)} placeholder="Opere in corso..." />
                        <textarea className="w-full p-4 border rounded-2xl text-sm h-32 bg-green-50/20" value={currentDoc.upcomingWorks || ''} onChange={e => updateDoc('upcomingWorks', e.target.value)} placeholder="Attività programmate..." />
                    </div>
                    <textarea className="w-full p-4 border rounded-2xl text-sm h-32" value={currentDoc.observations || ''} onChange={e => updateDoc('observations', e.target.value)} placeholder="Osservazioni e disposizioni..." />
                </div>
             )}
          </div>
        </div>
      ) : (
          <div className="h-80 bg-white border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-300">
              <ClipboardList className="w-12 h-12 mb-4 opacity-20"/>
              <p className="font-bold uppercase tracking-widest text-xs">Seleziona o crea un nuovo atto</p>
          </div>
      )}
    </div>
  );
};
