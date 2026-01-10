
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
    // Initial system setup: Ensure Admin exists
    const initSystem = async () => {
        try {
            await db.ensureAdminExists();
        } catch (e) {
            console.error("System init error:", e);
        }
    };
    initSystem();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadProjects();
    }
  }, [currentUser]);

  const loadProjects = async () => {
    if (!currentUser) return;
    try {
      const projects = await db.getProjectsForUser(currentUser.id, currentUser.email);
      // Sort by displayOrder ascending
      const sorted = projects.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      setProjectList(sorted);
    } catch (error) {
      console.error("Failed to load projects", error);
    }
  };

  const handleLogin = (user: User) => {
      setCurrentUser(user);
  };

  const handleLogout = () => {
      setCurrentUser(null);
      setView('dashboard');
      setProjectList([]);
  };

  const handleNewProject = async () => {
    if (!currentUser) return;
    
    // Calculate next order
    const maxOrder = projectList.reduce((max, p) => Math.max(max, p.displayOrder || 0), 0);
    
    const newProject = createEmptyProject(currentUser.id);
    newProject.projectName = "Nuovo Intervento";
    newProject.displayOrder = maxOrder + 1; // Auto-increment

    const initialDoc = createInitialDocument(newProject.id);
    await db.saveProject(newProject);
    await db.saveDocument(initialDoc);
    
    await loadProjects(); // Reload to get sorted list
    handleSelectProject(newProject);
  };

  const handleUpdateProjectOrder = async (id: string, newOrder: number) => {
     if (!currentUser) return;
     const project = projectList.find(p => p.id === id);
     if (project) {
         const updated = { ...project, displayOrder: newOrder };
         await db.saveProject(updated);
         await loadProjects();
     }
  };

  const handleMoveProject = async (id: string, direction: 'up' | 'down') => {
      if (!currentUser) return;
      const currentIndex = projectList.findIndex(p => p.id === id);
      if (currentIndex === -1) return;

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (targetIndex >= 0 && targetIndex < projectList.length) {
          const currentProject = projectList[currentIndex];
          const targetProject = projectList[targetIndex];

          // Swap display orders
          const currentOrder = currentProject.displayOrder ?? 0;
          const targetOrder = targetProject.displayOrder ?? 0;

          const updatedCurrent = { ...currentProject, displayOrder: targetOrder };
          const updatedTarget = { ...targetProject, displayOrder: currentOrder };

          await db.saveProject(updatedCurrent);
          await db.saveProject(updatedTarget);
          await loadProjects();
      }
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

    // Deep Merge (Safe Loading)
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
        },
        executionPhase: {
            ...emptyTemplate.executionPhase,
            ...(project.executionPhase || {}),
            handoverDocs: {
                ...emptyTemplate.executionPhase.handoverDocs,
                ...(project.executionPhase?.handoverDocs || {})
            }
        },
        contractor: {
            ...emptyTemplate.contractor,
            ...(project.contractor || {}),
            mandants: project.contractor?.mandants || [],
            subcontractors: project.contractor?.subcontractors || []
        }
    };

    setCurrentProject(completeProject);

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

  const handleShareClick = (projectId: string) => {
      setProjectToShare(projectId);
      setShowShareModal(true);
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setCurrentProject(null);
    setDocuments([]);
    loadProjects(); 
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
    
    if (documents.length > 0) {
        // Trova l'ultimo verbale in base al numero di visita per questo appalto
        const lastDoc = [...documents].sort((a, b) => b.visitNumber - a.visitNumber)[0];
        nextNum = lastDoc.visitNumber + 1;
        
        // Mantieni le premesse accumulate e aggiungi le lavorazioni dell'ultima visita
        lastPremis = lastDoc.premis || '';
        
        const lastDate = new Date(lastDoc.date).toLocaleDateString('it-IT');
        
        // Se nel verbale precedente sono state inserite lavorazioni, aggiungile formalmente alle premesse del nuovo
        const visitWorks = lastDoc.worksExecuted && lastDoc.worksExecuted.length > 0 
            ? lastDoc.worksExecuted.join(', ') 
            : 'attività di ispezione e verifica';
            
        const historyLine = `\n- in data ${lastDate}, con verbale n. ${lastDoc.visitNumber}, si è preso atto delle seguenti lavorazioni: ${visitWorks};`;
        
        if (!lastPremis.includes(historyLine)) {
            lastPremis += historyLine;
        }
    }

    const newDoc: DocumentVariables = {
      ...createInitialDocument(currentProject.id),
      visitNumber: nextNum,
      premis: lastPremis.trim(),
    };
    setDocuments([...documents, newDoc]);
    setCurrentDocId(newDoc.id);
    await db.saveDocument(newDoc);
  };

  const handleDeleteDocument = async (id: string) => {
    if (userRole === 'viewer') return;
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

  const handleExportData = async () => {
      try {
          const data = await db.getDatabaseBackup();
          const jsonString = JSON.stringify(data, null, 2);
          const blob = new Blob([jsonString], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `edilapp_full_backup_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } catch (e) {
          alert("Errore durante l'esportazione dei dati.");
      }
  };

  // --- RENDER ---

  if (!currentUser) {
      return <AuthScreen onLogin={handleLogin} />;
  }

  if (view === 'admin-panel') {
      if (!currentUser.isSystemAdmin) {
          setView('dashboard');
          return null;
      }
      return <AdminPanel onBack={() => setView('dashboard')} currentUser={currentUser} />;
  }

  if (view === 'dashboard') {
    return (
      <div className="bg-slate-50 min-h-screen">
        <div className="absolute top-4 right-4 flex items-center gap-4">
             <div className="flex items-center gap-2">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${currentUser.isSystemAdmin ? 'bg-purple-600' : 'bg-blue-600'}`}>
                    {currentUser.name.charAt(0)}
                 </div>
                 <div className="text-right hidden sm:block">
                     <p className="text-sm font-bold text-slate-800">{currentUser.name} {currentUser.isSystemAdmin && '(Admin)'}</p>
                     <button onClick={handleLogout} className="text-xs text-red-500 hover:underline">Esci</button>
                 </div>
             </div>
        </div>
        <Dashboard 
          projects={projectList} 
          onSelectProject={handleSelectProject}
          onNewProject={handleNewProject}
          onDeleteProject={handleDeleteProject}
          onShareProject={handleShareClick}
          onOpenAdmin={() => setView('admin-panel')}
          onUpdateOrder={handleUpdateProjectOrder}
          onMoveProject={handleMoveProject}
          onExportData={handleExportData} // Pass export handler
          currentUser={currentUser}
        />
        {showShareModal && projectToShare && (
            <ProjectSharing 
                projectId={projectToShare} 
                onClose={() => { setShowShareModal(false); setProjectToShare(null); }} 
            />
        )}
      </div>
    );
  }

  if (!currentProject) return null;

  const isReadOnly = userRole === 'viewer';

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onBackToDashboard={handleBackToDashboard}
        projectName={currentProject.projectName}
        user={currentUser}
        onLogout={handleLogout}
      />
      
      <main className="ml-64 flex-1 p-8 h-screen overflow-y-auto print:ml-0 print:p-0">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {['general', 'design', 'subjects', 'tender', 'contractor'].includes(activeTab) && (
            <ProjectForm 
                key={activeTab} 
                data={currentProject} 
                onChange={handleProjectUpdate} 
                section={activeTab as any} 
                readOnly={isReadOnly}
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
              readOnly={isReadOnly}
            />
          )}

          {activeTab === 'testing' && currentDocId && (
            <TestingManager
              project={currentProject}
              documents={documents}
              currentDocId={currentDocId}
              onSelectDocument={setCurrentDocId}
              onUpdateDocument={handleDocumentUpdate}
              onNewDocument={createNewVerbale}
              onDeleteDocument={handleDeleteDocument}
              readOnly={isReadOnly}
              onUpdateProject={handleProjectUpdate}
            />
          )}

          {activeTab === 'export' && currentDocId && (
            <ExportManager
              project={currentProject}
              documents={documents}
              currentDocId={currentDocId}
              onSelectDocument={setCurrentDocId}
              onDeleteDocument={handleDeleteDocument}
              onEdit={(id) => {
                setCurrentDocId(id);
                // Navighiamo al tab di collaudo per l'editing
                setActiveTab('testing');
              }}
            />
          )}

        </div>
      </main>
    </div>
  );
};

export default App;
