
import React from 'react';
import { ProjectConstants } from '../types';
import { Save } from 'lucide-react';

interface ProjectFormProps {
  data: ProjectConstants;
  onChange: (data: ProjectConstants) => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ data, onChange }) => {
  
  const handleChange = (section: keyof ProjectConstants, field: string | null, value: string) => {
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Dati Costanti Appalto</h2>
            <p className="text-slate-500 text-sm mt-1">Queste informazioni verranno ripetute automaticamente su tutti i verbali.</p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            Project Config
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          
          {/* Entity & Main Info */}
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
            <label className="block text-sm font-medium text-slate-700">Oggetto dei Lavori (Titolo Progetto)</label>
            <textarea
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-24 uppercase"
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

      {/* Staff */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Soggetti Responsabili</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">RUP</label>
            <input
              type="text"
              className="w-full p-3 border border-slate-300 rounded-lg mt-1"
              value={data.staff.rup}
              onChange={(e) => handleChange('staff', 'rup', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Direttore dei Lavori</label>
            <input
              type="text"
              className="w-full p-3 border border-slate-300 rounded-lg mt-1"
              value={data.staff.direttoreLavori}
              onChange={(e) => handleChange('staff', 'direttoreLavori', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Collaudatore</label>
            <input
              type="text"
              className="w-full p-3 border border-slate-300 rounded-lg mt-1"
              value={data.staff.collaudatore}
              onChange={(e) => handleChange('staff', 'collaudatore', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Ispettore di Cantiere</label>
            <input
              type="text"
              className="w-full p-3 border border-slate-300 rounded-lg mt-1"
              value={data.staff.ispettoreCantiere}
              onChange={(e) => handleChange('staff', 'ispettoreCantiere', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Contractor */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Impresa Appaltatrice</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Ragione Sociale</label>
            <input
              type="text"
              className="w-full p-3 border border-slate-300 rounded-lg mt-1"
              value={data.contractor.name}
              onChange={(e) => handleChange('contractor', 'name', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Indirizzo Sede</label>
            <input
              type="text"
              className="w-full p-3 border border-slate-300 rounded-lg mt-1"
              value={data.contractor.address}
              onChange={(e) => handleChange('contractor', 'address', e.target.value)}
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700">Rappresentante Legale</label>
            <input
              type="text"
              className="w-full p-3 border border-slate-300 rounded-lg mt-1"
              value={data.contractor.repName}
              onChange={(e) => handleChange('contractor', 'repName', e.target.value)}
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

      {/* Contract Data */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Dati Contratto</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Num. Repertorio</label>
            <input
              type="text"
              className="w-full p-3 border border-slate-300 rounded-lg mt-1"
              value={data.contract.repNumber}
              onChange={(e) => handleChange('contract', 'repNumber', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Data Contratto</label>
            <input
              type="date"
              className="w-full p-3 border border-slate-300 rounded-lg mt-1"
              // Convert dd/mm/yyyy to yyyy-mm-dd if needed, but for simplicity we store raw text or adapt
              value={data.contract.date.includes('/') ? data.contract.date.split('/').reverse().join('-') : data.contract.date}
              onChange={(e) => handleChange('contract', 'date', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Scadenza Lavori</label>
            <input
               type="date"
              className="w-full p-3 border border-slate-300 rounded-lg mt-1"
              value={data.contract.deadline.includes('/') || data.contract.deadline.includes('.') ? data.contract.deadline.replace(/\./g, '-').split('-').reverse().join('-') : data.contract.deadline}
              onChange={(e) => handleChange('contract', 'deadline', e.target.value)}
            />
          </div>
          <div className="md:col-span-3">
             <label className="block text-sm font-medium text-slate-700">Dettagli Registrazione</label>
             <input
              type="text"
              placeholder="Es: Reg. il 11262 del 05/07/2023 Serie 1T"
              className="w-full p-3 border border-slate-300 rounded-lg mt-1"
              value={data.contract.registeredAt}
              onChange={(e) => handleChange('contract', 'registeredAt', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Importo Totale (€)</label>
            <input
              type="text"
              className="w-full p-3 border border-slate-300 rounded-lg mt-1"
              value={data.contract.totalAmount}
              onChange={(e) => handleChange('contract', 'totalAmount', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
