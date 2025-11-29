
import React from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';

interface DocumentPreviewProps {
  project: ProjectConstants;
  doc: DocumentVariables;
  type: DocumentType;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ project, doc, type }) => {
  // Format helpers
  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return '...';
    try {
        return new Date(dateStr).toLocaleDateString('it-IT');
    } catch { return dateStr; }
  };

  const verboseDate = (() => {
      try {
          const date = new Date(doc.date);
          return {
              day: date.getDate().toString().padStart(2, '0'),
              month: date.toLocaleDateString('it-IT', { month: 'long' }),
              year: date.getFullYear().toString()
          };
      } catch { return { day: '...', month: '...', year: '...' }; }
  })();
  
  // Assignment String
  const assignmentTypes = [];
  if (project.testerAppointment.isStatic) assignmentTypes.push("statico");
  if (project.testerAppointment.isAdmin) assignmentTypes.push("tecnico-amministrativo");
  if (project.testerAppointment.isFunctional) assignmentTypes.push("funzionale degli impianti");
  const assignmentString = assignmentTypes.join(", ");

  // Dynamic Title based on Type
  const getDocumentTitle = () => {
      switch(type) {
          case 'VERBALE_COLLAUDO': return `VERBALE DI VISITA DI COLLAUDO ${assignmentString.toUpperCase()} IN CORSO D'OPERA N. ${doc.visitNumber}`;
          case 'VERBALE_CONSEGNA': return 'VERBALE DI CONSEGNA DEI LAVORI';
          case 'SOSPENSIONE_LAVORI': return 'VERBALE DI SOSPENSIONE DEI LAVORI';
          case 'RIPRESA_LAVORI': return 'VERBALE DI RIPRESA DEI LAVORI';
          case 'SAL': return `STATO DI AVANZAMENTO LAVORI N. ${doc.visitNumber}`;
          case 'RELAZIONE_FINALE': return 'RELAZIONE SUL CONTO FINALE';
          case 'CERTIFICATO_REGOLARE_ESECUZIONE': return 'CERTIFICATO DI REGOLARE ESECUZIONE';
          default: return 'DOCUMENTO TECNICO AMMINISTRATIVO';
      }
  };

  return (
    <div className="font-serif-print text-black leading-normal w-full max-w-[21cm]">
      
      {/* Page 1: Main Document */}
      <div className="bg-white shadow-lg p-[2cm] min-h-[29.7cm] print-page mb-8 relative flex flex-col justify-between">
        
        {/* Content Container */}
        <div>
            {/* Header */}
            <div className="text-center mb-12">
            <h1 className="uppercase font-bold text-base tracking-widest mb-10">
                {project.entity}
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
                {getDocumentTitle()}
            </h2>
            </div>

            {/* Contract Data Block */}
            <div className="text-sm space-y-3 mb-8 bg-slate-50/50 p-4 border border-slate-100 rounded print:border-none print:bg-transparent print:p-0">
            <div className="grid grid-cols-[180px_1fr] gap-4">
                <div className="font-bold">Impresa:</div>
                <div>
                    {project.contractor.name} <br/>
                    {project.contractor.address} - P.IVA {project.contractor.vat}
                </div>
            </div>

            <div className="grid grid-cols-[180px_1fr] gap-4">
                <div className="font-bold">Contratto d'appalto:</div>
                <div>
                stipulato in data {formatShortDate(project.contract.date)}, giusto Rep. N. {project.contract.repNumber}
                {project.contract.regPlace && `, registrato a ${project.contract.regPlace} il ${project.contract.regDate}, al n. ${project.contract.regNumber}, Serie ${project.contract.regSeries}`}.
                </div>
            </div>

            <div className="grid grid-cols-[180px_1fr] gap-4">
                <div className="font-bold">Importo Contrattuale:</div>
                <div className="text-justify">
                euro {project.contract.totalAmount}, di cui euro {project.contract.securityCosts} per oneri della sicurezza, oltre IVA.
                </div>
            </div>

            <div className="grid grid-cols-[180px_1fr] gap-4">
                <div className="font-bold">Scadenza contrattuale:</div>
                <div className="text-justify">
                giorni {project.contract.durationDays} naturali e consecutivi, decorrenti dal verbale di consegna ({formatShortDate(project.contract.handoverDate)}), scadenza il {formatShortDate(project.contract.deadline)}.
                </div>
            </div>

            <div className="mt-4 pt-2 border-t border-slate-200 print:border-black">
                <div className="grid grid-cols-[250px_1fr]">
                    <span className="font-normal">Responsabile Unico del Procedimento:</span>
                    <span className="font-normal">{project.staff.rup.name}</span>
                </div>
                <div className="grid grid-cols-[250px_1fr]">
                    <span className="font-normal">Direttore dei Lavori:</span>
                    <span className="font-normal">{project.staff.direttoreLavori.name}</span>
                </div>
            </div>
            </div>

            <hr className="border-t border-black my-6 w-1/3 mx-auto opacity-50" />

            {/* Body Text */}
            <div className="text-sm text-justify space-y-4">
            <p>
                Il giorno <strong>{verboseDate.day}</strong> del mese di <strong>{verboseDate.month}</strong> {verboseDate.year}, alle ore {doc.time} presso il luogo dei lavori in {project.location}, ha avvio la visita convocata {doc.convocationDetails || 'per le vie brevi'}.
            </p>

            <p>
                Sono presenti, oltre al sottoscritto Collaudatore, <strong>{project.testerAppointment.contact.title} {project.testerAppointment.contact.name}</strong>:
            </p>
            
            {/* Attendees */}
            <div className="whitespace-pre-line pl-4 mb-4">
                {doc.attendees ? doc.attendees : (
                <ul className="list-none pl-0 space-y-1">
                    <li>per l'ufficio di Direzione Lavori: {project.staff.direttoreLavori.name};</li>
                    <li>per l'Impresa: {project.contractor.repName} ({project.contractor.role || 'Legale Rappresentante'});</li>
                </ul>
                )}
            </div>

            {/* Dynamic Content based on Type */}
            {type === 'VERBALE_COLLAUDO' && (
                <>
                    <div className="mb-4">
                        <p className="font-bold underline mb-2">Premesso che:</p>
                        <div className="whitespace-pre-line pl-2 border-l-2 border-slate-200 print:border-black space-y-3">
                            <p>
                                - con {project.testerAppointment.nominationType} n. {project.testerAppointment.nominationNumber} del {formatShortDate(project.testerAppointment.nominationDate)}
                                l'Ente ha affidato allo scrivente l'incarico di collaudo {assignmentString};
                            </p>
                            {/* Shortened Handover Docs for brevity in code, assumes same logic as before */}
                            <p>- sono stati consegnati all'appaltatore i documenti previsti (Progetto, Verbale Consegna, AINOP, POS, etc.);</p>
                            <div className="whitespace-pre-wrap">{doc.premis}</div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <p className="font-bold underline mb-2">
                        Si dà atto che:
                        </p>
                        <ol className="list-decimal pl-8 space-y-1">
                        {doc.worksExecuted.map((work, idx) => (
                            <li key={idx}>{work};</li>
                        ))}
                        {doc.worksExecuted.length === 0 && <li className="italic text-slate-400 print:text-black">Nessuna lavorazione specifica rilevata.</li>}
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
                </>
            )}

            {/* Placeholder for other doc types */}
            {type !== 'VERBALE_COLLAUDO' && (
                <div className="border border-dashed border-slate-300 p-8 text-center text-slate-500 italic print:hidden">
                    [Contenuto specifico per {type} da implementare in base al modello]
                </div>
            )}

            <p className="mt-8">
                La visita si conclude alle ore {parseInt(doc.time.split(':')[0]) + 1}:00.
            </p>
            </div>

            {/* Signatures */}
            <div className="mt-16 grid grid-cols-2 gap-12 text-sm break-inside-avoid">
            <div className="space-y-16">
                <div>
                <p className="mb-4">L'Ispettore di Cantiere:</p>
                <p className="font-bold">{project.staff.ispettoreCantiere.name}</p>
                </div>
                <div>
                <p className="mb-4">Per l'Ufficio DL:</p>
                <p className="font-bold">{project.staff.direttoreLavori.name}</p>
                </div>
            </div>
            <div className="space-y-16 text-right">
                <div>
                <p className="mb-4">Il Collaudatore:</p>
                <p className="font-bold">{project.testerAppointment.contact.name}</p>
                </div>
                <div>
                <p className="mb-4">L'Impresa:</p>
                <p className="font-bold">{project.contractor.repName}</p>
                </div>
            </div>
            </div>
        </div>

        {/* Footer */}
        <div className="mt-8 border-t border-slate-300 pt-4 text-[10px] text-slate-500 text-center uppercase tracking-wider">
            <p className="font-bold text-black">{project.testerAppointment.contact.title} {project.testerAppointment.contact.name}</p>
            <p>{project.testerAppointment.contact.address} &bull; P.IVA/C.F. {project.testerAppointment.contact.vat}</p>
            <p>
                {project.testerAppointment.contact.email && `Email: ${project.testerAppointment.contact.email} `} 
                {project.testerAppointment.contact.pec && `&bull; PEC: ${project.testerAppointment.contact.pec} `}
                {project.testerAppointment.contact.phone && `&bull; Tel: ${project.testerAppointment.contact.phone}`}
            </p>
        </div>

      </div>

      {/* Page 2: Photos (Only if present) */}
      {doc.photos && doc.photos.length > 0 && (
        <div className="bg-white shadow-lg p-[2cm] min-h-[29.7cm] print-page break-before-page flex flex-col justify-between">
           <div>
                <h2 className="font-bold text-lg uppercase mb-8 text-center border-b pb-4">
                    Allegato Fotografico - {getDocumentTitle()}
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
           
           {/* Footer duplicated for photo page */}
           <div className="mt-8 border-t border-slate-300 pt-4 text-[10px] text-slate-500 text-center uppercase tracking-wider">
                <p className="font-bold text-black">{project.testerAppointment.contact.title} {project.testerAppointment.contact.name}</p>
                <p>Pagina Allegato Fotografico</p>
            </div>
        </div>
      )}

    </div>
  );
};
