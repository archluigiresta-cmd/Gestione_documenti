
import React, { useState } from 'react';
import { Stamp, Building, X, UserCircle, MapPin, Mail, Hash, Phone, Users, Plus, Trash2, PencilRuler, Gavel, HardHat, FileText, ClipboardList, Briefcase, Info, CheckSquare } from 'lucide-react';
import { ProjectConstants, DesignerProfile, ContactInfo, SubjectProfile } from '../types';

interface ProjectFormProps {
    data: ProjectConstants;
    readOnly: boolean;
    handleChange: (path: string, value: any) => void;
    subTab: string;
}

// Fix: Defining an explicit interface for DesignerForm props to resolve the 'key' property error and typing issues
interface DesignerFormProps {
    designer: DesignerProfile;
    index: number;
    onUpdate: (v: DesignerProfile) => void;
    onRemove: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ data, readOnly, handleChange, subTab }) => {
    const [localTab, setLocalTab] = useState('0');

    // Componente per Anagrafica Contatto
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
                {!isCompany && (
                   <>
                     <div><label className="text-[10px] font-bold text-slate-500 uppercase">Albo Professionale</label><input type="text" className="w-full p-2 border rounded text-sm" value={value.professionalOrder} onChange={e => onChange({...value, professionalOrder: e.target.value})} /></div>
                     <div><label className="text-[10px] font-bold text-slate-500 uppercase">N. Iscrizione</label><input type="text" className="w-full p-2 border rounded text-sm" value={value.registrationNumber} onChange={e => onChange({...value, registrationNumber: e.target.value})} /></div>
                   </>
                )}
                {isCompany && (
                   <div><label className="text-[10px] font-bold text-slate-500 uppercase">P.IVA / C.F.</label><input type="text" className="w-full p-2 border rounded text-sm" value={value.vat} onChange={e => onChange({...value, vat: e.target.value})} /></div>
                )}
            </div>
        </div>
    );

    // Fix: Explicitly typing DesignerForm as a React.FC with DesignerFormProps to handle the 'key' and prop types correctly
    const DesignerForm: React.FC<DesignerFormProps> = ({ designer, index, onUpdate, onRemove }) => (
        <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
                <h4 className="font-bold text-slate-800">Progettista n. {index + 1}</h4>
                <button onClick={onRemove} className="text-red-400 hover:text-red-600"><Trash2 className="w-5 h-5"/></button>
            </div>
            
            <div className="flex items-center gap-4 bg-blue-50 p-3 rounded-lg">
                <span className="text-xs font-bold text-blue-700 uppercase">Tipo Soggetto:</span>
                <label className="flex items-center gap-2 text-sm"><input type="radio" checked={!designer.isLegalEntity} onChange={() => onUpdate({...designer, isLegalEntity: false})} /> Libero Professionista</label>
                <label className="flex items-center gap-2 text-sm"><input type="radio" checked={designer.isLegalEntity} onChange={() => onUpdate({...designer, isLegalEntity: true})} /> Società / RTP</label>
            </div>

            <ContactCard title={designer.isLegalEntity ? "Dati Società" : "Anagrafica Professionista"} prefix="" value={designer.contact} onChange={v => onUpdate({...designer, contact: v})} isCompany={designer.isLegalEntity} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h5 className="font-bold text-xs uppercase text-slate-500 mb-3">Livelli di Progettazione</h5>
                    <div className="grid grid-cols-2 gap-2">
                        {['DocFAP', 'DIP', 'PFTE', 'Esecutivo'].map(l => (
                           <label key={l} className="flex items-center gap-2 p-2 border rounded hover:bg-slate-50 text-sm">
                               <input type="checkbox" checked={designer.designLevels.includes(l)} onChange={e => {
                                   const next = e.target.checked ? [...designer.designLevels, l] : designer.designLevels.filter(x => x !== l);
                                   onUpdate({...designer, designLevels: next});
                               }} /> {l}
                           </label>
                        ))}
                    </div>
                </div>
                <div>
                    <h5 className="font-bold text-xs uppercase text-slate-500 mb-3">Incarichi Specifici</h5>
                    <div className="grid grid-cols-2 gap-2">
                        {['Architettonico', 'Strutturale', 'Impiantistico', 'Ambientale', 'Sicurezza'].map(r => (
                           <label key={r} className="flex items-center gap-2 p-2 border rounded hover:bg-slate-50 text-sm">
                               <input type="checkbox" checked={designer.roles.includes(r)} onChange={e => {
                                   const next = e.target.checked ? [...designer.roles, r] : designer.roles.filter(x => x !== r);
                                   onUpdate({...designer, roles: next});
                               }} /> {r}
                           </label>
                        ))}
                    </div>
                </div>
            </div>
            
            {designer.isLegalEntity && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <h5 className="font-bold text-amber-800 text-xs uppercase mb-3">Tecnici Operativi / Firmatari</h5>
                    <button onClick={() => onUpdate({...designer, operatingDesigners: [...designer.operatingDesigners, {name: '', title: 'Ing.'}]})} className="text-[10px] font-bold bg-white px-3 py-1 rounded border border-amber-200">+ Aggiungi Tecnico</button>
                    <div className="space-y-2 mt-3">
                        {designer.operatingDesigners.map((op, idx) => (
                           <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded shadow-sm">
                               <select className="p-1 border rounded text-xs" value={op.title} onChange={e => {
                                   const next = [...designer.operatingDesigners]; next[idx].title = e.target.value; onUpdate({...designer, operatingDesigners: next});
                               }}><option value="Arch.">Arch.</option><option value="Ing.">Ing.</option><option value="Geom.">Geom.</option></select>
                               <input type="text" className="flex-1 p-1 border rounded text-xs" placeholder="Nome Tecnico" value={op.name} onChange={e => {
                                   const next = [...designer.operatingDesigners]; next[idx].name = e.target.value; onUpdate({...designer, operatingDesigners: next});
                               }} />
                               <button onClick={() => {
                                   const next = [...designer.operatingDesigners]; next.splice(idx,1); onUpdate({...designer, operatingDesigners: next});
                               }} className="text-red-300"><X className="w-4 h-4"/></button>
                           </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 mb-8 overflow-x-auto no-scrollbar">
                {subTab === 'design' && ['DocFAP', 'DIP', 'PFTE', 'Esecutivo'].map((l, i) => (
                    <button key={l} onClick={() => setLocalTab(i.toString())} className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${localTab === i.toString() ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>{l}</button>
                ))}
                {subTab === 'subjects' && ['RUP', 'Progettisti', 'DL', 'Sicurezza', 'Collaudo'].map((l, i) => (
                    <button key={l} onClick={() => setLocalTab(i.toString())} className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${localTab === i.toString() ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>{l}</button>
                ))}
                {subTab === 'contractor' && ['Anagrafica', 'ATI / Mandanti', 'Subappalti'].map((l, i) => (
                    <button key={l} onClick={() => setLocalTab(i.toString())} className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${localTab === i.toString() ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>{l}</button>
                ))}
            </div>

            {subTab === 'design' && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8">
                   {/* Logica dinamica per caricare docfap, dip, pfte o executive in base a localTab */}
                   {['docfap', 'dip', 'pfte', 'executive'].map((key, i) => i.toString() === localTab && (
                      <div key={key} className="space-y-6">
                         <h3 className="text-xl font-bold border-b pb-4 flex items-center gap-2"><PencilRuler className="text-blue-600"/> Dati Livello: {key.toUpperCase()}</h3>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Prot. Consegna</label><input type="text" className="w-full p-2 border rounded" value={data.designPhase[key as keyof typeof data.designPhase].deliveryProtocol} onChange={e => handleChange(`designPhase.${key}.deliveryProtocol`, e.target.value)} /></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Data Consegna</label><input type="date" className="w-full p-2 border rounded" value={data.designPhase[key as keyof typeof data.designPhase].deliveryDate} onChange={e => handleChange(`designPhase.${key}.deliveryDate`, e.target.value)} /></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Importo Q.E. (€)</label><input type="text" className="w-full p-2 border rounded" value={data.designPhase[key as keyof typeof data.designPhase].economicFramework} onChange={e => handleChange(`designPhase.${key}.economicFramework`, e.target.value)} /></div>
                            <div className="md:col-span-3 pt-4 border-t"><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Link Cartella Locale Progetto</label><input type="text" className="w-full p-2 border rounded font-mono text-xs bg-slate-50" placeholder="C:\Progetti\..." value={data.designPhase[key as keyof typeof data.designPhase].localFolderLink} onChange={e => handleChange(`designPhase.${key}.localFolderLink`, e.target.value)} /></div>
                         </div>
                      </div>
                   ))}
                </div>
            )}

            {subTab === 'subjects' && localTab === '1' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-800">Elenco Progettisti</h3>
                        <button onClick={() => handleChange('subjects.designers', [...data.subjects.designers, {contact: {name: '', title: 'Arch.'}, designLevels: [], roles: [], isLegalEntity: false, operatingDesigners: [], appointment: {type: 'Determina', number: '', date: ''}}])} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs">+ Aggiungi Progettista</button>
                    </div>
                    {data.subjects.designers.map((d, i) => (
                        <DesignerForm key={i} designer={d} index={i} onUpdate={v => {
                            const next = [...data.subjects.designers]; next[i] = v; handleChange('subjects.designers', next);
                        }} onRemove={() => {
                            const next = [...data.subjects.designers]; next.splice(i,1); handleChange('subjects.designers', next);
                        }} />
                    ))}
                </div>
            )}

            {/* Aggiungere altri tab soggetti, impresa, ecc. seguendo la stessa logica di DesignerForm e ContactCard */}
        </div>
    );
};
