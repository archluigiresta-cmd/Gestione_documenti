
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ProjectForm } from './components/ProjectForm';
import { ExecutionManager } from './components/ExecutionManager';
import { TestingManager } from './components/TestingManager';
import { ExportManager } from './components/ExportManager';
import { Dashboard } from './components/Dashboard';
import { ProjectConstants, DocumentVariables } from './types';
import { createEmptyProject, createInitialDocument } from './constants';
import { db } from './db';

type ViewType = 'dashboard' | 'workspace';
type TabType = 'general' | 'subjects' | 'tender' | 'contractor' | 'execution' | 'testing' | 'export';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('dashboard');
  const [activeTab, setActiveTab] = useState<TabType>('general');
  
  const [projectList, setProjectList] = useState<ProjectConstants[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectConstants | null>(null);
  const [documents, setDocuments] = useState<DocumentVariables[]>([]);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);

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

  const handleNewProject = async () => {
    const newProject = createEmptyProject();
    newProject.projectName = "Nuovo Intervento";
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
        setCurrentDocId(docs[docs.length - 1].id);
      } else {
        const initialDoc = createInitialDocument(project.id);
        await db.saveDocument(initialDoc);
        setDocuments([initialDoc]);
        setCurrentDocId(initialDoc.id);
      }
      setActiveTab('general');
      setView('workspace');
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

  const handleBackToDashboard = () => {
    setView('dashboard');
    setCurrentProject(null);
    setDocuments([]);
    loadProjects(); 
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
  };

  const createNewVerbale = async () => {
    if (!currentProject) return;
    const lastDoc = documents.reduce((prev, current) => (prev.visitNumber > current.visitNumber) ? prev : current);
    const lastDate = new Date(lastDoc.date).toLocaleDateString('it-IT');
    let historicalAddition = '';
    if (lastDoc.worksExecuted.length > 0) {
      historicalAddition = `\n\n- in data ${lastDate}, con verbale n. ${lastDoc.visitNumber}, si è preso atto delle seguenti lavorazioni: ${lastDoc.worksExecuted.join(', ')};\n`;
    }
    const newDoc: DocumentVariables = {
      ...createInitialDocument(currentProject.id),
      visitNumber: lastDoc.visitNumber + 1,
      premis: (lastDoc.premis + historicalAddition).trim(),
    };
    setDocuments([...documents, newDoc]);
    setCurrentDocId(newDoc.id);
    await db.saveDocument(newDoc);
  };

  const handleDeleteDocument = async (id: string) => {
    if (documents.length <= 1) {
      alert("Impossibile eliminare l'unico documento.");
      return;
    }
    if (confirm("Eliminare questo verbale?")) {
      const newDocs = documents.filter(d => d.id !== id);
      setDocuments(newDocs);
      setCurrentDocId(newDocs[newDocs.length - 1].id);
      await db.deleteDocument(id);
    }
  };

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

  if (!currentProject) return null;

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onBackToDashboard={handleBackToDashboard}
        projectName={currentProject.projectName}
      />
      
      <main className="ml-64 flex-1 p-8 h-screen overflow-y-auto print:ml-0 print:p-0">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {['general', 'subjects', 'tender', 'contractor'].includes(activeTab) && (
            <ProjectForm 
                data={currentProject} 
                onChange={handleProjectUpdate} 
                section={activeTab as any} 
            />
          )}

          {activeTab === 'execution' && currentDocId && (
            <ExecutionManager
              project={currentProject}
              onUpdateProject={handleProjectUpdate}
              documents={documents}
              currentDocId={currentDocId}
              onSelectDocument={setCurrentDocId}
              onUpdateDocument={handleDocumentUpdate}
              onNewDocument={createNewVerbale}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {activeTab === 'testing' && currentDocId && (
            <TestingManager
              documents={documents}
              currentDocId={currentDocId}
              onSelectDocument={setCurrentDocId}
              onUpdateDocument={handleDocumentUpdate}
              onNewDocument={createNewVerbale}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {activeTab === 'export' && currentDocId && (
            <ExportManager
              project={currentProject}
              documents={documents}
              currentDocId={currentDocId}
              onSelectDocument={setCurrentDocId}
            />
          )}

        </div>
      </main>
    </div>
  );
};

export default App;
