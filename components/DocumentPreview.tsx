
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
  if (!project || !doc) return <div className="p-10 text-center">Dati insufficienti per generare l'anteprima.</div>;

  const tester = project.subjects.tester.contact;
  const rup = project.subjects.rup.contact;
  const dl = project.subjects.dl.contact;
  const cse = project.subjects.cse.contact;
  const contractor = project.contractor.mainCompany;

  const prevVerbali = [...allDocuments].filter(d => d.type === 'VERBALE_COLLAUDO' && d.visitNumber < doc.visitNumber).sort((a,b) => a.visitNumber - b.visitNumber);

  const renderSubjectHeader = (role: 'rup' | 'dl' | 'cse') => {
      const s = project.subjects[role];
      if (!s || !s.contact.name) return '...';
      if ('isLegalEntity' in s && (s as any).isLegalEntity) {
          const tech = (s as any).operatingDesigners?.[0];
          if (tech) return `${tech.title || ''} ${tech.name} per ${(s as any).contact.name}`;
          return `${(s as any).contact.repName} per ${(s as any).contact.name}`;
      }
      return `${s.contact.title || ''} ${s.contact.name}`.trim();
  };

  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-snug w-full max-w-[21cm] mx-auto animate-in fade-in">
      <div className="bg-white p-[1.8cm] min-h-[29.7cm] relative flex flex-col border shadow-xl print:shadow-none print:border-none">
        
        {/* INTESTAZIONE STABILE */}
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
                <tr><td style={{ fontSize: '9pt', fontFamily: 'monospace' }}>CUP: {project.cup}</td><td align="right" style={{ fontSize: '9pt', fontFamily: 'monospace' }}>CIG: {project.cig}</td></tr>
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

        {/* TABELLA DATI TECNICI */}
        <table style={{ width: '100%', border: '1pt solid black', borderCollapse: 'collapse', fontSize: '9.5pt', marginBottom: '20pt' }}>
            <tr style={{ borderBottom: '1pt solid black' }}><td style={{ padding: '4pt', borderRight: '1pt solid black', fontWeight: 'bold', width: '35%' }}>IMPRESA:</td><td style={{ padding: '4pt' }}>{contractor.name}</td></tr>
            <tr style={{ borderBottom: '1pt solid black' }}><td style={{ padding: '4pt', borderRight: '1pt solid black', fontWeight: 'bold' }}>CONTRATTO APPALTO:</td><td style={{ padding: '4pt' }}>Rep. n. {project.contract.repNumber} del {formatDate(project.contract.date)}</td></tr>
            <tr style={{ borderBottom: '1pt solid black' }}><td style={{ padding: '4pt', borderRight: '1pt solid black', fontWeight: 'bold' }}>IMPORTO CONTRATTUALE:</td><td style={{ padding: '4pt' }}>{formatCurrency(project.contract.totalAmount)} (di cui {formatCurrency(project.contract.securityCosts)} per oneri sicurezza) oltre IVA</td></tr>
            <tr style={{ borderBottom: '1pt solid black' }}><td style={{ padding: '4pt', borderRight: '1pt solid black', fontWeight: 'bold' }}>SCADENZA LAVORI:</td><td style={{ padding: '4pt' }}>Giorni {project.contract.durationDays} decorrenti dal {formatDate(project.executionPhase.deliveryDate)}, ultimazione entro il {formatDate(project.executionPhase.completionDate)}</td></tr>
            <tr style={{ borderBottom: '1pt solid black' }}><td style={{ padding: '4pt', borderRight: '1pt solid black', fontWeight: 'bold' }}>R.U.P.:</td><td style={{ padding: '4pt' }}>{renderSubjectHeader('rup')}</td></tr>
            <tr style={{ borderBottom: '1pt solid black' }}><td style={{ padding: '4pt', borderRight: '1pt solid black', fontWeight: 'bold' }}>DIRETTORE LAVORI:</td><td style={{ padding: '4pt' }}>{renderSubjectHeader('dl')}</td></tr>
            <tr><td style={{ padding: '4pt', borderRight: '1pt solid black', fontWeight: 'bold' }}>C.S.E.:</td><td style={{ padding: '4pt' }}>{renderSubjectHeader('cse')}</td></tr>
        </table>

        {/* CORPO DEL DOCUMENTO */}
        <div style={{ textAlign: 'justify', fontSize: '11pt', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '15pt' }}>
                Il giorno {doc.date ? new Date(doc.date).getDate() : '...'} del mese di {doc.date ? new Date(doc.date).toLocaleString('it-IT', { month: 'long' }) : '...'} dell'anno {doc.date ? new Date(doc.date).getFullYear() : '...'}, alle ore {doc.time}, presso il luogo dei lavori, ha avvio la visita di collaudo n. {doc.visitNumber} convocata con nota via {doc.convocationMethod} del {formatDate(doc.convocationDate)}.
            </p>
            <p style={{ fontWeight: 'bold' }}>Sono presenti, oltre al sottoscritto Collaudatore {tester.title} {tester.name}:</p>
            <div style={{ whiteSpace: 'pre-wrap', fontStyle: 'italic', marginLeft: '20pt', marginBottom: '20pt' }}>{doc.attendees}</div>

            <h3 style={{ fontSize: '10pt', fontWeight: 'bold', textTransform: 'uppercase' }}>PREMESSO CHE:</h3>
            <p>1. Con determina {project.subjects.testerAppointment.nominationAuthority} è stato affidato l'incarico di collaudo allo scrivente {tester.title} {tester.name}...</p>
            {doc.premis && <div style={{ whiteSpace: 'pre-wrap', marginTop: '10pt' }}>{doc.premis}</div>}

            <div style={{ marginTop: '20pt' }}>
                <p style={{ fontStyle: 'italic' }}>{doc.worksIntroText}</p>
                {doc.worksExecuted.length > 0 && (
                    <ul style={{ marginLeft: '30pt' }}>{doc.worksExecuted.map((w,i) => <li key={i}>{w}</li>)}</ul>
                )}
            </div>
            {doc.observations && <div style={{ marginTop: '20pt', fontStyle: 'italic', borderLeft: '2pt solid black', paddingLeft: '10pt' }}>{doc.observations}</div>}
        </div>

        {/* FIRME ALLINEATE A SINISTRA */}
        <div style={{ marginTop: '60pt' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tr>
                    <td>
                        <div style={{ marginBottom: '30pt' }}>Il Collaudatore: {tester.title} {tester.name} ________________________________</div>
                        <div style={{ marginBottom: '30pt' }}>Il Responsabile Unico del Progetto: {renderSubjectHeader('rup')} ________________________________</div>
                        <div style={{ marginBottom: '30pt' }}>il Direttore dei Lavori e CSE: {renderSubjectHeader('dl')} ________________________________</div>
                        <div>Il rappresentante legale dell'impresa {contractor.name}:<br/>{contractor.repTitle || 'Sig.'} {contractor.repName} ________________________________</div>
                    </td>
                </tr>
            </table>
        </div>

        <div id="f1" style={{ display: 'none' }}>
           <p style={{ fontSize: '8pt', textAlign: 'center', borderTop: '0.5pt solid black', paddingTop: '5pt' }}>
              {tester.title} {tester.name} - {tester.address} - Email: {tester.email} - PEC: {tester.pec}
           </p>
        </div>
      </div>
    </div>
  );
};
