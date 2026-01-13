
import React, { useState, useEffect } from 'react';
import { ProjectConstants, ContactInfo, SubjectProfile, AppointmentData, CompanyType, DesignerProfile, DesignPhaseData } from '../types';
import { Save, User, Users, Mail, ShieldCheck, MapPin, Plus, Trash2, FileText, Briefcase, Stamp, Building, PencilRuler, HardHat, FileSignature, Lock, FolderOpen, Copy, StickyNote, ChevronDown, ImagePlus, X, BriefcaseBusiness, Network, Hammer, Gavel, FileCheck2, UserCheck, ShieldAlert, PlusCircle, AtSign, Hash } from 'lucide-react';

const TITLES = ["Arch.", "Ing.", "Geom.", "Dott.", "Dott. Agr.", "Geol.", "Per. Ind.", "Sig."];

interface SubNavProps {
    items: { id: string, label: string, icon?: any }[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

const SubNav: React.FC<SubNavProps> = ({ items, activeTab, onTabChange }) => (
    <div className="flex border-b border-slate-200 mb-6 gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === item.id 
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}
        >
          {item.icon && <item.icon className="w-4 h-4" />}
          {item.label}
        </button>
      ))}
    </div>
);

interface DesignPhaseFieldsProps {
    data: DesignPhaseData | undefined;
    path: string;
    readOnly: boolean;
    onChange: (path: string, value: any) => void;
}

