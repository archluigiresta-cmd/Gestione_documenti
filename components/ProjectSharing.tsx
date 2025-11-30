
import React, { useState, useEffect } from 'react';
import { ProjectPermission, PermissionRole } from '../types';
import { db } from '../db';
import { Users, UserPlus, Shield, X, Check } from 'lucide-react';

interface ProjectSharingProps {
  projectId: string;
  onClose: () => void;
}

export const ProjectSharing: React.FC<ProjectSharingProps> = ({ projectId, onClose }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<PermissionRole>('viewer');
  const [permissions, setPermissions] = useState<ProjectPermission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPermissions();
  }, [projectId]);

  const loadPermissions = async () => {
    try {
        const perms = await db.getProjectPermissions(projectId);
        setPermissions(perms);
    } catch (e) {
        console.error(e);
    }
  };

  const handleShare = async () => {
    if(!email) return;
    setLoading(true);
    try {
        const newPerm: ProjectPermission = {
            id: crypto.randomUUID(),
            projectId,
            userEmail: email,
            role
        };
        await db.shareProject(newPerm);
        setEmail('');
        await loadPermissions();
    } catch (e) {
        alert("Errore durante la condivisione");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
       <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
             <h3 className="font-bold text-slate-800 flex items-center gap-2"><Users className="w-5 h-5"/> Condivisione Progetto</h3>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
          </div>
          
          <div className="p-6">
             <div className="flex gap-2 mb-6">
                <input 
                  type="email" 
                  placeholder="Email utente..." 
                  className="flex-1 p-2 border border-slate-300 rounded-lg text-sm"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <select 
                  className="p-2 border border-slate-300 rounded-lg text-sm bg-white"
                  value={role}
                  onChange={e => setRole(e.target.value as PermissionRole)}
                >
                    <option value="viewer">Viewer (Solo Lettura)</option>
                    <option value="editor">Editor (Modifica)</option>
                    <option value="admin">Admin (Gestione)</option>
                </select>
                <button 
                   onClick={handleShare} 
                   disabled={loading}
                   className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                   <UserPlus className="w-5 h-5"/>
                </button>
             </div>

             <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Utenti con accesso</h4>
             <div className="space-y-2 max-h-60 overflow-y-auto">
                 {permissions.length === 0 ? (
                     <p className="text-sm text-slate-400 italic">Nessun utente invitato.</p>
                 ) : (
                     permissions.map(p => (
                         <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                             <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-1.5 rounded-full"><Users className="w-4 h-4 text-blue-600"/></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">{p.userEmail}</p>
                                    <span className="text-xs px-2 py-0.5 bg-slate-200 rounded-full text-slate-600 uppercase tracking-wide">{p.role}</span>
                                </div>
                             </div>
                         </div>
                     ))
                 )}
             </div>
          </div>
       </div>
    </div>
  );
};
