
import React, { useState } from 'react';
import { ProjectConstants, User } from '../types';
import { FolderPlus, Trash2, Building2, Calendar, Search, FileText, ChevronRight, MapPin, StickyNote, Clock } from 'lucide-react';

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

export const Dashboard: React.FC<DashboardProps> = ({ projects, onSelectProject, onNewProject, onDeleteProject }) => {
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
          <p className="text-slate-500 font-medium mt-1">Ufficio Tecnico Digitale</p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
             <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors"/>
             <input 
                type="text" 
                placeholder="Cerca appalto..." 
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
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ente e Provincia</th>
                        <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Oggetto Intervento</th>
                        <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cronoprogramma</th>
                        <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Note</th>
                        <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right"></th>
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
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Building2 className="w-4 h-4"/>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-800">{project.entity || '---'}</div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase">Provincia: {project.entityProvince || '---'}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-5">
                                <p className="text-sm font-medium text-slate-700 line-clamp-2 max-w-xs">{project.projectName || 'Nuovo Appalto'}</p>
                                <div className="text-[10px] text-slate-400 mt-1 font-mono uppercase">CUP: {project.cup || '---'}</div>
                            </td>
                            <td className="p-5">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                        <Clock className="w-3 h-3 text-blue-500"/> {project.executionPhase.deliveryDate || 'N.D.'}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                        <Calendar className="w-3 h-3 text-green-500"/> {project.executionPhase.completionDate || 'N.D.'}
                                    </div>
                                </div>
                            </td>
                            <td className="p-5">
                                <p className="text-xs text-slate-500 line-clamp-2 italic max-w-xs">{project.notes || 'Nessuna nota registrata.'}</p>
                            </td>
                            <td className="p-5 text-right">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
