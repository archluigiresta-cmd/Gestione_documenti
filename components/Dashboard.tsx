
import React from 'react';
import { ProjectConstants, User } from '../types';
import { FolderPlus, Trash2, Shield, Share2, Building2, Calendar, ChevronUp, ChevronDown } from 'lucide-react';

interface DashboardProps {
  projects: ProjectConstants[];
  onSelectProject: (project: ProjectConstants) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
  onShareProject: (id: string) => void; 
  onOpenAdmin: () => void;
  onUpdateOrder: (id: string, newOrder: number) => void; // New
  onMoveProject: (id: string, direction: 'up' | 'down') => void; // New
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
             {currentUser?.isSystemAdmin && (
                 <button 
                   onClick={onOpenAdmin}
                   className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-3 rounded-lg shadow-md flex items-center gap-2 font-medium transition-colors text-sm"
                 >
                    <Shield className="w-5 h-5" />
                    Pannello Admin
                 </button>
             )}
            <button
              onClick={onNewProject}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow-md flex items-center gap-2 font-medium transition-colors text-sm"
            >
              <FolderPlus className="w-5 h-5" />
              Nuovo Intervento
            </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow border border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderPlus className="w-8 h-8 text-slate-400" />
          </div>
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider w-16 text-center">N.</th>
                            <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Ente Appaltante</th>
                            <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider w-1/3">Intervento</th>
                            <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Consegna</th>
                            <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Ultimazione</th>
                            <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider w-1/4">Note</th>
                            <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider text-right">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {projects.map((project, index) => {
                            const isOwner = project.ownerId === currentUser?.id;
                            const isFirst = index === 0;
                            const isLast = index === projects.length - 1;

                            return (
                                <tr 
                                    key={project.id} 
                                    onClick={() => onSelectProject(project)}
                                    className="hover:bg-blue-50 cursor-pointer transition-colors group"
                                >
                                    <td className="p-4 align-top" onClick={e => e.stopPropagation()}>
                                        <div className="flex flex-col items-center gap-1">
                                            <input 
                                              type="number" 
                                              className="w-12 p-1 text-center border border-slate-200 rounded font-bold text-slate-700 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                              value={project.displayOrder || 0}
                                              onChange={(e) => onUpdateOrder(project.id, parseInt(e.target.value) || 0)}
                                            />
                                            <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                  disabled={isFirst}
                                                  onClick={() => onMoveProject(project.id, 'up')}
                                                  className="p-0.5 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-20"
                                                >
                                                    <ChevronUp className="w-3 h-3"/>
                                                </button>
                                                <button 
                                                  disabled={isLast}
                                                  onClick={() => onMoveProject(project.id, 'down')}
                                                  className="p-0.5 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-20"
                                                >
                                                    <ChevronDown className="w-3 h-3"/>
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-blue-500 shrink-0"/>
                                            <span className="font-semibold text-slate-700 line-clamp-2" title={project.entity}>
                                                {project.entity || 'N/D'}
                                                {project.entityProvince && <span className="text-slate-400 font-normal ml-1">({project.entityProvince})</span>}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1 pl-6">
                                            CUP: {project.cup || '-'}
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="font-medium text-slate-900 line-clamp-2" title={project.projectName}>
                                            {project.projectName || 'Nuovo Progetto'}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                            <Shield className="w-3 h-3"/>
                                            {isOwner ? 'Proprietario' : 'Condiviso'}
                                        </div>
                                    </td>
                                    <td className="p-4 align-top whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Calendar className="w-3 h-3 text-slate-400"/>
                                            {formatDate(project.executionPhase?.deliveryDate)}
                                        </div>
                                    </td>
                                    <td className="p-4 align-top whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Calendar className="w-3 h-3 text-slate-400"/>
                                            {formatDate(project.executionPhase?.completionDate)}
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="text-slate-500 italic line-clamp-2 text-xs" title={project.generalNotes}>
                                            {project.generalNotes || '-'}
                                        </div>
                                    </td>
                                    <td className="p-4 align-top text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {isOwner && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onShareProject(project.id);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                    title="Condividi"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            {isOwner && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if(confirm('Sei sicuro di voler eliminare questo appalto?')) {
                                                            onDeleteProject(project.id);
                                                        }
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Elimina"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded hover:bg-slate-50 hover:text-blue-600">
                                                Apri
                                            </button>
                                        </div>
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
