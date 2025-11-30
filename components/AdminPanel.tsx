
import React, { useEffect, useState, useRef } from 'react';
import { User, BackupData } from '../types';
import { db } from '../db';
import { Shield, Users, Check, Ban, Crown, Download, Upload, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';

interface AdminPanelProps {
  onBack: () => void;
  currentUser: User;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'backup'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await db.getAllUsers();
      setUsers(allUsers);
    } catch (e) {
      alert("Errore caricamento utenti");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, status: 'active' | 'suspended') => {
    try {
      await db.updateUserStatus(userId, status);
      await loadUsers();
    } catch (e) {
      alert("Errore aggiornamento");
    }
  };

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
      if (!confirm("Sei sicuro di voler modificare i privilegi di amministratore per questo utente?")) return;
      try {
          // Keep status as is, just flip admin
          const user = users.find(u => u.id === userId);
          if (user) {
              await db.updateUserStatus(userId, user.status, !currentStatus);
              await loadUsers();
          }
      } catch (e) { alert("Errore"); }
  };

  const handleBackupDownload = async () => {
      try {
          const data = await db.getDatabaseBackup();
          const jsonString = JSON.stringify(data, null, 2);
          const blob = new Blob([jsonString], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `edilapp_backup_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } catch (e) {
          alert("Errore durante il backup");
      }
  };

  const handleBackupRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (ev) => {
          try {
              const json = JSON.parse(ev.target?.result as string) as BackupData;
              if (confirm(`Attenzione! Questo sovrascriverà tutti i dati attuali con quelli del backup (${json.projects.length} progetti). Continuare?`)) {
                  await db.restoreDatabaseBackup(json);
                  alert("Ripristino completato con successo. La pagina verrà ricaricata.");
                  window.location.reload();
              }
          } catch (err) {
              alert("File di backup non valido.");
          }
      };
      reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-slate-50 min-h-screen">
       <div className="flex items-center gap-4 mb-8">
           <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
               <ArrowLeft className="w-6 h-6 text-slate-600"/>
           </button>
           <div>
               <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                   <Shield className="w-8 h-8 text-blue-600"/> Pannello Amministrazione
               </h1>
               <p className="text-slate-500">Gestione Utenti e Manutenzione Sistema</p>
           </div>
       </div>

       <div className="flex gap-4 mb-8">
           <button 
             onClick={() => setActiveTab('users')}
             className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 shadow'}`}
           >
               <Users className="w-5 h-5"/> Gestione Utenti
           </button>
           <button 
             onClick={() => setActiveTab('backup')}
             className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${activeTab === 'backup' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 shadow'}`}
           >
               <RefreshCw className="w-5 h-5"/> Backup & Ripristino
           </button>
       </div>

       {activeTab === 'users' && (
           <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                   <h3 className="font-bold text-slate-800">Utenti Registrati ({users.length})</h3>
                   <button onClick={loadUsers} disabled={loading} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/></button>
               </div>
               <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                       <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                           <tr>
                               <th className="p-4 font-bold">Utente</th>
                               <th className="p-4 font-bold">Email</th>
                               <th className="p-4 font-bold">Ruolo</th>
                               <th className="p-4 font-bold">Stato</th>
                               <th className="p-4 font-bold text-right">Azioni</th>
                           </tr>
                       </thead>
                       <tbody className="text-sm divide-y divide-slate-100">
                           {users.map(user => (
                               <tr key={user.id} className="hover:bg-slate-50">
                                   <td className="p-4 font-medium text-slate-800">{user.name}</td>
                                   <td className="p-4 text-slate-600">{user.email}</td>
                                   <td className="p-4">
                                       {user.isSystemAdmin ? (
                                           <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                                               <Crown className="w-3 h-3"/> Admin
                                           </span>
                                       ) : (
                                           <span className="text-slate-500">User</span>
                                       )}
                                   </td>
                                   <td className="p-4">
                                       {user.status === 'active' && <span className="text-green-600 font-bold flex items-center gap-1"><Check className="w-4 h-4"/> Attivo</span>}
                                       {user.status === 'pending' && <span className="text-amber-600 font-bold flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> In Attesa</span>}
                                       {user.status === 'suspended' && <span className="text-red-600 font-bold flex items-center gap-1"><Ban className="w-4 h-4"/> Sospeso</span>}
                                   </td>
                                   <td className="p-4 text-right space-x-2">
                                       {user.id !== currentUser.id && (
                                           <>
                                               {user.status === 'pending' && (
                                                   <button onClick={() => handleStatusChange(user.id, 'active')} className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">Approva</button>
                                               )}
                                               {user.status === 'active' && (
                                                   <button onClick={() => handleStatusChange(user.id, 'suspended')} className="bg-red-100 text-red-600 px-3 py-1 rounded text-xs hover:bg-red-200">Sospendi</button>
                                               )}
                                               {user.status === 'suspended' && (
                                                   <button onClick={() => handleStatusChange(user.id, 'active')} className="bg-green-100 text-green-600 px-3 py-1 rounded text-xs hover:bg-green-200">Riattiva</button>
                                               )}
                                               
                                               <button 
                                                 onClick={() => toggleAdmin(user.id, !!user.isSystemAdmin)}
                                                 className={`ml-2 px-2 py-1 rounded border text-xs ${user.isSystemAdmin ? 'border-purple-200 text-purple-600 hover:bg-purple-50' : 'border-slate-200 text-slate-400 hover:bg-slate-100'}`}
                                                 title={user.isSystemAdmin ? "Rimuovi Admin" : "Promuovi ad Admin"}
                                               >
                                                   <Crown className="w-4 h-4"/>
                                               </button>
                                           </>
                                       )}
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
           </div>
       )}

       {activeTab === 'backup' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white p-8 rounded-xl shadow border border-slate-200 text-center">
                   <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                       <Download className="w-10 h-10 text-blue-600"/>
                   </div>
                   <h3 className="text-xl font-bold text-slate-800 mb-2">Esporta Database</h3>
                   <p className="text-slate-500 mb-6">Scarica una copia completa di tutti i progetti, documenti e utenti in formato JSON. Utile per backup di sicurezza.</p>
                   <button onClick={handleBackupDownload} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg w-full flex items-center justify-center gap-2">
                       <Download className="w-5 h-5"/> Scarica Backup (.json)
                   </button>
               </div>

               <div className="bg-white p-8 rounded-xl shadow border border-slate-200 text-center">
                   <div className="bg-amber-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                       <Upload className="w-10 h-10 text-amber-600"/>
                   </div>
                   <h3 className="text-xl font-bold text-slate-800 mb-2">Ripristina Database</h3>
                   <p className="text-slate-500 mb-6">Carica un file di backup precedente. <br/><span className="text-red-500 font-bold">ATTENZIONE: Questa operazione cancellerà tutti i dati attuali!</span></p>
                   <button onClick={() => fileInputRef.current?.click()} className="bg-slate-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-900 shadow-lg w-full flex items-center justify-center gap-2">
                       <Upload className="w-5 h-5"/> Carica Backup
                   </button>
                   <input type="file" ref={fileInputRef} onChange={handleBackupRestore} accept=".json" className="hidden"/>
               </div>
           </div>
       )}
    </div>
  );
};
