
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ProjectForm } from './components/ProjectForm';
import { ExecutionManager } from './components/ExecutionManager';
import { TestingManager } from './components/TestingManager';
import { ExportManager } from './components/ExportManager';
import { Dashboard } from './components/Dashboard';
import { AuthScreen } from './components/AuthScreen';
import { ProjectSharing } from './components/ProjectSharing';
import { AdminPanel } from './components/AdminPanel';
import { VisitSummary } from './components/VisitSummary';
import { CalendarView } from './components/CalendarView';
import { ProjectConstants, DocumentVariables, User, PermissionRole } from './types';
import { createEmptyProject, createInitialDocument } from './constants';
import { db } from './db';

type ViewType = 'dashboard' | 'workspace' | 'admin-panel' | 'visit-summary' | 'calendar';
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
          await db.seedExternalData(); // Popolamento automatico con la tabella fornita
        } catch (e) { console.error("System init error:", e); }
    };
    initSystem();
  }, []);

  useEffect(() => {
    if (currentUser) { loadProjects(); }
  }, [currentUser, view]);

  const loadProjects = async () => {
    if (!currentUser) return;
    try {
      const projects = await db.getProjectsForUser(currentUser.id, currentUser.email);
      setProjectList(projects.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)));
    } catch (error) { console.error("Failed to load projects", error); }
  };

  const handleSelectProject = async (project: ProjectConstants) => {
    let role: PermissionRole = 'viewer';
    if (currentUser?.id === project.ownerId || currentUser?.isSystemAdmin) {
        role = 'admin';
    }
    setUserRole(role);

    const emptyTemplate = createEmptyProject(project.ownerId);
    const completeProject: ProjectConstants = { ...emptyTemplate, ...project };
    setCurrentProject(completeProject);

    try {
      const docs = await db.getDocumentsByProject(project.id);
      const sortedDocs = docs.sort((a, b) => a.visitNumber - b.visitNumber);
      setDocuments(sortedDocs);
      if (sortedDocs.length > 0) setCurrentDocId(sortedDocs[sortedDocs.length - 1].id);
      else {
        const initialDoc = createInitialDocument(project.id);
        await db.saveDocument(initialDoc);
        setDocuments([initialDoc]);
        setCurrentDocId(initialDoc.id);
      }
      setActiveTab('general');
      setView('workspace');
    } catch (error) { console.error("Error loading project documents", error); }
  };

  if (!currentUser) return <AuthScreen onLogin={setCurrentUser} />;

  if (view === 'admin-panel') return <AdminPanel onBack={() => setView('dashboard')} currentUser={currentUser} />;
  if (view === 'visit-summary') return <VisitSummary projects={projectList} onBack={() => setView('dashboard')} />;
  if (view === 'calendar') return <CalendarView projects={projectList} onBack={() => setView('dashboard')} />;

  if (view === 'workspace' && currentProject && currentDocId) {
      const isReadOnly = userRole === 'viewer';
      return (
        <div className="flex bg-slate-100 min-h-screen">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onBackToDashboard={() => setView('dashboard')} projectName={currentProject.projectName} user={currentUser} onLogout={() => setCurrentUser(null)} />
          <main className="ml-64 flex-1 p-8 h-screen overflow-y-auto">
            {['general', 'design', 'subjects', 'tender', 'contractor'].includes(activeTab) && (
              <ProjectForm data={currentProject} onChange={p => db.saveProject(p)} section={activeTab as any} readOnly={isReadOnly} />
            )}
            {activeTab === 'testing' && (
              <TestingManager project={currentProject} documents={documents} currentDocId={currentDocId} onSelectDocument={setCurrentDocId} onUpdateDocument={d => db.saveDocument(d)} onNewDocument={() => {}} onDeleteDocument={() => {}} readOnly={isReadOnly} onUpdateProject={p => db.saveProject(p)} />
            )}
            {activeTab === 'export' && (
              <ExportManager project={currentProject} documents={documents} currentDocId={currentDocId} onSelectDocument={setCurrentDocId} />
            )}
            {activeTab === 'execution' && (
              <ExecutionManager project={currentProject} onUpdateProject={p => db.saveProject(p)} documents={documents} currentDocId={currentDocId} onSelectDocument={setCurrentDocId} onUpdateDocument={d => db.saveDocument(d)} onNewDocument={() => {}} onDeleteDocument={() => {}} readOnly={isReadOnly} />
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
            onNewProject={() => handleSelectProject(createEmptyProject(currentUser.id))} 
            onDeleteProject={() => {}} 
            onShareProject={() => {}} 
            onOpenAdmin={() => setView('admin-panel')} 
            onOpenSummary={() => setView('visit-summary')}
            onOpenCalendar={() => setView('calendar')}
            onUpdateOrder={() => {}} 
            onMoveProject={() => {}} 
            onExportData={() => {}} 
            currentUser={currentUser} 
        />
    </div>
  );
};

export default App;
