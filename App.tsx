
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
import { ProjectSharing } from './components/ProjectSharing';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<ProjectConstants[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectConstants | null>(null);
  const [documents, setDocuments] = useState<DocumentVariables[]>([]);
  const [currentDocId, setCurrentDocId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'general' | 'design' | 'subjects' | 'tender' | 'contractor' | 'execution' | 'testing' | 'export'>('general');
  const [showAdmin, setShowAdmin] = useState(false);
  const [sharingProjectId, setSharingProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        await db.ensureAdminExists();
        const savedUserStr = localStorage.getItem('loggedUser');
        if (savedUserStr) {
          const user = JSON.parse(savedUserStr);
          setCurrentUser(user);
        }
      } catch (e) {
        console.error("Errore inizializzazione database", e);
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadProjects();
    }
  }, [currentUser]);

  const loadProjects = async () => {
    if (!currentUser) return;
    const list = await db.getProjectsForUser(currentUser.id, currentUser.email);
    setProjects(list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
  };

  const handleSelectProject = async (project: ProjectConstants) => {
    setCurrentProject(project);
    const docs = await db.getDocumentsByProject(project.id);
    setDocuments(docs);
    if (docs.length > 0) {
      setCurrentDocId(docs[0].id);
    }
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

  const handleSaveProject = async (updated: ProjectConstants) => {
    setCurrentProject(updated);
    await db.saveProject(updated);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleUpdateProjectField = (path: string, value: any) => {
    if (!currentProject) return;
    const updated = { ...currentProject };
    const keys = path.split('.');
    let current: any = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    handleSaveProject(updated);
  };

  const createNewDocument = async (type: DocumentType) => {
    if (!currentProject) return;
    
    let nextNum = 1;
    let lastPremis = '';
    
    if (type === 'VERBALE_COLLAUDO') {
        const verbaliExist = documents.filter(d => d.type === 'VERBALE_COLLAUDO');
        if (verbaliExist.length > 0) {
            const maxNum = Math.max(...verbaliExist.map(v => v.visitNumber));
            nextNum = maxNum + 1;
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

    const newDoc: DocumentVariables = {
      ...createInitialDocument(currentProject.id),
      type: type,
      visitNumber: nextNum,
      premis: lastPremis.trim(),
    };

    const updatedDocs = [...documents, newDoc];
    setDocuments(updatedDocs);
    setCurrentDocId(newDoc.id);
    await db.saveDocument(newDoc);
  };

  const handleUpdateDocument = async (doc: DocumentVariables) => {
    const updated = documents.map(d => d.id === doc.id ? doc : d);
    setDocuments(updated);
    await db.saveDocument(doc);
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Eliminare definitivamente questo documento?")) return;
    await db.deleteDocument(id);
    const updated = documents.filter(d => d.id !== id);
    setDocuments(updated);
    if (currentDocId === id) {
      setCurrentDocId(updated.length > 0 ? updated[0].id : '');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedUser');
    setCurrentUser(null);
    setCurrentProject(null);
    setShowAdmin(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!currentUser) return <AuthScreen onLogin={(u) => { setCurrentUser(u); localStorage.setItem('loggedUser', JSON.stringify(u)); }} />;

  if (showAdmin && currentUser.isSystemAdmin) return <AdminPanel onBack={() => setShowAdmin(false)} currentUser={currentUser} />;

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Dashboard 
          projects={projects}
          onSelectProject={handleSelectProject}
          onNewProject={handleNewProject}
          onDeleteProject={async (id) => { await db.deleteProject(id); loadProjects(); }}
          onShareProject={setSharingProjectId}
          onOpenAdmin={() => setShowAdmin(true)}
          onUpdateOrder={async (id, ord) => {
            const p = projects.find(x => x.id === id);
            if (p) await handleSaveProject({ ...p, displayOrder: ord });
          }}
          onMoveProject={async (id, dir) => {
             const idx = projects.findIndex(p => p.id === id);
             if (dir === 'up' && idx > 0) {
                const p1 = projects[idx]; const p2 = projects[idx-1];
                const o1 = p1.displayOrder; p1.displayOrder = p2.displayOrder; p2.displayOrder = o1;
                await db.saveProject(p1); await db.saveProject(p2); loadProjects();
             } else if (dir === 'down' && idx < projects.length - 1) {
                const p1 = projects[idx]; const p2 = projects[idx+1];
                const o1 = p1.displayOrder; p1.displayOrder = p2.displayOrder; p2.displayOrder = o1;
                await db.saveProject(p1); await db.saveProject(p2); loadProjects();
             }
          }}
          onExportData={async () => {
              const data = await db.getDatabaseBackup();
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `edilapp_backup.json`;
              a.click();
          }}
          currentUser={currentUser}
        />
        {sharingProjectId && <ProjectSharing projectId={sharingProjectId} onClose={() => setSharingProjectId(null)} />}
      </div>
    );
  }

  const isOwner = currentProject.ownerId === currentUser.id;
  const readOnly = !isOwner && !currentUser.isSystemAdmin;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBackToDashboard={() => setCurrentProject(null)}
        projectName={currentProject.projectName}
        user={currentUser}
        onLogout={handleLogout}
      />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {activeTab === 'general' && (
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold mb-6">Dati Generali</h2>
            <div className="space-y-6">
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Committente (Ente Appaltante)</label>
                   <input disabled={readOnly} type="text" className="w-full p-3 border rounded-lg mt-1" value={currentProject.entity} onChange={e => handleUpdateProjectField('entity', e.target.value)} />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Oggetto dell'Intervento</label>
                   <textarea disabled={readOnly} className="w-full p-3 border rounded-lg mt-1 h-24" value={currentProject.projectName} onChange={e => handleUpdateProjectField('projectName', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">CUP</label>
                        <input disabled={readOnly} type="text" className="w-full p-3 border rounded-lg mt-1 font-mono" value={currentProject.cup} onChange={e => handleUpdateProjectField('cup', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">CIG</label>
                        <input disabled={readOnly} type="text" className="w-full p-3 border rounded-lg mt-1 font-mono" value={currentProject.cig} onChange={e => handleUpdateProjectField('cig', e.target.value)} />
                    </div>
                </div>
            </div>
          </div>
        )}
        {activeTab === 'subjects' && <ProjectForm data={currentProject} readOnly={readOnly} handleChange={handleUpdateProjectField} subTab="tester" />}
        {activeTab === 'execution' && <ExecutionManager project={currentProject} onUpdateProject={handleSaveProject} documents={documents} currentDocId={currentDocId} onSelectDocument={setCurrentDocId} onUpdateDocument={handleUpdateDocument} onNewDocument={() => createNewDocument('VERBALE_COLLAUDO')} onDeleteDocument={handleDeleteDocument} readOnly={readOnly} />}
        {activeTab === 'testing' && <TestingManager project={currentProject} documents={documents} currentDocId={currentDocId} onSelectDocument={setCurrentDocId} onUpdateDocument={handleUpdateDocument} onNewDocument={createNewDocument} onDeleteDocument={handleDeleteDocument} onUpdateProject={handleSaveProject} readOnly={readOnly} />}
        {activeTab === 'export' && <ExportManager project={currentProject} documents={documents} currentDocId={currentDocId} onSelectDocument={setCurrentDocId} onDeleteDocument={readOnly ? undefined : handleDeleteDocument} />}
      </main>
    </div>
  );
};

export default App;
