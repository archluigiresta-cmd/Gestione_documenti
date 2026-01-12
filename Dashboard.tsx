
import React from 'react';
import { ProjectConstants, User } from '../types';
import { FolderPlus, Trash2, Shield, Share2, Building2, Calendar, ChevronUp, ChevronDown, Download } from 'lucide-react';

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
  onShareProject,
  onOpenAdmin,
  onUpdateOrder,
  onMoveProject,
  onExportData,
  currentUser
}) => {

  const formatDate = (dateString: string) => {
      if (!dateString) return '-';
      try {
          return new Date(dateString).toLocaleDateString('it-IT');
      } catch {
          return dateString;
      }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">I Miei Appalti</h1>
          <p className="text-slate-500 mt-2">Gestione opere pubbliche: elenco interventi e stato avanzamento.</p>
        </div>
        <div className="flex gap-3">
             <button
                onClick={onExportData}
                className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-3 rounded-lg shadow-sm flex items-center gap-2 font-medium transition-colors text-sm"
             >
                <Download className="w-5 h-5"/>
                Backup
             </button>
             {currentUser?.isSystemAdmin && (
                 <button 
                   onClick={onOpenAdmin}
                   className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-3 rounded-lg shadow-md flex items-center gap-2 font-medium transition-colors text-sm"
                 >
                    <Shield className="w-5 h-5" />
                    Admin
                 </button>
             )}
            <button
              onClick={onNewProject}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow-md flex items-center gap-2 font-medium transition-colors text-sm"
            >
              <FolderPlus className="w-5 h-5" />
              Nuovo
            </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow border border-slate-200">
          <h3 className="text-xl font-semibold text-slate-700">Nessun progetto presente</h3>
          <p className="text-slate-500 mt-2">Crea un nuovo appalto per iniziare.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider w-16 text-center">N.</th>
                            <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Ente Appaltante</th>
                            <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider w-1/3">Intervento</th>
                            <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Consegna</th>
                            <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider text-right">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {projects.map((project, index) => {
                            const isOwner = project.ownerId === currentUser?.id;
                            return (
                                <tr key={project.id} onClick={() => onSelectProject(project)} className="hover:bg-blue-50 cursor-pointer transition-colors group">
                                    <td className="p-4 align-top" onClick={e => e.stopPropagation()}>
                                        <div className="flex flex-col items-center gap-1">
                                            <input type="number" className="w-12 p-1 text-center border border-slate-200 rounded font-bold text-slate-700 text-xs outline-none" value={project.displayOrder || 0} onChange={(e) => onUpdateOrder(project.id, parseInt(e.target.value) || 0)}/>
                                        </div>
                                    </td>
                                    <td className="p-4 align-top font-bold uppercase text-slate-700">{project.entity || 'N/D'}</td>
                                    <td className="p-4 align-top font-medium text-slate-900">{project.projectName || 'Nuovo Progetto'}</td>
                                    <td className="p-4 align-top whitespace-nowrap">{formatDate(project.executionPhase?.deliveryDate)}</td>
                                    <td className="p-4 align-top text-right">
                                        <button className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded">Apri</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};
