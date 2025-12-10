
import React from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';

interface DocumentPreviewProps {
  project: ProjectConstants;
  doc: DocumentVariables;
  type: DocumentType;
  allDocuments?: DocumentVariables[]; 
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

  const getPreviousDocuments = () => {
      return allDocuments
          .filter(d => d.visitNumber < doc.visitNumber) 
          .sort((a, b) => a.visitNumber - b.visitNumber);
  };

  const getWorksForVisit = (visitNum: number, fallbackWorks: string[]) => {
      const summaries = project.executionPhase.testerVisitSummaries || [];
      const summary = summaries[visitNum - 1];
      if (summary && summary.works && summary.works.length > 0) {
          return summary.works;
      }
      return fallbackWorks;
  };

  const generateHistoricalPoints = () => {
      const prevDocs = getPreviousDocuments();
      if (prevDocs.length === 0) return null;

      return prevDocs.map((prevDoc, index) => {
          const date = formatShortDate(prevDoc.date);
          const worksList = getWorksForVisit(prevDoc.visitNumber, prevDoc.worksExecuted);
          const worksText = worksList.map((w, i) => `${i + 1}. ${w}`).join(';\n');
          const worksInProgress = prevDoc.worksInProgress ? `Era in corso il ${prevDoc.worksInProgress}.` : '';

          if (prevDoc.visitNumber === 1) {
              return (
                  <div key={prevDoc.id} className="mb-4 text-justify">
                      <p>
                          - in data {date}, con verbale di visita di collaudo {assignmentStringClean} in corso d’opera n. 1 sottoscritto in pari data, 
                          lo scrivente Collaudatore, con la scorta del progetto, dei documenti contabili, ha compiuto, insieme ai presenti, 
                          un esame generale del carteggio relativo al progetto dell’intervento di “{project.projectName}” CUP: {project.cup}, 
                          ed ha preso atto dell’andamento dei lavori eseguiti dalla consegna a detta data, così come dettagliati dal Direttore dei Lavori e di seguito riportati:
                      </p>
                      <div className="pl-8 my-2 font-serif-print italic whitespace-pre-line">
                          {worksText}
                      </div>
                      <p className="pl-8">{worksInProgress}</p>
                  </div>
              );
          } else {
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
                          {worksText}
                      </div>
                      <p className="pl-8">{worksInProgress}</p>
                  </div>
              );
          }
      });
  };

  const getPreviousVisitDateDescription = () => {
      const prevDocs = getPreviousDocuments();
      if (prevDocs.length > 0) {
          const lastDoc = prevDocs[prevDocs.length - 1];
          return `il ${formatShortDate(lastDoc.date)}`;
      } else {
          return project.executionPhase.deliveryDate 
             ? `il ${formatShortDate(project.executionPhase.deliveryDate)}`
             : 'la consegna dei lavori';
      }
  };

  const formatNameWithTitle = (contact: { title?: string, name: string }) => {
      if (!contact || !contact.name) return '...';
      const titlePrefix = contact.title ? `${contact.title} ` : '';
      return `${titlePrefix}${contact.name}`;
  };
  
  const getDefaultAttendees = () => {
      const lines = [];
      const { rup, dl, cse } = project.subjects;
      
      if (rup.contact.name) lines.push(`Responsabile Unico del Progetto: ${formatNameWithTitle(rup.contact)}`);
      if (dl.contact.name) lines.push(`Direttore dei Lavori: ${formatNameWithTitle(dl.contact)}`);
      if (cse.contact.name) lines.push(`Coord. Sicurezza Esecuzione: ${formatNameWithTitle(cse.contact)}`);
      
      if (project.contractor.name) {
          const c = project.contractor;
          const role = c.role || 'Legale Rappresentante';
          const repTitle = c.repTitle ? `${c.repTitle} ` : 'Sig. ';
          lines.push(`per l'Impresa ${c.name} (${role}): ${repTitle}${c.repName}`);
      }
      
      return lines.join('\n');
  };
  
  const currentWorksList = getWorksForVisit(doc.visitNumber, doc.worksExecuted);

  // --------------------------------------------------------

  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-normal w-full max-w-[21cm]">
      
      {/* Page 1 */}
      <div className="bg-white shadow-lg p-[2cm] min-h-[29.7cm] print-page mb-8 relative flex flex-col justify-between">
        
        <div>
            {/* --- TRUE MSO HEADER SECTION --- */}
            {/* This div is shown at top in web view, and used by Word as the repeating header */}
            <div id="h1">
                <table style={{ width: '100%', marginBottom: '10pt' }}>
                    <tbody>
                        <tr>
                            <td align="center" style={{ textAlign: 'center', verticalAlign: 'middle', paddingBottom: '10px', borderBottom: '1px solid #000' }}>
                                {project.headerLogo && (
                                    <div style={{ marginBottom: '5px' }}>
                                        <img src={project.headerLogo} style={{ maxHeight: '2.5cm', width: 'auto' }} alt="Logo" />
                                    </div>
                                )}
                                <p className="uppercase font-bold text-base tracking-widest mb-0" style={{ textAlign: 'center', margin: 0 }}>
                                    {project.entity}
                                </p>
                                {project.entityProvince && (
                                    <p className="text-sm mt-1 normal-case tracking-normal" style={{ textAlign: 'center', margin: 0 }}>
                                        (Provincia di {project.entityProvince})
                                    </p>
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Document Specific Header Info (Title, Project Name) - This stays in body */}
            <div className="mb-8">
                <table className="header-table" style={{ width: '100%' }}>
                    <tbody>
                        <tr>
                            <td align="center" style={{ textAlign: 'center', padding: '16px 0' }}>
                                <p className="text-sm font-bold uppercase leading-relaxed text-black" style={{ textAlign: 'center' }}>
                                    lavori di "{project.projectName}"
                                </p>
                                <p className="text-sm font-bold uppercase mt-1 text-black" style={{ textAlign: 'center' }}>
                                    CUP {project.cup} {project.cig && `- CIG ${project.cig}`}
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style={{ textAlign: 'center', padding: '16px 0' }}>
                                <div style={{ borderBottom: '2px solid black', display: 'inline-block', paddingBottom: '4px' }}>
                                    <h2 className="font-bold text-lg uppercase mb-0" style={{ textAlign: 'center' }}>
                                        {getDocumentTitle()}
                                    </h2>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* --- DATA BLOCK (Table) --- */}
            <table className="w-full text-sm mb-8 leading-relaxed">
                <tbody>
                    {/* Impresa */}
                    <tr>
                        <td style={{ width: '220px', fontWeight: 'bold', verticalAlign: 'top' }}>Impresa:</td>
                        <td style={{ verticalAlign: 'top' }}>
                            {project.contractor.name} <br/>
                            {project.contractor.address} - P.IVA {project.contractor.vat}
                            {project.contractor.isATI && " (Mandataria ATI)"}
                        </td>
                    </tr>

                    {/* Contratto */}
                    <tr>
                        <td style={{ width: '220px', fontWeight: 'bold', verticalAlign: 'top' }}>Contratto d'appalto:</td>
                        <td style={{ verticalAlign: 'top' }}>
                            stipulato in data {formatShortDate(project.contract.date)}, giusto Rep. {project.contract.repNumber}
                            {project.contract.regDate && `, Registrato a ${project.contract.regPlace} il ${formatShortDate(project.contract.regDate)} al n. ${project.contract.regNumber}`}
                        </td>
                    </tr>

                    {/* Importo */}
                    <tr>
                        <td style={{ width: '220px', fontWeight: 'bold', verticalAlign: 'top' }}>Importo Contrattuale:</td>
                        <td style={{ verticalAlign: 'top' }}>
                            {formatCurrency(project.contract.totalAmount)}, di cui {formatCurrency(project.contract.securityCosts)} per la prestazione relativa alla sicurezza, oltre IVA.
                        </td>
                    </tr>

                    {/* Scadenza */}
                    <tr>
                        <td style={{ width: '220px', fontWeight: 'bold', verticalAlign: 'top' }}>Scadenza contrattuale lavori:</td>
                        <td style={{ verticalAlign: 'top' }}>
                            giorni {project.contract.durationDays || '...'} naturali e consecutivi, per l'esecuzione di tutte le lavorazioni, 
                            decorrenti dal {formatShortDate(project.executionPhase.deliveryDate)}, 
                            data del verbale di consegna dei lavori per cui l'ultimazione dovrà avvenire entro il {formatShortDate(project.executionPhase.completionDate)}.
                        </td>
                    </tr>

                    {/* RUP */}
                    <tr>
                        <td style={{ width: '220px', fontWeight: 'bold', verticalAlign: 'top' }}>Responsabile Unico del Progetto:</td>
                        <td style={{ verticalAlign: 'top' }}>{formatNameWithTitle(project.subjects.rup.contact)}</td>
                    </tr>

                    {/* DL */}
                    <tr>
                        <td style={{ width: '220px', fontWeight: 'bold', verticalAlign: 'top' }}>Direttore dei Lavori:</td>
                        <td style={{ verticalAlign: 'top' }}>{formatNameWithTitle(project.subjects.dl.contact)}</td>
                    </tr>

                    {/* CSE */}
                    <tr>
                        <td style={{ width: '220px', fontWeight: 'bold', verticalAlign: 'top' }}>CSE:</td>
                        <td style={{ verticalAlign: 'top' }}>{formatNameWithTitle(project.subjects.cse.contact)}</td>
                    </tr>
                </tbody>
            </table>
            {/* --------------------------- */}

            <hr className="border-t border-black my-6 w-1/3 mx-auto opacity-50" />

            {/* Body Content */}
            <div className="text-sm text-justify space-y-4">
                {isCollaudo ? (
                    <p>
                        Il giorno <strong>{verboseDate.day}</strong> del mese di <strong>{verboseDate.month}</strong> dell'anno <strong>{verboseDate.year}</strong>, 
                        alle ore <strong>{doc.time}</strong>, presso il luogo dei lavori in <strong>{project.location}</strong>, 
                        ha avvio la <strong>{doc.visitNumber}ª</strong> visita di collaudo in corso d'opera convocata con nota via <strong>{doc.convocationMethod || '...'}</strong> del <strong>{formatShortDate(doc.convocationDate)}</strong>.
                    </p>
                ) : (
                    <p>
                        L'anno <strong>{verboseDate.year}</strong>, il giorno <strong>{verboseDate.day}</strong> del mese di <strong>{verboseDate.month}</strong>, 
                        presso il luogo dei lavori in <strong>{project.location}</strong>.
                    </p>
                )}

                {/* Attendees Logic */}
                {isCollaudo ? (
                    <p>Sono presenti, oltre al sottoscritto Collaudatore {formatNameWithTitle(project.subjects.tester.contact)}:</p>
                ) : (
                    <p>Sono presenti, oltre al sottoscritto Direttore dei Lavori {formatNameWithTitle(project.subjects.dl.contact)}:</p>
                )}
                
                <div className="whitespace-pre-line pl-4 mb-4 font-normal italic bg-slate-50 p-2 print:bg-transparent print:p-0 print:font-normal print:italic">
                    {doc.attendees ? doc.attendees : getDefaultAttendees()}
                </div>

                <div className="mb-4">
                    <p className="font-bold underline mb-2">Premesso che:</p>
                    <div className="whitespace-pre-line pl-2 mb-4">
                         {isCollaudo ? (
                             <>
                                <p className="mb-2 text-justify">{generateCollaudoPreamblePoint1()}</p>
                                {generateHistoricalPoints()}
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
                    
                    {/* --- BODY SECTION --- */}
                    {isCollaudo ? (
                        <div className="mt-6">
                            <p className="text-justify mb-2">
                                Durante il presente sopralluogo prende atto che, nel periodo intercorrente tra {getPreviousVisitDateDescription()} e la data odierna sono state effettuate le seguenti lavorazioni:
                            </p>
                            
                            {currentWorksList.length > 0 ? (
                                <ul className="list-disc pl-8 space-y-1 mb-4">
                                    {currentWorksList.map((work, idx) => <li key={idx}>{work};</li>)}
                                </ul>
                            ) : (
                                <p className="italic pl-8 mb-4">Nessuna lavorazione terminata in questo periodo.</p>
                            )}

                            <p className="mb-2">Al momento, sono in corso di esecuzione le opere relative a:</p>
                            {doc.worksInProgress && doc.worksInProgress.trim().length > 0 ? (
                                <ul className="list-disc pl-8 space-y-1 mb-4">
                                    {doc.worksInProgress.split('\n').filter(l => l.trim()).map((line, i) => (
                                        <li key={i}>{line}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="italic pl-8 mb-4">Nessuna lavorazione in corso.</p>
                            )}

                            <p className="mb-2">Prossime attività previste:</p>
                            {doc.upcomingWorks && doc.upcomingWorks.trim().length > 0 ? (
                                <ul className="list-disc pl-8 space-y-1 mb-4">
                                    {doc.upcomingWorks.split('\n').filter(l => l.trim()).map((line, i) => (
                                        <li key={i}>{line}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="italic pl-8 mb-4">Nessuna attività specifica pianificata.</p>
                            )}

                            {/* --- REQUESTS & INVITATIONS --- */}
                            {(doc.testerRequests || doc.testerInvitations) && (
                                <div className="mt-8 mb-4">
                                    <p className="mb-4 font-bold">Dopo aver preso visione di tutte le aree di cantiere il Collaudatore:</p>

                                    {doc.testerRequests && (
                                        <>
                                            <p className="mb-2">- chiede ai presenti, ciascuno nell’ambito della propria competenza e responsabilità:</p>
                                            <ul className="list-disc pl-8 space-y-1 mb-4">
                                                {doc.testerRequests.split('\n').filter(l => l.trim().length > 1).map((line, i) => (
                                                    <li key={i}>{line.replace(/^-\s*/, '')}</li>
                                                ))}
                                            </ul>
                                        </>
                                    )}

                                    {doc.testerInvitations && (
                                        <>
                                            <p className="mb-2">- invita i presenti, ciascuno nell’ambito della propria competenza e responsabilità, a:</p>
                                            <ul className="list-disc pl-8 space-y-1 mb-4">
                                                {doc.testerInvitations.split('\n').filter(l => l.trim().length > 1).map((line, i) => (
                                                    <li key={i}>{line.replace(/^-\s*/, '')}</li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </div>
                            )}

                            {doc.commonParts && (
                                <div className="mt-6 mb-4 whitespace-pre-line text-justify">
                                    {doc.commonParts}
                                </div>
                            )}
                        </div>
                    ) : (
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

        {/* Signatures using Table for Word Preservation */}
        {isCollaudo ? (
            <div className="mt-24 break-inside-avoid text-sm">
                <table style={{ width: '100%', marginBottom: '30px' }}>
                    <tbody>
                        {/* 1. Il Collaudatore */}
                        <tr>
                            <td style={{ verticalAlign: 'bottom', paddingBottom: '30px' }}>
                                Il Collaudatore: <br/>{formatNameWithTitle(project.subjects.tester.contact)}
                            </td>
                            <td style={{ verticalAlign: 'bottom', textAlign: 'right', paddingBottom: '30px' }}>
                                <div className="signature-line" style={{ width: '250px' }}></div>
                            </td>
                        </tr>

                        {/* 2. Il RUP */}
                        {project.subjects.rup.contact.name && (
                            <tr>
                                <td style={{ verticalAlign: 'bottom', paddingBottom: '30px' }}>
                                    Il Responsabile Unico del Procedimento: <br/>{formatNameWithTitle(project.subjects.rup.contact)}
                                </td>
                                <td style={{ verticalAlign: 'bottom', textAlign: 'right', paddingBottom: '30px' }}>
                                    <div className="signature-line" style={{ width: '250px' }}></div>
                                </td>
                            </tr>
                        )}

                        {/* 3. DL & CSE */}
                        <tr>
                            <td style={{ verticalAlign: 'bottom', paddingBottom: '30px' }}>
                                {project.subjects.dl.contact.name === project.subjects.cse.contact.name
                                    ? "Il Direttore dei Lavori e CSE"
                                    : "Il Direttore dei Lavori"}
                                : <br/>{formatNameWithTitle(project.subjects.dl.contact)}
                            </td>
                            <td style={{ verticalAlign: 'bottom', textAlign: 'right', paddingBottom: '30px' }}>
                                <div className="signature-line" style={{ width: '250px' }}></div>
                            </td>
                        </tr>
                        
                        {project.subjects.dl.contact.name !== project.subjects.cse.contact.name && project.subjects.cse.contact.name && (
                            <tr>
                                <td style={{ verticalAlign: 'bottom', paddingBottom: '30px' }}>
                                    Il Coordinatore Sicurezza Esecuzione: <br/>{formatNameWithTitle(project.subjects.cse.contact)}
                                </td>
                                <td style={{ verticalAlign: 'bottom', textAlign: 'right', paddingBottom: '30px' }}>
                                    <div className="signature-line" style={{ width: '250px' }}></div>
                                </td>
                            </tr>
                        )}

                        {/* 4. Impresa */}
                        <tr>
                            <td style={{ verticalAlign: 'bottom' }}>
                                Il rappresentante legale dell'impresa appaltatrice {project.contractor.name}: <br/>
                                {project.contractor.repTitle ? `${project.contractor.repTitle} ` : 'Sig. '}
                                {project.contractor.repName}
                            </td>
                            <td style={{ verticalAlign: 'bottom', textAlign: 'right' }}>
                                <div className="signature-line" style={{ width: '250px' }}></div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        ) : (
            // Standard layout for other documents
            <table className="mt-16 w-full text-sm break-inside-avoid" style={{ width: '100%' }}>
                <tbody>
                    <tr>
                        <td style={{ width: '50%', verticalAlign: 'top', paddingBottom: '60px' }}>
                            <p>Il Direttore dei Lavori:</p>
                            <div className="signature-line" style={{ width: '80%', marginTop: '30px' }}>
                                {formatNameWithTitle(project.subjects.dl.contact)}
                            </div>
                        </td>
                        <td style={{ width: '50%' }}></td>
                    </tr>
                    <tr>
                        <td style={{ width: '50%', verticalAlign: 'top' }}>
                            <p>L'Impresa:</p>
                            <div className="signature-line" style={{ width: '80%', marginTop: '30px' }}>
                                {project.contractor.repTitle ? `${project.contractor.repTitle} ` : 'Sig. '}
                                {project.contractor.repName}
                            </div>
                        </td>
                        <td style={{ width: '50%' }}></td>
                    </tr>
                </tbody>
            </table>
        )}

        {/* --- TRUE MSO FOOTER SECTION --- */}
        {/* This div is hidden in web view by CSS but used by Word as the repeating footer */}
        {isCollaudo && (
            <div id="f1">
                <div style={{ borderTop: '1px solid #ccc', paddingTop: '10pt', marginTop: '20pt', fontSize: '9pt', color: '#666', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
                    <p style={{ margin: '0', fontWeight: 'bold', color: '#000' }}>
                        {formatNameWithTitle(project.subjects.tester.contact)}
                    </p>
                    {project.subjects.tester.contact.address && (
                        <p style={{ margin: '0' }}>{project.subjects.tester.contact.address}</p>
                    )}
                    <p style={{ margin: '0' }}>
                        {project.subjects.tester.contact.email} 
                        {project.subjects.tester.contact.pec ? ` - ${project.subjects.tester.contact.pec}` : ''}
                    </p>
                </div>
            </div>
        )}

        {/* Photos Page */}
        {doc.photos && doc.photos.length > 0 && (
             <div className="break-before-page mt-8 pt-8 border-t-2 border-slate-100">
                <h3 className="font-bold text-center uppercase mb-6">Rilievo Fotografico Allegato</h3>
                <table style={{ width: '100%' }}>
                    <tbody>
                        {Array.from({ length: Math.ceil(doc.photos.length / 2) }).map((_, i) => (
                            <tr key={i}>
                                <td style={{ width: '50%', padding: '10px' }}>
                                    {doc.photos[i * 2] && (
                                        <div className="break-inside-avoid">
                                            <img src={doc.photos[i * 2].url} style={{ width: '100%', height: 'auto', border: '1px solid #e2e8f0' }} alt={`Foto ${i * 2 + 1}`} />
                                            <p className="text-xs mt-1 italic text-center">{doc.photos[i * 2].description || `Foto n. ${i * 2 + 1}`}</p>
                                        </div>
                                    )}
                                </td>
                                <td style={{ width: '50%', padding: '10px' }}>
                                    {doc.photos[i * 2 + 1] && (
                                        <div className="break-inside-avoid">
                                            <img src={doc.photos[i * 2 + 1].url} style={{ width: '100%', height: 'auto', border: '1px solid #e2e8f0' }} alt={`Foto ${i * 2 + 2}`} />
                                            <p className="text-xs mt-1 italic text-center">{doc.photos[i * 2 + 1].description || `Foto n. ${i * 2 + 2}`}</p>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        )}

      </div>
    </div>
  );
};
