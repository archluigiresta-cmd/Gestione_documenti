
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
    repName: '',
    repRole: ''
  },
  contract: {
    repNumber: '',
    date: '',
    
    regPlace: '',
    regDate: '',
    regNumber: '',
    regSeries: '',

    totalAmount: '',
    securityCosts: '',
    
    handoverDate: '',
    durationDays: 0,
    deadline: ''
  },
  staff: {
    rup: '',
    direttoreLavori: '',
    ispettoreCantiere: '',
    cse: ''
  },
  testerAppointment: {
    name: '',
    qualification: 'Arch.',
    nominationType: 'Determina Dirigenziale',
    nominationNumber: '',
    nominationDate: '',
    contractRep: '',
    contractDate: '',
    isStatic: true,
    isAdmin: true,
    isFunctional: false
  },
  handoverDocs: {
    projectApprovalType: 'Determina',
    projectApprovalNumber: '',
    projectApprovalDate: '',
    deliveryDate: '',
    deliveryType: 'ordinary',
    ainopProtocol: '',
    ainopDate: '',
    municipalityProtocol: '',
    municipalityDate: '',
    
    // New fields
    hasWasteNotes: false,
    hasUpdatedPOS: false,
    hasUpdatedSchedule: false,
    preliminaryNotifNumber: '',
    preliminaryNotifDate: '',
    hasOtherDocs: false,
    otherDocsDescription: ''
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
  convocationDetails: '',
  attendees: '', // Starts empty, populated dynamically in App logic
  premis: '',
  worksExecuted: [],
  observations: '',
  photos: []
});
