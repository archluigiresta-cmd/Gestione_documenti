
import { ProjectConstants, DocumentVariables, User, ProjectPermission, PermissionRole, UserStatus, BackupData } from './types';

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
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  },

  // --- ADMIN SEEDING & AUTH ---

  ensureAdminExists: async (): Promise<void> => {
      const database = await db.open();
      return new Promise((resolve, reject) => {
          const transaction = database.transaction(STORE_USERS, 'readwrite');
          const store = transaction.objectStore(STORE_USERS);
          const emailIndex = store.index('email');
          const req = emailIndex.get('arch.luigiresta@gmail.com');

          req.onsuccess = () => {
              if (!req.result) {
                  // Admin does not exist, create it
                  const adminUser: User = {
                      id: crypto.randomUUID(),
                      name: 'Luigi Resta (Admin)',
                      email: 'arch.luigiresta@gmail.com',
                      password: 'admin123',
                      isSystemAdmin: true,
                      status: 'active'
                  };
                  store.add(adminUser);
                  console.log("System Admin seeded.");
              }
          };
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => resolve(); // Don't block app if this fails
      });
  },

  registerUser: async (user: User): Promise<void> => {
    const database = await db.open();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_USERS, 'readwrite');
        const store = transaction.objectStore(STORE_USERS);
        
        const emailIndex = store.index('email');
        const checkRequest = emailIndex.get(user.email);
        
        checkRequest.onsuccess = () => {
            if (checkRequest.result) {
                reject(new Error("Email già registrata."));
            } else {
                // Default status is pending, unless specifically the admin email (redundant safety)
                user.status = user.email === 'arch.luigiresta@gmail.com' ? 'active' : 'pending';
                store.add(user);
                transaction.oncomplete = () => resolve();
            }
        };
        checkRequest.onerror = () => reject(checkRequest.error);
    });
  },

  loginUser: async (email: string, password: string): Promise<User> => {
    // Ensure admin seed runs before login attempt
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
                    reject(new Error("Account in attesa di approvazione dall'amministratore."));
                } else if (user.status === 'suspended') {
                    reject(new Error("Account sospeso. Contatta l'amministratore."));
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

  // --- SYSTEM ADMIN FUNCTIONS ---

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

  getDatabaseBackup: async (): Promise<BackupData> => {
      const database = await db.open();
      return new Promise(async (resolve, reject) => {
          try {
              const transaction = database.transaction([STORE_PROJECTS, STORE_DOCUMENTS, STORE_USERS, STORE_PERMISSIONS], 'readonly');
              
              const pReq = transaction.objectStore(STORE_PROJECTS).getAll();
              const dReq = transaction.objectStore(STORE_DOCUMENTS).getAll();
              const uReq = transaction.objectStore(STORE_USERS).getAll();
              const pmReq = transaction.objectStore(STORE_PERMISSIONS).getAll();

              let projects, documents, users, permissions;

              // Helper for promisifying requests
              const getReq = (req: IDBRequest) => new Promise(res => { req.onsuccess = () => res(req.result); });

              // Parallel execution not easy with single transaction in older browsers, but sequential is safe
              pReq.onsuccess = () => { projects = pReq.result; };
              dReq.onsuccess = () => { documents = dReq.result; };
              uReq.onsuccess = () => { users = uReq.result; };
              pmReq.onsuccess = () => { permissions = pmReq.result; };

              transaction.oncomplete = () => {
                  resolve({
                      version: 1,
                      timestamp: Date.now(),
                      users: users || [],
                      projects: projects || [],
                      documents: documents || [],
                      permissions: permissions || []
                  });
              };
              transaction.onerror = () => reject(transaction.error);

          } catch (e) { reject(e); }
      });
  },

  restoreDatabaseBackup: async (data: BackupData): Promise<void> => {
      const database = await db.open();
      return new Promise((resolve, reject) => {
          const transaction = database.transaction([STORE_PROJECTS, STORE_DOCUMENTS, STORE_USERS, STORE_PERMISSIONS], 'readwrite');
          
          const pStore = transaction.objectStore(STORE_PROJECTS);
          const dStore = transaction.objectStore(STORE_DOCUMENTS);
          const uStore = transaction.objectStore(STORE_USERS);
          const pmStore = transaction.objectStore(STORE_PERMISSIONS);

          // Clear all existing data
          pStore.clear();
          dStore.clear();
          uStore.clear();
          pmStore.clear();

          // Restore
          data.projects.forEach(p => pStore.add(p));
          data.documents.forEach(d => dStore.add(d));
          data.users.forEach(u => uStore.add(u));
          data.permissions.forEach(p => pmStore.add(p));

          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
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

  // --- PROJECTS ---

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

        projectStore.delete(projectId);

        const docRequest = docIndex.getAllKeys(projectId);
        docRequest.onsuccess = () => {
            const keys = docRequest.result;
            keys.forEach(key => docStore.delete(key));
        };

        const permRequest = permIndex.getAllKeys(projectId);
        permRequest.onsuccess = () => {
             const keys = permRequest.result;
             keys.forEach(key => permStore.delete(key));
        }

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
  },

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
      const docToSave = { ...doc, photos: [] }; // Don't save photos in IndexedDB to avoid quota issues
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
