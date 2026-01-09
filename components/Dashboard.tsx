
import React, { useState } from 'react';
import { ProjectConstants, User } from '../types';
import { FolderPlus, Trash2, Building2, Calendar, Search, Clock, ChevronRight } from 'lucide-react';

interface DashboardProps {
  projects: ProjectConstants[];
  onSelectProject: (project: ProjectConstants) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
  currentUser: User | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ projects, onSelectProject, onNewProject, onDeleteProject }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter(p => 
    p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.entity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 p-8 font-sans">
      <header className="max-w-7xl mx-auto flex items-center justify-between mb-16">
        <div>
          <h1 className="text-5xl font-black text-zinc-950 tracking-tighter flex items-center gap-5">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-500/20">
                <Building2 className="text-white w-10 h-10"/>
            </div>
            Registro Appalti
          </h1>
          <p className="text-zinc-400 font-bold mt-3 uppercase tracking-[0.3em] text-[10px] ml-1">Ufficio Tecnico Professionale</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400"/>
            <input 
                type="text" 
                placeholder="Cerca per ente o oggetto..." 
                className="pl-12 pr-6 py-3.5 bg-white border border-zinc-200 rounded-2xl text-sm outline-none w-96 shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all font-medium" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
          <button 
            onClick={onNewProject} 
            className="bg-zinc-950 hover:bg-zinc-800 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 transition-all active:scale-95"
          >
            <FolderPlus className="w-5 h-5 text-blue-400"/> Nuovo Appalto
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-zinc-200 overflow-hidden">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100">
                        <th className="p-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Ente Appaltante</th>
                        <th className="p-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Oggetto Intervento</th>
                        <th className="p-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tempi Esecuzione</th>
                        <th className="p-8 text-right"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                    {filteredProjects.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="p-20 text-center">
                                <Building2 className="w-16 h-16 text-zinc-200 mx-auto mb-4 opacity-50"/>
                                <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Nessun appalto trovato nel database</p>
                            </td>
                        </tr>
                    ) : (
                        filteredProjects.map(project => (
                            <tr 
                                key={project.id} 
                                onClick={() => onSelectProject(project)} 
                                className="group hover:bg-zinc-50/80 cursor-pointer transition-all"
                            >
                                <td className="p-8">
                                    <div className="text-sm font-black text-zinc-900">{project.entity || 'Ente non specificato'}</div>
                                    <div className="text-[10px] font-black text-blue-600 uppercase mt-1 tracking-widest">{project.entityProvince || '--'}</div>
                                </td>
                                <td className="p-8">
                                    <p className="text-sm font-bold text-zinc-700 line-clamp-2 max-w-md leading-relaxed">
                                        {project.projectName || 'Oggetto non inserito'}
                                    </p>
                                </td>
                                <td className="p-8">
                                    <div className="flex flex-col gap-2">
                                        <div className="text-[10px] font-black text-zinc-500 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            CONSEGNA: {project.executionPhase.deliveryDate || 'N.D.'}
                                        </div>
                                        <div className="text-[10px] font-black text-zinc-500 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            ULTIMAZIONE: {project.executionPhase.completionDate || 'N.D.'}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-8 text-right">
                                    <div className="flex items-center justify-end gap-4">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }} 
                                            className="p-3 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-xl hover:bg-red-50"
                                        >
                                            <Trash2 className="w-5 h-5"/>
                                        </button>
                                        <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-blue-600 transition-all"/>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        <p className="text-center mt-12 text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">
            Database v4.0.30 Stable • Sistema Crittografato Localmente
        </p>
      </div>
    </div>
  );
};
