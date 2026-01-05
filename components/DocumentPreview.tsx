
import React from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';

interface DocumentPreviewProps {
    project: ProjectConstants;
    doc: DocumentVariables;
    type: DocumentType;
    allDocuments: DocumentVariables[];
}

const formatDate = (d?: string) => {
  if (!d) return '...';
  return new Date(d).toLocaleDateString('it-IT');
};

const formatCurrency = (val: string) => {
  const n = parseFloat(val.replace(/[^0-9.,]/g, '').replace(',', '.'));
  if (isNaN(n)) return val;
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);
};

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ project, doc }) => {
  if (!project || !doc) return <div className="p-10 text-center text-slate-400">Dati insufficienti.</div>;

  const tester = project.subjects.tester.contact;
  const rup = project.subjects.rup.contact;
  const dl = project.subjects.dl.contact;
  const cse = project.subjects.cse.contact;
  const contractor = project.contractor.mainCompany;

  const renderFirma = (role: string, title?: string, name?: string) => (
    <div className="no-break mb-8 text-left">
      <p className="text-[10pt] uppercase tracking-tighter mb-12">Il {role}: {title} {name} ________________________________</p>
    </div>
  );

  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-snug w-full max-w-[21cm] mx-auto animate-in fade-in">
      <div className="bg-white p-[1.8cm] min-h-[29.7cm] relative flex flex-col border shadow-xl print:shadow-none print:border-none">
        
        {/* INTESTAZIONE */}
        <div className="text-center mb-10 border-b-2 border-black pb-4">
          {project.headerLogo && <img src={project.headerLogo} style={{ maxHeight: '2.5cm', margin: '0 auto 10px' }} alt="Logo" />}
          <h1 className="font-bold text-xl uppercase leading-tight whitespace-pre-wrap">{project.entity}</h1>
          {project.entityProvince && <p className="text-sm font-bold italic">Provincia di {project.entityProvince}</p>}
          <div className="mt-4 text-[10pt] font-bold text-justify uppercase border-t border-black pt-2">
            LAVORI DI: {project.projectName}
          </div>
          <div className="flex justify-between text-[9pt] font-mono mt-1">
            <span>CUP: {project.cup}</span>
            <span>CIG: {project.cig}</span>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold underline uppercase tracking-tight">VERBALE DI VISITA DI COLLAUDO N. {doc.visitNumber}</h2>
            <p className="text-[12pt] mt-2 font-bold italic">SVOLTO IN DATA {formatDate(doc.date)}</p>
          </div>

          {/* TABELLA DATI APPALTO */}
          <div className="border-[1.5pt] border-black text-[9pt] overflow-hidden">
            <table className="w-full border-collapse">
              <tbody className="divide-y divide-black">
                <tr><td className="p-2 border-r border-black font-bold w-1/3">IMPRESA:</td><td className="p-2 uppercase">{contractor.name}</td></tr>
                <tr><td className="p-2 border-r border-black font-bold">CONTRATTO APPALTO:</td><td className="p-2">Rep. n. {project.contract.repNumber} del {formatDate(project.contract.date)}</td></tr>
                <tr><td className="p-2 border-r border-black font-bold">IMPORTO CONTRATTUALE:</td><td className="p-2 font-bold">{formatCurrency(project.contract.totalAmount)} (di cui {formatCurrency(project.contract.securityCosts)} per sicurezza)</td></tr>
                <tr><td className="p-2 border-r border-black font-bold">SCADENZA LAVORI:</td><td className="p-2 text-justify">Giorni {project.contract.durationDays} naturali e consecutivi, decorrenti dal {formatDate(project.executionPhase.deliveryDate)}, data verbale consegna lavori, con ultimazione entro il {formatDate(project.executionPhase.completionDate)}</td></tr>
                <tr><td className="p-2 border-r border-black font-bold">R.U.P.:</td><td className="p-2 uppercase">{rup.title} {rup.name}</td></tr>
                <tr><td className="p-2 border-r border-black font-bold">DIRETTORE LAVORI:</td><td className="p-2 uppercase">{dl.title} {dl.name}</td></tr>
                <tr><td className="p-2 border-r border-black font-bold">C.S.E.:</td><td className="p-2 uppercase">{cse.title} {cse.name}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="text-justify text-[11pt] leading-relaxed">
            <p className="mb-4">
              Il giorno {new Date(doc.date).getDate()} del mese di {new Date(doc.date).toLocaleString('it-IT', { month: 'long' })} dell'anno {new Date(doc.date).getFullYear()}, alle ore {doc.time}, presso il luogo dei lavori in {project.location || project.entity}, ha avvio la visita di collaudo n. {doc.visitNumber} convocata con nota {doc.convocationMethod} del {doc.convocationDetails || formatDate(doc.date)}.
            </p>
            <p className="font-bold mb-4">Sono presenti, oltre al sottoscritto Collaudatore {tester.title} {tester.name}:</p>
            <div className="whitespace-pre-wrap pl-4 italic mb-6 text-[10.5pt]">{doc.attendees}</div>

            <div className="space-y-6">
              <div className="border-t border-black pt-4">
                <h3 className="font-bold uppercase text-xs mb-2">PREMESSO CHE:</h3>
                <div className="whitespace-pre-wrap">{doc.premis}</div>
              </div>

              <div>
                <p className="mb-4 italic">{doc.worksIntroText}</p>
                {doc.worksExecuted && doc.worksExecuted.length > 0 && (
                  <ul className="list-disc pl-8 space-y-1 mb-4">
                    {doc.worksExecuted.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                )}
                {doc.worksInProgress && (
                  <div className="mb-4">
                    <p className="font-bold">Al momento, sono in corso di esecuzione le opere relative a:</p>
                    <p className="pl-4 italic">{doc.worksInProgress}</p>
                  </div>
                )}
                {doc.upcomingWorks && (
                  <div className="mb-4">
                    <p className="font-bold">Prossime attività previste:</p>
                    <p className="pl-4 italic">{doc.upcomingWorks}</p>
                  </div>
                )}
              </div>

              {doc.testerRequests && (
                <div>
                  <p className="font-bold mb-1">Dopo aver preso visione di tutte le aree di canti il Collaudatore:</p>
                  <p className="font-bold underline text-xs">chiede ai presenti, ciascuno nell’ambito della propria competenza e responsabilità:</p>
                  <p className="pl-4 italic">{doc.testerRequests}</p>
                </div>
              )}

              {doc.testerInvitations && (
                <div className="mt-4">
                  <p className="font-bold underline text-xs">invita i presenti, ciascuno nell’ambito della propria competenza e responsabilità, a:</p>
                  <p className="pl-4 italic">{doc.testerInvitations}</p>
                </div>
              )}

              {doc.commonParts && <div className="mt-4 italic">{doc.commonParts}</div>}
              {doc.observations && <div className="mt-4 border-l-2 border-black pl-4 py-2 bg-slate-50 italic">{doc.observations}</div>}
            </div>
          </div>

          <div className="mt-20 space-y-4">
            {renderFirma('Collaudatore', tester.title, tester.name)}
            {renderFirma('Responsabile Unico del Progetto', rup.title, rup.name)}
            {renderFirma('Direttore dei Lavori e CSE', dl.title, dl.name)}
            <div className="no-break mb-8 text-left">
              <p className="text-[10pt] uppercase tracking-tighter">Il rappresentante legale dell'impresa appaltatrice {contractor.name}:</p>
              <p className="text-[10pt] uppercase tracking-tighter mt-12">Sig. {contractor.repName} ________________________________</p>
            </div>
          </div>
        </div>

        {/* FOOTER NATIVO PER WORD */}
        <div id="f1" style={{ display: 'none' }} className="mso-footer">
          <p className="text-[8pt] text-center italic" style={{ borderTop: '0.5pt solid black', paddingTop: '5pt' }}>
            {tester.title} {tester.name} - {tester.address} - Email: {tester.email} - PEC: {tester.pec}
          </p>
        </div>
        
        {/* FOOTER VISIBILE WEB */}
        <div className="mt-12 pt-4 border-t border-slate-200 text-[8pt] text-slate-400 italic text-center no-print">
          {tester.title} {tester.name} | {tester.address} | Email: {tester.email} | PEC: {tester.pec}
        </div>
      </div>
    </div>
  );
};
