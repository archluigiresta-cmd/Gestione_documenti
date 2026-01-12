
import React, { useState, useEffect } from 'react';
import { db, ExternalEvent } from '../db';
import { ProjectConstants, DocumentVariables } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ArrowLeft, Clock, Building } from 'lucide-react';

interface CalendarViewProps {
    projects: ProjectConstants[];
    onBack: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ projects, onBack }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        const docs = await db.getAllDocuments();
        const externals = await db.getExternalEvents();
        
        const mapped = [
            ...docs.map(d => ({
                id: d.id,
                title: projects.find(p => p.id === d.projectId)?.entity || 'Appalto',
                subTitle: `Visita ${d.visitNumber}°`,
                date: new Date(d.date),
                time: d.time || '10:00',
                type: 'app',
                color: 'bg-blue-600'
            })),
            ...externals.flatMap(e => (e.visitDates || []).map((date, idx) => ({
                id: `${e.id}-${idx}`,
                title: e.entity || 'Appalto Esterno',
                subTitle: `Visita ${idx + 1}°`,
                date: new Date(date),
                time: '10:00',
                type: 'external',
                color: 'bg-amber-500'
            })))
        ];
        setEvents(mapped);
    };

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => {
        const d = new Date(year, month, 1).getDay();
        return d === 0 ? 6 : d - 1; // Lunedì come primo giorno
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const startOffset = getFirstDayOfMonth(year, month);
    
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    const monthName = currentDate.toLocaleString('it-IT', { month: 'long' });

    return (
        <div className="max-w-7xl mx-auto p-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600"/>
                </button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-blue-600"/> Calendario Visite
                    </h1>
                    <p className="text-slate-500">Programmazione dei collaudi programmati ed effettuati.</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-3 hover:bg-slate-100 rounded-xl transition-colors"><ChevronLeft className="w-5 h-5"/></button>
                    <span className="font-bold uppercase text-sm min-w-[160px] text-center text-slate-700">{monthName} {year}</span>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-3 hover:bg-slate-100 rounded-xl transition-colors"><ChevronRight className="w-5 h-5"/></button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
                    {['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'].map(d => (
                        <div key={d} className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 border-collapse">
                    {days.map((day, idx) => {
                        const dayEvents = day ? events.filter(e => e.date.toDateString() === day.toDateString()) : [];
                        const isToday = day?.toDateString() === new Date().toDateString();

                        return (
                            <div key={idx} className={`min-h-[160px] p-2 border-r border-b border-slate-100 transition-all ${day ? 'bg-white' : 'bg-slate-50/40 opacity-50'}`}>
                                {day && (
                                    <>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-500/20' : 'text-slate-400'}`}>
                                                {day.getDate()}
                                            </span>
                                        </div>
                                        <div className="space-y-1.5 overflow-y-auto max-h-[110px] scrollbar-hide">
                                            {dayEvents.map((e, ei) => (
                                                <div key={ei} className={`${e.color} text-[10px] text-white p-2 rounded-lg font-bold truncate cursor-pointer shadow-sm hover:brightness-110 active:scale-95 transition-all border border-white/10`} title={`${e.title} - ${e.subTitle}`}>
                                                    <div className="flex items-center gap-1 mb-0.5 opacity-80">
                                                        <Clock className="w-2.5 h-2.5"/> {e.time}
                                                    </div>
                                                    <div className="truncate uppercase">{e.title}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div className="mt-8 flex gap-6 justify-center">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div> Visite in App (Fascicolo)
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div> Visite Esterne (Tabellare)
                </div>
            </div>
        </div>
    );
};
