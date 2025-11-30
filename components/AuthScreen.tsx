
import React, { useState } from 'react';
import { User } from '../types';
import { db } from '../db';
import { Building2, KeyRound, Mail, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegister) {
        if (!name || !email || !password) throw new Error("Compila tutti i campi.");
        const newUser: User = {
           id: crypto.randomUUID(),
           name,
           email,
           password // In real app, hash this!
        };
        await db.registerUser(newUser);
        alert("Registrazione completata! Ora puoi accedere.");
        setIsRegister(false);
      } else {
        const user = await db.loginUser(email, password);
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || "Si è verificato un errore.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
         
         <div className="bg-blue-600 p-8 text-center">
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">EdilApp Gestionale</h1>
            <p className="text-blue-100 text-sm mt-2">Piattaforma gestione Opere Pubbliche</p>
         </div>

         <div className="p-8">
            <div className="flex gap-4 mb-8 bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setIsRegister(false)}
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isRegister ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                   Accedi
                </button>
                <button 
                  onClick={() => setIsRegister(true)}
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isRegister ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                   Registrati
                </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4"/> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
               {isRegister && (
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                    <div className="relative">
                        <UserPlus className="absolute left-3 top-3 w-5 h-5 text-slate-400"/>
                        <input type="text" className="w-full p-3 pl-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                           placeholder="Es. Mario Rossi"
                           value={name} onChange={e => setName(e.target.value)} />
                    </div>
                 </div>
               )}
               
               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                  <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400"/>
                      <input type="email" className="w-full p-3 pl-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                         placeholder="mario.rossi@email.it"
                         value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
                  <div className="relative">
                      <KeyRound className="absolute left-3 top-3 w-5 h-5 text-slate-400"/>
                      <input type="password" className="w-full p-3 pl-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                         placeholder="••••••••"
                         value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
               </div>

               <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 mt-6 shadow-lg">
                  {isRegister ? 'Crea Account' : 'Accedi al Portale'}
                  <ArrowRight className="w-4 h-4" />
               </button>
            </form>
         </div>
         
         <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 border-t border-slate-100">
             © 2025 EdilApp v2.2 - Gestione Lavori Pubblici
         </div>
      </div>
    </div>
  );
};
