
import React from 'react';
import { ProjectConstants, DocumentVariables } from '../types';

interface DocumentPreviewProps {
  project: ProjectConstants;
  doc: DocumentVariables;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ project, doc }) => {
  // Helpers for formatting
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '___/___/____';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatVerboseDate = (dateStr: string) => {
      if (!dateStr) return { day: '...', month: '...', year: '...' };
      const date = new Date(dateStr);
      return {
          day: date.getDate().toString().padStart(2, '0'),
          month: date.toLocaleDateString('it-IT', { month: 'long' }),
          year: date.getFullYear().toString()
      };
  };

  const verboseDate = formatVerboseDate(doc.date);

  return (
    <div className="font-serif-print text-black leading-normal">
      
      {/* Page 1: Main Verbale */}
      <div className="max-w-[21cm] mx-auto bg-white shadow-lg p-[2cm] min-h-[29.7cm] print-page mb-8 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="uppercase font-bold text-base tracking-widest mb-10">
            {project.entity || 'PROVINCIA DI TARANTO'}
          </h1>
          
          <div className="mb-10 px-4">
             <p className="text-sm font-bold text-center uppercase leading-relaxed text-black">
                lavori di "{project.projectName}"
             </p>
             <p className="text-sm font-bold text-center uppercase mt-2 text-black">
                CUP {project.cup}
             </p>
          </div>

          <h2 className="font-bold text-lg uppercase my-8 border-b-2 border-black pb-2 inline-block">
            VERBALE DI VISITA DI COLLAUDO TECNICO AMMINISTRATIVO E STATICO IN CORSO D'OPERA N. {doc.visitNumber}
          </h2>
        </div>

        {/* Contract Data Block */}
        <div className="text-sm space-y-3 mb-8 bg-slate-50/50 p-4 border border-slate-100 rounded">
          <div className="grid grid-cols-[180px_1fr] gap-4">
            <div className="font-bold">Impresa:</div>
            <div>{project.contractor.name} - {project.contractor.address} - P.IVA {project.contractor.vat}</div>
          </div>

          <div className="grid grid-cols-[180px_1fr] gap-4">
            <div className="font-bold">Contratto d'appalto:</div>
            <div>stipulato in data {project.contract.date}, giusto Rep. N. {project.contract.repNumber}, {project.contract.registeredAt}</div>
          </div>

          <div className="grid grid-cols-[180px_1fr] gap-4">
            <div className="font-bold">Importo Contrattuale:</div>
            <div className="text-justify">
              {project.contract.totalAmount}, di cui euro {project.contract.netAmount} per lavori, euro {project.contract.securityCosts} oneri sicurezza.
            </div>
          </div>

          <div className="grid grid-cols-[180px_1fr] gap-4">
            <div className="font-bold">Scadenza contrattuale:</div>
            <div>Ultimazione prevista entro il {project.contract.deadline}</div>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-200">
             <div className="grid grid-cols-[250px_1fr]">
                <span className="font-normal">Responsabile Unico del Procedimento:</span>
                <span className="font-normal">{project.staff.rup}</span>
             </div>
             <div className="grid grid-cols-[250px_1fr]">
                <span className="font-normal">Direttore dei Lavori e CSE:</span>
                <span className="font-normal">{project.staff.direttoreLavori}</span>
             </div>
          </div>
        </div>

        <hr className="border-t border-black my-6 w-1/3 mx-auto opacity-50" />

        {/* Body */}
        <div className="text-sm text-justify space-y-4">
          <p>
            Il giorno <strong>{verboseDate.day}</strong> del mese di <strong>{verboseDate.month}</strong> {verboseDate.year}, alle ore {doc.time} presso il luogo dei lavori in {project.location}, ha avvio la {doc.visitNumber}° visita di collaudo in corso d'opera convocata {doc.convocationDetails ? doc.convocationDetails : 'per le vie brevi'}.
          </p>

          <p>
            Sono presenti, oltre al sottoscritto Collaudatore, <strong>{project.staff.collaudatore}</strong>:
          </p>
          <ul className="list-none pl-0 space-y-1 mb-4">
            <li>per l'ufficio di Direzione Lavori, il Direttore dei Lavori: {project.staff.direttoreLavori};</li>
            <li>per l'ufficio di Direzione Lavori, l'Ispettore di Cantiere: {project.staff.ispettoreCantiere};</li>
            <li>per l'Impresa {project.contractor.name}, Il Sig. {project.contractor.repName}, in qualità di {project.contractor.repRole || 'Rappresentante Legale'};</li>
          </ul>

          <div className="mb-4">
             <p className="font-bold underline mb-2">Premesso che:</p>
             <div className="whitespace-pre-line pl-2 border-l-2 border-slate-200">
                {doc.premis}
             </div>
          </div>

          <div className="mb-4">
            <p className="font-bold underline mb-2">
              in data {formatDate(doc.date)}, con verbale di visita di collaudo n. {doc.visitNumber} sottoscritto in pari data, lo scrivente Collaudatore ha preso atto dell'andamento dei lavori:
            </p>
            <ol className="list-decimal pl-8 space-y-1">
              {doc.worksExecuted.map((work, idx) => (
                <li key={idx}>{work};</li>
              ))}
              {doc.worksExecuted.length === 0 && <li className="italic text-slate-400">Nessuna lavorazione specifica rilevata in data odierna.</li>}
            </ol>
          </div>

          <div className="mb-4">
             {doc.observations && (
               <>
                 <p className="font-bold underline mb-2">Osservazioni:</p>
                 <p className="whitespace-pre-line">{doc.observations}</p>
               </>
             )}
          </div>

          <p className="mt-8">
            La visita si conclude alle ore {parseInt(doc.time.split(':')[0]) + 1}:00.
          </p>
        </div>

        {/* Signatures */}
        <div className="mt-16 grid grid-cols-2 gap-12 text-sm break-inside-avoid">
          <div className="space-y-16">
             <div>
               <p className="mb-4">L'Ispettore di Cantiere:</p>
               <p className="font-bold">{project.staff.ispettoreCantiere}</p>
             </div>
             <div>
               <p className="mb-4">Per l'Ufficio DL:</p>
               <p className="font-bold">{project.staff.direttoreLavori}</p>
             </div>
          </div>
          <div className="space-y-16 text-right">
             <div>
               <p className="mb-4">Il Collaudatore:</p>
               <p className="font-bold">{project.staff.collaudatore}</p>
             </div>
             <div>
               <p className="mb-4">L'Impresa:</p>
               <p className="font-bold">{project.contractor.repName}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Page 2: Photos (Only if present) */}
      {doc.photos && doc.photos.length > 0 && (
        <div className="max-w-[21cm] mx-auto bg-white shadow-lg p-[2cm] min-h-[29.7cm] print-page break-before-page">
           <h2 className="font-bold text-lg uppercase mb-8 text-center border-b pb-4">
            Allegato Fotografico - Verbale n. {doc.visitNumber} del {formatDate(doc.date)}
          </h2>
          
          <div className="grid grid-cols-2 gap-8">
            {doc.photos.map((photo, idx) => (
              <div key={photo.id} className="break-inside-avoid mb-4">
                <div className="border border-slate-300 p-2 bg-white">
                  <img src={photo.url} alt={`Foto ${idx+1}`} className="w-full h-64 object-contain mb-2" />
                </div>
                <p className="text-center text-sm mt-2 italic font-serif">
                  Foto {idx+1}: {photo.description || 'Vista lavori'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};