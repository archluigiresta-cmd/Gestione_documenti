
import React, { useState } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { DocumentPreview } from './DocumentPreview';
import { Printer, FileCheck, FileDown, Search, FileText, FileSignature, Gavel, Trash2, FileType } from 'lucide-react';

interface ExportManagerProps {
  project: ProjectConstants;
  documents: DocumentVariables[];
  currentDocId: string;
  onSelectDocument: (id: string) => void;
  onDeleteDocument?: (id: string) => void;
}

export const ExportManager: React.FC<ExportManagerProps> = ({
  project,
  documents = [],
  currentDocId,
  onSelectDocument,
  onDeleteDocument
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Identificazione sicura del documento corrente
  const currentDoc = documents.find(d => d.id === currentDocId) || (documents.length > 0 ? documents[0] : null);

  // Raggruppamento documenti con protezione null-safe
  const verbali = documents.filter(d => (d.type === 'VERBALE_COLLAUDO' || d.type === 'VERBALE_CONSEGNA'));
  
  // Explicitly casting the array to (DocumentType | "")[] to fix TS comparability errors
  const atti = documents.filter(d => (['NULLA_OSTA_ENTE', 'RICHIESTA_AUTORIZZAZIONE', 'LETTERA_CONVOCAZIONE'] as (DocumentType | "")[]).includes(d.type || ''));
  const altri = documents.filter(d => !verbali.includes(d) && !atti.includes(d));

  const filteredDocs = (list: DocumentVariables[]) => 
    list.filter(d => {
        const typeStr = (d.type || '').toLowerCase();
        const visitStr = (d.visitNumber || '').toString();
        const dateStr = (d.date || '').toString();
        const search = searchTerm.toLowerCase();
        return typeStr.includes(search) || visitStr.includes(search) || dateStr.includes(search);
    }).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = () => {
    const element = document.getElementById('document-preview-container');
    if (!element || !currentDoc) return;
    let content = element.innerHTML;
    const htmlDoc = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset="utf-8"><style>
          @page { size: A4; margin: 2.0cm; }
          body { font-family: 'Times New Roman', serif; text-align: justify; }
          .font-bold { font-weight: bold; }
          .uppercase { text-transform: uppercase; }
      </style></head><body>${content}</body></html>
    `;
    const blob = new Blob(['\ufeff', htmlDoc], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(currentDoc.type || 'documento').toLowerCase()}_${currentDoc.date || 'data'}.doc`;
    link.click();
  };

  const getDocLabel = (doc: DocumentVariables) => {
      const type = doc.type || '';
      switch(type) {
          case 'VERBALE_COLLAUDO': return `Verbale Visita N. ${doc.visitNumber || '?'}`;
          case 'NULLA_OSTA_ENTE': return 'Nulla Osta Incarico';
          case 'RICHIESTA_AUTORIZZAZIONE': return 'Richiesta Autorizzazione';
          case 'LETTERA_CONVOCAZIONE': return 'Lettera Convocazione';
          default: return (type || 'Documento').replace(/_/g, ' ');
      }
  };

  const GroupSection = ({ title, list, icon: Icon }: any) => {
      const filtered = filteredDocs(list);
      if (filtered.length === 0) return null;
      return (
          <div className="mb-6">
              <h4 className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Icon className="w-3 h-3"/> {title}
              </h4>
              <div className="space-y-1 px-2">
                  {filtered.map(doc => (
                      <div key={doc.id} className="relative group">
                          <button
                              onClick={() => onSelectDocument(doc.id)}
                              className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col ${
                                  currentDocId === doc.id 
                                  ? 'bg-blue-50 border-blue-500 shadow-sm' 
                                  : 'bg-white border-slate-100 hover:border-blue-200'
                              }`}
                          >
                              <span className={`text-[10px] font-bold uppercase ${currentDocId === doc.id ? 'text-blue-700' : 'text-slate-500'}`}>
                                  {getDocLabel(doc)}
                              </span>
                              <span className="text-sm font-semibold text-slate-800">
                                  {doc.date ? new Date(doc.date).toLocaleDateString('it-IT') : 'Data non specificata'}
                              </span>
                          </button>
                          {onDeleteDocument && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); if(confirm('Eliminare definitivamente questo documento?')) onDeleteDocument(doc.id); }}
                                className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                  <Trash2 className="w-4 h-4"/>
                              </button>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  if (documents.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 h-full">
            <FileType className="w-16 h-16 text-slate-200 mb-4"/>
            <h3 className="text-xl font-bold text-slate-800">Archivio Vuoto</h3>
            <p className="text-slate-500 text-center max-w-md">Non ci sono ancora documenti salvati per questo appalto.</p>
        </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6 pb-4">
      <div className="w-72 flex flex-col bg-slate-50 rounded-xl border border-slate-200 overflow-hidden no-print shrink-0">
          <div className="p-4 border-b border-slate-200 bg-white">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3 text-sm">
                  <FileCheck className="w-4 h-4 text-blue-600"/> Archivio Progetto
              </h3>
              <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
                  <input 
                    type="text" 
                    placeholder="Cerca..." 
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pt-4 pb-20">
              <GroupSection title="Atti e Lettere" list={atti} icon={FileSignature} />
              <GroupSection title="Verbali di Visita" list={verbali} icon={Gavel} />
              <GroupSection title="Altro" list={altri} icon={FileText} />
          </div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {currentDoc ? (
              <>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4 no-print flex items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 text-white p-2 rounded-lg">
                            <FileType className="w-5 h-5"/>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 leading-none">{getDocLabel(currentDoc)}</h4>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">Anteprima di Stampa Professionale</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleDownloadWord} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 font-bold text-sm transition-colors">
                            <FileDown className="w-4 h-4 text-blue-600" /> Word
                        </button>
                        <button onClick={handlePrint} className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 font-bold text-sm transition-colors">
                            <Printer className="w-4 h-4 text-white" /> Stampa / PDF
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-400/10 rounded-xl p-8 border border-slate-300 shadow-inner print:bg-white print:p-0 print:border-none print:shadow-none print:overflow-visible">
                    <div className="flex justify-center min-h-full">
                        <DocumentPreview project={project} doc={currentDoc} type={currentDoc.type} allDocuments={documents} />
                    </div>
                </div>
              </>
          ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border-2 border-dashed border-slate-200 h-full">
                  <FileType className="w-12 h-12 text-slate-200 mb-4"/>
                  <p className="text-slate-400 font-bold">Seleziona un documento a sinistra.</p>
              </div>
          )}
      </div>
    </div>
  );
};
