
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

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<ProjectConstants[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectConstants | null>(null);
  const [documents, setDocuments] = useState<DocumentVariables[]>([]);
  const [currentDocId, setCurrentDocId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'general' | 'design' | 'subjects' | 'tender' | 'contractor' | 'execution' | 'testing' | 'export'>('general');
  const [showAdmin, setShowAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      // Timeout di sicurezza: se il DB non risponde entro 5 secondi, sblocchiamo comunque l'app
      const safetyTimeout = setTimeout(() => {
        if (loading) {
          console.warn("Initialization timed out. Proceeding anyway.");
          setLoading(false);
        }
      }, 5000);

      try {
        await db.ensureAdminExists();
        const saved = localStorage.getItem('loggedUser');
        if (saved) {
          try {
            const user = JSON.parse(saved);
            setCurrentUser(user);
          } catch (e) {
            localStorage.removeItem('loggedUser');
          }
        }
      } catch (err) {
        console.error("Critical initialization failure:", err);
      } finally {
        clearTimeout(safetyTimeout);
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
    try {
        const list = await db.getProjectsForUser(currentUser.id, currentUser.email);
        setProjects(list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
    } catch (e) {
        console.error("Failed to load projects:", e);
    }
  };

  const handleSelectProject = async (p: ProjectConstants) => {
    const template = createEmptyProject(p.ownerId);
    const merged = { ...template, ...p };
    setCurrentProject(merged);
    try {
        const docs = await db.getDocumentsByProject(p.id);
        setDocuments(docs);
        if (docs.length > 0) setCurrentDocId(docs[0].id);
        else setCurrentDocId('');
    } catch (e) {
        console.error("Failed to load documents:", e);
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

  const handleUpdateProjectField = (path: string, value: any) => {
    if (!currentProject) return;
    const updated = { ...currentProject };
    const keys = path.split('.');
    let current: any = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setCurrentProject(updated);
    db.saveProject(updated);
  };

  const createNewDocument = async (type: DocumentType) => {
    if (!currentProject) return;
    const nextNum = documents.filter(d => d.type === type).length + 1;
    const newDoc = { ...createInitialDocument(currentProject.id), type, visitNumber: nextNum };
    
    if (type === 'VERBALE_COLLAUDO' && documents.length > 0) {
      const sortedVerbali = [...documents].filter(d => d.type === 'VERBALE_COLLAUDO').sort((a,b) => b.visitNumber - a.visitNumber);
      const last = sortedVerbali[0];
      if (last) {
        newDoc.premis = last.premis;
        const previousRef = `In data ${new Date(last.date).toLocaleDateString()}, con verbale n. ${last.visitNumber}, lo scrivente ha preso atto dell'andamento dei lavori: ${last.worksExecuted.join(', ') || 'N.D.'}. Era in corso il ${last.worksInProgress || 'N.D.'}.`;
        newDoc.premis += (newDoc.premis ? '\n\n' : '') + previousRef;
      }
    }

    const updated = [...documents, newDoc];
    setDocuments(updated);
    setCurrentDocId(newDoc.id);
    await db.saveDocument(newDoc);
  };

  const handleUpdateDocument = async (doc: DocumentVariables) => {
    setDocuments(prev => prev.map(d => d.id === doc.id ? doc : d));
    await db.saveDocument(doc);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Inizializzazione in corso...</p>
    </div>
  );

  if (!currentUser) return (
    <AuthScreen onLogin={(u) => { 
      setCurrentUser(u); 
      localStorage.setItem('loggedUser', JSON.stringify(u)); 
    }} />
  );

  if (showAdmin) return <AdminPanel onBack={() => setShowAdmin(false)} currentUser={currentUser} />;

  if (!currentProject) return (
    <Dashboard 
      projects={projects}
      onSelectProject={handleSelectProject}
      onNewProject={handleNewProject}
      onDeleteProject={async (id) => { if(confirm("Eliminare l'intero appalto?")) { await db.deleteProject(id); loadProjects(); } }}
      onShareProject={() => {}}
      onOpenAdmin={() => setShowAdmin(true)}
      onUpdateOrder={async (id, ord) => {
        const p = projects.find(x => x.id === id);
        if (p) { p.displayOrder = ord; await db.saveProject(p); loadProjects(); }
      }}
      onMoveProject={async (id, dir) => {
        const idx = projects.findIndex(p => p.id === id);
        if (dir === 'up' && idx > 0) {
          const p1 = projects[idx], p2 = projects[idx-1];
          const tmp = p1.displayOrder; p1.displayOrder = p2.displayOrder; p2.displayOrder = tmp;
          await db.saveProject(p1); await db.saveProject(p2); loadProjects();
        } else if (dir === 'down' && idx < projects.length - 1) {
          const p1 = projects[idx], p2 = projects[idx+1];
          const tmp = p1.displayOrder; p1.displayOrder = p2.displayOrder; p2.displayOrder = tmp;
          await db.saveProject(p1); await db.saveProject(p2); loadProjects();
        }
      }}
      onExportData={async () => {
        const data = await db.getDatabaseBackup();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `backup_edilapp_${new Date().toISOString().split('T')[0]}.json`; a.click();
      }}
      currentUser={currentUser}
    />
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        activeTab={activeTab} setActiveTab={setActiveTab}
        onBackToDashboard={() => setCurrentProject(null)}
        projectName={currentProject.projectName}
        user={currentUser}
        onLogout={() => { localStorage.removeItem('loggedUser'); setCurrentUser(null); setCurrentProject(null); }}
      />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        {activeTab === 'general' && (
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Dati Generali Appalto</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-slate-500 uppercase">Committente</label><input type="text" className="w-full p-3 border rounded mt-1 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" value={currentProject.entity} onChange={e => handleUpdateProjectField('entity', e.target.value)} /></div>
                <div><label className="text-xs font-bold text-slate-500 uppercase">Provincia</label><input type="text" className="w-full p-3 border rounded mt-1 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" value={currentProject.entityProvince} onChange={e => handleUpdateProjectField('entityProvince', e.target.value)} /></div>
              </div>
              <div><label className="text-xs font-bold text-slate-500 uppercase">Oggetto (Usa INVIO per gestire le righe)</label><textarea className="w-full p-3 border rounded mt-1 h-40 shadow-sm leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none" value={currentProject.projectName} onChange={e => handleUpdateProjectField('projectName', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-slate-500 uppercase">CUP</label><input type="text" className="w-full p-3 border rounded mt-1 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" value={currentProject.cup} onChange={e => handleUpdateProjectField('cup', e.target.value)} /></div>
                <div><label className="text-xs font-bold text-slate-500 uppercase">CIG</label><input type="text" className="w-full p-3 border rounded mt-1 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" value={currentProject.cig} onChange={e => handleUpdateProjectField('cig', e.target.value)} /></div>
              </div>
              <div className="pt-4 border-t"><label className="text-xs font-bold text-slate-500 uppercase">Note Generali</label><textarea className="w-full p-3 border rounded mt-1 h-32 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" value={currentProject.generalNotes} onChange={e => handleUpdateProjectField('generalNotes', e.target.value)} /></div>
            </div>
          </div>
        )}
        {(activeTab === 'design' || activeTab === 'subjects' || activeTab === 'tender' || activeTab === 'contractor') && (
           <ProjectForm key={activeTab} data={currentProject} readOnly={false} handleChange={handleUpdateProjectField} subTab={activeTab} />
        )}
        {activeTab === 'execution' && (
          <ExecutionManager 
            project={currentProject} 
            onUpdateProject={setCurrentProject} 
            documents={documents} 
            currentDocId={currentDocId} 
            onSelectDocument={setCurrentDocId} 
            onUpdateDocument={handleUpdateDocument} 
            onNewDocument={() => createNewDocument('VERBALE_COLLAUDO')} 
            onDeleteDocument={async id => { if(confirm("Eliminare?")) { await db.deleteDocument(id); setDocuments(prev => prev.filter(d => d.id !== id)); } }} 
          />
        )}
        {activeTab === 'testing' && (
          <TestingManager 
            project={currentProject} 
            documents={documents} 
            currentDocId={currentDocId} 
            onSelectDocument={setCurrentDocId} 
            onUpdateDocument={handleUpdateDocument} 
            onNewDocument={createNewDocument} 
            onDeleteDocument={async id => { if(confirm("Eliminare?")) { await db.deleteDocument(id); setDocuments(prev => prev.filter(d => d.id !== id)); } }} 
            onUpdateProject={setCurrentProject}
          />
        )}
        {activeTab === 'export' && <ExportManager project={currentProject} documents={documents} currentDocId={currentDocId} onSelectDocument={setCurrentDocId} />}
      </main>
    </div>
  );
};

export default App;
