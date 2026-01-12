
import React, { useState, useEffect } from 'react';
import { db, ExternalEvent } from '../db';
import { ProjectConstants, DocumentVariables } from '../types';
import { ClipboardList, Plus, Trash2, Calendar, Clock, Building, ArrowLeft } from 'lucide-react';

interface VisitSummaryProps {
    projects: ProjectConstants[];
    onBack: () => void;
}

export const VisitSummary: React.FC<VisitSummaryProps> = ({ projects, onBack }) => {
    const [allDocs, setAllDocs] = useState<DocumentVariables[]>([]);
    const [externalEvents, setExternalEvents] = useState<ExternalEvent[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newEvent, setNewEvent] = useState<Partial<ExternalEvent>>({
        projectName: '', visitNumber: 1, date: '', time: '10:00', type: 'visita'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const docs = await db.getAllDocuments();
        const externals = await db.getExternalEvents();
        setAllDocs(docs);
        setExternalEvents(externals);
    };

    const handleAddExternal = async () => {
        if (!newEvent.projectName || !newEvent.date) return;
        await db.saveExternalEvent({
            ...newEvent as ExternalEvent,
            id: crypto.randomUUID()
        });
        setNewEvent({ projectName: '', visitNumber: 1, date: '', time: '10:00', type: 'visita' });
        setShowModal(false);
        loadData();
    };

    const handleDeleteExternal = async (id: string) => {
        if (confirm("Eliminare questa registrazione?")) {
            await db.deleteExternalEvent(id);
            loadData();
        }
    };

    const combinedVisits = [
        ...allDocs.map(d => ({
            id: d.id,
            projectName: projects.find(p => p.id === d.projectId)?.projectName || 'Appalto sconosciuto',
            visitNumber: d.visitNumber,
            date: d.date,
            time: d.time,
            type: 'app',
            source: d
        })),
        ...externalEvents.map(e => ({
            id: e.id,
            projectName: e.projectName,
            visitNumber: e.visitNumber,
            date: e.date,
            time: e.time,
            type: 'external',
            source: e
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="max-w-7xl mx-auto p-8 animate-in fade-in">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600"/>
                </button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <ClipboardList className="w-8 h-8 text-blue-600"/> Riepilogo Visite di Collaudo
                    </h1>
                    <p className="text-slate-500">Cronologia completa di tutti i sopralluoghi effettuati.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:bg-blue-700"
                >
                    <Plus className="w-5 h-5"/> Aggiungi Visita Esterna
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500">Data / Ora</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500">Appalto</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 text-center">Visita N.</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500">Stato</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 text-right">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {combinedVisits.map((v, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-2 font-bold text-slate-800">
                                        <Calendar className="w-4 h-4 text-slate-400"/>
                                        {new Date(v.date).toLocaleDateString('it-IT')}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                        <Clock className="w-3 h-3"/> {v.time}
                                    </div>
                                </td>
                                <td className="p-4 font-medium text-slate-700">
                                    <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4 text-blue-400 shrink-0"/>
                                        <span className="line-clamp-1">{v.projectName}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className="bg-slate-100 px-3 py-1 rounded-full font-bold text-xs">
                                        {v.visitNumber}°
                                    </span>
                                </td>
                                <td className="p-4">
                                    {v.type === 'external' ? (
                                        <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Esterna</span>
                                    ) : (
                                        <span className="text-[10px] font-bold uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">A Sistema</span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    {v.type === 'external' && (
                                        <button onClick={() => handleDeleteExternal(v.id)} className="text-slate-400 hover:text-red-500 p-1">
                                            <Trash2 className="w-4 h-4"/>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-6">Nuova Visita (Appalto Esterno)</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Appalto</label>
                                <input type="text" className="w-full p-3 border border-slate-300 rounded-lg" value={newEvent.projectName} onChange={e => setNewEvent({...newEvent, projectName: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label>
                                    <input type="date" className="w-full p-3 border border-slate-300 rounded-lg" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Visita N.</label>
                                    <input type="number" className="w-full p-3 border border-slate-300 rounded-lg" value={newEvent.visitNumber} onChange={e => setNewEvent({...newEvent, visitNumber: parseInt(e.target.value)})} />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-lg">Annulla</button>
                            <button onClick={handleAddExternal} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700">Salva Visita</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
