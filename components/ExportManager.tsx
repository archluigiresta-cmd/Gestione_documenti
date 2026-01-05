
import React, { useState } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { DocumentPreview } from './DocumentPreview';
import { Printer, FileCheck, FileDown, Search, Gavel, Trash2, FileType } from 'lucide-react';

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

  const currentDoc = documents.find(d => d.id === currentDocId) || (documents.length > 0 ? documents[0] : null);

  const filteredDocs = documents.filter(d => {
    const search = searchTerm.toLowerCase();
    return (d.visitNumber?.toString() || '').includes(search) || (d.date || '').includes(search);
  }).sort((a, b) => (b.visitNumber || 0) - (a.visitNumber || 0));

  const handlePrint = () => window.print();

  const handleDownloadWord = () => {
    const element = document.getElementById('document-preview-container');
    if (!element || !currentDoc) return;
    const htmlDoc = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset="utf-8"><style>
          @page { size: A4; margin: 2.0cm; }
          body { font-family: 'Times New Roman', serif; text-align: justify; }
          .font-bold { font-weight: bold; }
          .uppercase { text-transform: uppercase; }
      </style></head><body>${element.innerHTML}</body></html>
    `;
    const blob = new Blob(['\ufeff', htmlDoc], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `verbale_collaudo_n${currentDoc.visitNumber || 1}.doc`;
    link.click();
  };

  if (documents.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <FileType className="w-16 h-16 text-slate-200 mb-4"/>
            <h3 className="text-xl font-bold text-slate-800">Archivio Vuoto</h3>
            <p className="text-slate-500 text-center max-w-md">Nessun documento disponibile per l'esportazione.</p>
        </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6">
      <div className="w-72 flex flex-col bg-slate-50 rounded-xl border border-slate-200 overflow-hidden no-print">
          <div className="p-4 border-b bg-white">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3 text-sm">
                  <FileCheck className="w-4 h-4 text-blue-600"/> Elenco Verbali
              </h3>
              <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
                  <input type="text" placeholder="Cerca verbale..." className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredDocs.map(doc => (
                  <button key={doc.id} onClick={() => onSelectDocument(doc.id)} className={`w-full text-left p-3 rounded-lg border flex flex-col transition-all ${currentDocId === doc.id ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                      <span className="text-[10px] font-bold uppercase text-slate-500">Verbale N. {doc.visitNumber}</span>
                      <span className="text-sm font-semibold text-slate-800">{doc.date ? new Date(doc.date).toLocaleDateString() : 'N/D'}</span>
                  </button>
              ))}
          </div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
          {currentDoc && (
              <>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4 no-print flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Gavel className="w-5 h-5 text-blue-600"/>
                        <h4 className="font-bold text-slate-800">Anteprima di Stampa</h4>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleDownloadWord} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-sm">
                            <FileDown className="w-4 h-4 text-blue-600" /> Word
                        </button>
                        <button onClick={handlePrint} className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-sm">
                            <Printer className="w-4 h-4" /> Stampa / PDF
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-slate-100 rounded-xl p-8 border print:bg-white print:p-0">
                    <DocumentPreview project={project} doc={currentDoc} type={currentDoc.type} allDocuments={documents} />
                </div>
              </>
          )}
      </div>
    </div>
  );
};
