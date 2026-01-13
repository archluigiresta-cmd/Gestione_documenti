
import React, { useState } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { DocumentPreview } from './DocumentPreview';
import { Printer, FileCheck, FileDown, Search, FileText, Calendar, Plus, Mail, Settings2 } from 'lucide-react';

interface ExportManagerProps {
  project: ProjectConstants;
  documents: DocumentVariables[];
  currentDocId: string;
  onSelectDocument: (id: string) => void;
  onNewDocument?: () => void;
}

export const ExportManager: React.FC<ExportManagerProps> = ({
  project,
  documents,
  currentDocId,
  onSelectDocument,
  onNewDocument
}) => {
  const [activeTab, setActiveTab] = useState<'convocazione' | 'verbali'>('convocazione');
  const currentDoc = documents.find(d => d.id === currentDocId) || documents[0];
  const [docType, setDocType] = useState<DocumentType>('VERBALE_COLLAUDO');
  const [searchTerm, setSearchTerm] = useState('');

  const effectiveDocType = activeTab === 'convocazione' ? 'LETTERA_CONVOCAZIONE' : docType;

  const filteredDocs = documents
    .filter(d => d.visitNumber.toString().includes(searchTerm) || d.date.includes(searchTerm))
    .sort((a, b) => b.visitNumber - a.visitNumber);

  if (!currentDoc) return <div className="p-32 text-center text-slate-400 italic">Nessun documento disponibile per l'esportazione.</div>;

  const handlePrint = () => { 
    const element = document.getElementById('document-preview-container');
    if (!element) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${effectiveDocType} N. ${currentDoc.visitNumber}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&display=swap');
            @page { size: A4; margin: 2cm 1.5cm; }
            body { 
              font-family: 'Noto Serif', serif; 
              line-height: 1.4; 
              color: black; 
              background: white; 
              margin: 0; 
              padding: 0; 
              font-size: 11pt;
            }
            .uppercase { text-transform: uppercase; }
            .font-bold { font-weight: bold; }
            .text-right { text-align: right; }
            .text-justify { text-align: justify; }
            .italic { font-style: italic; }
            .underline { text-decoration: underline; }
            #document-preview-container { 
              width: 100%; 
              max-width: 18cm; 
              margin: 0 auto;
            }
            p { margin-bottom: 0.8em; }
            h1, h2, h3 { line-height: 1.2; margin-bottom: 0.5em; }
            ul { margin-left: 2em; margin-bottom: 1em; }
          </style>
        </head>
        <body>${element.innerHTML}</body>
        <script>window.onload = () => { window.print(); window.close(); };</script>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadWord = () => {
    const element = document.getElementById('document-preview-container');
    if (!element) return;
    const blob = new Blob(['\ufeff', `<html><body>${element.innerHTML}</body></html>`], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${effectiveDocType.toLowerCase()}_n${currentDoc.visitNumber}.doc`;
    link.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] no-print animate-in fade-in">
      
      <div className="flex bg-white border border-slate-200 rounded-2xl mb-6 p-1.5 shadow-sm max-w-2xl">
        <button 
          onClick={() => setActiveTab('convocazione')}
          className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'convocazione' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Mail className="w-5 h-5"/> Lettera Convocazione
        </button>
        <button 
          onClick={() => setActiveTab('verbali')}
          className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'verbali' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <FileText className="w-5 h-5"/> Verbali Sopralluogo
        </button>
      </div>

      <div className="flex flex-1 gap-8 overflow-hidden">
        
        <div className="w-80 flex flex-col bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden shrink-0">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <FileCheck className="w-4 h-4 text-blue-600"/> Archivio Verbali
                </h3>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400"/>
              <input 
                type="text" 
                placeholder="Cerca verbale..." 
                className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
            {filteredDocs.map(doc => (
              <div
                key={doc.id}
                onClick={() => onSelectDocument(doc.id)}
                className={`w-full p-4 rounded-2xl border transition-all cursor-pointer ${currentDocId === doc.id ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500/20' : 'bg-white border-slate-100 hover:border-blue-200 shadow-sm'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${currentDocId === doc.id ? 'text-blue-700' : 'text-slate-400'}`}>
                    VISITA N. {doc.visitNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Calendar className="w-4 h-4 text-slate-300"/>
                  {new Date(doc.date).toLocaleDateString('it-IT')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white p-5 rounded-3xl shadow-xl border border-slate-200 mb-6 flex items-center justify-between gap-6 shrink-0">
            <div className="flex items-center gap-4">
              <div className="bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                  Formato
                </span>
              </div>
              {activeTab === 'verbali' && (
                <select 
                  className="p-2.5 border border-blue-200 bg-blue-50 rounded-xl font-bold text-blue-900 text-xs w-64 outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as DocumentType)}
                >
                  <option value="VERBALE_COLLAUDO">Verbale di Collaudo</option>
                  <option value="VERBALE_CONSEGNA">Verbale di Consegna</option>
                  <option value="SOSPENSIONE_LAVORI">Verbale di Sospensione</option>
                  <option value="RIPRESA_LAVORI">Verbale di Ripresa</option>
                  <option value="SAL">S.A.L.</option>
                  <option value="RELAZIONE_COLLAUDO">Relazione Collaudo</option>
                  <option value="CERTIFICATO_ULTIMAZIONE">Certificato Ultimazione</option>
                </select>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={handleDownloadWord} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm">
                <FileDown className="w-4 h-4 text-blue-600" /> Word
              </button>
              <button onClick={handlePrint} className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xl shadow-slate-900/20">
                <Printer className="w-4 h-4" /> Stampa / PDF
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-100 rounded-3xl p-10 border border-slate-300 shadow-inner">
            <div className="flex justify-center min-h-full">
              <DocumentPreview project={project} doc={currentDoc} type={effectiveDocType} allDocuments={documents} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
