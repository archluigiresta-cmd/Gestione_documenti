
import React from 'react';
import { Building, PencilRuler, MapPin, Hash, Info, Users, User, HardHat, Briefcase } from 'lucide-react';
import { ProjectConstants } from '../types';

interface ProjectFormProps {
    data: ProjectConstants;
    readOnly: boolean;
    handleChange: (path: string, value: any) => void;
    subTab: string;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ data, readOnly, handleChange, subTab }) => {
    
    const SubjectField = ({ label, path, values }: { label: string, path: string, values: any }) => (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-blue-700 text-sm border-b border-blue-100 pb-2">{label}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Titolo e Nome</label>
                    <input type="text" className="w-full p-2 text-sm border rounded bg-white" 
                        value={values.name || ''} onChange={e => handleChange(`${path}.name`, e.target.value)} placeholder="Es. Arch. Mario Rossi" />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">PEC / Email</label>
                    <input type="text" className="w-full p-2 text-sm border rounded bg-white" 
                        value={values.pec || ''} onChange={e => handleChange(`${path}.pec`, e.target.value)} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4">
            {subTab === 'general' && (
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 space-y-10">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 border-b pb-4">
                        <Building className="text-blue-600 w-8 h-8"/> Dati Generali Appalto
                    </h2>
                    <div className="space-y-8">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-widest">Ente Appaltante</label>
                            <input type="text" className="w-full p-4 border rounded-xl text-lg font-bold bg-slate-50" value={data.entity || ''} onChange={e => handleChange('entity', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-widest">Oggetto dell'Intervento</label>
                            <textarea className="w-full p-4 border rounded-xl text-lg bg-slate-50 h-32" value={data.projectName || ''} onChange={e => handleChange('projectName', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div><label className="text-[10px] font-bold text-slate-500 uppercase">Ubicazione</label><input type="text" className="w-full p-3 border rounded-xl" value={data.location || ''} onChange={e => handleChange('location', e.target.value)} /></div>
                            <div><label className="text-[10px] font-bold text-slate-500 uppercase">CUP</label><input type="text" className="w-full p-3 border rounded-xl font-mono uppercase" value={data.cup || ''} onChange={e => handleChange('cup', e.target.value)} /></div>
                            <div><label className="text-[10px] font-bold text-slate-500 uppercase">CIG</label><input type="text" className="w-full p-3 border rounded-xl font-mono uppercase" value={data.cig || ''} onChange={e => handleChange('cig', e.target.value)} /></div>
                        </div>
                    </div>
                </div>
            )}

            {subTab === 'subjects' && (
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 space-y-8">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 border-b pb-4">
                        <Users className="text-blue-600 w-8 h-8"/> Soggetti Coinvolti
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SubjectField label="Responsabile Unico del Progetto (R.U.P.)" path="subjects.rup.contact" values={data.subjects.rup.contact} />
                        <SubjectField label="Direttore dei Lavori (D.L.)" path="subjects.dl.contact" values={data.subjects.dl.contact} />
                        <SubjectField label="Coord. Sicurezza Esecuzione (C.S.E.)" path="subjects.cse.contact" values={data.subjects.cse.contact} />
                        <SubjectField label="Collaudatore" path="subjects.tester.contact" values={data.subjects.tester.contact} />
                    </div>
                </div>
            )}

            {subTab === 'design' && (
                 <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 space-y-8">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 border-b pb-4">
                        <PencilRuler className="text-blue-600 w-8 h-8"/> Livelli Progettuali
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-6 border rounded-2xl bg-slate-50">
                            <h4 className="font-bold text-sm mb-4">Progetto Esecutivo</h4>
                            <div className="space-y-4">
                                <div><label className="text-[10px] font-bold uppercase text-slate-400">Atto di Approvazione</label>
                                <input type="text" className="w-full p-2 border rounded" placeholder="Es. Determina n. 100" value={data.designPhase.executive.approvalType} onChange={e => handleChange('designPhase.executive.approvalType', e.target.value)} /></div>
                                <div><label className="text-[10px] font-bold uppercase text-slate-400">Data Approvazione</label>
                                <input type="date" className="w-full p-2 border rounded" value={data.designPhase.executive.approvalDate} onChange={e => handleChange('designPhase.executive.approvalDate', e.target.value)} /></div>
                            </div>
                        </div>
                    </div>
                 </div>
            )}

            {subTab === 'contractor' && (
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 space-y-8">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 border-b pb-4">
                        <Briefcase className="text-blue-600 w-8 h-8"/> Impresa Appaltatrice
                    </h2>
                    <div className="bg-slate-50 p-8 rounded-2xl border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Ragione Sociale</label>
                                <input type="text" className="w-full p-3 border rounded-xl" value={data.contractor.mainCompany.name} onChange={e => handleChange('contractor.mainCompany.name', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Legale Rappresentante</label>
                                <input type="text" className="w-full p-3 border rounded-xl" value={data.contractor.mainCompany.repName} onChange={e => handleChange('contractor.mainCompany.repName', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Sede Legale</label>
                                <input type="text" className="w-full p-3 border rounded-xl" value={data.contractor.mainCompany.address} onChange={e => handleChange('contractor.mainCompany.address', e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
