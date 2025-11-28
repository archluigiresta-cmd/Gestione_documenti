
import React from 'react';
import { LayoutDashboard, Settings, FolderKanban, PlusCircle, Trash, FileClock, ArrowLeft } from 'lucide-react';
import { DocumentVariables } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: 'project' | 'editor' | 'preview') => void;
  documents: DocumentVariables[];
  currentDocId: string;
  setCurrentDocId: (id: string) => void;
  onNewDocument: () => void;
  onDeleteDocument: (id: string) => void;
  onBackToDashboard: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  documents, 
  currentDocId, 
  setCurrentDocId,
  onNewDocument,
  onDeleteDocument,
  onBackToDashboard
}) => {
  
  // Sort docs by visit number for the list
  const sortedDocs = [...documents].sort((a, b) => a.visitNumber - b.visitNumber);

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 no-print z-10 shadow-xl">
      <div className="p-6 border-b border-slate-800 bg-slate-950">
        <button 
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Torna alla Home
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-400" />
          EdilApp
        </h1>
        <p className="text-xs text-slate-400 mt-1">Gestione Lavori Pubblici</p>
      </div>
      
      <div className="p-4 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('project')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
            activeTab === 'project'
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <FolderKanban className="w-5 h-5" />
          Dati Appalto
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verbali</span>
          <button 
            onClick={onNewDocument}
            className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-slate-800 transition-colors"
            title="Nuovo Verbale"
          >
            <PlusCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {sortedDocs.map((doc) => {
            const isSelected = currentDocId === doc.id;
            return (
              <div key={doc.id} className="group relative flex items-center">
                 <button
                  onClick={() => {
                    setCurrentDocId(doc.id);
                    setActiveTab('editor');
                  }}
                  className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm text-left ${
                    isSelected && activeTab !== 'project'
                      ? 'bg-slate-800 text-white border-l-4 border-blue-500' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <FileClock className="w-4 h-4 opacity-70" />
                  <div>
                    <div className="font-semibold">Verbale n. {doc.visitNumber}</div>
                    <div className="text-[10px] opacity-70">{new Date(doc.date).toLocaleDateString('it-IT')}</div>
                  </div>
                </button>
                {/* Delete button only visible on hover and if there are multiple docs */}
                {documents.length > 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteDocument(doc.id); }}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 p-1"
                  >
                    <Trash className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <button
          onClick={() => setActiveTab('preview')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
            activeTab === 'preview' 
              ? 'bg-emerald-600 text-white shadow-lg' 
              : 'text-emerald-400 hover:bg-slate-800 hover:text-emerald-300'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          Anteprima & Stampa
        </button>
      </div>
    </div>
  );
};
