
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
    data: DesignPhaseData;
    path: string;
    readOnly: boolean;
    onChange: (path: string, value: any) => void;
}

const DesignPhaseFields: React.FC<DesignPhaseFieldsProps> = ({ data, path, readOnly, onChange }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Protocollo Consegna</label>
                <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg" value={data.deliveryProtocol || ''} onChange={e => onChange(`${path}.deliveryProtocol`, e.target.value)} />
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Data Consegna</label>
                <input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg" value={data.deliveryDate || ''} onChange={e => onChange(`${path}.deliveryDate`, e.target.value)} />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Quadro Economico (€)</label>
                <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg" value={data.economicFramework || ''} onChange={e => onChange(`${path}.economicFramework`, e.target.value)} />
            </div>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><FileCheck2 className="w-4 h-4 text-blue-500"/> Atto di Approvazione</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo Atto</label>
                    <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded" value={data.approvalType || ''} onChange={e => onChange(`${path}.approvalType`, e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Numero</label>
                    <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded" value={data.approvalNumber || ''} onChange={e => onChange(`${path}.approvalNumber`, e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label>
                    <input disabled={readOnly} type="date" className="w-full p-2 border border-slate-300 rounded" value={data.approvalDate || ''} onChange={e => onChange(`${path}.approvalDate`, e.target.value)} />
                </div>
            </div>
        </div>
    </div>
);

interface ContactCardProps {
    label: string;
    path: string;
    contact: ContactInfo;
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
    const currentTitle = contact.title || '';
    const isStandardTitle = TITLES.includes(currentTitle);
    const showCustomInput = !isStandardTitle && currentTitle !== '';

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-4">
        <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-blue-500 bg-blue-50 p-1 rounded-full"/> {label}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nome / Ragione Sociale</label>
                <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100 font-semibold" 
                    value={contact.name || ''} onChange={e => onChange(`${path}.name`, e.target.value)} />
            </div>
            
