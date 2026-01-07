
import React from 'react';
import { Building, Users, Briefcase } from 'lucide-react';
import { ProjectConstants } from '../types';

interface ProjectFormProps {
    data: ProjectConstants;
    readOnly: boolean;
    handleChange: (path: string, value: any) => void;
    subTab: string;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ data, handleChange, subTab }) => {
    
    // Helper per estrarre valori annidati in sicurezza
    const getSafeVal = (path: string) => {
        const keys = path.split('.');
        let cur: any = data;
        for (const key of keys) {
            if (!cur || typeof cur !== 'object') return '';
            cur = cur[key];
        }
        return cur || '';
    };

    const SubjectField = ({ label, path }: { label: string, path: string }) => (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-blue-700 text-sm border-b border-blue-100 pb-2 uppercase tracking-wide">{label}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Titolo e Nome</label>
                    <input 
                        type="text" 
                        className="w-full p-2 text-sm border rounded bg-white" 
                        value={getSafeVal(`${path}.name`)} 
                        onChange={e => handleChange(`${path}.name`, e.target.value)} 
                        placeholder="Es. Arch. Mario Rossi" 
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">PEC / Email</label>
                    <input 
                        type="text" 
                        className="w-full p-2 text-sm border rounded bg-white" 
                        value={getSafeVal(`${path}.pec`)} 
                        onChange={e => handleChange(`${path}.pec`, e.target.value)} 
                    />
                </div>
            </div>
        </div>
    );

    if (!data) return <div className="p-10 text-center text-red-500">Errore: Dati progetto mancanti.</div>;

    return (
        <div className="pb-20 animate-in fade-in">
            {subTab === 'general' && (
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 space-y-8">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3 border-b pb-4">
                        <Building className="text-blue-600 w-6 h-6"/> Dati Generali Appalto
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Ente Appaltante</label>
                            <input type="text" className="w-full p-3 border rounded-xl font-bold bg-slate-50" value={data.entity || ''} onChange={e => handleChange('entity', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Oggetto dell'Intervento</label>
                            <textarea className="w-full p-3 border rounded-xl bg-slate-50 h-24" value={data.projectName || ''} onChange={e => handleChange('projectName', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="text-[10px] font-bold text-slate-500 uppercase">Ubicazione</label><input type="text" className="w-full p-2 border rounded-lg" value={data.location || ''} onChange={e => handleChange('location', e.target.value)} /></div>
                            <div><label className="text-[10px] font-bold text-slate-500 uppercase">CUP</label><input type="text" className="w-full p-2 border rounded-lg font-mono uppercase" value={data.cup || ''} onChange={e => handleChange('cup', e.target.value)} /></div>
                            <div><label className="text-[10px] font-bold text-slate-500 uppercase">CIG</label><input type="text" className="w-full p-2 border rounded-lg font-mono uppercase" value={data.cig || ''} onChange={e => handleChange('cig', e.target.value)} /></div>
                        </div>
                    </div>
                </div>
            )}

            {subTab === 'subjects' && (
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3 border-b pb-4">
                        <Users className="text-blue-600 w-6 h-6"/> Soggetti Coinvolti
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                        <SubjectField label="Responsabile Unico del Progetto (R.U.P.)" path="subjects.rup.contact" />
                        <SubjectField label="Direttore dei Lavori (D.L.)" path="subjects.dl.contact" />
                        <SubjectField label="Collaudatore" path="subjects.tester.contact" />
                    </div>
                </div>
            )}
        </div>
    );
};
