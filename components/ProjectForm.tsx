
import React from 'react';
import { Stamp, Building, X, UserCircle, MapPin, Mail, Hash } from 'lucide-react';
import { ProjectConstants } from '../types';

interface ProjectFormProps {
    data: ProjectConstants;
    readOnly: boolean;
    handleChange: (path: string, value: any) => void;
    subTab: string;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ data, readOnly, handleChange, subTab }) => {
    return (
        <div className="space-y-6">
            {subTab === 'tester' && data.subjects.tester && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    
                    {/* ENTE DI APPARTENENZA (LOGO E NOME) */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                       <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                          <Building className="w-5 h-5 text-blue-500 bg-blue-50 p-1 rounded-full"/> Ente di Appartenenza (Solo per Nulla Osta)
                       </h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nome Completo Ente</label>
                                <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1" 
                                    placeholder="Es. COMUNE DI FRANCAVILLA FONTANA"
                                    value={data.subjects.tester.contact.colleagueEntityName || ''} onChange={e => handleChange('subjects.tester.contact.colleagueEntityName', e.target.value)} />
                            </div>
                            <div className="md:col-span-2 p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Logo Istituzionale</label>
                                        <p className="text-[10px] text-slate-500 italic">Apparirà in alto al centro nel Nulla Osta.</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {data.subjects.tester.contact.colleagueEntityLogo && (
                                            <img src={data.subjects.tester.contact.colleagueEntityLogo} alt="Logo" className="h-12 w-auto object-contain border bg-white p-1 rounded" />
                                        )}
                                        {!readOnly && (
                                            <label className="cursor-pointer bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700">
                                                {data.subjects.tester.contact.colleagueEntityLogo ? 'Cambia Logo' : 'Carica Logo'}
                                                <input type="file" className="hidden" accept="image/*" onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => handleChange('subjects.tester.contact.colleagueEntityLogo', reader.result as string);
                                                        reader.readAsDataURL(file);
                                                    }
                                                }} />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                       </div>
                    </div>

                    {/* ANAGRAFICA PROFESSIONALE (DATI PER FOOTER) */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                       <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                          <UserCircle className="w-5 h-5 text-blue-500 bg-blue-50 p-1 rounded-full"/> Anagrafica Professionale (Dati Piè di Pagina)
                       </h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           <div>
                               <label className="text-xs font-bold text-slate-500 uppercase">Titolo</label>
                               <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded mt-1" 
                                   value={data.subjects.tester.contact.title || ''} onChange={e => handleChange('subjects.tester.contact.title', e.target.value)} />
                           </div>
                           <div className="lg:col-span-2">
                               <label className="text-xs font-bold text-slate-500 uppercase">Nome e Cognome</label>
                               <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded mt-1 font-bold" 
                                   value={data.subjects.tester.contact.name || ''} onChange={e => handleChange('subjects.tester.contact.name', e.target.value)} />
                           </div>
                           <div className="lg:col-span-2">
                               <label className="text-xs font-bold text-slate-500 uppercase">Albo / Ordine</label>
                               <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded mt-1" placeholder="Es. Ordine degli Architetti di Taranto"
                                   value={data.subjects.tester.contact.professionalOrder || ''} onChange={e => handleChange('subjects.tester.contact.professionalOrder', e.target.value)} />
                           </div>
                           <div>
                               <label className="text-xs font-bold text-slate-500 uppercase">Numero Iscrizione</label>
                               <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded mt-1" 
                                   value={data.subjects.tester.contact.registrationNumber || ''} onChange={e => handleChange('subjects.tester.contact.registrationNumber', e.target.value)} />
                           </div>
                           <div className="lg:col-span-3">
                               <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><MapPin className="w-3 h-3"/> Indirizzo Professionale</label>
                               <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded mt-1" placeholder="Via/Piazza, CAP, Città"
                                   value={data.subjects.tester.contact.address || ''} onChange={e => handleChange('subjects.tester.contact.address', e.target.value)} />
                           </div>
                           <div className="lg:col-span-2">
                               <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Mail className="w-3 h-3"/> PEC</label>
                               <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded mt-1" 
                                   value={data.subjects.tester.contact.pec || ''} onChange={e => handleChange('subjects.tester.contact.pec', e.target.value)} />
                           </div>
                           <div>
                               <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">Telefono</label>
                               <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded mt-1" 
                                   value={data.subjects.tester.contact.phone || ''} onChange={e => handleChange('subjects.tester.contact.phone', e.target.value)} />
                           </div>
                       </div>
                    </div>

                    {/* ATTO DI NOMINA */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                       <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                          <Stamp className="w-5 h-5 text-blue-500 bg-blue-50 p-1 rounded-full"/> Atto di Nomina
                       </h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="md:col-span-2">
                               <label className="text-xs font-bold text-slate-500 uppercase">Tipo Atto e Autorità</label>
                               <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded mt-1" placeholder="Es. Determina Dirigenziale del Settore Tecnico"
                                      value={data.subjects.testerAppointment.nominationType} onChange={e => handleChange('subjects.testerAppointment.nominationType', e.target.value)} />
                           </div>
                           <div>
                               <label className="text-xs font-bold text-slate-500 uppercase">Numero</label>
                               <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded mt-1" 
                                      value={data.subjects.testerAppointment.nominationNumber} onChange={e => handleChange('subjects.testerAppointment.nominationNumber', e.target.value)} />
                           </div>
                           <div>
                               <label className="text-xs font-bold text-slate-500 uppercase">Data</label>
                               <input disabled={readOnly} type="date" className="w-full p-2 border border-slate-300 rounded mt-1" 
                                      value={data.subjects.testerAppointment.nominationDate} onChange={e => handleChange('subjects.testerAppointment.nominationDate', e.target.value)} />
                           </div>
                       </div>
                    </div>
                </div>
            )}
        </div>
    );
};
