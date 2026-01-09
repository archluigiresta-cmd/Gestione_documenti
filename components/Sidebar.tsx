
import React from 'react';
import { 
  Building2, Users, HardHat, ClipboardCheck, ArrowLeft, Settings, LogOut, UserCircle,
  PencilRuler, Briefcase, ChevronRight
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onBackToDashboard: () => void;
  projectName: string;
  user: User | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, setActiveTab, onBackToDashboard, projectName, user, onLogout
}) => {
  
  const NavItem = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => {
    const isActive = activeTab.startsWith(id);
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all text-sm font-bold mb-1 ${
          isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-blue-200 hover:bg-blue-900/50'
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="truncate">{label}</span>
      </button>
    );
  };

  return (
    <div className="w-64 bg-slate-950 text-white h-screen flex flex-col fixed left-0 top-0 z-50 border-r border-slate-800">
      <div className="p-6">
        <button onClick={onBackToDashboard} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-8">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-600 rounded-lg"><Building2 className="w-5 h-5 text-white" /></div>
          <span className="font-black text-xl tracking-tighter">EdilApp</span>
        </div>
        <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest truncate">{projectName || 'Nuovo Progetto'}</p>
      </div>
      
      <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        <div className="mb-4">
          <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Dati Appalto</p>
          <NavItem id="general" label="Anagrafica" icon={Building2} />
          <NavItem id="design" label="Progettazione" icon={PencilRuler} />
          <NavItem id="subjects" label="Soggetti Responsabili" icon={Users} />
          <NavItem id="contractor" label="Appaltatore" icon={Briefcase} />
        </div>

        <div className="mb-4">
          <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Cantiere</p>
          <NavItem id="execution" label="Esecuzione Lavori" icon={HardHat} />
          <NavItem id="testing" label="Collaudo" icon={ClipboardCheck} />
        </div>
        
        <div className="pt-4 border-t border-slate-800">
          <NavItem id="export" label="Archivio Atti" icon={ClipboardCheck} />
        </div>
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-500/20 p-2 rounded-full"><UserCircle className="w-5 h-5 text-blue-400"/></div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase text-red-400 hover:bg-red-500/10 py-2 rounded-lg transition-colors">
          <LogOut className="w-3 h-3"/> Esci dal sistema
        </button>
      </div>
    </div>
  );
};