const DesignPhaseFields: React.FC<DesignPhaseFieldsProps> = ({ data, path, readOnly, onChange }) => {
    const d = data || {
        deliveryProtocol: '', deliveryDate: '', economicFramework: '',
        approvalType: '', approvalNumber: '', approvalDate: '', localFolderLink: ''
    } as DesignPhaseData;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Protocollo Consegna</label>
                    <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20" value={d.deliveryProtocol || ''} onChange={e => onChange(`${path}.deliveryProtocol`, e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Data Consegna</label>
                    <input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20" value={d.deliveryDate || ''} onChange={e => onChange(`${path}.deliveryDate`, e.target.value)} />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Quadro Economico (€)</label>
                    <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20" value={d.economicFramework || ''} onChange={e => onChange(`${path}.economicFramework`, e.target.value)} />
                </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><FileCheck2 className="w-4 h-4 text-blue-500"/> Atto di Approvazione Progetto</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo Atto</label>
                        <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded" value={d.approvalType || ''} onChange={e => onChange(`${path}.approvalType`, e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Numero</label>
                        <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded" value={d.approvalNumber || ''} onChange={e => onChange(`${path}.approvalNumber`, e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label>
                        <input disabled={readOnly} type="date" className="w-full p-2 border border-slate-300 rounded" value={d.approvalDate || ''} onChange={e => onChange(`${path}.approvalDate`, e.target.value)} />
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ContactCardProps {
    label: string;
    path: string;
    contact: ContactInfo | undefined;
    readOnly: boolean;
    onChange: (path: string, value: any) => void;
    showRepInfo?: boolean; 
    roleLabel?: string; 
    isCompany?: boolean;
}

const ContactCard: React.FC<ContactCardProps> = ({ 
    label, path, contact, readOnly, onChange,
    showRepInfo = false, roleLabel = "Ruolo / Titolo", isCompany = false
}) => {
    const c = contact || { name: '', title: '', pec: '', email: '', address: '', zip: '', city: '', province: '', professionalOrder: '', registrationNumber: '', vat: '', repName: '', repTitle: '', role: '' } as ContactInfo;
    const currentTitle = c.title || '';
    const isStandardTitle = TITLES.includes(currentTitle);
    const showCustomInput = !isStandardTitle && currentTitle !== '';

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-4 animate-in fade-in zoom-in-95 duration-300">
        <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-blue-500 bg-blue-50 p-1 rounded-full"/> {label}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nome / Ragione Sociale</label>
                <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100 font-semibold focus:ring-2 focus:ring-blue-500/20 outline-none" 
                    value={c.name || ''} onChange={e => onChange(`${path}.name`, e.target.value)} />
            </div>
            
            {!isCompany && (
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Titolo</label>
                    <div className="flex gap-2 mt-1">
                        <select 
                            disabled={readOnly}
                            className="flex-1 p-2.5 border border-slate-300 rounded-lg bg-white disabled:bg-slate-100 outline-none"
                            value={showCustomInput ? 'Altro' : currentTitle}
                            onChange={(e) => {
                                const val = e.target.value;
                                onChange(`${path}.title`, val === 'Altro' ? '' : val);
                            }}
                        >
                            <option value="">Seleziona...</option>
                            {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                            <option value="Altro">Altro...</option>
                        </select>
                        {showCustomInput && (
                            <input disabled={readOnly} type="text" placeholder="Specifica..." className="flex-1 p-2.5 border border-slate-300 rounded-lg" value={c.title || ''} onChange={e => onChange(`${path}.title`, e.target.value)} />
                        )}
                    </div>
                </div>
            )}

            <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">P.IVA / C.F.</label>
                <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100 font-mono" 
                    value={c.vat || ''} onChange={e => onChange(`${path}.vat`, e.target.value)} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:col-span-2">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1"><Mail className="w-3 h-3"/> PEC</label>
                    <input disabled={readOnly} type="email" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100 lowercase" 
                        value={c.pec || ''} onChange={e => onChange(`${path}.pec`, e.target.value)} placeholder="esempio@pec.it" />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1"><AtSign className="w-3 h-3"/> Email Ordinaria</label>
                    <input disabled={readOnly} type="email" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100 lowercase" 
                        value={c.email || ''} onChange={e => onChange(`${path}.email`, e.target.value)} placeholder="esempio@email.it" />
                </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-12 gap-3">
                <div className="col-span-12">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Indirizzo (Via/Piazza)</label>
                   <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                       value={c.address || ''} onChange={e => onChange(`${path}.address`, e.target.value)} />
                </div>
                <div className="col-span-3">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">CAP</label>
                   <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                       value={c.zip || ''} onChange={e => onChange(`${path}.zip`, e.target.value)} />
                </div>
                <div className="col-span-6">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Città</label>
                   <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                       value={c.city || ''} onChange={e => onChange(`${path}.city`, e.target.value)} />
                </div>
                <div className="col-span-3">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Prov.</label>
                   <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100 uppercase" 
                       value={c.province || ''} onChange={e => onChange(`${path}.province`, e.target.value)} />
                </div>
            </div>

            {!isCompany && (
                <>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Albo / Ordine</label>
                        <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                            value={c.professionalOrder || ''} onChange={e => onChange(`${path}.professionalOrder`, e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">N. Iscrizione</label>
                        <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                            value={c.registrationNumber || ''} onChange={e => onChange(`${path}.registrationNumber`, e.target.value)} />
                    </div>
                </>
            )}

            {showRepInfo && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 mt-2">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Rappresentante Legale (Nome)</label>
                        <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1" value={c.repName || ''} onChange={e => onChange(`${path}.repName`, e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Titolo Rappresentante (es. Sig.)</label>
                        <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1" value={c.repTitle || ''} onChange={e => onChange(`${path}.repTitle`, e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{roleLabel}</label>
                        <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1" value={c.role || ''} onChange={e => onChange(`${path}.role`, e.target.value)} />
                    </div>
                </div>
            )}
        </div>
        </div>
    );
};

interface TechnicalStaffListProps {
    label: string;
    staff: ContactInfo[];
    readOnly: boolean;
    onChange: (newStaff: ContactInfo[]) => void;
}

const TechnicalStaffList: React.FC<TechnicalStaffListProps> = ({ label, staff, readOnly, onChange }) => (
    <div className="md:col-span-2 bg-blue-50/50 p-5 rounded-xl border border-blue-100 shadow-inner">
        <p className="text-xs font-bold text-blue-800 uppercase mb-4 tracking-widest">{label}</p>
        {(staff || []).map((tech, tIdx) => (
            <div key={tIdx} className="flex gap-3 mb-3 animate-in slide-in-from-left-2 duration-200">
                <input 
                    disabled={readOnly}
                    type="text" 
                    placeholder="Nome e Qualifica Tecnico (es. Ing. Rossi - Progettista indicato)" 
                    className="flex-1 p-2.5 border border-blue-200 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-blue-500/20 outline-none" 
                    value={tech.name} 
                    onChange={e => {
                        const newList = [...staff];
                        newList[tIdx].name = e.target.value;
                        onChange(newList);
                    }} 
                />
                {!readOnly && (
                    <button 
                        onClick={() => {
                            const newList = [...staff];
                            newList.splice(tIdx, 1);
                            onChange(newList);
                        }} 
                        className="text-blue-400 hover:text-red-500 transition-colors p-2"
                    >
                        <X className="w-5 h-5"/>
                    </button>
                )}
            </div>
        ))}
        {!readOnly && (
            <button 
                onClick={() => onChange([...staff, { name: '' }])} 
                className="text-sm text-blue-700 font-bold hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all"
            >
                <PlusCircle className="w-4 h-4"/> Aggiungi Tecnico Incaricato
            </button>
        )}
    </div>
);

interface ProjectFormProps {
  data: ProjectConstants;
  onChange: (data: ProjectConstants) => void;
  section: 'general' | 'design' | 'subjects' | 'tender' | 'contractor';
  readOnly?: boolean; 
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ data, onChange, section, readOnly = false }) => {
  const getInitialSubTab = (sec: string) => {
    switch(sec) {
        case 'general': return 'info';
        case 'design': return 'docfap';
        case 'subjects': return 'rup';
        case 'tender': return 'minutes';
        case 'contractor': return 'main'; 
        default: return 'info';
    }
  };

  const [subTab, setSubTab] = useState<string>(getInitialSubTab(section));

  useEffect(() => {
    setSubTab(getInitialSubTab(section));
  }, [section]);

  const handleChange = (path: string, value: any) => {
    if (readOnly) return;
    const keys = path.split('.');
    const newData = { ...data };
    let current: any = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    onChange(newData);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => { handleChange('headerLogo', reader.result as string); };
        reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-800 capitalize">
              {section === 'general' ? 'Dati Generali' : section === 'design' ? 'Fase Progettazione' : section === 'subjects' ? 'Soggetti Responsabili' : section === 'tender' ? 'Fase di Gara' : 'Impresa Appaltatrice'}
          </h2>
          <div className="flex items-center gap-2">
             {readOnly ? (
                 <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-full border border-amber-100 flex items-center gap-1.5 font-bold shadow-sm">
                    <Lock className="w-3.5 h-3.5"/> Modalità Sola Lettura
                 </span>
             ) : (
                 <span className="text-xs text-green-600 bg-green-50 px-2.5 py-1.5 rounded-full border border-green-100 flex items-center gap-1.5 font-bold shadow-sm">
                    <Save className="w-3.5 h-3.5"/> Salvataggio Automatico
                 </span>
             )}
          </div>
      </div>

      {section === 'general' && (
        <>
            <SubNav activeTab={subTab} onTabChange={setSubTab} items={[
                { id: 'info', label: 'Inquadramento', icon: Building },
                { id: 'contract', label: 'Contratto', icon: Briefcase },
                { id: 'registration', label: 'Registrazione', icon: Stamp },
            ]} />
            {subTab === 'info' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <div className="p-5 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-between shadow-inner">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-slate-700">Logo Ente Appaltante</label>
                            <p className="text-xs text-slate-500">Immagine visualizzata nelle intestazioni ufficiali.</p>
                        </div>
                        <div className="flex items-center gap-6">
                            {data.headerLogo && (
                                <div className="h-14 border bg-white p-1 rounded-lg shadow-sm relative group">
                                    <img src={data.headerLogo} className="h-full w-auto" alt="logo" />
                                    <button onClick={() => handleChange('headerLogo', '')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3"/></button>
                                </div>
                            )}
                            {!readOnly && (
                                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20">
                                    <ImagePlus className="w-4 h-4"/> Carica Logo
                                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                </label>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-6">
                        <div className="col-span-3">
                            <label className="block text-sm font-semibold mb-2">Denominazione Ente</label>
                            <textarea 
                              disabled={readOnly} 
                              className="w-full p-4 border border-slate-300 rounded-lg uppercase font-bold min-h-[100px] focus:ring-2 focus:ring-blue-500/20 outline-none" 
                              value={data.entity || ''} 
                              onChange={e => handleChange('entity', e.target.value)} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Provincia</label>
                            <input disabled={readOnly} type="text" className="w-full p-4 border border-slate-300 rounded-lg uppercase font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" value={data.entityProvince || ''} onChange={e => handleChange('entityProvince', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">Oggetto dell'Intervento</label>
                        <textarea disabled={readOnly} className="w-full p-4 border border-slate-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500/20 outline-none leading-relaxed" value={data.projectName || ''} onChange={e => handleChange('projectName', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-4 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold mb-2">Luogo dei Lavori</label>
                            <input disabled={readOnly} type="text" className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" value={data.location || ''} onChange={e => handleChange('location', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-blue-500"/> CUP</label>
                            <input disabled={readOnly} type="text" className="w-full p-4 border border-slate-300 rounded-lg uppercase font-mono font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" value={data.cup || ''} onChange={e => handleChange('cup', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-blue-500"/> CIG</label>
                            <input disabled={readOnly} type="text" className="w-full p-4 border border-slate-300 rounded-lg uppercase font-mono font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" value={data.cig || ''} onChange={e => handleChange('cig', e.target.value)} />
                        </div>
                    </div>
                </div>
            )}
            {subTab === 'contract' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 grid grid-cols-2 gap-8 animate-in slide-in-from-right-4">
                    <div><label className="block text-sm font-semibold mb-2">Data Stipula Contratto</label><input disabled={readOnly} type="date" className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" value={data.contract?.date || ''} onChange={e => handleChange('contract.date', e.target.value)} /></div>
                    <div><label className="block text-sm font-semibold mb-2">N. Repertorio</label><input disabled={readOnly} type="text" className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" value={data.contract?.repNumber || ''} onChange={e => handleChange('contract.repNumber', e.target.value)} /></div>
                    <div><label className="block text-sm font-semibold mb-2">Importo Contrattuale Netto (€)</label><input disabled={readOnly} type="text" className="w-full p-4 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" value={data.contract?.totalAmount || ''} onChange={e => handleChange('contract.totalAmount', e.target.value)} /></div>
                    <div><label className="block text-sm font-semibold mb-2">Oneri per la Sicurezza (€)</label><input disabled={readOnly} type="text" className="w-full p-4 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" value={data.contract?.securityCosts || ''} onChange={e => handleChange('contract.securityCosts', e.target.value)} /></div>
                </div>
            )}
            {subTab === 'registration' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 grid grid-cols-2 gap-8 animate-in slide-in-from-right-4">
                    <div className="col-span-2">
                        <h3 className="font-bold text-slate-800 mb-2">Dati di Registrazione</h3>
                        <p className="text-sm text-slate-500 mb-4">Informazioni sull'atto depositato presso l'Ufficio delle Entrate.</p>
                    </div>
                    <div><label className="block text-sm font-semibold mb-2">Luogo di Registrazione</label><input disabled={readOnly} type="text" className="w-full p-4 border border-slate-300 rounded-lg" value={data.contract?.regPlace || ''} onChange={e => handleChange('contract.regPlace', e.target.value)} /></div>
                    <div><label className="block text-sm font-semibold mb-2">Data Registrazione</label><input disabled={readOnly} type="date" className="w-full p-4 border border-slate-300 rounded-lg" value={data.contract?.regDate || ''} onChange={e => handleChange('contract.regDate', e.target.value)} /></div>
                    <div><label className="block text-sm font-semibold mb-2">Numero Atto</label><input disabled={readOnly} type="text" className="w-full p-4 border border-slate-300 rounded-lg font-mono font-bold" value={data.contract?.regNumber || ''} onChange={e => handleChange('contract.regNumber', e.target.value)} /></div>
                    <div><label className="block text-sm font-semibold mb-2">Serie</label><input disabled={readOnly} type="text" className="w-full p-4 border border-slate-300 rounded-lg font-mono font-bold" value={data.contract?.regSeries || ''} onChange={e => handleChange('contract.regSeries', e.target.value)} /></div>
                </div>
            )}
        </>
      )}

      {section === 'design' && (
        <>
            <SubNav activeTab={subTab} onTabChange={setSubTab} items={[
                { id: 'docfap', label: 'DocFAP', icon: FileText },
                { id: 'dip', label: 'DIP', icon: FileText },
                { id: 'pfte', label: 'PFTE', icon: PencilRuler },
                { id: 'executive', label: 'Esecutivo', icon: Hammer },
            ]} />
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
                <DesignPhaseFields 
                    data={data.designPhase ? (data.designPhase as any)[subTab] : undefined} 
                    path={`designPhase.${subTab}`} 
                    readOnly={readOnly} 
                    onChange={handleChange} 
                />
            </div>
        </>
      )}

      {section === 'subjects' && (
        <>
            <SubNav activeTab={subTab} onTabChange={setSubTab} items={[
                { id: 'rup', label: 'RUP', icon: User },
                { id: 'designers', label: 'Progettisti', icon: PencilRuler },
                { id: 'csp', label: 'CSP', icon: ShieldCheck },
                { id: 'verifier', label: 'Verificatore', icon: UserCheck },
                { id: 'dl', label: 'D.L.', icon: HardHat },
                { id: 'dlOffice', label: 'Ufficio D.L.', icon: Users },
                { id: 'cse', label: 'CSE', icon: ShieldAlert },
                { id: 'tester', label: 'Collaudatore', icon: Stamp },
                { id: 'others', label: 'Altre Figure', icon: PlusCircle },
            ]} />
            
            {subTab === 'rup' && <ContactCard label="Responsabile Unico del Progetto" path="subjects.rup.contact" contact={data.subjects?.rup?.contact} readOnly={readOnly} onChange={handleChange} />}
            
            {subTab === 'designers' && (
                <div className="space-y-6">
                    {(data.subjects?.designers || []).map((designer, idx) => (
                        <div key={idx} className="relative group">
                             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-4">
                                <div className="flex justify-between items-center mb-6 border-b pb-3">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                        <PencilRuler className="w-5 h-5 text-blue-500"/> Progettista / RTP n. {idx+1}
                                    </h4>
                                    {!readOnly && <button onClick={() => {
                                        const list = [...(data.subjects?.designers || [])];
                                        list.splice(idx, 1);
                                        handleChange('subjects.designers', list);
                                    }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="flex items-center gap-3 cursor-pointer mb-2 bg-slate-50 p-3 rounded-lg border border-slate-100 w-fit pr-6 shadow-inner">
                                            <input type="checkbox" className="w-5 h-5 rounded text-blue-600" checked={designer.isLegalEntity} onChange={e => {
                                                const list = [...(data.subjects?.designers || [])];
                                                list[idx].isLegalEntity = e.target.checked;
                                                handleChange('subjects.designers', list);
                                            }} />
                                            <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">RTP / Società (Soggetto Affidatario)</span>
                                        </label>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Nome / Denominazione</label>
                                        <input type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 font-bold" value={designer.contact?.name || ''} onChange={e => {
                                            const list = [...(data.subjects?.designers || [])];
                                            list[idx].contact.name = e.target.value;
                                            handleChange('subjects.designers', list);
                                        }} />
                                    </div>
                                    
                                    {designer.isLegalEntity && (
                                        <TechnicalStaffList 
                                            label="Tecnici Incaricati (Professionisti RTP/Società)"
                                            staff={designer.operatingDesigners || []}
                                            readOnly={readOnly}
                                            onChange={(newList) => {
                                                const list = [...(data.subjects?.designers || [])];
                                                list[idx].operatingDesigners = newList;
                                                handleChange('subjects.designers', list);
                                            }}
                                        />
                                    )}
                                </div>
                             </div>
                        </div>
                    ))}
                    {!readOnly && <button onClick={() => handleChange('subjects.designers', [...(data.subjects?.designers || []), { contact: { name: '' }, isLegalEntity: false, operatingDesigners: [], appointment: {type:'', number:'', date:''}, designLevels:[], roles:[] }])} className="w-full py-6 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 hover:border-blue-300 transition-all flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs"><PlusCircle className="w-6 h-6"/> Aggiungi Nuova Anagrafica Progettista</button>}
                </div>
            )}

            {subTab === 'csp' && <ContactCard label="Coordinatore Sicurezza Progettazione (CSP)" path="subjects.csp.contact" contact={data.subjects?.csp?.contact} readOnly={readOnly} onChange={handleChange} />}
            {subTab === 'verifier' && <ContactCard label="Verificatore del Progetto" path="subjects.verifier.contact" contact={data.subjects?.verifier?.contact} readOnly={readOnly} onChange={handleChange} />}
            
            {subTab === 'dl' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-6 mb-4">
                        <label className="flex items-center gap-3 cursor-pointer bg-slate-50 p-4 rounded-xl border border-slate-100 flex-1 shadow-inner group">
                            <input disabled={readOnly} type="checkbox" className="w-6 h-6 rounded text-blue-600 border-slate-300" 
                                checked={data.subjects?.dl?.isLegalEntity || false} 
                                onChange={e => handleChange('subjects.dl.isLegalEntity', e.target.checked)} 
                            />
                            <div>
                                <span className="text-sm font-bold text-slate-800 uppercase block">Affidamento a RTP / Società</span>
                                <span className="text-xs text-slate-500">Spunta se la Direzione Lavori è affidata ad una persona giuridica.</span>
                            </div>
                        </label>
                    </div>

                    <ContactCard 
                        label={data.subjects?.dl?.isLegalEntity ? "Denominazione RTP / Società Direzione Lavori" : "Direttore dei Lavori"} 
                        path="subjects.dl.contact" 
                        contact={data.subjects?.dl?.contact} 
                        readOnly={readOnly} 
                        onChange={handleChange} 
                        isCompany={data.subjects?.dl?.isLegalEntity} 
                        showRepInfo={data.subjects?.dl?.isLegalEntity} 
                    />

                    {data.subjects?.dl?.isLegalEntity && (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <TechnicalStaffList 
                                label="Professionisti Incaricati dalla Società/RTP (es. Direttore Lavori indicato)"
                                staff={data.subjects?.dl?.operatingDesigners || []}
                                readOnly={readOnly}
                                onChange={(newList) => handleChange('subjects.dl.operatingDesigners', newList)}
                            />
                        </div>
                    )}
                </div>
            )}
            
            {subTab === 'dlOffice' && (
                <div className="space-y-4">
                    {(data.subjects?.dlOffice || []).map((member, idx) => (
                        <div key={idx} className="relative group">
                            <ContactCard label={`Componente Ufficio Direzione Lavori n. ${idx+1}`} path={`subjects.dlOffice.${idx}.contact`} contact={member.contact} readOnly={readOnly} onChange={handleChange} showRepInfo={true} roleLabel="Qualifica Professionale (es. Ispettore, Assistente...)" />
                            {!readOnly && <button onClick={() => {
                                const list = [...(data.subjects?.dlOffice || [])];
                                list.splice(idx, 1);
                                handleChange('subjects.dlOffice', list);
                            }} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5"/></button>}
                        </div>
                    ))}
                    {!readOnly && <button onClick={() => handleChange('subjects.dlOffice', [...(data.subjects?.dlOffice || []), { contact: { name: '', role: '' }, appointment: {type:'', number:'', date:''} }])} className="w-full py-6 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 hover:bg-blue-50/50 hover:border-blue-300 transition-all flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs"><PlusCircle className="w-6 h-6"/> Aggiungi Membro Ufficio D.L.</button>}
                </div>
            )}

            {subTab === 'cse' && <ContactCard label="Coordinatore Sicurezza Esecuzione (CSE)" path="subjects.cse.contact" contact={data.subjects?.cse?.contact} readOnly={readOnly} onChange={handleChange} />}

            {subTab === 'tester' && (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                    <ContactCard label="Anagrafica Collaudatore" path="subjects.tester.contact" contact={data.subjects?.tester?.contact} readOnly={readOnly} onChange={handleChange} />
                    
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative">
                       <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3"><Stamp className="w-5 h-5 text-blue-500"/> Atto di Nomina del Collaudatore</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="md:col-span-2">
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Autorità Emanante (es. Commissario / Dirigente...)</label>
                               <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg mt-1 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" value={data.subjects?.testerAppointment?.nominationAuthority || ''} onChange={e => handleChange('subjects.testerAppointment.nominationAuthority', e.target.value)} />
                           </div>
                           <div>
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tipologia Atto (es. Decreto / Det. Dirigenziale)</label>
                               <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500/20 outline-none" value={data.subjects?.testerAppointment?.nominationType || ''} onChange={e => handleChange('subjects.testerAppointment.nominationType', e.target.value)} />
                           </div>
                           <div>
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Estremi Atto (Numero e Data)</label>
                               <div className="flex gap-3">
                                   <input disabled={readOnly} type="text" placeholder="N." className="w-1/3 p-3 border border-slate-300 rounded-lg mt-1 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" value={data.subjects?.testerAppointment?.nominationNumber || ''} onChange={e => handleChange('subjects.testerAppointment.nominationNumber', e.target.value)} />
                                   <input disabled={readOnly} type="date" className="w-2/3 p-3 border border-slate-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500/20 outline-none" value={data.subjects?.testerAppointment?.nominationDate || ''} onChange={e => handleChange('subjects.testerAppointment.nominationDate', e.target.value)} />
                               </div>
                           </div>
                           <div className="md:col-span-2 bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner">
                               <p className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Ambito dell'Incarico (per testi automatici)</p>
                               <div className="flex flex-wrap gap-8">
                                   <label className="flex items-center gap-3 cursor-pointer group"><input disabled={readOnly} type="checkbox" className="w-5 h-5 text-blue-600 rounded" checked={data.subjects?.testerAppointment?.isAdmin || false} onChange={e => handleChange('subjects.testerAppointment.isAdmin', e.target.checked)} /> <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Tecnico-Amministrativo</span></label>
                                   <label className="flex items-center gap-3 cursor-pointer group"><input disabled={readOnly} type="checkbox" className="w-5 h-5 text-blue-600 rounded" checked={data.subjects?.testerAppointment?.isStatic || false} onChange={e => handleChange('subjects.testerAppointment.isStatic', e.target.checked)} /> <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Statico</span></label>
                                   <label className="flex items-center gap-3 cursor-pointer group"><input disabled={readOnly} type="checkbox" className="w-5 h-5 text-blue-600 rounded" checked={data.subjects?.testerAppointment?.isFunctional || false} onChange={e => handleChange('subjects.testerAppointment.isFunctional', e.target.checked)} /> <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Funzionale</span></label>
                               </div>
                           </div>
                           <div>
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Repertorio Convenzione</label>
                               <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg mt-1 font-mono focus:ring-2 focus:ring-blue-500/20 outline-none" value={data.subjects?.testerAppointment?.contractRepNumber || ''} onChange={e => handleChange('subjects.testerAppointment.contractRepNumber', e.target.value)} />
                           </div>
                           <div>
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Data Convenzione</label>
                               <input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500/20 outline-none" value={data.subjects?.testerAppointment?.contractDate || ''} onChange={e => handleChange('subjects.testerAppointment.contractDate', e.target.value)} />
                           </div>
                       </div>
                    </div>
                </div>
            )}

            {subTab === 'others' && (
                <div className="space-y-6">
                    {(data.subjects?.others || []).map((other, idx) => (
                        <div key={idx} className="relative group">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-4">
                                <div className="flex justify-between items-center mb-6 border-b pb-3">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                        <PlusCircle className="w-5 h-5 text-blue-500"/> Soggetto / Ente Interessato n. {idx+1}
                                    </h4>
                                    {!readOnly && <button onClick={() => {
                                        const list = [...(data.subjects?.others || [])];
                                        list.splice(idx, 1);
                                        handleChange('subjects.others', list);
                                    }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>}
                                </div>
                                <div className="mb-6">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Qualifica dell'Ente (es. Soprintendenza, Genio Civile...)</label>
                                    <input 
                                        disabled={readOnly} 
                                        type="text" 
                                        className="w-full p-3 border border-slate-300 rounded-lg mt-1 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" 
                                        value={other.contact?.role || ''} 
                                        onChange={e => {
                                            const list = [...(data.subjects?.others || [])];
                                            list[idx].contact.role = e.target.value;
                                            handleChange('subjects.others', list);
                                        }} 
                                        placeholder="Specifica il ruolo o il nome dell'Ente..."
                                    />
                                </div>
                                <ContactCard 
                                    label="Dettagli Anagrafici e di Contatto" 
                                    path={`subjects.others.${idx}.contact`} 
                                    contact={other.contact} 
                                    readOnly={readOnly} 
                                    onChange={handleChange} 
                                />
                            </div>
                        </div>
                    ))}
                    {!readOnly && <button onClick={() => handleChange('subjects.others', [...(data.subjects?.others || []), { contact: { name: '', role: '' }, appointment: { type: '', number: '', date: '' } }])} className="w-full py-6 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 hover:bg-blue-50/50 hover:border-blue-300 transition-all flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs"><PlusCircle className="w-6 h-6"/> Aggiungi Altra Figura o Ente Esterno</button>}
                </div>
            )}
        </>
      )}

      {section === 'tender' && (
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 space-y-10 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3"><Gavel className="w-6 h-6 text-blue-600 bg-blue-50 p-1 rounded-lg"/> Monitoraggio Fasi di Gara</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 shadow-inner">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Verbale di Verifica del Progetto (Data)</label>
                    <input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" value={data.tenderPhase?.verificationMinutesDate || ''} onChange={e => handleChange('tenderPhase.verificationMinutesDate', e.target.value)} />
                    <p className="text-[10px] text-slate-400 mt-2 italic uppercase">Verifica ai sensi dell'art. 42 del Codice Appalti.</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 shadow-inner">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Verbale di Validazione del Progetto (Data)</label>
                    <input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" value={data.tenderPhase?.validationMinutesDate || ''} onChange={e => handleChange('tenderPhase.validationMinutesDate', e.target.value)} />
                    <p className="text-[10px] text-slate-400 mt-2 italic uppercase">Validazione a supporto del R.U.P.</p>
                </div>
            </div>
        </div>
      )}

      {section === 'contractor' && (
        <>
            <SubNav activeTab={subTab} onTabChange={setSubTab} items={[
                { id: 'main', label: 'Capogruppo / Mandataria', icon: BriefcaseBusiness },
                { id: 'structure', label: data.contractor?.type === 'consortium' ? 'Imprese Consorziate' : 'Imprese Mandanti', icon: Network },
            ]} />
            {subTab === 'main' && (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 shadow-inner bg-slate-50/30">
                        {['single', 'ati', 'consortium'].map(t => (
                            <label key={t} className={`flex-1 min-w-[150px] flex items-center gap-4 p-5 rounded-xl border cursor-pointer transition-all ${data.contractor?.type === t ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                                <input disabled={readOnly} type="radio" className="w-5 h-5 accent-white" checked={data.contractor?.type === t} onChange={() => handleChange('contractor.type', t)} />
                                <span className="font-bold text-sm uppercase tracking-tight">{t === 'single' ? 'Impresa Singola' : t === 'ati' ? 'A.T.I. / R.T.I.' : 'Consorzio'}</span>
                            </label>
                        ))}
                    </div>
                    <ContactCard label="Dati Impresa Principale" path="contractor.mainCompany" contact={data.contractor?.mainCompany} readOnly={readOnly} onChange={handleChange} isCompany={true} showRepInfo={true} />
                </div>
            )}
            {subTab === 'structure' && data.contractor?.type !== 'single' && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    {(data.contractor?.type === 'ati' ? data.contractor?.mandants : data.contractor?.executors || []).map((comp, idx) => (
                        <div key={idx} className="relative group">
                            <ContactCard label={data.contractor?.type === 'ati' ? `Mandante n. ${idx+1}` : `Impresa Consorziata n. ${idx+1}`} path={data.contractor?.type === 'ati' ? `contractor.mandants.${idx}` : `contractor.executors.${idx}`} contact={comp} readOnly={readOnly} onChange={handleChange} isCompany={true} showRepInfo={true} />
                            {!readOnly && <button onClick={() => {
                                const field = data.contractor?.type === 'ati' ? 'mandants' : 'executors';
                                const list = [...(data.contractor ? (data.contractor as any)[field] : [])];
                                list.splice(idx, 1);
                                handleChange(`contractor.${field}`, list);
                            }} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 p-2 rounded-lg transition-colors"><Trash2 className="w-5 h-5"/></button>}
                        </div>
                    ))}
                    {!readOnly && <button onClick={() => {
                        const field = data.contractor?.type === 'ati' ? 'mandants' : 'executors';
                        handleChange(`contractor.${field}`, [...(data.contractor ? (data.contractor as any)[field] : []), { name: '' }]);
                    }} className="w-full py-8 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 hover:bg-blue-50/50 hover:border-blue-300 transition-all flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs"><PlusCircle className="w-6 h-6"/> Aggiungi Nuova Impresa al Gruppo</button>}
                </div>
            )}
        </>
      )}
    </div>
  );
};
