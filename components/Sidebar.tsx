
import React from 'react';
import { 
  Building2, Users, Gavel, HardHat, Activity, ClipboardCheck, FileOutput, ArrowLeft, Settings, PencilRuler, LogOut, UserCircle,
  Mail, ShieldCheck, ClipboardList, FileText, Euro
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
  
  const NavItem = ({ id, label, icon: Icon, sub = false }: { id: string, label: string, icon?: any, sub?: boolean }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id as any)}
        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm font-medium mb-0.5 ${
          sub ? (isActive ? 'bg-blue-800/40 text-white ml-5' : 'text-blue-300/60 hover:text-white hover:bg-blue-900/30 ml-5 font-normal') :
          (isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-200 hover:bg-blue-900 hover:text-white')
        }`}
      >
        {Icon && <Icon className={`${sub ? 'w-3.5 h-3.5 opacity-70' : 'w-5 h-5'}`} />}
        <span className={sub ? 'text-[13px]' : ''}>{label}</span>
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
        <div className="mb-2 px-4 text-[10px] font-bold text-blue-400 uppercase tracking-widest opacity-70">Moduli</div>
        <NavItem id="general" label="Anagrafica" icon={Building2} />
        <NavItem id="execution" label="Cantiere" icon={Activity} />
        <NavItem id="testing" label="Nuovo Verbale" icon={ClipboardCheck} />
        
        <div className="mt-8 mb-2 px-4 text-[10px] font-bold text-blue-400 uppercase tracking-widest opacity-70 border-t border-blue-900/50 pt-6">Archivio Esportazione</div>
        
        {/* Gruppo Collaudi con Sottovoci */}
        <div className="mb-1">
            <div className={`flex items-center gap-3 px-4 py-2 text-sm font-bold text-blue-200/50`}>
                <Gavel className="w-5 h-5" /> Collaudi
            </div>
            <NavItem id="export-testing-comm" label="Corrispondenza" icon={Mail} sub />
            <NavItem id="export-testing-clearance" label="Nullaosta" icon={ShieldCheck} sub />
            <NavItem id="export-testing-visits" label="Visite di collaudo" icon={ClipboardList} sub />
            <NavItem id="export-testing-reports" label="Relazioni" icon={FileText} sub />
        </div>

        <NavItem id="export-execution" label="Consegne" icon={Activity} />
        <NavItem id="export-suspensions" label="Sospensioni" icon={ClipboardList} />
        <NavItem id="export-accounting" label="Contabilità" icon={Euro} />
        <NavItem id="export-reports" label="Relazioni Finali" icon={FileText} />
      </div>

      <div className="p-4 border-t border-blue-900 bg-blue-950">
        <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-800 p-2 rounded-full"><UserCircle className="w-5 h-5 text-blue-200"/></div>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">{user?.name || 'Utente'}</p>
                <p className="text-xs text-blue-400 truncate">{user?.email}</p>
            </div>
        </div>
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-xs text-red-300 hover:text-white hover:bg-red-900/50 py-2 rounded transition-colors">
            <LogOut className="w-3 h-3"/> Esci
        </button>
      </div>
    </div>
  );
};
