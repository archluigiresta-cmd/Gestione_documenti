
import { ProjectConstants, DocumentVariables, User, UserStatus, BackupData, ProjectPermission } from './types';
import { generateSafeId } from './constants';

const DB_NAME = 'EdilAppDB_Final';
const DB_VERSION = 11; // Forced bump to add permissions index
const STORES = {
  PROJECTS: 'projects',
  DOCUMENTS: 'documents',
  USERS: 'users',
  PERMISSIONS: 'permissions'
};

export const db = {
  open: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      console.log("DB: Opening IndexedDB...");
      const timeout = setTimeout(() => reject(new Error("Timeout: IndexedDB non risponde. Prova a ricaricare la pagina.")), 4000);
      
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = (event) => {
          console.log("DB: Upgrade needed...");
          const database = (event.target as IDBOpenDBRequest).result;
          
          Object.values(STORES).forEach(storeName => {
            if (!database.objectStoreNames.contains(storeName)) {
              database.createObjectStore(storeName, { keyPath: 'id' });
            }
          });
          
          // Create indexes
          const tx = (event.target as IDBOpenDBRequest).transaction!;
          const docStore = tx.objectStore(STORES.DOCUMENTS);
          if (!docStore.indexNames.contains('projectId')) {
            docStore.createIndex('projectId', 'projectId', { unique: false });
          }
          
          const userStore = tx.objectStore(STORES.USERS);
          if (!userStore.indexNames.contains('email')) {
            userStore.createIndex('email', 'email', { unique: true });
          }

          // Fix: added projectId index for permissions store
          const permStore = tx.objectStore(STORES.PERMISSIONS);
          if (!permStore.indexNames.contains('projectId')) {
            permStore.createIndex('projectId', 'projectId', { unique: false });
          }
        };

        request.onsuccess = (e) => {
          clearTimeout(timeout);
          console.log("DB: Success opening.");
          resolve((e.target as IDBOpenDBRequest).result);
        };

        request.onerror = (e) => {
          clearTimeout(timeout);
          console.error("DB: Error opening", e);
          reject(new Error("Errore critico IndexedDB. Verifica di non essere in navigazione incognito."));
        };
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    });
  },

  ensureAdminExists: async (): Promise<void> => {
    try {
      const database = await db.open();
      return new Promise((resolve, reject) => {
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
        
        const req = store.put(admin);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(new Error("Errore seeding admin"));
      });
    } catch (e) {
      console.error("Admin seed failed", e);
    }
  },

  loginUser: async (email: string, password: string): Promise<User> => {
    const database = await db.open();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(STORES.USERS, 'readonly');
      const store = tx.objectStore(STORES.USERS);
      const index = store.index('email');
      const req = index.get(email);
      
      req.onsuccess = () => {
        const user = req.result as User;
        if (user && user.password === password) {
          if (user.status !== 'active') reject(new Error("Account in attesa di attivazione."));
          else resolve(user);
        } else reject(new Error("Email o password non valide."));
      };
      req.onerror = () => reject(new Error("Errore ricerca utente."));
    });
  },

  registerUser: async (user: User): Promise<void> => {
    const database = await db.open();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(STORES.USERS, 'readwrite');
      const store = tx.objectStore(STORES.USERS);
      const req = store.add(user);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(new Error("Email già registrata o errore database."));
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
    const tx = database.transaction(STORES.PROJECTS, 'readwrite');
    tx.objectStore(STORES.PROJECTS).put(p);
  },

  deleteProject: async (id: string) => {
    const database = await db.open();
    const tx = database.transaction([STORES.PROJECTS, STORES.DOCUMENTS], 'readwrite');
    tx.objectStore(STORES.PROJECTS).delete(id);
    // Cleanup documents too
    const docStore = tx.objectStore(STORES.DOCUMENTS);
    const index = docStore.index('projectId');
    const req = index.getAllKeys(id);
    req.onsuccess = () => {
      req.result.forEach(key => docStore.delete(key));
    };
  },

  getDocumentsByProject: async (projectId: string): Promise<DocumentVariables[]> => {
    const database = await db.open();
    const store = database.transaction(STORES.DOCUMENTS, 'readonly').objectStore(STORES.DOCUMENTS);
    const index = store.index('projectId');
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

  getAllUsers: async (): Promise<User[]> => {
    const database = await db.open();
    const req = database.transaction(STORES.USERS, 'readonly').objectStore(STORES.USERS).getAll();
    return new Promise(res => req.onsuccess = () => res(req.result || []));
  },

  updateUserStatus: async (userId: string, status: UserStatus, isSystemAdmin?: boolean) => {
    const database = await db.open();
    const store = database.transaction(STORES.USERS, 'readwrite').objectStore(STORES.USERS);
    const req = store.get(userId);
    req.onsuccess = () => {
      const u = req.result;
      if (u) {
        u.status = status;
        if (isSystemAdmin !== undefined) u.isSystemAdmin = isSystemAdmin;
        store.put(u);
      }
    };
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
    data.permissions.forEach(p => tx.objectStore(STORES.PERMISSIONS).add(p));
  },

  // Fix: added missing getProjectPermissions method to resolve Property access error
  getProjectPermissions: async (projectId: string): Promise<ProjectPermission[]> => {
    const database = await db.open();
    const store = database.transaction(STORES.PERMISSIONS, 'readonly').objectStore(STORES.PERMISSIONS);
    const index = store.index('projectId');
    const req = index.getAll(projectId);
    return new Promise(res => req.onsuccess = () => res(req.result || []));
  },

  // Fix: added missing shareProject method to resolve Property access error
  shareProject: async (p: ProjectPermission) => {
    const database = await db.open();
    const tx = database.transaction(STORES.PERMISSIONS, 'readwrite');
    tx.objectStore(STORES.PERMISSIONS).put(p);
  }
};
