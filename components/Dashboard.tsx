
import React from 'react';
import { ProjectConstants, User } from '../types';
import { FolderPlus, Trash2, Building2, Calendar, LayoutGrid, List, MoreVertical, Search, FileText } from 'lucide-react';

interface DashboardProps {
  projects: ProjectConstants[];
  onSelectProject: (project: ProjectConstants) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
  currentUser: User | null;
  // Altre prop per compatibilità ma semplificate
  onShareProject: (id: string) => void; 
  onOpenAdmin: () => void;
  onUpdateOrder: (id: string, newOrder: number) => void; 
  onMoveProject: (id: string, direction: 'up' | 'down') => void; 
  onExportData: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ projects, onSelectProject, onNewProject, onDeleteProject, currentUser }) => {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <header className="max-w-7xl mx-auto flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestione Appalti</h1>
          <p className="text-slate-500 font-medium">Benvenuto, {currentUser?.name}. Hai {projects.length} progetti attivi.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
             <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400"/>
             <input type="text" placeholder="Cerca appalto..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm" />
          </div>
          <button 
            onClick={onNewProject}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <FolderPlus className="w-5 h-5"/> Nuovo Progetto
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.length === 0 ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="p-6 bg-slate-50 rounded-full mb-4">
              <FileText className="w-12 h-12 text-slate-300"/>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Inizia il tuo primo appalto</h3>
            <p className="text-slate-500 mb-8">Non ci sono ancora progetti registrati in questo database locale.</p>
            <button onClick={onNewProject} className="text-blue-600 font-bold flex items-center gap-2 hover:underline">
               Crea ora il fascicolo digitale <FolderPlus className="w-4 h-4"/>
            </button>
          </div>
        ) : (
          projects.map(project => (
            <div 
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Building2 className="w-6 h-6"/>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 leading-tight h-14">
                {project.projectName || 'Senza Titolo'}
              </h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <Calendar className="w-4 h-4"/> {project.executionPhase.deliveryDate || 'Data N/D'}
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  {project.entity}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex -space-x-2">
                   <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold">RUP</div>
                   <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600">DL</div>
                   <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-green-600">COLL</div>
                </div>
                <span className="text-xs font-bold text-blue-600 group-hover:underline">Dettagli &gt;</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
