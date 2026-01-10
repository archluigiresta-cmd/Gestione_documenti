
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

  const getNominationPremise = () => {
    const ta = project.subjects.testerAppointment;
    const tester = project.subjects.tester.contact;
    
    if (!ta.nominationNumber || !ta.nominationDate) return '';
    
    const authority = ta.nominationAuthority ? ` dal ${ta.nominationAuthority}` : '';
    const date = formatShortDate(ta.nominationDate);
    const typeStr = ta.nominationType || 'atto';
    
    return `con ${typeStr} n. ${ta.nominationNumber} in data ${date}${authority}, il sottoscritto ${formatNameWithTitle(tester)} è stato nominato Collaudatore delle opere in oggetto;`;
  };

  const getDocumentTitle = () => {
      switch(type) {
          case 'LETTERA_CONVOCAZIONE': return `Convocazione ${doc.visitNumber === 1 ? 'I' : doc.visitNumber === 2 ? 'II' : doc.visitNumber === 3 ? 'III' : doc.visitNumber}° visita di Collaudo`;
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
                <p>- Mandataria: {main.name} (P.IVA {main.vat}) {main.address && `Sede: ${main.address}`}</p>
                {contractor.mandants.map((m, i) => (
                    <p key={i}>- Mandante: {m.name} (P.IVA {m.vat}) {m.address && `Sede: ${m.address}`}</p>
                ))}
              </div>
          );
      } else if (contractor.type === 'consortium') {
          return (
              <div className="space-y-1">
                <p className="uppercase font-bold">Consorzio Appaltatore:</p>
                <p>- Consorzio: {main.name} (P.IVA {main.vat}) {main.address && `Sede: ${main.address}`}</p>
                {contractor.executors.map((e, i) => (
                    <p key={i}>- Consorziata Esecutrice: {e.name} (P.IVA {e.vat}) {e.address && `Sede: ${e.address}`}</p>
                ))}
              </div>
          );
      }
      return <p className="uppercase">{main.name} {main.address ? `- ${main.address}` : ''} {main.vat ? `- P.IVA ${main.vat}` : ''}</p>;
  };

  if (type === 'LETTERA_CONVOCAZIONE') {
    const tester = project.subjects.tester.contact;
    const rup = project.subjects.rup.contact;
    const dl = project.subjects.dl.contact;
    const contractor = project.contractor;
    const selectedRecipients = doc.selectedRecipients || [];

    return (
      <div id="document-preview-container" className="font-serif-print text-black leading-tight w-full max-w-[21cm] bg-white p-[1.5cm] min-h-[29.7cm] flex flex-col">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-16">
            <div>
                <h1 className="text-xl font-bold uppercase tracking-wider m-0">{tester.name || 'LUIGI RESTA'}</h1>
            </div>
            <div className="text-right">
                <p className="text-sm uppercase tracking-[0.2em] font-medium m-0">ARCHITETTO</p>
            </div>
        </div>

        {/* RECIPIENTS BLOCK: ALIGNED TO RIGHT EDGE */}
        <div className="flex justify-end mb-12">
            <div className="w-[60%] text-[10.5pt] space-y-6 text-left">
                {selectedRecipients.includes('rup') && (
                  <div className="space-y-0.5 uppercase font-bold">
                      <p>SPETT.LE {project.subjects.testerAppointment.nominationAuthority || project.entity}</p>
                      <p>ALLA C.A. DEL RUP {formatNameWithTitle(rup)}</p>
                      {rup.pec && <p className="text-[9.5pt] font-normal lowercase italic underline">PEC: {rup.pec}</p>}
                  </div>
                )}
                
                {selectedRecipients.includes('dl') && (
                  <div className="space-y-0.5 uppercase font-bold">
                      <p>{dl.name || 'DIREZIONE LAVORI'}</p>
                      <p>ALLA C.A. DEL DL {formatNameWithTitle(dl)}</p>
                      {dl.address && <p className="text-[9.5pt] font-normal capitalize italic">Sede: {dl.address}</p>}
                      {dl.pec && <p className="text-[9.5pt] font-normal lowercase italic underline">PEC: {dl.pec}</p>}
                  </div>
                )}

                {selectedRecipients.includes('contractor') && (
                  <div className="space-y-1 uppercase font-bold">
                      <p>SPETT.LE {contractor.mainCompany.name}</p>
                      {contractor.mainCompany.address && <p className="text-[9.5pt] font-normal capitalize italic">{contractor.mainCompany.address}</p>}
                      {contractor.mainCompany.pec && <p className="text-[9.5pt] font-normal lowercase italic underline">PEC: {contractor.mainCompany.pec}</p>}
                      
                      {contractor.type === 'ati' && contractor.mandants.map((m, i) => (
                          <div key={i} className="pt-1">
                              <p className="text-[9.5pt]">(Mandante: {m.name})</p>
                              {m.address && <p className="text-[9pt] font-normal capitalize italic">{m.address}</p>}
                              {m.pec && <p className="text-[9pt] font-normal lowercase italic underline">PEC: {m.pec}</p>}
                          </div>
                      ))}
                      {contractor.type === 'consortium' && contractor.executors.map((e, i) => (
                          <div key={i} className="pt-1">
                              <p className="text-[9.5pt]">(Consorziata: {e.name})</p>
                              {e.address && <p className="text-[9pt] font-normal capitalize italic">{e.address}</p>}
                              {e.pec && <p className="text-[9pt] font-normal lowercase italic underline">PEC: {e.pec}</p>}
                          </div>
                      ))}
                  </div>
                )}

                {/* DYNAMIC OTHER RECIPIENTS */}
                {(project.subjects.others || []).map((other, oIdx) => {
                  if (selectedRecipients.includes(`other-${oIdx}`)) {
                    return (
                      <div key={oIdx} className="space-y-0.5 uppercase font-bold">
                          <p>{other.contact.role || 'SOGGETTO INTERESSATO'}</p>
                          <p>{formatNameWithTitle(other.contact)}</p>
                          {other.contact.address && <p className="text-[9.5pt] font-normal capitalize italic">{other.contact.address}</p>}
                          {other.contact.pec && <p className="text-[9.5pt] font-normal lowercase italic underline">PEC: {other.contact.pec}</p>}
                      </div>
                    );
                  }
                  return null;
                })}
            </div>
        </div>

        {/* OGGETTO */}
        <div className="mb-10 text-[10.5pt] text-justify leading-relaxed">
            <p>
                <span className="font-bold uppercase">Oggetto: {project.projectName}</span>
                {project.cup ? ` - CUP: ${project.cup}` : ''}
                {project.cig ? ` - CIG: ${project.cig}` : ''}.
            </p>
            <p className="font-bold mt-2 tracking-wide underline uppercase">
                {getDocumentTitle()}
            </p>
        </div>

        {/* BODY CONTENT */}
        <div className="text-[10.5pt] text-justify space-y-5 flex-grow leading-[1.35]">
            <p>{doc.letterIntro}</p>
            
            {(doc.letterBodyParagraphs || []).map((p, i) => (
                <p key={i}>{p}</p>
            ))}
            
            <p className="pt-2">{doc.letterClosing || 'Distinti saluti'}</p>
        </div>

        {/* SIGNATURE */}
        <div className="mt-8 text-right text-[10.5pt]">
            <p className="uppercase font-bold m-0 leading-tight">IL COLLAUDATORE STATICO, TECNICO-AMMINISTRATIVO</p>
            <p className="uppercase font-bold m-0 leading-tight">E FUNZIONALE DEGLI IMPIANTI</p>
            <p className="mt-6 font-bold text-[11pt] tracking-wide m-0">{formatNameWithTitle(tester)}</p>
            <div className="h-16"></div>
        </div>

        {/* FOOTER */}
        <div className="mt-auto pt-4 border-t border-slate-300 grid grid-cols-2 gap-x-8 text-[8.5pt] text-slate-600">
            <div className="space-y-1">
                <p className="font-medium">{tester.address || 'Piazza Matteotti, 3'}</p>
                <p>{tester.phone ? `Cell: ${tester.phone}` : '72023 Mesagne'}</p>
            </div>
            <div className="text-right space-y-1">
                <p>PEC: <span className="underline">{tester.pec || 'arch.luigiresta@pec.it'}</span></p>
                <p>Email: <span className="underline">{tester.email || 'arch.luigiresta@gmail.com'}</span></p>
                {tester.vat && <p>C.F./P.IVA: {tester.vat}</p>}
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
                    {type === 'VERBALE_COLLAUDO' && <li>{getNominationPremise() || 'Premessa di nomina non disponibile.'}</li>}
                    {doc.premis && (
                        <div className="whitespace-pre-line leading-relaxed">{doc.premis}</div>
                    )}
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

        {/* FIRME */}
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
        </div>
      </div>
    </div>
  );
};
