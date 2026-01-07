
import React, { useState } from 'react';
import { 
  Building2, Users, Gavel, HardHat, Activity, ClipboardCheck, ArrowLeft, Settings, LogOut, UserCircle,
  Mail, ShieldCheck, ClipboardList, FileText, PencilRuler, Briefcase, ChevronDown, ChevronRight
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onBackToDashboard: () => void;
  projectName: string;
  user: User | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, setActiveTab, onBackToDashboard, projectName, user, onLogout
}) => {
  const [collOpen, setCollOpen] = useState(true);
  const [corrOpen, setCorrOpen] = useState(true);
  const [relOpen, setRelOpen] = useState(true);
  
  const NavItem = ({ id, label, icon: Icon, sub = 0 }: { id: string, label: string, icon?: any, sub?: number }) => {
    const isActive = activeTab === id;
    const paddingLeft = sub === 0 ? 'px-4' : sub === 1 ? 'pl-8 pr-4' : 'pl-12 pr-4';
    
    return (
      <button
        onClick={() => setActiveTab(id as any)}
        className={`w-full flex items-center gap-3 py-2 rounded-lg transition-all text-sm font-medium mb-0.5 ${paddingLeft} ${
          isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-200 hover:bg-blue-900 hover:text-white'
        }`}
      >
        {Icon && <Icon className="w-4 h-4 shrink-0" />}
        <span className="truncate">{label}</span>
      </button>
    );
  };

  return (
    <div className="w-64 bg-blue-950 text-white h-screen flex flex-col fixed left-0 top-0 no-print z-50 shadow-2xl border-r border-blue-900">
      <div className="p-6 bg-blue-900 border-b border-blue-800">
        <button onClick={onBackToDashboard} className="w-full flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-700 text-blue-100 py-2 px-3 rounded-lg mb-6 text-xs uppercase tracking-widest font-bold transition-all border border-blue-700">
          <ArrowLeft className="w-3 h-3" /> Dashboard
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500 rounded-lg shadow-lg"><Settings className="w-5 h-5 text-white" /></div>
          <span className="font-bold text-lg tracking-tight">EdilApp</span>
        </div>
        <p className="text-xs text-blue-200 line-clamp-2 leading-relaxed opacity-80">{projectName || 'Nuovo Progetto'}</p>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {/* PARTE 1: INSERIMENTO DATI */}
        <div className="mb-2 px-4 text-[10px] font-bold text-blue-400 uppercase tracking-widest opacity-70">Inserimento Dati</div>
        <NavItem id="general" label="Dati Generali" icon={Building2} />
        <NavItem id="subjects" label="Soggetti (RUP/DL/...)" icon={Users} />
        <NavItem id="design" label="Progettazione" icon={PencilRuler} />
        <NavItem id="contractor" label="Contratto / Appaltatore" icon={Briefcase} />
        <NavItem id="execution" label="Esecuzione / Cantiere" icon={HardHat} />
        <NavItem id="testing" label="Collaudo" icon={ClipboardCheck} />
        
        {/* PARTE 2: ARCHIVIO ESPORTAZIONE */}
        <div className="mt-8 mb-2 px-4 text-[10px] font-bold text-blue-400 uppercase tracking-widest opacity-70 border-t border-blue-900/50 pt-6">Archivio Esportazione</div>
        <NavItem id="export-design" label="Progettazione" icon={PencilRuler} />
        <NavItem id="export-dl" label="Direzione Lavori" icon={Activity} />
        
        {/* COLLAUDO ACCORDION */}
        <div className="mb-1">
            <button onClick={() => setCollOpen(!collOpen)} className="w-full flex items-center justify-between px-4 py-2 text-sm font-bold text-blue-200 hover:text-white transition-colors">
                <div className="flex items-center gap-3"><Gavel className="w-4 h-4" /> Collaudo</div>
                {collOpen ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
            </button>
            
            {collOpen && (
              <div className="space-y-0.5 mt-1">
                  {/* Corrispondenza Sub-Accordion */}
                  <div>
                      <button onClick={() => setCorrOpen(!corrOpen)} className="w-full flex items-center justify-between pl-8 pr-4 py-1.5 text-xs font-semibold text-blue-300 hover:text-white">
                          <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5"/> Corrispondenza</div>
                          {corrOpen ? <ChevronDown className="w-3 h-3"/> : <ChevronRight className="w-3 h-3"/>}
                      </button>
                      {corrOpen && (
                        <>
                          <NavItem id="export-coll-req" label="Richiesta Autorizzazione" sub={2} />
                          <NavItem id="export-coll-conv" label="Lettera Convocazione" sub={2} />
                        </>
                      )}
                  </div>
                  
                  <NavItem id="export-coll-null" label="Nullaosta" icon={ShieldCheck} sub={1} />
                  <NavItem id="export-coll-visit" label="Verbale di Visita" icon={ClipboardList} sub={1} />
                  
                  {/* Relazioni Sub-Accordion */}
                  <div>
                      <button onClick={() => setRelOpen(!relOpen)} className="w-full flex items-center justify-between pl-8 pr-4 py-1.5 text-xs font-semibold text-blue-300 hover:text-white">
                          <div className="flex items-center gap-2"><FileText className="w-3.5 h-3.5"/> Relazioni</div>
                          {relOpen ? <ChevronDown className="w-3 h-3"/> : <ChevronRight className="w-3 h-3"/>}
                      </button>
                      {relOpen && (
                        <>
                          <NavItem id="export-coll-rel-ta" label="Tecnico Amministrativa" sub={2} />
                          <NavItem id="export-coll-rel-st" label="Statica" sub={2} />
                          <NavItem id="export-coll-rel-fi" label="Funzionale Impianti" sub={2} />
                        </>
                      )}
                  </div>
              </div>
            )}
        </div>
      </div>

      <div className="p-4 border-t border-blue-900 bg-blue-950">
        <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-800 p-2 rounded-full"><UserCircle className="w-5 h-5 text-blue-200"/></div>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">{user?.name || 'Utente'}</p>
            </div>
        </div>
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-xs text-red-300 hover:text-white hover:bg-red-900/50 py-2 rounded transition-colors">
            <LogOut className="w-3 h-3"/> Esci
        </button>
      </div>
    </div>
  );
};
