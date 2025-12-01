import { ProjectConstants, DocumentVariables, SubjectProfile, DesignPhaseData } from './types';

const emptyContact = { name: '', title: '', email: '', pec: '', phone: '' };
const emptyAppointment = { type: 'Determina', number: '', date: '' };

const createEmptySubject = (): SubjectProfile => ({
    contact: { ...emptyContact },
    appointment: { ...emptyAppointment }
});

const createEmptyDesignPhase = (): DesignPhaseData => ({
    deliveryDate: '',
    economicFramework: '',
    approvalType: 'Delibera/Determina',
    approvalNumber: '',
    approvalDate: ''
});

export const createEmptyProject = (ownerId: string = ''): ProjectConstants => ({
  id: crypto.randomUUID(),
  ownerId: ownerId, 
  lastModified: Date.now(),
  entity: 'PROVINCIA DI TARANTO', 
  entityProvince: '', // NEW: Init province
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

  designPhase: {
      docfap: createEmptyDesignPhase(),
      dip: createEmptyDesignPhase(),
      pfte: createEmptyDesignPhase(),
      executive: createEmptyDesignPhase()
  },

  subjects: {
    rup: createEmptySubject(),
    designers: [],
    csp: createEmptySubject(),
    verifier: createEmptySubject(),
    dl: createEmptySubject(),
    dlOffice: [],
    cse: createEmptySubject(),
    tester: { 
        contact: { ...emptyContact, title: 'Arch.' },
        appointment: { ...emptyAppointment }
    },
    testerAppointment: { // Keeping for legacy/flags
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
        preliminaryNotifDate: '',
        hasOtherDocs: false,
        otherDocsDescription: ''
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