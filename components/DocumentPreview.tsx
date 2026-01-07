
import React from 'react';
import { ProjectConstants, DocumentVariables } from '../types';

interface DocumentPreviewProps {
  project: ProjectConstants;
  doc: DocumentVariables;
  allDocuments: DocumentVariables[];
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ project, doc, allDocuments }) => {
  if (!project || !doc) return <div className="p-10 text-center text-slate-400 italic">Nessun dato da visualizzare</div>;

  const formatEuro = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val;
    return isNaN(num) ? '0,00' : num.toLocaleString('it-IT', { minimumFractionDigits: 2 });
  };

  const getSubjectString = (role: string) => {
    const s = (project.subjects as any)[role];
    if (!s || !s.contact.name) return '---';
    if (s.isLegalEntity) {
      const opNames = (s.operatingDesigners || []).map((d:any) => `${d.title || ''} ${d.name}`).join(', ');
      return `${opNames} per ${s.contact.name}`;
    }
    return `${s.contact.title || ''} ${s.contact.name}`;
  };

  const formatFullDate = (dateStr: string) => {
    if (!dateStr) return '...';
    const d = new Date(dateStr);
    const mesi = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
    return `${d.getDate()} del mese di ${mesi[d.getMonth()]} dell'anno ${d.getFullYear()}`;
  };

  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-snug w-full bg-white p-0">
      
      {/* Header Table - Word Compatible */}
      <table border={0} cellPadding={0} cellSpacing={0} width="100%" className="mb-8">
        <tr>
          <td align="center">
            {project.headerLogo && <img src={project.headerLogo} style={{ maxHeight: '80px', marginBottom: '10px' }} />}
            <h1 className="text-lg font-bold uppercase m-0 leading-tight">{project.entity}</h1>
            {project.entityProvince && <p className="text-sm m-0 italic">({project.entityProvince})</p>}
          </td>
        </tr>
      </table>

      {/* Object & Title */}
      <div className="mb-10 text-justify">
        <p className="text-xs uppercase m-0"><strong>Oggetto:</strong> {project.projectName}</p>
        <p className="text-xs uppercase m-0"><strong>CUP:</strong> {project.cup} {project.cig ? `- CIG: ${project.cig}` : ''}</p>
        <h2 className="text-center text-xl font-bold uppercase underline mt-8 mb-8">
          Verbale di visita di collaudo tecnico-amministrativo e statico in corso d'opera n. {doc.visitNumber}
        </h2>
      </div>

      {/* Main Data Table */}
      <table border={1} cellPadding={10} cellSpacing={0} width="100%" className="mb-10 border-collapse text-xs">
        <tr className="bg-slate-50">
          <td width="30%"><strong>Impresa Appaltatrice</strong></td>
          <td>{project.contractor.mainCompany.name}</td>
        </tr>
        <tr>
          <td><strong>Contratto d'Appalto</strong></td>
          <td>Rep. n. {project.contract.repNumber} del {project.contract.date}</td>
        </tr>
        <tr className="bg-slate-50">
          <td><strong>Importo Contrattuale</strong></td>
          <td>€ {formatEuro(project.contract.totalAmount)} (di cui € {formatEuro(project.contract.securityCosts)} per oneri sicurezza)</td>
        </tr>
        <tr>
          <td><strong>Scadenza Contrattuale</strong></td>
          <td>
            {project.contract.durationDays} giorni naturali e consecutivi, decorrenti dal {project.executionPhase.deliveryDate}, 
            data del verbale di consegna lavori, entro il {project.executionPhase.completionDate}
          </td>
        </tr>
        <tr className="bg-slate-50">
          <td><strong>R.U.P.</strong></td>
          <td>{getSubjectString('rup')}</td>
        </tr>
        <tr>
          <td><strong>Direttore dei Lavori</strong></td>
          <td>{getSubjectString('dl')}</td>
        </tr>
        <tr className="bg-slate-50">
          <td><strong>C.S.E.</strong></td>
          <td>{getSubjectString('cse')}</td>
        </tr>
      </table>

      {/* Narrative Section */}
      <div className="text-sm text-justify space-y-4">
        <p>
          Il giorno <strong>{formatFullDate(doc.date)}</strong>, alle ore <strong>{doc.time}</strong>, presso il luogo dei lavori in <strong>{project.location}</strong>, 
          ha avvio la <strong>{doc.visitNumber}ª</strong> visita di collaudo in corso d’opera convocata con nota via <strong>{doc.convocationMethod}</strong> del <strong>{doc.convocationDate}</strong> 
          {doc.convocationDetails ? ` (${doc.convocationDetails})` : ''}.
        </p>

        <p><strong>Sono presenti, oltre al sottoscritto Collaudatore {project.subjects.tester.contact.title} {project.subjects.tester.contact.name}:</strong></p>
        <div className="whitespace-pre-wrap italic ml-4 mb-8">{doc.attendees}</div>

        <p className="font-bold underline uppercase mb-4">PREMESSO CHE:</p>
        <ul className="list-disc ml-8 space-y-4">
          <li>con {project.subjects.testerAppointment.nominationType} del {project.subjects.testerAppointment.nominationAuthority} n. {project.subjects.testerAppointment.nominationNumber} del {project.subjects.testerAppointment.nominationDate} ed incarico rep. n. {project.subjects.testerAppointment.contractRepNumber}, il {project.entity} ha affidato allo scrivente {getSubjectString('tester')} l’incarico professionale di collaudo statico e tecnico-amministrativo in corso d’opera relativo all’intervento in oggetto.</li>
          {/* Altri punti storici generati dinamicamente */}
        </ul>

        <div className="mt-8">
           <p>{doc.worksIntroText || `Durante il presente sopralluogo prende atto che, nel periodo intercorrente tra la visita precedente e la data odierna, sono state effettuate le seguenti lavorazioni:`}</p>
           <ol className="list-decimal ml-8 mt-4">
              {doc.worksExecuted.map((w, i) => <li key={i} className="mb-1">{w}</li>)}
           </ol>
        </div>

        {doc.worksInProgress && (
          <div className="mt-6">
            <p>Al momento, sono in corso di esecuzione le opere relative a:</p>
            <ul className="list-disc ml-8 mt-2">
              {doc.worksInProgress.split('\n').map((l, i) => l.trim() && <li key={i}>{l}</li>)}
            </ul>
          </div>
        )}

        {doc.upcomingWorks && (
          <div className="mt-6">
            <p>Prossime attività previste:</p>
            <ul className="list-disc ml-8 mt-2">
              {doc.upcomingWorks.split('\n').map((l, i) => l.trim() && <li key={i}>{l}</li>)}
            </ul>
          </div>
        )}

        <div className="mt-10 border-t border-slate-200 pt-8">
          <p className="font-bold uppercase mb-4">Richieste ed Inviti:</p>
          <p>Dopo aver preso visione di tutte le aree di cantiere il Collaudatore:</p>
          <ul className="list-disc ml-8 space-y-2 mt-4">
            {doc.testerRequests && <li><strong>chiede ai presenti:</strong> {doc.testerRequests}</li>}
            {doc.testerInvitations && <li><strong>invita i presenti a:</strong> {doc.testerInvitations}</li>}
          </ul>
        </div>

        {doc.commonParts && (
          <div className="mt-8 italic text-slate-700">
            {doc.commonParts.split('\n').map((p, i) => <p key={i}>{p}</p>)}
          </div>
        )}

        <div className="mt-8 bg-slate-50 p-4 rounded border">
          <p className="font-bold uppercase text-xs mb-2">Valutazioni del Collaudatore:</p>
          <div className="whitespace-pre-wrap">{doc.observations || 'Nessuna osservazione particolare.'}</div>
        </div>
      </div>

      {/* Signatures Section - Left Aligned with Lines */}
      <div className="mt-20 space-y-12">
        <table border={0} cellPadding={0} cellSpacing={0} width="100%">
          <tr>
            <td width="50%">
              <p className="m-0 text-sm">Il Collaudatore:</p>
              <p className="m-0 text-sm mt-1">{getSubjectString('tester')}</p>
              <p className="mt-2">_______________________________________</p>
            </td>
          </tr>
          <tr>
            <td className="pt-8">
              <p className="m-0 text-sm">Il Responsabile Unico del Progetto:</p>
              <p className="m-0 text-sm mt-1">{getSubjectString('rup')}</p>
              <p className="mt-2">_______________________________________</p>
            </td>
          </tr>
          <tr>
            <td className="pt-8">
              <p className="m-0 text-sm">Il Direttore dei Lavori e CSE:</p>
              <p className="m-0 text-sm mt-1">{getSubjectString('dl')}</p>
              <p className="mt-2">_______________________________________</p>
            </td>
          </tr>
          <tr>
            <td className="pt-8">
              <p className="m-0 text-sm">Il rappresentante legale dell'impresa appaltatrice {project.contractor.mainCompany.name}:</p>
              <p className="m-0 text-sm mt-1">{project.contractor.mainCompany.repTitle || 'Sig.'} {project.contractor.mainCompany.repName}</p>
              <p className="mt-2">_______________________________________</p>
            </td>
          </tr>
        </table>
      </div>

      {/* Footer / Piè di pagina for Word */}
      <div id="f1" style={{ msoElement: 'footer' as any }} className="hidden">
        <table border={0} cellPadding={0} cellSpacing={0} width="100%" style={{ fontSize: '9pt', color: '#555', borderTop: '1px solid #ccc', paddingTop: '5pt' }}>
          <tr>
            <td align="left">
              Studio Tecnico {project.subjects.tester.contact.name} - {project.subjects.tester.contact.address}
            </td>
            <td align="right">
              PEC: {project.subjects.tester.contact.pec} | Email: {project.subjects.tester.contact.email}
            </td>
          </tr>
        </table>
      </div>

    </div>
  );
};
