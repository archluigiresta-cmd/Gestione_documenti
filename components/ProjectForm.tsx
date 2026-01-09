import React, { useState, useEffect } from 'react';
import { ProjectConstants, ContactInfo, SubjectProfile, AppointmentData, CompanyType, DesignerProfile } from '../types';
import { Save, User, Users, Mail, ShieldCheck, MapPin, Plus, Trash2, FileText, Briefcase, Stamp, Building, PencilRuler, HardHat, FileSignature, Lock, FolderOpen, Copy, StickyNote, ChevronDown, ImagePlus, X, BriefcaseBusiness, Network, Hammer } from 'lucide-react';

// --- HELPER COMPONENTS ---

const TITLES = ["Arch.", "Ing.", "Geom.", "Dott.", "Dott. Agr.", "Geol.", "Per. Ind.", "Sig."];

interface SubNavProps {
    items: { id: string, label: string, icon?: any }[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

const SubNav: React.FC<SubNavProps> = ({ items, activeTab, onTabChange }) => (
    <div className="flex border-b border-slate-200 mb-6 gap-2 overflow-x-auto pb-2">
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

interface AppointmentFieldsProps {
    appointment: AppointmentData;
    path: string;
    readOnly: boolean;
    onChange: (path: string, value: any) => void;
}

const AppointmentFields: React.FC<AppointmentFieldsProps> = ({ appointment, path, readOnly, onChange }) => (
    <div className="mt-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h5 className="font-bold text-slate-700 mb-3 text-xs uppercase tracking-wide flex items-center gap-2">
            <FileSignature className="w-4 h-4" /> Estremi Atto di Nomina
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Tipo Atto</label>
                <input disabled={readOnly} type="text" placeholder="Es. Determina Dirigenziale" className="w-full p-2 border border-slate-300 rounded text-sm disabled:bg-slate-100" 
                       value={appointment.type} onChange={e => onChange(`${path}.type`, e.target.value)} />
            </div>
            <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Numero</label>
                <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded text-sm disabled:bg-slate-100" 
                       value={appointment.number} onChange={e => onChange(`${path}.number`, e.target.value)} />
            </div>
            <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Data</label>
                <input disabled={readOnly} type="date" className="w-full p-2 border border-slate-300 rounded text-sm disabled:bg-slate-100" 
                       value={appointment.date} onChange={e => onChange(`${path}.date`, e.target.value)} />
            </div>
        </div>
    </div>
);

interface ContactCardProps {
    label: string;
    path: string;
    contact: ContactInfo; // MODIFIED: Pass ContactInfo directly
    appointment?: AppointmentData; // Optional appointment
    readOnly: boolean;
    onChange: (path: string, value: any) => void;
    showRepInfo?: boolean; 
    roleLabel?: string; 
    isCompany?: boolean;
}

const ContactCard: React.FC<ContactCardProps> = ({ 
    label, path, contact, appointment, readOnly, onChange,
    showRepInfo = false, roleLabel = "Ruolo / Titolo", isCompany = false
}) => {
    const currentTitle = contact.title || '';
    const isStandardTitle = TITLES.includes(currentTitle);
    const showCustomInput = !isStandardTitle && currentTitle !== '';

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-4 animate-in fade-in">
        <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-blue-500 bg-blue-50 p-1 rounded-full"/> {label}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nome / Ragione Sociale</label>
                <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100" 
                    value={contact.name} onChange={e => onChange(`${path}.name`, e.target.value)} />
            </div>
            
            {!isCompany && (
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Titolo</label>
                    <div className="flex gap-2 mt-1">
                        <div className="relative flex-1">
                            <select 
                                disabled={readOnly}
                                className="w-full p-2.5 border border-slate-300 rounded-lg appearance-none bg-white disabled:bg-slate-100"
                                value={showCustomInput ? 'Altro' : currentTitle}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === 'Altro') {
                                        onChange(`${path}.title`, ''); 
                                    } else {
                                        onChange(`${path}.title`, val);
                                    }
                                }}
                            >
                                <option value="">Seleziona...</option>
                                {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                                <option value="Altro">Altro...</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none"/>
                        </div>
                        {showCustomInput && (
                            <input 
                                disabled={readOnly} 
                                type="text" 
                                placeholder="Specifica..." 
                                className="flex-1 p-2.5 border border-slate-300 rounded-lg disabled:bg-slate-100 animate-in fade-in slide-in-from-left-2" 
                                value={contact.title} 
                                onChange={e => onChange(`${path}.title`, e.target.value)} 
                            />
                        )}
                    </div>
                </div>
            )}

            <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">P.IVA / C.F.</label>
                <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                    value={contact.vat || ''} onChange={e => onChange(`${path}.vat`, e.target.value)} />
            </div>
            
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email</label>
                <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/>
                <input disabled={readOnly} type="email" className="w-full p-2.5 pl-9 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                        value={contact.email || ''} onChange={e => onChange(`${path}.email`, e.target.value)} />
                </div>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">PEC</label>
                <div className="relative">
                <ShieldCheck className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/>
                <input disabled={readOnly} type="email" className="w-full p-2.5 pl-9 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                        value={contact.pec || ''} onChange={e => onChange(`${path}.pec`, e.target.value)} />
                </div>
            </div>

            {!isCompany && (
                <>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Albo / Ordine</label>
                        <input disabled={readOnly} type="text" placeholder="Es. Ordine Architetti Taranto" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                            value={contact.professionalOrder || ''} onChange={e => onChange(`${path}.professionalOrder`, e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">N. Iscrizione</label>
                        <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                            value={contact.registrationNumber || ''} onChange={e => onChange(`${path}.registrationNumber`, e.target.value)} />
                    </div>
                </>
            )}

            <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Indirizzo</label>
                <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/>
                <input disabled={readOnly} type="text" className="w-full p-2.5 pl-9 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                        value={contact.address || ''} onChange={e => onChange(`${path}.address`, e.target.value)} />
                </div>
            </div>

            {showRepInfo && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Rappresentante Legale (Nome)</label>
                        <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1" 
                            value={contact.repName || ''} onChange={e => onChange(`${path}.repName`, e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Titolo Rappresentante (es. Sig.)</label>
                        <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1" placeholder="Sig."
                            value={contact.repTitle || ''} onChange={e => onChange(`${path}.repTitle`, e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{roleLabel}</label>
                        <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1" placeholder={roleLabel === "Ruolo / Titolo" ? "Es. Amministratore Unico" : "Es. Opere in CA"}
                            value={contact.role || ''} onChange={e => onChange(`${path}.role`, e.target.value)} />
                    </div>
                </div>
            )}
        </div>
        
        {appointment && <AppointmentFields appointment={appointment} path={path.replace('.contact', '.appointment')} readOnly={readOnly} onChange={onChange} />}
        </div>
    );
};

interface EntityAwareContactCardProps {
    label: string;
    path: string;
    profile: DesignerProfile;
    readOnly: boolean;
    onChange: (path: string, value: any) => void;
    roleOptions?: string[];
    onDelete?: () => void;
    isListMode?: boolean;
}

const EntityAwareContactCard: React.FC<EntityAwareContactCardProps> = ({ 
    label, path, profile, readOnly, onChange, roleOptions, onDelete, isListMode = false 
}) => {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative mb-6">
             {!readOnly && onDelete && (
                 <button onClick={onDelete} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><Trash2 className="w-5 h-5"/></button>
             )}
             
             <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-500"/> {label}
             </h4>
             
             <div className="flex items-center gap-3 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200 w-fit">
                 <span className="text-xs font-bold text-slate-500 uppercase">Tipologia:</span>
                 <label className="flex items-center gap-2 cursor-pointer">
                     <input 
                        disabled={readOnly}
                        type="radio" 
                        name={`type-${path}`}
                        className="w-4 h-4 text-blue-600"
                        checked={!profile.isLegalEntity} 
                        onChange={() => onChange(`${path}.isLegalEntity`, false)}
                     />
                     <span className="text-sm">Professionista Singolo</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer">
                     <input 
                        disabled={readOnly}
                        type="radio" 
                        name={`type-${path}`}
                        className="w-4 h-4 text-blue-600"
                        checked={profile.isLegalEntity} 
                        onChange={() => onChange(`${path}.isLegalEntity`, true)}
                     />
                     <span className="text-sm">Società / RTP</span>
                 </label>
             </div>

             {(roleOptions || isListMode) && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                     {isListMode && (
                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Livelli di Progettazione</label>
                             <CheckboxGroup 
                                options={['DocFAP', 'DIP', 'PFTE', 'Esecutivo', 'Definitivo (Ex)']} 
                                selected={profile.designLevels || []} 
                                onChange={(newLevels) => onChange(`${path}.designLevels`, newLevels)}
                                readOnly={readOnly}
                             />
                         </div>
                     )}
                     <div>
                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Incarico Specifico</label>
                         <CheckboxGroup 
                            options={roleOptions || ['Architettonico', 'Strutturale', 'Impianti', 'Geologico', 'Sicurezza', 'Ambientale', 'Acustica', 'Antincendio']} 
                            selected={profile.roles || []} 
                            onChange={(newRoles) => onChange(`${path}.roles`, newRoles)}
                            readOnly={readOnly}
                         />
                     </div>
                 </div>
             )}
             
             <ContactCard 
                label={profile.isLegalEntity ? "Dati Società / Capogruppo" : "Dati Professionista"} 
                path={`${path}.contact`} 
                contact={profile.contact} 
                appointment={profile.appointment}
                readOnly={readOnly} 
                onChange={onChange}
                showRepInfo={profile.isLegalEntity} 
                isCompany={profile.isLegalEntity}
             />

             {profile.isLegalEntity && (
                 <div className="mt-6 border-t border-slate-200 pt-6">
                     <h5 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2">
                         <Users className="w-4 h-4"/> Figure Tecniche Operative
                     </h5>
                     <div className="space-y-4">
                         {(profile.operatingDesigners || []).map((op, opIdx) => (
                             <div key={opIdx} className="relative group">
                                 <ContactCard 
                                    label={`Tecnico ${opIdx + 1}`} 
                                    path={`${path}.operatingDesigners.${opIdx}`} 
                                    contact={op}
                                    readOnly={readOnly} 
                                    isCompany={false}
                                    roleLabel="Ruolo Tecnico (es. Direttore Operativo)"
                                    onChange={onChange}
                                 />
                                 {!readOnly && (
                                     <button onClick={() => {
                                         const newOps = [...(profile.operatingDesigners || [])];
                                         newOps.splice(opIdx, 1);
                                         onChange(`${path}.operatingDesigners`, newOps);
                                     }} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                                         <Trash2 className="w-5 h-5"/>
                                     </button>
                                 )}
                             </div>
                         ))}
                         {!readOnly && (
                             <button onClick={() => {
                                 const newOps = [...(profile.operatingDesigners || [])];
                                 newOps.push({ name: '', title: 'Arch.', email: '', pec: '', role: '' });
                                 onChange(`${path}.operatingDesigners`, newOps);
                             }} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-2 font-medium text-sm">
                                 <Plus className="w-4 h-4"/> Aggiungi Tecnico
                             </button>
                         )}
                     </div>
                 </div>
             )}
        </div>
    );
};

interface CheckboxGroupProps {
    options: string[];
    selected: string[];
    onChange: (newSelected: string[]) => void;
    readOnly?: boolean;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ options, selected = [], onChange, readOnly }) => {
    const toggle = (option: string) => {
        if (readOnly) return;
        if (selected.includes(option)) {
            onChange(selected.filter(s => s !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {options.map(opt => (
                <button
                    key={opt}
                    onClick={() => toggle(opt)}
                    disabled={readOnly}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        selected.includes(opt) 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                    }`}
                >
                    {opt}
                </button>
            ))}
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
        reader.onloadend = () => {
            handleChange('headerLogo', reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  if (section === 'design' && !data.designPhase) return null;

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
                {section === 'general' && 'Dati Generali Appalto'}
                {section === 'design' && 'Progettazione'}
                {section === 'subjects' && 'Soggetti Responsabili'}
                {section === 'tender' && 'Gara'}
                {section === 'contractor' && 'Dati Impresa & Subappalti'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
               {section === 'general' && 'Gestisci inquadramento, contratto e registrazione.'}
               {section === 'design' && 'Documenti preliminari, definitivi ed esecutivi.'}
               {section === 'subjects' && 'Anagrafica e nomine di tutte le figure tecniche.'}
               {section === 'contractor' && 'Gestione completa di Imprese (singole, ATI, Consorzi) e Subappalti.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
             {readOnly ? (
                <span className="text-xs text-amber-600 font-medium flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                   <Lock className="w-3 h-3" /> Solo Lettura
                </span>
             ) : (
                <span className="text-xs text-green-600 font-medium flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                  <Save className="w-3 h-3" /> Auto-save
                </span>
             )}
          </div>
      </div>

      {/* --- SECTION: GENERALI --- */}
      {section === 'general' && (
        <>
            <SubNav activeTab={subTab} onTabChange={setSubTab} items={[
                { id: 'info', label: 'Inquadramento', icon: Building },
                { id: 'contract', label: 'Dati Contratto', icon: Briefcase },
                { id: 'registration', label: 'Registrazione', icon: Stamp },
                { id: 'notes', label: 'Note', icon: StickyNote },
            ]} />

            {subTab === 'info' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-right-4 duration-300">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Inquadramento Opera</h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                             <div className="flex items-center justify-between">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Logo / Intestazione (Opzionale)</label>
                                    <p className="text-xs text-slate-500">
                                        Carica un'immagine (logo, stemma) da usare come intestazione dei verbali. 
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {data.headerLogo && (
                                        <div className="relative h-12 w-auto border bg-white p-1 rounded">
                                            <img src={data.headerLogo} alt="Logo" className="h-full w-auto object-contain" />
                                            {!readOnly && (
                                                <button onClick={() => handleChange('headerLogo', '')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"><X className="w-3 h-3" /></button>
                                            )}
                                        </div>
                                    )}
                                    {!readOnly && (
                                        <label className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
                                            <ImagePlus className="w-4 h-4"/> Scegli File...
                                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                        </label>
                                    )}
                                </div>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-3">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Ente Appaltante</label>
                                <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg uppercase font-bold text-slate-700 bg-slate-50"
                                    value={data.entity} onChange={(e) => handleChange('entity', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Provincia</label>
                                <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg uppercase font-bold text-slate-700 bg-slate-50"
                                    placeholder="Es. TA"
                                    value={data.entityProvince || ''} onChange={(e) => handleChange('entityProvince', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Oggetto Lavori</label>
                            <textarea disabled={readOnly} className="w-full p-3 border border-slate-300 rounded-lg h-32 leading-relaxed"
                                value={data.projectName} onChange={(e) => handleChange('projectName', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Luogo dei Lavori</label>
                            <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg"
                                value={data.location} onChange={(e) => handleChange('location', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">CUP</label>
                                <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg uppercase font-mono tracking-wide"
                                    value={data.cup} onChange={(e) => handleChange('cup', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">CIG</label>
                                <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg uppercase font-mono tracking-wide"
                                    value={data.cig || ''} onChange={(e) => handleChange('cig', e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {(subTab === 'contract' || subTab === 'registration') && (
                 <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-right-4 duration-300">
                    {subTab === 'contract' ? (
                       <>
                         <h3 className="text-lg font-bold text-slate-800 mb-6">Dati Contratto Principale</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Data Stipula</label>
                                <input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg"
                                    value={data.contract.date} onChange={(e) => handleChange('contract.date', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Repertorio N.</label>
                                <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg"
                                    value={data.contract.repNumber} onChange={(e) => handleChange('contract.repNumber', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Importo Totale (€)</label>
                                <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg"
                                    value={data.contract.totalAmount} onChange={(e) => handleChange('contract.totalAmount', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Oneri Sicurezza (€)</label>
                                <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg"
                                    value={data.contract.securityCosts} onChange={(e) => handleChange('contract.securityCosts', e.target.value)} />
                            </div>
                         </div>
                       </>
                    ) : (
                       <>
                         <h3 className="text-lg font-bold text-slate-800 mb-6">Estremi di Registrazione</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Luogo Registrazione</label>
                                <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg"
                                    value={data.contract.regPlace} onChange={(e) => handleChange('contract.regPlace', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Data Registrazione</label>
                                <input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg"
                                    value={data.contract.regDate} onChange={(e) => handleChange('contract.regDate', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Numero</label>
                                <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg"
                                    value={data.contract.regNumber} onChange={(e) => handleChange('contract.regNumber', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Serie</label>
                                <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg"
                                    value={data.contract.regSeries} onChange={(e) => handleChange('contract.regSeries', e.target.value)} />
                            </div>
                         </div>
                       </>
                    )}
                 </div>
            )}
        </>
      )}

      {/* Subjects Phase */}
      {section === 'subjects' && (
        <>
            <SubNav activeTab={subTab} onTabChange={setSubTab} items={[
                { id: 'rup', label: 'RUP', icon: User },
                { id: 'designers', label: 'Progettisti', icon: PencilRuler },
                { id: 'csp', label: 'CSP', icon: ShieldCheck },
                { id: 'verifier', label: 'Verificatore', icon: FileSignature },
                { id: 'dl', label: 'D.L.', icon: HardHat },
                { id: 'dloffice', label: 'Uff. DL', icon: Users },
                { id: 'cse', label: 'CSE', icon: ShieldCheck },
                { id: 'tester', label: 'Collaudatore', icon: Stamp },
            ]} />

            {subTab === 'rup' && data.subjects.rup && <ContactCard label="Responsabile Unico di Progetto" path="subjects.rup.contact" contact={data.subjects.rup.contact} appointment={data.subjects.rup.appointment} readOnly={readOnly} onChange={handleChange} />}
            
            {subTab === 'csp' && data.subjects.csp && (
                <EntityAwareContactCard 
                    label="Coordinatore Sicurezza Progettazione" 
                    path="subjects.csp" 
                    profile={data.subjects.csp} 
                    readOnly={readOnly} 
                    onChange={handleChange} 
                />
            )}
            
            {subTab === 'cse' && data.subjects.cse && (
                <EntityAwareContactCard 
                    label="Coordinatore Sicurezza Esecuzione" 
                    path="subjects.cse" 
                    profile={data.subjects.cse} 
                    readOnly={readOnly} 
                    onChange={handleChange} 
                />
            )}
            
            {subTab === 'verifier' && data.subjects.verifier && (
                <EntityAwareContactCard 
                    label="Verificatore Progetto" 
                    path="subjects.verifier" 
                    profile={data.subjects.verifier} 
                    readOnly={readOnly} 
                    onChange={handleChange} 
                />
            )}
            
            {subTab === 'dl' && data.subjects.dl && (
                <EntityAwareContactCard 
                    label="Direttore dei Lavori" 
                    path="subjects.dl" 
                    profile={data.subjects.dl} 
                    readOnly={readOnly} 
                    onChange={handleChange} 
                />
            )}
            
            {subTab === 'tester' && data.subjects.tester && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-4 animate-in fade-in">
                       <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                          <Stamp className="w-5 h-5 text-blue-500 bg-blue-50 p-1 rounded-full"/> Atto di Nomina e Contratto
                       </h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="md:col-span-2">
                               <label className="text-xs font-semibold text-slate-500 mb-1 block">Tipo Atto di Nomina</label>
                               <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded text-sm disabled:bg-slate-100" 
                                      value={data.subjects.testerAppointment.nominationType} onChange={e => handleChange('subjects.testerAppointment.nominationType', e.target.value)} />
                           </div>
                           <div>
                               <label className="text-xs font-semibold text-slate-500 mb-1 block">Numero Atto</label>
                               <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded text-sm disabled:bg-slate-100" 
                                      value={data.subjects.testerAppointment.nominationNumber} onChange={e => handleChange('subjects.testerAppointment.nominationNumber', e.target.value)} />
                           </div>
                           <div>
                               <label className="text-xs font-semibold text-slate-500 mb-1 block">Data Atto</label>
                               <input disabled={readOnly} type="date" className="w-full p-2 border border-slate-300 rounded text-sm disabled:bg-slate-100" 
                                      value={data.subjects.testerAppointment.nominationDate} onChange={e => handleChange('subjects.testerAppointment.nominationDate', e.target.value)} />
                           </div>
                       </div>
                    </div>
                    <ContactCard label="Anagrafica Collaudatore" path="subjects.tester.contact" contact={data.subjects.tester.contact} readOnly={readOnly} onChange={handleChange} />
                </div>
            )}

            {subTab === 'designers' && (
                <div className="space-y-6">
                    {data.subjects.designers.map((designer, idx) => (
                        <EntityAwareContactCard
                            key={idx}
                            label={`Progettista ${idx + 1}`}
                            path={`subjects.designers.${idx}`}
                            profile={designer}
                            readOnly={readOnly}
                            onChange={handleChange}
                            isListMode={true}
                            onDelete={() => {
                                const newDesigners = [...data.subjects.designers];
                                newDesigners.splice(idx, 1);
                                handleChange('subjects.designers', newDesigners);
                            }}
                        />
                    ))}
                    {!readOnly && (
                        <button onClick={() => {
                            const emptyDesigner = { 
                                designLevels: [], roles: [], isLegalEntity: false, operatingDesigners: [],
                                contact: { name: '', title: 'Arch.', email: '', pec: '' },
                                appointment: { type: 'Disciplinare', number: '', date: '' }
                            };
                            handleChange('subjects.designers', [...data.subjects.designers, emptyDesigner]);
                        }} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-2 font-medium">
                            <Plus className="w-5 h-5"/> Aggiungi Nuovo Progettista
                        </button>
                    )}
                </div>
            )}
        </>
      )}

      {/* --- SECTION: IMPRESA --- */}
      {section === 'contractor' && (
        <>
            <SubNav activeTab={subTab} onTabChange={setSubTab} items={[
                { id: 'main', label: 'Impresa Capogruppo', icon: BriefcaseBusiness },
                { id: 'structure', label: data.contractor.type === 'consortium' ? 'Consorziate Esecutrici' : 'Imprese Mandanti', icon: Network },
                { id: 'subcontractors', label: 'Subappaltatori', icon: Hammer },
            ]} />
            
            {subTab === 'main' && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <HardHat className="w-5 h-5 text-blue-500"/> Tipologia Impresa / Struttura Appaltatrice
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${data.contractor.type === 'single' ? 'bg-blue-50 border-blue-500 text-blue-800 ring-1 ring-blue-500' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                                <input disabled={readOnly} type="radio" name="companyType" className="w-4 h-4 text-blue-600"
                                    checked={data.contractor.type === 'single'} onChange={() => handleChange('contractor.type', 'single')} />
                                <span className="font-medium text-sm">Impresa Singola</span>
                            </label>
                            <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${data.contractor.type === 'ati' ? 'bg-blue-50 border-blue-500 text-blue-800 ring-1 ring-blue-500' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                                <input disabled={readOnly} type="radio" name="companyType" className="w-4 h-4 text-blue-600"
                                    checked={data.contractor.type === 'ati'} onChange={() => handleChange('contractor.type', 'ati')} />
                                <span className="font-medium text-sm">ATI / RTI</span>
                            </label>
                            <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${data.contractor.type === 'consortium' ? 'bg-blue-50 border-blue-500 text-blue-800 ring-1 ring-blue-500' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                                <input disabled={readOnly} type="radio" name="companyType" className="w-4 h-4 text-blue-600"
                                    checked={data.contractor.type === 'consortium'} onChange={() => handleChange('contractor.type', 'consortium')} />
                                <span className="font-medium text-sm">Consorzio Stabile</span>
                            </label>
                        </div>
                    </div>

                    <ContactCard 
                        label={
                            data.contractor.type === 'ati' ? 'Impresa Mandataria (Capogruppo)' : 
                            data.contractor.type === 'consortium' ? 'Dati Consorzio Appaltatore' : 'Dati Impresa Appaltatrice'
                        } 
                        path="contractor.mainCompany" 
                        contact={data.contractor.mainCompany} 
                        showRepInfo={true}
                        readOnly={readOnly} 
                        onChange={handleChange} 
                        isCompany={true}
                    />
                </div>
            )}

            {subTab === 'structure' && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                    <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200 text-sm text-slate-600">
                        {data.contractor.type === 'single' && "Questa sezione non è necessaria per le imprese singole."}
                        {data.contractor.type === 'ati' && "Inserisci qui le imprese MANDANTI del raggruppamento temporaneo."}
                        {data.contractor.type === 'consortium' && "Indicazione obbligatoria delle imprese CONSORZIATE ESECUTRICI designate per i lavori."}
                    </div>

                    <div className="space-y-6">
                        {(data.contractor.type === 'ati' ? (data.contractor.mandants || []) : (data.contractor.executors || [])).map((comp, idx) => (
                            <div key={idx} className="relative group">
                                <ContactCard 
                                    label={data.contractor.type === 'ati' ? `Impresa Mandante n. ${idx + 1}` : `Impresa Consorziata Esecutrice n. ${idx + 1}`} 
                                    path={data.contractor.type === 'ati' ? `contractor.mandants.${idx}` : `contractor.executors.${idx}`} 
                                    contact={comp} 
                                    showRepInfo={true}
                                    readOnly={readOnly} 
                                    onChange={handleChange} 
                                    isCompany={true}
                                />
                                {!readOnly && (
                                    <button onClick={() => {
                                        const field = data.contractor.type === 'ati' ? 'mandants' : 'executors';
                                        const list = [...(data.contractor[field] || [])];
                                        list.splice(idx, 1);
                                        handleChange(`contractor.${field}`, list);
                                    }} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                                        <Trash2 className="w-5 h-5"/>
                                    </button>
                                )}
                            </div>
                        ))}
                        {data.contractor.type !== 'single' && !readOnly && (
                            <button onClick={() => {
                                const field = data.contractor.type === 'ati' ? 'mandants' : 'executors';
                                const emptyCompany = { name: '', vat: '', address: '', email: '', pec: '', repName: '', repRole: 'Legale Rappresentante', repTitle: 'Sig.' };
                                handleChange(`contractor.${field}`, [...(data.contractor[field] || []), emptyCompany]);
                            }} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-2 font-medium">
                                <Plus className="w-5 h-5"/> Aggiungi {data.contractor.type === 'ati' ? 'Mandante' : 'Consorziata Esecutrice'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {subTab === 'subcontractors' && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-6">
                       {(data.contractor.subcontractors || []).map((sub, idx) => (
                           <div key={idx} className="relative group">
                               <ContactCard 
                                   label={`Ditta Subappaltatrice n. ${idx + 1}`} 
                                   path={`contractor.subcontractors.${idx}`} 
                                   contact={sub} 
                                   showRepInfo={true}
                                   roleLabel="Categoria Lavori / Attività"
                                   readOnly={readOnly} 
                                   onChange={handleChange} 
                                   isCompany={true}
                               />
                               {!readOnly && (
                                   <button onClick={() => {
                                       const newSubs = [...data.contractor.subcontractors];
                                       newSubs.splice(idx, 1);
                                       handleChange('contractor.subcontractors', newSubs);
                                   }} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                                       <Trash2 className="w-5 h-5"/>
                                   </button>
                               )}
                           </div>
                       ))}
                       {!readOnly && (
                           <button onClick={() => {
                               const emptyCompany = { name: '', vat: '', address: '', email: '', pec: '', role: '', repName: '', repRole: 'Titolare', repTitle: 'Sig.' };
                               handleChange('contractor.subcontractors', [...(data.contractor.subcontractors || []), emptyCompany]);
                           }} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-2 font-medium">
                               <Plus className="w-5 h-5"/> Aggiungi Subappaltatore
                           </button>
                       )}
                    </div>
                </div>
            )}
        </>
      )}

    </div>
  );
};
