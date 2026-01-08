
import React, { useState } from 'react';
import { ProjectConstants, User } from '../types';
import { FolderPlus, Trash2, Building2, Calendar, Search, FileText, ChevronRight, MapPin, Hash, ExternalLink } from 'lucide-react';

interface DashboardProps {
  projects: ProjectConstants[];
  onSelectProject: (project: ProjectConstants) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
  currentUser: User | null;
  onShareProject: (id: string) => void; 
  onOpenAdmin: () => void;
  onUpdateOrder: (id: string, newOrder: number) => void; 
  onMoveProject: (id: string, direction: 'up' | 'down') => void; 
  onExportData: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ projects, onSelectProject, onNewProject, onDeleteProject, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter(p => 
    p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.cup || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafafa] p-8 font-sans">
      <header className="max-w-7xl mx-auto flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Building2 className="text-blue-600 w-8 h-8"/> Dashboard Appalti
          </h1>
          <p className="text-slate-500 font-medium mt-1">Gestione digitale collaudi e direzione lavori</p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
             <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors"/>
             <input 
                type="text" 
                placeholder="Cerca per nome, ente o CUP..." 
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none w-80 shadow-sm transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
             />
          </div>
          <button 
            onClick={onNewProject}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <FolderPlus className="w-5 h-5"/> Nuovo Appalto
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        {filteredProjects.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="p-6 bg-slate-50 rounded-full mb-4">
              <FileText className="w-12 h-12 text-slate-300"/>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Nessun appalto trovato</h3>
            <p className="text-slate-500 mb-8 max-w-sm text-center">Inizia creando un nuovo fascicolo o controlla i filtri di ricerca.</p>
            <button onClick={onNewProject} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all">
               Crea Primo Appalto <FolderPlus className="w-5 h-5"/>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dettagli Appalto</th>
                        <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ente / Ubicazione</th>
                        <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Codici Identificativi</th>
                        <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Azioni</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredProjects.map(project => (
                        <tr 
                            key={project.id}
                            onClick={() => onSelectProject(project)}
                            className="group hover:bg-blue-50/30 transition-all cursor-pointer"
                        >
                            <td className="p-5">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-slate-100 text-slate-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <FileText className="w-5 h-5"/>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug mb-1 group-hover:text-blue-700">
                                            {project.projectName || 'Appalto Senza Titolo'}
                                        </h3>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                            <Calendar className="w-3 h-3"/> Modificato: {new Date(project.lastModified).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-5">
                                <div className="space-y-1">
                                    <div className="text-sm font-semibold text-slate-700">{project.entity}</div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <MapPin className="w-3 h-3"/> {project.location || 'Nessuna Ubicazione'}
                                    </div>
                                </div>
                            </td>
                            <td className="p-5">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-bold">
                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">CUP</span>
                                        <span className="font-mono text-slate-700">{project.cup || '---'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold">
                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">CIG</span>
                                        <span className="font-mono text-slate-700">{project.cig || '---'}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="p-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                                        className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        title="Elimina definitivamente"
                                    >
                                        <Trash2 className="w-5 h-5"/>
                                    </button>
                                    <div className="p-2.5 text-blue-500 bg-blue-50 rounded-xl">
                                        <ChevronRight className="w-5 h-5"/>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="p-4 bg-slate-50 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100">
                Totale Appalti: {filteredProjects.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
