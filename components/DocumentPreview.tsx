
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

const formatCurrency = (val: any) => {
  if (val === null || val === undefined || val === '') return '0,00 €';
  const strVal = String(val);
  const n = parseFloat(strVal.replace(/[^0-9.,]/g, '').replace(',', '.'));
  if (isNaN(n)) return strVal;
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);
};

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ project, doc }) => {
  if (!project || !doc) return <div className="p-10 text-center text-red-500 font-bold">Inizializzazione dati...</div>;

  const tester = project.subjects.tester.contact;
  const contractor = project.contractor.mainCompany;

  const renderSubjectHeader = (role: 'rup' | 'dl' | 'cse') => {
      const s = project.subjects[role];
      if (!s || !s.contact.name) return '...';
      const title = s.contact.title ? s.contact.title + ' ' : '';
      return title + s.contact.name;
  };

  const typeLabel = doc.type ? String(doc.type).replace(/_/g, ' ') : 'DOCUMENTO';

  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-snug w-full max-w-[21cm] mx-auto bg-white">
      <div className="p-[1.8cm] min-h-[29.7cm] flex flex-col border-none">
        
        <table style={{ width: '100%', marginBottom: '20pt' }}>
            <tbody>
                <tr>
                    <td align="center">
                        {project.headerLogo && <img src={project.headerLogo} style={{ maxHeight: '2cm', marginBottom: '10pt' }} alt="Logo" />}
                        <h1 style={{ margin: '0', fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase' }}>{project.entity}</h1>
                        {project.entityProvince && <p style={{ margin: '0', fontSize: '10pt' }}>({project.entityProvince})</p>}
                    </td>
                </tr>
            </tbody>
        </table>

        <div style={{ borderTop: '1pt solid black', paddingTop: '10pt', marginBottom: '20pt' }}>
            <p style={{ fontSize: '9pt', margin: '0 0 10pt 0' }}>CUP: {project.cup || 'N.D.'} - CIG: {project.cig || 'N.D.'}</p>
            <div style={{ textAlign: 'justify', fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                OGGETTO: <span style={{ whiteSpace: 'pre-wrap', fontWeight: 'normal' }}>{project.projectName || '...'}</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: '30pt' }}>
                <h2 style={{ fontSize: '14pt', fontWeight: 'bold', textDecoration: 'underline', textTransform: 'uppercase' }}>{typeLabel} N. {doc.visitNumber}</h2>
            </div>
        </div>

        <table style={{ width: '100%', border: '0.5pt solid black', borderCollapse: 'collapse', fontSize: '10pt', marginBottom: '25pt' }}>
            <tbody>
                <tr><td style={{ border: '0.5pt solid black', padding: '6pt', fontWeight: 'bold', width: '30%' }}>Impresa Esecutrice:</td><td style={{ border: '0.5pt solid black', padding: '6pt' }}>{contractor.name || '...'}</td></tr>
                <tr><td style={{ border: '0.5pt solid black', padding: '6pt', fontWeight: 'bold' }}>Contratto d'appalto:</td><td style={{ border: '0.5pt solid black', padding: '6pt' }}>Rep. n. {project.contract.repNumber || '...'} del {formatDate(project.contract.date)}</td></tr>
                <tr><td style={{ border: '0.5pt solid black', padding: '6pt', fontWeight: 'bold' }}>Importo Contrattuale:</td><td style={{ border: '0.5pt solid black', padding: '6pt' }}>{formatCurrency(project.contract.totalAmount)} (di cui {formatCurrency(project.contract.securityCosts)} per oneri sicurezza) oltre IVA</td></tr>
                <tr><td style={{ border: '0.5pt solid black', padding: '6pt', fontWeight: 'bold' }}>R.U.P.:</td><td style={{ border: '0.5pt solid black', padding: '6pt' }}>{renderSubjectHeader('rup')}</td></tr>
                <tr><td style={{ border: '0.5pt solid black', padding: '6pt', fontWeight: 'bold' }}>Direzione Lavori:</td><td style={{ border: '0.5pt solid black', padding: '6pt' }}>{renderSubjectHeader('dl')}</td></tr>
                <tr><td style={{ border: '0.5pt solid black', padding: '6pt', fontWeight: 'bold' }}>C.S.E.:</td><td style={{ border: '0.5pt solid black', padding: '6pt' }}>{renderSubjectHeader('cse')}</td></tr>
            </tbody>
        </table>

        <div style={{ textAlign: 'justify', fontSize: '11pt', lineHeight: '1.6' }}>
            <p style={{ margin: '0 0 10pt 0' }}>{doc.worksIntroText}</p>
            {doc.worksExecuted.length > 0 && (
                <ul style={{ marginLeft: '25pt', marginBottom: '15pt' }}>
                    {doc.worksExecuted.map((w,i) => <li key={i} style={{ marginBottom: '4pt' }}>{w}</li>)}
                </ul>
            )}
            
            {doc.testerRequests && (
                <div style={{ marginTop: '20pt' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '5pt' }}>Il Collaudatore chiede ai presenti:</p>
                    <div style={{ whiteSpace: 'pre-wrap', paddingLeft: '15pt' }}>{doc.testerRequests}</div>
                </div>
            )}
            
            {doc.testerInvitations && (
                <div style={{ marginTop: '20pt' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '5pt' }}>Il Collaudatore invita i presenti a:</p>
                    <div style={{ whiteSpace: 'pre-wrap', paddingLeft: '15pt' }}>{doc.testerInvitations}</div>
                </div>
            )}
            
            {doc.commonParts && <div style={{ marginTop: '20pt', whiteSpace: 'pre-wrap' }}>{doc.commonParts}</div>}
            
            {doc.observations && (
                <div style={{ marginTop: '25pt' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '5pt' }}>Osservazioni e valutazioni:</p>
                    <div style={{ whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>{doc.observations}</div>
                </div>
            )}
        </div>

        <div style={{ marginTop: '80pt', pageBreakInside: 'avoid' }}>
            <div style={{ marginBottom: '25pt' }}>Il Collaudatore: {tester.title || 'Arch.'} {tester.name || '...'} <br/> ____________________________________________________</div>
            <div style={{ marginBottom: '25pt' }}>Il Responsabile Unico del Progetto: {renderSubjectHeader('rup')} <br/> ____________________________________________________</div>
            <div style={{ marginBottom: '25pt' }}>il Direttore dei Lavori e CSE: {renderSubjectHeader('dl')} <br/> ____________________________________________________</div>
            <div>Il rappresentante legale dell'impresa {contractor.name || '...'}:<br/>{contractor.repTitle || 'Sig.'} {contractor.repName || '...'} <br/> ____________________________________________________</div>
        </div>
      </div>
    </div>
  );
};
