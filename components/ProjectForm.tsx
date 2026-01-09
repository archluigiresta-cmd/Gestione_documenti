
import React, { useState } from 'react';
import { 
  Building, Users, PencilRuler, Briefcase, Plus, Trash2, 
  FileText, Calendar, Euro, ShieldCheck, UserCheck, Gavel, HardHat
} from 'lucide-react';
import { ProjectConstants, SubjectProfile } from '../types';

interface ProjectFormProps {
    data: ProjectConstants;
    handleChange: (path: string, value: any) => void;
    subTab: string;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ data, handleChange, subTab }) => {
    const [activeDesignTab, setActiveDesignTab] = useState<'docfap' | 'dip' | 'pfte' | 'executive'>('docfap');
    const [selectedSubject, setSelectedSubject] = useState<string>('rup');

    const getSafeVal = (path: string) => {
        const keys = path.split('.');
        let cur: any = data;
        for (const key of keys) {
            if (!cur || typeof cur !== 'object') return '';
            cur = cur[key];
        }
        return cur || '';
    };

    const InputField = ({ label, path, type = 'text', placeholder = '', textarea = false }: any) => (
        <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
            {textarea ? (
                <textarea 
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                    value={getSafeVal(path)}
                    onChange={e => handleChange(path, e.target.value)}
                    placeholder={placeholder}
                />
            ) : (
                <input 
                    type={type}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                    value={getSafeVal(path)}
                    onChange={e => handleChange(path, e.target.value)}
                    placeholder={placeholder}
                />
            )}
        </div>
    );

    const SubjectCard = ({ title, path, icon: Icon }: any) => (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    <Icon className="text-blue-600 w-6 h-6"/> {title}
                </h3>
                <div className="bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Scheda Responsabile
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Dati Anagrafici</p>
                    <InputField label="Titolo e Nome Completo" path={`${path}.contact.name`} placeholder="Arch. Mario Rossi" />
                    <InputField label="Email / PEC Professionale" path={`${path}.contact.pec`} />
                    <InputField label="Albo / Ordine" path={`${path}.contact.professionalOrder`} />
                    <InputField label="N. Iscrizione" path={`${path}.contact.registrationNumber`} />
                </div>
                <div className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Provvedimento di Nomina</p>
                    <InputField label="Tipo Provvedimento" path={`${path}.appointment.type`} placeholder="Determina Dirigenziale" />
                    <InputField label="Numero" path={`${path}.appointment.number`} />
                    <InputField label="Data Provvedimento" path={`${path}.appointment.date`} type="date" />
                </div>
            </div>
        </div>
    );

    const DesignTabContent = ({ phase }: { phase: 'docfap' | 'dip' | 'pfte' | 'executive' }) => {
        const labels = {
            docfap: 'Documento fattibilità alternative progettuali',
            dip: 'Documento di indirizzo alla progettazione',
            pfte: 'Progetto di fattibilità tecnico economica',
            executive: 'Progetto Esecutivo'
        };
        return (
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 space-y-10 animate-in fade-in duration-500">
                <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                    <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg">
                        <FileText className="w-6 h-6"/>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 leading-tight">{labels[phase]}</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Dettagli Fase Progettuale</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Calendar className="w-3 h-3"/> Temporalità
                        </p>
                        <InputField label="Data Consegna Elaborati" path={`designPhases.${phase}.deliveryDate`} type="date" />
                    </div>
                    <div className="space-y-6">
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Euro className="w-3 h-3"/> Risorse
                        </p>
                        <InputField label="Quadro Economico (€)" path={`designPhases.${phase}.economicFramework`} placeholder="0,00" />
                    </div>
                    <div className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3"/> Approvazione
                        </p>
                        <InputField label="Tipo Provvedimento" path={`designPhases.${phase}.approvalType`} />
                        <InputField label="Numero" path={`designPhases.${phase}.approvalNumber`} />
                        <InputField label="Data Approvazione" path={`designPhases.${phase}.approvalDate`} type="date" />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {subTab === 'general' && (
                <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 space-y-10">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                        <Building className="text-blue-600 w-8 h-8"/> Anagrafica Appalto
                    </h2>
                    <div className="grid grid-cols-1 gap-8">
                        <InputField label="Ente Appaltante" path="entity" />
                        <InputField label="Oggetto dei Lavori" path="projectName" textarea />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputField label="Ubicazione" path="location" />
                            <InputField label="CUP" path="cup" />
                            <InputField label="CIG" path="cig" />
                        </div>
                    </div>
                </div>
            )}

            {subTab === 'design' && (
                <div className="space-y-8">
                    <div className="flex bg-slate-200/50 p-1.5 rounded-2xl gap-1 w-fit mx-auto shadow-inner border border-slate-200">
                        {(['docfap', 'dip', 'pfte', 'executive'] as const).map(t => (
                            <button 
                                key={t} 
                                onClick={() => setActiveDesignTab(t)}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                    activeDesignTab === t ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <DesignTabContent phase={activeDesignTab} />
                </div>
            )}

            {subTab === 'subjects' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 space-y-2">
                        <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Seleziona Figura</p>
                        {[
                            { id: 'rup', label: 'R.U.P.', icon: UserCheck },
                            { id: 'designers', label: 'Progettisti', icon: PencilRuler },
                            { id: 'csp', label: 'C.S.P.', icon: ShieldCheck },
                            { id: 'verifier', label: 'Verificatore', icon: UserCheck },
                            { id: 'dl', label: 'Direttore Lavori', icon: HardHat },
                            { id: 'dlOffice', label: 'Ufficio D.L.', icon: Users },
                            { id: 'cse', label: 'C.S.E.', icon: ShieldCheck },
                            { id: 'tester', label: 'Collaudatore', icon: Gavel }
                        ].map(s => (
                            <button
                                key={s.id}
                                onClick={() => setSelectedSubject(s.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                                    selectedSubject === s.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
                                }`}
                            >
                                <s.icon className="w-4 h-4"/> {s.label}
                            </button>
                        ))}
                    </div>
                    <div className="lg:col-span-3">
                        {selectedSubject === 'rup' && <SubjectCard title="Responsabile Unico del Progetto" path="subjects.rup" icon={UserCheck} />}
                        {selectedSubject === 'csp' && <SubjectCard title="Coordinatore Sicurezza (Progettazione)" path="subjects.csp" icon={ShieldCheck} />}
                        {selectedSubject === 'verifier' && <SubjectCard title="Verificatore Incaricato" path="subjects.verifier" icon={UserCheck} />}
                        {selectedSubject === 'dl' && <SubjectCard title="Direttore dei Lavori" path="subjects.dl" icon={HardHat} />}
                        {selectedSubject === 'cse' && <SubjectCard title="Coordinatore Sicurezza (Esecuzione)" path="subjects.cse" icon={ShieldCheck} />}
                        {selectedSubject === 'tester' && <SubjectCard title="Collaudatore Incaricato" path="subjects.tester" icon={Gavel} />}
                        
                        {selectedSubject === 'designers' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><PencilRuler className="text-blue-600"/> Gruppo di Progettazione</h3>
                                    <button 
                                        onClick={() => {
                                            const newList = [...data.subjects.designers, { contact: {}, appointment: {}, roleDescription: 'Progettista' }];
                                            handleChange('subjects.designers', newList);
                                        }}
                                        className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4"/> Aggiungi Progettista
                                    </button>
                                </div>
                                {data.subjects.designers.map((designer, idx) => (
                                    <div key={idx} className="relative group">
                                        <SubjectCard title={`${designer.roleDescription || 'Progettista'} ${idx + 1}`} path={`subjects.designers.${idx}`} icon={PencilRuler} />
                                        <div className="absolute top-8 right-32 flex gap-4">
                                            <select 
                                                className="bg-slate-100 border-none rounded-lg text-[10px] font-black uppercase p-2"
                                                value={designer.roleDescription}
                                                onChange={e => handleChange(`subjects.designers.${idx}.roleDescription`, e.target.value)}
                                            >
                                                <option value="Progettista Architettonico">Architettonico</option>
                                                <option value="Progettista Strutturale">Strutturale</option>
                                                <option value="Progettista Impiantistico">Impiantistico</option>
                                                <option value="Progettista Ambientale">Ambientale</option>
                                                <option value="Progettista Specialistico">Specialistico</option>
                                            </select>
                                            <button 
                                                onClick={() => {
                                                    const newList = data.subjects.designers.filter((_, i) => i !== idx);
                                                    handleChange('subjects.designers', newList);
                                                }}
                                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedSubject === 'dlOffice' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><Users className="text-blue-600"/> Ufficio della D.L.</h3>
                                    <button 
                                        onClick={() => {
                                            const newList = [...data.subjects.dlOffice, { contact: {}, appointment: {}, roleDescription: 'Assistente' }];
                                            handleChange('subjects.dlOffice', newList);
                                        }}
                                        className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4"/> Aggiungi Membro
                                    </button>
                                </div>
                                {data.subjects.dlOffice.map((member, idx) => (
                                    <div key={idx} className="relative group">
                                        <SubjectCard title={`Membro Ufficio DL ${idx + 1}`} path={`subjects.dlOffice.${idx}`} icon={Users} />
                                        <div className="absolute top-8 right-32 flex gap-4">
                                            <InputField label="Qualifica" path={`subjects.dlOffice.${idx}.roleDescription`} />
                                            <button 
                                                onClick={() => {
                                                    const newList = data.subjects.dlOffice.filter((_, i) => i !== idx);
                                                    handleChange('subjects.dlOffice', newList);
                                                }}
                                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {subTab === 'contractor' && (
                <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 space-y-10">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                        <Briefcase className="text-blue-600 w-8 h-8"/> Impresa Appaltatrice
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputField label="Ragione Sociale" path="contractor.name" />
                        <InputField label="Partita IVA / CF" path="contractor.vat" />
                        <InputField label="PEC" path="contractor.pec" />
                        <InputField label="Legale Rappresentante" path="contractor.repName" />
                    </div>
                </div>
            )}
        </div>
    );
};
