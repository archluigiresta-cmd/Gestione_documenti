
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
          Gestione
        </div>
        <NavItem id="project" label="Dati Appalto" icon={Briefcase} />
        
        <div className="mt-8 mb-2 px-4 text-xs font-bold text-blue-300 uppercase tracking-wider opacity-70">
          Sopralluoghi
        </div>
        <NavItem id="works" label="Lavori Eseguiti" icon={HardHat} />
        <NavItem id="photos" label="Galleria Foto" icon={Camera} />
        
        <div className="mt-8 mb-2 px-4 text-xs font-bold text-blue-300 uppercase tracking-wider opacity-70">
          Output
        </div>
        <NavItem id="export" label="Esporta / Stampa" icon={FileOutput} />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-blue-900 bg-blue-950 text-center">
        <p className="text-[10px] text-blue-400">v1.2.0 &bull; Gestione Lavori Pubblici</p>
      </div>
    </div>
  );
};
