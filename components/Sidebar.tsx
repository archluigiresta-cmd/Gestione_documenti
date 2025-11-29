
import React from 'react';
import { 
  FolderKanban, 
  Settings, 
  ArrowLeft, 
  HardHat, 
  Camera, 
  FileOutput,
  Briefcase
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: 'project' | 'works' | 'photos' | 'export') => void;
  onBackToDashboard: () => void;
  projectName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onBackToDashboard,
  projectName
}) => {
  
  const NavItem = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium mb-1 ${
        activeTab === id
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon className={`w-5 h-5 ${activeTab === id ? 'text-white' : 'text-blue-400'}`} />
      {label}
    </button>
  );

  return (
    <div className="w-64 bg-[#0f172a] text-white h-screen flex flex-col fixed left-0 top-0 no-print z-50 shadow-2xl border-r border-slate-800">
      
      {/* Header */}
      <div className="p-6 bg-[#020617]">
        <button 
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-xs uppercase tracking-widest font-bold transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Dashboard
        </button>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-600 rounded-lg">
             <Settings className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">EdilApp</span>
        </div>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {projectName || 'Nuovo Progetto'}
        </p>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
          Gestione
        </div>
        <NavItem id="project" label="Dati Appalto" icon={Briefcase} />
        
        <div className="mt-8 mb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
          Sopralluoghi
        </div>
        <NavItem id="works" label="Lavori Eseguiti" icon={HardHat} />
        <NavItem id="photos" label="Galleria Foto" icon={Camera} />
        
        <div className="mt-8 mb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
          Output
        </div>
        <NavItem id="export" label="Esporta / Stampa" icon={FileOutput} />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 bg-[#020617] text-center">
        <p className="text-[10px] text-slate-600">v1.2.0 &bull; Gestione Lavori Pubblici</p>
      </div>
    </div>
  );
};
