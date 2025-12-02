
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

  const formatCurrency = (val: string | number) => {
      if (!val) return '€ 0,00';
      const num = typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val;
      if (isNaN(num)) return val.toString();
      return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num);
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
          case 'VERBALE_CONSEGNA': return 'VERBALE DI CONSEGNA DEI LAVORI';
          case 'SOSPENSIONE_LAVORI': return 'VERBALE DI SOSPENSIONE LAVORI';
          case 'RIPRESA_LAVORI': return 'VERBALE DI RIPRESA LAVORI';
          case 'SAL': return `STATO DI AVANZAMENTO LAVORI N. ${doc.visitNumber}`; // Using visitNumber as SAL number roughly
          case 'CERTIFICATO_REGOLARE_ESECUZIONE': return 'CERTIFICATO DI REGOLARE ESECUZIONE';
          case 'RELAZIONE_FINALE': return 'RELAZIONE SUL CONTO FINALE';
          case 'RELAZIONE_COLLAUDO': return 'RELAZIONE DI COLLAUDO';
          case 'CERTIFICATO_ULTIMAZIONE': return 'CERTIFICATO DI ULTIMAZIONE LAVORI';
          default: return type.replace(/_/g, ' ');
      }
  };

  const isCollaudo = type === 'VERBALE_COLLAUDO';

  return (
    <div className="font-serif-print text-black leading-normal w-full max-w-[21cm]">
      
      {/* Page 1 */}
      <div className="bg-white shadow-lg p-[2cm] min-h-[29.7cm] print-page mb-8 relative flex flex-col justify-between">
        
        <div>
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="uppercase font-bold text-base tracking-widest mb-6">
                    {project.entity}
                    {project.entityProvince && <span className="block text-sm mt-1 normal-case tracking-normal">(Provincia di {project.entityProvince})</span>}
                </h1>
                <div className="mb-6 px-4">
                    <p className="text-sm font-bold text-center uppercase leading-relaxed text-black">lavori di "{project.projectName}"</p>
                    <p className="text-sm font-bold text-center uppercase mt-1 text-black">CUP {project.cup} {project.cig && `- CIG ${project.cig}`}</p>
                </div>
                <h2 className="font-bold text-lg uppercase my-6 border-b-2 border-black pb-2 inline-block">
                    {getDocumentTitle()}
                </h2>
            </div>

            {/* --- DATA BLOCK REQUIRED --- */}
            <div className="text-sm mb-8 leading-relaxed space-y-3">
                
                {/* Impresa */}
                <div className="grid grid-cols-[220px_1fr] gap-2">
                    <div className="font-bold">Impresa:</div>
                    <div>
                        {project.contractor.name} <br/>
                        {project.contractor.address} - P.IVA {project.contractor.vat}
                        {project.contractor.isATI && " (Mandataria ATI)"}
                    </div>
                </div>

                {/* Contratto */}
                <div className="grid grid-cols-[220px_1fr] gap-2">
                    <div className="font-bold">Contratto d'appalto:</div>
                    <div>
                        stipulato in data {formatShortDate(project.contract.date)}, giusto Rep. {project.contract.repNumber}
                        {project.contract.regDate && `, Registrato a ${project.contract.regPlace} il ${formatShortDate(project.contract.regDate)} al n. ${project.contract.regNumber}`}
                    </div>
                </div>

                {/* Importo */}
                <div className="grid grid-cols-[220px_1fr] gap-2">
                    <div className="font-bold">Importo Contrattuale:</div>
                    <div>
                        {formatCurrency(project.contract.totalAmount)}, di cui {formatCurrency(project.contract.securityCosts)} per la prestazione relativa alla sicurezza, oltre IVA.
                    </div>
                </div>

                {/* Scadenza */}
                <div className="grid grid-cols-[220px_1fr] gap-2">
                    <div className="font-bold">Scadenza contrattuale lavori:</div>
                    <div>
                        giorni {project.contract.durationDays} naturali e consecutivi, per l'esecuzione di tutte le lavorazioni, 
                        decorrenti dalla data del verbale di consegna dei lavori 
                        {project.executionPhase.deliveryDate ? ` (${formatShortDate(project.executionPhase.deliveryDate)})` : ''} 
                        e quindi dal {formatShortDate(project.executionPhase.deliveryDate)} 
                        per cui l'ultimazione dovrà avvenire entro il {formatShortDate(project.contract.deadline)}.
                    </div>
                </div>

                {/* RUP */}
                <div className="grid grid-cols-[220px_1fr] gap-2">
                    <div className="font-bold">Responsabile Unico del Procedimento:</div>
                    <div>{project.subjects.rup.contact.title} {project.subjects.rup.contact.name}</div>
                </div>

                {/* DL */}
                <div className="grid grid-cols-[220px_1fr] gap-2">
                    <div className="font-bold">Direttore dei Lavori:</div>
                    <div>{project.subjects.dl.contact.title} {project.subjects.dl.contact.name}</div>
                </div>

                {/* CSE */}
                <div className="grid grid-cols-[220px_1fr] gap-2">
                    <div className="font-bold">CSE:</div>
                    <div>{project.subjects.cse.contact.title} {project.subjects.cse.contact.name}</div>
                </div>
            </div>
            {/* --------------------------- */}

            <hr className="border-t border-black my-6 w-1/3 mx-auto opacity-50" />

            {/* Body Content */}
            <div className="text-sm text-justify space-y-4">
                {isCollaudo ? (
                    // Collaudo Intro
                    <p>
                        Il giorno <strong>{verboseDate.day}</strong> del mese di <strong>{verboseDate.month}</strong> dell'anno <strong>{verboseDate.year}</strong>, 
                        alle ore <strong>{doc.time}</strong>, presso il luogo dei lavori in <strong>{project.location}</strong>, 
                        ha avvio la <strong>{doc.visitNumber}ª</strong> visita di collaudo in corso d'opera convocata con nota {doc.convocationDetails || '...'}.
                    </p>
                ) : (
                    // Generic Intro for other acts
                    <p>
                        L'anno <strong>{verboseDate.year}</strong>, il giorno <strong>{verboseDate.day}</strong> del mese di <strong>{verboseDate.month}</strong>, 
                        presso il luogo dei lavori in <strong>{project.location}</strong>.
                    </p>
                )}

                {/* Attendees Logic */}
                {isCollaudo ? (
                    <p>Sono presenti, oltre al sottoscritto Collaudatore {project.subjects.tester.contact.title} {project.subjects.tester.contact.name}:</p>
                ) : (
                    <p>Sono presenti, oltre al sottoscritto Direttore dei Lavori {project.subjects.dl.contact.title} {project.subjects.dl.contact.name}:</p>
                )}
                
                <div className="whitespace-pre-line pl-4 mb-4 font-normal italic bg-slate-50 p-2 print:bg-transparent print:p-0">
                    {doc.attendees || "Vedi elenco presenze."}
                </div>

                <div className="mb-4">
                    <p className="font-bold underline mb-2">Premesso che:</p>
                    <div className="whitespace-pre-line pl-2 mb-4">
                         {doc.premis}
                    </div>
                     <p className="font-bold underline mb-2">Si dà atto che:</p>
                    {doc.worksExecuted.length > 0 ? (
                        <ol className="list-decimal pl-8 space-y-1">
                            {doc.worksExecuted.map((work, idx) => <li key={idx}>{work};</li>)}
                        </ol>
                    ) : (
                        <p className="italic pl-4">Nessuna lavorazione specifica registrata in data odierna.</p>
                    )}
                </div>

                <div className="mb-4">
                    {doc.observations && (
                        <>
                            <p className="font-bold underline mb-2">Osservazioni e Valutazioni:</p>
                            <p className="whitespace-pre-line">{doc.observations}</p>
                        </>
                    )}
                </div>
            </div>

            <p className="mt-8">La visita si conclude alle ore {parseInt(doc.time.split(':')[0]) + 1}:00.</p>
        </div>

        {/* Signatures */}
        <div className="mt-16 grid grid-cols-2 gap-12 text-sm break-inside-avoid">
            <div className="space-y-16">
                <div><p>Il Direttore dei Lavori:</p><p className="font-bold mt-8 border-b border-black w-2/3">{project.subjects.dl.contact.name}</p></div>
                <div><p>L'Impresa:</p><p className="font-bold mt-8 border-b border-black w-2/3">{project.contractor.repName}</p></div>
            </div>
            <div className="space-y-16 text-right flex flex-col items-end">
                {isCollaudo && (
                    <div><p>Il Collaudatore:</p><p className="font-bold mt-8 border-b border-black w-48">{project.subjects.tester.contact.name}</p></div>
                )}
            </div>
        </div>
        
        {/* Footer */}
        {isCollaudo && (
            <div className="mt-8 border-t border-slate-300 pt-4 text-[10px] text-slate-500 text-center uppercase tracking-wider">
                <p className="font-bold text-black">{project.subjects.tester.contact.title} {project.subjects.tester.contact.name}</p>
                <p>{project.subjects.tester.contact.email} - {project.subjects.tester.contact.pec}</p>
            </div>
        )}

        {/* Photos Page (Appended if photos exist) */}
        {doc.photos && doc.photos.length > 0 && (
             <div className="break-before-page mt-8 pt-8 border-t-2 border-slate-100">
                <h3 className="font-bold text-center uppercase mb-6">Rilievo Fotografico Allegato</h3>
                <div className="grid grid-cols-2 gap-4">
                    {doc.photos.map((photo, i) => (
                        <div key={i} className="break-inside-avoid mb-4">
                            <img src={photo.url} className="w-full h-auto border border-slate-200" alt={`Foto ${i+1}`} />
                            <p className="text-xs mt-1 italic text-center">{photo.description || `Foto n. ${i+1}`}</p>
                        </div>
                    ))}
                </div>
             </div>
        )}

      </div>
    </div>
  );
};
