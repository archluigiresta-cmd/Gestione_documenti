
import { ProjectConstants, DocumentVariables, User, ProjectPermission, PermissionRole, UserStatus, BackupData } from './types';

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
    visitDates: string[]; // Supporto per multiple date come da tabella
    visitNumber?: number; // Per compatibilità col vecchio sistema
    date?: string; // Per compatibilità
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

  seedExternalData: async (): Promise<void> => {
      const current = await db.getExternalEvents();
      if (current.length > 0) return; // Non sovrascrivere se ci sono già dati

      const initialData: Partial<ExternalEvent>[] = [
          { entity: 'Provincia di Taranto', city: 'Castellaneta', assignment: 'Collaudo Statico e Tecnico Amministrativo', projectName: 'Lavori Mauro Perrone', visitDates: ['2024-11-13', '2025-01-31', '2025-02-19', '2025-03-13', '2025-04-07', '2025-04-23', '2025-06-05', '2025-07-02', '2025-09-02'] },
          { entity: 'Comune di Torre S. Susanna', city: 'Torre S. Susanna', assignment: 'Collaudo Tecnico Amministrativo', projectName: 'Interventi Rischio Idrogeologico', visitDates: ['2025-07-31', '2025-11-20'] },
          { entity: 'Comune di Ceglie Messapica', city: 'Ceglie Messapica', assignment: 'Collaudo Statico', projectName: 'Castello Ducale', visitDates: ['2025-05-09', '2025-10-10'] },
          { entity: 'Comune di Ceglie Messapica', city: 'Ceglie Messapica', assignment: 'Collaudo Tecnico Amministrativo', projectName: 'Castello Ducale', visitDates: [] },
          { entity: 'Comune di Latiano', city: 'Latiano', assignment: 'Collaudo Statico e Tecnico Amministrativo', projectName: 'Scuola F. Errico', visitDates: ['2024-10-10', '2024-02-20', '2024-05-08', '2025-10-09'] },
          { entity: 'Comune di Pulsano', city: 'Pulsano', assignment: 'Collaudo Statico e Tecnico Amministrativo', projectName: 'Scuola Infanzia Rodari', visitDates: ['2025-09-23', '2025-11-21'] },
          { entity: 'Comune di Montemesola', city: 'Montemesola', assignment: 'Collaudo Statico e Tecnico Amministrativo', projectName: 'Parcheggio Palazzetto Sport', visitDates: ['2025-07-04', '2025-08-28', '2025-09-23', '2025-11-21'] },
          { entity: 'Comune di Statte', city: 'Statte', assignment: 'Collaudo Statico e Tecnico Amministrativo', projectName: 'Pista Atletica Stadio', visitDates: ['2025-08-28', '2025-11-20'] },
          { entity: 'Presidenza Consiglio Ministri', city: 'Taranto', assignment: 'Collaudo Statico, Tecnico-Amm. e Funzionale', projectName: 'Centro Nautico Taranto', visitDates: [] },
          { entity: 'Comune di Palagiano', city: 'Palagiano', assignment: 'Collaudo Statico e Tecnico Amministrativo', projectName: 'Riutilizzo Acque Reflue', visitDates: [] }
      ];

      for (const item of initialData) {
          await db.saveExternalEvent({
              id: crypto.randomUUID(),
              projectName: item.projectName || '',
              entity: item.entity || '',
              city: item.city || '',
              assignment: item.assignment || '',
              visitDates: item.visitDates || [],
              type: 'visita'
          });
      }
  },

  registerUser: async (user: User): Promise<void> => {
    const database = await db.open();
    return new Promise((resolve, reject) => {
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

  getProjectPermissions: async (projectId: string): Promise<ProjectPermission[]> => {
    const database = await db.open();
    return new Promise((resolve) => {
      database.transaction(STORE_PERMISSIONS, 'readonly').objectStore(STORE_PERMISSIONS).index('projectId').getAll(projectId).onsuccess = (e) => resolve((e.target as any).result);
    });
  },

  shareProject: async (permission: ProjectPermission): Promise<void> => {
    const database = await db.open();
    return new Promise((resolve) => {
      // Corrected: set oncomplete on the transaction object instead of the request object returned by put()
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
