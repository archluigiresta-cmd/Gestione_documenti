
import React, { useState } from 'react';
import { ProjectConstants, User } from '../types';
import { FolderPlus, Trash2, Building2, Calendar, Search, Clock } from 'lucide-react';

interface DashboardProps {
  projects: ProjectConstants[];
  onSelectProject: (project: ProjectConstants) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
  currentUser: User | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ projects, onSelectProject, onNewProject, onDeleteProject }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter(p => p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || p.entity.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <header className="max-w-7xl mx-auto flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4"><Building2 className="text-blue-600 w-10 h-10"/> Registro Appalti</h1>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">Ufficio Tecnico Professionale</p>
        </div>
        <div className="flex gap-4">
          <div className="relative"><Search className="absolute left-3 top-3 w-4 h-4 text-slate-400"/><input type="text" placeholder="Cerca appalto..." className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none w-80 shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
          <button onClick={onNewProject} className="bg-slate-900 hover:bg-black text-white px-8 py-2.5 rounded-xl font-bold shadow-xl flex items-center gap-2"><FolderPlus className="w-5 h-5"/> Nuovo Appalto</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ente / Provincia</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Oggetto Intervento</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cronoprogramma</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Note</th>
                        <th className="p-6 text-right"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredProjects.map(project => (
                        <tr key={project.id} onClick={() => onSelectProject(project)} className="group hover:bg-blue-50/40 cursor-pointer transition-all">
                            <td className="p-6">
                                <div className="text-sm font-black text-slate-900">{project.entity || '---'}</div>
                                <div className="text-[10px] font-black text-blue-500 uppercase">{project.entityProvince || '---'}</div>
                            </td>
                            <td className="p-6">
                                <p className="text-sm font-medium text-slate-700 line-clamp-2 max-w-sm">{project.projectName || '---'}</p>
                            </td>
                            <td className="p-6">
                                <div className="text-[10px] font-bold text-slate-600"><Clock className="inline w-3 h-3 mr-1 text-blue-500"/> {project.executionPhase.deliveryDate || 'N.D.'}</div>
                                <div className="text-[10px] font-bold text-slate-600"><Calendar className="inline w-3 h-3 mr-1 text-red-500"/> {project.executionPhase.completionDate || 'N.D.'}</div>
                            </td>
                            <td className="p-6">
                                <p className="text-xs text-slate-400 italic line-clamp-2">{project.notes || '---'}</p>
                            </td>
                            <td className="p-6 text-right">
                                <button onClick={(e) => { e.stopPropagation(); if(confirm('Eliminare?')) onDeleteProject(project.id); }} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4"/></button>
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
