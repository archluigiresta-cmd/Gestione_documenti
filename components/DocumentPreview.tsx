
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
        return new Date(date).toLocaleDateString('it-IT');
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
  if (!project || !doc) return <div className="p-10 text-slate-400 italic">Dati mancanti.</div>;

  const isNullaOsta = type === 'NULLA_OSTA_ENTE';
  const isConvocazione = type === 'LETTERA_CONVOCAZIONE';
  const isVerbale = type === 'VERBALE_COLLAUDO';

  const tester = project.subjects?.tester?.contact || {};
  const t = project.subjects?.testerAppointment || {};

  // --- LOGICA INTESTAZIONE ---
  const renderHeader = () => {
    if (isNullaOsta) {
      return (
        <div className="text-center mb-10">
          {tester.colleagueEntityLogo && <img src={tester.colleagueEntityLogo} style={{ maxHeight: '2.5cm', margin: '0 auto 10px' }} alt="Logo Ente Appartenenza" />}
          <h1 className="font-bold text-lg uppercase tracking-wider">{tester.colleagueEntityName || "ENTE DI APPARTENENZA"}</h1>
          <p className="text-xs font-bold italic">Rilascio Nulla Osta ai sensi dell'Art. 53 D.Lgs. 165/2001</p>
        </div>
      );
    }

    if (isConvocazione) {
      // Professional Header based on screenshot
      return (
        <div className="mb-10 flex justify-between items-start border-b border-slate-900 pb-2">
          <div className="uppercase">
            <h1 className="font-bold text-lg leading-none">{tester.name || 'IL TUO NOME'}</h1>
            <p className="text-[10px] tracking-widest">{tester.title || 'ARCHITETTO'}</p>
          </div>
          <div className="text-[10px] text-right space-y-0.5">
             <p>{tester.address || 'Piazza Matteotti, 3'}</p>
             <p>{tester.phone || '0831.777752'}</p>
             <p className="font-bold">{tester.email || 'arch.luigiresta@gmail.com'}</p>
             <p className="italic">{tester.pec || 'arch.luigiresta@pec.it'}</p>
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
            <div className="mt-auto pt-4 border-t border-slate-900 text-[10px] flex justify-between no-print-break">
                <div>
                   <p className="font-bold uppercase">{tester.name}</p>
                   <p>{tester.address}</p>
                </div>
                <div className="text-right">
                   <p>{tester.pec}</p>
                   <p>{tester.registrationNumber ? `Iscrizione Albo n. ${tester.registrationNumber}` : ''}</p>
                </div>
            </div>
        );
    }
    return null;
  };

  const feeValue = parseCurrency(t.testerFee);

  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-snug w-full max-w-[21cm]">
        <div className="bg-white shadow-lg p-[1.5cm] min-h-[29.7cm] print-page relative flex flex-col">
            
            {renderHeader()}

            <div className="flex-1">
                {isConvocazione && (
                    <div className="text-[11pt] space-y-6 animate-in fade-in">
                        {/* Recipients Block */}
                        <div className="flex justify-end mb-10">
                            <div className="w-1/2 text-left space-y-3">
                                <div className="whitespace-pre-wrap font-bold uppercase leading-tight">
                                    {doc.actRecipientsBlock || `SPETT.LE COMMISSARIO STRAORDINARIO\nGIOCHI MEDITERRANEO TARANTO 2026\nALLA C.A. DEL RUP ARCH. LAURA SPINELLI`}
                                </div>
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="font-bold mb-8">
                            <p>Oggetto: {project.projectName}, CUP: {project.cup} - CIG: {project.cig}</p>
                            <p className="mt-2 text-lg underline">Convocazione {doc.visitNumber || 'I'} visita di Collaudo</p>
                        </div>

                        {/* Body Text precisely from screenshot */}
                        <div className="text-justify leading-relaxed whitespace-pre-wrap">
                            {doc.actBodyOverride || 
                            `Sentite le parti, si comunica che la ${doc.visitNumber || 'I'} visita di collaudo dei lavori di cui in oggetto è fissata per il giorno ${formatShortDate(doc.date)}, ore ${doc.time || '--.--'}, con incontro presso il luogo dei lavori.
\nDurante le operazioni di collaudo, la Ditta dovrà assicurare la disponibilità di personale ed attrezzature per le verifiche, i saggi e le prove necessarie, oltre a copia del progetto completo in formato cartaceo al fine di agevolare le opportune valutazioni sul posto.
\nDurante il suddetto incontro lo scrivente estrarrà copia, altresì, di quanto eventualmente necessario alla presa d’atto delle attività già svolte.
\nSi invitano le parti ad astenersi dal porre in essere qualsivoglia opera di carattere strutturale in mancanza della verifica e del preventivo assenso da parte dello scrivente collaudatore. 
\nSi rammenta, altresì, l’obbligo per la D.L. di presenziare alle operazioni suddette.
\nDistinti saluti.`}
                        </div>

                        {/* Signature */}
                        <div className="mt-16 flex justify-end">
                            <div className="text-center min-w-[300px]">
                                <p className="font-bold uppercase text-[9pt] leading-tight mb-4">
                                    IL COLLAUDATORE STATICO, TECNICO-AMMINISTRATIVO<br/>E FUNZIONALE DEGLI IMPIANTI
                                </p>
                                <p className="font-bold text-lg">{tester.title} {tester.name}</p>
                            </div>
                        </div>
                    </div>
                )}

                {isNullaOsta && (
                    <div className="text-sm text-justify space-y-4 leading-relaxed">
                        <p className="italic text-center mb-6">{doc.nullaOstaLegalRefs || "D.Lgs. 165/2001 e s.m.i."}</p>
                        <div className="space-y-4">
                            <p>{doc.nullaOstaRequestBlock || "Vista la richiesta dell'Ente..."}</p>
                            <div className="font-bold border-y border-slate-100 py-4 text-center">
                                Compenso previsto: {formatCurrency(feeValue)} <br/>
                                <span className="text-xs font-normal">(Ridotto del 50%: {formatCurrency(feeValue / 2)})</span>
                            </div>
                            <div className="whitespace-pre-wrap">{doc.nullaOstaObservationsBlock || "Verificata la compatibilità..."}</div>
                        </div>
                        <div className="text-center py-8"><h3 className="font-bold text-lg border-y-2 border-black inline-block px-12 py-2 uppercase">SI AUTORIZZA</h3></div>
                        <div className="mt-20 flex justify-between items-end">
                            <p>Data, {formatShortDate(doc.date)}</p>
                            <div className="text-center min-w-[200px]">
                                <p className="font-bold uppercase text-xs">IL SEGRETARIO GENERALE</p>
                                <div className="h-12"></div>
                                <p className="italic text-xs">{doc.nullaOstaSignatory || "Firma Digitale"}</p>
                            </div>
                        </div>
                    </div>
                )}

                {isVerbale && (
                    <div className="text-sm space-y-6">
                         <div className="text-center font-bold mb-6">
                            <h2 className="text-lg underline uppercase">VERBALE DI VISITA DI COLLAUDO N. {doc.visitNumber}</h2>
                            <p className="text-sm mt-1">SVOLTA IN DATA {formatShortDate(doc.date)}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-1 border-y border-slate-200 py-3 bg-slate-50 px-4 text-xs">
                            <p className="font-bold uppercase">{project.projectName}</p>
                            <p>CUP: {project.cup} - CIG: {project.cig}</p>
                        </div>
                        <div className="text-justify leading-relaxed">
                            <h3 className="font-bold text-xs uppercase mb-1 border-b">Premesse</h3>
                            <div className="whitespace-pre-wrap text-[10pt]">{doc.premis}</div>
                        </div>
                        <div className="mt-16 grid grid-cols-2 gap-20">
                            <div className="text-center border-t border-black pt-2"><p className="text-[10px] font-bold uppercase">L'Impresa</p></div>
                            <div className="text-center border-t border-black pt-2"><p className="text-[10px] font-bold uppercase">Il Collaudatore</p></div>
                        </div>
                    </div>
                )}
            </div>

            {renderFooter()}
        </div>
    </div>
  );
};
