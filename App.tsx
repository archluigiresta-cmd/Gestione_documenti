
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ProjectForm } from './components/ProjectForm';
import { ExecutionManager } from './components/ExecutionManager';
import { TestingManager } from './components/TestingManager';
import { ExportManager } from './components/ExportManager';
import { Dashboard } from './components/Dashboard';
import { AuthScreen } from './components/AuthScreen';
import { AdminPanel } from './components/AdminPanel';
import { ProjectConstants, DocumentVariables, User, PermissionRole } from './types';
import { createEmptyProject, createInitialDocument } from './constants';
import { db } from './db';

type ViewType = 'dashboard' | 'workspace' | 'admin-panel';
type TabType = 'general' | 'design' | 'subjects' | 'tender' | 'contractor' | 'execution' | 'testing' | 'export';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewType>('dashboard');
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [projectList, setProjectList] = useState<ProjectConstants[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectConstants | null>(null);
  const [userRole, setUserRole] = useState<PermissionRole>('viewer');
  const [documents, setDocuments] = useState<DocumentVariables[]>([]);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => { await db.ensureAdminExists(); };
    init();
  }, []);

  useEffect(() => {
    if (currentUser) loadProjects();
  }, [currentUser]);

  const loadProjects = async () => {
    if (!currentUser) return;
    const projects = await db.getProjectsForUser(currentUser.id, currentUser.email);
    setProjectList(projects.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)));
  };

  const handleSelectProject = async (project: ProjectConstants) => {
    setUserRole(currentUser?.id === project.ownerId || currentUser?.isSystemAdmin ? 'admin' : 'viewer');
    setCurrentProject(project);
    const docs = await db.getDocumentsByProject(project.id);
    const sorted = docs.sort((a, b) => a.visitNumber - b.visitNumber);
    setDocuments(sorted);
    if (sorted.length > 0) {
      setCurrentDocId(sorted[sorted.length - 1].id);
    } else {
      const initial = createInitialDocument(project.id);
      await db.saveDocument(initial);
      setDocuments([initial]);
      setCurrentDocId(initial.id);
    }
    setView('workspace');
    setActiveTab('general');
  };

  const handleNewProject = async () => {
    if (!currentUser) return;
    const project = createEmptyProject(currentUser.id);
    project.projectName = "Nuovo Appalto";
    await db.saveProject(project);
    await loadProjects();
    handleSelectProject(project);
  };

  const handleProjectUpdate = async (newData: ProjectConstants) => {
    setCurrentProject(newData);
    await db.saveProject(newData);
  };

  const handleDocumentUpdate = async (doc: DocumentVariables) => {
    setDocuments(prev => prev.map(d => d.id === doc.id ? doc : d));
    await db.saveDocument(doc);
  };

  const handleNewDocument = async () => {
    if (!currentProject) return;
    const nextNum = documents.length > 0 ? Math.max(...documents.map(d => d.visitNumber)) + 1 : 1;
    const newDoc = createInitialDocument(currentProject.id);
    newDoc.visitNumber = nextNum;
    
    // Autofill premis with previous visits summary
    if (documents.length > 0) {
        const history = documents
            .sort((a, b) => a.visitNumber - b.visitNumber)
            .map(d => `In data ${new Date(d.date).toLocaleDateString()} si è tenuta la visita n. ${d.visitNumber};`)
            .join('\n');
        newDoc.premis = `Visti i precedenti verbali di collaudo:\n${history}\n\nsi procede alla presente visita.`;
    }

    await db.saveDocument(newDoc);
    const docs = await db.getDocumentsByProject(currentProject.id);
    setDocuments(docs.sort((a, b) => a.visitNumber - b.visitNumber));
    setCurrentDocId(newDoc.id);
  };

  const handleDeleteDocument = async (id: string) => {
      if(!confirm('Eliminare questo verbale?')) return;
      await db.deleteDocument(id);
      const docs = documents.filter(d => d.id !== id);
      setDocuments(docs);
      if(docs.length > 0) setCurrentDocId(docs[docs.length-1].id);
  };

  if (!currentUser) return <AuthScreen onLogin={setCurrentUser} />;
  
  if (view === 'admin-panel') return <AdminPanel onBack={() => setView('dashboard')} currentUser={currentUser} />;

  if (view === 'workspace' && currentProject && currentDocId) {
    const isReadOnly = userRole === 'viewer';
    return (
      <div className="flex bg-slate-100 min-h-screen">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onBackToDashboard={() => setView('dashboard')} projectName={currentProject.projectName} user={currentUser} onLogout={() => setCurrentUser(null)} />
        <main className="ml-64 flex-1 p-8 h-screen overflow-y-auto print:ml-0 print:p-0">
          {['general', 'design', 'subjects', 'tender', 'contractor'].includes(activeTab) && (
            <ProjectForm data={currentProject} onChange={handleProjectUpdate} section={activeTab as any} readOnly={isReadOnly} />
          )}
          {activeTab === 'execution' && (
            <ExecutionManager project={currentProject} onUpdateProject={handleProjectUpdate} documents={documents} currentDocId={currentDocId} onSelectDocument={setCurrentDocId} onUpdateDocument={handleDocumentUpdate} onNewDocument={handleNewDocument} onDeleteDocument={handleDeleteDocument} readOnly={isReadOnly} />
          )}
          {activeTab === 'testing' && (
            <TestingManager project={currentProject} documents={documents} currentDocId={currentDocId} onSelectDocument={setCurrentDocId} onUpdateDocument={handleDocumentUpdate} onNewDocument={handleNewDocument} onDeleteDocument={handleDeleteDocument} readOnly={isReadOnly} onUpdateProject={handleProjectUpdate} />
          )}
          {activeTab === 'export' && (
            <ExportManager project={currentProject} documents={documents} currentDocId={currentDocId} onSelectDocument={setCurrentDocId} onNewDocument={handleNewDocument} />
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <Dashboard 
        projects={projectList} 
        onSelectProject={handleSelectProject} 
        onNewProject={handleNewProject} 
        onDeleteProject={async (id) => { if(confirm('Eliminare appalto?')) { await db.deleteProject(id); loadProjects(); }}} 
        onShareProject={() => {}} 
        onOpenAdmin={() => setView('admin-panel')} 
        onUpdateOrder={() => {}} 
        onMoveProject={() => {}} 
        onExportData={async () => {
            const data = await db.getDatabaseBackup();
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'backup.json'; a.click();
        }} 
        currentUser={currentUser} 
      />
    </div>
  );
};

export default App;
