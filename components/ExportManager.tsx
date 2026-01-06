
import React, { useState, useEffect } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { DocumentPreview } from './DocumentPreview';
import { Printer, FileCheck, FileDown, Search, Gavel, Trash2, Folder, FileText, ClipboardList, Activity, Euro, ChevronRight, Mail, ShieldCheck } from 'lucide-react';

interface ExportManagerProps {
  project: ProjectConstants;
  documents: DocumentVariables[];
  currentDocId: string;
  onSelectDocument: (id: string) => void;
  onDeleteDocument: (id: string) => void;
}

type MainCategory = 'testing' | 'execution' | 'suspensions' | 'accounting' | 'reports';

export const ExportManager: React.FC<ExportManagerProps> = ({
  project,
  documents = [],
  currentDocId,
  onSelectDocument,
  onDeleteDocument
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMainCat, setActiveMainCat] = useState<MainCategory>('testing');
  const [activeSubCat, setActiveSubCat] = useState<string>('testing-visits');

  const mainCategories: { id: MainCategory; label: string; icon: any }[] = [
    { id: 'testing', label: 'Collaudi', icon: Gavel },
    { id: 'execution', label: 'Consegne', icon: Activity },
    { id: 'suspensions', label: 'Sospensioni', icon: ClipboardList },
    { id: 'accounting', label: 'Contabilità', icon: Euro },
    { id: 'reports', label: 'Relazioni', icon: FileText },
  ];

  const subCategories: Record<MainCategory, { id: string; label: string; icon: any; types: DocumentType[] }[]> = {
    testing: [
      { id: 'testing-comm', label: 'Corrispondenza', icon: Mail, types: ['CORRISPONDENZA_COLLAUDO'] },
      { id: 'testing-clearance', label: 'Nullaosta', icon: ShieldCheck, types: ['NULLAOSTA_COLLAUDO'] },
      { id: 'testing-visits', label: 'Visite di collaudo', icon: ClipboardList, types: ['VERBALE_COLLAUDO'] },
      { id: 'testing-reports', label: 'Relazioni collaudo', icon: FileText, types: ['RELAZIONE_COLLAUDO'] },
    ],
    execution: [
      { id: 'exec-delivery', label: 'Verbali di Consegna', icon: Activity, types: ['VERBALE_CONSEGNA'] },
    ],
    suspensions: [
        { id: 'susp-acts', label: 'Sospensioni/Riprese', icon: ClipboardList, types: ['SOSPENSIONE_LAVORI', 'RIPRESA_LAVORI'] },
    ],
    accounting: [
        { id: 'acc-sals', label: 'Stati Avanzamento', icon: Euro, types: ['SAL'] },
    ],
    reports: [
        { id: 'rep-final', label: 'Relazioni Finali', icon: FileText, types: ['RELAZIONE_FINALE', 'CERTIFICATO_ULTIMAZIONE', 'CERTIFICATO_REGOLARE_ESECUZIONE'] },
    ]
  };

  // Se cambio categoria principale, seleziono automaticamente la prima sottocategoria
  useEffect(() => {
    setActiveSubCat(subCategories[activeMainCat][0].id);
  }, [activeMainCat]);

  const currentSubCatObj = subCategories[activeMainCat].find(s => s.id === activeSubCat);
  const currentTypes = currentSubCatObj?.types || [];

  const filteredDocs = documents.filter(d => {
    const isOfType = currentTypes.includes(d.type);
    const search = searchTerm.toLowerCase();
    const matchesSearch = (d.visitNumber?.toString() || '').includes(search) || (d.date || '').includes(search);
    return isOfType && matchesSearch;
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
    link.download = `Documento_N${currentDoc.visitNumber}.doc`;
    link.click();
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-0 overflow-hidden bg-white rounded-2xl shadow-xl border border-slate-200">
      
      {/* 1. Sidebar Macro-Categorie (Fascia Sinistra Stretta) */}
      <div className="w-16 md:w-20 bg-slate-900 flex flex-col no-print border-r border-slate-800">
        <div className="p-4 border-b border-slate-800 text-center">
            <Folder className="w-6 h-6 text-blue-500 mx-auto"/>
        </div>
        <div className="flex-1 py-4 space-y-4">
            {mainCategories.map(cat => (
                <button 
                  key={cat.id} 
                  title={cat.label}
                  onClick={() => setActiveMainCat(cat.id)}
                  className={`w-full flex flex-col items-center justify-center gap-1 py-4 transition-all relative ${activeMainCat === cat.id ? 'text-blue-400 bg-slate-800' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                >
                    <cat.icon className="w-6 h-6 shrink-0"/>
                    <span className="text-[8px] font-bold uppercase tracking-tighter hidden md:block">{cat.label}</span>
                    {activeMainCat === cat.id && <div className="absolute right-0 top-2 bottom-2 w-1 bg-blue-500 rounded-l"/>}
                </button>
            ))}
        </div>
      </div>

      {/* 2. Sottocategorie e Lista Documenti (Fascia Media) */}
      <div className="w-72 md:w-80 flex flex-col border-r bg-slate-50 no-print">
        
        {/* Sottocategorie (Tab Orizzontali o Lista) */}
        <div className="p-4 border-b bg-white">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">{mainCategories.find(c => c.id === activeMainCat)?.label}</h3>
            <div className="space-y-1">
                {subCategories[activeMainCat].map(sub => (
                    <button 
                        key={sub.id} 
                        onClick={() => setActiveSubCat(sub.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeSubCat === sub.id ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
                    >
                        <sub.icon className="w-3.5 h-3.5"/>
                        {sub.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Ricerca e Lista Documenti */}
        <div className="p-3 border-b bg-slate-100/50">
            <div className="relative">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400"/>
                <input type="text" placeholder="Cerca per data o n..." className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500/20 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
                  <FileText className="w-10 h-10 mb-2"/>
                  <p className="text-xs font-bold uppercase">Nessun documento</p>
              </div>
          ) : (
            filteredDocs.map(doc => (
                <div key={doc.id} className="relative group">
                    <button onClick={() => onSelectDocument(doc.id)} className={`w-full text-left p-3 rounded-xl border transition-all ${currentDocId === doc.id ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/5' : 'bg-white hover:border-slate-300 shadow-sm'}`}>
                        <div className="flex justify-between items-start">
                            <span className="text-[9px] font-bold uppercase text-blue-600 tracking-wider">N. {doc.visitNumber}</span>
                            <span className="text-[10px] text-slate-400">{new Date(doc.date).toLocaleDateString('it-IT')}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{doc.observations?.substring(0, 40) || 'Documento archiviato'}</p>
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteDocument(doc.id); }}
                        className="absolute top-1 right-1 p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-red-50"
                        title="Elimina e rinumera"
                    >
                        <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Area Anteprima (Fascia Destra Larga) */}
      <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden relative">
        {currentDoc ? (
            <>
                <div className="bg-white p-4 border-b no-print flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg"><FileCheck className="w-4 h-4 text-blue-600"/></div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">{currentSubCatObj?.label}</h4>
                            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Protocollo Interno: {currentDoc.id.slice(0,8)}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleDownloadWord} className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg flex items-center gap-2 font-bold text-[10px] hover:bg-slate-50 transition-all shadow-sm uppercase tracking-wider"><FileDown className="w-3.5 h-3.5 text-blue-600" /> Word</button>
                        <button onClick={() => window.print()} className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-[10px] hover:bg-black transition-all shadow-md uppercase tracking-wider"><Printer className="w-3.5 h-3.5" /> PDF / Stampa</button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-10 print:p-0 print:bg-white scroll-smooth">
                    <DocumentPreview project={project} doc={currentDoc} type={currentDoc.type} allDocuments={documents} />
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-10 text-center bg-slate-50">
                <div className="w-20 h-20 bg-white rounded-full shadow-inner flex items-center justify-center mb-6">
                    <Folder className="w-10 h-10 opacity-10"/>
                </div>
                <h3 className="text-lg font-bold opacity-30">Seleziona un atto dall'archivio</h3>
                <p className="max-w-xs mt-2 text-sm opacity-30 italic">Naviga nelle sottosezioni a sinistra per visualizzare i documenti salvati.</p>
            </div>
        )}
      </div>
    </div>
  );
};
