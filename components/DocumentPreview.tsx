
import React from 'react';
import { ProjectConstants, DocumentVariables, DocumentType, DesignerProfile } from '../types';

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
          case 'RICHIESTA_AUTORIZZAZIONE': return 'RICHIESTA AUTORIZZAZIONE ALL’ESPLETAMENTO DELL’INCARICO DI COLLAUDO';
          case 'NULLA_OSTA_ENTE': return 'NULLA OSTA ALL’ESPLETAMENTO DELL’INCARICO DI COLLAUDO';
          case 'LETTERA_CONVOCAZIONE': return 'CONVOCAZIONE VISITA DI COLLAUDO';
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
  const isLetter = type === 'RICHIESTA_AUTORIZZAZIONE' || type === 'NULLA_OSTA_ENTE' || type === 'LETTERA_CONVOCAZIONE';

  const formatNameWithTitle = (contact: { title?: string, name: string }) => {
      if (!contact || !contact.name) return '...';
      const titlePrefix = contact.title ? `${contact.title} ` : '';
      return `${titlePrefix}${contact.name}`;
  };

  const formatProfessionalDetails = (contact: any) => {
      let text = formatNameWithTitle(contact);
      if (contact.professionalOrder) {
          text += `, iscritto all'Albo ${contact.professionalOrder}`;
          if (contact.registrationNumber) {
              text += ` al n. ${contact.registrationNumber}`;
          }
      }
      return text;
  };

  const renderSubjectString = (profile: DesignerProfile | any) => {
      if (!profile || !profile.contact) return '...';
      if (profile.isLegalEntity) {
          const companyName = profile.contact.name;
          if (profile.operatingDesigners && profile.operatingDesigners.length > 0) {
              return profile.operatingDesigners.map((op: any) => {
                  return `${formatProfessionalDetails(op)} (per conto di ${companyName})`;
              }).join('; ');
          }
          if (profile.contact.repName) {
               const repTitle = profile.contact.repTitle ? `${profile.contact.repTitle} ` : '';
               return `${repTitle}${profile.contact.repName} (Leg. Rep. di ${companyName})`;
          }
          let text = `${companyName}`;
          if (profile.contact.vat) text += ` (P.IVA ${profile.contact.vat})`;
          return text;
      }
      return formatProfessionalDetails(profile.contact);
  };

  const renderSignatureString = (profile: DesignerProfile | any) => {
      if (!profile || !profile.contact) return '...';
      if (profile.isLegalEntity) {
          const companyName = profile.contact.name;
          if (profile.operatingDesigners && profile.operatingDesigners.length > 0) {
              return profile.operatingDesigners.map((op: any) => 
                  `${formatNameWithTitle(op)} (per ${companyName})`
              ).join(' / ');
          }
          if (profile.contact.repName) {
               const repTitle = profile.contact.repTitle ? `${profile.contact.repTitle} ` : '';
               return `${repTitle}${profile.contact.repName} (${companyName})`;
          }
          return companyName;
      }
      return formatNameWithTitle(profile.contact);
  };

  const getLetterSubject = () => {
      if (doc.actSubject) return doc.actSubject;
      return `Lavori di "${project.projectName}" - CUP: ${project.cup}. Incarico di Collaudo ${assignmentStringClean}.`;
  };

  const renderLetterContent = () => {
      const tester = project.subjects.tester.contact;
      const t = project.subjects.testerAppointment;
      
      let baseText = "";
      if (type === 'RICHIESTA_AUTORIZZAZIONE') {
          baseText = `Il sottoscritto ${formatProfessionalDetails(tester)}, in riferimento all’incarico di collaudo ${assignmentStringClean} in oggetto, conferito con ${t.nominationType} n. ${t.nominationNumber} del ${formatShortDate(t.nominationDate)}, richiede formale autorizzazione all'espletamento delle attività di collaudo in corso d'opera.`;
      } else if (type === 'NULLA_OSTA_ENTE') {
          baseText = `Si trasmette il presente Nulla Osta relativo all'incarico di collaudo ${assignmentStringClean} per i lavori in oggetto, a seguito della verifica della documentazione prodotta e della regolarità della nomina.`;
      } else if (type === 'LETTERA_CONVOCAZIONE') {
          baseText = `Con la presente si comunica che il giorno ${formatShortDate(doc.date)} alle ore ${doc.time} si terrà presso il cantiere dei lavori in oggetto la ${doc.visitNumber}ª visita di collaudo. Sono invitati a partecipare il RUP, la Direzione Lavori e il Rappresentante dell'Impresa.`;
      }

      return (
          <div className="text-justify space-y-4">
              <p className="font-bold">OGGETTO: {getLetterSubject()}</p>
              <p className="mt-8">{baseText}</p>
              {doc.actBodyOverride && (
                  <div className="mt-6 border-l-2 border-slate-200 pl-4 italic">
                      {doc.actBodyOverride}
                  </div>
              )}
              <p className="mt-8">Restando in attesa di cortese riscontro, si porgono distinti saluti.</p>
          </div>
      );
  };

  if (isLetter) {
      return (
          <div id="document-preview-container" className="font-serif-print text-black leading-normal w-full max-w-[21cm]">
              <div className="bg-white shadow-lg p-[2.5cm] min-h-[29.7cm] print-page relative flex flex-col">
                  {/* MITTENTE (Collaudatore) */}
                  <div className="mb-12 text-sm">
                      <p className="font-bold uppercase">{formatNameWithTitle(project.subjects.tester.contact)}</p>
                      {project.subjects.tester.contact.address && <p>{project.subjects.tester.contact.address}</p>}
                      {project.subjects.tester.contact.pec && <p>PEC: {project.subjects.tester.contact.pec}</p>}
                      {project.subjects.tester.contact.email && <p>Email: {project.subjects.tester.contact.email}</p>}
                  </div>

                  {/* DESTINATARIO */}
                  <div className="mb-16 ml-auto w-2/3 text-sm">
                      <p className="font-bold uppercase">Spett.le</p>
                      <p className="font-bold uppercase">{project.entity}</p>
                      {doc.actRecipient ? (
                          <p className="italic">{doc.actRecipient}</p>
                      ) : (
                          <p>All'attenzione del RUP</p>
                      )}
                      {project.location && <p>{project.location}</p>}
                  </div>

                  {/* LUOGO E DATA */}
                  <div className="mb-8 text-right text-sm">
                      <p>{project.entityProvince || '...'}, lì {formatShortDate(doc.date)}</p>
                  </div>

                  {/* CORPO LETTERA */}
                  <div className="flex-1 text-sm">
                      {renderLetterContent()}
                  </div>

                  {/* FIRMA */}
                  <div className="mt-20 ml-auto w-1/2 text-center text-sm">
                      <p>Il Collaudatore</p>
                      <p className="mt-2 font-bold">{formatNameWithTitle(project.subjects.tester.contact)}</p>
                      <div className="mt-8 border-b border-black w-full"></div>
                  </div>
              </div>
          </div>
      );
  }

  // Rest of the existing Verbale/Certificato logic...
  const generateCollaudoPreamblePoint1 = () => {
      const t = project.subjects.testerAppointment;
      const tester = project.subjects.tester.contact;
      let text = `- con ${t.nominationType} `;
      if (t.nominationAuthority) text += `del ${t.nominationAuthority} `;
      text += `n. ${t.nominationNumber || '...'} del ${formatShortDate(t.nominationDate)}`;
      if (t.contractRepNumber) text += ` e successivo contratto/convenzione, rep. n. ${t.contractRepNumber} del ${formatShortDate(t.contractDate)}`;
      if (t.contractProtocol) text += `, prot. n. ${t.contractProtocol}`;
      text += `, il ${project.entity || '...'} ha affidato, ai sensi dell’art. 116 del D. Lgs. 36/2023, allo scrivente ${tester.title || ''} ${tester.name} (C.F. ${tester.vat || '...'}), `;
      if (tester.professionalOrder && tester.registrationNumber) text += `iscritto all’Albo ${tester.professionalOrder} al n. ${tester.registrationNumber}, `;
      text += `l’incarico professionale di collaudo ${assignmentStringClean} relativo all’intervento di "${project.projectName}", CUP: ${project.cup}.`;
      return text;
  };

  const getPreviousDocuments = () => allDocuments.filter(d => d.visitNumber < doc.visitNumber).sort((a, b) => a.visitNumber - b.visitNumber);

  const getWorksForVisit = (visitNum: number, fallbackWorks: string[]) => {
      const summaries = project.executionPhase.testerVisitSummaries || [];
      const summary = summaries[visitNum - 1];
      if (summary && summary.works && summary.works.length > 0) return summary.works;
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
          return (
              <div key={prevDoc.id} className="mb-4 text-justify">
                  <p>- in data {date}, con verbale di visita di collaudo n. {prevDoc.visitNumber}, lo scrivente Collaudatore ha preso atto delle lavorazioni:</p>
                  <div className="pl-8 my-2 italic whitespace-pre-line">{worksText}</div>
                  <p className="pl-8">{worksInProgress}</p>
              </div>
          );
      });
  };

  const getPreviousVisitDateDescription = () => {
      const prevDocs = getPreviousDocuments();
      if (prevDocs.length > 0) return `il ${formatShortDate(prevDocs[prevDocs.length - 1].date)}`;
      return project.executionPhase.deliveryDate ? `il ${formatShortDate(project.executionPhase.deliveryDate)}` : 'la consegna dei lavori';
  };

  const getDefaultAttendees = () => {
      const lines = [];
      const { rup, dl, cse } = project.subjects;
      if (rup.contact.name) lines.push(`Responsabile Unico del Progetto: ${formatProfessionalDetails(rup.contact)}`);
      if (dl.contact.name) lines.push(`Direttore dei Lavori: ${renderSubjectString(dl)}`);
      if (cse.contact.name) lines.push(`Coord. Sicurezza Esecuzione: ${renderSubjectString(cse)}`);
      if (project.contractor.mainCompany.name) {
          const c = project.contractor.mainCompany;
          lines.push(`per l'Impresa ${c.name} (${c.role || 'L.R.'}): ${c.repTitle || 'Sig.'} ${c.repName || '...'}`);
      }
      return lines.join('\n');
  };

  const renderContractorInfo = () => {
      const { type, mainCompany, mandants, executors } = project.contractor;
      if (type === 'ati' && mandants?.length > 0) {
          return <span><strong>ATI</strong>: {mainCompany.name} (Mandataria) + {mandants.map(m => m.name).join(', ')}</span>;
      }
      return <span><strong>{mainCompany.name}</strong><br/>{mainCompany.address} - P.IVA {mainCompany.vat}</span>;
  };

  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-normal w-full max-w-[21cm]">
      <div className="bg-white shadow-lg p-[2cm] min-h-[29.7cm] print-page mb-8 relative flex flex-col justify-between">
        <div>
            <div id="h1">
                <table style={{ width: '100%', marginBottom: '10pt' }}>
                    <tbody>
                        <tr>
                            <td align="center" style={{ textAlign: 'center', borderBottom: '1px solid #000', paddingBottom: '10px' }}>
                                {project.headerLogo && <img src={project.headerLogo} style={{ maxHeight: '2.5cm', marginBottom: '5px' }} alt="Logo" />}
                                <p className="uppercase font-bold text-base tracking-widest">{project.entity}</p>
                                {project.entityProvince && <p className="text-sm">(Provincia di {project.entityProvince})</p>}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mb-8 text-center">
                <p className="text-sm font-bold uppercase">lavori di: "{project.projectName}"</p>
                <p className="text-sm font-bold uppercase">CUP {project.cup} {project.cig && `- CIG ${project.cig}`}</p>
                <div className="mt-4 border-b-2 border-black inline-block px-4 pb-1">
                    <h2 className="font-bold text-lg uppercase">{getDocumentTitle()}</h2>
                </div>
            </div>

            <table className="w-full text-xs mb-8">
                <tbody>
                    <tr><td className="font-bold w-48">Impresa:</td><td>{renderContractorInfo()}</td></tr>
                    <tr><td className="font-bold">RUP:</td><td>{formatProfessionalDetails(project.subjects.rup.contact)}</td></tr>
                    <tr><td className="font-bold">DL:</td><td>{renderSubjectString(project.subjects.dl)}</td></tr>
                </tbody>
            </table>

            <div className="text-sm text-justify space-y-4">
                <p>Il giorno <strong>{verboseDate.day}</strong> del mese di <strong>{verboseDate.month}</strong> dell'anno <strong>{verboseDate.year}</strong>...</p>
                <div className="italic pl-4 whitespace-pre-line">{doc.attendees || getDefaultAttendees()}</div>
                <div>
                    <p className="font-bold underline">Premesso che:</p>
                    <div className="pl-2 mt-2">
                        {isCollaudo ? (
                            <>{generateCollaudoPreamblePoint1()}{generateHistoricalPoints()}</>
                        ) : <p>{doc.premis}</p>}
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-20 text-sm">
            <table className="w-full">
                <tbody>
                    <tr>
                        <td>Il Collaudatore:<br/>{formatNameWithTitle(project.subjects.tester.contact)}</td>
                        <td className="text-right">Il RUP:<br/>{formatNameWithTitle(project.subjects.rup.contact)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
