import React, { useState } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { DocumentPreview } from './DocumentPreview';
import { Printer, FileCheck, FileDown, Search, FileText, Calendar, ChevronRight, Trash2, Pencil, Mail, Plus } from 'lucide-react';

interface ExportManagerProps {
  project: ProjectConstants;
  documents: DocumentVariables[];
  currentDocId: string;
  onSelectDocument: (id: string) => void;
  onDeleteDocument?: (id: string) => void;
  onEdit?: (id: string) => void;
  onNewDocument?: () => void; // Passata da App.tsx
}

export const ExportManager: React.FC<ExportManagerProps> = ({
  project,
  documents,
  currentDocId,
  onSelectDocument,
  onDeleteDocument,
  onEdit,
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

  if (!currentDoc) return <div className="p-8 text-center text-slate-500">Nessun documento disponibile.</div>;

  const handlePrint = () => { 
    const element = document.getElementById('document-preview-container');
    if (!element) return;

    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) {
        alert("Per favore, abilita i popup per stampare il documento.");
        return;
    }

    const content = element.innerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${effectiveDocType} - N. ${currentDoc.visitNumber}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&display=swap');
            
            @page { 
              size: A4; 
              margin: 1.5cm 1cm; 
            }
            
            body { 
              background: white !important; 
              margin: 0; 
              padding: 0; 
              font-family: 'Noto Serif', serif;
              color: black;
              line-height: 1.2;
              -webkit-print-color-adjust: exact;
            }

            #print-container { width: 100%; }
            .no-print { display: none !important; }
            .underline { text-decoration: underline; }
            .font-bold { font-weight: bold; }
            .uppercase { text-transform: uppercase; }
            .text-right { text-align: right; }
            .text-justify { text-align: justify; }
            .italic { font-style: italic; }
          </style>
        </head>
        <body>
          <div id="print-container">
            ${content}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadWord = () => {
    const element = document.getElementById('document-preview-container');
    if (!element) return;
    let content = element.innerHTML;
    const htmlDoc = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <style>
          @page { size: A4; margin: 2.0cm; }
          body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.2; text-align: justify; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .uppercase { text-transform: uppercase; }
          .text-right { text-align: right; }
          .underline { text-decoration: underline; }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `;
    const blob = new Blob(['\ufeff', htmlDoc], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${effectiveDocType.toLowerCase()}_n${currentDoc.visitNumber}.doc`;
    link.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] no-print">
      
      <div className="flex bg-white border border-slate-200 rounded-xl mb-4 p-1 shadow-sm">
        <button 
          onClick={() => setActiveTab('convocazione')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-bold text-sm transition-all ${activeTab === 'convocazione' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Mail className="w-5 h-5"/> Lettera Convocazione
        </button>
        <button 
          onClick={() => setActiveTab('verbali')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-bold text-sm transition-all ${activeTab === 'verbali' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <FileText className="w-5 h-5"/> Verbali
        </button>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        
        <div className="w-80 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                    <FileCheck className="w-4 h-4 text-blue-600"/> Archivio
                </h3>
                {onNewDocument && (
                    <button 
                        onClick={onNewDocument}
                        className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm"
                        title="Nuova Convocazione / Visita"
                    >
                        <Plus className="w-4 h-4"/>
                    </button>
                )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
              <input 
                type="text" 
                placeholder="Cerca per numero o data..." 
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredDocs.map(doc => (
              <div
                key={doc.id}
                onClick={() => onSelectDocument(doc.id)}
                className={`w-full p-3 rounded-lg border transition-all group relative cursor-pointer ${currentDocId === doc.id ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-100 hover:border-blue-200'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${currentDocId === doc.id ? 'text-blue-700' : 'text-slate-500'}`}>
                    VISITA N. {doc.visitNumber}
                  </span>
                  <div className="flex items-center gap-1">
                    {onEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(doc.id); }} title="Modifica" className="p-1 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100"><Pencil className="w-3.5 h-3.5"/></button>}
                    {onDeleteDocument && <button onClick={(e) => { e.stopPropagation(); onDeleteDocument(doc.id); }} title="Elimina" className="p-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5"/></button>}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-slate-400"/>
                  {new Date(doc.date).toLocaleDateString('it-IT')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-4">
              <div className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="text-xs font-bold text-slate-800">
                  {activeTab === 'verbali' ? 'Verbale' : 'Convocazione'} N. {currentDoc.visitNumber}
                </span>
              </div>
              {activeTab === 'verbali' && (
                <select 
                  className="p-2 border border-blue-300 bg-blue-50 rounded font-bold text-blue-900 text-xs w-56 outline-none"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as DocumentType)}
                >
                  <option value="VERBALE_COLLAUDO">Verbale di Collaudo</option>
                  <option value="VERBALE_CONSEGNA">Verbale di Consegna</option>
                  <option value="SOSPENSIONE_LAVORI">Verbale Sospensione</option>
                  <option value="RIPRESA_LAVORI">Verbale Ripresa</option>
                  <option value="SAL">SAL</option>
                  <option value="RELAZIONE_COLLAUDO">Relazione Collaudo</option>
                  <option value="CERTIFICATO_ULTIMAZIONE">Cert. Ultimazione</option>
                </select>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={handleDownloadWord} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm">
                <FileDown className="w-4 h-4 text-blue-600" /> Word (.doc)
              </button>
              <button onClick={handlePrint} className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-md">
                <Printer className="w-4 h-4" /> Stampa / PDF
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-200 rounded-xl p-8 border border-slate-300 shadow-inner">
            <div className="flex justify-center min-h-full">
              <DocumentPreview project={project} doc={currentDoc} type={effectiveDocType} allDocuments={documents} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};