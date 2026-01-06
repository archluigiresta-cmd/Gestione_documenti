
import { ProjectConstants, DocumentVariables, User, ProjectPermission, UserStatus, BackupData } from './types';

const DB_NAME = 'EdilAppDB';
const DB_VERSION = 2;
const STORE_PROJECTS = 'projects';
const STORE_DOCUMENTS = 'documents';
const STORE_USERS = 'users';
const STORE_PERMISSIONS = 'permissions';

export const db = {
  open: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      try {
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
        };
        request.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
        request.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
        request.onblocked = () => {
           console.warn("Database blocked");
           // Forziamo una risoluzione per non bloccare l'app
           setTimeout(() => resolve(request.result), 1000);
        };
      } catch (err) { reject(err); }
    });
  },

  ensureAdminExists: async (): Promise<void> => {
    try {
      const database = await db.open();
      const transaction = database.transaction(STORE_USERS, 'readwrite');
      const store = transaction.objectStore(STORE_USERS);
      const adminUser: User = {
        id: 'admin-luigi-resta',
        name: 'Luigi Resta (Admin)',
        email: 'arch.luigiresta@gmail.com',
        password: 'admin123',
        isSystemAdmin: true,
        status: 'active'
      };
      store.put(adminUser);
      return new Promise((resolve) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => resolve();
      });
    } catch (e) { 
      console.error("Admin seeding failed", e);
    }
  },

  loginUser: async (email: string, password: string): Promise<User> => {
    await db.ensureAdminExists();
    const database = await db.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_USERS, 'readonly');
      const store = transaction.objectStore(STORE_USERS);
      const index = store.index('email');
      const request = index.get(email);
      request.onsuccess = () => {
        const user = request.result as User;
        if (user && user.password === password) {
          if (user.status !== 'active') reject(new Error("Account non ancora attivo."));
          else resolve(user);
        } else reject(new Error("Credenziali errate."));
      };
      request.onerror = () => reject(new Error("Errore login."));
    });
  },

  registerUser: async (user: User): Promise<void> => {
    const database = await db.open();
    const transaction = database.transaction(STORE_USERS, 'readwrite');
    transaction.objectStore(STORE_USERS).add(user);
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new Error("Errore registrazione."));
    });
  },

  getAllUsers: async (): Promise<User[]> => {
    const database = await db.open();
    const store = database.transaction(STORE_USERS, 'readonly').objectStore(STORE_USERS);
    const req = store.getAll();
    return new Promise(res => req.onsuccess = () => res(req.result || []));
  },

  updateUserStatus: async (userId: string, status: UserStatus, isSystemAdmin?: boolean): Promise<void> => {
    const database = await db.open();
    const transaction = database.transaction(STORE_USERS, 'readwrite');
    const store = transaction.objectStore(STORE_USERS);
    const req = store.get(userId);
    return new Promise((resolve) => {
      req.onsuccess = () => {
        const user = req.result;
        if (user) {
          user.status = status;
          if (isSystemAdmin !== undefined) user.isSystemAdmin = isSystemAdmin;
          store.put(user);
        }
        resolve();
      };
    });
  },

  getProjectsForUser: async (userId: string, userEmail: string): Promise<ProjectConstants[]> => {
    const database = await db.open();
    const store = database.transaction(STORE_PROJECTS, 'readonly').objectStore(STORE_PROJECTS);
    const req = store.getAll();
    return new Promise((resolve) => {
      req.onsuccess = () => {
        const all = req.result as ProjectConstants[];
        if (userEmail === 'arch.luigiresta@gmail.com') resolve(all);
        else resolve(all.filter(p => p.ownerId === userId));
      };
    });
  },

  saveProject: async (p: ProjectConstants) => {
    const database = await db.open();
    database.transaction(STORE_PROJECTS, 'readwrite').objectStore(STORE_PROJECTS).put(p);
  },

  deleteProject: async (id: string) => {
    const database = await db.open();
    database.transaction(STORE_PROJECTS, 'readwrite').objectStore(STORE_PROJECTS).delete(id);
  },

  getDocumentsByProject: async (projectId: string): Promise<DocumentVariables[]> => {
    const database = await db.open();
    const index = database.transaction(STORE_DOCUMENTS, 'readonly').objectStore(STORE_DOCUMENTS).index('projectId');
    const req = index.getAll(projectId);
    return new Promise(res => req.onsuccess = () => res(req.result || []));
  },

  saveDocument: async (doc: DocumentVariables) => {
    const database = await db.open();
    database.transaction(STORE_DOCUMENTS, 'readwrite').objectStore(STORE_DOCUMENTS).put(doc);
  },

  deleteDocument: async (id: string) => {
    const database = await db.open();
    database.transaction(STORE_DOCUMENTS, 'readwrite').objectStore(STORE_DOCUMENTS).delete(id);
  },

  getProjectPermissions: async (projectId: string): Promise<ProjectPermission[]> => {
    const database = await db.open();
    const index = database.transaction(STORE_PERMISSIONS, 'readonly').objectStore(STORE_PERMISSIONS).index('projectId');
    const req = index.getAll(projectId);
    return new Promise(res => req.onsuccess = () => res(req.result || []));
  },

  shareProject: async (perm: ProjectPermission): Promise<void> => {
    const database = await db.open();
    database.transaction(STORE_PERMISSIONS, 'readwrite').objectStore(STORE_PERMISSIONS).put(perm);
  },

  getDatabaseBackup: async (): Promise<BackupData> => {
    const database = await db.open();
    return new Promise((resolve) => {
      const tx = database.transaction([STORE_PROJECTS, STORE_DOCUMENTS, STORE_USERS, STORE_PERMISSIONS], 'readonly');
      const pReq = tx.objectStore(STORE_PROJECTS).getAll();
      const dReq = tx.objectStore(STORE_DOCUMENTS).getAll();
      const uReq = tx.objectStore(STORE_USERS).getAll();
      const permReq = tx.objectStore(STORE_PERMISSIONS).getAll();
      tx.oncomplete = () => {
        resolve({
          version: 2,
          timestamp: Date.now(),
          users: uReq.result,
          projects: pReq.result,
          documents: dReq.result,
          permissions: permReq.result || []
        });
      };
    });
  },

  restoreDatabaseBackup: async (data: BackupData) => {
    const database = await db.open();
    const tx = database.transaction([STORE_PROJECTS, STORE_DOCUMENTS, STORE_USERS, STORE_PERMISSIONS], 'readwrite');
    tx.objectStore(STORE_PROJECTS).clear();
    tx.objectStore(STORE_DOCUMENTS).clear();
    tx.objectStore(STORE_USERS).clear();
    tx.objectStore(STORE_PERMISSIONS).clear();
    data.projects.forEach(p => tx.objectStore(STORE_PROJECTS).add(p));
    data.documents.forEach(d => tx.objectStore(STORE_DOCUMENTS).add(d));
    data.users.forEach(u => tx.objectStore(STORE_USERS).add(u));
  }
};
