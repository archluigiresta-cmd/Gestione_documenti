
import { ProjectConstants, DocumentVariables, User, ProjectPermission, PermissionRole } from './types';

const DB_NAME = 'EdilAppDB';
const DB_VERSION = 2; // Bumped version for new stores
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
        
        if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
          db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains(STORE_DOCUMENTS)) {
          const docStore = db.createObjectStore(STORE_DOCUMENTS, { keyPath: 'id' });
          docStore.createIndex('projectId', 'projectId', { unique: false });
        }

        // NEW STORES
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

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  },

  // --- USER AUTHENTICATION ---

  registerUser: async (user: User): Promise<void> => {
    const database = await db.open();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_USERS, 'readwrite');
        const store = transaction.objectStore(STORE_USERS);
        
        // Check if email exists
        const emailIndex = store.index('email');
        const checkRequest = emailIndex.get(user.email);
        
        checkRequest.onsuccess = () => {
            if (checkRequest.result) {
                reject(new Error("Email già registrata."));
            } else {
                store.add(user);
                transaction.oncomplete = () => resolve();
            }
        };
        checkRequest.onerror = () => reject(checkRequest.error);
    });
  },

  loginUser: async (email: string, password: string): Promise<User> => {
    const database = await db.open();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_USERS, 'readonly');
        const store = transaction.objectStore(STORE_USERS);
        const index = store.index('email');
        const request = index.get(email);

        request.onsuccess = () => {
            const user = request.result as User;
            if (user && user.password === password) {
                resolve(user);
            } else {
                reject(new Error("Credenziali non valide."));
            }
        };
        request.onerror = () => reject(request.error);
    });
  },

  // --- PERMISSIONS ---

  shareProject: async (permission: ProjectPermission): Promise<void> => {
      const database = await db.open();
      return new Promise((resolve, reject) => {
          const transaction = database.transaction(STORE_PERMISSIONS, 'readwrite');
          const store = transaction.objectStore(STORE_PERMISSIONS);
          store.put(permission);
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
      });
  },

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

  getUserPermissions: async (email: string): Promise<ProjectPermission[]> => {
    const database = await db.open();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_PERMISSIONS, 'readonly');
        const store = transaction.objectStore(STORE_PERMISSIONS);
        const index = store.index('userEmail');
        const request = index.getAll(email);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
  },

  // --- PROJECTS (UPDATED) ---

  // Gets projects owned by user OR shared with user
  getProjectsForUser: async (userId: string, userEmail: string): Promise<ProjectConstants[]> => {
    const database = await db.open();
    return new Promise(async (resolve, reject) => {
      try {
        const transaction = database.transaction([STORE_PROJECTS, STORE_PERMISSIONS], 'readonly');
        const projectStore = transaction.objectStore(STORE_PROJECTS);
        const permStore = transaction.objectStore(STORE_PERMISSIONS);
        const permIndex = permStore.index('userEmail');

        const allProjectsRequest = projectStore.getAll();
        const sharedPermsRequest = permIndex.getAll(userEmail);

        allProjectsRequest.onsuccess = () => {
             sharedPermsRequest.onsuccess = () => {
                 const allProjects = allProjectsRequest.result as ProjectConstants[];
                 const sharedPerms = sharedPermsRequest.result as ProjectPermission[];
                 
                 const ownedProjects = allProjects.filter(p => p.ownerId === userId);
                 
                 const sharedProjectIds = new Set(sharedPerms.map(p => p.projectId));
                 const sharedProjects = allProjects.filter(p => sharedProjectIds.has(p.id));

                 // Merge unique
                 const combined = [...ownedProjects];
                 sharedProjects.forEach(p => {
                     if(!combined.find(c => c.id === p.id)) combined.push(p);
                 });

                 resolve(combined);
             }
        };
      } catch (e) {
          reject(e);
      }
    });
  },

  // Legacy fallback (get all)
  getProjects: async (): Promise<ProjectConstants[]> => {
    const database = await db.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_PROJECTS, 'readonly');
      const store = transaction.objectStore(STORE_PROJECTS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  saveProject: async (project: ProjectConstants): Promise<void> => {
    const database = await db.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_PROJECTS, 'readwrite');
      const store = transaction.objectStore(STORE_PROJECTS);
      const request = store.put(project);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  deleteProject: async (projectId: string): Promise<void> => {
    const database = await db.open();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_PROJECTS, STORE_DOCUMENTS, STORE_PERMISSIONS], 'readwrite');
        const projectStore = transaction.objectStore(STORE_PROJECTS);
        const docStore = transaction.objectStore(STORE_DOCUMENTS);
        const docIndex = docStore.index('projectId');
        const permStore = transaction.objectStore(STORE_PERMISSIONS);
        const permIndex = permStore.index('projectId');

        // Delete project
        projectStore.delete(projectId);

        // Delete associated documents
        const docRequest = docIndex.getAllKeys(projectId);
        docRequest.onsuccess = () => {
            const keys = docRequest.result;
            keys.forEach(key => docStore.delete(key));
        };

        // Delete associated permissions
        const permRequest = permIndex.getAllKeys(projectId);
        permRequest.onsuccess = () => {
             const keys = permRequest.result;
             keys.forEach(key => permStore.delete(key));
        }

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
  },

  // Documents
  getDocumentsByProject: async (projectId: string): Promise<DocumentVariables[]> => {
    const database = await db.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_DOCUMENTS, 'readonly');
      const store = transaction.objectStore(STORE_DOCUMENTS);
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  saveDocument: async (doc: DocumentVariables): Promise<void> => {
    const database = await db.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_DOCUMENTS, 'readwrite');
      const store = transaction.objectStore(STORE_DOCUMENTS);
      const docToSave = { ...doc, photos: [] }; 
      const request = store.put(docToSave);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
  
  deleteDocument: async (docId: string): Promise<void> => {
      const database = await db.open();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_DOCUMENTS, 'readwrite');
        const store = transaction.objectStore(STORE_DOCUMENTS);
        const request = store.delete(docId);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
  }
};
