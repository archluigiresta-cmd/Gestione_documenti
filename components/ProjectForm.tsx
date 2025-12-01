
import React, { useState, useEffect } from 'react';
import { ProjectConstants, ContactInfo, SubjectProfile, AppointmentData } from '../types';
import { Save, User, Users, Mail, ShieldCheck, Phone, MapPin, Plus, Trash2, FileText, Briefcase, Stamp, Building, PencilRuler, HardHat, FileSignature, Lock } from 'lucide-react';

interface ProjectFormProps {
  data: ProjectConstants;
  onChange: (data: ProjectConstants) => void;
  section: 'general' | 'design' | 'subjects' | 'tender' | 'contractor';
  readOnly?: boolean; 
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ data, onChange, section, readOnly = false }) => {
  // Determine initial subtab based on section to avoid race conditions
  const getInitialSubTab = (sec: string) => {
    switch(sec) {
        case 'general': return 'info';
        case 'design': return 'docfap';
        case 'subjects': return 'rup';
        case 'contractor': return 'registry';
        default: return 'default';
    }
  };

  const [subTab, setSubTab] = useState<string>(getInitialSubTab(section));

  // Sync subtab if section prop changes
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

  const SubNav = ({ items }: { items: { id: string, label: string, icon?: any }[] }) => (
    <div className="flex border-b border-slate-200 mb-6 gap-2 overflow-x-auto pb-2">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => setSubTab(item.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            subTab === item.id 
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

  const AppointmentFields = ({ appointment, path }: { appointment: AppointmentData, path: string }) => (
    <div className="mt-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h5 className="font-bold text-slate-700 mb-3 text-xs uppercase tracking-wide flex items-center gap-2">
            <FileSignature className="w-4 h-4" /> Estremi Atto di Nomina
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Tipo Atto</label>
                <input disabled={readOnly} type="text" placeholder="Es. Determina Dirigenziale" className="w-full p-2 border border-slate-300 rounded text-sm disabled:bg-slate-100" 
                       value={appointment.type} onChange={e => handleChange(`${path}.type`, e.target.value)} />
            </div>
            <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Numero</label>
                <input disabled={readOnly} type="text" className="w-full p-2 border border-slate-300 rounded text-sm disabled:bg-slate-100" 
                       value={appointment.number} onChange={e => handleChange(`${path}.number`, e.target.value)} />
            </div>
            <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Data</label>
                <input disabled={readOnly} type="date" className="w-full p-2 border border-slate-300 rounded text-sm disabled:bg-slate-100" 
                       value={appointment.date} onChange={e => handleChange(`${path}.date`, e.target.value)} />
            </div>
        </div>
    </div>
  );

  const ContactCard = ({ label, path, profile, showAppointment = true }: { label: string, path: string, profile: SubjectProfile, showAppointment?: boolean }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-4 animate-in fade-in">
      <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
         <User className="w-5 h-5 text-blue-500 bg-blue-50 p-1 rounded-full"/> {label}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nome / Ragione Sociale</label>
            <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100" 
                   value={profile.contact.name} onChange={e => handleChange(`${path}.contact.name`, e.target.value)} />
         </div>
         <div>
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Titolo</label>
             <input disabled={readOnly} type="text" placeholder="Arch. / Ing." className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                    value={profile.contact.title} onChange={e => handleChange(`${path}.contact.title`, e.target.value)} />
         </div>
         <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/>
              <input disabled={readOnly} type="email" className="w-full p-2.5 pl-9 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                     value={profile.contact.email || ''} onChange={e => handleChange(`${path}.contact.email`, e.target.value)} />
            </div>
         </div>
         <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">PEC</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/>
              <input disabled={readOnly} type="email" className="w-full p-2.5 pl-9 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                     value={profile.contact.pec || ''} onChange={e => handleChange(`${path}.contact.pec`, e.target.value)} />
            </div>
         </div>
         <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Telefono</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/>
              <input disabled={readOnly} type="tel" className="w-full p-2.5 pl-9 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                     value={profile.contact.phone || ''} onChange={e => handleChange(`${path}.contact.phone`, e.target.value)} />
            </div>
         </div>
         <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Indirizzo</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/>
              <input disabled={readOnly} type="text" className="w-full p-2.5 pl-9 border border-slate-300 rounded-lg mt-1 disabled:bg-slate-100" 
                     value={profile.contact.address || ''} onChange={e => handleChange(`${path}.contact.address`, e.target.value)} />
            </div>
         </div>
      </div>
      
      {showAppointment && <AppointmentFields appointment={profile.appointment} path={`${path}.appointment`} />}
    </div>
  );

  // Safety check for design phase data
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
                {section === 'contractor' && 'Dati Impresa'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
               {section === 'general' && 'Gestisci inquadramento, contratto e registrazione.'}
               {section === 'design' && 'Documenti preliminari, definitivi ed esecutivi.'}
               {section === 'subjects' && 'Anagrafica e nomine di tutte le figure tecniche.'}
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
            <SubNav items={[
                { id: 'info', label: 'Inquadramento', icon: Building },
                { id: 'contract', label: 'Dati Contratto', icon: Briefcase },
                { id: 'registration', label: 'Registrazione', icon: Stamp },
            ]} />

            {subTab === 'info' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-right-4 duration-300">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Inquadramento Opera</h3>
                    <div className="grid grid-cols-1 gap-6">
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

      {/* Design Phase */}
      {section === 'design' && (
        <>
            <SubNav items={[
                { id: 'docfap', label: 'DocFAP', icon: FileText },
                { id: 'dip', label: 'DIP', icon: FileText },
                { id: 'pfte', label: 'PFTE', icon: PencilRuler },
                { id: 'executive', label: 'Esecutivo', icon: Stamp },
            ]} />
            
            {data.designPhase && data.designPhase[subTab as keyof typeof data.designPhase] ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-right-4 duration-300">
               <h3 className="text-lg font-bold text-slate-800 mb-6">
                  {subTab === 'docfap' && 'Documento di Fattibilità delle Alternative Progettuali'}
                  {subTab === 'dip' && 'Documento di Indirizzo alla Progettazione'}
                  {subTab === 'pfte' && 'Progetto di Fattibilità Tecnico Economica'}
                  {subTab === 'executive' && 'Progetto Esecutivo'}
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-2">Data Consegna Elaborati</label>
                       <input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg"
                           value={data.designPhase[subTab as keyof typeof data.designPhase].deliveryDate || ''} 
                           onChange={(e) => handleChange(`designPhase.${subTab}.deliveryDate`, e.target.value)} />
                   </div>
                   <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-2">Importo Quadro Economico (€)</label>
                       <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg"
                           value={data.designPhase[subTab as keyof typeof data.designPhase].economicFramework || ''} 
                           onChange={(e) => handleChange(`designPhase.${subTab}.economicFramework`, e.target.value)} />
                   </div>
               </div>

               <div className="mt-6 border-t border-slate-100 pt-6">
                   <h4 className="font-bold text-slate-600 mb-4 text-sm uppercase tracking-wide">Provvedimento di Approvazione</h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo Provvedimento</label>
                            <input disabled={readOnly} type="text" placeholder="Es. Determina/Delibera" className="w-full p-3 border border-slate-300 rounded-lg"
                                value={data.designPhase[subTab as keyof typeof data.designPhase].approvalType || ''} 
                                onChange={(e) => handleChange(`designPhase.${subTab}.approvalType`, e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Numero</label>
                            <input disabled={readOnly} type="text" className="w-full p-3 border border-slate-300 rounded-lg"
                                value={data.designPhase[subTab as keyof typeof data.designPhase].approvalNumber || ''} 
                                onChange={(e) => handleChange(`designPhase.${subTab}.approvalNumber`, e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Data</label>
                            <input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg"
                                value={data.designPhase[subTab as keyof typeof data.designPhase].approvalDate || ''} 
                                onChange={(e) => handleChange(`designPhase.${subTab}.approvalDate`, e.target.value)} />
                        </div>
                   </div>
               </div>
            </div>
            ) : (
                <div className="p-8 bg-slate-50 text-slate-500 rounded-lg border border-dashed border-slate-300 text-center">
                    Dati fase non disponibili.
                </div>
            )}
        </>
      )}

      {/* Subjects Phase */}
      {section === 'subjects' && (
        <>
            <SubNav items={[
                { id: 'rup', label: 'RUP', icon: User },
                { id: 'designers', label: 'Progettisti', icon: PencilRuler },
                { id: 'csp', label: 'CSP', icon: ShieldCheck },
                { id: 'verifier', label: 'Verificatore', icon: FileSignature },
                { id: 'dl', label: 'D.L.', icon: HardHat },
                { id: 'dloffice', label: 'Uff. DL', icon: Users },
                { id: 'cse', label: 'CSE', icon: ShieldCheck },
                { id: 'tester', label: 'Collaudatore', icon: Stamp },
            ]} />

            {subTab === 'rup' && data.subjects.rup && <ContactCard label="Responsabile Unico di Progetto" path="subjects.rup" profile={data.subjects.rup} />}
            {/* ... other subjects ... same pattern ... */}
            {subTab === 'csp' && data.subjects.csp && <ContactCard label="Coord. Sicurezza Progettazione" path="subjects.csp" profile={data.subjects.csp} />}
            {subTab === 'cse' && data.subjects.cse && <ContactCard label="Coord. Sicurezza Esecuzione" path="subjects.cse" profile={data.subjects.cse} />}
            {subTab === 'verifier' && data.subjects.verifier && <ContactCard label="Verificatore Progetto" path="subjects.verifier" profile={data.subjects.verifier} />}
            {subTab === 'dl' && data.subjects.dl && <ContactCard label="Direttore dei Lavori" path="subjects.dl" profile={data.subjects.dl} />}
            
            {subTab === 'tester' && data.subjects.tester && (
                <div className="space-y-6">
                    <ContactCard label="Collaudatore" path="subjects.tester" profile={data.subjects.tester} />
                    <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Tipo Incarico (Opzioni)</label>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
                                <input disabled={readOnly} type="checkbox" className="w-4 h-4 text-blue-600" checked={data.subjects.testerAppointment?.isStatic || false} onChange={e => handleChange('subjects.testerAppointment.isStatic', e.target.checked)}/> 
                                <span className="text-sm font-medium">Statico</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
                                <input disabled={readOnly} type="checkbox" className="w-4 h-4 text-blue-600" checked={data.subjects.testerAppointment?.isAdmin || false} onChange={e => handleChange('subjects.testerAppointment.isAdmin', e.target.checked)}/> 
                                <span className="text-sm font-medium">Tecnico-Amministrativo</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
                                <input disabled={readOnly} type="checkbox" className="w-4 h-4 text-blue-600" checked={data.subjects.testerAppointment?.isFunctional || false} onChange={e => handleChange('subjects.testerAppointment.isFunctional', e.target.checked)}/> 
                                <span className="text-sm font-medium">Funzionale</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {subTab === 'designers' && data.subjects.designers && (
                <div className="space-y-6">
                    {data.subjects.designers.map((designer, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
                             {!readOnly && (
                                 <button onClick={() => {
                                     const newDesigners = [...data.subjects.designers];
                                     newDesigners.splice(idx, 1);
                                     handleChange('subjects.designers', newDesigners);
                                 }} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><Trash2 className="w-5 h-5"/></button>
                             )}
                             
                             <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <PencilRuler className="w-4 h-4 text-blue-500"/> Progettista {idx + 1}
                             </h4>
                             
                             <div className="mb-4">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Incarico Specifico</label>
                                <select disabled={readOnly} className="w-full p-2 border border-slate-300 rounded mt-1 text-sm bg-white"
                                        value={designer.specificRole} 
                                        onChange={(e) => {
                                            const newD = [...data.subjects.designers];
                                            newD[idx].specificRole = e.target.value;
                                            handleChange('subjects.designers', newD);
                                        }}>
                                    <option value="">Seleziona...</option>
                                    <option value="Architettonico">Architettonico</option>
                                    <option value="Strutturale">Strutturale</option>
                                    <option value="Impianti">Impianti</option>
                                    <option value="Geologico">Geologico</option>
                                    <option value="Ambientale">Ambientale</option>
                                    <option value="Altro">Altro</option>
                                </select>
                             </div>
                             
                             <ContactCard label="Dati Progettista" path={`subjects.designers.${idx}`} profile={designer} showAppointment={true} />
                        </div>
                    ))}
                    
                    {!readOnly && (
                        <button onClick={() => {
                            const emptyDesigner = { 
                                specificRole: 'Architettonico', 
                                contact: { name: '', title: 'Arch.', email: '', pec: '', phone: '', address: '' },
                                appointment: { type: 'Disciplinare', number: '', date: '' }
                            };
                            handleChange('subjects.designers', [...data.subjects.designers, emptyDesigner]);
                        }} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-2 font-medium">
                            <Plus className="w-5 h-5"/> Aggiungi Progettista
                        </button>
                    )}
                </div>
            )}
            
            {subTab === 'dloffice' && data.subjects.dlOffice && (
                <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-800 text-sm">
                        Ufficio Direzione Lavori: assistenti, direttori operativi e ispettori.
                    </div>
                    {data.subjects.dlOffice.map((member, idx) => (
                         <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
                             {!readOnly && (
                                 <button onClick={() => {
                                     const newOffice = [...data.subjects.dlOffice];
                                     newOffice.splice(idx, 1);
                                     handleChange('subjects.dlOffice', newOffice);
                                 }} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><Trash2 className="w-5 h-5"/></button>
                             )}
                             <ContactCard label={`Componente Ufficio DL #${idx + 1}`} path={`subjects.dlOffice.${idx}`} profile={member} showAppointment={true} />
                         </div>
                    ))}
                    {!readOnly && (
                        <button onClick={() => {
                            const emptyMember = { 
                                contact: { name: '', title: 'Geom.', role: 'Ispettore di Cantiere', email: '', pec: '', phone: '', address: '' },
                                appointment: { type: 'Ordine di Servizio', number: '', date: '' }
                            };
                            handleChange('subjects.dlOffice', [...data.subjects.dlOffice, emptyMember]);
                        }} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-2 font-medium">
                            <Plus className="w-5 h-5"/> Aggiungi Componente Ufficio DL
                        </button>
                    )}
                </div>
            )}
        </>
      )}

      {/* --- SECTION: GARA --- */}
      {section === 'tender' && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Verbali Gara</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Data Verbale Verifica Progetto</label>
                    <input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                        value={data.tenderPhase?.verificationMinutesDate || ''} onChange={(e) => handleChange('tenderPhase.verificationMinutesDate', e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Data Verbale Validazione Progetto</label>
                    <input disabled={readOnly} type="date" className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                        value={data.tenderPhase?.validationMinutesDate || ''} onChange={(e) => handleChange('tenderPhase.validationMinutesDate', e.target.value)} />
                </div>
            </div>
        </div>
      )}

      {/* --- SECTION: IMPRESA --- */}
      {section === 'contractor' && (
        <>
            <SubNav items={[
                { id: 'registry', label: 'Anagrafica' },
                { id: 'structure', label: 'Struttura (ATI/Sub)' },
            ]} />
            
            {subTab === 'registry' && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-4">
                        <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <HardHat className="w-5 h-5 text-blue-500 bg-blue-50 p-1 rounded-full"/> Dati Impresa
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ragione Sociale</label>
                                <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1" 
                                    value={data.contractor.name} onChange={e => handleChange('contractor.name', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">P.IVA / C.F.</label>
                                <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1" 
                                    value={data.contractor.vat} onChange={e => handleChange('contractor.vat', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Indirizzo Sede Legale</label>
                                <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1" 
                                    value={data.contractor.address} onChange={e => handleChange('contractor.address', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Rappresentante Legale (Nome)</label>
                                <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1" 
                                    value={data.contractor.repName} onChange={e => handleChange('contractor.repName', e.target.value)} />
                            </div>
                             <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ruolo / Titolo</label>
                                <input disabled={readOnly} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1" placeholder="Es. Amministratore Unico"
                                    value={data.contractor.role} onChange={e => handleChange('contractor.role', e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {subTab === 'structure' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800">Struttura Societaria</h3>
                        <label className="flex items-center gap-2 cursor-pointer bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                            <input disabled={readOnly} type="checkbox" className="w-5 h-5 text-blue-600 rounded" checked={data.contractor.isATI} onChange={e => handleChange('contractor.isATI', e.target.checked)} />
                            <span className="text-sm font-bold text-blue-800">È un'ATI (Associazione Temporanea)</span>
                        </label>
                    </div>
                    
                    <div className="space-y-4">
                       <h4 className="font-bold text-slate-800 flex items-center gap-2"><FileText className="w-5 h-5 text-slate-400"/> Subappaltatori</h4>
                       {data.contractor.subcontractors?.map((sub, idx) => (
                           <div key={idx} className="flex gap-3 mb-2 animate-in fade-in">
                               <input disabled={readOnly} type="text" value={sub.name} readOnly className="flex-1 p-3 border border-slate-200 bg-slate-50 rounded-lg text-slate-700"/>
                               {!readOnly && (
                                   <button onClick={() => {
                                       const newSubs = [...data.contractor.subcontractors];
                                       newSubs.splice(idx, 1);
                                       handleChange('contractor.subcontractors', newSubs);
                                   }} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-3 rounded-lg transition-colors"><Trash2 className="w-5 h-5"/></button>
                               )}
                           </div>
                       ))}
                       {!readOnly && (
                           <button onClick={() => {
                               const name = prompt("Nome Subappaltatore:");
                               if(name) {
                                   handleChange('contractor.subcontractors', [...(data.contractor.subcontractors || []), { name, activity: '' }]);
                               }
                           }} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg transition-colors border border-dashed border-blue-200 w-full justify-center">
                               <Plus className="w-4 h-4"/> Aggiungi Subappaltatore
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
