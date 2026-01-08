
import React from 'react';
import { Building, Users, Briefcase, PencilRuler, ShieldCheck, MapPin, Hash, Info, Plus, Trash2 } from 'lucide-react';
import { ProjectConstants } from '../types';

interface ProjectFormProps {
    data: ProjectConstants;
    readOnly: boolean;
    handleChange: (path: string, value: any) => void;
    subTab: string;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ data, handleChange, subTab }) => {
    
    const getSafeVal = (path: string) => {
        const keys = path.split('.');
        let cur: any = data;
        for (const key of keys) {
            if (!cur || typeof cur !== 'object') return '';
            cur = cur[key];
        }
        return cur || '';
    };

    const InputField = ({ label, path, placeholder = '', type = 'text', textarea = false }: any) => (
        <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
            {textarea ? (
                <textarea 
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm h-24"
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

    const SubjectSection = ({ title, path, icon: Icon }: any) => (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h4 className="font-black text-blue-700 text-xs uppercase tracking-[0.2em] flex items-center gap-3 border-b border-blue-50 pb-4">
                <Icon className="w-4 h-4"/> {title}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Titolo e Nome Completo" path={`${path}.name`} placeholder="Arch. Mario Rossi" />
                <InputField label="Email / PEC Professionale" path={`${path}.pec`} placeholder="esempio@pec.it" />
                <InputField label="Indirizzo Studio" path={`${path}.address`} />
                <InputField label="Recapito Telefonico" path={`${path}.phone`} />
                <InputField label="Albo Professionale" path={`${path}.professionalOrder`} />
                <InputField label="Numero Iscrizione" path={`${path}.registrationNumber`} />
            </div>
        </div>
    );

    if (!data) return <div className="p-20 text-center text-slate-400 italic">Caricamento dati...</div>;

    return (
        <div className="pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {subTab === 'general' && (
                <div className="space-y-8">
                    <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 space-y-8">
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 border-b border-slate-50 pb-6">
                            <Building className="text-blue-600 w-8 h-8"/> Dati Generali Appalto
                        </h2>
                        <div className="grid grid-cols-1 gap-8">
                            <InputField label="Denominazione Ente Appaltante" path="entity" placeholder="Es. Provincia di Taranto" />
                            <InputField label="Oggetto Integrale dell'Intervento" path="projectName" textarea placeholder="Descrizione dell'appalto come da contratto..." />
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InputField label="Ubicazione Intervento" path="location" />
                                <InputField label="Codice CUP" path="cup" placeholder="G12345678900001" />
                                <InputField label="Codice CIG" path="cig" placeholder="Z123456789" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 space-y-8">
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 border-b border-slate-50 pb-6">
                            <Hash className="text-blue-600 w-6 h-6"/> Dati Contrattuali
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputField label="Rep. Contratto N." path="contract.repNumber" />
                            <InputField label="Data Contratto" path="contract.date" type="date" />
                            <InputField label="Importo Totale (€)" path="contract.totalAmount" />
                            <InputField label="Oneri Sicurezza (€)" path="contract.securityCosts" />
                            <InputField label="Durata Lavori (GG)" path="contract.durationDays" type="number" />
                            <InputField label="Luogo Registrazione" path="contract.regPlace" />
                        </div>
                    </div>
                </div>
            )}

            {subTab === 'subjects' && (
                <div className="space-y-8">
                    <SubjectSection title="R.U.P. (Responsabile Unico)" path="subjects.rup.contact" icon={Users} />
                    <SubjectSection title="D.L. (Direttore dei Lavori)" path="subjects.dl.contact" icon={PencilRuler} />
                    <SubjectSection title="C.S.E. (Coord. Sicurezza)" path="subjects.cse.contact" icon={ShieldCheck} />
                    <SubjectSection title="Collaudatore Incaricato" path="subjects.tester.contact" icon={Building} />
                </div>
            )}

            {subTab === 'design' && (
                <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 space-y-8">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 border-b border-slate-50 pb-6">
                        <PencilRuler className="text-blue-600 w-8 h-8"/> Livelli di Progettazione
                    </h2>
                    {['PFTE', 'Esecutivo'].map((level) => (
                        <div key={level} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                            <h4 className="font-bold text-slate-700 uppercase tracking-widest text-xs">{level}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InputField label="Approvazione (Tipo/N)" path={`designPhase.${level.toLowerCase()}.approvalNumber`} />
                                <InputField label="Data Approvazione" path={`designPhase.${level.toLowerCase()}.approvalDate`} type="date" />
                                <InputField label="Quadro Economico (€)" path={`designPhase.${level.toLowerCase()}.economicFramework`} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {subTab === 'contractor' && (
                <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 space-y-8">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 border-b border-slate-50 pb-6">
                        <Briefcase className="text-blue-600 w-8 h-8"/> Appaltatore / Impresa
                    </h2>
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Ragione Sociale Impresa" path="contractor.mainCompany.name" />
                            <InputField label="Sede Legale" path="contractor.mainCompany.address" />
                            <InputField label="Partita IVA / CF" path="contractor.mainCompany.vat" />
                            <InputField label="PEC Impresa" path="contractor.mainCompany.pec" />
                        </div>
                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4">
                            <h4 className="font-bold text-blue-800 text-xs uppercase tracking-widest">Legale Rappresentante</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InputField label="Titolo (Sig/Arch/Ing)" path="contractor.mainCompany.repTitle" />
                                <InputField label="Nome e Cognome" path="contractor.mainCompany.repName" />
                                <InputField label="Qualifica" path="contractor.mainCompany.repRole" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
