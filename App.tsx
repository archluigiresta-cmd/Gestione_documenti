
import React, { useState, useEffect } from 'react';
import { ProjectConstants, DocumentVariables, DocumentType, User } from './types';
import { db } from './db';
import { createEmptyProject, createInitialDocument } from './constants';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';
import { ProjectForm } from './components/ProjectForm';
import { ExecutionManager } from './components/ExecutionManager';
import { TestingManager } from './components/TestingManager';
import { ExportManager } from './components/ExportManager';
import { AdminPanel } from './components/AdminPanel';

type AppTab = 
    | 'general' | 'design' | 'subjects' | 'contractor' | 'execution' | 'testing' 
    | 'export-design' | 'export-dl' | 'export-coll-req' | 'export-coll-conv' 
    | 'export-coll-null' | 'export-coll-visit' | 'export-coll-rel-ta' 
    | 'export-coll-rel-st' | 'export-coll-rel-fi';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<ProjectConstants[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectConstants | null>(null);
  const [documents, setDocuments] = useState<DocumentVariables[]>([]);
  const [currentDocId, setCurrentDocId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<AppTab>('general');
  const [showAdmin, setShowAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await db.ensureAdminExists();
      } catch (err) {
        console.error("Init database error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (currentUser) loadProjects();
  }, [currentUser]);

  const loadProjects = async () => {
    if (!currentUser) return;
    const list = await db.getProjectsForUser(currentUser.id, currentUser.email);
    setProjects(list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
  };

  const handleSelectProject = async (p: ProjectConstants) => {
    setCurrentProject(p);
    const docs = await db.getDocumentsByProject(p.id);
    setDocuments(docs);
    if (docs.length > 0) setCurrentDocId(docs[0].id);
    else setCurrentDocId('');
    setActiveTab('general');
  };

  const handleNewProject = async () => {
    if (!currentUser) return;
    const newP = createEmptyProject(currentUser.id);
    newP.displayOrder = projects.length + 1;
    await db.saveProject(newP);
    await loadProjects();
    handleSelectProject(newP);
  };

  const handleUpdateProjectField = (path: string, value: any) => {
    if (!currentProject) return;
    const updated = { ...currentProject };
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

  const createNewDocument = async (type: DocumentType) => {
    if (!currentProject) return;
    const nextNum = documents.filter(d => d.type === type).length + 1;
    const newDoc = { 
        ...createInitialDocument(currentProject.id), 
        type, 
        visitNumber: nextNum,
        worksIntroText: type === 'VERBALE_COLLAUDO' 
            ? "Lo scrivente collaudatore, alla presenza dei signori sopra indicati, ha proceduto alla visita di collaudo rilevando quanto segue:"
            : ""
    };
    
    setDocuments(prev => [...prev, newDoc]);
    setCurrentDocId(newDoc.id);
    await db.saveDocument(newDoc);
  };

  const handleUpdateDocument = async (doc: DocumentVariables) => {
    setDocuments(prev => prev.map(d => d.id === doc.id ? doc : d));
    await db.saveDocument(doc);
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Eliminare definitivamente il documento?")) return;
    await db.deleteDocument(id);
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-bold">AVVIO EDILAPP...</div>;
  if (!currentUser) return <AuthScreen onLogin={(u) => setCurrentUser(u)} />;
  if (showAdmin) return <AdminPanel onBack={() => setShowAdmin(false)} currentUser={currentUser} />;
  if (!currentProject) return <Dashboard projects={projects} onSelectProject={handleSelectProject} onNewProject={handleNewProject} onDeleteProject={async (id) => { if(confirm("Eliminare definitivamente l'appalto?")) { await db.deleteProject(id); loadProjects(); } }} onShareProject={() => {}} onOpenAdmin={() => setShowAdmin(true)} onUpdateOrder={async (id, ord) => { const p = projects.find(x => x.id === id); if (p) { p.displayOrder = ord; await db.saveProject(p); loadProjects(); } }} onMoveProject={async (id, dir) => { const idx = projects.findIndex(p => p.id === id); if (dir === 'up' && idx > 0) { const p1 = projects[idx], p2 = projects[idx-1]; const tmp = p1.displayOrder; p1.displayOrder = p2.displayOrder; p2.displayOrder = tmp; await db.saveProject(p1); await db.saveProject(p2); loadProjects(); } else if (dir === 'down' && idx < projects.length - 1) { const p1 = projects[idx], p2 = projects[idx+1]; const tmp = p1.displayOrder; p1.displayOrder = p2.displayOrder; p2.displayOrder = tmp; await db.saveProject(p1); await db.saveProject(p2); loadProjects(); } }} onExportData={async () => { const data = await db.getDatabaseBackup(); const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'backup_edilapp.json'; a.click(); }} currentUser={currentUser} />;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        activeTab={activeTab} setActiveTab={setActiveTab as any}
        onBackToDashboard={() => setCurrentProject(null)}
        projectName={currentProject.projectName}
        user={currentUser}
        onLogout={() => { setCurrentUser(null); setCurrentProject(null); }}
      />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {(activeTab === 'general' || activeTab === 'subjects' || activeTab === 'design' || activeTab === 'contractor') && (
           <ProjectForm key={activeTab} data={currentProject} readOnly={false} handleChange={handleUpdateProjectField} subTab={activeTab} />
        )}
        {activeTab === 'execution' && (
          <ExecutionManager project={currentProject} onUpdateProject={setCurrentProject} documents={documents} currentDocId={currentDocId} onSelectDocument={setCurrentDocId} onUpdateDocument={handleUpdateDocument} onNewDocument={() => createNewDocument('VERBALE_COLLAUDO')} onDeleteDocument={handleDeleteDocument} />
        )}
        {activeTab === 'testing' && (
          <TestingManager project={currentProject} documents={documents} currentDocId={currentDocId} onSelectDocument={setCurrentDocId} onUpdateDocument={handleUpdateDocument} onNewDocument={createNewDocument} onDeleteDocument={handleDeleteDocument} onUpdateProject={handleUpdateProjectField as any} />
        )}
        {activeTab.startsWith('export') && (
            <ExportManager project={currentProject} documents={documents} currentDocId={currentDocId} onSelectDocument={setCurrentDocId} onDeleteDocument={handleDeleteDocument} activeExportTab={activeTab} />
        )}
      </main>
    </div>
  );
};

export default App;
