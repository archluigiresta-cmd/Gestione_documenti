
import React, { useState } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { DocumentPreview } from './DocumentPreview';
import { Printer, FileCheck, FileDown, Search, Trash2, FileText, Folder } from 'lucide-react';

interface ExportManagerProps {
  project: ProjectConstants;
  documents: DocumentVariables[];
  currentDocId: string;
  onSelectDocument: (id: string) => void;
  onDeleteDocument: (id: string) => void;
  activeExportTab: string; // Ricevuto da App.tsx
}

export const ExportManager: React.FC<ExportManagerProps> = ({
  project,
  documents = [],
  currentDocId,
  onSelectDocument,
  onDeleteDocument,
  activeExportTab
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mapping dei tipi documento in base al tab della Sidebar
  const getFilterTypes = (tab: string): DocumentType[] => {
    switch (tab) {
        case 'export-testing-comm': return ['CORRISPONDENZA_COLLAUDO'];
        case 'export-testing-clearance': return ['NULLAOSTA_COLLAUDO'];
        case 'export-testing-visits': return ['VERBALE_COLLAUDO']; // I tuoi verbali precedenti sono qui
        case 'export-testing-reports': return ['RELAZIONE_COLLAUDO'];
        case 'export-execution': return ['VERBALE_CONSEGNA'];
        case 'export-suspensions': return ['SOSPENSIONE_LAVORI', 'RIPRESA_LAVORI'];
        case 'export-accounting': return ['SAL'];
        case 'export-reports': return ['RELAZIONE_FINALE', 'CERTIFICATO_ULTIMAZIONE', 'CERTIFICATO_REGOLARE_ESECUZIONE'];
        default: return [];
    }
  };

  const currentTypes = getFilterTypes(activeExportTab);

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
      
      {/* 1. Lista Documenti (Fascia Sinistra) */}
      <div className="w-80 flex flex-col border-r bg-slate-50 no-print">
        <div className="p-4 border-b bg-white">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Documenti in Archivio</h3>
            <div className="relative">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400"/>
                <input type="text" placeholder="Cerca per data o numero..." className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
                  <FileText className="w-12 h-12 mb-2"/>
                  <p className="text-xs font-bold uppercase">Archivio Vuoto</p>
                  <p className="text-[10px] mt-1 italic">Nessun documento in questa sezione</p>
              </div>
          ) : (
            filteredDocs.map(doc => (
                <div key={doc.id} className="relative group">
                    <button onClick={() => onSelectDocument(doc.id)} className={`w-full text-left p-4 rounded-xl border transition-all ${currentDocId === doc.id ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/5' : 'bg-white hover:border-slate-300 shadow-sm'}`}>
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">Documento N. {doc.visitNumber}</span>
                            <span className="text-[10px] text-slate-400">{new Date(doc.date).toLocaleDateString('it-IT')}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 mt-2 line-clamp-2">{doc.observations?.substring(0, 60) || 'Atto archiviato'}</p>
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteDocument(doc.id); }}
                        className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-red-50"
                        title="Elimina"
                    >
                        <Trash2 className="w-4 h-4"/>
                    </button>
                </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Area Anteprima (Fascia Destra Larga) */}
      <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden relative">
        {currentDoc ? (
            <>
                <div className="bg-white p-4 border-b no-print flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg"><FileCheck className="w-5 h-5 text-blue-600"/></div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">Anteprima Atto</h4>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Modulo Archivio / Prot. {currentDoc.id.slice(0,8)}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleDownloadWord} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-xs hover:bg-slate-50 transition-all shadow-sm"><FileDown className="w-4 h-4 text-blue-600" /> WORD</button>
                        <button onClick={() => window.print()} className="bg-slate-900 text-white px-5 py-2 rounded-lg flex items-center gap-2 font-bold text-xs hover:bg-black transition-all shadow-md"><Printer className="w-4 h-4" /> PDF / STAMPA</button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-12 print:p-0 print:bg-white scroll-smooth">
                    <DocumentPreview project={project} doc={currentDoc} type={currentDoc.type} allDocuments={documents} />
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-10 text-center bg-slate-50">
                <div className="w-24 h-24 bg-white rounded-full shadow-inner flex items-center justify-center mb-6">
                    <Folder className="w-12 h-12 opacity-10"/>
                </div>
                <h3 className="text-xl font-bold opacity-30 uppercase tracking-widest">Seleziona un atto</h3>
                <p className="max-w-xs mt-2 text-sm opacity-30 italic">Scegli un documento dalla lista a sinistra per visualizzarne l'anteprima di stampa.</p>
            </div>
        )}
      </div>
    </div>
  );
};
