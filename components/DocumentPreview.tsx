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
  
  const getDocumentTitle = () => {
      switch(type) {
          case 'LETTERA_CONVOCAZIONE': return `LETTERA DI CONVOCAZIONE VISITA DI COLLAUDO N. ${doc.visitNumber}`;
          case 'VERBALE_COLLAUDO': return `VERBALE DI VISITA DI COLLAUDO TECNICO AMMINISTRATIVO E STATICO IN CORSO D'OPERA N. ${doc.visitNumber}`;
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

  // Rendering dinamico dell'Impresa (ATI, Consorzio, Singola)
  const renderContractorInfo = () => {
      const { contractor } = project;
      const main = contractor.mainCompany;
      
      if (contractor.type === 'ati') {
          return (
              <div className="space-y-1">
                <p className="uppercase font-bold">Raggruppamento Temporaneo di Imprese:</p>
                <p>- Mandataria: {main.name} (P.IVA {main.vat})</p>
                {contractor.mandants.map((m, i) => (
                    <p key={i}>- Mandante: {m.name} (P.IVA {m.vat})</p>
                ))}
              </div>
          );
      } else if (contractor.type === 'consortium') {
          return (
              <div className="space-y-1">
                <p className="uppercase font-bold">Consorzio Appaltatore:</p>
                <p>- Consorzio: {main.name} (P.IVA {main.vat})</p>
                {contractor.executors.map((e, i) => (
                    <p key={i}>- Consorziata Esecutrice: {e.name} (P.IVA {e.vat})</p>
                ))}
              </div>
          );
      }
      return <p className="uppercase">{main.name} - {main.address} - P.IVA {main.vat}</p>;
  };

  const summaryIndex = (doc.visitNumber > 0 ? doc.visitNumber : 1) - 1;
  const currentSummary = project.executionPhase?.testerVisitSummaries?.[summaryIndex];

  if (type === 'LETTERA_CONVOCAZIONE') {
    return (
      <div id="document-preview-container" className="font-serif-print text-black leading-normal w-full max-w-[21cm] bg-white p-[2cm] shadow-lg">
        <div className="text-center mb-12">
            {project.headerLogo && <img src={project.headerLogo} style={{ maxHeight: '2.5cm', margin: '0 auto 10px' }} alt="Logo" />}
            <p className="uppercase font-bold text-base tracking-widest">{project.entity}</p>
        </div>
        <div className="flex justify-between mb-12 text-sm">
            <div className="text-left space-y-4">
                <p>Al RUP: {formatNameWithTitle(project.subjects.rup.contact)}</p>
                <p>Alla D.L.: {formatNameWithTitle(project.subjects.dl.contact)}</p>
                <div className="max-w-[10cm]">
                    <p>All'Impresa:</p>
                    {renderContractorInfo()}
                </div>
            </div>
            <div className="text-right">
                <p>Data, {new Date().toLocaleDateString('it-IT')}</p>
            </div>
        </div>
        <div className="mb-12 text-sm">
            <p className="font-bold">OGGETTO: {project.projectName}</p>
            <p className="font-bold">CUP: {project.cup} - CONVOCAZIONE VISITA N. {doc.visitNumber}</p>
        </div>
        <div className="text-justify text-sm space-y-4">
            <p>Si comunica che la visita di collaudo n. {doc.visitNumber} si terrà il giorno:</p>
            <p className="font-bold text-center text-lg">{formatShortDate(doc.date)} alle ore {doc.time}</p>
            <p>presso il cantiere in {project.location}.</p>
        </div>
        <div className="mt-24 text-right text-sm">
            <p>Il Collaudatore</p>
            <p className="mt-12 font-bold">{formatNameWithTitle(project.subjects.tester.contact)}</p>
            <div className="border-b border-black w-48 ml-auto mt-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-normal w-full max-w-[21cm]">
      <div className="bg-white shadow-lg p-[1.5cm] print-page mb-8 border border-slate-100 print:border-none">
        
        {/* INTESTAZIONE CON LOGO */}
        <div className="text-center mb-8">
            {project.headerLogo && <img src={project.headerLogo} style={{ maxHeight: '2.5cm', margin: '0 auto 10px' }} alt="Logo" />}
            <p className="uppercase font-bold text-sm tracking-widest m-0">{project.entity}</p>
            {project.entityProvince && <p className="text-xs m-0">({project.entityProvince})</p>}
        </div>

        {/* TITOLO E OGGETTO */}
        <div className="mb-10 text-center px-4">
            <p className="text-xs uppercase mb-4 leading-relaxed">
                lavori di: “{project.projectName}”
            </p>
            <h2 className="font-bold text-base uppercase tracking-tight">{getDocumentTitle()}</h2>
        </div>

        {/* DATI GENERALI STILE PDF */}
        <table className="w-full text-xs mb-10 border-collapse">
            <tbody>
                <tr className="align-top">
                    <td className="w-48 py-1 font-bold">Impresa:</td>
                    <td className="py-1">{renderContractorInfo()}</td>
                </tr>
                <tr className="align-top">
                    <td className="py-1 font-bold">Contratto d'appalto:</td>
                    <td className="py-1">stipulato in data {formatShortDate(project.contract.date)}, Rep. N. {project.contract.repNumber}</td>
                </tr>
                <tr className="align-top">
                    <td className="py-1 font-bold">Importo Contrattuale:</td>
                    <td className="py-1">Euro {project.contract.totalAmount} (di cui Euro {project.contract.securityCosts} per oneri sicurezza)</td>
                </tr>
                <tr className="align-top">
                    <td className="py-1 font-bold">Scadenza contrattuale:</td>
                    <td className="py-1">{formatShortDate(project.executionPhase?.completionDate)}</td>
                </tr>
                <tr className="align-top">
                    <td className="py-1 font-bold">RUP:</td>
                    <td className="py-1">{formatNameWithTitle(project.subjects.rup.contact)}</td>
                </tr>
                <tr className="align-top">
                    <td className="py-1 font-bold">Direttore dei Lavori:</td>
                    <td className="py-1">{formatNameWithTitle(project.subjects.dl.contact)}</td>
                </tr>
            </tbody>
        </table>

        {/* CORPO NARRATIVO SENZA GRASSETTI NON RICHIESTI */}
        <div className="text-xs text-justify space-y-6">
            <p>
              Il giorno {verboseDate.day} del mese di {verboseDate.month} {verboseDate.year}, alle ore {doc.time}, presso il luogo dei lavori in {project.location}, ha avvio la {doc.visitNumber}° visita di collaudo in corso d’opera {doc.convocationDetails || 'convocata nelle forme di rito'}.
            </p>
            
            <div className="space-y-1">
                <p>Sono presenti, oltre al sottoscritto Collaudatore {formatNameWithTitle(project.subjects.tester.contact)}:</p>
                <div className="pl-4 whitespace-pre-line italic">
                    {doc.attendees || "..."}
                </div>
            </div>
            
            <div className="space-y-2">
                <p className="font-bold">Premesso che:</p>
                <div className="whitespace-pre-line text-justify">
                    {doc.premis || "Nessuna premessa specifica inserita."}
                </div>
            </div>

            <div className="space-y-2">
                <p>{doc.worksIntroText || "Durante il presente sopralluogo si prende atto che sono state effettuate le seguenti lavorazioni:"}</p>
                {currentSummary && currentSummary.works.length > 0 ? (
                    <ul className="list-decimal pl-10 space-y-1">
                        {currentSummary.works.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                ) : (
                    <p className="italic pl-4">Nessuna lavorazione specifica riportata nel riepilogo del periodo.</p>
                )}
            </div>

            {doc.worksInProgress && (
                <div className="space-y-1">
                    <p className="font-bold">Opere in corso di esecuzione:</p>
                    <div className="whitespace-pre-line pl-4">
                        {doc.worksInProgress.split('\n').map((line, i) => (
                            <p key={i}>- {line}</p>
                        ))}
                    </div>
                </div>
            )}

            {doc.upcomingWorks && (
                <div className="space-y-1">
                    <p className="font-bold">Prossime attività previste:</p>
                    <div className="whitespace-pre-line pl-4">
                        {doc.upcomingWorks.split('\n').map((line, i) => (
                            <p key={i}>- {line}</p>
                        ))}
                    </div>
                </div>
            )}

            {doc.testerRequests && (
                <div className="space-y-1">
                    <p className="font-bold">Richieste del Collaudatore:</p>
                    <div className="whitespace-pre-line pl-4">{doc.testerRequests}</div>
                </div>
            )}

            {doc.testerInvitations && (
                <div className="space-y-1">
                    <p className="font-bold">Inviti del Collaudatore:</p>
                    <div className="whitespace-pre-line pl-4">{doc.testerInvitations}</div>
                </div>
            )}

            {doc.commonParts && (
                <div className="mt-4">
                    <div className="whitespace-pre-line italic">{doc.commonParts}</div>
                </div>
            )}

            <div className="mt-6">
                <p className="font-bold mb-1">Osservazioni e valutazioni:</p>
                <p className="whitespace-pre-line">{doc.observations || "..."}</p>
                <p className="mt-4 italic">La visita si conclude alle ore __________.</p>
                <p className="mt-2">L.C.S.</p>
            </div>
        </div>

        {/* FIRME IN FILA A SINISTRA STILE PDF */}
        <div className="mt-20 text-xs space-y-8">
            <div className="flex items-end">
                <span className="w-64">Il Collaudatore: <span className="font-bold">{formatNameWithTitle(project.subjects.tester.contact)}</span></span>
                <div className="flex-1 border-b border-black mb-1"></div>
            </div>
            
            <div className="flex items-end">
                <span className="w-64">Per l'Ufficio di Direzione Lavori:</span>
                <div className="flex-1 border-b border-black mb-1"></div>
            </div>

            <div className="flex items-end">
                <span className="w-64">Per l'Impresa: <span className="font-bold">{project.contractor.mainCompany.repName || '...'}</span></span>
                <div className="flex-1 border-b border-black mb-1"></div>
            </div>
        </div>
      </div>
    </div>
  );
};
