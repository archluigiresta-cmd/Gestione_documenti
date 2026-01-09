
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

  // Recupero del riepilogo lavori associato a questo verbale (mappato per numero visita)
  const summaryIndex = (doc.visitNumber > 0 ? doc.visitNumber : 1) - 1;
  const currentSummary = project.executionPhase?.testerVisitSummaries?.[summaryIndex];

  // Layout Lettera Convocazione (semplificato)
  if (type === 'LETTERA_CONVOCAZIONE') {
    return (
      <div id="document-preview-container" className="font-serif-print text-black leading-normal w-full max-w-[21cm] bg-white p-[2cm] shadow-lg min-h-[29.7cm]">
        <div className="text-center mb-12">
            <p className="uppercase font-bold text-base tracking-widest">{project.entity}</p>
        </div>
        <div className="flex justify-between mb-12 text-sm">
            <div className="text-left space-y-4">
                <p>Al RUP: {formatNameWithTitle(project.subjects.rup.contact)}</p>
                <p>Alla D.L.: {formatNameWithTitle(project.subjects.dl.contact)}</p>
                <p>All'Impresa: {project.contractor.mainCompany.name}</p>
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
            <p className="font-bold text-center">{formatShortDate(doc.date)} alle ore {doc.time}</p>
            <p>presso il cantiere in {project.location}.</p>
        </div>
        <div className="mt-24 text-right text-sm">
            <p>Il Collaudatore</p>
            <p className="mt-12">{formatNameWithTitle(project.subjects.tester.contact)}</p>
        </div>
      </div>
    );
  }

  // Layout VERBALE SOBRIO (Tutti i dati, nessuna sottolineatura, stile PDF)
  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-normal w-full max-w-[21cm]">
      <div className="bg-white shadow-lg p-[1.5cm] min-h-[29.7cm] print-page mb-8 relative flex flex-col justify-between">
        <div>
            {/* INTESTAZIONE */}
            <div className="text-center mb-8">
                <p className="uppercase font-bold text-sm tracking-widest m-0">{project.entity}</p>
            </div>

            {/* TITOLO E OGGETTO */}
            <div className="mb-10 text-center px-4">
                <p className="text-xs uppercase mb-4 leading-relaxed">
                    lavori di: “{project.projectName}”
                </p>
                <h2 className="font-bold text-base uppercase tracking-tight">{getDocumentTitle()}</h2>
            </div>

            {/* TABELLA DATI GENERALI (Stile PDF) */}
            <table className="w-full text-xs mb-10 border-collapse">
                <tbody>
                    <tr className="align-top">
                        <td className="w-48 py-1 font-bold">Impresa:</td>
                        <td className="py-1 uppercase">{project.contractor.mainCompany.name} - {project.contractor.mainCompany.address}</td>
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

            {/* CORPO DEL VERBALE */}
            <div className="text-xs text-justify space-y-6">
                <p>
                  Il giorno {verboseDate.day} del mese di {verboseDate.month} {verboseDate.year}, alle ore {doc.time}, presso il luogo dei lavori in {project.location}, ha avvio la {doc.visitNumber}° visita di collaudo in corso d’opera {doc.convocationDetails || 'convocata nelle forme di rito'}.
                </p>
                
                <div>
                    <p className="mb-2">Sono presenti, oltre al sottoscritto Collaudatore {formatNameWithTitle(project.subjects.tester.contact)}:</p>
                    <div className="pl-4 whitespace-pre-line italic font-bold">{doc.attendees || "..."}</div>
                </div>
                
                <div>
                    <p className="font-bold mb-2">Premesso che:</p>
                    <p className="whitespace-pre-line">{doc.premis || "..."}</p>
                </div>

                {/* RIEPILOGO LAVORAZIONI DEL PERIODO (Dati dalla maschera collaudo) */}
                <div>
                    <p className="font-bold mb-2">{doc.worksIntroText || "Lavorazioni eseguite nel periodo:"}</p>
                    {currentSummary && currentSummary.works.length > 0 ? (
                        <ul className="list-decimal pl-8 space-y-1">
                            {currentSummary.works.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                    ) : (
                        <p className="italic pl-4">Nessuna lavorazione specifica riportata nel riepilogo del periodo.</p>
                    )}
                </div>

                {/* OPERE IN CORSO (Dati dalla maschera collaudo) */}
                {doc.worksInProgress && (
                    <div>
                        <p className="font-bold mb-1">Opere in corso di esecuzione:</p>
                        <div className="whitespace-pre-line pl-4">
                            {doc.worksInProgress.split('\n').map((line, i) => (
                                <p key={i}>- {line}</p>
                            ))}
                        </div>
                    </div>
                )}

                {/* PROSSIME ATTIVITA (Dati dalla maschera collaudo) */}
                {doc.upcomingWorks && (
                    <div>
                        <p className="font-bold mb-1">Prossime attività previste:</p>
                        <div className="whitespace-pre-line pl-4">
                            {doc.upcomingWorks.split('\n').map((line, i) => (
                                <p key={i}>- {line}</p>
                            ))}
                        </div>
                    </div>
                )}

                {/* RICHIESTE (Dati dalla maschera collaudo) */}
                {doc.testerRequests && (
                    <div>
                        <p className="font-bold mb-1">Richieste del Collaudatore:</p>
                        <div className="whitespace-pre-line pl-4">{doc.testerRequests}</div>
                    </div>
                )}

                {/* INVITI (Dati dalla maschera collaudo) */}
                {doc.testerInvitations && (
                    <div>
                        <p className="font-bold mb-1">Inviti del Collaudatore:</p>
                        <div className="whitespace-pre-line pl-4">{doc.testerInvitations}</div>
                    </div>
                )}

                {/* PARTI COMUNI (Dati dalla maschera collaudo) */}
                {doc.commonParts && (
                    <div>
                        <div className="whitespace-pre-line italic">{doc.commonParts}</div>
                    </div>
                )}

                {/* OSSERVAZIONI E CHIUSURA */}
                <div>
                    <p className="font-bold mb-1">Osservazioni e valutazioni:</p>
                    <p className="whitespace-pre-line">{doc.observations || "..."}</p>
                    <p className="mt-4">La visita si conclude alle ore __________.</p>
                    <p>L.C.S.</p>
                </div>
            </div>
        </div>

        {/* FIRME */}
        <div className="mt-16 text-xs grid grid-cols-2 gap-12">
            <div>
                <p className="mb-12">Il Collaudatore</p>
                <p className="font-bold uppercase">{formatNameWithTitle(project.subjects.tester.contact)}</p>
                <div className="border-b border-black w-full"></div>
            </div>
            <div className="text-right">
                <p className="mb-12">Per l'Ufficio di Direzione Lavori</p>
                <div className="border-b border-black w-full"></div>
            </div>
            <div className="col-span-2 text-center mt-12">
                <p className="mb-12">Per l'Impresa</p>
                <div className="border-b border-black w-64 mx-auto"></div>
            </div>
        </div>
      </div>
    </div>
  );
};
