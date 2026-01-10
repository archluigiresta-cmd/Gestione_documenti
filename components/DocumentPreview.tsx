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
    return (
      <div id="document-preview-container" className="font-serif-print text-black leading-normal w-full max-w-[21cm] bg-white p-[2cm]">
        <div style={{ textAlign: 'center', width: '100%', marginBottom: '3rem' }}>
            {project.headerLogo && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                    <img src={project.headerLogo} style={{ maxHeight: '2.5cm', maxWidth: '100%' }} alt="Logo" />
                </div>
            )}
            <p style={{ textTransform: 'uppercase', fontWeight: 'bold', fontSize: '12pt', letterSpacing: '0.1em', margin: 0 }}>{project.entity}</p>
        </div>
        <div className="flex justify-between mb-12 text-sm" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="text-left space-y-4" style={{ textAlign: 'left' }}>
                <p>Al RUP: {formatNameWithTitle(project.subjects.rup.contact)}</p>
                <p>Alla D.L.: {formatNameWithTitle(project.subjects.dl.contact)}</p>
                <div className="max-w-[10cm]"><p>All'Impresa:</p>{renderContractorInfo()}</div>
            </div>
            <div className="text-right" style={{ textAlign: 'right' }}><p>Data, {new Date().toLocaleDateString('it-IT')}</p></div>
        </div>
        <div className="mb-12 text-sm"><p className="font-bold">OGGETTO: {project.projectName}</p><p className="font-bold">CUP: {project.cup} - CONVOCAZIONE VISITA N. {doc.visitNumber}</p></div>
        <div className="text-justify text-sm space-y-4" style={{ textAlign: 'justify' }}><p>Si comunica che la visita di collaudo n. {doc.visitNumber} si terrà il giorno:</p><p className="font-bold text-center text-lg" style={{ textAlign: 'center' }}>{formatShortDate(doc.date)} alle ore {doc.time}</p><p>presso il cantiere in {project.location}.</p></div>
        <div className="mt-24 text-right text-sm" style={{ textAlign: 'right', marginTop: '6rem' }}>
            <p>Il Collaudatore</p>
            <p className="mt-12 font-normal" style={{ marginTop: '3rem' }}>{formatNameWithTitle(project.subjects.tester.contact)}</p>
            <div className="border-b border-black w-48 ml-auto mt-1" style={{ borderBottom: '1px solid black', width: '12rem', marginLeft: 'auto', marginTop: '4px' }}></div>
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
                    {doc.premis ? <li>{doc.premis}</li> : (type !== 'VERBALE_COLLAUDO' && <p className="italic" style={{ fontStyle: 'italic' }}>Nessuna premessa specifica inserita.</p>)}
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
