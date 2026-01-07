
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

  const tester = project.subjects?.tester?.contact || { title: 'Arch.', name: '---' };
  const rup = project.subjects?.rup?.contact || { title: 'Arch.', name: '---' };
  const contractor = project.contractor?.mainCompany || { name: '---' };

  // --- TEMPLATE: RICHIESTA AUTORIZZAZIONE COLLAUDO ---
  if (doc.type === 'LET_RICHIESTA_AUT_COLLAUDO') {
    return (
      <div id="document-preview-container" className="font-serif-print text-black leading-relaxed w-full max-w-[21cm] mx-auto bg-white p-[2cm]">
          <div className="text-center border-b border-black pb-4 mb-10">
              <h1 className="text-xl font-bold uppercase">{project.entity}</h1>
          </div>
          <div className="text-right mb-10 text-sm italic">
              <p>Lì, {formatDate(doc.date)}</p>
          </div>
          <div className="mb-10 text-sm">
              <p className="font-bold">Al Responsabile Unico del Progetto:</p>
              <p className="ml-4">{rup.name}</p>
          </div>
          <div className="mb-10 font-bold uppercase text-center underline">
              <p>OGGETTO: Richiesta di nullaosta e autorizzazione all'avvio delle operazioni di collaudo</p>
          </div>
          <div className="text-justify space-y-4 text-sm">
              <p>In riferimento ai lavori di: <span className="font-bold">{project.projectName}</span></p>
              <p>Il sottoscritto Collaudatore incaricato, vista la comunicazione di ultimazione dei lavori e la consegna degli atti contabili,</p>
              <p>CHIEDE alla S.V. il rilascio del nullaosta tecnico-amministrativo necessario per procedere alla fissazione della data della prima visita di collaudo, al fine di accertare la corretta esecuzione delle opere in conformità al progetto e al contratto.</p>
          </div>
          <div className="mt-20 flex justify-end text-sm">
              <div className="text-center w-64">
                  <p className="italic">Il Collaudatore</p>
                  <p className="mt-10 border-t border-black pt-2">{tester.name}</p>
              </div>
          </div>
      </div>
    );
  }

  // --- TEMPLATE: LETTERA DI CONVOCAZIONE (FACSIMILE) ---
  if (doc.type === 'LET_CONVOCAZIONE_COLLAUDO') {
    return (
      <div id="document-preview-container" className="font-serif-print text-black leading-relaxed w-full max-w-[21cm] mx-auto bg-white p-[2cm]">
          <div className="text-center border-b border-slate-300 pb-4 mb-10">
              <h1 className="text-lg font-bold uppercase opacity-70">{project.entity}</h1>
          </div>
          <div className="grid grid-cols-2 mb-10 text-sm">
              <div>
                  <p className="font-bold underline">Il Collaudatore:</p>
                  <p>{tester.name}</p>
                  <p>{tester.pec || ''}</p>
              </div>
              <div className="text-right">
                  <p className="font-bold underline">DESTINATARI:</p>
                  <p>Spett.le {project.entity}</p>
                  <p>Al RUP: {rup.name}</p>
                  <p>All'Impresa: {contractor.name}</p>
              </div>
          </div>
          <div className="mb-10 font-bold uppercase text-justify text-sm">
              <p>OGGETTO: Lettera di Convocazione per la visita di collaudo - {project.projectName}</p>
          </div>
          <div className="text-justify space-y-6 text-sm">
              <p>In riferimento ai lavori in oggetto, con la presente si comunica che le operazioni di visita di collaudo avranno luogo il giorno <span className="font-bold underline">{formatDate(doc.date)}</span> alle ore <span className="font-bold underline">{doc.time}</span> presso il cantiere o la sede indicata.</p>
              <p>Si invitano le SS.VV. a partecipare o a farsi rappresentare per il regolare svolgimento delle operazioni, assicurando la presenza dei documenti tecnici necessari e l'accesso a tutte le aree di intervento.</p>
              <p>Distinti saluti.</p>
          </div>
          <div className="mt-24 flex justify-end text-sm">
              <div className="text-center w-64">
                  <p className="italic">Il Collaudatore</p>
                  <p className="mt-8 border-t border-slate-400 pt-2">{tester.name}</p>
              </div>
          </div>
      </div>
    );
  }

  // --- TEMPLATE: NULLAOSTA AL COLLAUDO (FACSIMILE) ---
  if (doc.type === 'NULLAOSTA_COLLAUDO') {
    return (
      <div id="document-preview-container" className="font-serif-print text-black leading-relaxed w-full max-w-[21cm] mx-auto bg-white p-[2cm]">
          <div className="text-center border-b-2 border-black pb-4 mb-10">
              <h1 className="text-xl font-bold uppercase">{project.entity}</h1>
          </div>
          <div className="text-right mb-10 text-sm">
              <p>Lì, {formatDate(doc.date)}</p>
          </div>
          <div className="mb-10">
              <p className="font-bold">Allo Spett.le Collaudatore:</p>
              <p className="ml-4">{tester.name}</p>
          </div>
          <div className="mb-10 font-bold uppercase text-center underline">
              <p>OGGETTO: NULLAOSTA ALL'EFFETTUAZIONE DELLE OPERAZIONI DI COLLAUDO</p>
          </div>
          <div className="text-justify space-y-4">
              <p>In riferimento ai lavori di: <span className="font-bold">{project.projectName}</span></p>
              <p>Il sottoscritto Responsabile Unico del Progetto, visti gli atti di contabilità finale ed accertata la regolare esecuzione dei lavori,</p>
              <p className="font-bold text-center py-4">COMUNICA</p>
              <p>che non sussistono impedimenti tecnici o amministrativi all'effettuazione delle visite di collaudo e autorizza lo scrivente Collaudatore a procedere con le relative operazioni previste dalla legge.</p>
          </div>
          <div className="mt-20 flex justify-end">
              <div className="text-center w-64">
                  <p className="text-xs font-bold">Il R.U.P.</p>
                  <p className="mt-10 border-t border-black pt-2">{rup.name}</p>
              </div>
          </div>
      </div>
    );
  }

  // --- TEMPLATE: VERBALE DI VISITA ---
  if (doc.type === 'VERBALE_COLLAUDO') {
    return (
      <div id="document-preview-container" className="font-serif-print text-black leading-snug w-full max-w-[21cm] mx-auto bg-white p-[1.8cm]">
          <div className="text-center border-b-2 border-black pb-4 mb-6">
              <h1 className="text-lg font-bold uppercase">{project.entity || '---'}</h1>
              <p className="text-xs">CUP: {project.cup} - CIG: {project.cig}</p>
          </div>
          <div className="mb-6 font-bold text-center">
              <h2 className="text-xl underline uppercase italic">VERBALE DI VISITA DI COLLAUDO N. {doc.visitNumber}</h2>
          </div>
          <div className="mb-6 border p-4 text-xs space-y-1">
              <p><span className="font-bold uppercase tracking-wider">Lavori:</span> {project.projectName}</p>
              <p><span className="font-bold uppercase tracking-wider">Impresa:</span> {contractor.name}</p>
              <p><span className="font-bold uppercase tracking-wider">R.U.P.:</span> {rup.name}</p>
          </div>
          <div className="text-justify text-sm space-y-4">
              <p>In data <span className="font-bold">{formatDate(doc.date)}</span> alle ore {doc.time}, il sottoscritto collaudatore si è recato presso i lavori in oggetto per procedere alle operazioni di collaudo.</p>
              <p className="font-bold underline">SOGGETTI PRESENTI:</p>
              <div className="ml-4 italic whitespace-pre-wrap border-l border-slate-200 pl-4">{doc.attendees}</div>
              <p className="font-bold underline uppercase text-xs tracking-widest">Esito della Visita:</p>
              <p>{doc.worksIntroText || "Il collaudatore ha proceduto alla visita riscontrando quanto segue:"}</p>
              <ul className="list-disc ml-8">
                  {doc.worksExecuted.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
              <div className="mt-6 border-t pt-4">
                  <p className="font-bold">OSSERVAZIONI E DISPOSIZIONI:</p>
                  <p className="italic">{doc.observations || 'Nessuna osservazione.'}</p>
              </div>
          </div>
          <div className="mt-20 grid grid-cols-2 gap-20 text-center text-xs">
              <div>
                  <p className="font-bold uppercase tracking-tighter">Il Collaudatore</p>
                  <p className="mt-10 border-t border-black pt-2">{tester.name}</p>
              </div>
              <div>
                  <p className="font-bold uppercase tracking-tighter">Il R.U.P.</p>
                  <p className="mt-10 border-t border-black pt-2">{rup.name}</p>
              </div>
          </div>
      </div>
    );
  }

  // Default Fallback per Relazioni o altri documenti
  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-relaxed w-full max-w-[21cm] mx-auto bg-white p-[2cm]">
        <div className="text-center border-b-2 border-black pb-4 mb-10">
            <h1 className="text-xl font-bold uppercase">{project.entity}</h1>
        </div>
        <div className="mb-10 font-bold uppercase text-center underline decoration-2 underline-offset-4">
            <p>{doc.type.replace(/_/g, ' ')}</p>
        </div>
        <div className="text-justify space-y-6 text-sm">
            <p>Intervento: <span className="font-bold">{project.projectName}</span></p>
            <p className="font-bold">RELAZIONE DESCRITTIVA</p>
            <p>{doc.observations || 'Relazione in fase di redazione.'}</p>
        </div>
        <div className="mt-24 flex justify-end text-sm">
            <div className="text-center w-64">
                <p className="italic">Il Collaudatore</p>
                <p className="mt-10 border-t border-black pt-2">{tester.name}</p>
            </div>
        </div>
    </div>
  );
};
