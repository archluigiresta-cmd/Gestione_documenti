
import React from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';

interface DocumentPreviewProps {
    project: ProjectConstants;
    doc: DocumentVariables;
    type: DocumentType;
    allDocuments: DocumentVariables[];
}

const formatShortDate = (date: string) => {
    if (!date) return '...';
    return new Date(date).toLocaleDateString('it-IT');
};

const formatNameWithTitle = (contact: any) => {
    return `${contact.title || ''} ${contact.name}`.trim();
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
};

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ project, doc, type, allDocuments }) => {
  const isNullaOsta = type === 'NULLA_OSTA_ENTE';
  const isConvocazione = type === 'LETTERA_CONVOCAZIONE';
  const isVerbale = type === 'VERBALE_COLLAUDO';

  const tester = project.subjects.tester.contact;
  const t = project.subjects.testerAppointment;

  // --- LOGICA INTESTAZIONE ---
  const renderHeader = () => {
    if (isNullaOsta) {
      // Nulla Osta: Logo Ente di Appartenenza
      return (
        <div className="text-center mb-10">
          {tester.colleagueEntityLogo && <img src={tester.colleagueEntityLogo} style={{ maxHeight: '2.5cm', margin: '0 auto 10px' }} alt="Logo Ente Appartenenza" />}
          <h1 className="font-bold text-lg uppercase tracking-wider">{tester.colleagueEntityName || "ENTE DI APPARTENENZA"}</h1>
          <p className="text-xs font-bold italic">Rilascio Nulla Osta ai sensi dell'Art. 53 D.Lgs. 165/2001</p>
        </div>
      );
    }

    if (isConvocazione) {
      // Convocazione: Intestazione Professionale (Senza Logo Ente)
      return (
        <div className="mb-10 border-b border-slate-200 pb-4">
          <p className="font-bold text-lg uppercase tracking-tight">{tester.title || 'Arch.'} {tester.name}</p>
          <p className="text-xs text-slate-500 uppercase font-medium">Incarico di Collaudo {t.isStatic ? 'Statico, ' : ''} Tecnico-Amministrativo e Funzionale</p>
        </div>
      );
    }

    // Default (Verbali): Logo Committente
    return (
      <div className="text-center mb-8 border-b-2 border-slate-900 pb-4">
        {project.headerLogo && <img src={project.headerLogo} style={{ maxHeight: '2cm', margin: '0 auto 10px' }} alt="Logo Committente" />}
        <h1 className="font-bold text-xl uppercase tracking-tighter">{project.entity}</h1>
        {project.entityProvince && <p className="text-sm font-bold italic">Provincia di {project.entityProvince}</p>}
      </div>
    );
  };

  // --- LOGICA PIÈ DI PAGINA ---
  const renderFooter = () => {
    if (isConvocazione) {
        return (
            <div className="mt-auto pt-8 border-t border-slate-200 text-[10px] text-slate-500 grid grid-cols-2 gap-4 no-print-break">
                <div>
                    <p className="font-bold uppercase mb-1 text-slate-700">{tester.title || 'Arch.'} {tester.name}</p>
                    <p>{tester.professionalOrder} - Iscr. n. {tester.registrationNumber}</p>
                    <p>{tester.address || 'Indirizzo Studio non specificato'}</p>
                </div>
                <div className="text-right">
                    <p>PEC: {tester.pec || '-'}</p>
                    <p>Email: {tester.email || '-'}</p>
                    <p>Tel/Cell: {tester.phone || '-'}</p>
                </div>
            </div>
        );
    }
    return null;
  };

  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-normal w-full max-w-[21cm]">
        <div className="bg-white shadow-lg p-[2.5cm] min-h-[29.7cm] print-page relative flex flex-col">
            
            {renderHeader()}

            {/* CONTENUTO SPECIFICO PER TIPO */}
            <div className="flex-1">
                {isNullaOsta && (
                    <div className="text-sm text-justify space-y-4 leading-relaxed animate-in fade-in">
                        <p className="italic text-center mb-6">{doc.nullaOstaLegalRefs || "D.Lgs. 165/2001 e Regolamenti interni"}</p>
                        <div className="space-y-4">
                            <p>{doc.nullaOstaRequestBlock || "Vista la richiesta..."}</p>
                            <p>{doc.nullaOstaAuthorityRequestBlock || "Vista l'istanza del dipendente..."}</p>
                            <p className="font-bold border-y border-slate-100 py-4 text-center">
                                Compenso previsto: {formatCurrency(parseFloat(t.testerFee || '0'))} <br/>
                                <span className="text-xs font-normal">(Ridotto al 50% ai sensi di legge: {formatCurrency(parseFloat(t.testerFee || '0') / 2)})</span>
                            </p>
                            <div className="whitespace-pre-wrap">{doc.nullaOstaObservationsBlock || "Valutata l'insussistenza di conflitti..."}</div>
                        </div>
                        <div className="text-center py-8"><h3 className="font-bold text-lg tracking-[0.3em] border-y-2 border-black inline-block px-12 py-2">SI AUTORIZZA</h3></div>
                        <p className="text-center">Lo svolgimento dell'incarico esterno citato in premessa.</p>
                        
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

                {isConvocazione && (
                    <div className="text-sm space-y-6 animate-in fade-in">
                        <div className="flex justify-between mb-10">
                            <div><p>Data, {formatShortDate(doc.date)}</p></div>
                            <div className="text-right">
                                <p className="font-bold">Spett.le</p>
                                <p className="font-bold uppercase">{project.entity}</p>
                                <p className="italic">All'attenzione del RUP</p>
                            </div>
                        </div>

                        <div className="font-bold mb-8">
                            <p>OGGETTO: {doc.actSubject || `Convocazione visita di collaudo - Lavori di: ${project.projectName}`}</p>
                        </div>

                        <div className="text-justify leading-relaxed whitespace-pre-wrap">
                            {doc.actBodyOverride || `Il sottoscritto ${formatNameWithTitle(tester)}, in qualità di Collaudatore incaricato per l'opera in oggetto, 
                            \nCONVOCA\n
                            le parti in indirizzo per il giorno ${formatShortDate(doc.date)} alle ore ${doc.time || '--:--'} presso il cantiere, per lo svolgimento della visita di collaudo.`}
                        </div>

                        <div className="mt-20 flex justify-end">
                            <div className="text-center min-w-[250px]">
                                <p className="font-bold uppercase text-xs mb-8">Il Collaudatore Incaricato</p>
                                <p className="italic font-bold">{formatNameWithTitle(tester)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {isVerbale && (
                    <div className="text-sm space-y-6 animate-in fade-in">
                         <div className="text-center font-bold mb-6">
                            <h2 className="text-lg underline uppercase">VERBALE DI VISITA DI COLLAUDO N. {doc.visitNumber}</h2>
                            <p className="text-sm mt-1">SVOLTA IN DATA {formatShortDate(doc.date)}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-1 border-y border-slate-200 py-3 bg-slate-50 px-4">
                            <p className="font-bold text-xs uppercase text-slate-500">Opera:</p>
                            <p className="font-bold text-sm uppercase">{project.projectName}</p>
                            <div className="flex gap-10 mt-2">
                                <p className="text-xs">CUP: <span className="font-bold">{project.cup}</span></p>
                                <p className="text-xs">CIG: <span className="font-bold">{project.cig}</span></p>
                            </div>
                        </div>

                        <div className="text-justify leading-relaxed">
                            <h3 className="font-bold text-xs uppercase mb-2 border-b">Premesse</h3>
                            <div className="whitespace-pre-wrap text-xs">{doc.premis}</div>
                        </div>

                        <div className="text-justify leading-relaxed">
                            <h3 className="font-bold text-xs uppercase mb-2 border-b">Lavorazioni verificate in data odierna</h3>
                            <ul className="list-disc pl-5 text-xs space-y-1">
                                {doc.worksExecuted.map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                        </div>

                        <div className="text-justify leading-relaxed">
                            <h3 className="font-bold text-xs uppercase mb-2 border-b">Note e Disposizioni</h3>
                            <div className="whitespace-pre-wrap text-xs italic">{doc.observations}</div>
                        </div>

                        <div className="mt-16 grid grid-cols-2 gap-20">
                            <div className="text-center border-t border-black pt-2">
                                <p className="text-[10px] font-bold uppercase">L'Impresa Appaltatrice</p>
                            </div>
                            <div className="text-center border-t border-black pt-2">
                                <p className="text-[10px] font-bold uppercase">Il Collaudatore</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {renderFooter()}
        </div>
    </div>
  );
};
