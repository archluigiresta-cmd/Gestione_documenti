
import React from 'react';
import { ProjectConstants, User } from '../types';
import { FolderPlus, Trash2, Shield, Share2, Building2, Calendar, ClipboardList, ChevronUp, ChevronDown, Download, LayoutDashboard } from 'lucide-react';

interface DashboardProps {
  projects: ProjectConstants[];
  onSelectProject: (project: ProjectConstants) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
  onShareProject: (id: string) => void; 
  onOpenAdmin: () => void;
  onOpenSummary: () => void;
  onOpenCalendar: () => void;
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
  onShareProject,
  onOpenAdmin,
  onOpenSummary,
  onOpenCalendar,
  onUpdateOrder,
  onMoveProject,
  onExportData,
  currentUser
}) => {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">I Miei Appalti</h1>
          <p className="text-slate-500 mt-2 font-medium">Benvenuto nel portale di gestione collaudi.</p>
        </div>
        <div className="flex gap-3">
             <button onClick={onOpenCalendar} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-5 py-3 rounded-xl shadow-sm flex items-center gap-2 font-bold transition-all text-sm">
                <Calendar className="w-5 h-5 text-blue-500"/> Calendario
             </button>
             <button onClick={onOpenSummary} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-5 py-3 rounded-xl shadow-sm flex items-center gap-2 font-bold transition-all text-sm">
                <ClipboardList className="w-5 h-5 text-blue-500"/> Riepilogo Visite
             </button>
             {currentUser?.isSystemAdmin && (
                 <button onClick={onOpenAdmin} className="bg-slate-800 hover:bg-slate-950 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 font-bold transition-all text-sm">
                    <Shield className="w-5 h-5" /> Admin
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
                            <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest w-16 text-center">N.</th>
                            <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Ente Appaltante</th>
                            <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Oggetto Intervento</th>
                            <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {projects.map((project, index) => (
                            <tr key={project.id} onClick={() => onSelectProject(project)} className="hover:bg-blue-50/50 cursor-pointer transition-colors group">
                                <td className="p-5 text-center font-bold text-slate-400 text-sm">{index + 1}</td>
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg"><Building2 className="w-5 h-5 text-blue-600"/></div>
                                        <span className="font-bold text-slate-700">{project.entity}</span>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <div className="font-bold text-slate-900 line-clamp-1">{project.projectName}</div>
                                    <div className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">CUP: {project.cup || 'N/D'}</div>
                                </td>
                                <td className="p-5 text-right">
                                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-lg hover:bg-slate-100 shadow-sm transition-all group-hover:border-blue-300 group-hover:text-blue-600">Apri Fascicolo</button>
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
