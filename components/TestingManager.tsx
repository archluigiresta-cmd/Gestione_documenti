
import React, { useState } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { 
  Plus, Trash2, Gavel, Mail, Users, 
  ClipboardList, Clock, Calendar, FileText, Send, UserCheck, Check
} from 'lucide-react';

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
  const [activeSubTab, setActiveSubTab] = useState('dati');
  const [selectedDocId, setSelectedDocId] = useState(documents.find(d => d.type === 'VERBALE_COLLAUDO')?.id || '');

  const currentDoc = documents.find(d => d.id === selectedDocId);

  const updateDoc = (field: keyof DocumentVariables, value: any) => {
    if (!currentDoc) return;
    onSaveDocument({ ...currentDoc, [field]: value });
  };

  // Elenco soggetti pronti per il flag
  const subjectsToFlag = [
    { id: 'rup', label: `RUP: ${project.subjects.rup.contact.name}`, title: project.subjects.rup.contact.title },
    { id: 'dl', label: `DL: ${project.subjects.dl.contact.name}`, title: project.subjects.dl.contact.title },
    { id: 'cse', label: `CSE: ${project.subjects.cse.contact.name}`, title: project.subjects.cse.contact.title },
    { id: 'impresa', label: `Impresa: ${project.contractor.repName}`, title: project.contractor.repTitle }
  ];

  const toggleAttendee = (label: string) => {
    if (!currentDoc) return;
    const currentList = currentDoc.attendeesList || [];
    const newList = currentList.includes(label) 
      ? currentList.filter(l => l !== label) 
      : [...currentList, label];
    
    onSaveDocument({ 
        ...currentDoc, 
        attendeesList: newList,
        attendees: newList.join(',\n') // Genera automaticamente il testo per la stampa
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><Gavel className="w-6 h-6"/></div>
          <div>
             <h2 className="text-xl font-bold text-slate-800">Sopralluoghi e Collaudi</h2>
             <select 
                className="mt-2 p-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-bold text-blue-700 outline-none"
                value={selectedDocId}
                onChange={e => setSelectedDocId(e.target.value)}
             >
                <option value="">-- Seleziona Verbale --</option>
                {documents.filter(d => d.type === 'VERBALE_COLLAUDO').map(d => (
                  <option key={d.id} value={d.id}>Verbale N. {d.visitNumber} del {new Date(d.date).toLocaleDateString()}</option>
                ))}
             </select>
          </div>
        </div>
        <button 
            onClick={() => onCreateDocument('VERBALE_COLLAUDO')}
            className="bg-slate-900 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all text-xs shadow-lg"
        >
            <Plus className="w-4 h-4"/> Nuovo Sopralluogo
        </button>
      </div>

      {currentDoc ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
          <div className="flex border-b border-slate-100 bg-slate-50/50">
                <button onClick={() => setActiveSubTab('dati')} className={`px-8 py-5 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${activeSubTab === 'dati' ? 'bg-white border-blue-600 text-blue-600' : 'text-slate-400'}`}><Clock className="w-4 h-4"/> Convocazione</button>
                <button onClick={() => setActiveSubTab('presenti')} className={`px-8 py-5 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${activeSubTab === 'presenti' ? 'bg-white border-blue-600 text-blue-600' : 'text-slate-400'}`}><Users className="w-4 h-4"/> Presenti</button>
                <button onClick={() => setActiveSubTab('operazioni')} className={`px-8 py-5 text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${activeSubTab === 'operazioni' ? 'bg-white border-blue-600 text-blue-600' : 'text-slate-400'}`}><ClipboardList className="w-4 h-4"/> Operazioni</button>
          </div>

          <div className="p-10 flex-1">
             {activeSubTab === 'dati' && (
               <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metodo Convocazione</label>
                            <select 
                                className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white outline-none font-bold text-slate-700"
                                value={currentDoc.convocationMethod || ''}
                                onChange={e => updateDoc('convocationMethod', e.target.value)}
                            >
                                <option value="PEC">PEC</option>
                                <option value="E-mail">E-mail</option>
                                <option value="Brevi vie">Comunicazione Brevi vie</option>
                                <option value="Ordine di Servizio">Ordine di Servizio</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Invio Nota</label>
                            <input type="date" className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50" value={currentDoc.convocationDate || ''} onChange={e => updateDoc('convocationDate', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">N. Visita</label>
                            <input type="number" className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50" value={currentDoc.visitNumber} onChange={e => updateDoc('visitNumber', parseInt(e.target.value))} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data del Sopralluogo</label>
                            <input type="date" className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 font-bold" value={currentDoc.date} onChange={e => updateDoc('date', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ora Inizio</label>
                            <input type="time" className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 font-bold" value={currentDoc.time} onChange={e => updateDoc('time', e.target.value)} />
                        </div>
                    </div>
               </div>
             )}

             {activeSubTab === 'presenti' && (
                <div className="space-y-10">
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><UserCheck className="w-4 h-4 text-blue-500"/> Seleziona i presenti all'incontro</h4>
                        <div className="flex flex-wrap gap-3">
                            {subjectsToFlag.map(s => (
                                <button 
                                    key={s.id}
                                    onClick={() => toggleAttendee(`${s.title} ${s.label}`)}
                                    className={`px-6 py-3 rounded-2xl border text-sm font-bold flex items-center gap-2 transition-all ${
                                        (currentDoc.attendeesList || []).includes(`${s.title} ${s.label}`)
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                            : 'bg-white text-slate-600 border-slate-100 hover:border-blue-200'
                                    }`}
                                >
                                    {(currentDoc.attendeesList || []).includes(`${s.title} ${s.label}`) ? <Check className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-100">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Anteprima Elenco (Modificabile manualmente)</label>
                        <textarea 
                            className="w-full p-6 border border-slate-200 rounded-3xl h-48 text-sm font-medium bg-slate-50/50 focus:bg-white outline-none transition-all"
                            value={currentDoc.attendees}
                            onChange={e => updateDoc('attendees', e.target.value)}
                        />
                    </div>
                </div>
             )}

             {activeSubTab === 'operazioni' && (
                <div className="space-y-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operazioni effettuate durante la visita</label>
                    <textarea 
                        className="w-full p-6 border border-slate-200 rounded-3xl h-80 text-sm bg-slate-50/50" 
                        placeholder="Descrivi le verifiche, i saggi e le operazioni svolte..."
                        value={currentDoc.observations} 
                        onChange={e => updateDoc('observations', e.target.value)} 
                    />
                </div>
             )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 py-32 flex flex-col items-center justify-center text-center">
           <FileText className="w-16 h-16 text-slate-200 mb-4"/>
           <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Nessun Sopralluogo</h3>
           <p className="text-slate-300 mt-2">Crea un nuovo verbale per iniziare a inserire i dati.</p>
        </div>
      )}
    </div>
  );
};
