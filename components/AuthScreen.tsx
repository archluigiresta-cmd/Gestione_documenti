
import React, { useState, useRef } from 'react';
import { User, BackupData } from '../types';
import { db } from '../db';
import { generateSafeId } from '../constants';
import { Building2, ArrowRight, Upload } from 'lucide-react';

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
        const newUser: User = { id: generateSafeId(), name, email, password, status: 'pending' };
        await db.registerUser(newUser);
        setSuccessMsg("Richiesta inviata! Attendi l'approvazione.");
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
              if (confirm(`Ripristinare backup? I dati attuali verranno sovrascritti.`)) {
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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>

      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative z-10">
         <div className="p-10 text-center border-b border-zinc-800 bg-zinc-900/30">
            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/20 ring-1 ring-blue-400/30">
                <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">EdilApp</h1>
            <p className="text-zinc-500 text-xs mt-2 font-bold uppercase tracking-[0.2em]">Gestione Opere Pubbliche</p>
         </div>

         <div className="p-10">
            <div className="flex gap-2 mb-8 bg-zinc-950 p-1 rounded-2xl border border-zinc-800/50">
                <button onClick={() => setIsRegister(false)} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${!isRegister ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}>ACCESSO</button>
                <button onClick={() => setIsRegister(true)} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${isRegister ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}>REGISTRATI</button>
            </div>

            {error && <div className="mb-6 p-4 bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-3 border border-red-500/20">{error}</div>}
            {successMsg && <div className="mb-6 p-4 bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-3 border border-green-500/20">{successMsg}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
               {isRegister && (
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nome Completo</label>
                    <input type="text" className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-800 font-medium" placeholder="Arch. Mario Rossi" value={name} onChange={e => setName(e.target.value)} />
                 </div>
               )}
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Professionale</label>
                  <input type="email" className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-800 font-medium" placeholder="mario.rossi@email.it" value={email} onChange={e => setEmail(e.target.value)} />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Password</label>
                  <input type="password" className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-800 font-medium" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
               </div>

               <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 mt-10 shadow-2xl shadow-blue-600/30 active:scale-95">
                  {isRegister ? 'Invia Richiesta' : 'Entra nel Portale'}
                  <ArrowRight className="w-4 h-4" />
               </button>
            </form>

            <div className="mt-12 pt-8 border-t border-zinc-800/50 text-center">
                <button onClick={() => fileInputRef.current?.click()} className="text-zinc-600 text-[10px] font-black uppercase tracking-widest hover:text-zinc-400 transition-colors flex items-center justify-center gap-2 w-full p-3">
                    <Upload className="w-3 h-3"/> Importa backup dati (.json)
                </button>
                <input type="file" ref={fileInputRef} onChange={handleRestore} accept=".json" className="hidden"/>
            </div>
         </div>
      </div>
    </div>
  );
};
