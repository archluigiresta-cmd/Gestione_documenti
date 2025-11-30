
import React from 'react';
import { ProjectConstants, ContactInfo } from '../types';
import { Save, User, Mail, ShieldCheck, Phone, MapPin, Plus, Trash2 } from 'lucide-react';

interface ProjectFormProps {
  data: ProjectConstants;
  onChange: (data: ProjectConstants) => void;
  section: 'general' | 'subjects' | 'tender' | 'contractor';
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ data, onChange, section }) => {

  const handleChange = (path: string, value: any) => {
    // Helper to update nested state by string path (e.g. "subjects.rup.name")
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

  const ContactCard = ({ label, path, contact }: { label: string, path: string, contact: ContactInfo }) => (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm mb-4">
      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
         <User className="w-4 h-4 text-blue-500"/> {label}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">Nome / Ragione Sociale</label>
            <input type="text" className="w-full p-2 border border-slate-300 rounded mt-1" 
                   value={contact.name} onChange={e => handleChange(`${path}.name`, e.target.value)} />
         </div>
         {contact.title !== undefined && (
             <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Titolo</label>
                <input type="text" placeholder="Arch. / Ing." className="w-full p-2 border border-slate-300 rounded mt-1" 
                       value={contact.title} onChange={e => handleChange(`${path}.title`, e.target.value)} />
             </div>
         )}
         <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Email</label>
            <div className="relative">
              <Mail className="absolute left-2 top-2.5 w-4 h-4 text-slate-400"/>
              <input type="email" className="w-full p-2 pl-8 border border-slate-300 rounded mt-1" 
                     value={contact.email || ''} onChange={e => handleChange(`${path}.email`, e.target.value)} />
            </div>
         </div>
         <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">PEC</label>
            <div className="relative">
              <ShieldCheck className="absolute left-2 top-2.5 w-4 h-4 text-slate-400"/>
              <input type="email" className="w-full p-2 pl-8 border border-slate-300 rounded mt-1" 
                     value={contact.pec || ''} onChange={e => handleChange(`${path}.pec`, e.target.value)} />
            </div>
         </div>
         <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Telefono</label>
            <div className="relative">
              <Phone className="absolute left-2 top-2.5 w-4 h-4 text-slate-400"/>
              <input type="tel" className="w-full p-2 pl-8 border border-slate-300 rounded mt-1" 
                     value={contact.phone || ''} onChange={e => handleChange(`${path}.phone`, e.target.value)} />
            </div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
                {section === 'general' && 'Dati Generali Appalto'}
                {section === 'subjects' && 'Soggetti Responsabili'}
                {section === 'tender' && 'Fase di Gara'}
                {section === 'contractor' && 'Dati Impresa'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">Gestione anagrafica e configurazione appalto.</p>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-xs text-green-600 font-medium flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
               <Save className="w-3 h-3" /> Auto-save
             </span>
          </div>
      </div>

      {/* --- SECTION: GENERALI --- */}
      {section === 'general' && (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Inquadramento</h3>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Ente Appaltante</label>
                        <input type="text" className="w-full p-3 border border-slate-300 rounded-lg mt-1 uppercase font-bold"
                            value={data.entity} onChange={(e) => handleChange('entity', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Oggetto Lavori</label>
                        <textarea className="w-full p-3 border border-slate-300 rounded-lg mt-1 h-24"
                            value={data.projectName} onChange={(e) => handleChange('projectName', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">CUP</label>
                            <input type="text" className="w-full p-3 border border-slate-300 rounded-lg mt-1 uppercase"
                                value={data.cup} onChange={(e) => handleChange('cup', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">CIG</label>
                            <input type="text" className="w-full p-3 border border-slate-300 rounded-lg mt-1 uppercase"
                                value={data.cig || ''} onChange={(e) => handleChange('cig', e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Dati Contratto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Data Stipula</label>
                        <input type="date" className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                            value={data.contract.date} onChange={(e) => handleChange('contract.date', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Rep. N.</label>
                        <input type="text" className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                            value={data.contract.repNumber} onChange={(e) => handleChange('contract.repNumber', e.target.value)} />
                    </div>
                </div>
                
                <div className="mt-4 p-4 bg-slate-50 rounded border border-slate-200">
                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Registrazione</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <input type="text" placeholder="Luogo" className="p-2 border rounded" value={data.contract.regPlace} onChange={e => handleChange('contract.regPlace', e.target.value)} />
                        <input type="text" placeholder="Data" className="p-2 border rounded" value={data.contract.regDate} onChange={e => handleChange('contract.regDate', e.target.value)} />
                        <input type="text" placeholder="Numero" className="p-2 border rounded" value={data.contract.regNumber} onChange={e => handleChange('contract.regNumber', e.target.value)} />
                        <input type="text" placeholder="Serie" className="p-2 border rounded" value={data.contract.regSeries} onChange={e => handleChange('contract.regSeries', e.target.value)} />
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Importo Totale (€)</label>
                        <input type="text" className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                            value={data.contract.totalAmount} onChange={(e) => handleChange('contract.totalAmount', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Oneri Sicurezza (€)</label>
                        <input type="text" className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                            value={data.contract.securityCosts} onChange={(e) => handleChange('contract.securityCosts', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Durata Lavori (giorni)</label>
                        <input type="number" className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                            value={data.contract.durationDays} onChange={(e) => handleChange('contract.durationDays', e.target.value)} />
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- SECTION: SOGGETTI --- */}
      {section === 'subjects' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ContactCard label="Responsabile Unico di Progetto (RUP)" path="subjects.rup" contact={data.subjects.rup} />
            <ContactCard label="Direttore dei Lavori (DL)" path="subjects.dl" contact={data.subjects.dl} />
            <ContactCard label="Coordinatore Sicurezza Esecuzione (CSE)" path="subjects.cse" contact={data.subjects.cse} />
            <ContactCard label="Coordinatore Sicurezza Progettazione (CSP)" path="subjects.csp" contact={data.subjects.csp} />
            <ContactCard label="Verificatore" path="subjects.verifier" contact={data.subjects.verifier} />
            
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm mb-4 border-l-4 border-l-blue-500">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500"/> Collaudatore
                </h4>
                <ContactCard label="" path="subjects.tester" contact={data.subjects.tester} />
                
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <h5 className="font-bold text-sm text-slate-700 mb-2">Estremi Nomina</h5>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Tipo atto (es. Determina)" className="p-2 border rounded" 
                            value={data.subjects.testerAppointment.nominationType} onChange={e => handleChange('subjects.testerAppointment.nominationType', e.target.value)} />
                        <input type="text" placeholder="Numero" className="p-2 border rounded" 
                            value={data.subjects.testerAppointment.nominationNumber} onChange={e => handleChange('subjects.testerAppointment.nominationNumber', e.target.value)} />
                        <input type="date" className="p-2 border rounded" 
                            value={data.subjects.testerAppointment.nominationDate} onChange={e => handleChange('subjects.testerAppointment.nominationDate', e.target.value)} />
                    </div>
                    <div className="flex gap-4 mt-2">
                         <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.subjects.testerAppointment.isStatic} onChange={e => handleChange('subjects.testerAppointment.isStatic', e.target.checked)}/> Statico</label>
                         <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.subjects.testerAppointment.isAdmin} onChange={e => handleChange('subjects.testerAppointment.isAdmin', e.target.checked)}/> Amm.</label>
                         <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.subjects.testerAppointment.isFunctional} onChange={e => handleChange('subjects.testerAppointment.isFunctional', e.target.checked)}/> Funzionale</label>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- SECTION: GARA --- */}
      {section === 'tender' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Verbali Fase di Gara e Progettazione</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Data Verbale Verifica Progetto</label>
                    <input type="date" className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                        value={data.tenderPhase.verificationMinutesDate} onChange={(e) => handleChange('tenderPhase.verificationMinutesDate', e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Data Verbale Validazione Progetto</label>
                    <input type="date" className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                        value={data.tenderPhase.validationMinutesDate} onChange={(e) => handleChange('tenderPhase.validationMinutesDate', e.target.value)} />
                </div>
            </div>
        </div>
      )}

      {/* --- SECTION: IMPRESA --- */}
      {section === 'contractor' && (
        <div className="space-y-6">
            <ContactCard label="Impresa Appaltatrice (o Mandataria)" path="contractor" contact={data.contractor} />
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Struttura Societaria</h3>
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-100 px-3 py-1 rounded">
                        <input type="checkbox" checked={data.contractor.isATI} onChange={e => handleChange('contractor.isATI', e.target.checked)} />
                        <span className="text-sm font-medium">È un'ATI (Associazione Temporanea)</span>
                    </label>
                </div>
                
                {data.contractor.isATI && (
                   <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                      <h4 className="font-bold text-yellow-800 mb-2">Imprese Mandanti</h4>
                      {/* Qui si potrebbe aggiungere logica per aggiungere N mandanti. Per ora semplificato. */}
                      <p className="text-sm text-yellow-700 italic">Funzionalità gestione mandanti ATI multipli in sviluppo...</p>
                   </div>
                )}

                <div className="pt-4 border-t border-slate-200">
                   <h4 className="font-bold text-slate-800 mb-2">Subappaltatori</h4>
                   {data.contractor.subcontractors.map((sub, idx) => (
                       <div key={idx} className="flex gap-2 mb-2">
                           <input type="text" value={sub.name} readOnly className="flex-1 p-2 border bg-slate-50 rounded"/>
                           <button onClick={() => {
                               const newSubs = [...data.contractor.subcontractors];
                               newSubs.splice(idx, 1);
                               handleChange('contractor.subcontractors', newSubs);
                           }} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 className="w-4 h-4"/></button>
                       </div>
                   ))}
                   <button onClick={() => {
                       const name = prompt("Nome Subappaltatore:");
                       if(name) {
                           handleChange('contractor.subcontractors', [...data.contractor.subcontractors, { name, activity: '' }]);
                       }
                   }} className="flex items-center gap-2 text-sm text-blue-600 hover:underline mt-2">
                       <Plus className="w-4 h-4"/> Aggiungi Subappaltatore
                   </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};
