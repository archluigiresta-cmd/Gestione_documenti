

import { ProjectConstants, DocumentVariables, SubjectProfile, DesignPhaseData, ContactInfo, DesignerProfile } from './types';

const emptyContact: ContactInfo = { name: '', title: '', email: '', pec: '', phone: '', professionalOrder: '', registrationNumber: '' };
const emptyAppointment = { type: 'Determina', number: '', date: '' };

const createEmptySubject = (): SubjectProfile => ({
    contact: { ...emptyContact },
    appointment: { ...emptyAppointment }
});

const createEmptyDesignerProfile = (): DesignerProfile => ({
    ...createEmptySubject(),
    designLevels: [],
    roles: [],
    isLegalEntity: false,
    operatingDesigners: []
});

const createEmptyDesignPhase = (): DesignPhaseData => ({
    deliveryProtocol: '',
    deliveryDate: '',
    economicFramework: '',
    approvalType: 'Delibera/Determina',
    approvalNumber: '',
    approvalDate: '',
    localFolderLink: ''
});

export const createEmptyProject = (ownerId: string = ''): ProjectConstants => ({
  id: crypto.randomUUID(),
  ownerId: ownerId, 
  lastModified: Date.now(),
  displayOrder: 0, // Initial order, will be overwritten by logic
  entity: 'PROVINCIA DI TARANTO', 
  entityProvince: '', 
  headerLogo: '', // NEW
  projectName: '',
  location: '',
  cup: '',
  cig: '',
  generalNotes: '',
  
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
    csp: createEmptyDesignerProfile(),
    verifier: createEmptyDesignerProfile(),
    dl: createEmptyDesignerProfile(),
    dlOffice: [],
    cse: createEmptyDesignerProfile(),
    tester: { 
        contact: { ...emptyContact, title: 'Arch.' },
        appointment: { ...emptyAppointment }
    },
    testerAppointment: { 
        nominationType: 'Determina Dirigenziale',
        nominationAuthority: '', // NEW
        nominationNumber: '',
        nominationDate: '',
        contractRepNumber: '', // NEW: Rep. Convenzione
        contractDate: '', // NEW
        contractProtocol: '', // NEW: Prot. n.
        // Fix: Added missing required property testerFee
        testerFee: '',
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
    type: 'single',
    mainCompany: { 
        ...emptyContact, 
        role: 'Legale Rappresentante', // Default role for rep
        repTitle: 'Sig.'
    },
    mandants: [],
    executors: [],
    subcontractors: []
  },

  executionPhase: {
    deliveryDate: '',
    deliveryType: 'ordinary',
    suspensions: [],
    resumptions: [],
    sals: [],
    variants: [],
    testerVisitSummaries: [], // NEW
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
  convocationMethod: 'PEC',
  convocationDate: '',
  convocationDetails: '',
  attendees: '', 
  premis: '',
  worksExecuted: [],
  worksInProgress: '', 
  upcomingWorks: '', // NEW
  
  worksIntroText: '', // NEW
  testerRequests: '', // NEW
  testerInvitations: '', // NEW
  commonParts: '', // NEW

  observations: '',
  photos: []
});