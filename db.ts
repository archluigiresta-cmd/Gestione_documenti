
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
        request.onerror = (e) => {
            console.error("IndexedDB error:", (e.target as IDBOpenDBRequest).error);
            reject((e.target as IDBOpenDBRequest).error);
        };
      } catch (err) {
        reject(err);
      }
    });
  },

  ensureAdminExists: async (): Promise<void> => {
    try {
        const database = await db.open();
        return new Promise((resolve) => {
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
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => resolve(); // Non bloccare l'app se fallisce l'aggiornamento admin
        });
    } catch (e) {
        console.warn("Could not ensure admin exists, proceeding...", e);
    }
  },

  registerUser: async (user: User): Promise<void> => {
    const database = await db.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_USERS, 'readwrite');
      const store = transaction.objectStore(STORE_USERS);
      const request = store.add(user);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Email già in uso o errore DB."));
    });
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
          if (user.status !== 'active') reject(new Error("Account in attesa di approvazione."));
          else resolve(user);
        } else reject(new Error("Credenziali non valide."));
      };
      request.onerror = () => reject(new Error("Errore durante il login."));
    });
  },

  // Added missing method to get all users for Admin Panel
  getAllUsers: async (): Promise<User[]> => {
    const database = await db.open();
    const tx = database.transaction(STORE_USERS, 'readonly');
    const store = tx.objectStore(STORE_USERS);
    const request = store.getAll();
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve([]);
    });
  },

  // Added missing method to update user status/admin status
  updateUserStatus: async (userId: string, status: UserStatus, isAdmin?: boolean): Promise<void> => {
    const database = await db.open();
    const tx = database.transaction(STORE_USERS, 'readwrite');
    const store = tx.objectStore(STORE_USERS);
    const request = store.get(userId);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const user = request.result as User;
        if (user) {
          user.status = status;
          if (isAdmin !== undefined) user.isSystemAdmin = isAdmin;
          store.put(user);
        }
        resolve();
      };
      request.onerror = () => reject(new Error("Errore aggiornamento utente"));
    });
  },

  getProjectsForUser: async (userId: string, userEmail: string): Promise<ProjectConstants[]> => {
    const database = await db.open();
    const transaction = database.transaction(STORE_PROJECTS, 'readonly');
    const store = transaction.objectStore(STORE_PROJECTS);
    const request = store.getAll();
    return new Promise((resolve) => {
      request.onsuccess = () => {
        const all = request.result as ProjectConstants[];
        if (userEmail === 'arch.luigiresta@gmail.com') resolve(all);
        else resolve(all.filter(p => p.ownerId === userId));
      };
      request.onerror = () => resolve([]);
    });
  },

  saveProject: async (p: ProjectConstants) => {
    const database = await db.open();
    const tx = database.transaction(STORE_PROJECTS, 'readwrite');
    tx.objectStore(STORE_PROJECTS).put(p);
  },

  deleteProject: async (id: string) => {
    const database = await db.open();
    const tx = database.transaction(STORE_PROJECTS, 'readwrite');
    tx.objectStore(STORE_PROJECTS).delete(id);
  },

  // Added missing method to share project permissions
  shareProject: async (permission: ProjectPermission): Promise<void> => {
    const database = await db.open();
    const tx = database.transaction(STORE_PERMISSIONS, 'readwrite');
    tx.objectStore(STORE_PERMISSIONS).put(permission);
  },

  // Added missing method to get project permissions
  getProjectPermissions: async (projectId: string): Promise<ProjectPermission[]> => {
    const database = await db.open();
    const tx = database.transaction(STORE_PERMISSIONS, 'readonly');
    const index = tx.objectStore(STORE_PERMISSIONS).index('projectId');
    const req = index.getAll(projectId);
    return new Promise((res) => {
      req.onsuccess = () => res(req.result);
      req.onerror = () => res([]);
    });
  },

  getDocumentsByProject: async (projectId: string): Promise<DocumentVariables[]> => {
    const database = await db.open();
    const tx = database.transaction(STORE_DOCUMENTS, 'readonly');
    const index = tx.objectStore(STORE_DOCUMENTS).index('projectId');
    const req = index.getAll(projectId);
    return new Promise(res => { 
        req.onsuccess = () => res(req.result); 
        req.onerror = () => res([]);
    });
  },

  saveDocument: async (doc: DocumentVariables) => {
    const database = await db.open();
    const tx = database.transaction(STORE_DOCUMENTS, 'readwrite');
    tx.objectStore(STORE_DOCUMENTS).put(doc);
  },

  deleteDocument: async (id: string) => {
    const database = await db.open();
    const tx = database.transaction(STORE_DOCUMENTS, 'readwrite');
    tx.objectStore(STORE_DOCUMENTS).delete(id);
  },

  getDatabaseBackup: async (): Promise<BackupData> => {
    const database = await db.open();
    return new Promise((resolve) => {
      const tx = database.transaction([STORE_PROJECTS, STORE_DOCUMENTS, STORE_USERS], 'readonly');
      const pReq = tx.objectStore(STORE_PROJECTS).getAll();
      const dReq = tx.objectStore(STORE_DOCUMENTS).getAll();
      const uReq = tx.objectStore(STORE_USERS).getAll();
      tx.oncomplete = () => {
        resolve({
          version: 1,
          timestamp: Date.now(),
          users: uReq.result,
          projects: pReq.result,
          documents: dReq.result,
          permissions: []
        });
      };
    });
  },

  restoreDatabaseBackup: async (data: BackupData) => {
    const database = await db.open();
    const tx = database.transaction([STORE_PROJECTS, STORE_DOCUMENTS, STORE_USERS], 'readwrite');
    tx.objectStore(STORE_PROJECTS).clear();
    tx.objectStore(STORE_DOCUMENTS).clear();
    tx.objectStore(STORE_USERS).clear();
    data.projects.forEach(p => tx.objectStore(STORE_PROJECTS).add(p));
    data.documents.forEach(d => tx.objectStore(STORE_DOCUMENTS).add(d));
    data.users.forEach(u => tx.objectStore(STORE_USERS).add(u));
  }
};
