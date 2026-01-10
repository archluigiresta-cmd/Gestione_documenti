
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [projectToShare, setProjectToShare] = useState<string | null>(null);

  useEffect(() => {
    const initSystem = async () => {
        try { await db.ensureAdminExists(); } catch (e) { console.error("System init error:", e); }
    };
    initSystem();
  }, []);

  useEffect(() => {
    if (currentUser) { loadProjects(); }
  }, [currentUser]);

  const loadProjects = async () => {
    if (!currentUser) return;
    try {
      const projects = await db.getProjectsForUser(currentUser.id, currentUser.email);
      const sorted = projects.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      setProjectList(sorted);
    } catch (error) { console.error("Failed to load projects", error); }
  };

  const handleLogin = (user: User) => { setCurrentUser(user); };
  const handleLogout = () => { setCurrentUser(null); setView('dashboard'); setProjectList([]); };

  const handleNewProject = async () => {
    if (!currentUser) return;
    const maxOrder = projectList.reduce((max, p) => Math.max(max, p.displayOrder || 0), 0);
    const newProject = createEmptyProject(currentUser.id);
    newProject.projectName = "Nuovo Intervento";
    newProject.displayOrder = maxOrder + 1;
    const initialDoc = createInitialDocument(newProject.id);
    await db.saveProject(newProject);
    await db.saveDocument(initialDoc);
    await loadProjects();
    handleSelectProject(newProject);
  };

  const handleSelectProject = async (project: ProjectConstants) => {
    let role: PermissionRole = 'viewer';
    if (currentUser?.id === project.ownerId) {
        role = 'admin';
    } else {
        const perms = await db.getUserPermissions(currentUser?.email || '');
        const p = perms.find(perm => perm.projectId === project.id);
        if (p) role = p.role;
    }
    setUserRole(role);

    // FORCED MERGE: Assicura che la struttura sia identica per tutti i progetti
    const emptyTemplate = createEmptyProject(project.ownerId);
    const completeProject: ProjectConstants = {
        ...emptyTemplate,
        ...project,
        contract: { ...emptyTemplate.contract, ...(project.contract || {}) },
        designPhase: { 
            docfap: { ...emptyTemplate.designPhase.docfap, ...(project.designPhase?.docfap || {}) },
            dip: { ...emptyTemplate.designPhase.dip, ...(project.designPhase?.dip || {}) },
            pfte: { ...emptyTemplate.designPhase.pfte, ...(project.designPhase?.pfte || {}) },
            executive: { ...emptyTemplate.designPhase.executive, ...(project.designPhase?.executive || {}) },
        },
        subjects: {
            ...emptyTemplate.subjects,
            ...(project.subjects || {}),
            designers: project.subjects?.designers || [], 
            dlOffice: project.subjects?.dlOffice || [],
            rup: { ...emptyTemplate.subjects.rup, ...(project.subjects?.rup || {}) },
            dl: { ...emptyTemplate.subjects.dl, ...(project.subjects?.dl || {}) },
            tester: { ...emptyTemplate.subjects.tester, ...(project.subjects?.tester || {}) },
            testerAppointment: { ...emptyTemplate.subjects.testerAppointment, ...(project.subjects?.testerAppointment || {}) }
        },
        executionPhase: {
            ...emptyTemplate.executionPhase,
            ...(project.executionPhase || {}),
            handoverDocs: { ...emptyTemplate.executionPhase.handoverDocs, ...(project.executionPhase?.handoverDocs || {}) }
        },
        contractor: {
            ...emptyTemplate.contractor,
            ...(project.contractor || {}),
            mandants: project.contractor?.mandants || [],
            executors: project.contractor?.executors || [],
            subcontractors: project.contractor?.subcontractors || []
        }
    };

    setCurrentProject(completeProject);

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
    } catch (error) { console.error("Error loading project documents", error); }
  };

  const handleProjectUpdate = async (newData: ProjectConstants) => {
    if (userRole === 'viewer') return;
    const updated = { ...newData, lastModified: Date.now() };
    setCurrentProject(updated);
    await db.saveProject(updated);
  };

  const handleDocumentUpdate = async (updatedDoc: DocumentVariables) => {
    if (userRole === 'viewer') return;
    const newDocs = documents.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc);
    setDocuments(newDocs);
    await db.saveDocument(updatedDoc);
  };

  const createNewVerbale = async () => {
    if (!currentProject || userRole === 'viewer') return;
    let nextNum = 1;
    let lastPremis = '';
    const projectDocs = documents.filter(d => d.projectId === currentProject.id);
    if (projectDocs.length > 0) {
        const lastDoc = [...projectDocs].sort((a, b) => b.visitNumber - a.visitNumber)[0];
        nextNum = lastDoc.visitNumber + 1;
        lastPremis = lastDoc.premis || '';
        const historyLine = `\n- in data ${new Date(lastDoc.date).toLocaleDateString('it-IT')}, con verbale n. ${lastDoc.visitNumber}, si è preso atto delle lavorazioni eseguite;`;
        if (!lastPremis.includes(historyLine)) { lastPremis += historyLine; }
    }
    const newDoc: DocumentVariables = {
      ...createInitialDocument(currentProject.id),
      id: crypto.randomUUID(),
      visitNumber: nextNum,
      premis: lastPremis.trim(),
      letterRecipients: projectDocs.length > 0 ? projectDocs[projectDocs.length - 1].letterRecipients : undefined
    };
    const updatedDocs = [...documents, newDoc].sort((a, b) => a.visitNumber - b.visitNumber);
    setDocuments(updatedDocs);
    setCurrentDocId(newDoc.id);
    await db.saveDocument(newDoc);
  };

  if (!currentUser) return <AuthScreen onLogin={handleLogin} />;
  if (view === 'workspace' && currentProject && currentDocId) {
      const isReadOnly = userRole === 'viewer';
      return (
        <div className="flex bg-slate-100 min-h-screen">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onBackToDashboard={() => setView('dashboard')} projectName={currentProject.projectName} user={currentUser} onLogout={handleLogout} />
          <main className="ml-64 flex-1 p-8 h-screen overflow-y-auto print:ml-0 print:p-0">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              {['general', 'design', 'subjects', 'tender', 'contractor'].includes(activeTab) && (
                <ProjectForm key={activeTab} data={currentProject} onChange={handleProjectUpdate} section={activeTab as any} readOnly={isReadOnly} />
              )}
              {activeTab === 'execution' && (
                <ExecutionManager project={currentProject} onUpdateProject={handleProjectUpdate} documents={documents} currentDocId={currentDocId} onSelectDocument={setCurrentDocId} onUpdateDocument={handleDocumentUpdate} onNewDocument={createNewVerbale} onDeleteDocument={() => {}} readOnly={isReadOnly} />
              )}
              {activeTab === 'testing' && (
                <TestingManager project={currentProject} documents={documents} currentDocId={currentDocId} onSelectDocument={setCurrentDocId} onUpdateDocument={handleDocumentUpdate} onNewDocument={createNewVerbale} onDeleteDocument={() => {}} readOnly={isReadOnly} onUpdateProject={handleProjectUpdate} />
              )}
              {activeTab === 'export' && (
                <ExportManager project={currentProject} documents={documents} currentDocId={currentDocId} onSelectDocument={setCurrentDocId} onNewDocument={createNewVerbale} />
              )}
            </div>
          </main>
        </div>
      );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
        <Dashboard projects={projectList} onSelectProject={handleSelectProject} onNewProject={handleNewProject} onDeleteProject={() => {}} onShareProject={() => {}} onOpenAdmin={() => {}} onUpdateOrder={() => {}} onMoveProject={() => {}} onExportData={() => {}} currentUser={currentUser} />
    </div>
  );
};

export default App;
