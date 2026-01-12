
import { ProjectConstants, DocumentVariables, SubjectProfile, DesignPhaseData, ContactInfo, DesignerProfile } from './types';

const emptyContact: ContactInfo = { name: '', title: '', address: '', zip: '', city: '', province: '', email: '', pec: '', phone: '', professionalOrder: '', registrationNumber: '' };
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
  displayOrder: 0,
  entity: 'PROVINCIA DI TARANTO', 
  entityProvince: '', 
  headerLogo: '',
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
    others: [],
    testerAppointment: { 
        nominationType: 'Determina Dirigenziale',
        nominationAuthority: '',
        nominationNumber: '',
        nominationDate: '',
        contractRepNumber: '',
        contractDate: '',
        contractProtocol: '',
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
        role: 'Legale Rappresentante',
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
    // Fixed: Removed testerVisitSummaries as it does not exist in the ProjectConstants interface
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
  time: '12:00',
  endTime: '',
  convocationMethod: 'PEC',
  convocationDate: '',
  convocationDetails: '',
  attendees: '', 
  premis: '',
  worksExecuted: [],
  worksInProgress: '', 
  upcomingWorks: '',
  worksIntroText: '',
  testerRequests: '',
  testerInvitations: '',
  commonParts: '',
  observations: '',
  photos: [],
  letterIntro: '',
  letterBodyParagraphs: [],
  letterClosing: 'Distinti saluti.',
  letterRecipients: [
      { id: 'rup', isPc: false },
      { id: 'dl', isPc: false },
      { id: 'contractor', isPc: false }
  ]
});