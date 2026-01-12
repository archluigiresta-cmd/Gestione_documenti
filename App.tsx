
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
    const initSystem = async () => {
        try { 
            await db.ensureAdminExists(); 
        } catch (e) { console.error("System init error:", e); }
    };
    initSystem();
  }, []);

  useEffect(() => {
    if (currentUser) { 
        const setup = async () => {
            await db.seedInitialProjects(currentUser.id);
            await loadProjects(); 
        };
        setup();
    }
  }, [currentUser]);

  const loadProjects = async () => {
    if (!currentUser) return;
    try {
      const projects = await db.getProjectsForUser(currentUser.id, currentUser.email);
      setProjectList(projects.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)));
    } catch (error) { console.error("Failed to load projects", error); }
  };

  const handleLogin = (user: User) => { setCurrentUser(user); };
  const handleLogout = () => { setCurrentUser(null); setView('dashboard'); setProjectList([]); };

  const handleSelectProject = async (project: ProjectConstants) => {
    setUserRole(currentUser?.id === project.ownerId ? 'admin' : 'viewer');
    setCurrentProject(project);

    try {
      const docs = await db.getDocumentsByProject(project.id);
      const sortedDocs = docs.sort((a, b) => a.visitNumber - b.visitNumber);
      if (sortedDocs.length > 0) {
        setDocuments(sortedDocs);
        setCurrentDocId(sortedDocs[sortedDocs.length - 1].id);
      } else {
        const initialDoc = createInitialDocument(project.id);
        await db.saveDocument(initialDoc);
        setDocuments([initialDoc]);
        setCurrentDocId(initialDoc.id);
      }
      setActiveTab('general');
      setView('workspace');
    } catch (error) { console.error("Error loading docs", error); }
  };

  if (!currentUser) return <AuthScreen onLogin={handleLogin} />;
  
  if (view === 'workspace' && currentProject && currentDocId) {
      return (
        <div className="flex bg-slate-100 min-h-screen">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onBackToDashboard={() => setView('dashboard')} projectName={currentProject.projectName} user={currentUser} onLogout={handleLogout} />
          <main className="ml-64 flex-1 p-8 h-screen overflow-y-auto">
              {['general', 'design', 'subjects', 'tender', 'contractor'].includes(activeTab) && (
                <ProjectForm key={activeTab} data={currentProject} onChange={async (p) => { setCurrentProject(p); await db.saveProject(p); }} section={activeTab as any} readOnly={userRole === 'viewer'} />
              )}
              {activeTab === 'execution' && (
                <ExecutionManager project={currentProject} onUpdateProject={async (p) => { setCurrentProject(p); await db.saveProject(p); }} documents={documents} currentDocId={currentDocId} onSelectDocument={setCurrentDocId} onUpdateDocument={async (d) => { setDocuments(documents.map(x => x.id === d.id ? d : x)); await db.saveDocument(d); }} onNewDocument={() => {}} onDeleteDocument={() => {}} readOnly={userRole === 'viewer'} />
              )}
              {activeTab === 'testing' && (
                <TestingManager project={currentProject} documents={documents} currentDocId={currentDocId} onSelectDocument={setCurrentDocId} onUpdateDocument={async (d) => { setDocuments(documents.map(x => x.id === d.id ? d : x)); await db.saveDocument(d); }} onNewDocument={() => {}} onDeleteDocument={() => {}} readOnly={userRole === 'viewer'} />
              )}
              {activeTab === 'export' && (
                <ExportManager project={currentProject} documents={documents} currentDocId={currentDocId} onSelectDocument={setCurrentDocId} />
              )}
          </main>
        </div>
      );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
        {view === 'admin-panel' ? (
            <AdminPanel onBack={() => setView('dashboard')} currentUser={currentUser} />
        ) : (
            <Dashboard projects={projectList} onSelectProject={handleSelectProject} onNewProject={() => {}} onDeleteProject={() => {}} onShareProject={() => {}} onOpenAdmin={() => setView('admin-panel')} onUpdateOrder={() => {}} onMoveProject={() => {}} onExportData={() => {}} currentUser={currentUser} />
        )}
    </div>
  );
};

export default App;
