
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
        Dati insufficienti per generare l'anteprima.
      </div>
    );
  }

  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-snug w-full max-w-[21cm] animate-in fade-in">
        <div className="bg-white shadow-xl p-[1.8cm] min-h-[29.7cm] print-page relative flex flex-col mx-auto border border-slate-200">
            
            <div className="text-center mb-8 border-b-2 border-slate-900 pb-4">
                {project.headerLogo && <img src={project.headerLogo} style={{ maxHeight: '2cm', margin: '0 auto 10px' }} alt="Logo" />}
                <h1 className="font-bold text-xl uppercase tracking-tighter">{project.entity || 'COMMITTENTE'}</h1>
                {project.entityProvince && <p className="text-sm font-bold italic">Provincia di {project.entityProvince}</p>}
            </div>

            <div className="flex-1">
                <div className="text-sm space-y-6">
                    <div className="text-center font-bold mb-6">
                        <h2 className="text-xl underline uppercase tracking-tight">VERBALE DI VISITA DI COLLAUDO N. {doc.visitNumber || '?'}</h2>
                        <p className="text-sm mt-1">SVOLTA IN DATA {formatShortDate(doc.date)}</p>
                    </div>

                    <div className="border-[1.5pt] border-black p-5 text-xs font-bold space-y-2 uppercase leading-tight">
                        <p className="text-[11pt]">OPERA: {project.projectName || '---'}</p>
                        <p>COMMITTENTE: {project.entity || '---'}</p>
                        <div className="flex gap-10">
                            <span>CUP: {project.cup || '---'}</span>
                            <span>CIG: {project.cig || '---'}</span>
                        </div>
                    </div>

                    <div className="text-justify leading-relaxed">
                        <h3 className="font-bold text-xs uppercase mb-1 border-b-[1.5pt] border-black pb-0.5">Narrazione e Premesse</h3>
                        <div className="whitespace-pre-wrap text-[10.5pt] leading-snug font-serif">{doc.premis || "Testo non inserito."}</div>
                    </div>

                    <div className="mt-32 grid grid-cols-2 gap-24">
                        <div className="text-center border-t border-black pt-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest">L'Impresa Appaltatrice</p>
                        </div>
                        <div className="text-center border-t border-black pt-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest">Il Collaudatore</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-300 text-[8pt] text-slate-500 italic text-center">
                Documento generato con EdilApp - Gestione Collaudi
            </div>
        </div>
    </div>
  );
};
