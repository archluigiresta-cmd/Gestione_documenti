
import React from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';

interface DocumentPreviewProps {
  project: ProjectConstants;
  doc: DocumentVariables;
  type: DocumentType;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ project, doc, type }) => {
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
  
  const assignmentTypes = [];
  if (project.subjects.testerAppointment.isStatic) assignmentTypes.push("statico");
  if (project.subjects.testerAppointment.isAdmin) assignmentTypes.push("tecnico-amministrativo");
  if (project.subjects.testerAppointment.isFunctional) assignmentTypes.push("funzionale degli impianti");
  const assignmentString = assignmentTypes.join(", ");

  const getDocumentTitle = () => {
      switch(type) {
          case 'VERBALE_COLLAUDO': return `VERBALE DI VISITA DI COLLAUDO ${assignmentString.toUpperCase()} IN CORSO D'OPERA N. ${doc.visitNumber}`;
          default: return type.replace(/_/g, ' ');
      }
  };

  return (
    <div className="font-serif-print text-black leading-normal w-full max-w-[21cm]">
      
      {/* Page 1 */}
      <div className="bg-white shadow-lg p-[2cm] min-h-[29.7cm] print-page mb-8 relative flex flex-col justify-between">
        
        <div>
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="uppercase font-bold text-base tracking-widest mb-10">
                    {project.entity}
                    {project.entityProvince && <span className="block text-sm mt-1 normal-case tracking-normal">(Provincia di {project.entityProvince})</span>}
                </h1>
                <div className="mb-10 px-4">
                    <p className="text-sm font-bold text-center uppercase leading-relaxed text-black">lavori di "{project.projectName}"</p>
                    <p className="text-sm font-bold text-center uppercase mt-2 text-black">CUP {project.cup}</p>
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
                        {project.contractor.isATI && " (In qualità di mandataria ATI)"}
                    </div>
                </div>
                <div className="grid grid-cols-[180px_1fr] gap-4">
                    <div className="font-bold">Contratto:</div>
                    <div>
                        stipulato in data {formatShortDate(project.contract.date)}, Rep. {project.contract.repNumber}
                    </div>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-200 print:border-black">
                    <div className="grid grid-cols-[250px_1fr]">
                        <span className="font-normal">RUP:</span>
                        <span className="font-normal">{project.subjects.rup.contact.name}</span>
                    </div>
                    <div className="grid grid-cols-[250px_1fr]">
                        <span className="font-normal">Direttore Lavori:</span>
                        <span className="font-normal">{project.subjects.dl.contact.name}</span>
                    </div>
                </div>
            </div>

            <hr className="border-t border-black my-6 w-1/3 mx-auto opacity-50" />

            {/* Body */}
            <div className="text-sm text-justify space-y-4">
                <p>
                    Il giorno <strong>{verboseDate.day}</strong> del mese di <strong>{verboseDate.month}</strong> {verboseDate.year}, 
                    alle ore {doc.time}, in {project.location}, il sottoscritto Collaudatore <strong>{project.subjects.tester.contact.name}</strong> 
                    ha effettuato la visita convocata {doc.convocationDetails}.
                </p>

                <p>Sono presenti:</p>
                <div className="whitespace-pre-line pl-4 mb-4 font-normal">
                    {doc.attendees || "Vedi foglio presenze allegato."}
                </div>

                <div className="mb-4">
                    <p className="font-bold underline mb-2">Si dà atto che:</p>
                    <ol className="list-decimal pl-8 space-y-1">
                        {doc.worksExecuted.map((work, idx) => <li key={idx}>{work};</li>)}
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
            </div>

            <p className="mt-8">La visita si conclude alle ore {parseInt(doc.time.split(':')[0]) + 1}:00.</p>
        </div>

        {/* Signatures */}
        <div className="mt-16 grid grid-cols-2 gap-12 text-sm break-inside-avoid">
            <div className="space-y-12">
                <div><p>Il Direttore dei Lavori:</p><p className="font-bold">{project.subjects.dl.contact.name}</p></div>
                <div><p>L'Impresa:</p><p className="font-bold">{project.contractor.repName}</p></div>
            </div>
            <div className="space-y-12 text-right">
                <div><p>Il Collaudatore:</p><p className="font-bold">{project.subjects.tester.contact.name}</p></div>
            </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 border-t border-slate-300 pt-4 text-[10px] text-slate-500 text-center uppercase tracking-wider">
            <p className="font-bold text-black">{project.subjects.tester.contact.name}</p>
            <p>{project.subjects.tester.contact.email} - {project.subjects.tester.contact.pec}</p>
        </div>

      </div>
    </div>
  );
};
