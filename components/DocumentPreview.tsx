
import React from 'react';
import { ProjectConstants, DocumentVariables } from '../types';

interface DocumentPreviewProps {
  project: ProjectConstants;
  doc: DocumentVariables;
  allDocuments: DocumentVariables[];
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ project, doc, allDocuments = [] }) => {
  if (!project || !doc) return <div className="p-10 text-center text-slate-400 italic">Dati non disponibili</div>;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '...';
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3 && parts[0].length === 4) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return dateStr;
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
        <p><strong>Impresa:</strong> {project.contractor.name}</p>
        <p><strong>Contratto d'appalto:</strong> Rep. N. {project.contract.repNumber} del {formatDate(project.contract.date)}</p>
        <p><strong>Importo Contrattuale:</strong> € {project.contract.totalAmount}</p>
        <p><strong>Scadenza contrattuale lavori:</strong> giorni {project.contract.durationDays} naturali e consecutivi, per l'esecuzione di tutte le lavorazioni, decorrenti dal {formatDate(project.executionPhase.deliveryDate)}, data del verbale di consegna dei lavori per cui l'ultimazione dovrà avvenire entro il {formatDate(project.executionPhase.completionDate)}</p>
        <p><strong>Responsabile Unico del Procedimento:</strong> {project.subjects.rup.contact.title} {project.subjects.rup.contact.name}</p>
        <p><strong>Direttore dei Lavori:</strong> {project.subjects.dl.contact.title} {project.subjects.dl.contact.name}</p>
        <p><strong>CSE:</strong> {project.subjects.cse.contact.title} {project.subjects.cse.contact.name}</p>
    </div>
  );

  const renderPreamble = () => {
    const points = [];
    const app = project.subjects.testerAppointment;

    points.push(
        <li key="nomination">
            con Determina Dirigenziale del {app.nominationAuthority} n. {app.nominationNumber} del {formatDate(app.nominationDate)} 
            e successivo contratto/convenzione, rep. n. {app.contractRepNumber} del {formatDate(app.contractDate)}, 
            prot. n. {app.protocolNumber}, il {project.entity} ha affidato, ai sensi dell’art. 116 del D. Lgs. 36/2023, 
            allo scrivente {project.subjects.tester.contact.title} {project.subjects.tester.contact.name} (C.F. {project.subjects.tester.contact.cf}), 
            iscritto all’Albo degli {project.subjects.tester.contact.professionalOrder} della Provincia di {project.entityProvince} al n. {project.subjects.tester.contact.registrationNumber}, 
            l’incarico professionale di collaudo tecnico amministrativo e statico relativo all’intervento di {project.projectName}, CUP: {project.cup};
        </li>
    );

    if (doc.type === 'VERBALE_COLLAUDO' && doc.visitNumber > 1) {
        const pastVisits = allDocuments
            .filter(d => d.type === 'VERBALE_COLLAUDO' && d.visitNumber < doc.visitNumber)
            .sort((a, b) => a.visitNumber - b.visitNumber);

        pastVisits.forEach((past) => {
            points.push(
                <li key={`visit-${past.visitNumber}`} className="mt-4">
                    in data <strong>{formatDate(past.date)}</strong>, con verbale di visita di collaudo tecnico amministrativo e statico in corso d’opera n. <strong>{past.visitNumber}</strong> sottoscritto in pari data, lo scrivente Collaudatore ha preso atto dell’andamento dei lavori:
                    <ul className="list-decimal ml-8 mt-2 italic">
                        {past.worksExecuted.map((w, i) => <li key={i}>{w};</li>)}
                    </ul>
                    {past.worksInProgress && <p className="mt-2">Era in corso il {past.worksInProgress}.</p>}
                </li>
            );
        });
    }

    return <ul className="list-disc ml-6 space-y-4">{points}</ul>;
  };

  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-relaxed w-full bg-white p-0 text-[11.5pt]">
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
        <div className="text-justify">
            <p className="mb-6">
                Il giorno <strong>{getFullItalianDate(doc.date)}</strong>, alle ore <strong>{doc.time}</strong>, presso il luogo dei lavori in <strong>{project.location}</strong>, ha avvio la <strong>{doc.visitNumber}ª</strong> visita di collaudo convocata con nota via <strong>{doc.convocationMethod}</strong> del <strong>{formatDate(doc.convocationDate || '')}</strong>.
            </p>

            <p className="mb-4">Sono presenti:</p>
            <div className="whitespace-pre-wrap ml-6 italic mb-10 border-l-2 border-black/5 pl-4">
                {doc.attendees || 'Nessun presente indicato'}
            </div>

            <p className="font-bold uppercase underline text-sm mb-4">Premesso che:</p>
            {renderPreamble()}

            <div className="mt-12 space-y-6">
                <p className="font-bold uppercase border-b border-black pb-1">ACCERTAMENTI E RILIEVI:</p>
                <p>Nel periodo dal sopralluogo precedente sono state effettuate le seguenti lavorazioni:</p>
                <ul className="list-decimal ml-8 space-y-1 font-bold italic">
                    {doc.worksExecuted.map((w, i) => <li key={i}>{w};</li>)}
                </ul>
                <p><strong>Opere in corso:</strong> {doc.worksInProgress || '...'}</p>
                <p><strong>Prossime attività:</strong> {doc.upcomingWorks || '...'}</p>
                <p className="mt-4"><strong>Osservazioni:</strong> {doc.observations || 'Nessuna.'}</p>
            </div>
            
            <p className="mt-12">L.C.S.</p>
        </div>
      )}

      <div className="mt-24 grid grid-cols-2 gap-10 no-break">
        <div className="text-center">
            <p className="font-bold text-xs uppercase mb-16">L'impresa appaltatrice</p>
            <p className="border-t border-black/20 pt-2 text-[10pt] font-bold">{project.contractor.repName}</p>
        </div>
        <div className="text-center">
            <p className="font-bold text-xs uppercase mb-16">Il Collaudatore</p>
            <p className="border-t border-black/20 pt-2 text-[10pt] font-bold">{project.subjects.tester.contact.name}</p>
        </div>
      </div>
    </div>
  );
};
