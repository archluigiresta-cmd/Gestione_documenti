
import React, { useState, useRef } from 'react';
import { User, BackupData } from '../types';
import { db } from '../db';
import { generateSafeId } from '../constants';
import { Building2, KeyRound, Mail, UserPlus, ArrowRight, ShieldCheck, Info, Upload } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      if (isRegister) {
        if (!name || !email || !password) throw new Error("Compila tutti i campi.");
        const newUser: User = {
           id: generateSafeId(),
           name,
           email,
           password, 
           status: 'pending' 
        };
        await db.registerUser(newUser);
        setSuccessMsg("Richiesta inviata! Attendi l'approvazione dell'amministratore.");
        setIsRegister(false);
      } else {
        const user = await db.loginUser(email, password);
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || "Credenziali non valide.");
    }
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (ev) => {
          try {
              const json = JSON.parse(ev.target?.result as string) as BackupData;
              if (confirm(`Ripristinare backup del ${new Date(json.timestamp).toLocaleString()}? I dati correnti verranno sovrascritti.`)) {
                  await db.restoreDatabaseBackup(json);
                  setSuccessMsg("Backup ripristinato! Ora puoi accedere.");
              }
          } catch (err) {
              setError("Il file di backup non è valido.");
          }
      };
      reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
         
         <div className="p-10 text-center border-b border-zinc-800 bg-zinc-900/50">
            <div className="bg-blue-600/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-600/20">
                <Building2 className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">EdilApp</h1>
            <p className="text-zinc-500 text-sm mt-2 font-medium">Gestione Tecnica Opere Pubbliche</p>
         </div>

         <div className="p-10">
            <div className="flex gap-2 mb-8 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
                <button 
                  onClick={() => setIsRegister(false)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isRegister ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                   ACCESSO
                </button>
                <button 
                  onClick={() => setIsRegister(true)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isRegister ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                   REGISTRATI
                </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 text-red-400 text-xs font-bold rounded-xl flex items-center gap-3 border border-red-500/20">
                 <ShieldCheck className="w-4 h-4"/> {error}
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 bg-green-500/10 text-green-400 text-xs font-bold rounded-xl flex items-center gap-3 border border-green-500/20">
                 <Info className="w-4 h-4"/> {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
               {isRegister && (
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nome Completo</label>
                    <input type="text" className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700" 
                       placeholder="Arch. Mario Rossi"
                       value={name} onChange={e => setName(e.target.value)} />
                 </div>
               )}
               
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Email Professionale</label>
                  <input type="email" className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700" 
                     placeholder="mario.rossi@email.it"
                     value={email} onChange={e => setEmail(e.target.value)} />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Password</label>
                  <input type="password" className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700" 
                     placeholder="••••••••"
                     value={password} onChange={e => setPassword(e.target.value)} />
               </div>

               <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-500 transition-all flex items-center justify-center gap-3 mt-8 shadow-xl shadow-blue-500/10 active:scale-95">
                  {isRegister ? 'Invia Richiesta' : 'Entra nel Portale'}
                  <ArrowRight className="w-4 h-4" />
               </button>
            </form>

            <div className="mt-10 pt-8 border-t border-zinc-800 text-center">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-zinc-500 text-xs font-bold hover:text-zinc-300 flex items-center justify-center gap-2 w-full p-3 hover:bg-zinc-800 rounded-xl transition-all"
                >
                    <Upload className="w-3 h-3"/> Importa backup locale (.json)
                </button>
                <input type="file" ref={fileInputRef} onChange={handleRestore} accept=".json" className="hidden"/>
            </div>
         </div>
      </div>
    </div>
  );
};
