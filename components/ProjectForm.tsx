
import React, { useEffect, useState } from 'react';
import { ProjectConstants, ContactInfo } from '../types';
import { Save, Calculator, Building, UserCheck, HardHat, FileSignature, FolderOpen, Briefcase, FileText, ShieldCheck, Mail, Phone, MapPin, User } from 'lucide-react';

interface ProjectFormProps {
  data: ProjectConstants;
  onChange: (data: ProjectConstants) => void;
}

type TabType = 'generale' | 'soggetti' | 'collaudatore' | 'impresa' | 'contratto' | 'documenti';

export const ProjectForm: React.FC<ProjectFormProps> = ({ data, onChange }) => {
  const [activeTab, setActiveTab] = useState<TabType>('generale');
  
  const handleChange = (section: keyof ProjectConstants, field: string | null, value: any) => {
    if (field && typeof data[section] === 'object') {
      onChange({
        ...data,
        [section]: {
          ...(data[section] as object),
          [field]: value
        }
      });
    } else {
      onChange({
        ...data,
        [section]: value
      });
    }
  };

  // Helper for deeply nested updates (staff.rup.email)
  const handleDeepChange = (section: 'staff' | 'contractor' | 'testerAppointment', subSection: string | null, field: keyof ContactInfo, value: string) => {
    if (section === 'staff' && subSection) {
       onChange({
         ...data,
         staff: {
           ...data.staff,
           [subSection]: {
             ...(data.staff as any)[subSection],
             [field]: value
           }
         }
       });
    } else if (section === 'contractor') {
       onChange({
         ...data,
         contractor: {
           ...data.contractor,
           [field]: value
         }
       });
    } else if (section === 'testerAppointment') {
       onChange({
          ...data,
          testerAppointment: {
             ...data.testerAppointment,
             contact: {
                ...data.testerAppointment.contact,
                [field]: value
             }
          }
       });
    }
  };

  // Auto-calculate deadline
  useEffect(() => {
    if (data.contract.handoverDate && data.contract.durationDays) {
      const start = new Date(data.contract.handoverDate);
      if (!isNaN(start.getTime())) {
        const end = new Date(start);
        end.setDate(start.getDate() + Number(data.contract.durationDays));
        const deadlineStr = end.toISOString().split('T')[0];
        
        if (data.contract.deadline !== deadlineStr) {
           handleChange('contract', 'deadline', deadlineStr);
        }
      }
    }
  }, [data.contract.handoverDate, data.contract.durationDays]);

  const TabButton = ({ id, label, icon: Icon }: { id: TabType, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
        activeTab === id 
          ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  const ContactFields = ({ 
    label, 
    contact, 
    onChange 
  }: { 
    label: string, 
    contact: ContactInfo, 
    onChange: (field: keyof ContactInfo, val: string) => void 
  }) => (
    <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
         <User className="w-4 h-4 text-blue-500"/> {label}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">Nome / Ragione Sociale</label>
            <input type="text" className="w-full p-2 border border-slate-300 rounded mt-1" value={contact.name} onChange={e => onChange('name', e.target.value)} />
         </div>
         {contact.title !== undefined && (
             <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Titolo</label>
                <input type="text" placeholder="Arch. / Ing." className="w-full p-2 border border-slate-300 rounded mt-1" value={contact.title} onChange={e => onChange('title', e.target.value)} />
             </div>
         )}
         <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Email</label>
            <div className="relative">
              <Mail className="absolute left-2 top-2.5 w-4 h-4 text-slate-400"/>
              <input type="email" className="w-full p-2 pl-8 border border-slate-300 rounded mt-1" value={contact.email || ''} onChange={e => onChange('email', e.target.value)} />
            </div>
         </div>
         <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">PEC</label>
            <div className="relative">
              <ShieldCheck className="absolute left-2 top-2.5 w-4 h-4 text-slate-400"/>
              <input type="email" className="w-full p-2 pl-8 border border-slate-300 rounded mt-1" value={contact.pec || ''} onChange={e => onChange('pec', e.target.value)} />
            </div>
         </div>
         <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Telefono</label>
            <div className="relative">
              <Phone className="absolute left-2 top-2.5 w-4 h-4 text-slate-400"/>
              <input type="tel" className="w-full p-2 pl-8 border border-slate-300 rounded mt-1" value={contact.phone || ''} onChange={e => onChange('phone', e.target.value)} />
            </div>
         </div>
         {contact.address !== undefined && (
            <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Indirizzo</label>
                <div className="relative">
                  <MapPin className="absolute left-2 top-2.5 w-4 h-4 text-slate-400"/>
                  <input type="text" className="w-full p-2 pl-8 border border-slate-300 rounded mt-1" value={contact.address || ''} onChange={e => onChange('address', e.target.value)} />
                </div>
            </div>
         )}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Dati Appalto</h2>
            <p className="text-slate-500 text-sm mt-1">Gestisci le informazioni costanti e i contatti.</p>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-xs text-green-600 font-medium flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
               <Save className="w-3 h-3" /> Salvataggio automatico
             </span>
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs Header */}
        <div className="flex overflow-x-auto border-b border-slate-200 scrollbar-hide">
          <TabButton id="generale" label="Dati Generali" icon={Building} />
          <TabButton id="soggetti" label="Soggetti Responsabili" icon={UserCheck} />
          <TabButton id="collaudatore" label="Dati Collaudatore" icon={FileSignature} />
          <TabButton id="impresa" label="Impresa" icon={HardHat} />
          <TabButton id="contratto" label="Contratto Appalto" icon={Briefcase} />
          <TabButton id="documenti" label="Documenti Consegna" icon={FolderOpen} />
        </div>

        <div className="p-8 bg-slate-50/30">
          
          {/* --- TAB GENERALE --- */}
          {activeTab === 'generale' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Ente Appaltante</label>
                  <input
                    type="text"
                    placeholder="Es. PROVINCIA DI TARANTO"
                    className="w-full p-3 border border-slate-300 rounded-lg mt-1 font-semibold uppercase"
                    value={data.entity}
                    onChange={(e) => handleChange('entity', null, e.target.value)}
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700">Oggetto dei Lavori</label>
                  <textarea
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24 uppercase"
                    value={data.projectName}
                    onChange={(e) => handleChange('projectName', null, e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div>
                    <label className="block text-sm font-medium text-slate-700">Luogo</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                      value={data.location}
                      onChange={(e) => handleChange('location', null, e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">CUP</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-slate-300 rounded-lg mt-1 font-mono uppercase"
                      value={data.cup}
                      onChange={(e) => handleChange('cup', null, e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB SOGGETTI --- */}
          {activeTab === 'soggetti' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ContactFields 
                label="RUP (Responsabile Unico)" 
                contact={data.staff.rup} 
                onChange={(f, v) => handleDeepChange('staff', 'rup', f, v)} 
              />
              <ContactFields 
                label="Direttore dei Lavori" 
                contact={data.staff.direttoreLavori} 
                onChange={(f, v) => handleDeepChange('staff', 'direttoreLavori', f, v)} 
              />
              <ContactFields 
                label="Ispettore di Cantiere" 
                contact={data.staff.ispettoreCantiere} 
                onChange={(f, v) => handleDeepChange('staff', 'ispettoreCantiere', f, v)} 
              />
              <ContactFields 
                label="CSE (Sicurezza)" 
                contact={data.staff.cse} 
                onChange={(f, v) => handleDeepChange('staff', 'cse', f, v)} 
              />
            </div>
          )}

          {/* --- TAB COLLAUDATORE --- */}
          {activeTab === 'collaudatore' && (
            <div className="space-y-6">
               <ContactFields 
                label="Dati Collaudatore" 
                contact={data.testerAppointment.contact} 
                onChange={(f, v) => handleDeepChange('testerAppointment', null, f, v)} 
               />

               <div className="bg-white p-6 rounded-lg border border-slate-200">
                 <h4 className="font-bold text-slate-800 mb-4">Dettagli Nomina</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Tipo Atto</label>
                      <input
                        type="text"
                        placeholder="Determina Dirigenziale"
                        className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                        value={data.testerAppointment.nominationType}
                        onChange={(e) => handleChange('testerAppointment', 'nominationType', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Numero Atto</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                        value={data.testerAppointment.nominationNumber}
                        onChange={(e) => handleChange('testerAppointment', 'nominationNumber', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Data Atto</label>
                      <input
                        type="date"
                        className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                        value={data.testerAppointment.nominationDate}
                        onChange={(e) => handleChange('testerAppointment', 'nominationDate', e.target.value)}
                      />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-slate-100">
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Rep. Contratto Incarico (Opzionale)</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                        value={data.testerAppointment.contractRep}
                        onChange={(e) => handleChange('testerAppointment', 'contractRep', e.target.value)}
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Data Contratto Incarico</label>
                      <input
                        type="date"
                        className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                        value={data.testerAppointment.contractDate}
                        onChange={(e) => handleChange('testerAppointment', 'contractDate', e.target.value)}
                      />
                   </div>
                 </div>

                 <div className="mt-4 pt-4 border-t border-slate-100">
                   <label className="block text-sm font-medium text-slate-700 mb-2">Tipologia Incarico</label>
                   <div className="flex flex-wrap gap-4">
                     {['isStatic', 'isAdmin', 'isFunctional'].map(type => (
                       <label key={type} className="flex items-center gap-2 border border-slate-200 p-3 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                         <input
                           type="checkbox"
                           checked={(data.testerAppointment as any)[type]}
                           onChange={(e) => handleChange('testerAppointment', type, e.target.checked)}
                           className="w-5 h-5 text-blue-600 rounded"
                         />
                         <span className="text-sm font-medium">
                            {type === 'isStatic' ? 'Statico' : type === 'isAdmin' ? 'Tecnico-Amm.' : 'Funzionale'}
                         </span>
                       </label>
                     ))}
                   </div>
                 </div>
               </div>
            </div>
          )}

          {/* --- TAB IMPRESA --- */}
          {activeTab === 'impresa' && (
            <div className="space-y-6">
               <ContactFields 
                label="Dati Azienda" 
                contact={data.contractor} 
                onChange={(f, v) => handleDeepChange('contractor', null, f, v)} 
               />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg border border-slate-200">
                  <div className="md:col-span-2">
                     <h4 className="font-bold text-slate-800 mb-2">Rappresentante Legale</h4>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Nome e Cognome</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                      value={data.contractor.repName}
                      onChange={(e) => handleChange('contractor', 'repName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Ruolo / Qualifica</label>
                    <input
                      type="text"
                      placeholder="Es. Direttore Tecnico"
                      className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                      value={data.contractor.repRole || ''}
                      onChange={(e) => handleChange('contractor', 'repRole', e.target.value)}
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-700">P. IVA / C.F.</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                      value={data.contractor.vat}
                      onChange={(e) => handleChange('contractor', 'vat', e.target.value)}
                    />
                  </div>
               </div>
            </div>
          )}

          {/* --- TAB CONTRATTO --- */}
          {activeTab === 'contratto' && (
            <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Data Stipula</label>
                  <input
                    type="date"
                    className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                    value={data.contract.date.includes('/') ? data.contract.date.split('/').reverse().join('-') : data.contract.date}
                    onChange={(e) => handleChange('contract', 'date', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Num. Repertorio</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                    value={data.contract.repNumber}
                    onChange={(e) => handleChange('contract', 'repNumber', e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Dettagli Registrazione</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase">Luogo</label>
                    <input type="text" className="w-full p-2 border border-slate-300 rounded mt-1" value={data.contract.regPlace} onChange={(e) => handleChange('contract', 'regPlace', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase">Data</label>
                    <input type="text" className="w-full p-2 border border-slate-300 rounded mt-1" value={data.contract.regDate} onChange={(e) => handleChange('contract', 'regDate', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase">Numero</label>
                    <input type="text" className="w-full p-2 border border-slate-300 rounded mt-1" value={data.contract.regNumber} onChange={(e) => handleChange('contract', 'regNumber', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase">Serie</label>
                    <input type="text" className="w-full p-2 border border-slate-300 rounded mt-1" value={data.contract.regSeries} onChange={(e) => handleChange('contract', 'regSeries', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Data Consegna Lavori</label>
                  <input
                    type="date"
                    className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                    value={data.contract.handoverDate || ''}
                    onChange={(e) => handleChange('contract', 'handoverDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Durata (Giorni)</label>
                  <input
                    type="number"
                    className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                    value={data.contract.durationDays || ''}
                    onChange={(e) => handleChange('contract', 'durationDays', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                    Scadenza <Calculator className="w-3 h-3 text-slate-400" />
                  </label>
                  <input
                    type="date"
                    readOnly
                    className="w-full p-3 border border-slate-300 rounded-lg mt-1 bg-slate-100 text-slate-500"
                    value={data.contract.deadline || ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Importo Contrattuale (€)</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                    value={data.contract.totalAmount}
                    onChange={(e) => handleChange('contract', 'totalAmount', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Di cui Oneri Sicurezza (€)</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                    value={data.contract.securityCosts}
                    onChange={(e) => handleChange('contract', 'securityCosts', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* --- TAB DOCUMENTI CONSEGNA --- */}
          {activeTab === 'documenti' && (
            <div className="space-y-6">
               <div className="bg-white p-6 rounded-lg border border-slate-200">
                 <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <FolderOpen className="w-4 h-4"/> Approvazione Progetto Esecutivo
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div>
                     <label className="block text-sm font-medium text-slate-700">Tipo Atto</label>
                     <input
                       type="text"
                       placeholder="Es. Determina Dirigenziale"
                       className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                       value={data.handoverDocs.projectApprovalType}
                       onChange={(e) => handleChange('handoverDocs', 'projectApprovalType', e.target.value)}
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700">N. Provvedimento</label>
                     <input
                       type="text"
                       className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                       value={data.handoverDocs.projectApprovalNumber}
                       onChange={(e) => handleChange('handoverDocs', 'projectApprovalNumber', e.target.value)}
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700">Data Provvedimento</label>
                     <input
                       type="date"
                       className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                       value={data.handoverDocs.projectApprovalDate}
                       onChange={(e) => handleChange('handoverDocs', 'projectApprovalDate', e.target.value)}
                     />
                   </div>
                 </div>
               </div>

               <div className="bg-white p-6 rounded-lg border border-slate-200">
                 <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <HardHat className="w-4 h-4"/> Verbale Consegna Lavori
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                     <label className="block text-sm font-medium text-slate-700">Tipo Consegna</label>
                     <select
                       className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                       value={data.handoverDocs.deliveryType}
                       onChange={(e) => handleChange('handoverDocs', 'deliveryType', e.target.value)}
                     >
                       <option value="ordinary">Ordinaria</option>
                       <option value="anticipated">Anticipata</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700">Data Verbale</label>
                     <input
                       type="date"
                       className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                       value={data.handoverDocs.deliveryDate}
                       onChange={(e) => handleChange('handoverDocs', 'deliveryDate', e.target.value)}
                     />
                   </div>
                 </div>
               </div>

               <div className="bg-white p-6 rounded-lg border border-slate-200">
                 <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <FileText className="w-4 h-4"/> Inizio Lavori Strutturale (AINOP)
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                   <div>
                     <label className="block text-sm font-medium text-slate-700">Protocollo Report AINOP</label>
                     <input
                       type="text"
                       className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                       value={data.handoverDocs.ainopProtocol}
                       onChange={(e) => handleChange('handoverDocs', 'ainopProtocol', e.target.value)}
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700">Data AINOP</label>
                     <input
                       type="date"
                       className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                       value={data.handoverDocs.ainopDate}
                       onChange={(e) => handleChange('handoverDocs', 'ainopDate', e.target.value)}
                     />
                   </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-sm font-medium text-slate-700">Acquisito al Comune Prot. N.</label>
                     <input
                       type="text"
                       className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                       value={data.handoverDocs.municipalityProtocol}
                       onChange={(e) => handleChange('handoverDocs', 'municipalityProtocol', e.target.value)}
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700">Data Acquisizione</label>
                     <input
                       type="date"
                       className="w-full p-3 border border-slate-300 rounded-lg mt-1"
                       value={data.handoverDocs.municipalityDate}
                       onChange={(e) => handleChange('handoverDocs', 'municipalityDate', e.target.value)}
                     />
                   </div>
                 </div>
               </div>

               <div className="bg-white p-6 rounded-lg border border-slate-200">
                 <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4"/> Altri Documenti e Sicurezza
                 </h3>
                 
                 <div className="space-y-4">
                   {/* Bolle Discarica */}
                   <label className="flex items-center gap-3 p-3 bg-slate-50 rounded cursor-pointer border border-transparent hover:border-blue-200 transition-colors">
                      <input 
                        type="checkbox"
                        className="w-5 h-5 text-blue-600 rounded"
                        checked={data.handoverDocs.hasWasteNotes}
                        onChange={(e) => handleChange('handoverDocs', 'hasWasteNotes', e.target.checked)}
                      />
                      <span className="text-sm font-medium text-slate-700">4. Bolle di conferimento a discarica del materiale da scavo</span>
                   </label>

                   {/* POS */}
                   <label className="flex items-center gap-3 p-3 bg-slate-50 rounded cursor-pointer border border-transparent hover:border-blue-200 transition-colors">
                      <input 
                        type="checkbox"
                        className="w-5 h-5 text-blue-600 rounded"
                        checked={data.handoverDocs.hasUpdatedPOS}
                        onChange={(e) => handleChange('handoverDocs', 'hasUpdatedPOS', e.target.checked)}
                      />
                      <span className="text-sm font-medium text-slate-700">5. POS aggiornato</span>
                   </label>

                   {/* Cronoprogramma */}
                   <label className="flex items-center gap-3 p-3 bg-slate-50 rounded cursor-pointer border border-transparent hover:border-blue-200 transition-colors">
                      <input 
                        type="checkbox"
                        className="w-5 h-5 text-blue-600 rounded"
                        checked={data.handoverDocs.hasUpdatedSchedule}
                        onChange={(e) => handleChange('handoverDocs', 'hasUpdatedSchedule', e.target.checked)}
                      />
                      <span className="text-sm font-medium text-slate-700">6. Cronoprogramma dei lavori aggiornato</span>
                   </label>

                   {/* Notifica Preliminare */}
                   <div className="bg-slate-50 rounded border border-transparent hover:border-blue-200 transition-colors">
                      <label className="flex items-center gap-3 p-3 cursor-pointer">
                        <input 
                          type="checkbox"
                          className="w-5 h-5 text-blue-600 rounded"
                          checked={data.handoverDocs.hasPreliminaryNotification}
                          onChange={(e) => handleChange('handoverDocs', 'hasPreliminaryNotification', e.target.checked)}
                        />
                        <span className="text-sm font-medium text-slate-700">7. Notifica Preliminare</span>
                      </label>
                      
                      {data.handoverDocs.hasPreliminaryNotification && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 pt-0 ml-8">
                           <div>
                             <label className="block text-xs font-medium text-slate-500 uppercase">Notifica N.</label>
                             <input
                               type="text"
                               className="w-full p-2 border border-slate-300 rounded mt-1 text-sm"
                               value={data.handoverDocs.preliminaryNotifNumber}
                               onChange={(e) => handleChange('handoverDocs', 'preliminaryNotifNumber', e.target.value)}
                             />
                           </div>
                           <div>
                             <label className="block text-xs font-medium text-slate-500 uppercase">Data Notifica</label>
                             <input
                               type="date"
                               className="w-full p-2 border border-slate-300 rounded mt-1 text-sm"
                               value={data.handoverDocs.preliminaryNotifDate}
                               onChange={(e) => handleChange('handoverDocs', 'preliminaryNotifDate', e.target.value)}
                             />
                           </div>
                        </div>
                      )}
                   </div>

                   <div className="bg-slate-50 rounded border border-transparent hover:border-blue-200 transition-colors">
                     <label className="flex items-center gap-3 p-3 cursor-pointer">
                        <input 
                          type="checkbox"
                          className="w-5 h-5 text-blue-600 rounded"
                          checked={data.handoverDocs.hasOtherDocs}
                          onChange={(e) => handleChange('handoverDocs', 'hasOtherDocs', e.target.checked)}
                        />
                        <span className="text-sm font-medium text-slate-700">Altro Documento (Specificare)</span>
                     </label>
                     {data.handoverDocs.hasOtherDocs && (
                       <div className="p-3 pt-0 ml-8">
                         <textarea
                           className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                           placeholder="Descrivi qui il documento aggiuntivo..."
                           value={data.handoverDocs.otherDocsDescription}
                           onChange={(e) => handleChange('handoverDocs', 'otherDocsDescription', e.target.value)}
                         />
                       </div>
                     )}
                   </div>
                 </div>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
