
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
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString('it-IT');
  } catch { return d; }
};

const formatCurrency = (val: string) => {
  if (!val) return '...';
  const n = parseFloat(val.replace(/[^0-9.,]/g, '').replace(',', '.'));
  if (isNaN(n)) return val;
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);
};

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ project, doc }) => {
  if (!project || !doc) return <div className="p-10 text-center text-slate-400">Dati insufficienti per generare l'anteprima.</div>;

  const tester = project.subjects?.tester?.contact || {};
  const rup = project.subjects?.rup?.contact || {};
  const dl = project.subjects?.dl?.contact || {};
  const cse = project.subjects?.cse?.contact || {};
  const contractor = project.contractor?.mainCompany || {};

  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-snug w-full max-w-[21cm] mx-auto animate-in fade-in">
      <div className="bg-white p-[1.8cm] min-h-[29.7cm] relative flex flex-col border shadow-xl print:shadow-none print:border-none">
        
        {/* INTESTAZIONE ISTITUZIONALE - TABELLA PER WORD COMPATIBILITY */}
        <table style={{ width: '100%', marginBottom: '20pt', borderCollapse: 'collapse' }}>
            <tr>
                <td align="center" style={{ textAlign: 'center' }}>
                    {project.headerLogo && (
                        <div style={{ marginBottom: '10pt', textAlign: 'center' }}>
                            <img src={project.headerLogo} style={{ maxHeight: '2.5cm', maxWidth: '8cm', display: 'inline-block' }} alt="Logo" />
                        </div>
                    )}
                    <h1 style={{ margin: '0', fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase', lineHeight: '1.2' }}>{project.entity}</h1>
                    {project.entityProvince && <p style={{ margin: '2pt 0', fontSize: '10pt', fontWeight: 'bold', fontStyle: 'italic' }}>Provincia di {project.entityProvince}</p>}
                </td>
            </tr>
        </table>

        {/* OGGETTO E TITOLO ATTO */}
        <div style={{ borderTop: '1.5pt solid black', paddingTop: '10pt', marginBottom: '20pt' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', fontFamily: 'monospace', marginBottom: '5pt' }}>
                <span>CUP: {project.cup || '---'}</span>
                <span>CIG: {project.cig || '---'}</span>
            </div>
            <div style={{ textAlign: 'justify', fontSize: '11pt', fontWeight: 'bold', textTransform: 'uppercase', lineHeight: '1.4', marginBottom: '15pt' }}>
                LAVORI DI: <span style={{ fontWeight: 'normal', whiteSpace: 'pre-wrap' }}>{project.projectName}</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: '20pt' }}>
                <h2 style={{ fontSize: '16pt', fontWeight: 'bold', textDecoration: 'underline', textTransform: 'uppercase', margin: '0' }}>
                    VERBALE DI VISITA DI COLLAUDO N. {doc.visitNumber || '?'}
                </h2>
                <p style={{ fontSize: '12pt', fontWeight: 'bold', fontStyle: 'italic', marginTop: '5pt' }}>SVOLTO IN DATA {formatDate(doc.date)}</p>
            </div>
        </div>

        <div className="flex-1 space-y-6">
          {/* TABELLA DATI APPALTO PROFESSIONALE */}
          <div style={{ border: '1.5pt solid black', fontSize: '9.5pt' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody style={{ borderCollapse: 'collapse' }}>
                <tr style={{ borderBottom: '1pt solid black' }}><td style={{ padding: '4pt 8pt', borderRight: '1pt solid black', fontWeight: 'bold', width: '35%' }}>IMPRESA:</td><td style={{ padding: '4pt 8pt', textTransform: 'uppercase' }}>{contractor.name || '---'}</td></tr>
                <tr style={{ borderBottom: '1pt solid black' }}><td style={{ padding: '4pt 8pt', borderRight: '1pt solid black', fontWeight: 'bold' }}>CONTRATTO APPALTO:</td><td style={{ padding: '4pt 8pt' }}>Rep. n. {project.contract?.repNumber || '---'} del {formatDate(project.contract?.date)}</td></tr>
                <tr style={{ borderBottom: '1pt solid black' }}><td style={{ padding: '4pt 8pt', borderRight: '1pt solid black', fontWeight: 'bold' }}>IMPORTO CONTRATTUALE:</td><td style={{ padding: '4pt 8pt' }}>{formatCurrency(project.contract?.totalAmount || '0')} (di cui {formatCurrency(project.contract?.securityCosts || '0')} per sicurezza)</td></tr>
                <tr style={{ borderBottom: '1pt solid black' }}><td style={{ padding: '4pt 8pt', borderRight: '1pt solid black', fontWeight: 'bold' }}>SCADENZA CONTRATTUALE:</td><td style={{ padding: '4pt 8pt', textAlign: 'justify' }}>Giorni {project.contract?.durationDays || '---'} naturali e consecutivi, decorrenti dal {formatDate(project.executionPhase?.deliveryDate)}, data verbale consegna lavori, con ultimazione prevista entro il {formatDate(project.executionPhase?.completionDate)}</td></tr>
                <tr style={{ borderBottom: '1pt solid black' }}><td style={{ padding: '4pt 8pt', borderRight: '1pt solid black', fontWeight: 'bold' }}>R.U.P.:</td><td style={{ padding: '4pt 8pt', textTransform: 'uppercase' }}>{rup.title} {rup.name || '---'}</td></tr>
                <tr style={{ borderBottom: '1pt solid black' }}><td style={{ padding: '4pt 8pt', borderRight: '1pt solid black', fontWeight: 'bold' }}>DIRETTORE LAVORI:</td><td style={{ padding: '4pt 8pt', textTransform: 'uppercase' }}>{dl.title} {dl.name || '---'}</td></tr>
                <tr><td style={{ padding: '4pt 8pt', borderRight: '1pt solid black', fontWeight: 'bold' }}>C.S.E.:</td><td style={{ padding: '4pt 8pt', textTransform: 'uppercase' }}>{cse.title} {cse.name || '---'}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="text-justify text-[11pt] leading-relaxed">
            <p className="mb-4">
              Il giorno {doc.date ? new Date(doc.date).getDate() : '...'} del mese di {doc.date ? new Date(doc.date).toLocaleString('it-IT', { month: 'long' }) : '...'} dell'anno {doc.date ? new Date(doc.date).getFullYear() : '...'}, alle ore {doc.time || '...'}, presso il luogo dei lavori in {project.location || project.entity}, ha avvio la visita di collaudo n. {doc.visitNumber || '?'} convocata con nota {doc.convocationMethod || '...'} del {doc.convocationDate ? formatDate(doc.convocationDate) : (doc.convocationDetails || formatDate(doc.date))}.
            </p>
            <p className="font-bold mb-4 italic">Sono presenti, oltre al sottoscritto Collaudatore {tester.title || 'Arch.'} {tester.name || '---'}:</p>
            <div className="whitespace-pre-wrap pl-4 italic mb-8 text-[10.5pt] border-l border-slate-200">{doc.attendees || 'Nessun presente registrato.'}</div>

            <div className="space-y-8">
              <div className="border-t border-black pt-6">
                <h3 className="font-bold uppercase text-xs mb-3 bg-slate-50 px-2 py-1 inline-block">PREMESSO CHE:</h3>
                <div className="whitespace-pre-wrap text-[10.5pt] leading-snug">{doc.premis || "Narrazione storica non inserita."}</div>
              </div>

              <div>
                <p className="mb-4 italic font-medium">{doc.worksIntroText}</p>
                {doc.worksExecuted && doc.worksExecuted.length > 0 && (
                  <ul className="list-decimal pl-8 space-y-2 mb-6 text-[10.5pt]">
                    {doc.worksExecuted.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                )}
                {doc.worksInProgress && (
                  <div className="mb-4">
                    <p className="font-bold underline text-[10pt]">Al momento, sono in corso di esecuzione le opere relative a:</p>
                    <p className="pl-4 italic whitespace-pre-wrap">{doc.worksInProgress}</p>
                  </div>
                )}
                {doc.upcomingWorks && (
                  <div className="mb-6">
                    <p className="font-bold underline text-[10pt]">Prossime attività previste:</p>
                    <p className="pl-4 italic whitespace-pre-wrap">{doc.upcomingWorks}</p>
                  </div>
                )}
              </div>

              {doc.testerRequests && (
                <div className="mt-8">
                  <p className="font-bold mb-2">Dopo aver preso visione di tutte le aree di cantiere il Collaudatore:</p>
                  <p className="font-bold underline text-xs uppercase tracking-tight">chiede ai presenti, ciascuno nell’ambito della propria competenza e responsabilità:</p>
                  <div className="pl-4 italic whitespace-pre-wrap mt-2">{doc.testerRequests}</div>
                </div>
              )}

              {doc.testerInvitations && (
                <div className="mt-6">
                  <p className="font-bold underline text-xs uppercase tracking-tight">invita i presenti, ciascuno nell’ambito della propria competenza e responsabilità, a:</p>
                  <div className="pl-4 italic whitespace-pre-wrap mt-2">{doc.testerInvitations}</div>
                </div>
              )}

              {doc.commonParts && <div className="mt-8 italic border-y border-dashed py-4">{doc.commonParts}</div>}
              
              {doc.observations && (
                <div className="mt-10 border-l-[3pt] border-black pl-6 py-4 bg-slate-50 italic text-[10.5pt] leading-relaxed">
                  <h3 className="font-bold uppercase text-[9pt] mb-2 text-slate-400">Valutazioni e Conclusioni:</h3>
                  {doc.observations}
                </div>
              )}
            </div>
          </div>

          {/* AREA FIRME - TABELLA PER ALLINEAMENTO PERFETTO */}
          <div className="mt-24 no-break">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tr>
                <td style={{ width: '50%' }}></td>
                <td style={{ width: '50%', textAlign: 'left', fontSize: '10pt', textTransform: 'uppercase' }}>
                    <div style={{ marginBottom: '40pt' }}>
                        Il Collaudatore: {tester.title} {tester.name} <br/>
                        ________________________________________
                    </div>
                    <div style={{ marginBottom: '40pt' }}>
                        Il Responsabile Unico del Progetto: {rup.title} {rup.name} <br/>
                        ________________________________________
                    </div>
                    <div style={{ marginBottom: '40pt' }}>
                        il Direttore dei Lavori e CSE: {dl.title} {dl.name} <br/>
                        ________________________________________
                    </div>
                    <div>
                        Il rappresentante legale dell'impresa {contractor.name}: <br/>
                        Sig. {contractor.repName} <br/>
                        ________________________________________
                    </div>
                </td>
              </tr>
            </table>
          </div>
        </div>

        {/* FOOTER NATIVO PER WORD */}
        <div id="f1" style={{ display: 'none' }} className="mso-footer">
          <p className="text-[8pt] text-center italic" style={{ borderTop: '0.5pt solid black', paddingTop: '5pt' }}>
            {tester.title} {tester.name} - {tester.address} - Email: {tester.email} - PEC: {tester.pec}
          </p>
        </div>
        
        {/* FOOTER VISIBILE WEB */}
        <div className="mt-16 pt-6 border-t border-slate-200 text-[8pt] text-slate-400 italic text-center no-print">
          Documento generato professionalmente con EdilApp Protocollo - Studio Tecnico {tester.title} {tester.name}
        </div>
      </div>
    </div>
  );
};
