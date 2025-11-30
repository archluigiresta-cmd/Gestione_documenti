
import { ProjectConstants, DocumentVariables } from './types';

const emptyContact = { name: '', title: '', email: '', pec: '', phone: '' };

export const createEmptyProject = (): ProjectConstants => ({
  id: crypto.randomUUID(),
  lastModified: Date.now(),
  entity: 'PROVINCIA DI TARANTO', 
  projectName: '',
  location: '',
  cup: '',
  
  contract: {
    repNumber: '',
    date: '',
    regPlace: '',
    regDate: '',
    regNumber: '',
    regSeries: '',
    totalAmount: '',
    securityCosts: '',
    durationDays: 0,
    deadline: ''
  },

  subjects: {
    rup: { ...emptyContact },
    designers: [],
    csp: { ...emptyContact },
    verifier: { ...emptyContact },
    dl: { ...emptyContact },
    dlOffice: [],
    cse: { ...emptyContact },
    tester: { ...emptyContact, title: 'Arch.' },
    testerAppointment: {
        nominationType: 'Determina Dirigenziale',
        nominationNumber: '',
        nominationDate: '',
        isStatic: true,
        isAdmin: true,
        isFunctional: false
    }
  },

  tenderPhase: {
    verificationMinutesDate: '',
    validationMinutesDate: ''
  },

  contractor: {
    name: '',
    address: '',
    vat: '',
    repName: '',
    role: 'Legale Rappresentante',
    email: '',
    pec: '',
    phone: '',
    isATI: false,
    mandants: [],
    subcontractors: []
  },

  executionPhase: {
    deliveryDate: '',
    deliveryType: 'ordinary',
    suspensions: [],
    resumptions: [],
    sals: [],
    variants: [],
    completionDate: '',
    
    handoverDocs: {
        projectApprovalType: 'Determina',
        projectApprovalNumber: '',
        projectApprovalDate: '',
        ainopProtocol: '',
        ainopDate: '',
        municipalityProtocol: '',
        municipalityDate: '',
        hasWasteNotes: false,
        hasUpdatedPOS: false,
        hasUpdatedSchedule: false,
        hasPreliminaryNotification: false,
        preliminaryNotifNumber: '',
        preliminaryNotifDate: ''
    }
  }
});

export const createInitialDocument = (projectId: string): DocumentVariables => ({
  id: crypto.randomUUID(),
  projectId,
  createdAt: Date.now(),
  visitNumber: 1,
  date: new Date().toISOString().split('T')[0],
  time: '09:00',
  convocationDetails: '',
  attendees: '', 
  premis: '',
  worksExecuted: [],
  observations: '',
  photos: []
});
