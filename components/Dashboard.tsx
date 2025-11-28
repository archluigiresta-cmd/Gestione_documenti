
import React from 'react';
import { ProjectConstants } from '../types';
import { FolderPlus, FileText, MapPin, Calendar, HardHat, Trash2, Building2 } from 'lucide-react';

interface DashboardProps {
  projects: ProjectConstants[];
  onSelectProject: (project: ProjectConstants) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ projects, onSelectProject, onNewProject, onDeleteProject }) => {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">I Miei Appalti</h1>
          <p className="text-slate-500 mt-2">Gestisci i documenti di collaudo per i tuoi interventi.</p>
        </div>
        <button
          onClick={onNewProject}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow-md flex items-center gap-2 font-medium transition-colors"
        >
          <FolderPlus className="w-5 h-5" />
          Nuovo Intervento
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow border border-slate-200">
          <HardHat className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700">Nessun progetto presente</h3>
          <p className="text-slate-500 mt-2 mb-6">Inizia creando un nuovo fascicolo per un appalto.</p>
          <button
            onClick={onNewProject}
            className="text-blue-600 font-medium hover:underline"
          >
            Crea il primo progetto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.sort((a,b) => b.lastModified - a.lastModified).map((project) => (
            <div 
              key={project.id} 
              className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden"
              onClick={() => onSelectProject(project)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if(confirm('Sei sicuro di voler eliminare questo appalto e tutti i verbali associati?')) {
                            onDeleteProject(project.id);
                        }
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    title="Elimina Appalto"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Entity Badge */}
                {project.entity && (
                   <div className="flex items-center gap-1 text-xs text-blue-600 font-bold uppercase tracking-wide mb-2">
                     <Building2 className="w-3 h-3" />
                     {project.entity}
                   </div>
                )}

                <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 min-h-[3rem]">
                  {project.projectName || 'Nuovo Progetto Senza Nome'}
                </h3>
                
                <div className="space-y-2 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{project.location || 'Luogo non definito'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Modificato il {new Date(project.lastModified).toLocaleDateString('it-IT')}</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-between items-center">
                 <span className="text-xs font-mono text-slate-500">CUP: {project.cup || '---'}</span>
                 <span className="text-xs text-blue-600 font-medium group-hover:translate-x-1 transition-transform">Apri &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
