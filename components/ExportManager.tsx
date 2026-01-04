
import React, { useState } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { DocumentPreview } from './DocumentPreview';
import { Printer, FileCheck, FileDown, Search, FileText, Calendar, ChevronRight, FileType } from 'lucide-react';

interface ExportManagerProps {
  project: ProjectConstants;
  documents: DocumentVariables[];
  currentDocId: string;
  onSelectDocument: (id: string) => void;
}

export const ExportManager: React.FC<ExportManagerProps> = ({
  project,
  documents,
  currentDocId,
  onSelectDocument
}) => {
  const currentDoc = documents.find(d => d.id === currentDocId) || documents[0];
  const [docType, setDocType] = useState<DocumentType>('VERBALE_COLLAUDO');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter documents for the sidebar list
  const filteredDocs = documents
    .filter(d => d.visitNumber.toString().includes(searchTerm) || d.date.includes(searchTerm))
    .sort((a, b) => b.visitNumber - a.visitNumber); // Descending order

  if (!currentDoc) return <div className="p-8 text-center text-slate-500">Nessun documento disponibile nell'archivio.</div>;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = () => {
    const element = document.getElementById('document-preview-container');
    if (!element) return;

    // Get the HTML content
    let content = element.innerHTML;

    const htmlDoc = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${project.projectName} - ${docType}</title>
        <!--[if gte mso 9]>
        <xml>
        <w:WordDocument>
        <w:View>Print</w:View>
        <w:Zoom>100</w:Zoom>
        <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          /* PAGE SETUP */
          @page {
            size: A4;
            margin: 2.0cm 2cm 2.0cm 2cm; /* Top, Right, Bottom, Left */
            mso-page-orientation: portrait;
            mso-header: h1; /* LINK TO HEADER ID */
            mso-footer: f1; /* LINK TO FOOTER ID */
          }
          
          /* DEFINIZIONE HEADER/FOOTER PER WORD */
          div#h1 {
            margin: 0;
            mso-element: header;
          }
          div#f1 {
            margin: 0;
            mso-element: footer;
          }

          body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.2;
            color: #000000;
            background: #ffffff;
          }

          /* RESET & UTILS */
          .bg-white, .shadow-lg, .min-h-\\[29\\.7cm\\], .print-page {
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }

          /* TYPOGRAPHY */
          h1, h2, h3, h4 { font-family: Arial, sans-serif; margin-bottom: 6pt; page-break-after: avoid; }
          p { margin-bottom: 6pt; text-align: justify; }
          
          .text-center { text-align: center !important; }
          .text-justify { text-align: justify !important; }
          .text-right { text-align: right !important; }
          .font-bold { font-weight: bold; }
          .uppercase { text-transform: uppercase; }
          .underline { text-decoration: underline; }
          .text-sm { font-size: 11pt; }
          .text-xs { font-size: 10pt; }
          .italic { font-style: italic; }

          /* TABLES */
          table { width: 100%; border-collapse: collapse; margin-bottom: 12pt; }
          td, th { vertical-align: top; padding: 2pt; }
          
          /* HEADER SPECIFICS */
          .header-table td { text-align: center; }

          /* SIGNATURE LINES */
          .signature-line {
             border-bottom: 1px solid black;
             display: inline-block;
             width: 100%;
             margin-top: 30px;
          }
          
          /* PAGE BREAKS */
          .break-before-page { page-break-before: always; }
          .break-inside-avoid { page-break-inside: avoid; }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlDoc], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeDate = new Date().toISOString().split('T')[0];
    const safeType = docType.toLowerCase().replace(/_/g, '_');
    link.download = `${safeType}_${safeDate}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6 pb-4">
      
      {/* LEFT SIDEBAR: DOCUMENT ARCHIVE */}
      <div className="w-80 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden no-print shrink-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <FileCheck className="w-5 h-5 text-blue-600"/> Archivio Verbali
              </h3>
              <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
                  <input 
                    type="text" 
                    placeholder="Cerca verbale..." 
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {filteredDocs.map(doc => (
                  <button
                      key={doc.id}
                      onClick={() => onSelectDocument(doc.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all group relative ${
                          currentDocId === doc.id 
                          ? 'bg-blue-50 border-blue-500 shadow-sm' 
                          : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-sm'
                      }`}
                  >
                      <div className="flex justify-between items-start mb-1">
                          <span className={`text-xs font-bold uppercase tracking-wider ${currentDocId === doc.id ? 'text-blue-700' : 'text-slate-500'}`}>
                              Verbale N. {doc.visitNumber}
                          </span>
                          {currentDocId === doc.id && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400"/>
                          {new Date(doc.date).toLocaleDateString('it-IT')}
                      </div>
                      <div className="text-xs text-slate-400 truncate flex items-center gap-1">
                          <FileText className="w-3 h-3"/>
                          {doc.worksExecuted.length} lavorazioni
                      </div>
                      
                      {currentDocId === doc.id && (
                          <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400"/>
                      )}
                  </button>
              ))}
              {filteredDocs.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs italic">
                      Nessun verbale trovato.
                  </div>
              )}
          </div>
      </div>

      {/* RIGHT MAIN: PREVIEW & CONTROLS */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Controls Header (No Print) */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4 no-print flex flex-wrap items-center justify-between gap-4 shrink-0">
             
             <div className="flex items-center gap-4">
                 <div className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                     <span className="text-xs font-bold text-slate-500 uppercase mr-2">Selezionato:</span>
                     <span className="text-sm font-bold text-slate-800">N. {currentDoc.visitNumber} del {new Date(currentDoc.date).toLocaleDateString()}</span>
                 </div>

                 <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo Documento</label>
                    <select 
                      className="p-2 border border-blue-300 bg-blue-50 rounded font-bold text-blue-900 text-sm w-64 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                      value={docType}
                      onChange={(e) => setDocType(e.target.value as DocumentType)}
                    >
                      <option value="VERBALE_COLLAUDO">Verbale Visita di Collaudo</option>
                      <option value="VERBALE_CONSEGNA">Verbale di Consegna</option>
                      <option value="SOSPENSIONE_LAVORI">Verbale Sospensione</option>
                      <option value="RIPRESA_LAVORI">Verbale Ripresa</option>
                      <option value="SAL">Stato Avanzamento Lavori</option>
                      <option value="RELAZIONE_FINALE">Relazione sul Conto Finale</option>
                      <option value="RELAZIONE_COLLAUDO">Relazione di Collaudo</option>
                      <option value="CERTIFICATO_ULTIMAZIONE">Certificato Ultimazione Lavori</option>
                      <option value="CERTIFICATO_REGOLARE_ESECUZIONE">Cert. Regolare Esecuzione</option>
                    </select>
                 </div>
             </div>
             
             <div className="flex gap-2">
                  <button
                     onClick={handleDownloadWord}
                     className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 font-bold transition-all text-sm group"
                  >
                     <FileDown className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" /> Word
                  </button>
                  <button
                     onClick={handlePrint}
                     className="bg-white border border-slate-200 hover:bg-slate-50 text-red-700 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 font-bold transition-all text-sm group"
                  >
                     <FileType className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" /> PDF
                  </button>
                  <button
                     onClick={handlePrint}
                     className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 font-bold transition-all text-sm group"
                  >
                     <Printer className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Stampa
                  </button>
             </div>
          </div>

          {/* Scrollable Preview Area */}
          <div className="flex-1 overflow-y-auto bg-slate-100 rounded-xl p-8 border border-slate-200 shadow-inner print:bg-white print:p-0 print:border-none print:shadow-none print:overflow-visible">
             <div className="flex justify-center min-h-full">
                 <DocumentPreview project={project} doc={currentDoc} type={docType} allDocuments={documents} />
             </div>
          </div>
      </div>

    </div>
  );
};
