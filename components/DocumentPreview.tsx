
import React from 'react';
import { ProjectConstants, DocumentVariables } from '../types';

interface DocumentPreviewProps {
  project: ProjectConstants;
  doc: DocumentVariables;
  allDocuments: DocumentVariables[];
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ project, doc }) => {
  if (!project || !doc) return <div className="p-10 text-center text-slate-400 italic">Nessun dato da visualizzare</div>;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '...';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('it-IT');
    } catch(e) { return dateStr; }
  };

  const getFullItalianDate = (dateStr: string) => {
    if (!dateStr) return '...';
    try {
        const d = new Date(dateStr);
        const mesi = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
        return `${d.getDate()} del mese di ${mesi[d.getMonth()]} dell'anno ${d.getFullYear()}`;
    } catch(e) { return dateStr; }
  };

  const HeaderInfo = () => (
    <div className="space-y-1 mb-8 text-[11pt] border-y border-black/10 py-4 no-break">
        <p><strong>Impresa:</strong> {project.contractor.name} - {project.contractor.address}</p>
        <p><strong>Contratto d'appalto:</strong> Rep. N. {project.contract.repNumber} del {formatDate(project.contract.date)}</p>
        <p><strong>Importo Contrattuale:</strong> € {project.contract.totalAmount}</p>
        <p><strong>Scadenza contrattuale lavori:</strong> {formatDate(project.executionPhase.completionDate)}</p>
        <p><strong>Responsabile Unico del Procedimento:</strong> {project.subjects.rup.contact.title} {project.subjects.rup.contact.name}</p>
        <p><strong>Direttore dei Lavori:</strong> {project.subjects.dl.contact.title} {project.subjects.dl.contact.name}</p>
        <p><strong>CSE:</strong> {project.subjects.cse.contact.title} {project.subjects.cse.contact.name}</p>
    </div>
  );

  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-relaxed w-full bg-white p-0 text-[11.5pt]">
      
      {/* Intestazione Ente */}
      <div className="text-center mb-10">
        <h1 className="text-sm font-bold uppercase tracking-widest m-0">{project.entity}</h1>
        {project.entityProvince && <p className="text-[10pt] m-0">PROVINCIA DI {project.entityProvince}</p>}
      </div>

      <div className="mb-8">
        <p className="font-bold uppercase mb-1">OGGETTO: Lavori di “{project.projectName}”</p>
        <p className="font-bold uppercase underline">CUP: {project.cup}</p>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-[13pt] font-bold uppercase border-y-2 border-black py-2">
            {doc.type === 'VERBALE_COLLAUDO' && `VERBALE DI VISITA DI COLLAUDO N. ${doc.visitNumber}`}
            {doc.type === 'VERBALE_CONSEGNA' && 'VERBALE DI CONSEGNA LAVORI'}
            {doc.type === 'SOSPENSIONE_LAVORI' && 'VERBALE DI SOSPENSIONE LAVORI'}
            {doc.type === 'RIPRESA_LAVORI' && 'VERBALE DI RIPRESA LAVORI'}
            {doc.type === 'CERTIFICATO_ULTIMAZIONE' && 'CERTIFICATO DI ULTIMAZIONE LAVORI'}
        </h2>
      </div>

      <HeaderInfo />

      {doc.type === 'VERBALE_COLLAUDO' && (
        <div className="text-justify space-y-4">
            <p>
                Il giorno <strong>{getFullItalianDate(doc.date)}</strong>, alle ore <strong>{doc.time}</strong>, presso il luogo dei lavori in <strong>{project.location}</strong>, ha avvio la <strong>{doc.visitNumber}ª</strong> visita di collaudo in corso d’opera convocata con nota via <strong>{doc.convocationMethod}</strong> del <strong>{formatDate(doc.convocationDate || '')}</strong>.
            </p>

            <p>
                Sono presenti, oltre al sottoscritto Collaudatore <strong>{project.subjects.tester.contact.title} {project.subjects.tester.contact.name}</strong>:
            </p>
            <div className="whitespace-pre-wrap ml-6 italic mb-6">
                {doc.attendees || 'Nessun soggetto specificato'}
            </div>

            <div className="space-y-4">
                <p className="font-bold uppercase underline text-sm tracking-wide">Premesso che:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>
                        con {project.subjects.testerAppointment.nominationType} del {project.subjects.testerAppointment.nominationAuthority} n. {project.subjects.testerAppointment.nominationNumber} del {formatDate(project.subjects.testerAppointment.nominationDate)} 
                        e successivo contratto/convenzione, rep. n. {project.subjects.testerAppointment.contractRepNumber} del {formatDate(project.subjects.testerAppointment.contractDate)}, prot. n. {project.subjects.testerAppointment.protocolNumber}, 
                        il {project.entity} ha affidato, ai sensi dell’art. 116 del D. Lgs. 36/2023, allo scrivente 
                        {project.subjects.tester.contact.title} {project.subjects.tester.contact.name} (C.F. {project.subjects.tester.contact.cf}), iscritto all’Albo degli {project.subjects.tester.contact.professionalOrder} della Provincia di {project.entityProvince} al n. {project.subjects.tester.contact.registrationNumber}, 
                        l’incarico professionale di collaudo tecnico amministrativo e statico relativo all’intervento di {project.projectName}, CUP: {project.cup};
                    </li>
                </ul>
            </div>

            <p className="mt-8 font-bold">IL COLLAUDATORE PROCEDE ALLE SEGUENTI OPERAZIONI:</p>
            <p className="mt-2">{doc.observations || '...'}</p>
        </div>
      )}

      {/* Footer Firme */}
      <div className="mt-24 grid grid-cols-2 gap-10 no-break">
        <div className="text-center">
            <p className="font-bold text-xs uppercase mb-12">L'impresa appaltatrice</p>
            <p className="border-t border-black/20 pt-2 text-[10pt]">{project.contractor.repName}</p>
        </div>
        <div className="text-center">
            <p className="font-bold text-xs uppercase mb-12">Il Collaudatore</p>
            <p className="border-t border-black/20 pt-2 text-[10pt]">{project.subjects.tester.contact.name}</p>
        </div>
      </div>

    </div>
  );
};
