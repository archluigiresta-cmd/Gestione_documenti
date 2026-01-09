
import React, { useState } from 'react';
import { 
  Building, Users, PencilRuler, Briefcase, Plus, Trash2, 
  FileText, Calendar, Euro, ShieldCheck, UserCheck, Gavel, HardHat, Link as LinkIcon, StickyNote
} from 'lucide-react';
import { ProjectConstants, SubjectProfile } from '../types';

interface ProjectFormProps {
    data: ProjectConstants;
    handleChange: (path: string, value: any) => void;
    subTab: string;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ data, handleChange, subTab }) => {
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Dati Anagrafici e Professionali</p>
                    <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-1">
                             <InputField label="Titolo" path={`${path}.contact.title`} placeholder="Arch./Ing." />
                        </div>
                        <div className="col-span-3">
                             <InputField label="Nome Completo" path={`${path}.contact.name`} />
                        </div>
                    </div>
                    <InputField label="Codice Fiscale" path={`${path}.contact.cf`} />
                    <InputField label="Email / PEC" path={`${path}.contact.pec`} />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Albo / Ordine" path={`${path}.contact.professionalOrder`} />
                        <InputField label="N. Iscrizione" path={`${path}.contact.registrationNumber`} />
                    </div>
                </div>
                <div className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Provvedimento di Nomina</p>
                    <InputField label="Tipo Provvedimento" path={`${path}.appointment.type`} placeholder="Determina Dirigenziale" />
                    <InputField label="Autorità" path={`${path}.appointment.authority`} />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Numero" path={`${path}.appointment.number`} />
                        <InputField label="Data" path={`${path}.appointment.date`} type="date" />
                    </div>
                </div>
            </div>
        </div>
    );

    const DesignCard = ({ title, path }: { title: string, path: string }) => (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <PencilRuler className="w-4 h-4 text-blue-500"/> {title}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Atto Approvazione" path={`${path}.approvalType`} />
                <div className="grid grid-cols-2 gap-2">
                    <InputField label="N." path={`${path}.approvalNumber`} />
                    <InputField label="Data" path={`${path}.approvalDate`} type="date" />
                </div>
            </div>
            <div className="pt-2">
                <InputField label="Percorso Cartella Locale" path={`${path}.localFolderLink`} placeholder="C:\Progetti\..." />
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {subTab === 'general' && (
                <div className="space-y-8">
                    <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 space-y-10">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                            <Building className="text-blue-600 w-8 h-8"/> Anagrafica Appalto
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="md:col-span-3">
                                <InputField label="Ente Appaltante" path="entity" />
                            </div>
                            <div className="md:col-span-1">
                                <InputField label="Provincia" path="entityProvince" placeholder="Sigla (es: TA)" />
                            </div>
                        </div>
                        <InputField label="Oggetto dei Lavori" path="projectName" textarea />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputField label="Ubicazione (Comune)" path="location" />
                            <InputField label="CUP" path="cup" />
                            <InputField label="CIG" path="cig" />
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 space-y-10">
                        <h2 className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                            <FileText className="text-blue-600 w-6 h-6"/> Dati Contrattuali
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <InputField label="Contratto Rep. N." path="contract.repNumber" />
                            <InputField label="Data Contratto" path="contract.date" type="date" />
                            <InputField label="Importo Totale (€)" path="contract.totalAmount" />
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                        <h2 className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                            <StickyNote className="text-blue-600 w-6 h-6"/> Note Generali
                        </h2>
                        <p className="text-slate-400 text-sm italic">Queste note saranno visibili nel riepilogo della dashboard.</p>
                        <InputField label="Annotazioni sull'appalto" path="notes" textarea />
                    </div>
                </div>
            )}

            {subTab === 'design' && (
                <div className="space-y-8">
                    <DesignCard title="PFTE (Progetto di Fattibilità)" path="designPhases.pfte" />
                    <DesignCard title="Progetto Esecutivo" path="designPhases.executive" />
                </div>
            )}

            {subTab === 'subjects' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                     <div className="lg:col-span-1 space-y-2">
                        {[
                            { id: 'rup', label: 'R.U.P.', icon: UserCheck },
                            { id: 'dl', label: 'Direttore Lavori', icon: HardHat },
                            { id: 'cse', label: 'C.S.E.', icon: ShieldCheck },
                            { id: 'tester', label: 'Collaudatore', icon: Gavel }
                        ].map(s => (
                            <button key={s.id} onClick={() => setSelectedSubject(s.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${selectedSubject === s.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-100'}`}><s.icon className="w-4 h-4"/> {s.label}</button>
                        ))}
                    </div>
                    <div className="lg:col-span-3">
                         {selectedSubject === 'rup' && <SubjectCard title="R.U.P." path="subjects.rup" icon={UserCheck} />}
                         {selectedSubject === 'dl' && <SubjectCard title="Direttore dei Lavori" path="subjects.dl" icon={HardHat} />}
                         {selectedSubject === 'cse' && <SubjectCard title="C.S.E." path="subjects.cse" icon={ShieldCheck} />}
                         {selectedSubject === 'tester' && (
                             <div className="space-y-6">
                                <SubjectCard title="Collaudatore" path="subjects.tester" icon={Gavel} />
                                <div className="bg-slate-100 p-8 rounded-3xl border border-slate-200 space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Gavel className="w-4 h-4"/> Dettagli Incarico Professionali Collaudatore</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="Tipo Atto (Determina/Convenzione)" path="subjects.testerAppointment.nominationType" />
                                        <InputField label="Autorità Emettitrice" path="subjects.testerAppointment.nominationAuthority" />
                                        <InputField label="N. Atto" path="subjects.testerAppointment.nominationNumber" />
                                        <InputField label="Data Atto" path="subjects.testerAppointment.nominationDate" type="date" />
                                        <InputField label="Rep. N." path="subjects.testerAppointment.contractRepNumber" />
                                        <InputField label="Data Contr./Conv." path="subjects.testerAppointment.contractDate" type="date" />
                                        <InputField label="Prot. N." path="subjects.testerAppointment.protocolNumber" />
                                        <InputField label="Dirigente Responsabile" path="subjects.testerAppointment.departmentManager" />
                                    </div>
                                </div>
                             </div>
                         )}
                    </div>
                </div>
            )}
        </div>
    );
};
