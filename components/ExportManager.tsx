
import React, { useState } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';
import { DocumentPreview } from './DocumentPreview';
import { Printer, FileOutput, FileCheck } from 'lucide-react';

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
                  <option value="VERBALE_COLLAUDO">Verbale di Collaudo</option>
                  <option value="VERBALE_CONSEGNA">Verbale di Consegna</option>
                  <option value="SOSPENSIONE_LAVORI">Verbale Sospensione</option>
                  <option value="RIPRESA_LAVORI">Verbale Ripresa</option>
                  <option value="SAL">Stato Avanzamento Lavori</option>
                  <option value="RELAZIONE_FINALE">Relazione Finale</option>
                  <option value="CERTIFICATO_REGOLARE_ESECUZIONE">Cert. Regolare Esecuzione</option>
                </select>
             </div>
          </div>
          
          <button
             onClick={handlePrint}
             className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg shadow flex items-center gap-2 font-bold transition-transform hover:scale-105"
          >
             <Printer className="w-5 h-5" /> Stampa / PDF
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3">
           <FileCheck className="w-5 h-5 text-yellow-600 mt-1" />
           <div className="text-sm text-yellow-800">
              <strong>Modalità Anteprima:</strong> Questo documento viene generato dinamicamente usando i dati inseriti nelle sezioni "Dati Appalto" e "Lavori". 
              Per archiviarlo, usa la funzione "Salva come PDF" del browser.
           </div>
        </div>
      </div>

      {/* The Printable Document */}
      <div className="print-container flex justify-center">
         <DocumentPreview project={project} doc={currentDoc} type={docType} />
      </div>

    </div>
  );
};
