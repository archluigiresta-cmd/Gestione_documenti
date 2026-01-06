
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

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ project, doc }) => {
  if (!project || !doc) return <div className="p-10 text-center text-red-500 font-bold">Dati mancanti per l'anteprima.</div>;

  const tester = project.subjects.tester.contact;
  const contractor = project.contractor.mainCompany;

  const renderSubjectHeader = (role: 'rup' | 'dl' | 'cse') => {
      const s = project.subjects[role];
      if (!s || !s.contact.name) return '...';
      const title = s.contact.title ? s.contact.title + ' ' : '';
      return title + s.contact.name;
  };

  const typeLabel = doc.type ? doc.type.replace(/_/g, ' ') : 'DOCUMENTO';

  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-snug w-full max-w-[21cm] mx-auto">
      <div className="bg-white p-[1.8cm] min-h-[29.7cm] flex flex-col border shadow-xl">
        
        <table style={{ width: '100%', marginBottom: '20pt' }}>
            <tr>
                <td align="center">
                    {project.headerLogo && <img src={project.headerLogo} style={{ maxHeight: '2cm', marginBottom: '10pt' }} alt="Logo" />}
                    <h1 style={{ margin: '0', fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase' }}>{project.entity}</h1>
                    {project.entityProvince && <p style={{ margin: '0', fontSize: '10pt' }}>({project.entityProvince})</p>}
                </td>
            </tr>
        </table>

        <div style={{ borderTop: '1pt solid black', paddingTop: '10pt', marginBottom: '20pt' }}>
            <p style={{ fontSize: '9pt', margin: '0 0 10pt 0' }}>CUP: {project.cup} - CIG: {project.cig}</p>
            <div style={{ textAlign: 'justify', fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                OGGETTO: <span style={{ whiteSpace: 'pre-wrap', fontWeight: 'normal' }}>{project.projectName}</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: '20pt' }}>
                <h2 style={{ fontSize: '14pt', fontWeight: 'bold', textDecoration: 'underline' }}>{typeLabel} N. {doc.visitNumber}</h2>
            </div>
        </div>

        <table style={{ width: '100%', border: '0.5pt solid black', borderCollapse: 'collapse', fontSize: '10pt', marginBottom: '20pt' }}>
            <tr><td style={{ border: '0.5pt solid black', padding: '4pt', fontWeight: 'bold', width: '30%' }}>Impresa:</td><td style={{ border: '0.5pt solid black', padding: '4pt' }}>{contractor.name}</td></tr>
            <tr><td style={{ border: '0.5pt solid black', padding: '4pt', fontWeight: 'bold' }}>Contratto d'appalto:</td><td style={{ border: '0.5pt solid black', padding: '4pt' }}>Rep. n. {project.contract.repNumber} del {formatDate(project.contract.date)}</td></tr>
            <tr><td style={{ border: '0.5pt solid black', padding: '4pt', fontWeight: 'bold' }}>Importo Contrattuale:</td><td style={{ border: '0.5pt solid black', padding: '4pt' }}>{formatCurrency(project.contract.totalAmount)} (di cui {formatCurrency(project.contract.securityCosts)} per oneri sicurezza) oltre IVA</td></tr>
            <tr><td style={{ border: '0.5pt solid black', padding: '4pt', fontWeight: 'bold' }}>Scadenza lavori:</td><td style={{ border: '0.5pt solid black', padding: '4pt' }}>giorni {project.contract.durationDays} decorrenti dal {formatDate(project.executionPhase.deliveryDate)}, ultimazione entro il {formatDate(project.executionPhase.completionDate)}</td></tr>
            <tr><td style={{ border: '0.5pt solid black', padding: '4pt', fontWeight: 'bold' }}>R.U.P.:</td><td style={{ border: '0.5pt solid black', padding: '4pt' }}>{renderSubjectHeader('rup')}</td></tr>
            <tr><td style={{ border: '0.5pt solid black', padding: '4pt', fontWeight: 'bold' }}>Direttore dei Lavori:</td><td style={{ border: '0.5pt solid black', padding: '4pt' }}>{renderSubjectHeader('dl')}</td></tr>
            <tr><td style={{ border: '0.5pt solid black', padding: '4pt', fontWeight: 'bold' }}>CSE:</td><td style={{ border: '0.5pt solid black', padding: '4pt' }}>{renderSubjectHeader('cse')}</td></tr>
        </table>

        <div style={{ textAlign: 'justify', fontSize: '11pt', lineHeight: '1.5' }}>
            <p>{doc.worksIntroText}</p>
            {doc.worksExecuted.length > 0 && (
                <ul style={{ marginLeft: '20pt' }}>{doc.worksExecuted.map((w,i) => <li key={i}>{w}</li>)}</ul>
            )}
            
            {doc.testerRequests && <div style={{ marginTop: '15pt' }}><p style={{ fontWeight: 'bold' }}>Il Collaudatore chiede ai presenti:</p><div style={{ whiteSpace: 'pre-wrap' }}>{doc.testerRequests}</div></div>}
            {doc.testerInvitations && <div style={{ marginTop: '15pt' }}><p style={{ fontWeight: 'bold' }}>Il Collaudatore invita i presenti a:</p><div style={{ whiteSpace: 'pre-wrap' }}>{doc.testerInvitations}</div></div>}
            {doc.commonParts && <div style={{ marginTop: '15pt', whiteSpace: 'pre-wrap' }}>{doc.commonParts}</div>}
            {doc.observations && <div style={{ marginTop: '15pt', fontStyle: 'italic' }}>{doc.observations}</div>}
        </div>

        <div style={{ marginTop: '60pt' }}>
            <table style={{ width: '100%' }}>
                <tr>
                    <td>
                        <div style={{ marginBottom: '20pt' }}>Il Collaudatore: {tester.title} {tester.name} ________________________________</div>
                        <div style={{ marginBottom: '20pt' }}>Il Responsabile Unico del Progetto: {renderSubjectHeader('rup')} ________________________________</div>
                        <div style={{ marginBottom: '20pt' }}>il Direttore dei Lavori e CSE: {renderSubjectHeader('dl')} ________________________________</div>
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
