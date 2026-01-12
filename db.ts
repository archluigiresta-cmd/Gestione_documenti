
import { ProjectConstants, DocumentVariables, User, ProjectPermission, PermissionRole, UserStatus, BackupData } from './types';
import { createEmptyProject, createInitialDocument } from './constants';

const DB_NAME = 'EdilAppDB';
const DB_VERSION = 3; 
const STORE_PROJECTS = 'projects';
const STORE_DOCUMENTS = 'documents';
const STORE_USERS = 'users';
const STORE_PERMISSIONS = 'permissions';
const STORE_EXTERNAL_EVENTS = 'external_events';

export interface ExternalEvent {
    id: string;
    projectName: string;
    entity: string;
    city: string;
    assignment: string;
    amount?: string;
    visitDates: string[];
    visitNumber?: number;
    date?: string;
    time?: string;
    type: 'visita' | 'scadenza' | 'altro';
}

export const db = {
  open: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_PROJECTS)) db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(STORE_DOCUMENTS)) {
          const docStore = db.createObjectStore(STORE_DOCUMENTS, { keyPath: 'id' });
          docStore.createIndex('projectId', 'projectId', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_USERS)) {
          const userStore = db.createObjectStore(STORE_USERS, { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
        }
        if (!db.objectStoreNames.contains(STORE_PERMISSIONS)) {
          const permStore = db.createObjectStore(STORE_PERMISSIONS, { keyPath: 'id' });
          permStore.createIndex('projectId', 'projectId', { unique: false });
          permStore.createIndex('userEmail', 'userEmail', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_EXTERNAL_EVENTS)) db.createObjectStore(STORE_EXTERNAL_EVENTS, { keyPath: 'id' });
      };
      request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
      request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
    });
  },

  ensureAdminExists: async (): Promise<void> => {
      const database = await db.open();
      return new Promise((resolve) => {
          const transaction = database.transaction(STORE_USERS, 'readwrite');
          const store = transaction.objectStore(STORE_USERS);
          const emailIndex = store.index('email');
          const req = emailIndex.get('arch.luigiresta@gmail.com');
          req.onsuccess = () => {
              const adminUser: User = {
                  id: req.result ? req.result.id : crypto.randomUUID(),
                  name: 'Luigi Resta (Admin)',
                  email: 'arch.luigiresta@gmail.com',
                  password: 'admin123',
                  isSystemAdmin: true,
                  status: 'active'
              };
              store.put(adminUser);
          };
          transaction.oncomplete = () => resolve();
      });
  },

  seedInitialProjects: async (ownerId: string): Promise<void> => {
      const projects = await db.getProjectsForUser(ownerId, '');
      if (projects.length > 4) return; // Se ci sono già più dei 4 iniziali, non facciamo nulla

      const convertDate = (d: string) => {
          const parts = d.split('/');
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
      };

      const dataToSeed = [
          { entity: 'Provincia di Taranto', location: 'Castellaneta', cup: 'D85B18001450002', name: 'Lavori di DEMOLIZIONE E RICOSTRUZIONE IMMOBILE VIALE VERDI N. 12', dates: ['13/11/2024', '31/01/2025', '19/02/2025', '13/03/2025', '07/04/2025', '23/04/2025', '05/06/2025', '02/07/2025', '02/09/2025'], assignment: 'Collaudo Statico e Tecnico Amministrativo' },
          { entity: 'Comune di Torre S. Susanna', location: 'Torre S. Susanna', cup: 'I81B220004100007', name: 'INTERVENTI PER LA RIDUZIONE DEL RISCHIO IDROGEOLOGICO', dates: ['31/07/2025', '20/11/2025'], assignment: 'Collaudo Tecnico Amministrativo' },
          { entity: 'Comune di Ceglie Messapica', location: 'Ceglie Messapica', cup: 'J15F21000340001', name: 'Recupero, restauro e rifunzionalizzazione del Castello Ducale (Statico)', dates: ['09/05/2025', '10/10/2025'], assignment: 'Collaudo Statico' },
          { entity: 'Comune di Ceglie Messapica', location: 'Ceglie Messapica', cup: 'J15F21000340001', name: 'Recupero, restauro e rifunzionalizzazione del Castello Ducale (T.A.)', dates: [], assignment: 'Collaudo Tecnico Amministrativo' },
          { entity: 'Comune di Statte', location: 'Statte', cup: '', name: 'Lavori di Adeguamento Normativo Pista di Atletica - Stadio Comunale', dates: ['28/08/2025', '20/11/2025'], assignment: 'Collaudo Statico e Tecnico Amministrativo' },
          { entity: 'Comune di Palagiano', location: 'Palagiano', cup: 'E84D18000190002', name: 'Riutilizzo ai fini irrigui delle acque reflue affinate depuratori', dates: [], assignment: 'Collaudo Statico e Tecnico Amministrativo' }
      ];

      for (const item of dataToSeed) {
          const newProject = createEmptyProject(ownerId);
          newProject.entity = item.entity.toUpperCase();
          newProject.location = item.location;
          newProject.cup = item.cup;
          newProject.projectName = item.name;
          newProject.subjects.testerAppointment.nominationType = item.assignment;
          
          await db.saveProject(newProject);

          // Creiamo i verbali per ogni data
          if (item.dates.length > 0) {
              for (let i = 0; i < item.dates.length; i++) {
                  const doc = createInitialDocument(newProject.id);
                  doc.visitNumber = i + 1;
                  doc.date = convertDate(item.dates[i]);
                  await db.saveDocument(doc);
              }
          } else {
              // Almeno un documento iniziale se non ci sono date
              await db.saveDocument(createInitialDocument(newProject.id));
          }
      }
  },

  seedExternalData: async (): Promise<void> => {
      // Questa funzione rimane per mantenere il Calendario popolato anche con eventi fuori app
      const current = await db.getExternalEvents();
      if (current.length > 0) return;
      // ... (rimossa logica duplicata, ora gestita da seedInitialProjects)
  },

  registerUser: async (user: User): Promise<void> => {
    const database = await db.open();
    return new Promise((resolve) => {
      const transaction = database.transaction(STORE_USERS, 'readwrite');
      transaction.objectStore(STORE_USERS).add(user).onsuccess = () => resolve();
    });
  },

  loginUser: async (email: string, password: string): Promise<User> => {
    await db.ensureAdminExists();
    const database = await db.open();
    return new Promise((resolve, reject) => {
        const store = database.transaction(STORE_USERS, 'readonly').objectStore(STORE_USERS);
        const request = store.index('email').get(email);
        request.onsuccess = () => {
            const user = request.result as User;
            if (user && user.password === password) resolve(user);
            else reject(new Error("Credenziali non valide."));
        };
    });
  },

  getAllUsers: async (): Promise<User[]> => {
      const database = await db.open();
      return new Promise((resolve) => {
          database.transaction(STORE_USERS, 'readonly').objectStore(STORE_USERS).getAll().onsuccess = (e) => resolve((e.target as any).result);
      });
  },

  updateUserStatus: async (userId: string, status: UserStatus, isSystemAdmin?: boolean): Promise<void> => {
      const database = await db.open();
      return new Promise((resolve) => {
          const transaction = database.transaction(STORE_USERS, 'readwrite');
          const store = transaction.objectStore(STORE_USERS);
          store.get(userId).onsuccess = (e) => {
              const user = (e.target as any).result;
              if (user) {
                  user.status = status;
                  if (isSystemAdmin !== undefined) user.isSystemAdmin = isSystemAdmin;
                  store.put(user);
              }
          };
          transaction.oncomplete = () => resolve();
      });
  },

  saveExternalEvent: async (event: ExternalEvent): Promise<void> => {
      const database = await db.open();
      return new Promise((resolve) => {
          const transaction = database.transaction(STORE_EXTERNAL_EVENTS, 'readwrite');
          transaction.objectStore(STORE_EXTERNAL_EVENTS).put(event);
          transaction.oncomplete = () => resolve();
      });
  },

  getExternalEvents: async (): Promise<ExternalEvent[]> => {
      const database = await db.open();
      return new Promise((resolve) => {
          database.transaction(STORE_EXTERNAL_EVENTS, 'readonly').objectStore(STORE_EXTERNAL_EVENTS).getAll().onsuccess = (e) => resolve((e.target as any).result);
      });
  },

  deleteExternalEvent: async (id: string): Promise<void> => {
      const database = await db.open();
      return new Promise((resolve) => {
          database.transaction(STORE_EXTERNAL_EVENTS, 'readwrite').objectStore(STORE_EXTERNAL_EVENTS).delete(id).onsuccess = () => resolve();
      });
  },

  getProjectsForUser: async (userId: string, userEmail: string): Promise<ProjectConstants[]> => {
    const database = await db.open();
    return new Promise((resolve) => {
        database.transaction(STORE_PROJECTS, 'readonly').objectStore(STORE_PROJECTS).getAll().onsuccess = (e) => resolve((e.target as any).result);
    });
  },

  saveProject: async (project: ProjectConstants): Promise<void> => {
    const database = await db.open();
    return new Promise((resolve) => {
      const transaction = database.transaction(STORE_PROJECTS, 'readwrite');
      transaction.objectStore(STORE_PROJECTS).put(project);
      transaction.oncomplete = () => resolve();
    });
  },

  deleteProject: async (id: string): Promise<void> => {
      const database = await db.open();
      return new Promise((resolve) => {
          const transaction = database.transaction([STORE_PROJECTS, STORE_DOCUMENTS], 'readwrite');
          transaction.objectStore(STORE_PROJECTS).delete(id);
          // Eliminiamo anche i documenti associati
          const docStore = transaction.objectStore(STORE_DOCUMENTS);
          const index = docStore.index('projectId');
          index.getAllKeys(id).onsuccess = (e) => {
              const keys = (e.target as any).result;
              keys.forEach((k: string) => docStore.delete(k));
          };
          transaction.oncomplete = () => resolve();
      });
  },

  getAllDocuments: async (): Promise<DocumentVariables[]> => {
      const database = await db.open();
      return new Promise((resolve) => {
          database.transaction(STORE_DOCUMENTS, 'readonly').objectStore(STORE_DOCUMENTS).getAll().onsuccess = (e) => resolve((e.target as any).result);
      });
  },

  getDocumentsByProject: async (projectId: string): Promise<DocumentVariables[]> => {
    const database = await db.open();
    return new Promise((resolve) => {
      database.transaction(STORE_DOCUMENTS, 'readonly').objectStore(STORE_DOCUMENTS).index('projectId').getAll(projectId).onsuccess = (e) => resolve((e.target as any).result);
    });
  },

  saveDocument: async (doc: DocumentVariables): Promise<void> => {
    const database = await db.open();
    return new Promise((resolve) => {
      const transaction = database.transaction(STORE_DOCUMENTS, 'readwrite');
      transaction.objectStore(STORE_DOCUMENTS).put(doc);
      transaction.oncomplete = () => resolve();
    });
  },

  deleteDocument: async (docId: string): Promise<void> => {
      const database = await db.open();
      return new Promise((resolve) => {
        const transaction = database.transaction(STORE_DOCUMENTS, 'readwrite');
        transaction.objectStore(STORE_DOCUMENTS).delete(docId);
        transaction.oncomplete = () => resolve();
      });
  },

  getProjectPermissions: async (projectId: string): Promise<ProjectPermission[]> => {
    const database = await db.open();
    return new Promise((resolve) => {
      database.transaction(STORE_PERMISSIONS, 'readonly').objectStore(STORE_PERMISSIONS).index('projectId').getAll(projectId).onsuccess = (e) => resolve((e.target as any).result);
    });
  },

  shareProject: async (permission: ProjectPermission): Promise<void> => {
    const database = await db.open();
    return new Promise((resolve) => {
      const transaction = database.transaction(STORE_PERMISSIONS, 'readwrite');
      transaction.objectStore(STORE_PERMISSIONS).put(permission);
      transaction.oncomplete = () => resolve();
    });
  },

  getDatabaseBackup: async (): Promise<BackupData> => {
      const database = await db.open();
      return new Promise((resolve) => {
          const transaction = database.transaction([STORE_PROJECTS, STORE_DOCUMENTS, STORE_USERS, STORE_PERMISSIONS, STORE_EXTERNAL_EVENTS], 'readonly');
          const pReq = transaction.objectStore(STORE_PROJECTS).getAll();
          const dReq = transaction.objectStore(STORE_DOCUMENTS).getAll();
          const uReq = transaction.objectStore(STORE_USERS).getAll();
          const pmReq = transaction.objectStore(STORE_PERMISSIONS).getAll();
          transaction.oncomplete = () => {
              resolve({ version: 1, timestamp: Date.now(), users: uReq.result || [], projects: pReq.result || [], documents: dReq.result || [], permissions: pmReq.result || [] });
          };
      });
  },

  restoreDatabaseBackup: async (data: BackupData): Promise<void> => {
    const database = await db.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_PROJECTS, STORE_DOCUMENTS, STORE_USERS, STORE_PERMISSIONS], 'readwrite');
      transaction.objectStore(STORE_PROJECTS).clear();
      transaction.objectStore(STORE_DOCUMENTS).clear();
      transaction.objectStore(STORE_USERS).clear();
      transaction.objectStore(STORE_PERMISSIONS).clear();
      data.projects.forEach(p => transaction.objectStore(STORE_PROJECTS).put(p));
      data.documents.forEach(d => transaction.objectStore(STORE_DOCUMENTS).put(d));
      data.users.forEach(u => transaction.objectStore(STORE_USERS).put(u));
      data.permissions.forEach(pm => transaction.objectStore(STORE_PERMISSIONS).put(pm));
      transaction.oncomplete = () => resolve();
    });
  }
};
