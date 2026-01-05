
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
        if (isNaN(d.getTime())) return date;
        return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
        return date;
    }
};

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ project, doc }) => {
  if (!project || !doc) {
    return (
      <div className="p-10 text-slate-400 italic bg-white rounded-lg border border-dashed text-center w-full max-w-[21cm]">
        Dati insufficienti per generare l'anteprima professionale.
      </div>
    );
  }

  const tester = project.subjects?.tester?.contact || {};
  const contractor = project.contractor?.mainCompany || {};

  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-snug w-full max-w-[21cm] animate-in fade-in">
        <div className="bg-white shadow-xl p-[1.8cm] min-h-[29.7cm] print-page relative flex flex-col mx-auto border border-slate-200 print:shadow-none print:border-none">
            
            {/* Header Istituzionale */}
            <div className="text-center mb-10 border-b-2 border-black pb-4">
                {project.headerLogo && <img src={project.headerLogo} style={{ maxHeight: '2.5cm', margin: '0 auto 10px' }} alt="Logo Ente" />}
                <h1 className="font-bold text-xl uppercase tracking-tight">{project.entity || 'STAZIONE APPALTANTE'}</h1>
                {project.entityProvince && <p className="text-sm font-bold italic">Provincia di {project.entityProvince}</p>}
            </div>

            <div className="flex-1 space-y-8">
                {/* Titolo Atto */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold underline uppercase tracking-tight">VERBALE DI VISITA DI COLLAUDO N. {doc.visitNumber || '?'}</h2>
                    <p className="text-[12pt] mt-2 font-bold italic">REDAZIONATO IN DATA {formatShortDate(doc.date)}</p>
                </div>

                {/* Box Identificativo */}
                <div className="border-[1.5pt] border-black p-5 text-xs font-bold space-y-2 uppercase leading-tight bg-slate-50/20">
                    <p className="text-[11pt]">INTERVENTO: <span className="font-normal">{project.projectName || '---'}</span></p>
                    <p>COMMITTENTE: <span className="font-normal">{project.entity || '---'}</span></p>
                    <div className="flex gap-12">
                        <span>CUP: <span className="font-normal font-mono">{project.cup || '---'}</span></span>
                        <span>CIG: <span className="font-normal font-mono">{project.cig || '---'}</span></span>
                    </div>
                </div>

                {/* Contenuto Narrativo */}
                <div className="space-y-6 text-[10.5pt] text-justify leading-relaxed font-serif">
                    
                    {doc.attendees && (
                        <div>
                            <h3 className="font-bold uppercase mb-1 border-b-[1pt] border-black text-xs">Soggetti Presenti</h3>
                            <div className="whitespace-pre-wrap pl-2 pt-1 font-sans text-[10pt]">{doc.attendees}</div>
                        </div>
                    )}

                    <div>
                        <h3 className="font-bold uppercase mb-1 border-b-[1pt] border-black text-xs">Narrazione e Premesse Storiche</h3>
                        <div className="whitespace-pre-wrap pt-2 pl-1 leading-snug">{doc.premis || "Testo non inserito."}</div>
                    </div>

                    {doc.worksExecuted && doc.worksExecuted.length > 0 && (
                        <div>
                            <h3 className="font-bold uppercase mb-1 border-b-[1pt] border-black text-xs">Accertamenti e Verifiche Effettuate</h3>
                            <ul className="list-decimal pl-6 pt-2 space-y-1">
                                {doc.worksExecuted.map((w, idx) => <li key={idx} className="pl-2">{w}</li>)}
                            </ul>
                        </div>
                    )}

                    {doc.observations && (
                        <div className="bg-slate-50 p-4 border border-black/10">
                            <h3 className="font-bold uppercase mb-1 text-xs border-b border-black/20 pb-1">Osservazioni e Disposizioni</h3>
                            <div className="whitespace-pre-wrap pt-1 italic">{doc.observations}</div>
                        </div>
                    )}
                </div>

                {/* Spazio Firme */}
                <div className="mt-24 grid grid-cols-2 gap-24 no-break">
                    <div className="text-center border-t border-black pt-3">
                        <p className="text-[9pt] font-bold uppercase tracking-widest mb-10">L'Impresa Appaltatrice</p>
                        <p className="text-[10pt] font-bold uppercase italic">{contractor.name || '---'}</p>
                    </div>
                    <div className="text-center border-t border-black pt-3">
                        <p className="text-[9pt] font-bold uppercase tracking-widest mb-10">Il Collaudatore Incaricato</p>
                        <p className="text-[11pt] font-bold uppercase">{tester.title} {tester.name || '---'}</p>
                    </div>
                </div>
            </div>

            {/* Footer Tecnico */}
            <div className="mt-12 pt-4 border-t border-slate-300 text-[8pt] text-slate-400 italic text-center no-print">
                Documento tecnico generato professionalmente con EdilApp Protocollo
            </div>
        </div>
    </div>
  );
};
