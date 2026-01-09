
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
          case 'VERBALE_COLLAUDO': return `VERBALE DI VISITA DI COLLAUDO IN CORSO D'OPERA N. ${doc.visitNumber}`;
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

  // Ripristino Layout completo Verbale (versione 15.12.2025)
  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-normal w-full max-w-[21cm]">
      <div className="bg-white shadow-lg p-[2cm] min-h-[29.7cm] print-page mb-8 relative flex flex-col justify-between">
        <div>
            <div id="h1" className="text-center mb-8 border-b border-black pb-4">
                <table style={{ width: '100%' }}>
                    <tbody>
                        <tr>
                            <td align="center">
                                {project.headerLogo && <img src={project.headerLogo} style={{ maxHeight: '2.5cm', margin: '0 auto 5px' }} alt="Logo" />}
                                <p className="uppercase font-bold text-base tracking-widest m-0">{project.entity}</p>
                                {project.entityProvince && <p className="text-sm m-0">(Provincia di {project.entityProvince})</p>}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mb-8 text-center">
                <p className="text-sm font-bold uppercase mb-4 leading-relaxed">
                    lavori di: <br/> "{project.projectName}"
                </p>
                <h2 className="font-bold text-lg uppercase border-b-2 border-black inline-block pb-1">{getDocumentTitle()}</h2>
            </div>

            <table className="w-full text-sm mb-8">
                <tbody>
                    <tr><td className="font-bold w-48">Ente:</td><td>{project.entity}</td></tr>
                    <tr><td className="font-bold">CUP:</td><td>{project.cup}</td></tr>
                    <tr><td className="font-bold">DL:</td><td>{formatNameWithTitle(project.subjects.dl.contact)}</td></tr>
                    <tr><td className="font-bold">Impresa:</td><td>{project.contractor.mainCompany.name}</td></tr>
                </tbody>
            </table>

            <div className="text-sm text-justify space-y-4">
                <p>L'anno {verboseDate.year}, il giorno {verboseDate.day} del mese di {verboseDate.month}, presso il luogo dei lavori...</p>
                <div className="italic pl-4 whitespace-pre-line font-bold">Presenti: {doc.attendees || "..."}</div>
                
                <div className="mt-4"><p className="font-bold underline">Premesso che:</p><p className="whitespace-pre-line">{doc.premis || "..."}</p></div>

                {/* RIPRISTINO SEZIONE LAVORI */}
                <div className="mt-4">
                    <p className="font-bold underline">{doc.worksIntroText || "Lavorazioni eseguite:"}</p>
                    <ul className="list-disc pl-8 mt-1">
                        {doc.worksExecuted.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                </div>

                {doc.worksInProgress && (
                    <div className="mt-4">
                        <p className="font-bold underline">Opere in corso di esecuzione:</p>
                        <div className="whitespace-pre-line italic">{doc.worksInProgress}</div>
                    </div>
                )}

                {doc.testerRequests && (
                    <div className="mt-4">
                        <p className="font-bold underline">Richieste del Collaudatore:</p>
                        <div className="whitespace-pre-line">{doc.testerRequests}</div>
                    </div>
                )}

                {doc.testerInvitations && (
                    <div className="mt-4">
                        <p className="font-bold underline">Inviti del Collaudatore:</p>
                        <div className="whitespace-pre-line">{doc.testerInvitations}</div>
                    </div>
                )}

                {doc.commonParts && (
                    <div className="mt-4">
                        <div className="whitespace-pre-line font-bold italic">{doc.commonParts}</div>
                    </div>
                )}

                <div className="mt-4"><p className="font-bold underline">Osservazioni:</p><p className="whitespace-pre-line">{doc.observations || "..."}</p></div>
            </div>
        </div>
        <div className="mt-12 text-right text-sm">
            <p>Il Collaudatore / DL</p>
            <p className="mt-12 font-bold">{formatNameWithTitle(project.subjects.tester.contact)}</p>
        </div>
      </div>
    </div>
  );
};
