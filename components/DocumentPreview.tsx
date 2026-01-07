
import React from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from '../types';

interface DocumentPreviewProps {
    project: ProjectConstants;
    doc: DocumentVariables;
    type: DocumentType;
    allDocuments: DocumentVariables[];
}

const formatDate = (d?: string) => {
  if (!d) return '---';
  try { return new Date(d).toLocaleDateString('it-IT'); } catch { return d; }
};

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ project, doc }) => {
  if (!project || !doc) return <div className="p-10 text-center text-red-500 font-bold italic">Caricamento dati in corso...</div>;

  const tester = project.subjects?.tester?.contact || { title: 'Arch.', name: '---', pec: '---' };
  const rup = project.subjects?.rup?.contact || { title: 'Arch.', name: '---', pec: '---' };
  const dl = project.subjects?.dl?.contact || { title: 'Arch.', name: '---' };
  const cse = project.subjects?.cse?.contact || { title: 'Arch.', name: '---' };
  const contractor = project.contractor?.mainCompany || { name: '---', repName: '---', repTitle: 'Sig.' };

  // --- 4. FACSIMILE: VERBALE DI VISITA DI COLLAUDO ---
  if (doc.type === 'VERBALE_COLLAUDO') {
    return (
      <div id="document-preview-container" className="font-serif-print text-black leading-snug w-full max-w-[21cm] mx-auto bg-white p-[1.8cm]">
          <div className="text-center border-b-2 border-black pb-4 mb-6">
              <h1 className="text-lg font-bold uppercase">{project.entity || '---'}</h1>
              <p className="text-[10px] tracking-widest uppercase">Esercizio Finanziario _________</p>
          </div>

          <div className="mb-6 font-bold text-center">
              <h2 className="text-xl underline uppercase italic decoration-double">VERBALE DI VISITA DI COLLAUDO N. {doc.visitNumber}</h2>
          </div>

          <div className="mb-6 border p-4 text-xs space-y-1 bg-slate-50/50">
              <p><span className="font-bold uppercase tracking-wider w-32 inline-block">Lavori:</span> <span className="font-bold">{project.projectName}</span></p>
              <p><span className="font-bold uppercase tracking-wider w-32 inline-block">CUP / CIG:</span> {project.cup} / {project.cig}</p>
              <p><span className="font-bold uppercase tracking-wider w-32 inline-block">Impresa:</span> {contractor.name}</p>
              <p><span className="font-bold uppercase tracking-wider w-32 inline-block">Contratto:</span> n. {project.contract.repNumber} del {formatDate(project.contract.date)}</p>
          </div>

          <div className="text-justify text-sm space-y-4">
              <p>In data <span className="font-bold">{formatDate(doc.date)}</span> alle ore <span className="font-bold">{doc.time}</span>, il sottoscritto collaudatore {tester.title} {tester.name}, si è recato presso i lavori in oggetto.</p>
              
              <p>Il collaudatore dà atto che la visita è stata regolarmente convocata con nota via <span className="font-bold">{doc.convocationMethod || '---'}</span> in data <span className="font-bold">{formatDate(doc.convocationDate)}</span> {doc.convocationDetails ? `(${doc.convocationDetails})` : ''}.</p>

              <p className="font-bold underline uppercase text-xs tracking-widest">Soggetti Presenti:</p>
              <div className="ml-4 italic text-xs whitespace-pre-wrap border-l-2 border-slate-200 pl-4 py-1">{doc.attendees || 'Nessun partecipante registrato.'}</div>
              
              <p className="font-bold underline uppercase text-xs tracking-widest">Esito della Visita (Lavorazioni riscontrate):</p>
              <p className="leading-relaxed">{doc.worksIntroText || "Il collaudatore, coadiuvato dai presenti, ha proceduto alla visita riscontrando quanto segue:"}</p>
              
              <ol className="list-decimal ml-10 space-y-2 italic text-xs">
                  {doc.worksExecuted?.map((w, i) => <li key={i}>{w}</li>)}
              </ol>

              {doc.testerRequests && (
                <div className="mt-4">
                    <p className="font-bold uppercase text-xs">Richieste del Collaudatore:</p>
                    <div className="italic text-xs ml-4 whitespace-pre-wrap">{doc.testerRequests}</div>
                </div>
              )}

              {doc.testerInvitations && (
                <div className="mt-4">
                    <p className="font-bold uppercase text-xs">Inviti e Disposizioni:</p>
                    <div className="italic text-xs ml-4 whitespace-pre-wrap">{doc.testerInvitations}</div>
                </div>
              )}

              <div className="mt-6 border-t border-slate-200 pt-4">
                  <p className="font-bold uppercase text-xs">Osservazioni Finali:</p>
                  <p className="italic text-xs">{doc.observations || 'Nessuna osservazione particolare.'}</p>
              </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-10 text-center text-[10px] uppercase font-bold">
              <div>
                  <p className="underline">Il Collaudatore</p>
                  <p className="mt-12 border-t border-black pt-2">{tester.name}</p>
              </div>
              <div>
                  <p className="underline">L'Impresa</p>
                  <p className="mt-12 border-t border-black pt-2">{contractor.name}</p>
              </div>
              <div className="mt-10">
                  <p className="underline">Il Responsabile Unico</p>
                  <p className="mt-12 border-t border-black pt-2">{rup.name}</p>
              </div>
              <div className="mt-10">
                  <p className="underline">Il Direttore Lavori</p>
                  <p className="mt-12 border-t border-black pt-2">{dl.name}</p>
              </div>
          </div>
      </div>
    );
  }

  // --- ALTRI FACSIMILE (Restano invariati per coerenza, già corretti in precedenza) ---
  if (doc.type === 'LET_RICHIESTA_AUT_COLLAUDO' || doc.type === 'NULLAOSTA_COLLAUDO' || doc.type === 'LET_CONVOCAZIONE_COLLAUDO') {
      // Implementazione minima per non rompere il rendering se richiesto
      return (
        <div id="document-preview-container" className="font-serif-print text-black leading-relaxed w-full max-w-[21cm] mx-auto bg-white p-[2cm]">
            <div className="text-center border-b border-black pb-4 mb-8">
                <h1 className="text-xl font-bold uppercase">{project.entity}</h1>
            </div>
            <div className="mb-10 font-bold uppercase text-center underline">
                <p>{doc.type.replace(/_/g, ' ')}</p>
            </div>
            <div className="text-sm space-y-4">
                <p>Oggetto: {project.projectName}</p>
                <p className="whitespace-pre-wrap">{doc.observations || 'Atto amministrativo in corso di redazione.'}</p>
            </div>
        </div>
      );
  }

  return (
    <div className="p-10 text-center text-slate-400 italic">Anteprima non disponibile per questa tipologia.</div>
  );
};
