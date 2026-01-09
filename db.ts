
import { ProjectConstants, DocumentVariables, User, UserStatus, BackupData, ProjectPermission } from './types';
import { generateSafeId } from './constants';

const DB_NAME = 'EdilAppDB_v4'; 
const DB_VERSION = 30; 

const STORES = {
  PROJECTS: 'projects',
  DOCUMENTS: 'documents',
  USERS: 'users',
  PERMISSIONS: 'permissions'
};

const OLD_DB_NAMES = [
  'EdilAppDB', 'EdilAppDB_v1', 'EdilAppDB_v2', 'EdilAppDB_v3', 
  'EdilAppDB_v4', 'EdilAppDB_Final', 'EdilAppDB_v4_temp', 
  'edilapp-db', 'EdilApp_DB', 'EdilAppDB_v4_stable'
];

export const db = {
  open: (name = DB_NAME, version = DB_VERSION): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name, version);
      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;
        Object.values(STORES).forEach(storeName => {
          if (!database.objectStoreNames.contains(storeName)) {
            database.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
        const tx = (event.target as IDBOpenDBRequest).transaction!;
        if (!tx.objectStore(STORES.DOCUMENTS).indexNames.contains('projectId')) {
            tx.objectStore(STORES.DOCUMENTS).createIndex('projectId', 'projectId', { unique: false });
        }
        if (!tx.objectStore(STORES.USERS).indexNames.contains('email')) {
            tx.objectStore(STORES.USERS).createIndex('email', 'email', { unique: true });
        }
        if (!tx.objectStore(STORES.PERMISSIONS).indexNames.contains('projectId')) {
            tx.objectStore(STORES.PERMISSIONS).createIndex('projectId', 'projectId', { unique: false });
        }
      };
      request.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
      request.onerror = (e) => reject(e);
    });
  },

  recoveryOldData: async (): Promise<number> => {
    let recoveredCount = 0;
    const currentDb = await db.open();

    for (const oldName of OLD_DB_NAMES) {
      try {
        const oldDb = await new Promise<IDBDatabase | null>((res) => {
          const req = indexedDB.open(oldName);
          req.onsuccess = () => res(req.result);
          req.onerror = () => res(null);
        });

        if (!oldDb) continue;
        if (!oldDb.objectStoreNames.contains(STORES.PROJECTS)) {
          oldDb.close();
          continue;
        }

        const projects = await new Promise<ProjectConstants[]>((res) => {
          const tx = oldDb.transaction(STORES.PROJECTS, 'readonly');
          const req = tx.objectStore(STORES.PROJECTS).getAll();
          req.onsuccess = () => res(req.result || []);
          req.onerror = () => res([]);
        });

        if (projects.length > 0) {
          const txCurrent = currentDb.transaction([STORES.PROJECTS, STORES.DOCUMENTS], 'readwrite');
          const projectStore = txCurrent.objectStore(STORES.PROJECTS);
          const docStoreCurrent = txCurrent.objectStore(STORES.DOCUMENTS);
          
          for (const p of projects) {
            projectStore.put(p);
            recoveredCount++;
            
            if (oldDb.objectStoreNames.contains(STORES.DOCUMENTS)) {
                const docs = await new Promise<DocumentVariables[]>((resDoc) => {
                    const txDoc = oldDb.transaction(STORES.DOCUMENTS, 'readonly');
                    const reqDoc = txDoc.objectStore(STORES.DOCUMENTS).getAll();
                    reqDoc.onsuccess = () => resDoc(reqDoc.result || []);
                    reqDoc.onerror = () => resDoc([]);
                });
                docs.filter(d => d.projectId === p.id).forEach(d => docStoreCurrent.put(d));
            }
          }
        }
        oldDb.close();
      } catch (e) { console.warn(`DB Recovery: Ignorato ${oldName}`); }
    }
    return recoveredCount;
  },

  ensureAdminExists: async (): Promise<void> => {
    const database = await db.open();
    return new Promise((resolve) => {
      const tx = database.transaction(STORES.USERS, 'readwrite');
      const store = tx.objectStore(STORES.USERS);
      const admin: User = {
        id: 'admin-luigi',
        name: 'Luigi Resta',
        email: 'arch.luigiresta@gmail.com',
        password: 'admin123',
        isSystemAdmin: true,
        status: 'active'
      };
      store.put(admin);
      resolve();
    });
  },

  registerUser: async (user: User): Promise<void> => {
    const database = await db.open();
    const tx = database.transaction(STORES.USERS, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = tx.objectStore(STORES.USERS).add(user);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(new Error("Errore registrazione."));
    });
  },

  loginUser: async (email: string, password: string): Promise<User> => {
    const database = await db.open();
    const tx = database.transaction(STORES.USERS, 'readonly');
    const index = tx.objectStore(STORES.USERS).index('email');
    const req = index.get(email);
    return new Promise((resolve, reject) => {
      req.onsuccess = () => {
        const user = req.result as User;
        if (user && user.password === password) resolve(user);
        else reject(new Error("Credenziali errate."));
      };
    });
  },

  getAllUsers: async (): Promise<User[]> => {
    const database = await db.open();
    const store = database.transaction(STORES.USERS, 'readonly').objectStore(STORES.USERS);
    const req = store.getAll();
    return new Promise((resolve) => req.onsuccess = () => resolve(req.result || []));
  },

  updateUserStatus: async (userId: string, status: UserStatus, isSystemAdmin?: boolean): Promise<void> => {
    const database = await db.open();
    const tx = database.transaction(STORES.USERS, 'readwrite');
    const store = tx.objectStore(STORES.USERS);
    const req = store.get(userId);
    return new Promise((resolve, reject) => {
      req.onsuccess = () => {
        const user = req.result as User;
        if (user) {
          user.status = status;
          if (isSystemAdmin !== undefined) user.isSystemAdmin = isSystemAdmin;
          store.put(user);
          resolve();
        } else reject(new Error("Utente non trovato."));
      };
    });
  },

  getProjectsForUser: async (userId: string, email: string): Promise<ProjectConstants[]> => {
    const database = await db.open();
    const store = database.transaction(STORES.PROJECTS, 'readonly').objectStore(STORES.PROJECTS);
    const req = store.getAll();
    return new Promise((resolve) => {
      req.onsuccess = () => {
        const all = req.result as ProjectConstants[];
        if (email === 'arch.luigiresta@gmail.com') resolve(all);
        else resolve(all.filter(p => p.ownerId === userId));
      };
    });
  },

  saveProject: async (p: ProjectConstants) => {
    const database = await db.open();
    database.transaction(STORES.PROJECTS, 'readwrite').objectStore(STORES.PROJECTS).put(p);
  },

  deleteProject: async (id: string) => {
    const database = await db.open();
    const tx = database.transaction([STORES.PROJECTS, STORES.DOCUMENTS], 'readwrite');
    tx.objectStore(STORES.PROJECTS).delete(id);
    const docStore = tx.objectStore(STORES.DOCUMENTS);
    const index = docStore.index('projectId');
    const req = index.getAllKeys(id);
    req.onsuccess = () => req.result.forEach(key => docStore.delete(key));
  },

  getProjectPermissions: async (projectId: string): Promise<ProjectPermission[]> => {
    const database = await db.open();
    const index = database.transaction(STORES.PERMISSIONS, 'readonly').objectStore(STORES.PERMISSIONS).index('projectId');
    const req = index.getAll(projectId);
    return new Promise((resolve) => req.onsuccess = () => resolve(req.result || []));
  },

  shareProject: async (permission: ProjectPermission): Promise<void> => {
    const database = await db.open();
    database.transaction(STORES.PERMISSIONS, 'readwrite').objectStore(STORES.PERMISSIONS).put(permission);
  },

  getDocumentsByProject: async (projectId: string): Promise<DocumentVariables[]> => {
    const database = await db.open();
    const index = database.transaction(STORES.DOCUMENTS, 'readonly').objectStore(STORES.DOCUMENTS).index('projectId');
    const req = index.getAll(projectId);
    return new Promise(res => req.onsuccess = () => res(req.result || []));
  },

  saveDocument: async (doc: DocumentVariables) => {
    const database = await db.open();
    database.transaction(STORES.DOCUMENTS, 'readwrite').objectStore(STORES.DOCUMENTS).put(doc);
  },

  deleteDocument: async (id: string) => {
    const database = await db.open();
    database.transaction(STORES.DOCUMENTS, 'readwrite').objectStore(STORES.DOCUMENTS).delete(id);
  },

  getDatabaseBackup: async (): Promise<BackupData> => {
    const database = await db.open();
    const tx = database.transaction(Object.values(STORES), 'readonly');
    const users = await new Promise<User[]>(res => tx.objectStore(STORES.USERS).getAll().onsuccess = (e:any) => res(e.target.result));
    const projects = await new Promise<ProjectConstants[]>(res => tx.objectStore(STORES.PROJECTS).getAll().onsuccess = (e:any) => res(e.target.result));
    const documents = await new Promise<DocumentVariables[]>(res => tx.objectStore(STORES.DOCUMENTS).getAll().onsuccess = (e:any) => res(e.target.result));
    const permissions = await new Promise<ProjectPermission[]>(res => tx.objectStore(STORES.PERMISSIONS).getAll().onsuccess = (e:any) => res(e.target.result));
    return { version: DB_VERSION, timestamp: Date.now(), users, projects, documents, permissions };
  },

  restoreDatabaseBackup: async (data: BackupData) => {
    const database = await db.open();
    const tx = database.transaction(Object.values(STORES), 'readwrite');
    Object.values(STORES).forEach(s => tx.objectStore(s).clear());
    data.users.forEach(u => tx.objectStore(STORES.USERS).add(u));
    data.projects.forEach(p => tx.objectStore(STORES.PROJECTS).add(p));
    data.documents.forEach(d => tx.objectStore(STORES.DOCUMENTS).add(d));
    if (data.permissions) data.permissions.forEach(p => tx.objectStore(STORES.PERMISSIONS).add(p));
  }
};
