
import React from 'react';
import { ProjectConstants, User } from '../types';
import { FolderPlus, Shield, Building2, Trash2, FolderOpen } from 'lucide-react';

interface DashboardProps {
  projects: ProjectConstants[];
  onSelectProject: (project: ProjectConstants) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
  onShareProject: (id: string) => void; 
  onOpenAdmin: () => void;
  onUpdateOrder: (id: string, newOrder: number) => void; 
  onMoveProject: (id: string, direction: 'up' | 'down') => void; 
  onExportData: () => void;
  currentUser: User | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  projects, 
  onSelectProject, 
  onNewProject, 
  onDeleteProject, 
  onOpenAdmin,
  currentUser
}) => {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">I Miei Appalti</h1>
          <p className="text-slate-500 mt-2 font-medium">Gestione documentale Opere Pubbliche.</p>
        </div>
        <div className="flex gap-3">
             {currentUser?.isSystemAdmin && (
                 <button onClick={onOpenAdmin} className="bg-slate-800 hover:bg-slate-950 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 font-bold transition-all text-sm">
                    <Shield className="w-5 h-5" /> Pannello Admin
                 </button>
             )}
            <button onClick={onNewProject} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-xl shadow-blue-500/20 flex items-center gap-2 font-bold transition-all text-sm">
              <FolderPlus className="w-5 h-5" /> Nuovo Appalto
            </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest w-16 text-center border-r">N.</th>
                            <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Ente Appaltante</th>
                            <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Oggetto Intervento</th>
                            <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {projects.map((project, index) => (
                            <tr key={project.id} className="hover:bg-blue-50/30 transition-colors group">
                                <td className="p-6 text-center font-bold text-slate-400 text-sm border-r">{index + 1}</td>
                                <td className="p-6 cursor-pointer" onClick={() => onSelectProject(project)}>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-600 transition-colors">
                                            <Building2 className="w-6 h-6 text-blue-600 group-hover:text-white"/>
                                        </div>
                                        <div>
                                            <span className="font-bold text-slate-800 block uppercase tracking-tight">{project.entity}</span>
                                            <span className="text-xs text-slate-400 font-medium">Provincia: {project.entityProvince || 'N/D'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6 cursor-pointer" onClick={() => onSelectProject(project)}>
                                    <div className="font-bold text-slate-900 leading-snug line-clamp-2 max-w-md">{project.projectName}</div>
                                    <div className="flex gap-4 mt-2">
                                        <div className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">CUP: {project.cup || 'N/D'}</div>
                                        <div className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">CIG: {project.cig || 'N/D'}</div>
                                    </div>
                                </td>
                                <td className="p-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => onSelectProject(project)} className="p-2.5 bg-white border border-slate-200 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white shadow-sm transition-all" title="Apri Fascicolo">
                                            <FolderOpen className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => onDeleteProject(project.id)} className="p-2.5 bg-white border border-slate-200 text-red-500 rounded-xl hover:bg-red-500 hover:text-white shadow-sm transition-all" title="Elimina Progetto">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {projects.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-32 text-center">
                                    <div className="max-w-xs mx-auto text-slate-400">
                                        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Building2 className="w-8 h-8 opacity-20" />
                                        </div>
                                        <p className="font-medium italic">Nessun appalto in archivio.</p>
                                        <button onClick={onNewProject} className="text-blue-600 font-bold text-sm mt-3 hover:underline">Clicca qui per iniziare il primo progetto</button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
      </div>
    </div>
  );
};
