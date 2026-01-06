
import React, { useState } from 'react';
import { Building, MapPin, Hash, UserCircle, Plus, Trash2, PencilRuler, Gavel, HardHat, Info } from 'lucide-react';
import { ProjectConstants, DesignerProfile, ContactInfo } from '../types';

interface ProjectFormProps {
    data: ProjectConstants;
    readOnly: boolean;
    handleChange: (path: string, value: any) => void;
    subTab: string;
}

interface DesignerFormProps {
    designer: DesignerProfile;
    index: number;
    onUpdate: (v: DesignerProfile) => void;
    onRemove: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ data, readOnly, handleChange, subTab }) => {
    const [localTab, setLocalTab] = useState('0');

    const ContactCard = ({ title, prefix, value, onChange, isCompany = false }: { title: string, prefix: string, value: ContactInfo, onChange: (v: ContactInfo) => void, isCompany?: boolean }) => (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-700 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                <UserCircle className="w-4 h-4 text-blue-500" /> {title}
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!isCompany && (
                   <div className="md:col-span-2 flex gap-2">
                      <select className="p-2 border rounded text-sm w-24" value={value.title} onChange={e => onChange({...value, title: e.target.value})}>
                          <option value="Arch.">Arch.</option><option value="Ing.">Ing.</option><option value="Geom.">Geom.</option><option value="Dott.">Dott.</option><option value="Sig.">Sig.</option><option value="Altro">Altro</option>
                      </select>
                      <input type="text" className="flex-1 p-2 border rounded font-bold" placeholder="Nome e Cognome" value={value.name} onChange={e => onChange({...value, name: e.target.value})} />
                   </div>
                )}
                {isCompany && (
                   <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Ragione Sociale</label>
                      <input type="text" className="w-full p-2 border rounded font-bold" value={value.name} onChange={e => onChange({...value, name: e.target.value})} />
                   </div>
                )}
                <div><label className="text-[10px] font-bold text-slate-500 uppercase">Email / PEC</label><input type="text" className="w-full p-2 border rounded text-sm" value={value.pec} onChange={e => onChange({...value, pec: e.target.value})} /></div>
                <div><label className="text-[10px] font-bold text-slate-500 uppercase">Telefono</label><input type="text" className="w-full p-2 border rounded text-sm" value={value.phone} onChange={e => onChange({...value, phone: e.target.value})} /></div>
                <div className="md:col-span-2"><label className="text-[10px] font-bold text-slate-500 uppercase">Indirizzo Sede</label><input type="text" className="w-full p-2 border rounded text-sm" value={value.address} onChange={e => onChange({...value, address: e.target.value})} /></div>
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
                    <div className="grid grid-cols-1 gap-8">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-widest">Ente Appaltante</label>
                            <input type="text" className="w-full p-4 border rounded-xl text-lg font-bold bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" value={data.entity} onChange={e => handleChange('entity', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-widest">Oggetto dell'Intervento (Nome Progetto)</label>
                            <textarea className="w-full p-4 border rounded-xl text-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none h-32" value={data.projectName} onChange={e => handleChange('projectName', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Ubicazione</label><input type="text" className="w-full p-3 border rounded-xl" value={data.location} onChange={e => handleChange('location', e.target.value)} /></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">CUP</label><input type="text" className="w-full p-3 border rounded-xl font-mono" value={data.cup} onChange={e => handleChange('cup', e.target.value)} /></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">CIG</label><input type="text" className="w-full p-3 border rounded-xl font-mono" value={data.cig} onChange={e => handleChange('cig', e.target.value)} /></div>
                        </div>
                    </div>
                </div>
            )}

            {subTab === 'design' && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8">
                    <div className="flex p-1 bg-slate-100 rounded-lg mb-6">
                        {['DocFAP', 'DIP', 'PFTE', 'Esecutivo'].map((l, i) => (
                            <button key={l} onClick={() => setLocalTab(i.toString())} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${localTab === i.toString() ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>{l}</button>
                        ))}
                    </div>
                    {['docfap', 'dip', 'pfte', 'executive'].map((key, i) => i.toString() === localTab && (
                        <div key={key} className="space-y-6">
                            <h3 className="text-xl font-bold border-b pb-4 flex items-center gap-2"><PencilRuler className="text-blue-600"/> Dati Livello: {key.toUpperCase()}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div><label className="text-xs font-bold text-slate-500 uppercase">Prot. Consegna</label><input type="text" className="w-full p-2 border rounded" value={data.designPhase[key as keyof typeof data.designPhase].deliveryProtocol} onChange={e => handleChange(`designPhase.${key}.deliveryProtocol`, e.target.value)} /></div>
                                <div><label className="text-xs font-bold text-slate-500 uppercase">Data Consegna</label><input type="date" className="w-full p-2 border rounded" value={data.designPhase[key as keyof typeof data.designPhase].deliveryDate} onChange={e => handleChange(`designPhase.${key}.deliveryDate`, e.target.value)} /></div>
                                <div><label className="text-xs font-bold text-slate-500 uppercase">Importo Q.E. (€)</label><input type="text" className="w-full p-2 border rounded" value={data.designPhase[key as keyof typeof data.designPhase].economicFramework} onChange={e => handleChange(`designPhase.${key}.economicFramework`, e.target.value)} /></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
