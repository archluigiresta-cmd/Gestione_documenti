
import React from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';

interface DocumentPreviewProps {
  project: ProjectConstants;
  doc: DocumentVariables;
  type: DocumentType;
  allDocuments?: DocumentVariables[]; // Added to access history
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ project, doc, type, allDocuments = [] }) => {
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
  const assignmentStringClean = assignmentTypes.length > 1 
    ? assignmentTypes.slice(0, -1).join(", ") + " e " + assignmentTypes.slice(-1) 
    : assignmentString;
  
  const assignmentStringTitle = assignmentStringClean ? ` ${assignmentStringClean.toUpperCase()}` : "";

  const getDocumentTitle = () => {
      switch(type) {
          case 'VERBALE_COLLAUDO': return `VERBALE DI VISITA DI COLLAUDO${assignmentStringTitle} IN CORSO D'OPERA N. ${doc.visitNumber}`;
          case 'VERBALE_CONSEGNA': return 'VERBALE DI CONSEGNA DEI LAVORI';
          case 'SOSPENSIONE_LAVORI': return 'VERBALE DI SOSPENSIONE LAVORI';
          case 'RIPRESA_LAVORI': return 'VERBALE DI RIPRESA LAVORI';
          case 'SAL': return `STATO DI AVANZAMENTO LAVORI N. ${doc.visitNumber}`;
          case 'CERTIFICATO_REGOLARE_ESECUZIONE': return 'CERTIFICATO DI REGOLARE ESECUZIONE';
          case 'RELAZIONE_FINALE': return 'RELAZIONE SUL CONTO FINALE';
          case 'RELAZIONE_COLLAUDO': return 'RELAZIONE DI COLLAUDO';
          case 'CERTIFICATO_ULTIMAZIONE': return 'CERTIFICATO DI ULTIMAZIONE LAVORI';
          default: return (type as string).replace(/_/g, ' ');
      }
  };

  const isCollaudo = type === 'VERBALE_COLLAUDO' || type === 'RELAZIONE_COLLAUDO';

  // --- Specific Preamble Generation Logic for Collaudo ---

  // Point 1: Nomination (Always present)
  const generateCollaudoPreamblePoint1 = () => {
      const t = project.subjects.testerAppointment;
      const tester = project.subjects.tester.contact;
      
      let text = `- con ${t.nominationType} `;
      if (t.nominationAuthority) text += `del ${t.nominationAuthority} `;
      text += `n. ${t.nominationNumber || '...'} del ${formatShortDate(t.nominationDate)}`;
      
      if (t.contractRepNumber) {
          text += ` e successivo contratto/convenzione, rep. n. ${t.contractRepNumber} del ${formatShortDate(t.contractDate)}`;
      }
      if (t.contractProtocol) {
          text += `, prot. n. ${t.contractProtocol}`;
      }
      
      text += `, il ${project.entity || '...'} ha affidato, ai sensi dell’art. 116 del D. Lgs. 36/2023, `;
      text += `allo scrivente ${tester.title} ${tester.name} (C.F. ${tester.vat || '...'}), `;
      if (tester.professionalOrder && tester.registrationNumber) {
          text += `iscritto all’Albo ${tester.professionalOrder} al n. ${tester.registrationNumber}, `;
      }
      text += `l’incarico professionale di collaudo ${assignmentStringClean} relativo all’intervento di "${project.projectName}", CUP: ${project.cup}.`;

      return text;
  };

  // Helper to get previous documents sorted
  const getPreviousDocuments = () => {
      return allDocuments
          .filter(d => d.visitNumber < doc.visitNumber) // Only previous
          .sort((a, b) => a.visitNumber - b.visitNumber);
  };

  // Point 2, 3, etc.: Historical visits
  const generateHistoricalPoints = () => {
      const prevDocs = getPreviousDocuments();
      if (prevDocs.length === 0) return null;

      return prevDocs.map((prevDoc, index) => {
          const date = formatShortDate(prevDoc.date);
          const works = prevDoc.worksExecuted.map((w, i) => `${i + 1}. ${w}`).join(';\n');
          const worksInProgress = prevDoc.worksInProgress ? `Era in corso il ${prevDoc.worksInProgress}.` : '';

          if (prevDoc.visitNumber === 1) {
              // TEMPLATE FOR VISIT #1 REFERENCE (Activates from 2nd visit onwards)
              return (
                  <div key={prevDoc.id} className="mb-4 text-justify">
                      <p>
                          - in data {date}, con verbale di visita di collaudo {assignmentStringClean} in corso d’opera n. 1 sottoscritto in pari data, 
                          lo scrivente Collaudatore, con la scorta del progetto, dei documenti contabili, ha compiuto, insieme ai presenti, 
                          un esame generale del carteggio relativo al progetto dell’intervento di “{project.projectName}” CUP: {project.cup}, 
                          ed ha preso atto dell’andamento dei lavori eseguiti dalla consegna a detta data, così come dettagliati dal Direttore dei Lavori e di seguito riportati:
                      </p>
                      <div className="pl-8 my-2 font-serif-print italic whitespace-pre-line">
                          {works}
                      </div>
                      <p className="pl-8">{worksInProgress}</p>
                  </div>
              );
          } else {
              // TEMPLATE FOR VISIT #2+ REFERENCE (Activates from 3rd visit onwards)
              // Find date of the visit BEFORE prevDoc to determine the interval
              const visitBeforePrev = allDocuments.find(d => d.visitNumber === prevDoc.visitNumber - 1);
              const dateBefore = visitBeforePrev ? formatShortDate(visitBeforePrev.date) : '...';

              return (
                  <div key={prevDoc.id} className="mb-4 text-justify">
                      <p>
                          - in data {date}, con verbale di visita di collaudo {assignmentStringClean} in corso d’opera n. {prevDoc.visitNumber} sottoscritto in pari data, 
                          lo scrivente Collaudatore, ha preso atto dell’andamento dei lavori eseguiti dal {dateBefore} a detta data, 
                          così come dettagliati dal Direttore dei Lavori e di seguito riportate:
                      </p>
                      <div className="pl-8 my-2 font-serif-print italic whitespace-pre-line">
                          {works}
                      </div>
                      <p className="pl-8">{worksInProgress}</p>
                  </div>
              );
          }
      });
  };

  // Logic to determine reference date for current visit body
  const getPreviousVisitDate = () => {
      const prevDocs = getPreviousDocuments();
      if (prevDocs.length > 0) {
          // Last visit date
          const lastDoc = prevDocs[prevDocs.length - 1];
          return formatShortDate(lastDoc.date);
      } else {
          // No previous visit, use Delivery Date
          return project.executionPhase.deliveryDate 
             ? formatShortDate(project.executionPhase.deliveryDate) 
             : 'consegna dei lavori';
      }
  };

  // --------------------------------------------------------

  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-normal w-full max-w-[21cm]">
      
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

            {/* --- DATA BLOCK (Used Table for better Word export) --- */}
            <table className="w-full text-sm mb-8 leading-relaxed">
                <tbody>
                    {/* Impresa */}
                    <tr>
                        <td className="w-[220px] font-bold align-top py-1">Impresa:</td>
                        <td className="align-top py-1">
                            {project.contractor.name} <br/>
                            {project.contractor.address} - P.IVA {project.contractor.vat}
                            {project.contractor.isATI && " (Mandataria ATI)"}
                        </td>
                    </tr>

                    {/* Contratto */}
                    <tr>
                        <td className="w-[220px] font-bold align-top py-1">Contratto d'appalto:</td>
                        <td className="align-top py-1">
                            stipulato in data {formatShortDate(project.contract.date)}, giusto Rep. {project.contract.repNumber}
                            {project.contract.regDate && `, Registrato a ${project.contract.regPlace} il ${formatShortDate(project.contract.regDate)} al n. ${project.contract.regNumber}`}
                        </td>
                    </tr>

                    {/* Importo */}
                    <tr>
                        <td className="w-[220px] font-bold align-top py-1">Importo Contrattuale:</td>
                        <td className="align-top py-1">
                            {formatCurrency(project.contract.totalAmount)}, di cui {formatCurrency(project.contract.securityCosts)} per la prestazione relativa alla sicurezza, oltre IVA.
                        </td>
                    </tr>

                    {/* Scadenza */}
                    <tr>
                        <td className="w-[220px] font-bold align-top py-1">Scadenza contrattuale lavori:</td>
                        <td className="align-top py-1">
                            giorni {project.contract.durationDays} naturali e consecutivi, per l'esecuzione di tutte le lavorazioni, 
                            decorrenti dalla data del verbale di consegna dei lavori 
                            {project.executionPhase.deliveryDate ? ` (${formatShortDate(project.executionPhase.deliveryDate)})` : ''} 
                            e quindi dal {formatShortDate(project.executionPhase.deliveryDate)} 
                            per cui l'ultimazione dovrà avvenire entro il {formatShortDate(project.contract.deadline)}.
                        </td>
                    </tr>

                    {/* RUP */}
                    <tr>
                        <td className="w-[220px] font-bold align-top py-1">Responsabile Unico del Progetto:</td>
                        <td className="align-top py-1">{project.subjects.rup.contact.title} {project.subjects.rup.contact.name}</td>
                    </tr>

                    {/* DL */}
                    <tr>
                        <td className="w-[220px] font-bold align-top py-1">Direttore dei Lavori:</td>
                        <td className="align-top py-1">{project.subjects.dl.contact.title} {project.subjects.dl.contact.name}</td>
                    </tr>

                    {/* CSE */}
                    <tr>
                        <td className="w-[220px] font-bold align-top py-1">CSE:</td>
                        <td className="align-top py-1">{project.subjects.cse.contact.title} {project.subjects.cse.contact.name}</td>
                    </tr>
                </tbody>
            </table>
            {/* --------------------------- */}

            <hr className="border-t border-black my-6 w-1/3 mx-auto opacity-50" />

            {/* Body Content */}
            <div className="text-sm text-justify space-y-4">
                {isCollaudo ? (
                    // Collaudo Intro
                    <p>
                        Il giorno <strong>{verboseDate.day}</strong> del mese di <strong>{verboseDate.month}</strong> dell'anno <strong>{verboseDate.year}</strong>, 
                        alle ore <strong>{doc.time}</strong>, presso il luogo dei lavori in <strong>{project.location}</strong>, 
                        ha avvio la <strong>{doc.visitNumber}ª</strong> visita di collaudo in corso d'opera convocata con nota via <strong>{doc.convocationMethod || '...'}</strong> del <strong>{formatShortDate(doc.convocationDate)}</strong>.
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
                         {isCollaudo ? (
                             <>
                                {/* Point 1: Appointment (Always present) */}
                                <p className="mb-2 text-justify">{generateCollaudoPreamblePoint1()}</p>
                                
                                {/* Points 2, 3...: History based on previous docs */}
                                {generateHistoricalPoints()}

                                {/* Manual Premise (if any added by user) */}
                                {doc.premis && (
                                    <div className="mt-4 pt-4 border-t border-dotted border-gray-400">
                                        <p className="italic text-xs text-gray-500 mb-1">[Premesse Manuali Aggiuntive]:</p>
                                        <p>{doc.premis}</p>
                                    </div>
                                )}
                             </>
                         ) : (
                             doc.premis
                         )}
                    </div>
                    
                    {/* --- BODY SECTION (Replaces "Si dà atto che" for Collaudo) --- */}
                    {isCollaudo ? (
                        <div className="mt-6">
                            <p className="text-justify mb-2">
                                Durante il presente sopralluogo prende atto che, nel periodo intercorrente il {getPreviousVisitDate()} e la data odierna sono state effettuate le seguenti lavorazioni:
                            </p>
                            
                            {doc.worksExecuted.length > 0 ? (
                                <ol className="list-decimal pl-8 space-y-1 mb-4">
                                    {doc.worksExecuted.map((work, idx) => <li key={idx}>{work};</li>)}
                                </ol>
                            ) : (
                                <p className="italic pl-8 mb-4">Nessuna lavorazione terminata in questo periodo.</p>
                            )}

                            <p className="mb-2">Al momento, sono in corso di esecuzione le opere relative a:</p>
                            {doc.worksInProgress ? (
                                <ul className="list-disc pl-8 space-y-1 mb-4">
                                    {doc.worksInProgress.split('\n').filter(l => l.trim()).map((line, i) => (
                                        <li key={i}>{line}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="italic pl-8 mb-4">Nessuna lavorazione in corso.</p>
                            )}

                            <p className="mb-2">Prossime attività previste:</p>
                            {doc.upcomingWorks ? (
                                <ul className="list-disc pl-8 space-y-1 mb-4">
                                    {doc.upcomingWorks.split('\n').filter(l => l.trim()).map((line, i) => (
                                        <li key={i}>{line}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="italic pl-8 mb-4">Nessuna attività specifica pianificata.</p>
                            )}
                        </div>
                    ) : (
                        // Generic Body for other docs
                        <>
                             <p className="font-bold underline mb-2">Si dà atto che:</p>
                             {doc.worksExecuted.length > 0 ? (
                                <ol className="list-decimal pl-8 space-y-1">
                                    {doc.worksExecuted.map((work, idx) => <li key={idx}>{work};</li>)}
                                </ol>
                            ) : (
                                <p className="italic pl-4">Nessuna lavorazione specifica registrata.</p>
                            )}
                        </>
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

        {/* Signatures using Table for alignment */}
        <table className="mt-16 w-full text-sm break-inside-avoid">
            <tbody>
                <tr>
                    <td className="w-1/2 align-top pb-16">
                        <p>Il Direttore dei Lavori:</p>
                        <p className="font-bold mt-8 border-b border-black w-2/3">{project.subjects.dl.contact.name}</p>
                    </td>
                    <td className="w-1/2 align-top pb-16 text-right">
                         {isCollaudo && (
                            <div className="flex flex-col items-end">
                                <p>Il Collaudatore:</p>
                                <p className="font-bold mt-8 border-b border-black w-48">{project.subjects.tester.contact.name}</p>
                            </div>
                         )}
                    </td>
                </tr>
                <tr>
                    <td className="w-1/2 align-top">
                        <p>L'Impresa:</p>
                        <p className="font-bold mt-8 border-b border-black w-2/3">{project.contractor.repName}</p>
                    </td>
                    <td className="w-1/2"></td>
                </tr>
            </tbody>
        </table>
        
        {/* Footer */}
        {isCollaudo && (
            <div className="mt-8 border-t border-slate-300 pt-4 text-[10px] text-slate-500 text-center uppercase tracking-wider">
                <p className="font-bold text-black">{project.subjects.tester.contact.title} {project.subjects.tester.contact.name}</p>
                <p>{project.subjects.tester.contact.email} - {project.subjects.tester.contact.pec}</p>
                {project.subjects.tester.contact.professionalOrder && (
                    <p>Iscritto all'Albo {project.subjects.tester.contact.professionalOrder} n. {project.subjects.tester.contact.registrationNumber}</p>
                )}
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
