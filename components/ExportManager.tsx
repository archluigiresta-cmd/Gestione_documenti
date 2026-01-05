
import React, { useState } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { DocumentPreview } from './DocumentPreview';
import { Printer, FileCheck, FileDown, Search, FileText, Calendar, ChevronRight, FileType, Trash2, FileSignature, Gavel } from 'lucide-react';

interface ExportManagerProps {
  project: ProjectConstants;
  documents: DocumentVariables[];
  currentDocId: string;
  onSelectDocument: (id: string) => void;
  onDeleteDocument?: (id: string) => void;
}

export const ExportManager: React.FC<ExportManagerProps> = ({
  project,
  documents,
  currentDocId,
  onSelectDocument,
  onDeleteDocument
}) => {
  const currentDoc = documents.find(d => d.id === currentDocId) || documents[0];
  const [searchTerm, setSearchTerm] = useState('');

  // Raggruppamento documenti
  const verbali = documents.filter(d => d.type === 'VERBALE_COLLAUDO' || d.type === 'VERBALE_CONSEGNA');
  const atti = documents.filter(d => ['NULLA_OSTA_ENTE', 'RICHIESTA_AUTORIZZAZIONE', 'LETTERA_CONVOCAZIONE'].includes(d.type));
  const altri = documents.filter(d => !verbali.includes(d) && !atti.includes(d));

  const filteredDocs = (list: DocumentVariables[]) => 
    list.filter(d => 
        d.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.visitNumber.toString().includes(searchTerm) || 
        d.date.includes(searchTerm)
    ).sort((a, b) => b.createdAt - a.createdAt);

  if (!currentDoc) return <div className="p-8 text-center text-slate-500">Nessun documento disponibile nell'archivio.</div>;

  const handlePrint = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
      }, 100);
    });
  };

  const handleDownloadWord = () => {
    const element = document.getElementById('document-preview-container');
    if (!element) return;
    let content = element.innerHTML;
    const htmlDoc = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset="utf-8"><style>
          @page { size: A4; margin: 2.0cm 2cm 2.0cm 2cm; mso-page-orientation: portrait; }
          body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.3; text-align: justify; }
          .font-bold { font-weight: bold; }
          .uppercase { text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; }
          td { vertical-align: top; }
      </style></head><body>${content}</body></html>
    `;
    const blob = new Blob(['\ufeff', htmlDoc], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentDoc.type.toLowerCase()}_${currentDoc.date}.doc`;
    link.click();
  };

  const getDocLabel = (doc: DocumentVariables) => {
      switch(doc.type) {
          case 'VERBALE_COLLAUDO': return `Verbale Visita N. ${doc.visitNumber}`;
          case 'NULLA_OSTA_ENTE': return 'Nulla Osta Incarico';
          case 'RICHIESTA_AUTORIZZAZIONE': return 'Richiesta Autorizzazione';
          case 'LETTERA_CONVOCAZIONE': return 'Lettera Convocazione';
          default: return doc.type.replace(/_/g, ' ');
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
                                  {new Date(doc.date).toLocaleDateString('it-IT')}
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

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6 pb-4">
      <div className="w-72 flex flex-col bg-slate-50 rounded-xl border border-slate-200 overflow-hidden no-print shrink-0">
          <div className="p-4 border-b border-slate-200 bg-white">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <FileCheck className="w-5 h-5 text-blue-600"/> Archivio Documenti
              </h3>
              <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
                  <input 
                    type="text" 
                    placeholder="Cerca..." 
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pt-4">
              <GroupSection title="Atti e Lettere" list={atti} icon={FileSignature} />
              <GroupSection title="Verbali di Visita" list={verbali} icon={Gavel} />
              <GroupSection title="Altra Documentazione" list={altri} icon={FileText} />
          </div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4 no-print flex items-center justify-between gap-4 shrink-0">
             <div className="flex items-center gap-3">
                 <div className="bg-blue-600 text-white p-2 rounded-lg">
                    <FileType className="w-5 h-5"/>
                 </div>
                 <div>
                    <h4 className="font-bold text-slate-800 leading-none">{getDocLabel(currentDoc)}</h4>
                    <p className="text-xs text-slate-500 mt-1">Data: {new Date(currentDoc.date).toLocaleDateString('it-IT')}</p>
                 </div>
             </div>
             <div className="flex gap-2">
                  <button onClick={handleDownloadWord} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 font-bold text-sm">
                     <FileDown className="w-4 h-4 text-blue-600" /> Word
                  </button>
                  <button onClick={handlePrint} className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 font-bold text-sm">
                     <Printer className="w-4 h-4" /> Stampa / PDF
                  </button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-200 rounded-xl p-8 border border-slate-300 shadow-inner print:bg-white print:p-0 print:border-none print:shadow-none print:overflow-visible">
             <div className="flex justify-center min-h-full">
                 <DocumentPreview project={project} doc={currentDoc} type={currentDoc.type} allDocuments={documents} />
             </div>
          </div>
      </div>
    </div>
  );
};
