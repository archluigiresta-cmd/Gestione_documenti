
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

  // Layout specifico per LETTERA_CONVOCAZIONE
  if (type === 'LETTERA_CONVOCAZIONE') {
    return (
      <div id="document-preview-container" className="font-serif-print text-black leading-normal w-full max-w-[21cm] bg-white p-[2cm] shadow-lg min-h-[29.7cm]">
        <div id="h1" className="text-center mb-12 border-b border-black pb-4">
            {project.headerLogo && <img src={project.headerLogo} style={{ maxHeight: '2cm', margin: '0 auto 10px' }} alt="Logo" />}
            <p className="uppercase font-bold text-base tracking-widest">{project.entity}</p>
        </div>

        <div className="flex justify-between mb-12 text-sm">
            <div className="text-left">
                <p className="font-bold">Al RUP:</p>
                <p>{formatNameWithTitle(project.subjects.rup.contact)}</p>
                <p className="font-bold mt-4">Alla D.L.:</p>
                <p>{formatNameWithTitle(project.subjects.dl.contact)}</p>
                <p className="font-bold mt-4">All'Impresa:</p>
                <p>{project.contractor.mainCompany.name}</p>
            </div>
            <div className="text-right">
                <p>Data, {new Date().toLocaleDateString('it-IT')}</p>
                <p>Prot. n. __________</p>
            </div>
        </div>

        <div className="mb-12">
            <p className="font-bold">OGGETTO: {project.projectName}</p>
            <p className="font-bold">CUP: {project.cup} - CONVOCAZIONE VISITA DI COLLAUDO N. {doc.visitNumber}</p>
        </div>

        <div className="text-justify text-sm space-y-4">
            <p>Con la presente, in qualità di Collaudatore dell'intervento in oggetto, si comunica che la visita di collaudo n. {doc.visitNumber} si terrà il giorno:</p>
            <p className="font-bold text-center text-lg">{formatShortDate(doc.date)} alle ore {doc.time}</p>
            <p>presso il cantiere sito in {project.location}. Si prega di assicurare la presenza dei tecnici incaricati e del rappresentante dell'impresa, con la documentazione aggiornata.</p>
        </div>

        <div className="mt-24 text-right">
            <p>Il Collaudatore</p>
            <p className="mt-12 font-bold">{formatNameWithTitle(project.subjects.tester.contact)}</p>
            <div className="border-b border-black w-48 ml-auto mt-2"></div>
        </div>
      </div>
    );
  }

  // Layout VERBALE Sobrio (Ispirato al PDF allegato)
  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-normal w-full max-w-[21cm]">
      <div className="bg-white shadow-lg p-[1.5cm] min-h-[29.7cm] print-page mb-8 relative flex flex-col justify-between">
        <div>
            {/* INTESTAZIONE ENTE */}
            <div className="text-center mb-8">
                <p className="uppercase font-bold text-sm tracking-widest m-0">{project.entity}</p>
                {project.entityProvince && <p className="text-xs m-0">({project.entityProvince})</p>}
            </div>

            {/* OGGETTO E TITOLO VERBALE */}
            <div className="mb-10 text-center px-4">
                <p className="text-xs font-bold uppercase mb-4 leading-relaxed">
                    lavori di: <br/> “{project.projectName}”
                </p>
                <h2 className="font-bold text-base uppercase tracking-tight">{getDocumentTitle()}</h2>
            </div>

            {/* TABELLA DATI GENERALI (Stile PDF: Etichetta sinistra, Valore destra) */}
            <table className="w-full text-xs mb-10 border-collapse">
                <tbody>
                    <tr className="align-top">
                        <td className="font-bold w-48 py-1">Impresa:</td>
                        <td className="py-1 uppercase">{project.contractor.mainCompany.name} - {project.contractor.mainCompany.address} - P.IVA {project.contractor.mainCompany.vat}</td>
                    </tr>
                    <tr className="align-top">
                        <td className="font-bold py-1">Contratto d'appalto:</td>
                        <td className="py-1">stipulato in data {formatShortDate(project.contract.date)}, Rep. N. {project.contract.repNumber}</td>
                    </tr>
                    <tr className="align-top">
                        <td className="font-bold py-1">Importo Contrattuale:</td>
                        <td className="py-1">{project.contract.totalAmount} (di cui {project.contract.securityCosts} per oneri sicurezza)</td>
                    </tr>
                    <tr className="align-top">
                        <td className="font-bold py-1">CUP:</td>
                        <td className="py-1">{project.cup}</td>
                    </tr>
                    <tr className="align-top">
                        <td className="font-bold py-1">RUP:</td>
                        <td className="py-1">{formatNameWithTitle(project.subjects.rup.contact)}</td>
                    </tr>
                    <tr className="align-top">
                        <td className="font-bold py-1">Direttore dei Lavori:</td>
                        <td className="py-1">{formatNameWithTitle(project.subjects.dl.contact)}</td>
                    </tr>
                </tbody>
            </table>

            {/* CORPO NARRATIVO */}
            <div className="text-xs text-justify space-y-4">
                <p>
                  Il giorno {verboseDate.day} del mese di {verboseDate.month} {verboseDate.year}, alle ore {doc.time}, presso il luogo dei lavori in {project.location}, ha avvio la {doc.visitNumber}° visita di collaudo in corso d’opera {doc.convocationDetails || 'convocata nelle forme di rito'}.
                </p>
                
                <div>
                    <p className="mb-2">Sono presenti, oltre al sottoscritto Collaudatore, {formatNameWithTitle(project.subjects.tester.contact)}:</p>
                    <div className="pl-4 whitespace-pre-line font-bold italic">{doc.attendees || "..."}</div>
                </div>
                
                <div className="mt-6">
                    <p className="font-bold mb-2">Premesso che:</p>
                    <p className="whitespace-pre-line">{doc.premis || "..."}</p>
                </div>

                {/* SEZIONE LAVORAZIONI ESEGUITE */}
                <div className="mt-6">
                    <p className="font-bold mb-2">{doc.worksIntroText || "Durante il sopralluogo si prende atto delle seguenti lavorazioni eseguite:"}</p>
                    <ul className="list-decimal pl-10 space-y-1">
                        {doc.worksExecuted.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                </div>

                {/* OPERE IN CORSO */}
                {doc.worksInProgress && (
                    <div className="mt-6">
                        <p className="font-bold mb-1">Opere in corso di esecuzione:</p>
                        <div className="whitespace-pre-line italic pl-4">{doc.worksInProgress}</div>
                    </div>
                )}

                {/* PROSSIME ATTIVITA - Campo che mancava prima */}
                {doc.upcomingWorks && (
                    <div className="mt-6">
                        <p className="font-bold mb-1">Prossime attività previste:</p>
                        <div className="whitespace-pre-line italic pl-4">{doc.upcomingWorks}</div>
                    </div>
                )}

                {/* RICHIESTE COLLAUDATORE */}
                {doc.testerRequests && (
                    <div className="mt-6">
                        <p className="font-bold mb-1">Richieste del Collaudatore:</p>
                        <div className="whitespace-pre-line pl-4">{doc.testerRequests}</div>
                    </div>
                )}

                {/* INVITI COLLAUDATORE */}
                {doc.testerInvitations && (
                    <div className="mt-6">
                        <p className="font-bold mb-1">Inviti del Collaudatore:</p>
                        <div className="whitespace-pre-line pl-4">{doc.testerInvitations}</div>
                    </div>
                )}

                {/* PARTI COMUNI */}
                {doc.commonParts && (
                    <div className="mt-6">
                        <div className="whitespace-pre-line italic font-bold">{doc.commonParts}</div>
                    </div>
                )}

                {/* OSSERVAZIONI/VALUTAZIONI */}
                <div className="mt-6">
                    <p className="font-bold mb-1">Osservazioni e valutazioni:</p>
                    <p className="whitespace-pre-line pl-4">{doc.observations || "..."}</p>
                </div>
            </div>
        </div>

        {/* FIRME FINALI */}
        <div className="mt-16 text-xs grid grid-cols-2 gap-12">
            <div>
                <p className="mb-12">Il Collaudatore</p>
                <p className="font-bold uppercase">{formatNameWithTitle(project.subjects.tester.contact)}</p>
                <div className="border-b border-black w-full mt-1"></div>
            </div>
            <div className="text-right">
                <p className="mb-12">Per l'Ufficio di Direzione Lavori</p>
                <div className="border-b border-black w-full mt-1"></div>
            </div>
            <div className="col-span-2 text-center mt-8">
                <p className="mb-12">Per l'Impresa</p>
                <div className="border-b border-black w-64 mx-auto mt-1"></div>
            </div>
        </div>
      </div>
    </div>
  );
};