            {!isCompany && (
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Titolo</label>
                    <div className="flex gap-2 mt-1">
                        <select 
                            disabled={readOnly}
                            className="flex-1 p-2.5 border border-slate-300 rounded-lg bg-white disabled:bg-slate-100"
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
                            <input disabled={readOnly} type="text" placeholder="Specifica..." className="flex-1 p-2.5 border border-slate-300 rounded-lg" value={contact.title || ''} onChange={e => onChange(`${path}.title`, e.target.value)} />
                        )}
                    </div>
                </div>
            )}

            <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">P.IVA / C.F.</label>
                <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                    value={contact.vat || ''} onChange={e => onChange(`${path}.vat`, e.target.value)} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:col-span-2">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1"><Mail className="w-3 h-3"/> PEC</label>
                    <input disabled={readOnly} type="email" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100 lowercase" 
                        value={contact.pec || ''} onChange={e => onChange(`${path}.pec`, e.target.value)} placeholder="esempio@pec.it" />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1"><AtSign className="w-3 h-3"/> Email Ordinaria</label>
                    <input disabled={readOnly} type="email" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100 lowercase" 
                        value={contact.email || ''} onChange={e => onChange(`${path}.email`, e.target.value)} placeholder="esempio@email.it" />
                </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-12 gap-3">
                <div className="col-span-12">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Indirizzo (Via/Piazza)</label>
                   <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                       value={contact.address || ''} onChange={e => onChange(`${path}.address`, e.target.value)} />
                </div>
                <div className="col-span-3">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">CAP</label>
                   <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                       value={contact.zip || ''} onChange={e => onChange(`${path}.zip`, e.target.value)} />
                </div>
                <div className="col-span-6">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Città</label>
                   <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                       value={contact.city || ''} onChange={e => onChange(`${path}.city`, e.target.value)} />
                </div>
                <div className="col-span-3">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Prov.</label>
                   <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100 uppercase" 
                       value={contact.province || ''} onChange={e => onChange(`${path}.province`, e.target.value)} />
                </div>
            </div>

            {!isCompany && (
                <>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Albo / Ordine</label>
                        <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                            value={contact.professionalOrder || ''} onChange={e => onChange(`${path}.professionalOrder`, e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">N. Iscrizione</label>
                        <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                            value={contact.registrationNumber || ''} onChange={e => onChange(`${path}.registrationNumber`, e.target.value)} />
                    </div>
                </>
            )}

            {showRepInfo && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 mt-2">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Rappresentante Legale (Nome)</label>
                        <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1" value={contact.repName || ''} onChange={e => onChange(`${path}.repName`, e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Titolo Rappresentante (es. Sig.)</label>
                        <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1" value={contact.repTitle || ''} onChange={e => onChange(`${path}.repTitle`, e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{roleLabel}</label>
                        <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1" value={contact.role || ''} onChange={e => onChange(`${path}.role`, e.target.value)} />
                    </div>
                </div>
            )}
        </div>
        </div>
    );
};

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
        default: return 'default';
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
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-800 capitalize">
              {section === 'general' ? 'Dati Generali' : section === 'design' ? 'Progettazione' : section === 'subjects' ? 'Soggetti Responsabili' : section === 'tender' ? 'Fase di Gara' : 'Impresa Appaltatrice'}
          </h2>
          <div className="flex items-center gap-2">
             {readOnly ? <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 flex items-center gap-1"><Lock className="w-3 h-3"/> Solo Lettura</span> : <span className="text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100 flex items-center gap-1"><Save className="w-3 h-3"/> Auto-save</span>}
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
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
                    <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 flex items-center justify-between">
                        <div>
                            <label className="block text-sm font-bold text-slate-700">Logo Ente</label>
                            <p className="text-xs text-slate-500">Immagine per l'intestazione dei documenti.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {data.headerLogo && <div className="h-12 border bg-white p-1 rounded relative"><img src={data.headerLogo} className="h-full w-auto" /><button onClick={() => handleChange('headerLogo', '')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3"/></button></div>}
                            {!readOnly && <label className="cursor-pointer bg-white border border-slate-300 px-3 py-2 rounded text-sm font-medium flex items-center gap-2"><ImagePlus className="w-4 h-4"/> Carica...<input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} /></label>}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-6">
                        <div className="col-span-3">
                            <label className="block text-sm font-semibold mb-2">Ente Appaltante</label>
                            <textarea 
                              disabled={readOnly} 
                              className="w-full p-3 border border-slate-300 rounded-lg uppercase font-bold min-h-[120px]" 
                              value={data.entity || ''} 
                              onChange={e => handleChange('entity', e.target.value)} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Provincia</label>
                            <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg uppercase" value={data.entityProvince || ''} onChange={e => handleChange('entityProvince', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">Oggetto Lavori</label>
                        <textarea disabled={readOnly} className="w-full p-3 border border-slate-300 rounded-lg h-32" value={data.projectName || ''} onChange={e => handleChange('projectName', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-4 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold mb-2">Luogo</label>
                            <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg" value={data.location || ''} onChange={e => handleChange('location', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 flex items-center gap-1"><Hash className="w-3 h-3 text-blue-500"/> CUP</label>
                            <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg uppercase font-mono" value={data.cup || ''} onChange={e => handleChange('cup', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 flex items-center gap-1"><Hash className="w-3 h-3 text-blue-500"/> CIG</label>
                            <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg uppercase font-mono" value={data.cig || ''} onChange={e => handleChange('cig', e.target.value)} />
                        </div>
                    </div>
                </div>
            )}
            {subTab === 'contract' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 grid grid-cols-2 gap-6">
                    <div><label className="block text-sm font-semibold mb-2">Data Stipula</label><input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg" value={data.contract.date || ''} onChange={e => handleChange('contract.date', e.target.value)} /></div>
                    <div><label className="block text-sm font-semibold mb-2">Repertorio N.</label><input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg" value={data.contract.repNumber || ''} onChange={e => handleChange('contract.repNumber', e.target.value)} /></div>
                    <div><label className="block text-sm font-semibold mb-2">Importo Totale (€)</label><input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg" value={data.contract.totalAmount || ''} onChange={e => handleChange('contract.totalAmount', e.target.value)} /></div>
                    <div><label className="block text-sm font-semibold mb-2">Oneri Sicurezza (€)</label><input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg" value={data.contract.securityCosts || ''} onChange={e => handleChange('contract.securityCosts', e.target.value)} /></div>
                </div>
            )}
            {subTab === 'registration' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <h3 className="font-bold text-slate-800 mb-2">Dati Registrazione Contratto</h3>
                        <p className="text-xs text-slate-500 mb-4">Informazioni relative alla registrazione dell'atto presso l'Agenzia delle Entrate.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">Luogo Registrazione</label>
                        <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg" value={data.contract.regPlace || ''} onChange={e => handleChange('contract.regPlace', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">Data Registrazione</label>
                        <input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg" value={data.contract.regDate || ''} onChange={e => handleChange('contract.regDate', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">Numero Registrazione</label>
                        <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg" value={data.contract.regNumber || ''} onChange={e => handleChange('contract.regNumber', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">Serie</label>
                        <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg" value={data.contract.regSeries || ''} onChange={e => handleChange('contract.regSeries', e.target.value)} />
                    </div>
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
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <DesignPhaseFields data={data.designPhase[subTab as keyof typeof data.designPhase]} path={`designPhase.${subTab}`} readOnly={readOnly} onChange={handleChange} />
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
                { id: 'others', label: 'Altri', icon: PlusCircle },
            ]} />
            
            {subTab === 'rup' && <ContactCard label="Responsabile Unico del Progetto" path="subjects.rup.contact" contact={data.subjects.rup.contact} readOnly={readOnly} onChange={handleChange} />}
            
            {subTab === 'designers' && (
                <div className="space-y-6">
                    {(data.subjects.designers || []).map((designer, idx) => (
                        <div key={idx} className="relative group">
                             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-4">
                                <div className="flex justify-between items-center mb-6 border-b pb-3">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                        <PencilRuler className="w-5 h-5 text-blue-500"/> Progettista {idx+1}
                                    </h4>
                                    {!readOnly && <button onClick={() => {
                                        const list = [...data.subjects.designers];
                                        list.splice(idx, 1);
                                        handleChange('subjects.designers', list);
                                    }} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 className="w-4 h-4"/></button>}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="flex items-center gap-2 cursor-pointer mb-2">
                                            <input type="checkbox" checked={designer.isLegalEntity} onChange={e => {
                                                const list = [...data.subjects.designers];
                                                list[idx].isLegalEntity = e.target.checked;
                                                handleChange('subjects.designers', list);
                                            }} />
                                            <span className="text-sm font-bold text-slate-700">RTP / Società di Ingegneria (Entità Legale)</span>
                                        </label>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Ragione Sociale / Nome</label>
                                        <input type="text" className="w-full p-2 border border-slate-300 rounded mt-1" value={designer.contact.name || ''} onChange={e => {
                                            const list = [...data.subjects.designers];
                                            list[idx].contact.name = e.target.value;
                                            handleChange('subjects.designers', list);
                                        }} />
                                    </div>
                                    {designer.isLegalEntity && (
                                        <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg border">
                                            <p className="text-xs font-bold text-slate-500 uppercase mb-3">Tecnici Operativi / Incaricati</p>
                                            {(designer.operatingDesigners || []).map((op, oIdx) => (
                                                <div key={oIdx} className="flex gap-2 mb-2">
                                                    <input type="text" placeholder="Nome Tecnico" className="flex-1 p-2 border border-slate-300 rounded text-sm" value={op.name} onChange={e => {
                                                        const list = [...data.subjects.designers];
                                                        list[idx].operatingDesigners[oIdx].name = e.target.value;
                                                        handleChange('subjects.designers', list);
                                                    }} />
                                                    <button onClick={() => {
                                                        const list = [...data.subjects.designers];
                                                        list[idx].operatingDesigners.splice(oIdx, 1);
                                                        handleChange('subjects.designers', list);
                                                    }} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4"/></button>
                                                </div>
                                            ))}
                                            <button onClick={() => {
                                                const list = [...data.subjects.designers];
                                                list[idx].operatingDesigners = [...(list[idx].operatingDesigners || []), { name: '' }];
                                                handleChange('subjects.designers', list);
                                            }} className="text-xs text-blue-600 font-bold hover:underline">+ Aggiungi Tecnico</button>
                                        </div>
                                    )}
                                </div>
                             </div>
                        </div>
                    ))}
                    {!readOnly && <button onClick={() => handleChange('subjects.designers', [...(data.subjects.designers || []), { contact: { name: '' }, isLegalEntity: false, operatingDesigners: [] }])} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-2"><Plus className="w-5 h-5"/> Aggiungi Progettista / RTP</button>}
                </div>
            )}

            {subTab === 'csp' && <ContactCard label="Coordinatore Sicurezza Progettazione (CSP)" path="subjects.csp.contact" contact={data.subjects.csp.contact} readOnly={readOnly} onChange={handleChange} />}
            {subTab === 'verifier' && <ContactCard label="Soggetto Verificatore Progetto" path="subjects.verifier.contact" contact={data.subjects.verifier.contact} readOnly={readOnly} onChange={handleChange} />}
            {subTab === 'dl' && <ContactCard label="Direttore dei Lavori" path="subjects.dl.contact" contact={data.subjects.dl.contact} readOnly={readOnly} onChange={handleChange} isCompany={data.subjects.dl.isLegalEntity} showRepInfo={data.subjects.dl.isLegalEntity} />}
            
            {subTab === 'dlOffice' && (
                <div className="space-y-4">
                    {(data.subjects.dlOffice || []).map((member, idx) => (
                        <div key={idx} className="relative group">
                            <ContactCard label={`Membro Ufficio DL ${idx+1}`} path={`subjects.dlOffice.${idx}.contact`} contact={member.contact} readOnly={readOnly} onChange={handleChange} showRepInfo={true} roleLabel="Qualifica (es. Ispettore di Cantiere)" />
                            {!readOnly && <button onClick={() => {
                                const list = [...data.subjects.dlOffice];
                                list.splice(idx, 1);
                                handleChange('subjects.dlOffice', list);
                            }} className="absolute top-4 right-4 text-red-400 hover:text-red-600"><Trash2 className="w-5 h-5"/></button>}
                        </div>
                    ))}
                    {!readOnly && <button onClick={() => handleChange('subjects.dlOffice', [...(data.subjects.dlOffice || []), { contact: { name: '', role: '' } }])} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-2"><Plus className="w-5 h-5"/> Aggiungi Membro Ufficio DL</button>}
                </div>
            )}

            {subTab === 'cse' && <ContactCard label="Coordinatore Sicurezza Esecuzione (CSE)" path="subjects.cse.contact" contact={data.subjects.cse.contact} readOnly={readOnly} onChange={handleChange} />}

            {subTab === 'tester' && (
                <div className="space-y-6">
                    <ContactCard label="Anagrafica Collaudatore" path="subjects.tester.contact" contact={data.subjects.tester.contact} readOnly={readOnly} onChange={handleChange} />
                    
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                       <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-3"><Stamp className="w-5 h-5 text-blue-500"/> Nomina Collaudatore</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="md:col-span-2">
                               <label className="text-xs font-bold text-slate-500 uppercase">Soggetto Emittente Atto (es. Commissario Straordinario / Dirigente...)</label>
                               <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded mt-1" value={data.subjects.testerAppointment.nominationAuthority || ''} onChange={e => handleChange('subjects.testerAppointment.nominationAuthority', e.target.value)} />
                           </div>
                           <div>
                               <label className="text-xs font-bold text-slate-500 uppercase">Tipo Atto (es. Decreto / Determina Dirigenziale)</label>
                               <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded mt-1" value={data.subjects.testerAppointment.nominationType || ''} onChange={e => handleChange('subjects.testerAppointment.nominationType', e.target.value)} />
                           </div>
                           <div>
                               <label className="text-xs font-bold text-slate-500 uppercase">Numero e Data Atto</label>
                               <div className="flex gap-2">
                                   <input disabled={readOnly} type="text" placeholder="Num." className="w-1/2 p-2 border border-slate-300 rounded mt-1" value={data.subjects.testerAppointment.nominationNumber || ''} onChange={e => handleChange('subjects.testerAppointment.nominationNumber', e.target.value)} />
                                   <input disabled={readOnly} type="date" className="w-1/2 p-2 border border-slate-300 rounded mt-1" value={data.subjects.testerAppointment.nominationDate || ''} onChange={e => handleChange('subjects.testerAppointment.nominationDate', e.target.value)} />
                               </div>
                           </div>
                           <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                               <p className="text-xs font-bold text-slate-500 uppercase mb-3">Tipologia Incarico (per titolo verbale e premesse)</p>
                               <div className="flex gap-6">
                                   <label className="flex items-center gap-2 cursor-pointer"><input disabled={readOnly} type="checkbox" checked={data.subjects.testerAppointment.isAdmin} onChange={e => handleChange('subjects.testerAppointment.isAdmin', e.target.checked)} /> <span className="text-sm">Tecnico-Amministrativo</span></label>
                                   <label className="flex items-center gap-2 cursor-pointer"><input disabled={readOnly} type="checkbox" checked={data.subjects.testerAppointment.isStatic} onChange={e => handleChange('subjects.testerAppointment.isStatic', e.target.checked)} /> <span className="text-sm">Statico</span></label>
                                   <label className="flex items-center gap-2 cursor-pointer"><input disabled={readOnly} type="checkbox" checked={data.subjects.testerAppointment.isFunctional} onChange={e => handleChange('subjects.testerAppointment.isFunctional', e.target.checked)} /> <span className="text-sm">Funzionale</span></label>
                               </div>
                           </div>
                           <div>
                               <label className="text-xs font-bold text-slate-500 uppercase">Rep. Convenzione/Incarico</label>
                               <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded mt-1" value={data.subjects.testerAppointment.contractRepNumber || ''} onChange={e => handleChange('subjects.testerAppointment.contractRepNumber', e.target.value)} />
                           </div>
                           <div>
                               <label className="text-xs font-bold text-slate-500 uppercase">Data Convenzione</label>
                               <input disabled={readOnly} type="date" className="w-full p-2 border border-slate-300 rounded mt-1" value={data.subjects.testerAppointment.contractDate || ''} onChange={e => handleChange('subjects.testerAppointment.contractDate', e.target.value)} />
                           </div>
                       </div>
                    </div>
                </div>
            )}

            {subTab === 'others' && (
                <div className="space-y-6">
                    {(data.subjects.others || []).map((other, idx) => (
                        <div key={idx} className="relative group">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-4">
                                <div className="flex justify-between items-center mb-6 border-b pb-3">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                        <PlusCircle className="w-5 h-5 text-blue-500"/> Altra Figura / Ente Interessato {idx+1}
                                    </h4>
                                    {!readOnly && <button onClick={() => {
                                        const list = [...data.subjects.others];
                                        list.splice(idx, 1);
                                        handleChange('subjects.others', list);
                                    }} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 className="w-4 h-4"/></button>}
                                </div>
                                <div className="mb-6">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Chi è questa figura / Ente? (es. Soprintendenza, Consulente...)</label>
                                    <input 
                                        disabled={readOnly} 
                                        type="text" 
                                        className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 font-bold" 
                                        value={other.contact.role || ''} 
                                        onChange={e => {
                                            const list = [...data.subjects.others];
                                            list[idx].contact.role = e.target.value;
                                            handleChange('subjects.others', list);
                                        }} 
                                        placeholder="Inserisci descrizione ruolo..."
                                    />
                                </div>
                                <ContactCard 
                                    label="Dati di Contatto" 
                                    path={`subjects.others.${idx}.contact`} 
                                    contact={other.contact} 
                                    readOnly={readOnly} 
                                    onChange={handleChange} 
                                />
                            </div>
                        </div>
                    ))}
                    {!readOnly && <button onClick={() => handleChange('subjects.others', [...(data.subjects.others || []), { contact: { name: '', role: '' }, appointment: { type: '', number: '', date: '' } }])} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-2"><Plus className="w-5 h-5"/> Aggiungi Altra Figura / Ente</button>}
                </div>
            )}
        </>
      )}

      {section === 'tender' && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Gavel className="w-5 h-5 text-blue-500"/> Fasi di Gara</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-sm font-semibold mb-2">Verbale di Verifica Progetto (Data)</label>
                    <input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg" value={data.tenderPhase.verificationMinutesDate || ''} onChange={e => handleChange('tenderPhase.verificationMinutesDate', e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2">Verbale di Validazione Progetto (Data)</label>
                    <input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg" value={data.tenderPhase.validationMinutesDate || ''} onChange={e => handleChange('tenderPhase.validationMinutesDate', e.target.value)} />
                </div>
            </div>
        </div>
      )}

      {section === 'contractor' && (
        <>
            <SubNav activeTab={subTab} onTabChange={setSubTab} items={[
                { id: 'main', label: 'Capogruppo', icon: BriefcaseBusiness },
                { id: 'structure', label: data.contractor.type === 'consortium' ? 'Consorziate' : 'Mandanti', icon: Network },
            ]} />
            {subTab === 'main' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex gap-4">
                        {['single', 'ati', 'consortium'].map(t => (
                            <label key={t} className={`flex-1 flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${data.contractor.type === t ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-slate-200'}`}>
                                <input disabled={readOnly} type="radio" checked={data.contractor.type === t} onChange={() => handleChange('contractor.type', t)} />
                                <span className="font-medium text-sm">{t === 'single' ? 'Impresa Singola' : t === 'ati' ? 'ATI / RTI' : 'Consorzio'}</span>
                            </label>
                        ))}
                    </div>
                    <ContactCard label="Impresa Capogruppo" path="contractor.mainCompany" contact={data.contractor.mainCompany} readOnly={readOnly} onChange={handleChange} isCompany={true} showRepInfo={true} />
                </div>
            )}
            {subTab === 'structure' && data.contractor.type !== 'single' && (
                <div className="space-y-6">
                    {(data.contractor.type === 'ati' ? data.contractor.mandants : data.contractor.executors).map((comp, idx) => (
                        <div key={idx} className="relative group">
                            <ContactCard label={data.contractor.type === 'ati' ? `Mandante ${idx+1}` : `Consorziata ${idx+1}`} path={data.contractor.type === 'ati' ? `contractor.mandants.${idx}` : `contractor.executors.${idx}`} contact={comp} readOnly={readOnly} onChange={handleChange} isCompany={true} showRepInfo={true} />
                            {!readOnly && <button onClick={() => {
                                const field = data.contractor.type === 'ati' ? 'mandants' : 'executors';
                                const list = [...data.contractor[field]];
                                list.splice(idx, 1);
                                handleChange(`contractor.${field}`, list);
                            }} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><Trash2 className="w-5 h-5"/></button>}
                        </div>
                    ))}
                    {!readOnly && <button onClick={() => {
                        const field = data.contractor.type === 'ati' ? 'mandants' : 'executors';
                        handleChange(`contractor.${field}`, [...(data.contractor[field] || []), { name: '' }]);
                    }} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-2"><Plus className="w-5 h-5"/> Aggiungi</button>}
                </div>
            )}
        </>
      )}
    </div>
  );
};
