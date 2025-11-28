
import { ProjectConstants, DocumentVariables } from './types';

const DB_NAME = 'EdilAppDB';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';
const STORE_DOCUMENTS = 'documents';

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
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  },

  // Projects
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
        const transaction = database.transaction([STORE_PROJECTS, STORE_DOCUMENTS], 'readwrite');
        const projectStore = transaction.objectStore(STORE_PROJECTS);
        const docStore = transaction.objectStore(STORE_DOCUMENTS);
        const docIndex = docStore.index('projectId');

        // Delete project
        projectStore.delete(projectId);

        // Delete associated documents
        const docRequest = docIndex.getAllKeys(projectId);
        docRequest.onsuccess = () => {
            const keys = docRequest.result;
            keys.forEach(key => docStore.delete(key));
        };

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
      
      // We do NOT store photos in IndexedDB to avoid quota limits, 
      // as requested by the user flow (files from folder).
      // We strip the photo array before saving.
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
