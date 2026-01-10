
import React from 'react';
import { ProjectConstants, DocumentVariables, DocumentType, ContactInfo } from '../types';

interface DocumentPreviewProps {
  project: ProjectConstants;
  doc: DocumentVariables;
  type: DocumentType;
  allDocuments?: DocumentVariables[]; 
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ project, doc, type, allDocuments = [] }) => {
  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return '...';
    try { return new Date(dateStr).toLocaleDateString('it-IT'); } catch { return dateStr; }
  };

  const formatNameWithTitle = (contact: { title?: string, name: string }) => {
      if (!contact || !contact.name) return '...';
      const titlePrefix = contact.title ? `${contact.title} ` : '';
      return `${titlePrefix}${contact.name}`;
  };

  const formatFullAddress = (c: ContactInfo) => {
      if (!c.address) return '';
      const parts = [c.address];
      if (c.zip || c.city || c.province) {
          const loc = [c.zip, c.city, c.province ? `(${c.province})` : ''].filter(p => p).join(' ');
          parts.push(loc);
      }
      return parts.join(' - ');
  };

  const renderContactLines = (c: ContactInfo) => {
      return (
          <>
            {c.address && <p className="text-[9.5pt] font-normal capitalize italic">{formatFullAddress(c)}</p>}
            <div className="flex flex-col text-[9pt] font-normal lowercase italic underline">
                {c.pec && <span>PEC: {c.pec}</span>}
                {c.email && <span>Email: {c.email}</span>}
            </div>
          </>
      );
  };

  const getRecipientInfo = (id: string) => {
      if (id === 'rup') {
          return { 
              contact: project.subjects.rup.contact, 
              label: 'SPETT.LE ' + (project.subjects.testerAppointment.nominationAuthority || project.entity), 
              subLabel: 'ALLA C.A. DEL RUP ' + formatNameWithTitle(project.subjects.rup.contact) 
          };
      }
      if (id === 'dl') {
          return { 
              contact: project.subjects.dl.contact, 
              label: project.subjects.dl.contact.name || 'DIREZIONE LAVORI', 
              subLabel: 'ALLA C.A. DEL DL ' + formatNameWithTitle(project.subjects.dl.contact) 
          };
      }
      if (id === 'contractor') {
          const prefix = project.contractor.type === 'single' ? 'SPETT.LE ' : 'SPETT.LE (Mandataria/Capogruppo) ';
          return { 
              contact: project.contractor.mainCompany, 
              label: prefix + project.contractor.mainCompany.name, 
              subLabel: '' 
          };
      }
      if (id.startsWith('mandant-')) {
          const idx = parseInt(id.split('-')[1]);
          const m = project.contractor.mandants[idx];
          return { contact: m, label: 'SPETT.LE (Impresa Mandante) ' + (m?.name || '...'), subLabel: '' };
      }
      if (id.startsWith('executor-')) {
          const idx = parseInt(id.split('-')[1]);
          const e = project.contractor.executors[idx];
          return { contact: e, label: 'SPETT.LE (Consorziata Esecutrice) ' + (e?.name || '...'), subLabel: '' };
      }
      if (id.startsWith('other-')) {
          const idx = parseInt(id.split('-')[1]);
          const other = project.subjects.others?.[idx];
          return { 
              contact: other?.contact, 
              label: other?.contact.role?.toUpperCase() || 'SOGGETTO INTERESSATO', 
              subLabel: formatNameWithTitle(other?.contact as any) 
          };
      }
      return null;
  };

  if (type === 'LETTERA_CONVOCAZIONE') {
    const tester = project.subjects.tester.contact;
    const recs = doc.letterRecipients || [];

    return (
      <div id="document-preview-container" className="font-serif-print text-black leading-tight w-full max-w-[21cm] bg-white p-[1.5cm] min-h-[29.7cm] flex flex-col">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-16">
            <div>
                <h1 className="text-xl font-bold uppercase tracking-wider m-0">{tester.name || 'LUIGI RESTA'}</h1>
            </div>
            <div className="text-right">
                <p className="text-sm uppercase tracking-[0.2em] font-medium m-0">ARCHITETTO</p>
            </div>
        </div>

        {/* RECIPIENTS BLOCK */}
        <div className="flex justify-end mb-12">
            <div className="w-[62%] text-[10.5pt] space-y-6 text-left">
                {recs.map((rec, rIdx) => {
                    const info = getRecipientInfo(rec.id);
                    if (!info || !info.contact) return null;
                    return (
                        <div key={rIdx} className="space-y-0.5 uppercase font-bold">
                            {rec.isPc && <p className="text-[9.5pt] font-normal lowercase italic mb-1">E, p.c.</p>}
                            <p>{info.label}</p>
                            {info.subLabel && <p>{info.subLabel}</p>}
                            {renderContactLines(info.contact)}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* OGGETTO */}
        <div className="mb-10 text-[10.5pt] text-justify leading-relaxed">
            <p><span className="font-bold uppercase">Oggetto: {project.projectName}</span>{project.cup ? ` - CUP: ${project.cup}` : ''}{project.cig ? ` - CIG: ${project.cig}` : ''}.</p>
            <p className="font-bold mt-2 tracking-wide underline uppercase">Convocazione {doc.visitNumber}° visita di collaudo</p>
        </div>

        {/* BODY */}
        <div className="text-[10.5pt] text-justify space-y-5 flex-grow leading-[1.35]">
            <p>{doc.letterIntro}</p>
            {(doc.letterBodyParagraphs || []).map((p, i) => <p key={i}>{p}</p>)}
            <p className="pt-2">{doc.letterClosing || 'Distinti saluti'}</p>
        </div>

        {/* SIGNATURE */}
        <div className="mt-8 text-right text-[10.5pt]">
            <p className="uppercase font-bold m-0 leading-tight">IL COLLAUDATORE</p>
            <p className="mt-6 font-bold text-[11pt] tracking-wide m-0">{formatNameWithTitle(tester)}</p>
            <div className="h-16"></div>
        </div>

        {/* FOOTER: DYNAMIC TESTER DATA */}
        <div className="mt-auto pt-4 border-t border-slate-300 grid grid-cols-2 gap-x-8 text-[8.5pt] text-slate-600">
            <div className="space-y-1">
                <p className="font-medium">{formatFullAddress(tester) || 'Piazza Matteotti, 3 - 72023 Mesagne'}</p>
                <p>{tester.phone ? `Cell: ${tester.phone}` : 'Cell: 392.6739862'}</p>
            </div>
            <div className="text-right space-y-1">
                <p>PEC: <span className="underline">{tester.pec || 'arch.luigiresta@pec.it'}</span></p>
                <p>Email: <span className="underline">{tester.email || 'arch.luigiresta@gmail.com'}</span></p>
                {tester.vat && <p>C.F./P.IVA: {tester.vat}</p>}
            </div>
        </div>
      </div>
    );
  }

  // STANDARD VERBALE PREVIEW
  return (
    <div id="document-preview-container" className="font-serif-print text-black leading-normal w-full max-w-[21cm] bg-white p-[1.5cm] shadow-lg">
        <div className="text-center mb-10">
            {project.headerLogo && <img src={project.headerLogo} className="h-16 mx-auto mb-4" />}
            <h2 className="font-bold uppercase tracking-wide">{project.entity}</h2>
            <p className="text-xs uppercase mt-2 italic">Lavori di: {project.projectName}</p>
            <h3 className="font-bold mt-6 uppercase border-y py-3 text-lg">Verbale di Collaudo n. {doc.visitNumber}</h3>
        </div>

        <div className="text-sm space-y-4">
            <p><strong>Luogo:</strong> {project.location}</p>
            <p><strong>Data:</strong> {new Date(doc.date).toLocaleDateString('it-IT')} ore {doc.time}</p>
            <p><strong>Presenti:</strong></p>
            <p className="italic ml-4 whitespace-pre-line leading-relaxed">{doc.attendees || '...'}</p>
            
            <div className="mt-8 text-justify">
                <p className="font-bold mb-2">Premesso che:</p>
                <p className="whitespace-pre-line leading-relaxed">{doc.premis}</p>
            </div>

            <div className="mt-6">
                <p className="font-bold mb-2">Lavorazioni Eseguite:</p>
                <ul className="list-disc ml-6 space-y-1">
                    {doc.worksExecuted.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
            </div>

            <div className="mt-8">
                <p className="font-bold mb-2">Osservazioni:</p>
                <p className="whitespace-pre-line leading-relaxed">{doc.observations}</p>
            </div>
        </div>

        <div className="mt-20 flex justify-between border-t border-slate-200 pt-6">
            <div className="text-center w-1/3">
                <p className="text-[10px] uppercase font-bold italic text-slate-500 mb-8">L'Impresa</p>
                <p className="text-xs border-b border-black w-full pb-1"></p>
            </div>
            <div className="text-center w-1/3">
                <p className="text-[10px] uppercase font-bold italic text-slate-500 mb-8">Il Collaudatore</p>
                <p className="text-xs font-bold">{formatNameWithTitle(project.subjects.tester.contact)}</p>
            </div>
        </div>
    </div>
  );
};
