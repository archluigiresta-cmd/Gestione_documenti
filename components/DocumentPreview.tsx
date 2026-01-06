
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
  if (!project || !doc) return <div className="p-10 text-center text-red-500 font-bold">Inizializzazione dati per stampa...</div>;

  const tester = project.subjects.tester.contact;
  const contractor = project.contractor.mainCompany;

  const renderSubjectHeader = (role: 'rup' | 'dl' | 'cse') => {
      const s = project.subjects[role];
      if (!s || !s.contact.name) return '...';
      const title = s.contact.title ? s.contact.title + ' ' : '';
      return title + s.contact.name;
  };

  // Nomenclatura pedissequa
  const typeLabel = doc.type === 'VERBALE_COLLAUDO' ? 'VERBALE DI VISITA DI COLLAUDO' : String(doc.type).replace(/_/g, ' ');

  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-snug w-full max-w-[21cm] mx-auto bg-white">
      <div className="p-[1.8cm] min-h-[29.7cm] flex flex-col border-none">
        
        <table style={{ width: '100%', marginBottom: '20pt' }}>
            <tbody>
                <tr>
                    <td align="center">
                        {project.headerLogo && <img src={project.headerLogo} style={{ maxHeight: '2.5cm', marginBottom: '10pt' }} alt="Logo" />}
                        <h1 style={{ margin: '0', fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase' }}>{project.entity}</h1>
                        {project.entityProvince && <p style={{ margin: '0', fontSize: '11pt' }}>({project.entityProvince})</p>}
                    </td>
                </tr>
            </tbody>
        </table>

        <div style={{ borderTop: '1.5pt solid black', paddingTop: '10pt', marginBottom: '25pt' }}>
            <p style={{ fontSize: '10pt', margin: '0 0 12pt 0', fontWeight: 'bold' }}>CUP: {project.cup || 'N.D.'} - CIG: {project.cig || 'N.D.'}</p>
            <div style={{ textAlign: 'justify', fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', lineHeight: '1.4' }}>
                OGGETTO: <span style={{ whiteSpace: 'pre-wrap', fontWeight: 'normal' }}>{project.projectName || '...'}</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: '35pt' }}>
                <h2 style={{ fontSize: '15pt', fontWeight: 'bold', textDecoration: 'underline', textTransform: 'uppercase' }}>{typeLabel} N. {doc.visitNumber}</h2>
            </div>
        </div>

        <table style={{ width: '100%', border: '1pt solid black', borderCollapse: 'collapse', fontSize: '11pt', marginBottom: '30pt' }}>
            <tbody>
                <tr><td style={{ border: '1pt solid black', padding: '8pt', fontWeight: 'bold', width: '35%', backgroundColor: '#f9fafb' }}>Impresa Esecutrice:</td><td style={{ border: '1pt solid black', padding: '8pt' }}>{contractor.name || '...'}</td></tr>
                <tr><td style={{ border: '1pt solid black', padding: '8pt', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Contratto d'appalto:</td><td style={{ border: '1pt solid black', padding: '8pt' }}>Rep. n. {project.contract.repNumber || '...'} del {formatDate(project.contract.date)}</td></tr>
                <tr><td style={{ border: '1pt solid black', padding: '8pt', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Importo Contrattuale:</td><td style={{ border: '1pt solid black', padding: '8pt' }}>{formatCurrency(project.contract.totalAmount)} (di cui {formatCurrency(project.contract.securityCosts)} per oneri sicurezza) oltre IVA</td></tr>
                <tr><td style={{ border: '1pt solid black', padding: '8pt', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>R.U.P.:</td><td style={{ border: '1pt solid black', padding: '8pt' }}>{renderSubjectHeader('rup')}</td></tr>
                <tr><td style={{ border: '1pt solid black', padding: '8pt', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Direzione Lavori:</td><td style={{ border: '1pt solid black', padding: '8pt' }}>{renderSubjectHeader('dl')}</td></tr>
            </tbody>
        </table>

        <div style={{ textAlign: 'justify', fontSize: '12pt', lineHeight: '1.7' }}>
            {doc.attendees && (
                <div style={{ marginBottom: '20pt' }}>
                    <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>SOGGETTI INTERVENUTI:</p>
                    <div style={{ whiteSpace: 'pre-wrap', marginLeft: '10pt', fontSize: '11pt' }}>{doc.attendees}</div>
                </div>
            )}

            {doc.convocationDetails && (
                <div style={{ marginBottom: '20pt' }}>
                    <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>CONVOCAZIONE:</p>
                    <p style={{ fontSize: '11pt' }}>{doc.convocationDetails}</p>
                </div>
            )}

            <p style={{ margin: '0 0 12pt 0' }}>{doc.worksIntroText}</p>
            
            {doc.worksExecuted && doc.worksExecuted.length > 0 && (
                <ul style={{ marginLeft: '30pt', marginBottom: '20pt' }}>
                    {doc.worksExecuted.map((w,i) => <li key={i} style={{ marginBottom: '6pt' }}>{w}</li>)}
                </ul>
            )}
            
            {doc.testerRequests && (
                <div style={{ marginTop: '25pt' }}>
                    <p style={{ fontWeight: 'bold' }}>Il Collaudatore chiede ai presenti:</p>
                    <div style={{ whiteSpace: 'pre-wrap', paddingLeft: '20pt', borderLeft: '1pt solid #eee' }}>{doc.testerRequests}</div>
                </div>
            )}
            
            {doc.testerInvitations && (
                <div style={{ marginTop: '25pt' }}>
                    <p style={{ fontWeight: 'bold' }}>Il Collaudatore invita i presenti a:</p>
                    <div style={{ whiteSpace: 'pre-wrap', paddingLeft: '20pt', borderLeft: '1pt solid #eee' }}>{doc.testerInvitations}</div>
                </div>
            )}
            
            {doc.commonParts && <div style={{ marginTop: '25pt', whiteSpace: 'pre-wrap' }}>{doc.commonParts}</div>}
            
            {doc.observations && (
                <div style={{ marginTop: '30pt', backgroundColor: '#fdfdfd', padding: '15pt', border: '0.5pt dashed #ccc' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '8pt' }}>OSSERVAZIONI E VALUTAZIONI:</p>
                    <div style={{ whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>{doc.observations}</div>
                </div>
            )}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '80pt', pageBreakInside: 'avoid' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40pt' }}>
                <div style={{ marginBottom: '40pt' }}>
                    <p style={{ fontSize: '10pt', fontWeight: 'bold' }}>Il Collaudatore:</p>
                    <p style={{ fontSize: '11pt' }}>{tester.title || 'Arch.'} {tester.name || '...'}</p>
                    <p style={{ marginTop: '30pt' }}>_____________________________</p>
                </div>
                <div style={{ marginBottom: '40pt' }}>
                    <p style={{ fontSize: '10pt', fontWeight: 'bold' }}>Il R.U.P.:</p>
                    <p style={{ fontSize: '11pt' }}>{renderSubjectHeader('rup')}</p>
                    <p style={{ marginTop: '30pt' }}>_____________________________</p>
                </div>
                <div style={{ marginBottom: '40pt' }}>
                    <p style={{ fontSize: '10pt', fontWeight: 'bold' }}>Il D.L. e C.S.E.:</p>
                    <p style={{ fontSize: '11pt' }}>{renderSubjectHeader('dl')}</p>
                    <p style={{ marginTop: '30pt' }}>_____________________________</p>
                </div>
                <div style={{ marginBottom: '40pt' }}>
                    <p style={{ fontSize: '10pt', fontWeight: 'bold' }}>L'Impresa:</p>
                    <p style={{ fontSize: '11pt' }}>{contractor.name || '...'}</p>
                    <p style={{ marginTop: '30pt' }}>_____________________________</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
