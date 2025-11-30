
import React, { useState, useEffect } from 'react';
import { ProjectConstants, ContactInfo } from '../types';
import { Save, User, Mail, ShieldCheck, Phone, MapPin, Plus, Trash2, FileText, Briefcase, Stamp, Building } from 'lucide-react';

interface ProjectFormProps {
  data: ProjectConstants;
  onChange: (data: ProjectConstants) => void;
  section: 'general' | 'subjects' | 'tender' | 'contractor';
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ data, onChange, section }) => {
  // Local state for sub-navigation
  const [subTab, setSubTab] = useState<string>('default');

  // Reset subtab when main section changes
  useEffect(() => {
    if (section === 'general') setSubTab('info');
    else if (section === 'subjects') setSubTab('managers');
    else if (section === 'contractor') setSubTab('registry');
    else setSubTab('default');
  }, [section]);

  const handleChange = (path: string, value: any) => {
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
    <div className="flex border-b border-slate-200 mb-6 gap-6 overflow-x-auto">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => setSubTab(item.id)}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
            subTab === item.id 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          {item.icon && <item.icon className="w-4 h-4" />}
          {item.label}
        </button>
      ))}
    </div>
  );

  const ContactCard = ({ label, path, contact }: { label: string, path: string, contact: ContactInfo }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-4 animate-in fade-in">
      <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
         <User className="w-5 h-5 text-blue-500 bg-blue-50 p-1 rounded-full"/> {label}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nome / Ragione Sociale</label>
            <input type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                   value={contact.name} onChange={e => handleChange(`${path}.name`, e.target.value)} />
         </div>
         {contact.title !== undefined && (
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Titolo</label>
                <input type="text" placeholder="Arch. / Ing." className="w-full p-2.5 border border-slate-300 rounded-lg mt-1" 
                       value={contact.title} onChange={e => handleChange(`${path}.title`, e.target.value)} />
             </div>
         )}
         <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/>
              <input type="email" className="w-full p-2.5 pl-9 border border-slate-300 rounded-lg mt-1" 
                     value={contact.email || ''} onChange={e => handleChange(`${path}.email`, e.target.value)} />
            </div>
         </div>
         <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">PEC</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/>
              <input type="email" className="w-full p-2.5 pl-9 border border-slate-300 rounded-lg mt-1" 
                     value={contact.pec || ''} onChange={e => handleChange(`${path}.pec`, e.target.value)} />
            </div>
         </div>
         <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Telefono</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/>
              <input type="tel" className="w-full p-2.5 pl-9 border border-slate-300 rounded-lg mt-1" 
                     value={contact.phone || ''} onChange={e => handleChange(`${path}.phone`, e.target.value)} />
            </div>
         </div>
         <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Indirizzo</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/>
              <input type="text" className="w-full p-2.5 pl-9 border border-slate-300 rounded-lg mt-1" 
                     value={contact.address || ''} onChange={e => handleChange(`${path}.address`, e.target.value)} />
            </div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
                {section === 'general' && 'Dati Generali Appalto'}
                {section === 'subjects' && 'Soggetti Responsabili'}
                {section === 'tender' && 'Fase di Gara'}
                {section === 'contractor' && 'Dati Impresa'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
               {section === 'general' && 'Gestisci inquadramento, contratto e registrazione.'}
               {section === 'subjects' && 'Nomine, responsabili e figure tecniche.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-xs text-green-600 font-medium flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
               <Save className="w-3 h-3" /> Auto-save
             </span>
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
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Ente Appaltante</label>
                            <input type="text" className="w-full p-3 border border-slate-300 rounded-lg uppercase font-bold text-slate-700 bg-slate-50"
                                value={data.entity} onChange={(e) => handleChange('entity', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Oggetto Lavori</label>
                            <textarea className="w-full p-3 border border-slate-300 rounded-lg h-32 leading-relaxed"
                                value={data.projectName} onChange={(e) => handleChange('projectName', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Luogo dei Lavori</label>
                            <input type="text" className="w-full p-3 border border-slate-300 rounded-lg"
                                value={data.location} onChange={(e) => handleChange('location', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">CUP</label>
                                <input type="text" className="w-full p-3 border border-slate-300 rounded-lg uppercase font-mono tracking-wide"
                                    value={data.cup} onChange={(e) => handleChange('cup', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">CIG</label>
                                <input type="text" className="w-full p-3 border border-slate-300 rounded-lg uppercase font-mono tracking-wide"
                                    value={data.cig || ''} onChange={(e) => handleChange('cig', e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {subTab === 'contract' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-right-4 duration-300">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Dati Contratto Principale</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Data Stipula</label>
                            <input type="date" className="w-full p-3 border border-slate-300 rounded-lg"
                                value={data.contract.date} onChange={(e) => handleChange('contract.date', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Repertorio N.</label>
                            <input type="text" className="w-full p-3 border border-slate-300 rounded-lg"
                                value={data.contract.repNumber} onChange={(e) => handleChange('contract.repNumber', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Importo Totale (€)</label>
                            <input type="text" className="w-full p-3 border border-slate-300 rounded-lg"
                                value={data.contract.totalAmount} onChange={(e) => handleChange('contract.totalAmount', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Oneri Sicurezza (€)</label>
                            <input type="text" className="w-full p-3 border border-slate-300 rounded-lg"
                                value={data.contract.securityCosts} onChange={(e) => handleChange('contract.securityCosts', e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                             <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-blue-900 mb-1">Durata Lavori (giorni)</label>
                                    <input type="number" className="w-full p-2 border border-blue-200 rounded text-blue-900 font-bold"
                                        value={data.contract.durationDays} onChange={(e) => handleChange('contract.durationDays', e.target.value)} />
                                </div>
                                <div className="flex-1 opacity-60">
                                    <label className="block text-xs font-semibold text-blue-800 uppercase mb-1">Scadenza Stimata</label>
                                    <div className="text-sm font-mono">{data.contract.deadline || 'Inserisci consegna lavori'}</div>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {subTab === 'registration' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-right-4 duration-300">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Estremi di Registrazione</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Luogo Registrazione</label>
                            <input type="text" className="w-full p-3 border border-slate-300 rounded-lg"
                                value={data.contract.regPlace} onChange={(e) => handleChange('contract.regPlace', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Data Registrazione</label>
                            <input type="date" className="w-full p-3 border border-slate-300 rounded-lg"
                                value={data.contract.regDate} onChange={(e) => handleChange('contract.regDate', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Numero</label>
                            <input type="text" className="w-full p-3 border border-slate-300 rounded-lg"
                                value={data.contract.regNumber} onChange={(e) => handleChange('contract.regNumber', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Serie</label>
                            <input type="text" className="w-full p-3 border border-slate-300 rounded-lg"
                                value={data.contract.regSeries} onChange={(e) => handleChange('contract.regSeries', e.target.value)} />
                        </div>
                    </div>
                </div>
            )}
        </>
      )}

      {/* --- SECTION: SOGGETTI --- */}
      {section === 'subjects' && (
        <>
            <SubNav items={[
                { id: 'managers', label: 'Responsabili' },
                { id: 'safety', label: 'Sicurezza' },
                { id: 'testing', label: 'Collaudo' },
                { id: 'technical', label: 'Tecnici' },
            ]} />

            {subTab === 'managers' && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                    <ContactCard label="Responsabile Unico di Progetto (RUP)" path="subjects.rup" contact={data.subjects.rup} />
                    <ContactCard label="Direttore dei Lavori (DL)" path="subjects.dl" contact={data.subjects.dl} />
                </div>
            )}
            
            {subTab === 'safety' && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                    <ContactCard label="Coord. Sicurezza Esecuzione (CSE)" path="subjects.cse" contact={data.subjects.cse} />
                    <ContactCard label="Coord. Sicurezza Progettazione (CSP)" path="subjects.csp" contact={data.subjects.csp} />
                </div>
            )}

            {subTab === 'testing' && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                     <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm mb-6 border-l-4 border-l-blue-600">
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Stamp className="w-5 h-5 text-blue-600"/> Nomina Collaudatore
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tipo Atto</label>
                                <input type="text" placeholder="Es. Determina Dirigenziale" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1" 
                                    value={data.subjects.testerAppointment.nominationType} onChange={e => handleChange('subjects.testerAppointment.nominationType', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Numero Atto</label>
                                <input type="text" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1" 
                                    value={data.subjects.testerAppointment.nominationNumber} onChange={e => handleChange('subjects.testerAppointment.nominationNumber', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Data Atto</label>
                                <input type="date" className="w-full p-2.5 border border-slate-300 rounded-lg mt-1" 
                                    value={data.subjects.testerAppointment.nominationDate} onChange={e => handleChange('subjects.testerAppointment.nominationDate', e.target.value)} />
                            </div>
                            <div className="md:col-span-3 pt-4 border-t border-slate-100">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Tipo Incarico</label>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
                                        <input type="checkbox" className="w-4 h-4 text-blue-600" checked={data.subjects.testerAppointment.isStatic} onChange={e => handleChange('subjects.testerAppointment.isStatic', e.target.checked)}/> 
                                        <span className="text-sm font-medium">Statico</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
                                        <input type="checkbox" className="w-4 h-4 text-blue-600" checked={data.subjects.testerAppointment.isAdmin} onChange={e => handleChange('subjects.testerAppointment.isAdmin', e.target.checked)}/> 
                                        <span className="text-sm font-medium">Tecnico-Amministrativo</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
                                        <input type="checkbox" className="w-4 h-4 text-blue-600" checked={data.subjects.testerAppointment.isFunctional} onChange={e => handleChange('subjects.testerAppointment.isFunctional', e.target.checked)}/> 
                                        <span className="text-sm font-medium">Funzionale</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ContactCard label="Collaudatore" path="subjects.tester" contact={data.subjects.tester} />
                </div>
            )}

            {subTab === 'technical' && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                    <ContactCard label="Verificatore" path="subjects.verifier" contact={data.subjects.verifier} />
                    <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center text-slate-500">
                        Sezione Ufficio DL e Progettisti multipli in arrivo...
                    </div>
                </div>
            )}
        </>
      )}

      {/* --- SECTION: GARA --- */}
      {section === 'tender' && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Verbali Fase di Gara e Progettazione</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Data Verbale Verifica Progetto</label>
                    <input type="date" className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                        value={data.tenderPhase.verificationMinutesDate} onChange={(e) => handleChange('tenderPhase.verificationMinutesDate', e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Data Verbale Validazione Progetto</label>
                    <input type="date" className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                        value={data.tenderPhase.validationMinutesDate} onChange={(e) => handleChange('tenderPhase.validationMinutesDate', e.target.value)} />
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
                    <ContactCard label="Impresa Appaltatrice (o Mandataria)" path="contractor" contact={data.contractor} />
                </div>
            )}

            {subTab === 'structure' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800">Struttura Societaria</h3>
                        <label className="flex items-center gap-2 cursor-pointer bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                            <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" checked={data.contractor.isATI} onChange={e => handleChange('contractor.isATI', e.target.checked)} />
                            <span className="text-sm font-bold text-blue-800">È un'ATI (Associazione Temporanea)</span>
                        </label>
                    </div>
                    
                    {data.contractor.isATI && (
                       <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
                          <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2"><Briefcase className="w-5 h-5"/> Imprese Mandanti</h4>
                          <p className="text-sm text-amber-800 mb-4 opacity-80">Gestione mandanti multiple disponibile prossimamente.</p>
                       </div>
                    )}

                    <div className="space-y-4">
                       <h4 className="font-bold text-slate-800 flex items-center gap-2"><FileText className="w-5 h-5 text-slate-400"/> Subappaltatori</h4>
                       {data.contractor.subcontractors.map((sub, idx) => (
                           <div key={idx} className="flex gap-3 mb-2 animate-in fade-in">
                               <input type="text" value={sub.name} readOnly className="flex-1 p-3 border border-slate-200 bg-slate-50 rounded-lg text-slate-700"/>
                               <button onClick={() => {
                                   const newSubs = [...data.contractor.subcontractors];
                                   newSubs.splice(idx, 1);
                                   handleChange('contractor.subcontractors', newSubs);
                               }} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-3 rounded-lg transition-colors"><Trash2 className="w-5 h-5"/></button>
                           </div>
                       ))}
                       <button onClick={() => {
                           const name = prompt("Nome Subappaltatore:");
                           if(name) {
                               handleChange('contractor.subcontractors', [...data.contractor.subcontractors, { name, activity: '' }]);
                           }
                       }} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg transition-colors border border-dashed border-blue-200 w-full justify-center">
                           <Plus className="w-4 h-4"/> Aggiungi Subappaltatore
                       </button>
                    </div>
                </div>
            )}
        </>
      )}

    </div>
  );
};
