
import React, { useState } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType } from './types';
import { db } from './db';
import { createInitialDocument } from './constants';

// Fixed: Wrapping code in a functional component and exporting it as a module
const App: React.FC = () => {
  const [currentProject, setCurrentProject] = useState<ProjectConstants | null>(null);
  const [documents, setDocuments] = useState<DocumentVariables[]>([]);
  const [currentDocId, setCurrentDocId] = useState<string>('');
  const [userRole, setUserRole] = useState<'admin' | 'editor' | 'viewer'>('admin');

  // Fixed: Defined createNewDocument within the component scope
  const createNewDocument = async (type: DocumentType) => {
    if (!currentProject || userRole === 'viewer') return;
    
    let nextNum = 1;
    let lastPremis = '';
    
    // Solo per i verbali gestiamo la numerazione e le premesse storiche
    if (type === 'VERBALE_COLLAUDO') {
        const verbaliExist = documents.filter(d => d.type === 'VERBALE_COLLAUDO');
        if (verbaliExist.length > 0) {
            // Trova il numero massimo e incrementa
            const maxNum = Math.max(...verbaliExist.map(v => v.visitNumber));
            nextNum = maxNum + 1;
            
            // Recupera premesse storiche dall'ultimo verbale per continuità
            const lastDoc = verbaliExist.find(v => v.visitNumber === maxNum);
            if (lastDoc) {
                lastPremis = lastDoc.premis || '';
                if (lastDoc.worksExecuted && lastDoc.worksExecuted.length > 0) {
                    const lastDate = new Date(lastDoc.date).toLocaleDateString('it-IT');
                    lastPremis += `\n\n- in data ${lastDate}, con verbale n. ${lastDoc.visitNumber}, si è preso atto delle lavorazioni: ${lastDoc.worksExecuted.join(', ')};\n`;
                }
            }
        }
    }

    // Fixed: createInitialDocument is now imported from constants.ts
    const newDoc: DocumentVariables = {
      ...createInitialDocument(currentProject.id),
      type: type,
      visitNumber: nextNum,
      premis: lastPremis.trim(),
    };

    const updatedDocs = [...documents, newDoc];
    setDocuments(updatedDocs);
    setCurrentDocId(newDoc.id);
    // Fixed: db is now imported from db.ts
    await db.saveDocument(newDoc);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* App logic here */}
    </div>
  );
};

export default App;
