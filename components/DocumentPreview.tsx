
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
    try { return new Date(dateStr).toLocaleDateString('it-IT'); } catch { return dateStr; }
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
  
  const getDynamicTestingTitle = () => {
    const ta = project.subjects.testerAppointment;
    const types = [];
    if (ta.isAdmin) types.push("TECNICO AMMINISTRATIVO");
    if (ta.isStatic) types.push("STATICO");
    if (ta.isFunctional) types.push("FUNZIONALE");
    const rolesStr = types.length > 0 ? types.join(" E ") : "COLLAUDO";
    return `VERBALE DI VISITA DI ${rolesStr} IN CORSO D'OPERA N. ${doc.visitNumber}`;
  };

  const getDocumentTitle = () => {
      switch(type) {
          case 'LETTERA_CONVOCAZIONE': return `LETTERA DI CONVOCAZIONE VISITA DI COLLAUDO N. ${doc.visitNumber}`;
          case 'VERBALE_COLLAUDO': return getDynamicTestingTitle();
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

  const formatNameWithTitle = (contact: { title?: string, name: string }) => {
      if (!contact || !contact.name) return '...';
      const titlePrefix = contact.title ? `${contact.title} ` : '';
      return `${titlePrefix}${contact.name}`;
  };

  const renderContractorInfo = () => {
      const { contractor } = project;
      const main = contractor.mainCompany;
      if (contractor.type === 'ati') {
          return (
              <div className="space-y-1">
                <p className="uppercase font-bold">Raggruppamento Temporaneo di Imprese:</p>
                <p>- Mandataria: {main.name} (P.IVA {main.vat})</p>
                {contractor.mandants.map((m, i) => (<p key={i}>- Mandante: {m.name} (P.IVA {m.vat})</p>))}
              </div>
          );
      } else if (contractor.type === 'consortium') {
          return (
              <div className="space-y-1">
                <p className="uppercase font-bold">Consorzio Appaltatore:</p>
                <p>- Consorzio: {main.name} (P.IVA {main.vat})</p>
                {contractor.executors.map((e, i) => (<p key={i}>- Consorziata Esecutrice: {e.name} (P.IVA {e.vat})</p>))}
              </div>
          );
      }
      return <p className="uppercase">{main.name} {main.address ? `- ${main.address}` : ''} {main.vat ? `- P.IVA ${main.vat}` : ''}</p>;
  };

  const getNominationPremise = () => {
    const ta = project.subjects.testerAppointment;
    const tester = project.subjects.tester.contact;
    const authority = ta.nominationAuthority || project.entity || '...';
    
    const types = [];
    if (ta.isStatic) types.push("collaudo statico");
    if (ta.isAdmin) types.push("tecnico-amministrativo");
    if (ta.isFunctional) types.push("funzionale");
    const rolesStr = types.length > 0 ? types.join(" e ") : "...";

    const contractItems = [];
    if (ta.contractRepNumber) contractItems.push(`rep. n. ${ta.contractRepNumber}`);
    if (ta.contractDate) contractItems.push(`del ${formatShortDate(ta.contractDate)}`);
    if (ta.contractProtocol) contractItems.push(`prot. n. ${ta.contractProtocol}`);
    
    const contractPart = contractItems.length > 0 
        ? `, e successivo contratto/convenzione, ${contractItems.join(' ')}` 
        : '';

    return `con ${ta.nominationType || 'provvedimento'} del ${authority} n. ${ta.nominationNumber || '...'} del ${formatShortDate(ta.nominationDate)}${contractPart}, il predetto ${authority} ha affidato, ai sensi dell’art. 116 del D. Lgs. 36/2023, allo scrivente ${tester.title || ''} ${tester.name || '...'} (C.F. ${tester.vat || '...'}), iscritto all’Albo degli ${tester.professionalOrder || '...'} al n. ${tester.registrationNumber || '...'}, l’incarico professionale di ${rolesStr} relativo all’intervento di “${project.projectName || '...'}”, CUP: ${project.cup || '...'};`;
  };

  if (type === 'LETTERA_CONVOCAZIONE') {
    const tester = project.subjects.tester.contact;
    const rup = project.subjects.rup.contact;
    const dl = project.subjects.dl.contact;
    const contractor = project.contractor;

    return (
      <div id="document-preview-container" className="font-serif-print text-black leading-tight w-full max-w-[21cm] bg-white p-[2cm] min-h-[29.7cm] flex flex-col">
        {/* HEADER: TESTER INFO - LUIGI RESTA STYLE */}
        <div className="flex justify-between items-start mb-16 border-b border-slate-200 pb-4">
            <div className="text-left">
                <h1 className="text-xl font-bold uppercase tracking-widest m-0">{tester.name || 'IL COLLAUDATORE'}</h1>
            </div>
            <div className="text-right">
                <p className="text-sm uppercase font-bold tracking-widest m-0">{tester.professionalOrder || 'ARCHITETTO'}</p>
            </div>
        </div>

        {/* RECIPIENTS BLOCK - ALIGNED RIGHT */}
        <div className="flex justify-end mb-12">
            <div className="w-[65%] text-[10pt] space-y-6 text-left">
                <div className="space-y-1">
                    <p className="uppercase font-bold leading-tight">SPETT.LE {project.subjects.testerAppointment.nominationAuthority || project.entity}</p>
                    <p className="uppercase font-bold">ALLA C.A. DEL RUP {formatNameWithTitle(rup)}</p>
                    {rup.pec && <p className="text-[9pt]">PEC: <span className="underline text-blue-800">{rup.pec}</span></p>}
                </div>
                
                <div className="space-y-1">
                    <p className="uppercase font-bold">SIDOTI ENGINEERING s.r.l.</p>
                    <p className="uppercase font-bold">ALLA C.A. DEL DL {formatNameWithTitle(dl)}</p>
                    {dl.pec && <p className="text-[9pt]">PEC: <span className="underline text-blue-800">{dl.pec}</span></p>}
                </div>

                <div className="space-y-1">
                    <p className="uppercase font-bold">SPETT.LE {contractor.mainCompany.name}</p>
                    {contractor.type === 'ati' && contractor.mandants.map((m, i) => (
                        <p key={i} className="text-[9pt] italic">(Mandante: {m.name} PEC: {m.pec})</p>
                    ))}
                    {contractor.mainCompany.pec && <p className="text-[9pt]">PEC: <span className="underline text-blue-800">{contractor.mainCompany.pec}</span></p>}
                </div>
            </div>
        </div>

        {/* SUBJECT */}
        <div className="mb-10 text-[10pt] text-justify">
            <p className="font-bold leading-relaxed">Oggetto: {project.projectName} - CUP: {project.cup} {project.cig ? `- CIG: ${project.cig}` : ''}.</p>
            <p className="font-bold mt-1 tracking-wider">Convocazione {doc.visitNumber === 1 ? 'I' : doc.visitNumber === 2 ? 'II' : doc.visitNumber === 3 ? 'III' : doc.visitNumber}° visita di Collaudo</p>
        </div>

        {/* BODY */}
        <div className="text-[10pt] text-justify space-y-5 flex-grow">
            <p>Sentite le parti, si comunica che la {doc.visitNumber === 1 ? 'I' : doc.visitNumber === 2 ? 'II' : doc.visitNumber === 3 ? 'III' : doc.visitNumber}° visita di collaudo dei lavori di cui in oggetto è fissata per il giorno:</p>
            
            <p className="text-center font-bold text-[11pt] py-2">
                il giorno {formatShortDate(doc.date)}, ore {doc.time || '12.00'}, con incontro presso il luogo dei lavori.
            </p>
            
            <p>Durante le operazioni di collaudo, la Ditta dovrà assicurare la disponibilità di personale ed attrezzature per le verifiche, i saggi e le prove necessarie, oltre a copia del progetto completo in formato cartaceo al fine di agevolare le opportune valutazioni sul posto.</p>
            
            <p>Durante il suddetto incontro lo scrivente estrarrà copia, altresì, di quanto eventualmente necessario alla presa d’atto delle attività già svolte.</p>
            
            <p>Si invitano le parti ad astenersi dal porre in essere qualsivoglia opera di carattere strutturale in mancanza della verifica e del preventivo assenso da parte dello scrivente collaudatore.</p>
            
            <p>Si rammenta, altresì, l’obbligo per la D.L. di presenziare alle operazioni suddette.</p>
            
            <p className="pt-4">Distinti saluti</p>
        </div>

        {/* SIGNATURE */}
        <div className="mt-8 text-right text-[10pt]">
            <p className="uppercase font-bold leading-tight">IL COLLAUDATORE STATICO, TECNICO-AMMINISTRATIVO</p>
            <p className="uppercase font-bold leading-tight">E FUNZIONALE DEGLI IMPIANTI</p>
            <p className="mt-6 font-bold">{formatNameWithTitle(tester)}</p>
            <div className="h-16"></div>
        </div>

        {/* FOOTER: TESTER CONTACT DETAILS */}
        <div className="mt-auto pt-4 border-t border-slate-200 grid grid-cols-2 gap-x-12 text-[8pt] text-slate-600">
            <div className="space-y-1">
                <p>{tester.address || 'Piazza Matteotti, 3 - 72023 Mesagne (BR)'}</p>
                <p>Tel/Fax: {tester.phone || '0831.777752'}</p>
            </div>
            <div className="text-right space-y-1">
                <p>PEC: <span className="underline">{tester.pec || 'arch.luigiresta@pec.it'}</span></p>
                <p>Email: <span className="underline">{tester.email || 'arch.luigiresta@gmail.com'}</span></p>
                <p>P.IVA: {tester.vat || '392.6739862'}</p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-normal w-full max-w-[21cm]">
      <div className="bg-white shadow-lg p-[1.5cm] mb-8 border border-slate-100 overflow-visible">
        <div style={{ textAlign: 'center', width: '100%', marginBottom: '2.5rem' }}>
            {project.headerLogo && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                    <img src={project.headerLogo} style={{ maxHeight: '2.5cm', maxWidth: '100%' }} alt="Logo" />
                </div>
            )}
            <p style={{ textTransform: 'uppercase', fontWeight: 'bold', fontSize: '11pt', letterSpacing: '0.1em', margin: 0 }}>{project.entity}</p>
            {project.entityProvince && <p style={{ fontSize: '9pt', margin: 0 }}>({project.entityProvince})</p>}
        </div>
        <div className="mb-10 text-center px-4" style={{ textAlign: 'center' }}>
            <p className="text-xs uppercase mb-4 leading-relaxed">lavori di: “{project.projectName}”</p>
            <h2 className="font-bold text-base uppercase tracking-tight" style={{ fontWeight: 'bold' }}>{getDocumentTitle()}</h2>
        </div>
        <table className="w-full text-xs mb-10 border-collapse" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
                <tr className="align-top">
                    <td className="w-48 py-1 font-bold" style={{ width: '12rem', padding: '4px 0', fontWeight: 'bold' }}>Impresa:</td>
                    <td className="py-1" style={{ padding: '4px 0' }}>{renderContractorInfo()}</td>
                </tr>
                {project.contract.date && (
                    <tr className="align-top">
                        <td className="py-1 font-bold" style={{ padding: '4px 0', fontWeight: 'bold' }}>Contratto d'appalto:</td>
                        <td className="py-1" style={{ padding: '4px 0' }}>stipulato in data {formatShortDate(project.contract.date)} {project.contract.repNumber ? `, Rep. N. ${project.contract.repNumber}` : ''}</td>
                    </tr>
                )}
                {project.contract.totalAmount && (
                    <tr className="align-top">
                        <td className="py-1 font-bold" style={{ padding: '4px 0', fontWeight: 'bold' }}>Importo Contrattuale:</td>
                        <td className="py-1" style={{ padding: '4px 0' }}>Euro {project.contract.totalAmount} {project.contract.securityCosts ? `(di cui Euro ${project.contract.securityCosts} per oneri sicurezza)` : ''}</td>
                    </tr>
                )}
                {project.executionPhase?.completionDate && (
                    <tr className="align-top">
                        <td className="py-1 font-bold" style={{ padding: '4px 0', fontWeight: 'bold' }}>Scadenza contrattuale:</td>
                        <td className="py-1" style={{ padding: '4px 0' }}>{formatShortDate(project.executionPhase.completionDate)}</td>
                    </tr>
                )}
                <tr className="align-top">
                    <td className="py-1 font-bold" style={{ padding: '4px 0', fontWeight: 'bold' }}>RUP:</td>
                    <td className="py-1" style={{ padding: '4px 0' }}>{formatNameWithTitle(project.subjects.rup.contact)}</td>
                </tr>
                <tr className="align-top">
                    <td className="py-1 font-bold" style={{ padding: '4px 0', fontWeight: 'bold' }}>Direttore dei Lavori:</td>
                    <td className="py-1" style={{ padding: '4px 0' }}>{formatNameWithTitle(project.subjects.dl.contact)}</td>
                </tr>
            </tbody>
        </table>

        <div className="text-xs text-justify space-y-6" style={{ textAlign: 'justify' }}>
            <p>Il giorno {verboseDate.day} del mese di {verboseDate.month} {verboseDate.year}, alle ore {doc.time}, presso il luogo dei lavori in {project.location}, ha avvio la {doc.visitNumber}° visita di collaudo in corso d’opera {doc.convocationDetails || 'convocata nelle forme di rito'}.</p>
            
            <div style={{ marginTop: '1.2rem' }}>
                <p>Sono presenti, oltre al sottoscritto Collaudatore {formatNameWithTitle(project.subjects.tester.contact)}:</p>
                <div style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                    {doc.attendees ? doc.attendees.split('\n').filter(l => l.trim()).map((line, i) => (
                        <p key={i} style={{ fontStyle: 'italic', margin: '4px 0', display: 'block' }}>- {line}</p>
                    )) : <p style={{ fontStyle: 'italic' }}>...</p>}
                </div>
            </div>

            <div className="space-y-2" style={{ marginTop: '1.5rem' }}>
                <p className="font-bold" style={{ fontWeight: 'bold' }}>Premesso che:</p>
                <ul className="list-disc pl-5 space-y-2">
                    {type === 'VERBALE_COLLAUDO' && <li>{getNominationPremise()}</li>}
                    {doc.premis ? (
                        <div className="whitespace-pre-line leading-relaxed">{doc.premis}</div>
                    ) : (type !== 'VERBALE_COLLAUDO' && <p className="italic" style={{ fontStyle: 'italic' }}>Nessuna premessa specifica inserita.</p>)}
                </ul>
            </div>
            
            <div className="space-y-2" style={{ marginTop: '1.5rem' }}>
                <p>{doc.worksIntroText || "Durante il presente sopralluogo si prende atto che sono state effettuate le seguenti lavorazioni:"}</p>
                {project.executionPhase?.testerVisitSummaries?.[doc.visitNumber-1]?.works && project.executionPhase.testerVisitSummaries[doc.visitNumber-1].works.length > 0 ? (
                    <ul className="list-decimal pl-10 space-y-1">{project.executionPhase.testerVisitSummaries[doc.visitNumber-1].works.map((w, i) => <li key={i}>{w}</li>)}</ul>
                ) : <p className="italic pl-4" style={{ fontStyle: 'italic', paddingLeft: '1rem' }}>Nessuna lavorazione specifica riportata nel riepilogo del periodo.</p>}
            </div>
            {doc.worksInProgress && (
                <div style={{ marginTop: '1.5rem' }}><p className="font-bold" style={{ fontWeight: 'bold' }}>Opere in corso di esecuzione:</p><div style={{ paddingLeft: '1rem' }}>{doc.worksInProgress.split('\n').map((line, i) => <p key={i}>- {line}</p>)}</div></div>
            )}
            {doc.upcomingWorks && (
                <div style={{ marginTop: '1.5rem' }}><p className="font-bold" style={{ fontWeight: 'bold' }}>Prossime attività previste:</p><div style={{ paddingLeft: '1rem' }}>{doc.upcomingWorks.split('\n').map((line, i) => <p key={i}>- {line}</p>)}</div></div>
            )}
            {doc.testerRequests && <div style={{ marginTop: '1.5rem' }}><p className="font-bold" style={{ fontWeight: 'bold' }}>Richieste del Collaudatore:</p><div style={{ paddingLeft: '1rem', whiteSpace: 'pre-line' }}>{doc.testerRequests}</div></div>}
            {doc.testerInvitations && <div style={{ marginTop: '1.5rem' }}><p className="font-bold" style={{ fontWeight: 'bold' }}>Inviti del Collaudatore:</p><div style={{ paddingLeft: '1rem', whiteSpace: 'pre-line' }}>{doc.testerInvitations}</div></div>}
            {doc.commonParts && <div style={{ marginTop: '1.5rem', fontStyle: 'italic', whiteSpace: 'pre-line' }}>{doc.commonParts}</div>}
            
            <div style={{ marginTop: '2.5rem', textAlign: 'left' }}>
                <p className="font-bold mb-1" style={{ fontWeight: 'bold' }}>Osservazioni e valutazioni:</p>
                <p style={{ whiteSpace: 'pre-line' }}>{doc.observations || "..."}</p>
                <p style={{ marginTop: '1.8rem', fontStyle: 'italic' }}>La visita si conclude alle ore {doc.endTime || '__________'}.</p>
                <p style={{ marginTop: '1.2rem', fontWeight: 'bold' }}>L.C.S.</p>
            </div>
        </div>

        {/* FIRME: Incolonnamento block per ordine sovrapposto */}
        <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'block', width: '100%', borderBottom: '1px solid black', paddingBottom: '4px', marginTop: '18px' }}>
                <span style={{ fontStyle: 'italic', color: '#334155' }}>Il Collaudatore:</span> <span style={{ fontWeight: 'normal' }}>{formatNameWithTitle(project.subjects.tester.contact)}</span>
            </div>
            {doc.attendees && doc.attendees.split('\n').filter(l => l.trim()).map((present, idx) => {
                const parts = present.split(':');
                const label = parts[0];
                const name = parts[1]?.trim() || '';
                return (
                    <div key={idx} style={{ display: 'block', width: '100%', borderBottom: '1px solid black', paddingBottom: '4px', marginTop: '18px' }}>
                        <span style={{ fontStyle: 'italic', color: '#334155' }}>{label}:</span> <span style={{ fontWeight: 'normal' }}>{name}</span>
                    </div>
                );
            })}
            {!doc.attendees && (
                <>
                    <div style={{ display: 'block', width: '100%', borderBottom: '1px solid black', paddingBottom: '4px', marginTop: '18px', minHeight: '1.2rem' }}>
                        <span style={{ fontStyle: 'italic', color: '#334155' }}>Per l'Ufficio di Direzione Lavori:</span>
                    </div>
                    <div style={{ display: 'block', width: '100%', borderBottom: '1px solid black', paddingBottom: '4px', marginTop: '18px', minHeight: '1.2rem' }}>
                        <span style={{ fontStyle: 'italic', color: '#334155' }}>Per l'Impresa:</span>
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};
