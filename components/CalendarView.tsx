
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { ProjectConstants, DocumentVariables, ExternalEvent } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

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
        // Fix: getExternalEvents and getAllDocuments are methods in updated db.ts
        const docs = await db.getAllDocuments();
        const externals = await db.getExternalEvents();
        
        const mapped = [
            ...docs.map(d => ({
                id: d.id,
                title: `${projects.find(p => p.id === d.projectId)?.projectName || 'Visita'} (${d.visitNumber}°)`,
                date: new Date(d.date),
                type: 'app',
                color: 'bg-blue-600'
            })),
            ...externals.map(e => ({
                id: e.id,
                title: `${e.projectName} (${e.visitNumber}°)`,
                date: new Date(e.date),
                type: 'external',
                color: 'bg-slate-500'
            }))
        ];
        setEvents(mapped);
    };

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const days = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    const monthName = currentDate.toLocaleString('it-IT', { month: 'long' });

    return (
        <div className="max-w-7xl mx-auto p-8 animate-in fade-in">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600"/>
                </button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-blue-600"/> Calendario Collaudi
                    </h1>
                    <p className="text-slate-500">Programmazione visite e scadenze.</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-5 h-5"/></button>
                    <span className="font-bold uppercase text-sm min-w-[120px] text-center">{monthName} {year}</span>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight className="w-5 h-5"/></button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
                    {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(d => (
                        <div key={d} className="p-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 border-collapse">
                    {days.map((day, idx) => {
                        const dayEvents = day ? events.filter(e => e.date.toDateString() === day.toDateString()) : [];
                        const isToday = day?.toDateString() === new Date().toDateString();

                        return (
                            <div key={idx} className={`min-h-[140px] p-2 border-r border-b border-slate-100 transition-colors ${day ? 'bg-white' : 'bg-slate-50/50'}`}>
                                {day && (
                                    <>
                                        <div className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-2 ${isToday ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
                                            {day.getDate()}
                                        </div>
                                        <div className="space-y-1">
                                            {dayEvents.map((e, ei) => (
                                                <div key={ei} className={`${e.color} text-[10px] text-white p-1 rounded font-bold truncate cursor-pointer shadow-sm hover:brightness-110`} title={e.title}>
                                                    {e.title}
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
        </div>
    );
};
