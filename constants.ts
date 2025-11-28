
import { ProjectConstants, DocumentVariables } from './types';

// Helper to create empty state with fresh IDs
export const createEmptyProject = (): ProjectConstants => ({
  id: crypto.randomUUID(),
  lastModified: Date.now(),
  entity: 'PROVINCIA DI TARANTO', // Default value
  projectName: '',
  location: '',
  cup: '',
  contractor: {
    name: '',
    address: '',
    vat: '',
    repName: ''
  },
  contract: {
    repNumber: '',
    date: '',
    registeredAt: '',
    totalAmount: '',
    netAmount: '',
    securityCosts: '',
    deadline: ''
  },
  staff: {
    rup: '',
    direttoreLavori: '',
    collaudatore: '',
    ispettoreCantiere: '',
    cse: ''
  }
});

export const createInitialDocument = (projectId: string): DocumentVariables => ({
  id: crypto.randomUUID(),
  projectId,
  createdAt: Date.now(),
  type: 'VERBALE_COLLAUDO',
  visitNumber: 1,
  date: new Date().toISOString().split('T')[0],
  time: '09:00',
  attendees: ['Collaudatore', 'Direttore dei Lavori', 'Ispettore di Cantiere', 'Impresa'],
  premis: '',
  worksExecuted: [],
  observations: '',
  photos: []
});
