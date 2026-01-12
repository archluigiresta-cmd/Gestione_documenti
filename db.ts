
import { ProjectConstants, DocumentVariables, User, ProjectPermission, PermissionRole, UserStatus, BackupData } from './types';

const DB_NAME = 'EdilAppDB';
const DB_VERSION = 3; // Incrementato per nuovo store
const STORE_PROJECTS = 'projects';
const STORE_DOCUMENTS = 'documents';
const STORE_USERS = 'users';
const STORE_PERMISSIONS = 'permissions';
const STORE_EXTERNAL_EVENTS = 'external_events';

export interface ExternalEvent {
    id: string;
    projectName: string;
    visitNumber: number;
    date: string;
    time: string;
    type: 'visita' | 'scadenza' | 'altro';
}

export const db = {
  open: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
          db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
        }
        
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

        if (!db.objectStoreNames.contains(STORE_EXTERNAL_EVENTS)) {
            db.createObjectStore(STORE_EXTERNAL_EVENTS, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  },

  ensureAdminExists: async (): Promise<void> => {
      const database = await db.open();
      return new Promise((resolve, reject) => {
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
          transaction.onerror = () => resolve();
      });
  },

  // Added missing registerUser method for AuthScreen.tsx
  registerUser: async (user: User): Promise<void> => {
    const database = await db.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_USERS, 'readwrite');
      const store = transaction.objectStore(STORE_USERS);
      const request = store.add(user);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
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
                if (user.status === 'pending') {
                    reject(new Error("Account in attesa di approvazione."));
                } else if (user.status === 'suspended') {
                    reject(new Error("Account sospeso."));
                } else {
                    resolve(user);
                }
            } else {
                reject(new Error("Credenziali non valide."));
            }
        };
        request.onerror = () => reject(request.error);
    });
  },

  getAllUsers: async (): Promise<User[]> => {
      const database = await db.open();
      return new Promise((resolve, reject) => {
          const transaction = database.transaction(STORE_USERS, 'readonly');
          const store = transaction.objectStore(STORE_USERS);
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
      });
  },

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
              }
          };
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
      });
  },

  // --- EXTERNAL EVENTS (Per appalti non ancora in app) ---
  saveExternalEvent: async (event: ExternalEvent): Promise<void> => {
      const database = await db.open();
      return new Promise((resolve, reject) => {
          const transaction = database.transaction(STORE_EXTERNAL_EVENTS, 'readwrite');
          transaction.objectStore(STORE_EXTERNAL_EVENTS).put(event);
          transaction.oncomplete = () => resolve();
      });
  },

  getExternalEvents: async (): Promise<ExternalEvent[]> => {
      const database = await db.open();
      return new Promise((resolve, reject) => {
          const transaction = database.transaction(STORE_EXTERNAL_EVENTS, 'readonly');
          const request = transaction.objectStore(STORE_EXTERNAL_EVENTS).getAll();
          request.onsuccess = () => resolve(request.result);
      });
  },

  deleteExternalEvent: async (id: string): Promise<void> => {
      const database = await db.open();
      return new Promise((resolve, reject) => {
          const transaction = database.transaction(STORE_EXTERNAL_EVENTS, 'readwrite');
          transaction.objectStore(STORE_EXTERNAL_EVENTS).delete(id);
          transaction.oncomplete = () => resolve();
      });
  },

  // --- PROJECTS ---
  getProjectsForUser: async (userId: string, userEmail: string): Promise<ProjectConstants[]> => {
    const database = await db.open();
    return new Promise(async (resolve, reject) => {
        const transaction = database.transaction([STORE_PROJECTS, STORE_PERMISSIONS], 'readonly');
        const pReq = transaction.objectStore(STORE_PROJECTS).getAll();
        pReq.onsuccess = () => resolve(pReq.result);
    });
  },

  saveProject: async (project: ProjectConstants): Promise<void> => {
    const database = await db.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_PROJECTS, 'readwrite');
      transaction.objectStore(STORE_PROJECTS).put(project);
      transaction.oncomplete = () => resolve();
    });
  },

  getAllDocuments: async (): Promise<DocumentVariables[]> => {
      const database = await db.open();
      return new Promise((resolve) => {
          const transaction = database.transaction(STORE_DOCUMENTS, 'readonly');
          const request = transaction.objectStore(STORE_DOCUMENTS).getAll();
          request.onsuccess = () => resolve(request.result);
      });
  },

  getDocumentsByProject: async (projectId: string): Promise<DocumentVariables[]> => {
    const database = await db.open();
    return new Promise((resolve) => {
      const transaction = database.transaction(STORE_DOCUMENTS, 'readonly');
      const index = transaction.objectStore(STORE_DOCUMENTS).index('projectId');
      const request = index.getAll(projectId);
      request.onsuccess = () => resolve(request.result);
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

  // Added missing getProjectPermissions method for ProjectSharing.tsx
  getProjectPermissions: async (projectId: string): Promise<ProjectPermission[]> => {
    const database = await db.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_PERMISSIONS, 'readonly');
      const store = transaction.objectStore(STORE_PERMISSIONS);
      const index = store.index('projectId');
      const request = index.getAll(projectId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Added missing shareProject method for ProjectSharing.tsx
  shareProject: async (permission: ProjectPermission): Promise<void> => {
    const database = await db.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_PERMISSIONS, 'readwrite');
      const store = transaction.objectStore(STORE_PERMISSIONS);
      const request = store.put(permission);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  getDatabaseBackup: async (): Promise<BackupData> => {
      const database = await db.open();
      return new Promise((resolve, reject) => {
          const transaction = database.transaction([STORE_PROJECTS, STORE_DOCUMENTS, STORE_USERS, STORE_PERMISSIONS], 'readonly');
          const pReq = transaction.objectStore(STORE_PROJECTS).getAll();
          const dReq = transaction.objectStore(STORE_DOCUMENTS).getAll();
          const uReq = transaction.objectStore(STORE_USERS).getAll();
          const pmReq = transaction.objectStore(STORE_PERMISSIONS).getAll();
          transaction.oncomplete = () => {
              resolve({
                  version: 1,
                  timestamp: Date.now(),
                  users: uReq.result || [],
                  projects: pReq.result || [],
                  documents: dReq.result || [],
                  permissions: pmReq.result || []
              });
          };
      });
  },

  // Added missing restoreDatabaseBackup method for AuthScreen.tsx and AdminPanel.tsx
  restoreDatabaseBackup: async (data: BackupData): Promise<void> => {
    const database = await db.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(
        [STORE_PROJECTS, STORE_DOCUMENTS, STORE_USERS, STORE_PERMISSIONS],
        'readwrite'
      );

      const clearAndAdd = (storeName: string, items: any[]) => {
        const store = transaction.objectStore(storeName);
        store.clear();
        if (items && Array.isArray(items)) {
          items.forEach(item => store.put(item));
        }
      };

      clearAndAdd(STORE_PROJECTS, data.projects);
      clearAndAdd(STORE_DOCUMENTS, data.documents);
      clearAndAdd(STORE_USERS, data.users);
      clearAndAdd(STORE_PERMISSIONS, data.permissions);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
};
