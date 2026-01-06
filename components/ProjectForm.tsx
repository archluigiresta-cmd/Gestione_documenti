
import React from 'react';
import { Building, PencilRuler, MapPin, Hash, Info } from 'lucide-react';
import { ProjectConstants } from '../types';

interface ProjectFormProps {
    data: ProjectConstants;
    readOnly: boolean;
    handleChange: (path: string, value: any) => void;
    subTab: string;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ data, readOnly, handleChange, subTab }) => {
    return (
        <div className="max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4">
            {subTab === 'general' && (
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 space-y-10">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 border-b pb-4">
                        <Building className="text-blue-600 w-8 h-8"/> Dati Generali Appalto
                    </h2>
                    
                    <div className="space-y-8">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-widest flex items-center gap-2">
                                <Building className="w-3 h-3"/> Ente Appaltante
                            </label>
                            <input 
                                type="text" 
                                className="w-full p-4 border border-slate-300 rounded-xl text-lg font-bold bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                value={data.entity || ''} 
                                onChange={e => handleChange('entity', e.target.value)} 
                                placeholder="Esempio: PROVINCIA DI TARANTO"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-widest flex items-center gap-2">
                                <Info className="w-3 h-3"/> Oggetto dell'Intervento (Nome Progetto)
                            </label>
                            <textarea 
                                className="w-full p-4 border border-slate-300 rounded-xl text-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none h-40 transition-all" 
                                value={data.projectName || ''} 
                                onChange={e => handleChange('projectName', e.target.value)} 
                                placeholder="Descrizione completa dell'appalto..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-2">
                                    <MapPin className="w-3 h-3"/> Ubicazione
                                </label>
                                <input 
                                    type="text" 
                                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                                    value={data.location || ''} 
                                    onChange={e => handleChange('location', e.target.value)} 
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-2">
                                    <Hash className="w-3 h-3"/> CUP
                                </label>
                                <input 
                                    type="text" 
                                    className="w-full p-3 border border-slate-300 rounded-xl font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none" 
                                    value={data.cup || ''} 
                                    onChange={e => handleChange('cup', e.target.value)} 
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-2">
                                    <Hash className="w-3 h-3"/> CIG
                                </label>
                                <input 
                                    type="text" 
                                    className="w-full p-3 border border-slate-300 rounded-xl font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none" 
                                    value={data.cig || ''} 
                                    onChange={e => handleChange('cig', e.target.value)} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {subTab === 'design' && (
                 <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8">
                    <h3 className="text-xl font-bold border-b pb-4 flex items-center gap-2 text-slate-800"><PencilRuler className="text-blue-600"/> Progettazione</h3>
                    <p className="text-slate-500 italic">Dati tecnici sui livelli di progettazione in corso di aggiornamento...</p>
                 </div>
            )}
        </div>
    );
};
