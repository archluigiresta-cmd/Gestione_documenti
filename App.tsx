
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ProjectForm } from './components/ProjectForm';
import { DocumentEditor } from './components/DocumentEditor';
import { DocumentPreview } from './components/DocumentPreview';
import { Dashboard } from './components/Dashboard';
import { ProjectConstants, DocumentVariables } from './types';
import { createEmptyProject, createInitialDocument } from './constants';
import { db } from './db';
import { Printer } from 'lucide-react';

const App: React.FC = () => {
  // Navigation State
  const [view, setView] = useState<'dashboard' | 'project'>('dashboard');
  const [activeTab, setActiveTab] = useState<'project' | 'editor' | 'preview'>('project');
  
  // Data State
  const [projectList, setProjectList] = useState<ProjectConstants[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectConstants | null>(null);
  const [documents, setDocuments] = useState<DocumentVariables[]>([]);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);

  // Load Projects List on Mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const projects = await db.getProjects();
      setProjectList(projects);
    } catch (error) {
      console.error("Failed to load projects", error);
    }
  };

  // --- Dashboard Logic ---

  const handleNewProject = async () => {
    const newProject = createEmptyProject();
    newProject.projectName = "Nuovo Appalto"; // Default title
    const initialDoc = createInitialDocument(newProject.id);
    
    await db.saveProject(newProject);
    await db.saveDocument(initialDoc);
    
    setProjectList([...projectList, newProject]);
    handleSelectProject(newProject);
  };

  const handleSelectProject = async (project: ProjectConstants) => {
    setCurrentProject(project);
    try {
      const docs = await db.getDocumentsByProject(project.id);
      if (docs.length > 0) {
        setDocuments(docs);
        setCurrentDocId(docs[docs.length - 1].id); // Select latest
      } else {
        // Recover if no docs found (shouldn't happen with correct creation flow)
        const initialDoc = createInitialDocument(project.id);
        await db.saveDocument(initialDoc);
        setDocuments([initialDoc]);
        setCurrentDocId(initialDoc.id);
      }
      setActiveTab('project');
      setView('project');
    } catch (error) {
      console.error("Error loading project documents", error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
      try {
          await db.deleteProject(projectId);
          await loadProjects();
      } catch (e) {
          console.error("Failed to delete project", e);
      }
  };

  // --- Project View Logic ---

  const handleBackToDashboard = () => {
    setView('dashboard');
    setCurrentProject(null);
    setDocuments([]);
    loadProjects(); // Refresh list to update "last modified" or other details
  };

  const handleProjectUpdate = async (newData: ProjectConstants) => {
    const updated = { ...newData, lastModified: Date.now() };
    setCurrentProject(updated);
    await db.saveProject(updated);
  };

  const handleDocumentUpdate = async (updatedDoc: DocumentVariables) => {
    const newDocs = documents.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc);
    setDocuments(newDocs);
    await db.saveDocument(updatedDoc);
    
    // Also update project lastModified timestamp
    if (currentProject) {
        const updatedProject = { ...currentProject, lastModified: Date.now() };
        setCurrentProject(updatedProject);
        await db.saveProject(updatedProject);
    }
  };

  const createNewVerbale = async () => {
    if (!currentProject) return;

    // 1. Find the latest document to calculate progressives
    const lastDoc = documents.reduce((prev, current) => (prev.visitNumber > current.visitNumber) ? prev : current);

    // 2. Format the date of the previous verbale
    const lastDate = new Date(lastDoc.date).toLocaleDateString('it-IT');

    // 3. Generate the historical text block
    let historicalAddition = '';
    if (lastDoc.worksExecuted.length > 0) {
      historicalAddition = `\n\n- in data ${lastDate}, con verbale di visita di collaudo tecnico amministrativo e statico in corso d'opera n. ${lastDoc.visitNumber} sottoscritto in pari data, lo scrivente Collaudatore, con la scorta del progetto, dei documenti contabili, ha compiuto, insieme ai presenti, un esame generale del carteggio relativo al progetto... ed ha preso atto dell'andamento dei lavori eseguiti dalla consegna a detta data, così come dettagliati dal Direttore dei Lavori e di seguito riportate:\n`;
      lastDoc.worksExecuted.forEach((work, idx) => {
        historicalAddition += `${idx + 1}. ${work};\n`;
      });
    }

    // 4. Create new document
    const newDoc: DocumentVariables = {
      ...createInitialDocument(currentProject.id),
      visitNumber: lastDoc.visitNumber + 1,
      premis: (lastDoc.premis + historicalAddition).trim(),
    };

    setDocuments([...documents, newDoc]);
    setCurrentDocId(newDoc.id);
    setActiveTab('editor');
    
    await db.saveDocument(newDoc);
  };

  const handleDeleteDocument = async (id: string) => {
    if (documents.length <= 1) {
      alert("Impossibile eliminare l'unico documento.");
      return;
    }
    if (confirm("Sei sicuro di voler eliminare questo verbale?")) {
      const newDocs = documents.filter(d => d.id !== id);
      setDocuments(newDocs);
      setCurrentDocId(newDocs[newDocs.length - 1].id);
      await db.deleteDocument(id);
    }
  };

  const currentDoc = documents.find(d => d.id === currentDocId) || documents[0];

  const handlePrint = () => {
    window.print();
  };

  // --- RENDER ---

  if (view === 'dashboard') {
    return (
      <div className="bg-slate-50 min-h-screen">
        <Dashboard 
          projects={projectList} 
          onSelectProject={handleSelectProject}
          onNewProject={handleNewProject}
          onDeleteProject={handleDeleteProject}
        />
      </div>
    );
  }

  // Project View
  if (!currentProject) return null;

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        documents={documents}
        currentDocId={currentDocId || ''}
        setCurrentDocId={(id) => setCurrentDocId(id)}
        onNewDocument={createNewVerbale}
        onDeleteDocument={handleDeleteDocument}
        onBackToDashboard={handleBackToDashboard}
      />
      
      <main className="ml-64 flex-1 p-8 h-screen overflow-y-auto">
        
        {activeTab === 'preview' && (
          <div className="fixed top-6 right-8 z-20 no-print">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 font-semibold transition-all"
            >
              <Printer className="w-5 h-5" />
              Stampa / Salva PDF
            </button>
          </div>
        )}

        <div className={activeTab === 'preview' ? 'print-container' : 'max-w-5xl mx-auto'}>
          
          {activeTab === 'project' && (
            <ProjectForm data={currentProject} onChange={handleProjectUpdate} />
          )}

          {activeTab === 'editor' && currentDoc && (
            <DocumentEditor 
              data={currentDoc} 
              onChange={handleDocumentUpdate} 
            />
          )}

          {activeTab === 'preview' && currentDoc && (
            <div className="flex flex-col items-center">
               <div className="mb-6 text-center no-print text-slate-500 text-sm bg-yellow-50 border border-yellow-200 p-4 rounded-lg max-w-lg">
                  <strong>Modalità Stampa:</strong> Le foto sono visualizzate qui se caricate in questa sessione. 
                  Usa "Salva come PDF" dal browser per archiviare il verbale completo.
               </div>
               <DocumentPreview project={currentProject} doc={currentDoc} />
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;
