
import React, { useState, useEffect } from 'react';
import { db, ExternalEvent } from '../db';
import { ProjectConstants, DocumentVariables } from '../types';
import { ClipboardList, Plus, Trash2, Calendar, LayoutGrid, Building, ArrowLeft, MoreHorizontal, Pencil } from 'lucide-react';

interface VisitSummaryProps {
    projects: ProjectConstants[];
    onBack: () => void;
}

export const VisitSummary: React.FC<VisitSummaryProps> = ({ projects, onBack }) => {
    const [allDocs, setAllDocs] = useState<DocumentVariables[]>([]);
    const [externalEvents, setExternalEvents] = useState<ExternalEvent[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newEvent, setNewEvent] = useState<Partial<ExternalEvent>>({
        projectName: '', entity: '', city: '', assignment: '', visitDates: [], type: 'visita'
    });

    useEffect(() => {
        loadData();
    }, [projects]);

    const loadData = async () => {
        const docs = await db.getAllDocuments();
        const externals = await db.getExternalEvents();
        setAllDocs(docs);
        setExternalEvents(externals);
    };

    const handleSaveExternal = async () => {
        if (!newEvent.entity || !newEvent.projectName) return;
        await db.saveExternalEvent({
            ...newEvent as ExternalEvent,
            id: editingId || crypto.randomUUID()
        });
        setNewEvent({ projectName: '', entity: '', city: '', assignment: '', visitDates: [], type: 'visita' });
        setEditingId(null);
        setShowModal(false);
        loadData();
    };

    const handleDeleteExternal = async (id: string) => {
        if (confirm("Eliminare definitivamente questo appalto dal riepilogo?")) {
            await db.deleteExternalEvent(id);
            loadData();
        }
    };

    // Uniamo i dati: priorità agli appalti in App (Dashboard)
    const rows = [
        ...projects.map(p => {
            const projectDocs = allDocs
                .filter(d => d.projectId === p.id)
                .sort((a, b) => a.visitNumber - b.visitNumber);
            return {
                id: p.id,
                entity: p.entity,
                city: p.location,
                projectName: p.projectName,
                assignment: p.subjects.testerAppointment.nominationType || 'Incarico in App',
                visitDates: projectDocs.map(d => d.date),
                isExternal: false
            };
        }),
        ...externalEvents.map(e => ({
            id: e.id,
            entity: e.entity,
            city: e.city,
            projectName: e.projectName,
            assignment: e.assignment,
            visitDates: e.visitDates || [],
            isExternal: true
        }))
    ];

    return (
        <div className="max-w-[98%] mx-auto p-6 animate-in fade-in">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600"/>
                </button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <ClipboardList className="w-8 h-8 text-blue-600"/> Riepilogo Appalti e Visite di Collaudo
                    </h1>
                    <p className="text-slate-500 text-sm">Monitoraggio centralizzato di tutti gli incarichi attivi.</p>
                </div>
                <button 
                    onClick={() => { setEditingId(null); setNewEvent({projectName:'', entity:'', city:'', assignment:'', visitDates:[], type:'visita'}); setShowModal(true); }}
                    className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-black transition-all"
                >
                    <Plus className="w-5 h-5"/> Aggiungi Altro Incarico
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1400px]">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <th className="p-4 border-r w-8 text-center">N.</th>
                                <th className="p-4 border-r w-56">Ente Committente</th>
                                <th className="p-4 border-r w-32">Città</th>
                                <th className="p-4 border-r w-72">Oggetto</th>
                                <th className="p-4 border-r w-48">Incarico</th>
                                {[...Array(12)].map((_, i) => (
                                    <th key={i} className="p-2 border-r text-center w-28">Visita {i+1}</th>
                                ))}
                                <th className="p-4 text-center w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px]">
                            {rows.sort((a, b) => a.entity.localeCompare(b.entity)).map((row, idx) => (
                                <tr key={idx} className={`hover:bg-blue-50/30 transition-colors ${row.isExternal ? 'bg-amber-50/10' : ''}`}>
                                    <td className="p-4 border-r text-center font-bold text-slate-400">{idx + 1}</td>
                                    <td className="p-4 border-r font-bold text-slate-800 uppercase leading-tight">{row.entity}</td>
                                    <td className="p-4 border-r font-medium text-slate-600">{row.city}</td>
                                    <td className="p-4 border-r">
                                        <div className="font-bold text-slate-700 line-clamp-2 leading-tight uppercase text-[10px]">{row.projectName}</div>
                                    </td>
                                    <td className="p-4 border-r italic text-slate-500 leading-tight">{row.assignment}</td>
                                    {[...Array(12)].map((_, i) => {
                                        const date = row.visitDates[i];
                                        return (
                                            <td key={i} className={`p-2 border-r text-center ${date ? 'bg-blue-50/50' : ''}`}>
                                                {date ? (
                                                    <span className="font-bold text-blue-700 whitespace-nowrap">
                                                        {new Date(date).toLocaleDateString('it-IT', {day:'2-digit', month:'2-digit', year:'numeric'})}
                                                    </span>
                                                ) : <span className="text-slate-200">-</span>}
                                            </td>
                                        );
                                    })}
                                    <td className="p-4 text-center">
                                        {row.isExternal && (
                                            <div className="flex flex-col gap-1">
                                                <button onClick={() => { setEditingId(row.id); setNewEvent(externalEvents.find(e => e.id === row.id) || {}); setShowModal(true); }} className="text-slate-400 hover:text-blue-600">
                                                    <Pencil className="w-3.5 h-3.5"/>
                                                </button>
                                                <button onClick={() => handleDeleteExternal(row.id)} className="text-slate-400 hover:text-red-500">
                                                    <Trash2 className="w-3.5 h-3.5"/>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in zoom-in-95 duration-200">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-200">
                        <h3 className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-2">
                            {editingId ? 'Modifica Incarico Esterno' : 'Nuovo Incarico Esterno'}
                        </h3>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ente Committente</label>
                                <input type="text" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold uppercase" value={newEvent.entity} onChange={e => setNewEvent({...newEvent, entity: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Città</label>
                                <input type="text" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none" value={newEvent.city} onChange={e => setNewEvent({...newEvent, city: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Incarico</label>
                                <input type="text" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none" value={newEvent.assignment} onChange={e => setNewEvent({...newEvent, assignment: e.target.value})} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Oggetto Lavori</label>
                                <textarea className="w-full p-3 border border-slate-200 rounded-xl h-24 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" value={newEvent.projectName} onChange={e => setNewEvent({...newEvent, projectName: e.target.value})} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Date Sopralluoghi (YYYY-MM-DD, una per riga)</label>
                                <textarea 
                                    className="w-full p-3 border border-slate-200 rounded-xl h-32 focus:ring-2 focus:ring-blue-500/20 outline-none font-mono text-sm" 
                                    placeholder="2024-11-13&#10;2025-01-31"
                                    value={newEvent.visitDates?.join('\n')} 
                                    onChange={e => setNewEvent({...newEvent, visitDates: e.target.value.split('\n').filter(d => d.trim())})} 
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Annulla</button>
                            <button onClick={handleSaveExternal} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all">Salva</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
