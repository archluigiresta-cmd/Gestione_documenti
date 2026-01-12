
import { ProjectConstants, DocumentVariables, User, ProjectPermission, PermissionRole, UserStatus, BackupData, ExternalEvent } from './types';
import { createEmptyProject, createInitialDocument } from './constants';

const DB_NAME = 'EdilAppDB';
// Bumped DB_VERSION to 6 to account for external_events store
const DB_VERSION = 6; 
const STORE_PROJECTS = 'projects';
const STORE_DOCUMENTS = 'documents';
const STORE_USERS = 'users';
const STORE_PERMISSIONS = 'permissions';
// New store for external projects summary
const STORE_EXTERNAL_EVENTS = 'external_events';

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
        // Properly create the external_events store
        if (!db.objectStoreNames.contains(STORE_EXTERNAL_EVENTS)) {
          db.createObjectStore(STORE_EXTERNAL_EVENTS, { keyPath: 'id' });
        }
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
      const existingProjects = await db.getProjectsForUser(ownerId, '');
      if (existingProjects.length === 0) {
          const firstProject = createEmptyProject(ownerId);
          firstProject.projectName = "Progetto di Esempio";
          firstProject.entity = "COMUNE DI ESEMPIO";
          await db.saveProject(firstProject);
          await db.saveDocument(createInitialDocument(firstProject.id));
      }
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

  getProjectsForUser: async (userId: string, userEmail: string): Promise<ProjectConstants[]> => {
    const database = await db.open();
    return new Promise((resolve) => {
        database.transaction(STORE_PROJECTS, 'readonly').objectStore(STORE_PROJECTS).getAll().onsuccess = (e) => resolve((e.target as any).result);
    });
  },

  getUserPermissions: async (email: string): Promise<ProjectPermission[]> => {
    const database = await db.open();
    return new Promise((resolve) => {
        const store = database.transaction(STORE_PERMISSIONS, 'readonly').objectStore(STORE_PERMISSIONS);
        store.index('userEmail').getAll(email).onsuccess = (e) => resolve((e.target as any).result);
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

  // Missing method getExternalEvents implemented
  getExternalEvents: async (): Promise<ExternalEvent[]> => {
      const database = await db.open();
      return new Promise((resolve) => {
          database.transaction(STORE_EXTERNAL_EVENTS, 'readonly').objectStore(STORE_EXTERNAL_EVENTS).getAll().onsuccess = (e) => resolve((e.target as any).result);
      });
  },

  // Missing method saveExternalEvent implemented
  saveExternalEvent: async (event: ExternalEvent): Promise<void> => {
    const database = await db.open();
    return new Promise((resolve) => {
      const transaction = database.transaction(STORE_EXTERNAL_EVENTS, 'readwrite');
      transaction.objectStore(STORE_EXTERNAL_EVENTS).put(event);
      transaction.oncomplete = () => resolve();
    });
  },

  // Missing method deleteExternalEvent implemented
  deleteExternalEvent: async (id: string): Promise<void> => {
      const database = await db.open();
      return new Promise((resolve) => {
          const transaction = database.transaction(STORE_EXTERNAL_EVENTS, 'readwrite');
          transaction.objectStore(STORE_EXTERNAL_EVENTS).delete(id);
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
          const eReq = transaction.objectStore(STORE_EXTERNAL_EVENTS).getAll();
          transaction.oncomplete = () => {
              resolve({ 
                  version: 1, 
                  timestamp: Date.now(), 
                  users: uReq.result || [], 
                  projects: pReq.result || [], 
                  documents: dReq.result || [], 
                  permissions: pmReq.result || [],
                  externalEvents: eReq.result || []
              });
          };
      });
  },

  restoreDatabaseBackup: async (data: BackupData): Promise<void> => {
    const database = await db.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_PROJECTS, STORE_DOCUMENTS, STORE_USERS, STORE_PERMISSIONS, STORE_EXTERNAL_EVENTS], 'readwrite');
      transaction.objectStore(STORE_PROJECTS).clear();
      transaction.objectStore(STORE_DOCUMENTS).clear();
      transaction.objectStore(STORE_USERS).clear();
      transaction.objectStore(STORE_PERMISSIONS).clear();
      transaction.objectStore(STORE_EXTERNAL_EVENTS).clear();
      data.projects.forEach(p => transaction.objectStore(STORE_PROJECTS).put(p));
      data.documents.forEach(d => transaction.objectStore(STORE_DOCUMENTS).put(d));
      data.users.forEach(u => transaction.objectStore(STORE_USERS).put(u));
      data.permissions.forEach(pm => transaction.objectStore(STORE_PERMISSIONS).put(pm));
      if (data.externalEvents) {
          data.externalEvents.forEach(e => transaction.objectStore(STORE_EXTERNAL_EVENTS).put(e));
      }
      transaction.oncomplete = () => resolve();
    });
  }
};

// Explicitly re-export ExternalEvent
export type { ExternalEvent };
