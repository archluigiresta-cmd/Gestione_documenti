
import React from 'react';
import { 
  Building2, 
  Users, 
  Gavel, 
  HardHat, 
  Activity, 
  ClipboardCheck, 
  FileOutput, 
  ArrowLeft,
  Settings,
  PencilRuler,
  LogOut,
  UserCircle
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: 'general' | 'design' | 'subjects' | 'tender' | 'contractor' | 'execution' | 'testing' | 'export') => void;
  onBackToDashboard: () => void;
  projectName: string;
  user: User | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onBackToDashboard,
  projectName,
  user,
  onLogout
}) => {
  
  const NavItem = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium mb-1 ${
        activeTab === id
          ? 'bg-blue-500 text-white shadow-lg shadow-blue-900/50' 
          : 'text-blue-200 hover:bg-blue-900 hover:text-white'
      }`}
    >
      <Icon className={`w-5 h-5 ${activeTab === id ? 'text-white' : 'text-blue-400'}`} />
      {label}
    </button>
  );

  return (
    <div className="w-64 bg-blue-950 text-white h-screen flex flex-col fixed left-0 top-0 no-print z-50 shadow-2xl border-r border-blue-900">
      
      {/* Header */}
      <div className="p-6 bg-blue-900 border-b border-blue-800">
        <button 
          onClick={onBackToDashboard}
          className="w-full flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-700 text-blue-100 hover:text-white py-2 px-3 rounded-lg mb-6 text-xs uppercase tracking-widest font-bold transition-all shadow-sm border border-blue-700"
        >
          <ArrowLeft className="w-3 h-3" /> Dashboard
        </button>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/30">
             <Settings className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">EdilApp</span>
        </div>
        <p className="text-xs text-blue-200 line-clamp-2 leading-relaxed opacity-80">
          {projectName || 'Nuovo Progetto'}
        </p>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-2 px-4 text-xs font-bold text-blue-300 uppercase tracking-wider opacity-70">
          Anagrafica
        </div>
        <NavItem id="general" label="Dati Generali" icon={Building2} />
        <NavItem id="design" label="Progettazione" icon={PencilRuler} />
        <NavItem id="subjects" label="Soggetti Responsabili" icon={Users} />
        <NavItem id="tender" label="Gara" icon={Gavel} />
        <NavItem id="contractor" label="Impresa" icon={HardHat} />
        
        <div className="mt-6 mb-2 px-4 text-xs font-bold text-blue-300 uppercase tracking-wider opacity-70">
          Cantiere
        </div>
        <NavItem id="execution" label="Esecuzione" icon={Activity} />
        <NavItem id="testing" label="Collaudo" icon={ClipboardCheck} />
        
        <div className="mt-6 mb-2 px-4 text-xs font-bold text-blue-300 uppercase tracking-wider opacity-70">
          Stampa
        </div>
        <NavItem id="export" label="Esporta" icon={FileOutput} />
      </div>

      {/* Footer User Profile */}
      <div className="p-4 border-t border-blue-900 bg-blue-950">
        <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-800 p-2 rounded-full">
                <UserCircle className="w-5 h-5 text-blue-200"/>
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">{user?.name || 'Utente'}</p>
                <p className="text-xs text-blue-400 truncate">{user?.email}</p>
            </div>
        </div>
        <button 
           onClick={onLogout}
           className="w-full flex items-center justify-center gap-2 text-xs text-red-300 hover:text-white hover:bg-red-900/50 py-2 rounded transition-colors"
        >
            <LogOut className="w-3 h-3"/> Esci
        </button>
      </div>
    </div>
  );
};
