
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

  // --- LOGICA SPECIFICA LETTERE ---
  const getLetterSubject = () => {
      if (doc.actSubject) return doc.actSubject;
      return `Lavori di "${project.projectName}" - CUP: ${project.cup}. Incarico di Collaudo ${assignmentStringClean}.`;
  };

  const renderLetterContent = () => {
      const tester = project.subjects.tester.contact;
      const t = project.subjects.testerAppointment;
      let baseText = "";
      if (type === 'RICHIESTA_AUTORIZZAZIONE') {
          baseText = `Il sottoscritto ${formatProfessionalDetails(tester)}, in riferimento all’incarico di collaudo ${assignmentStringClean} in oggetto, conferito con ${t.nominationType} n. ${t.nominationNumber} del ${formatShortDate(t.nominationDate)} per un importo di ${formatCurrency(t.testerFee || 0)}, richiede formale autorizzazione all'espletamento delle attività di collaudo in corso d'opera ai fini dell'acquisizione del Nulla Osta del proprio Ordine Professionale/Ente di appartenenza, ove necessario.`;
      } else if (type === 'NULLA_OSTA_ENTE') {
          baseText = `Si trasmette il presente Nulla Osta relativo all'incarico di collaudo ${assignmentStringClean} per i lavori in oggetto, a seguito della verifica della documentazione prodotta, della regolarità della nomina e della compatibilità dell'incarico con le vigenti normative.`;
      } else if (type === 'LETTERA_CONVOCAZIONE') {
          baseText = `Con la presente si comunica alle SS.LL. che lo scrivente Collaudatore, in data ${formatShortDate(doc.date)} alle ore ${doc.time}, terrà presso il cantiere dei lavori in oggetto la ${doc.visitNumber}ª visita di collaudo in corso d'opera. Si pregano le SS.LL. di voler partecipare muniti di tutta la documentazione tecnica e contabile necessaria al corretto espletamento del sopralluogo.`;
      }
      return (
          <div className="text-justify space-y-4">
              <p className="font-bold">OGGETTO: <span className="uppercase">{getLetterSubject()}</span></p>
              <p className="mt-8">{baseText}</p>
              {doc.actBodyOverride && <div className="mt-6 whitespace-pre-wrap italic">{doc.actBodyOverride}</div>}
              <p className="mt-8">Restando in attesa di cortese riscontro, si porgono distinti saluti.</p>
          </div>
      );
  };

  // --- LOGICA SPECIFICA VERBALE ---
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
      return prevDocs.map((prevDoc) => {
          const date = formatShortDate(prevDoc.date);
          const worksList = getWorksForVisit(prevDoc.visitNumber, prevDoc.worksExecuted);
          const worksText = worksList.map((w, i) => `${i + 1}. ${w}`).join(';\n');
          const worksInProgress = prevDoc.worksInProgress ? `Era in corso il ${prevDoc.worksInProgress}.` : '';
          return (
              <div key={prevDoc.id} className="mb-4 text-justify">
                  <p>- in data {date}, con verbale di visita di collaudo n. {prevDoc.visitNumber}, lo scrivente Collaudatore ha preso atto dell'andamento dei lavori eseguiti a detta data:</p>
                  <div className="pl-8 my-2 italic whitespace-pre-line border-l border-slate-200">{worksText}</div>
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
      const { type, mainCompany, mandants } = project.contractor;
      if (type === 'ati' && mandants?.length > 0) {
          return <span><strong>ATI</strong>: {mainCompany.name} (Mandataria) + {mandants.map(m => m.name).join(', ')}</span>;
      }
      return <span><strong>{mainCompany.name}</strong><br/>{mainCompany.address} - P.IVA {mainCompany.vat}</span>;
  };

  // --- RENDER LOGIC ---

  if (isLetter) {
      return (
          <div id="document-preview-container" className="font-serif-print text-black leading-normal w-full max-w-[21cm]">
              <div className="bg-white shadow-lg p-[2.5cm] min-h-[29.7cm] print-page relative flex flex-col">
                  <div className="mb-12 text-sm border-l-2 border-slate-100 pl-4">
                      <p className="font-bold uppercase tracking-wider">{formatNameWithTitle(project.subjects.tester.contact)}</p>
                      <p className="text-xs uppercase text-slate-500 mb-2">Collaudatore</p>
                      {project.subjects.tester.contact.address && <p>{project.subjects.tester.contact.address}</p>}
                      {project.subjects.tester.contact.pec && <p><span className="font-bold">PEC:</span> {project.subjects.tester.contact.pec}</p>}
                  </div>
                  <div className="mb-16 ml-auto w-[65%] text-sm">
                      <p className="font-bold uppercase tracking-wide">Spett.le</p>
                      <p className="font-bold uppercase">{project.entity}</p>
                      {doc.actRecipient ? <div className="mt-1 whitespace-pre-line">{doc.actRecipient}</div> : <p className="mt-1">All'attenzione del Responsabile Unico del Progetto</p>}
                  </div>
                  <div className="mb-12 text-right text-sm italic">
                      <p>{project.entityProvince || project.location || '...'}, lì {formatShortDate(doc.date)}</p>
                  </div>
                  <div className="flex-1 text-sm md:text-base">{renderLetterContent()}</div>
                  <div className="mt-24 ml-auto w-[50%] text-center text-sm md:text-base">
                      <p className="mb-4">Il Collaudatore</p>
                      <p className="font-bold uppercase tracking-widest">{formatNameWithTitle(project.subjects.tester.contact)}</p>
                      <div className="mt-2 border-b border-black w-full opacity-50"></div>
                  </div>
              </div>
          </div>
      );
  }

  // --- RENDERING VERBALE TECNICO COMPLETO ---
  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-normal w-full max-w-[21cm]">
      <div className="bg-white shadow-lg p-[1.5cm] md:p-[2cm] min-h-[29.7cm] print-page mb-8 relative flex flex-col justify-between">
        <div>
            {/* Header Ente */}
            <div id="h1" className="mb-8">
                <table style={{ width: '100%' }}>
                    <tbody>
                        <tr>
                            <td align="center" style={{ textAlign: 'center', borderBottom: '1px solid #000', paddingBottom: '15px' }}>
                                {project.headerLogo && <img src={project.headerLogo} style={{ maxHeight: '2.5cm', marginBottom: '8px' }} alt="Logo" />}
                                <p className="uppercase font-bold text-base tracking-widest">{project.entity}</p>
                                {project.entityProvince && <p className="text-sm">(Provincia di {project.entityProvince})</p>}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Titolo e Oggetto */}
            <div className="mb-8 text-center">
                <p className="text-sm font-bold uppercase mb-2">lavori di: "{project.projectName}"</p>
                <p className="text-sm font-bold uppercase mb-4">CUP {project.cup} {project.cig && `- CIG ${project.cig}`}</p>
                <div className="mt-2 border-b-2 border-black inline-block px-8 pb-1">
                    <h2 className="font-bold text-lg uppercase">{getDocumentTitle()}</h2>
                </div>
            </div>

            {/* Tabella Anagrafica Progetto */}
            <table className="w-full text-xs mb-8 border-collapse">
                <tbody>
                    <tr className="border-b border-slate-100"><td className="py-1 font-bold w-48 uppercase text-slate-500">Impresa Appaltatrice:</td><td className="py-1">{renderContractorInfo()}</td></tr>
                    <tr className="border-b border-slate-100"><td className="py-1 font-bold uppercase text-slate-500">Responsabile Procedimento:</td><td className="py-1">{formatProfessionalDetails(project.subjects.rup.contact)}</td></tr>
                    <tr className="border-b border-slate-100"><td className="py-1 font-bold uppercase text-slate-500">Direzione Lavori:</td><td className="py-1">{renderSubjectString(project.subjects.dl)}</td></tr>
                    <tr className="border-b border-slate-100"><td className="py-1 font-bold uppercase text-slate-500">Sicurezza (CSE):</td><td className="py-1">{renderSubjectString(project.subjects.cse)}</td></tr>
                    {project.contract.totalAmount && (
                        <tr><td className="py-1 font-bold uppercase text-slate-500">Importo Lavori:</td><td className="py-1">{formatCurrency(project.contract.totalAmount)}</td></tr>
                    )}
                </tbody>
            </table>

            {/* Testo del Verbale */}
            <div className="text-sm text-justify space-y-4">
                <p>
                    L'anno <strong>{verboseDate.year}</strong>, il giorno <strong>{verboseDate.day}</strong> del mese di <strong>{verboseDate.month}</strong>, 
                    alle ore <strong>{doc.time}</strong>, presso il luogo dei lavori in <strong>{project.location}</strong>.
                </p>

                <p>Sono presenti, oltre allo scrivente Collaudatore {formatNameWithTitle(project.subjects.tester.contact)}:</p>
                <div className="italic pl-6 whitespace-pre-line border-l-2 border-slate-100 py-1">{doc.attendees || getDefaultAttendees()}</div>

                <div className="mt-6">
                    <p className="font-bold underline mb-2 uppercase tracking-tighter">Premesso che:</p>
                    <div className="space-y-4">
                        <p>{generateCollaudoPreamblePoint1()}</p>
                        {generateHistoricalPoints()}
                        {doc.premis && <div className="mt-2 pt-2 border-t border-dotted border-slate-300">{doc.premis}</div>}
                    </div>
                </div>

                <div className="mt-6">
                    <p className="font-bold underline mb-2 uppercase tracking-tighter">Sopralluogo e Lavorazioni:</p>
                    <p className="mb-2">{doc.worksIntroText || `Durante il presente sopralluogo si prende atto che, nel periodo intercorrente tra ${getPreviousVisitDateDescription()} e la data odierna, sono state effettuate le seguenti lavorazioni:`}</p>
                    
                    {getWorksForVisit(doc.visitNumber, doc.worksExecuted).length > 0 ? (
                        <ul className="list-disc pl-8 space-y-1 mb-4 italic">
                            {getWorksForVisit(doc.visitNumber, doc.worksExecuted).map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                    ) : <p className="italic pl-8 mb-4">Nessuna lavorazione specifica registrata per il periodo.</p>}

                    {doc.worksInProgress && (
                        <div className="mb-4">
                            <p className="font-semibold mb-1">Opere attualmente in corso di esecuzione:</p>
                            <div className="pl-8 italic whitespace-pre-line">{doc.worksInProgress}</div>
                        </div>
                    )}
                </div>

                {/* Richieste e Inviti */}
                {(doc.testerRequests || doc.testerInvitations) && (
                    <div className="mt-8 space-y-4 bg-slate-50 p-4 rounded print:bg-transparent print:p-0">
                        {doc.testerRequests && (
                            <div>
                                <p className="font-bold uppercase text-xs text-blue-800 mb-1">Richieste del Collaudatore:</p>
                                <div className="pl-4 whitespace-pre-line text-slate-700 italic border-l border-blue-200">{doc.testerRequests}</div>
                            </div>
                        )}
                        {doc.testerInvitations && (
                            <div>
                                <p className="font-bold uppercase text-xs text-amber-800 mb-1">Inviti e Prescrizioni:</p>
                                <div className="pl-4 whitespace-pre-line text-slate-700 italic border-l border-amber-200">{doc.testerInvitations}</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Chiusura e Valutazioni */}
                <div className="mt-8">
                    {doc.observations && (
                        <div className="mb-4">
                            <p className="font-bold underline mb-1">Valutazioni Tecnico-Amministrative:</p>
                            <p className="italic">{doc.observations}</p>
                        </div>
                    )}
                    <p className="mt-4">{doc.commonParts || `Di quanto sopra si è redatto il presente verbale che, previa lettura e conferma, viene sottoscritto dai presenti.`}</p>
                </div>
            </div>
        </div>

        {/* Blocco Firme */}
        <div className="mt-20 text-sm">
            <table className="w-full">
                <tbody>
                    <tr>
                        <td className="pb-12 w-1/2">
                            <p className="mb-1">Il Collaudatore:</p>
                            <p className="font-bold uppercase">{formatNameWithTitle(project.subjects.tester.contact)}</p>
                            <div className="mt-4 border-b border-black w-48 opacity-30"></div>
                        </td>
                        <td className="pb-12 w-1/2 text-right">
                            <p className="mb-1">Il RUP:</p>
                            <p className="font-bold uppercase">{formatNameWithTitle(project.subjects.rup.contact)}</p>
                            <div className="mt-4 border-b border-black w-48 ml-auto opacity-30"></div>
                        </td>
                    </tr>
                    <tr>
                        <td className="w-1/2">
                            <p className="mb-1">Il Direttore dei Lavori:</p>
                            <p className="font-bold uppercase">{renderSignatureString(project.subjects.dl)}</p>
                            <div className="mt-4 border-b border-black w-48 opacity-30"></div>
                        </td>
                        <td className="w-1/2 text-right">
                            <p className="mb-1">L'Impresa:</p>
                            <p className="font-bold uppercase">{project.contractor.mainCompany.name}</p>
                            <div className="mt-4 border-b border-black w-48 ml-auto opacity-30"></div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>

      {/* Foto Allegati (se presenti) */}
      {doc.photos && doc.photos.length > 0 && (
          <div className="break-before-page p-[2cm] bg-white shadow-lg min-h-[29.7cm]">
              <h3 className="font-bold text-center uppercase border-b-2 border-black pb-2 mb-8">Documentazione Fotografica Allegata</h3>
              <div className="grid grid-cols-2 gap-8">
                  {doc.photos.map((p, i) => (
                      <div key={i} className="break-inside-avoid">
                          <img src={p.url} className="w-full h-48 object-cover border border-slate-200" alt="Allegato" />
                          <p className="text-xs mt-2 italic text-center text-slate-600">{p.description || `Foto ${i+1}`}</p>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};
