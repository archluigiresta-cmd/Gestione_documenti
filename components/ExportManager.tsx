
import React, { useState } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { DocumentPreview } from './DocumentPreview';
import { Printer, FileOutput, FileCheck, FileDown } from 'lucide-react';

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

  if (!currentDoc) return <div>Nessun documento disponibile</div>;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = () => {
    const element = document.getElementById('document-preview-container');
    if (!element) return;

    // Clone content to avoid modifying the DOM, although we are just reading innerHTML
    let content = element.innerHTML;

    // Create a complete HTML document with Office namespaces and robust styling mapping
    // We map Tailwind classes to standard CSS that Word understands
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
          /* --- BASE STYLES --- */
          @page {
            size: A4;
            margin: 2.0cm 2.0cm 2.0cm 2.0cm;
            mso-page-orientation: portrait;
          }
          body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.15;
            color: #000000;
            background-color: white;
          }
          
          /* --- RESET UI ELEMENTS --- */
          /* Hide app-specific UI containers/shadows in Word */
          .bg-white, .shadow-lg, .min-h-\\[29\\.7cm\\], .print-page { 
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          /* --- TYPOGRAPHY MAPPING --- */
          h1, h2, h3, h4, h5, h6 { 
            font-family: Arial, sans-serif; 
            margin-bottom: 12pt; 
            page-break-after: avoid;
          }
          
          .font-bold { font-weight: bold; }
          .italic { font-style: italic; }
          .uppercase { text-transform: uppercase; }
          .underline { text-decoration: underline; }
          
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-justify { text-align: justify; }
          
          .text-lg { font-size: 14pt; }
          .text-xl { font-size: 16pt; }
          .text-sm { font-size: 11pt; }
          .text-xs { font-size: 10pt; }

          /* --- SPACING & MARGINS (Tailwind Mapping) --- */
          .mb-8 { margin-bottom: 24pt; }
          .mb-6 { margin-bottom: 18pt; }
          .mb-4 { margin-bottom: 12pt; }
          .mb-2 { margin-bottom: 6pt; }
          
          .mt-16 { margin-top: 48pt; }
          .mt-8 { margin-top: 24pt; }
          .mt-6 { margin-top: 18pt; }
          
          .pl-8 { padding-left: 24pt; }
          .pl-4 { padding-left: 12pt; }
          .pl-2 { padding-left: 6pt; }

          /* --- TABLES --- */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12pt;
            border: none;
          }
          td, th {
            vertical-align: top;
            padding: 4pt 2pt;
          }
          
          /* Specific Column Width for Labels */
          .w-\\[220px\\] { width: 180px; } 

          /* --- LISTS --- */
          ul, ol {
            margin-top: 0;
            margin-bottom: 12pt;
            padding-left: 30pt;
          }
          li {
            margin-bottom: 3pt;
          }

          /* --- BORDERS & LINES --- */
          .border-b { border-bottom: 1px solid #000; }
          .border-b-2 { border-bottom: 2px solid #000; }
          .border-t { border-top: 1px solid #000; }
          .border-black { border-color: #000; }

          /* --- UTILITIES --- */
          .whitespace-pre-line { white-space: pre-wrap; }
          
          /* --- PHOTOS --- */
          img {
            max-width: 100%;
            height: auto;
          }
          .grid {
            /* Fallback for grid in Word: simplified block layout */
            display: block;
          }
          .grid-cols-2 > div {
            display: inline-block;
            width: 48%;
            margin-right: 1%;
            vertical-align: top;
            margin-bottom: 12pt;
          }
          
          /* Page Breaks */
          .break-before-page { page-break-before: always; }
          .break-inside-avoid { page-break-inside: avoid; }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;

    // Create blob and download link
    const blob = new Blob(['\ufeff', htmlDoc], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Format filename
    const safeDate = new Date().toISOString().split('T')[0];
    const safeType = docType.toLowerCase().replace(/_/g, '_');
    link.download = `${safeType}_${safeDate}.doc`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      {/* Controls Bar (Hidden on Print) */}
      <div className="no-print mb-8 space-y-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Seleziona Verbale</label>
                <select 
                  className="p-2 border border-slate-300 rounded font-medium text-sm w-64"
                  value={currentDocId}
                  onChange={(e) => onSelectDocument(e.target.value)}
                >
                  {documents.map(d => (
                    <option key={d.id} value={d.id}>
                        N. {d.visitNumber} del {new Date(d.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo Documento</label>
                <select 
                  className="p-2 border border-blue-300 bg-blue-50 rounded font-bold text-blue-900 text-sm w-64"
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
                 className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow flex items-center gap-2 font-bold transition-transform hover:scale-105"
              >
                 <FileDown className="w-5 h-5" /> Scarica Word
              </button>
              <button
                 onClick={handlePrint}
                 className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg shadow flex items-center gap-2 font-bold transition-transform hover:scale-105"
              >
                 <Printer className="w-5 h-5" /> Stampa / PDF
              </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3">
           <FileCheck className="w-5 h-5 text-yellow-600 mt-1" />
           <div className="text-sm text-yellow-800">
              <strong>Info Esportazione:</strong> La funzione "Scarica Word" genera un file ottimizzato per Microsoft Word, convertendo il layout web in formato stampabile. Verifica sempre impaginazione e interruzioni di pagina dopo il download.
           </div>
        </div>
      </div>

      {/* The Printable Document */}
      <div className="print-container flex justify-center">
         <DocumentPreview project={project} doc={currentDoc} type={docType} allDocuments={documents} />
      </div>

    </div>
  );
};
