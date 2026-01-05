
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
    });
  },

  ensureAdminExists: async (): Promise<void> => {
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
    });
  },

  // Added registerUser method to fix AuthScreen error
  registerUser: async (user: User): Promise<void> => {
    const database = await db.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_USERS, 'readwrite');
      const store = transaction.objectStore(STORE_USERS);
      const request = store.add(user);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Errore durante la registrazione. Forse l'email è già in uso."));
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
          if (user.status !== 'active') reject(new Error("Account non attivo."));
          else resolve(user);
        } else reject(new Error("Credenziali errate."));
      };
      request.onerror = () => reject(request.error);
    });
  },

  // Added getAllUsers method to fix AdminPanel error
  getAllUsers: async (): Promise<User[]> => {
    const database = await db.open();
    const transaction = database.transaction(STORE_USERS, 'readonly');
    const store = transaction.objectStore(STORE_USERS);
    const request = store.getAll();
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Added updateUserStatus method to fix AdminPanel error
  updateUserStatus: async (userId: string, status: UserStatus, isSystemAdmin?: boolean): Promise<void> => {
    const database = await db.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_USERS, 'readwrite');
      const store = transaction.objectStore(STORE_USERS);
      const request = store.get(userId);
      request.onsuccess = () => {
        const user = request.result as User;
        if (user) {
          user.status = status;
          if (isSystemAdmin !== undefined) user.isSystemAdmin = isSystemAdmin;
          store.put(user);
          resolve();
        } else {
          reject(new Error("Utente non trovato"));
        }
      };
      request.onerror = () => reject(request.error);
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
        // Semplificazione per ripristino: l'admin vede tutto, l'utente vede i propri
        if (userEmail === 'arch.luigiresta@gmail.com') resolve(all);
        else resolve(all.filter(p => p.ownerId === userId));
      };
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

  // Added getProjectPermissions method to fix ProjectSharing error
  getProjectPermissions: async (projectId: string): Promise<ProjectPermission[]> => {
    const database = await db.open();
    const transaction = database.transaction(STORE_PERMISSIONS, 'readonly');
    const index = transaction.objectStore(STORE_PERMISSIONS).index('projectId');
    const request = index.getAll(projectId);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Added shareProject method to fix ProjectSharing error
  shareProject: async (permission: ProjectPermission): Promise<void> => {
    const database = await db.open();
    const tx = database.transaction(STORE_PERMISSIONS, 'readwrite');
    tx.objectStore(STORE_PERMISSIONS).put(permission);
  },

  getDocumentsByProject: async (projectId: string): Promise<DocumentVariables[]> => {
    const database = await db.open();
    const tx = database.transaction(STORE_DOCUMENTS, 'readonly');
    const index = tx.objectStore(STORE_DOCUMENTS).index('projectId');
    const req = index.getAll(projectId);
    return new Promise(res => { req.onsuccess = () => res(req.result); });
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
      const tx = database.transaction([STORE_PROJECTS, STORE_DOCUMENTS, STORE_USERS, STORE_PERMISSIONS], 'readonly');
      const pReq = tx.objectStore(STORE_PROJECTS).getAll();
      const dReq = tx.objectStore(STORE_DOCUMENTS).getAll();
      const uReq = tx.objectStore(STORE_USERS).getAll();
      const permReq = tx.objectStore(STORE_PERMISSIONS).getAll();
      tx.oncomplete = () => {
        resolve({
          version: 1,
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
    if (data.permissions) {
      data.permissions.forEach(p => tx.objectStore(STORE_PERMISSIONS).add(p));
    }
  }
};
