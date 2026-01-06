
import React, { useState } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { DocumentPreview } from './DocumentPreview';
import { Printer, FileCheck, FileDown, Search, Gavel, Trash2, Folder, FileText, ClipboardList, Activity, Euro } from 'lucide-react';

interface ExportManagerProps {
  project: ProjectConstants;
  documents: DocumentVariables[];
  currentDocId: string;
  onSelectDocument: (id: string) => void;
  onDeleteDocument: (id: string) => void;
}

type ArchiveCategory = 'testing' | 'execution' | 'suspensions' | 'accounting' | 'reports';

export const ExportManager: React.FC<ExportManagerProps> = ({
  project,
  documents = [],
  currentDocId,
  onSelectDocument,
  onDeleteDocument
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<ArchiveCategory>('testing');

  const categories: { id: ArchiveCategory; label: string; icon: any; types: DocumentType[] }[] = [
    { id: 'testing', label: 'Collaudi', icon: Gavel, types: ['VERBALE_COLLAUDO'] },
    { id: 'execution', label: 'Consegne', icon: Activity, types: ['VERBALE_CONSEGNA'] },
    { id: 'suspensions', label: 'Sospensioni', icon: ClipboardList, types: ['SOSPENSIONE_LAVORI', 'RIPRESA_LAVORI'] },
    { id: 'accounting', label: 'Contabilità', icon: Euro, types: ['SAL'] },
    { id: 'reports', label: 'Relazioni', icon: FileText, types: ['RELAZIONE_FINALE', 'RELAZIONE_COLLAUDO', 'CERTIFICATO_ULTIMAZIONE', 'CERTIFICATO_REGOLARE_ESECUZIONE'] },
  ];

  const currentCategoryTypes = categories.find(c => c.id === activeCategory)?.types || [];

  const filteredDocs = documents.filter(d => {
    const isOfCategory = currentCategoryTypes.includes(d.type);
    const search = searchTerm.toLowerCase();
    const matchesSearch = (d.visitNumber?.toString() || '').includes(search) || (d.date || '').includes(search);
    return isOfCategory && matchesSearch;
  }).sort((a, b) => (b.visitNumber || 0) - (a.visitNumber || 0));

  const currentDoc = documents.find(d => d.id === currentDocId) || (filteredDocs.length > 0 ? filteredDocs[0] : null);

  const handleDownloadWord = () => {
    const content = document.getElementById('document-preview-container');
    if (!content || !currentDoc) return;
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><style>@page { size: A4; margin: 2.0cm; } body { font-family: 'Times New Roman', serif; text-align: justify; font-size: 11pt; } table { border-collapse: collapse; width: 100%; } td { border: 1pt solid black; padding: 5pt; } .font-bold { font-weight: bold; } .uppercase { text-transform: uppercase; }</style></head>
      <body>${content.innerHTML}</body></html>
    `;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Verbale_N${currentDoc.visitNumber}.doc`;
    link.click();
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-0 overflow-hidden bg-white rounded-2xl shadow-xl border border-slate-200">
      
      {/* 1. Sidebar Categorie Documenti */}
      <div className="w-20 md:w-56 bg-slate-900 flex flex-col no-print">
        <div className="p-6 border-b border-slate-800">
            <h3 className="text-white font-bold text-xs uppercase tracking-widest hidden md:block opacity-50">Archivi</h3>
            <Folder className="w-6 h-6 text-blue-500 md:hidden mx-auto"/>
        </div>
        <div className="flex-1 py-4 space-y-1">
            {categories.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-6 py-4 transition-all relative ${activeCategory === cat.id ? 'text-white bg-blue-600' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                >
                    <cat.icon className="w-5 h-5 shrink-0"/>
                    <span className="text-sm font-bold hidden md:block">{cat.label}</span>
                    {activeCategory === cat.id && <div className="absolute right-0 top-0 bottom-0 w-1 bg-white"/>}
                </button>
            ))}
        </div>
      </div>

      {/* 2. Lista Verbali della Categoria */}
      <div className="w-64 md:w-80 flex flex-col border-r bg-slate-50 no-print">
        <div className="p-4 border-b bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
            <input type="text" placeholder="Cerca..." className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredDocs.length === 0 ? (
              <div className="text-center py-10 opacity-30 italic text-sm">Nessun documento</div>
          ) : (
            filteredDocs.map(doc => (
                <div key={doc.id} className="relative group">
                    <button onClick={() => onSelectDocument(doc.id)} className={`w-full text-left p-4 rounded-xl border transition-all ${currentDocId === doc.id ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/10' : 'bg-white hover:border-slate-300 shadow-sm'}`}>
                    <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">Progressivo N. {doc.visitNumber}</span>
                    <p className="text-sm font-bold text-slate-800 mt-1">{new Date(doc.date).toLocaleDateString('it-IT')}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-1">{doc.observations?.substring(0, 30) || 'Nessuna osservazione'}</p>
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteDocument(doc.id); }}
                        className="absolute top-2 right-2 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4"/>
                    </button>
                </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Area Anteprima */}
      <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden relative">
        {currentDoc ? (
            <>
                <div className="bg-white p-4 border-b no-print flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg"><FileCheck className="w-5 h-5 text-blue-600"/></div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">Anteprima Stampa</h4>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{activeCategory} / Doc ID: {currentDoc.id.slice(0,8)}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleDownloadWord} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-xs hover:bg-slate-50 transition-all shadow-sm"><FileDown className="w-4 h-4 text-blue-600" /> WORD</button>
                        <button onClick={() => window.print()} className="bg-slate-900 text-white px-5 py-2 rounded-lg flex items-center gap-2 font-bold text-xs hover:bg-black transition-all shadow-md"><Printer className="w-4 h-4" /> PDF / STAMPA</button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-10 print:p-0 print:bg-white">
                    <DocumentPreview project={project} doc={currentDoc} type={currentDoc.type} allDocuments={documents} />
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 text-center">
                <Folder className="w-20 h-20 mb-4 opacity-10"/>
                <h3 className="text-xl font-bold opacity-30">Seleziona un documento dall'archivio</h3>
                <p className="max-w-xs mt-2 opacity-30">I documenti salvati nelle sezioni Esecuzione o Collaudo appariranno qui automaticamente.</p>
            </div>
        )}
      </div>
    </div>
  );
};
