
import React from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';

interface DocumentPreviewProps {
    project: ProjectConstants;
    doc: DocumentVariables;
    type: DocumentType;
    allDocuments: DocumentVariables[];
}

const formatShortDate = (date?: string) => {
    if (!date) return '...';
    try {
        const d = new Date(date);
        return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
        return date;
    }
};

const formatNameWithTitle = (contact: any) => {
    if (!contact) return '...';
    return `${contact.title || ''} ${contact.name || ''}`.trim() || '...';
};

const parseCurrency = (value?: string): number => {
    if (!value) return 0;
    const clean = value.replace(/[€\s]/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(clean) || 0;
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
};

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ project, doc, type }) => {
  if (!project || !doc) return <div className="p-10 text-slate-400 italic">Dati non disponibili.</div>;

  const isNullaOsta = type === 'NULLA_OSTA_ENTE';
  const isConvocazione = type === 'LETTERA_CONVOCAZIONE';
  const isVerbale = type === 'VERBALE_COLLAUDO';

  const tester = project.subjects?.tester?.contact || {};
  const t = project.subjects?.testerAppointment || {};

  const renderHeader = () => {
    if (isNullaOsta) {
      return (
        <div className="text-center mb-10">
          {tester.colleagueEntityLogo && <img src={tester.colleagueEntityLogo} style={{ maxHeight: '2.5cm', margin: '0 auto 10px' }} alt="Logo Ente" />}
          <h1 className="font-bold text-lg uppercase tracking-wider">{tester.colleagueEntityName || "ENTE DI APPARTENENZA"}</h1>
          <p className="text-[10px] font-bold italic border-t border-slate-200 pt-2 uppercase">Rilascio Nulla Osta ai sensi dell'Art. 53 D.Lgs. 165/2001</p>
        </div>
      );
    }

    if (isConvocazione) {
      // Intestazione Professionale Luigi Resta
      return (
        <div className="mb-14 flex justify-between items-start">
          <div className="uppercase">
            <h1 className="font-bold text-[16pt] leading-none tracking-tight">{tester.name || 'LUIGI RESTA'}</h1>
            <p className="text-[10pt] tracking-[0.3em] font-light mt-1 text-right">{tester.title || 'ARCHITETTO'}</p>
          </div>
          <div className="text-[9pt] text-right space-y-0.5 leading-tight text-slate-700">
             {/* Fallback dati per demo o dati reali se presenti */}
             <p>{tester.address || 'Piazza Matteotti, 3 - 72023 Mesagne'}</p>
             <p>{tester.phone || '0831.777752'}</p>
             <p className="font-semibold">{tester.pec || 'arch.luigiresta@pec.it'}</p>
             <p className="font-semibold">{tester.email || 'arch.luigiresta@gmail.com'}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center mb-8 border-b-2 border-slate-900 pb-4">
        {project.headerLogo && <img src={project.headerLogo} style={{ maxHeight: '2cm', margin: '0 auto 10px' }} alt="Logo Committente" />}
        <h1 className="font-bold text-xl uppercase tracking-tighter">{project.entity || 'COMMITTENTE'}</h1>
        {project.entityProvince && <p className="text-sm font-bold italic">Provincia di {project.entityProvince}</p>}
      </div>
    );
  };

  const renderFooter = () => {
    if (isConvocazione) {
        return (
            <div className="mt-auto pt-4 border-t border-slate-300 text-[8pt] flex justify-between no-print-break text-slate-500">
                <div>
                   <p className="font-bold uppercase text-slate-800">{tester.name}</p>
                   <p>{tester.address}</p>
                </div>
                <div className="text-right">
                   <p>PEC: {tester.pec}</p>
                   <p>{tester.registrationNumber ? `Iscr. Albo n. ${tester.registrationNumber}` : ''}</p>
                </div>
            </div>
        );
    }
    return null;
  };

  const feeValue = parseCurrency(t.testerFee);

  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-snug w-full max-w-[21cm]">
        <div className="bg-white shadow-lg p-[1.8cm] min-h-[29.7cm] print-page relative flex flex-col mx-auto border border-slate-100">
            
            {renderHeader()}

            <div className="flex-1">
                {isConvocazione && (
                    <div className="text-[11.5pt] space-y-8 animate-in fade-in">
                        {/* Destinatari Multipli a Destra */}
                        <div className="flex justify-end mb-12">
                            <div className="w-2/3 text-left space-y-4">
                                <div className="whitespace-pre-wrap font-bold uppercase leading-tight text-[11pt]">
                                    {doc.actRecipientsBlock || 
                                    `SPETT.LE COMMISSARIO STRAORDINARIO\nGIOCHI MEDITERRANEO TARANTO 2026\nALLA C.A. DEL RUP ARCH. LAURA SPINELLI\nPEC: commissario.giochimediterraneo26@pec.governo.it\n\nSIDOTI ENGINEERING s.r.l.\nALLA C.A. DEL DL ARCH. VINCENZO SIDOTI\nPEC: sidotiengineering@legalmail.it`}
                                </div>
                            </div>
                        </div>

                        {/* Oggetto e Titolo */}
                        <div className="font-bold space-y-2">
                            <div className="flex gap-2">
                                <span className="underline shrink-0">Oggetto:</span>
                                <div className="flex-1">
                                    {project.projectName} - CUP: {project.cup} - CIG: {project.cig}
                                </div>
                            </div>
                            <p className="pt-4 text-[13pt] underline uppercase tracking-tight">Convocazione {doc.visitNumber === 1 ? 'I' : doc.visitNumber} visita di Collaudo</p>
                        </div>

                        {/* Corpo del Testo Fedele al Modello */}
                        <div className="text-justify leading-relaxed whitespace-pre-wrap text-[11.5pt] space-y-4">
                            {doc.actBodyOverride || 
                            `Sentite le parti, si comunica che la ${doc.visitNumber === 1 ? 'I' : doc.visitNumber} visita di collaudo dei lavori di cui in oggetto è fissata per il giorno ${formatShortDate(doc.date)}, ore ${doc.time || '--.--'}, con incontro presso il luogo dei lavori.
\nDurante le operazioni di collaudo, la Ditta dovrà assicurare la disponibilità di personale ed attrezzature per le verifiche, i saggi e le prove necessarie, oltre a copia del progetto completo in formato cartaceo al fine di agevolare le opportune valutazioni sul posto.
\nDurante il suddetto incontro lo scrivente estrarrà copia, altresì, di quanto eventualmente necessario alla presa d’atto delle attività già svolte.
\nSi invitano le parti ad astenersi dal porre in essere qualsivoglia opera di carattere strutturale in mancanza della verifica e del preventivo assenso da parte dello scrivente collaudatore. 
\nSi rammenta, altresì, l’obbligo per la D.L. di presenziare alle operazioni suddette.
\nDistinti saluti.`}
                        </div>

                        {/* Blocco Firma */}
                        <div className="mt-24 flex justify-end">
                            <div className="text-center min-w-[350px]">
                                <p className="font-bold uppercase text-[9pt] leading-tight mb-4 border-b border-black/10 pb-1">
                                    IL COLLAUDATORE STATICO, TECNICO-AMMINISTRATIVO<br/>E FUNZIONALE DEGLI IMPIANTI
                                </p>
                                <p className="font-bold text-[14pt]">{tester.title} {tester.name}</p>
                                <div className="mt-4 h-16 flex items-center justify-center">
                                    <div className="w-48 h-px bg-slate-200"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isNullaOsta && (
                    <div className="text-[11pt] text-justify space-y-6 leading-relaxed">
                        <p className="italic text-center mb-10 font-bold border-b border-slate-100 pb-4">{doc.nullaOstaLegalRefs || "D.Lgs. 165/2001 e s.m.i."}</p>
                        <div className="space-y-6">
                            <p>{doc.nullaOstaRequestBlock || "Vista la richiesta dell'Ente..."}</p>
                            <div className="font-bold border-y-2 border-slate-900 py-6 text-center bg-slate-50 uppercase tracking-widest">
                                SI AUTORIZZA
                            </div>
                            <div className="whitespace-pre-wrap">{doc.nullaOstaObservationsBlock || "Lo svolgimento dell'incarico..."}</div>
                            
                            <div className="pt-10 border-t border-slate-100 text-sm italic text-slate-600">
                                Compenso previsto: {formatCurrency(feeValue)} <br/>
                                (Soggetto a riduzione del 50% ai sensi di legge: {formatCurrency(feeValue / 2)})
                            </div>
                        </div>
                        <div className="mt-20 flex justify-between items-end">
                            <p className="font-bold">Data, {formatShortDate(doc.date)}</p>
                            <div className="text-center min-w-[200px]">
                                <p className="font-bold uppercase text-xs">IL DIRIGENTE RESPONSABILE</p>
                                <div className="h-14"></div>
                                <p className="italic text-[9pt] text-slate-400">(Firma Digitale)</p>
                            </div>
                        </div>
                    </div>
                )}

                {isVerbale && (
                    <div className="text-sm space-y-6">
                         <div className="text-center font-bold mb-6">
                            <h2 className="text-xl underline uppercase tracking-tight">VERBALE DI VISITA DI COLLAUDO N. {doc.visitNumber}</h2>
                            <p className="text-sm mt-1">SVOLTA IN DATA {formatShortDate(doc.date)}</p>
                        </div>
                        <div className="border-[1.5pt] border-black p-5 text-xs font-bold space-y-2 uppercase leading-tight">
                            <p className="text-[11pt]">OPERA: {project.projectName}</p>
                            <p>COMMITTENTE: {project.entity}</p>
                            <div className="flex gap-10">
                                <span>CUP: {project.cup}</span>
                                <span>CIG: {project.cig}</span>
                            </div>
                        </div>
                        <div className="text-justify leading-relaxed">
                            <h3 className="font-bold text-xs uppercase mb-1 border-b-[1.5pt] border-black pb-0.5">Premesse Storiche</h3>
                            <div className="whitespace-pre-wrap text-[10.5pt] leading-snug">{doc.premis || "Nessuna premessa."}</div>
                        </div>
                        <div className="mt-32 grid grid-cols-2 gap-24">
                            <div className="text-center border-t border-black pt-3"><p className="text-[10px] font-bold uppercase tracking-widest">L'Impresa Appaltatrice</p></div>
                            <div className="text-center border-t border-black pt-3"><p className="text-[10px] font-bold uppercase tracking-widest">Il Collaudatore</p></div>
                        </div>
                    </div>
                )}
            </div>

            {renderFooter()}
        </div>
    </div>
  );
};
