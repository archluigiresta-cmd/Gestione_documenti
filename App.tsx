
import React, { useState, useEffect } from 'react';
import { ProjectConstants, DocumentVariables, User } from './types';
import { db } from './db';
import { createEmptyProject, createInitialDocument } from './constants';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';
import { ProjectForm } from './components/ProjectForm';
import { TestingManager } from './components/TestingManager';
import { ExportManager } from './components/ExportManager';
import { ExecutionManager } from './components/ExecutionManager';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<ProjectConstants[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectConstants | null>(null);
  const [documents, setDocuments] = useState<DocumentVariables[]>([]);
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [recoveryStatus, setRecoveryStatus] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      try {
        setRecoveryStatus('Connessione al database...');
        await db.ensureAdminExists();
        
        setRecoveryStatus('Recupero progetti storici...');
        const recovered = await db.recoveryOldData();
        if (recovered > 0) {
            console.log(`Recuperati ${recovered} progetti.`);
        }
      } catch (err: any) {
        console.error("Inizializzazione fallita", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (currentUser) loadProjects();
  }, [currentUser]);

  useEffect(() => {
    if (currentProject) loadDocuments(currentProject.id);
  }, [currentProject]);

  const loadProjects = async () => {
    if (!currentUser) return;
    try {
      const list = await db.getProjectsForUser(currentUser.id, currentUser.email);
      setProjects(list.sort((a, b) => b.lastModified - a.lastModified));
    } catch (e) { console.error(e); }
  };

  const loadDocuments = async (projectId: string) => {
    try {
      const docs = await db.getDocumentsByProject(projectId);
      setDocuments(docs.sort((a, b) => a.visitNumber - b.visitNumber));
    } catch (e) { console.error(e); }
  };

  const handleNewProject = async () => {
    if (!currentUser) return;
    const newP = createEmptyProject(currentUser.id);
    await db.saveProject(newP);
    await loadProjects();
    setCurrentProject(newP);
    setActiveTab('general');
  };

  const handleUpdateProject = (path: string, value: any) => {
    if (!currentProject) return;
    const updated = { ...currentProject, lastModified: Date.now() };
    const keys = path.split('.');
    let cur: any = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!cur[keys[i]]) cur[keys[i]] = {};
      cur = cur[keys[i]];
    }
    cur[keys[keys.length - 1]] = value;
    setCurrentProject(updated);
    db.saveProject(updated);
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white font-sans">
      <div className="w-20 h-20 border-4 border-zinc-800 border-t-blue-500 rounded-[2rem] animate-spin mb-8 shadow-2xl shadow-blue-500/20"></div>
      <div className="text-center">
        <h2 className="text-lg font-black uppercase tracking-[0.4em] text-white/90 mb-2">EdilApp Secure Boot</h2>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500 animate-pulse">{recoveryStatus || 'Verifica integrità dati...'}</p>
      </div>
    </div>
  );

  if (!currentUser) return <AuthScreen onLogin={setCurrentUser} />;

  if (!currentProject) return (
    <Dashboard 
      projects={projects} 
      currentUser={currentUser}
      onSelectProject={setCurrentProject}
      onNewProject={handleNewProject}
      onDeleteProject={async (id) => { if(confirm("Eliminare definitivamente l'appalto?")) { await db.deleteProject(id); loadProjects(); } }}
    />
  );

  return (
    <div className="min-h-screen flex bg-zinc-50 font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        projectName={currentProject.projectName} 
        user={currentUser}
        onBackToDashboard={() => setCurrentProject(null)}
        onLogout={() => { setCurrentUser(null); setCurrentProject(null); }}
      />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto bg-zinc-50/50">
        <div className="max-w-6xl mx-auto">
          {['general', 'subjects', 'design', 'contractor'].includes(activeTab) && (
            <ProjectForm 
              data={currentProject} 
              subTab={activeTab}
              handleChange={handleUpdateProject}
            />
          )}

          {activeTab === 'execution' && (
            <ExecutionManager 
              project={currentProject}
              onUpdateProject={setCurrentProject}
              documents={documents}
              currentDocId={documents[0]?.id || ''}
              onSelectDocument={() => {}}
              onUpdateDocument={async (d) => { await db.saveDocument(d); loadDocuments(currentProject.id); }}
              onNewDocument={async () => { 
                const d = createInitialDocument(currentProject.id); 
                d.type = 'VERBALE_CONSEGNA';
                await db.saveDocument(d); 
                loadDocuments(currentProject.id); 
              }}
              onDeleteDocument={async (id) => { await db.deleteDocument(id); loadDocuments(currentProject.id); }}
            />
          )}

          {activeTab === 'testing' && (
            <TestingManager 
              project={currentProject}
              documents={documents}
              onSaveDocument={async (d) => { await db.saveDocument(d); loadDocuments(currentProject.id); }}
              onDeleteDocument={async (id) => { await db.deleteDocument(id); loadDocuments(currentProject.id); }}
              onCreateDocument={async (type) => {
                const d = createInitialDocument(currentProject.id);
                d.type = type;
                d.visitNumber = documents.filter(x => x.type === type).length + 1;
                await db.saveDocument(d);
                loadDocuments(currentProject.id);
              }}
            />
          )}

          {activeTab.startsWith('export') && (
            <ExportManager 
              project={currentProject}
              documents={documents}
              currentDocId={documents[0]?.id || ''}
              onSelectDocument={() => {}}
              onDeleteDocument={async (id) => { await db.deleteDocument(id); loadDocuments(currentProject.id); }}
              activeExportTab={activeTab}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
