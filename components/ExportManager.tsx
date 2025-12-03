
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

    // Clone and prepare content
    const content = element.innerHTML;
    
    // Create a complete HTML document with Office namespaces and basic styling
    const htmlDoc = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${project.projectName} - ${docType}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #000; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          td, th { padding: 4px; vertical-align: top; }
          h1, h2, h3 { font-family: Arial, sans-serif; font-weight: bold; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .uppercase { text-transform: uppercase; }
          .underline { text-decoration: underline; }
          .text-sm { font-size: 10pt; }
          .text-xs { font-size: 8pt; }
          .mb-8 { margin-bottom: 24px; }
          .mb-6 { margin-bottom: 18px; }
          .mt-8 { margin-top: 24px; }
          .border-b { border-bottom: 1px solid #000; }
          .border-t { border-top: 1px solid #000; }
          .w-full { width: 100%; }
          img { max-width: 100%; height: auto; }
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
    // Format filename like "Verbale_Collaudo_2025-01-01.doc"
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
              <strong>Modalità Anteprima:</strong> Questo documento viene generato dinamicamente. 
              Usa "Scarica Word" per ottenere un file editabile o "Stampa / PDF" per la versione finale.
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
