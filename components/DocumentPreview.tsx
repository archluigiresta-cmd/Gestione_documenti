
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
  try { return new Date(d).toLocaleDateString('it-IT'); } catch { return d; }
};

const formatCurrency = (val: string) => {
  if (!val) return '0,00 €';
  const n = parseFloat(val.replace(/[^0-9.,]/g, '').replace(',', '.'));
  if (isNaN(n)) return val;
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);
};

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ project, doc, allDocuments }) => {
  if (!project || !doc) return <div className="p-10 text-center">Dati insufficienti.</div>;

  const tester = project.subjects.tester.contact;
  const rup = project.subjects.rup.contact;
  const dl = project.subjects.dl.contact;
  const cse = project.subjects.cse.contact;
  const contractor = project.contractor.mainCompany;

  const prevVerbali = [...allDocuments].filter(d => d.type === 'VERBALE_COLLAUDO' && d.visitNumber < doc.visitNumber).sort((a,b) => a.visitNumber - b.visitNumber);

  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-snug w-full max-w-[21cm] mx-auto animate-in fade-in">
      <div className="bg-white p-[1.8cm] min-h-[29.7cm] relative flex flex-col border shadow-xl print:shadow-none print:border-none">
        
        {/* INTESTAZIONE STABILE PER WORD */}
        <table style={{ width: '100%', marginBottom: '20pt', borderCollapse: 'collapse' }}>
            <tr>
                <td align="center">
                    {project.headerLogo && <img src={project.headerLogo} style={{ maxHeight: '2.5cm', maxWidth: '8cm', marginBottom: '10pt' }} alt="Logo" />}
                    <h1 style={{ margin: '0', fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase' }}>{project.entity}</h1>
                    {project.entityProvince && <p style={{ margin: '2pt 0', fontSize: '10pt', fontStyle: 'italic', fontWeight: 'bold' }}>Provincia di {project.entityProvince}</p>}
                </td>
            </tr>
        </table>

        <div style={{ borderTop: '1.5pt solid black', paddingTop: '10pt', marginBottom: '20pt' }}>
            <table style={{ width: '100%', marginBottom: '5pt' }}>
                <tr>
                    <td style={{ fontSize: '9pt', fontFamily: 'monospace' }}>CUP: {project.cup}</td>
                    <td align="right" style={{ fontSize: '9pt', fontFamily: 'monospace' }}>CIG: {project.cig}</td>
                </tr>
            </table>
            <div style={{ textAlign: 'justify', fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', lineHeight: '1.4' }}>
                LAVORI DI: <span style={{ whiteSpace: 'pre-wrap', fontWeight: 'normal' }}>{project.projectName}</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: '20pt' }}>
                <h2 style={{ fontSize: '16pt', fontWeight: 'bold', textDecoration: 'underline', textTransform: 'uppercase' }}>
                    {doc.type === 'VERBALE_COLLAUDO' ? `VERBALE DI VISITA DI COLLAUDO N. ${doc.visitNumber}` : doc.type.replace(/_/g, ' ')}
                </h2>
                <p style={{ fontSize: '12pt', fontWeight: 'bold', fontStyle: 'italic' }}>SVOLTO IN DATA {formatDate(doc.date)}</p>
            </div>
        </div>

        {/* TABELLA DATI APPALTO */}
        <table style={{ width: '100%', border: '1.5pt solid black', borderCollapse: 'collapse', fontSize: '9.5pt', marginBottom: '20pt' }}>
            <tr style={{ borderBottom: '1pt solid black' }}><td style={{ padding: '4pt', borderRight: '1pt solid black', fontWeight: 'bold', width: '35%' }}>IMPRESA:</td><td style={{ padding: '4pt', textTransform: 'uppercase' }}>{contractor.name}</td></tr>
            <tr style={{ borderBottom: '1pt solid black' }}><td style={{ padding: '4pt', borderRight: '1pt solid black', fontWeight: 'bold' }}>CONTRATTO APPALTO:</td><td style={{ padding: '4pt' }}>Rep. n. {project.contract.repNumber} del {formatDate(project.contract.date)}</td></tr>
            <tr style={{ borderBottom: '1pt solid black' }}><td style={{ padding: '4pt', borderRight: '1pt solid black', fontWeight: 'bold' }}>IMPORTO CONTRATTUALE:</td><td style={{ padding: '4pt' }}>{formatCurrency(project.contract.totalAmount)} (di cui {formatCurrency(project.contract.securityCosts)} per oneri sicurezza) oltre IVA</td></tr>
            <tr style={{ borderBottom: '1pt solid black' }}><td style={{ padding: '4pt', borderRight: '1pt solid black', fontWeight: 'bold' }}>SCADENZA LAVORI:</td><td style={{ padding: '4pt', textAlign: 'justify' }}>Giorni {project.contract.durationDays} naturali e consecutivi, decorrenti dal {formatDate(project.executionPhase.deliveryDate)}, data del verbale di consegna lavori, con ultimazione entro il {formatDate(project.executionPhase.completionDate)}</td></tr>
            <tr style={{ borderBottom: '1pt solid black' }}><td style={{ padding: '4pt', borderRight: '1pt solid black', fontWeight: 'bold' }}>R.U.P.:</td><td style={{ padding: '4pt' }}>{rup.title} {rup.name}</td></tr>
            <tr style={{ borderBottom: '1pt solid black' }}><td style={{ padding: '4pt', borderRight: '1pt solid black', fontWeight: 'bold' }}>DIRETTORE LAVORI:</td><td style={{ padding: '4pt' }}>{dl.title} {dl.name}</td></tr>
            <tr><td style={{ padding: '4pt', borderRight: '1pt solid black', fontWeight: 'bold' }}>C.S.E.:</td><td style={{ padding: '4pt' }}>{cse.title} {cse.name}</td></tr>
        </table>

        {/* CORPO DEL VERBALE */}
        <div style={{ textAlign: 'justify', fontSize: '11pt', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '15pt' }}>
                Il giorno {doc.date ? new Date(doc.date).getDate() : '...'} del mese di {doc.date ? new Date(doc.date).toLocaleString('it-IT', { month: 'long' }) : '...'} dell'anno {doc.date ? new Date(doc.date).getFullYear() : '...'}, alle ore {doc.time}, presso il luogo dei lavori in {project.location || project.entity}, ha avvio la visita di collaudo n. {doc.visitNumber} convocata con nota via {doc.convocationMethod} del {formatDate(doc.convocationDate)}.
            </p>
            
            <p style={{ fontWeight: 'bold', marginBottom: '10pt' }}>Sono presenti, oltre al sottoscritto Collaudatore {tester.title} {tester.name}:</p>
            <div style={{ paddingLeft: '20pt', fontStyle: 'italic', whiteSpace: 'pre-wrap', marginBottom: '20pt' }}>{doc.attendees}</div>

            <div style={{ borderTop: '1pt solid black', paddingTop: '10pt' }}>
                <h3 style={{ fontSize: '10pt', fontWeight: 'bold', textTransform: 'uppercase' }}>PREMESSO CHE:</h3>
                <div style={{ fontSize: '10.5pt' }}>
                    <p style={{ marginBottom: '8pt' }}>
                        1. con Determina {project.subjects.testerAppointment.nominationAuthority} n. {project.subjects.tester.appointment.number} del {formatDate(project.subjects.tester.appointment.date)} e successivo contratto rep. n. {project.subjects.testerAppointment.contractRepNumber} del {formatDate(project.subjects.testerAppointment.contractDate)}, prot. n. {project.subjects.testerAppointment.contractProtocol}, l'Ente {project.entity} ha affidato allo scrivente {tester.title} {tester.name}, iscritto all'Albo degli Architetti della Provincia di {tester.professionalOrder} al n. {tester.registrationNumber}, l'incarico di collaudo dell'intervento di {project.projectName} CUP: {project.cup};
                    </p>
                    {prevVerbali.map((v, i) => (
                        <p key={v.id} style={{ marginBottom: '8pt' }}>
                            {i + 2}. in data {formatDate(v.date)}, con verbale di visita n. {v.visitNumber}, lo scrivente ha preso atto dell'andamento dei lavori eseguiti fino a quella data, così come dettagliati dal Direttore dei Lavori e consistenti in: {v.worksExecuted.join(', ') || 'N.D.'}. Era in corso il {v.worksInProgress || 'N.D.'};
                        </p>
                    ))}
                    {doc.premis && <div style={{ whiteSpace: 'pre-wrap' }}>{doc.premis}</div>}
                </div>
            </div>

            <div style={{ marginTop: '20pt' }}>
                <p style={{ fontStyle: 'italic', marginBottom: '10pt' }}>{doc.worksIntroText}</p>
                {doc.worksExecuted && doc.worksExecuted.length > 0 && (
                    <ul style={{ paddingLeft: '30pt', marginBottom: '10pt' }}>
                        {doc.worksExecuted.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                )}
                {doc.worksInProgress && <p>Al momento, sono in corso le opere relative a: <span style={{ fontStyle: 'italic' }}>{doc.worksInProgress}</span></p>}
                {doc.upcomingWorks && <p>Prossime attività previste: <span style={{ fontStyle: 'italic' }}>{doc.upcomingWorks}</span></p>}
            </div>

            <div style={{ marginTop: '20pt' }}>
                <p style={{ fontWeight: 'bold' }}>Dopo aver preso visione di tutte le aree di cantiere il Collaudatore:</p>
                <p style={{ textDecoration: 'underline' }}>chiede ai presenti, ciascuno nell’ambito della propria competenza e responsabilità:</p>
                <div style={{ paddingLeft: '20pt', fontStyle: 'italic', marginBottom: '10pt' }}>{doc.testerRequests}</div>
                <p style={{ textDecoration: 'underline' }}>invita i presenti, ciascuno nell’ambito della propria competenza e responsabilità, a:</p>
                <div style={{ paddingLeft: '20pt', fontStyle: 'italic', marginBottom: '10pt' }}>{doc.testerInvitations}</div>
            </div>

            <div style={{ marginTop: '10pt', fontStyle: 'italic' }}>{doc.commonParts}</div>
            {doc.observations && <div style={{ marginTop: '15pt', borderLeft: '3pt solid black', paddingLeft: '10pt', fontStyle: 'italic' }}>{doc.observations}</div>}
        </div>

        {/* AREA FIRME STABILE */}
        <div style={{ marginTop: '50pt' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tr>
                    <td style={{ width: '10%' }}></td>
                    <td style={{ width: '90%' }}>
                        <div style={{ marginBottom: '30pt' }}>Il Collaudatore: {tester.title} {tester.name} ________________________________</div>
                        <div style={{ marginBottom: '30pt' }}>Il Responsabile Unico del Progetto: {rup.title} {rup.name} ________________________________</div>
                        <div style={{ marginBottom: '30pt' }}>il Direttore dei Lavori e CSE: {dl.title} {dl.name} ________________________________</div>
                        <div>Il rappresentante legale dell'impresa appaltatrice {contractor.name}:<br/>Sig. {contractor.repName} ________________________________</div>
                    </td>
                </tr>
            </table>
        </div>

        {/* FOOTER PER WORD */}
        <div id="f1" style={{ display: 'none' }}>
          <p style={{ textAlign: 'center', fontSize: '8pt', fontStyle: 'italic', borderTop: '0.5pt solid black', paddingTop: '5pt' }}>
            {tester.title} {tester.name} - {tester.address} - Email: {tester.email} - PEC: {tester.pec}
          </p>
        </div>
      </div>
    </div>
  );
};
