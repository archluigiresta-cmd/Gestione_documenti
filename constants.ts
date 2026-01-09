
import { ProjectConstants, DocumentVariables, SubjectProfile, DesignPhaseData } from './types';

export const generateSafeId = () => crypto.randomUUID();

const createEmptyContact = (name = '') => ({ 
  name, title: '', address: '', email: '', pec: '', phone: '', mobile: '', 
  vat: '', professionalOrder: '', registrationNumber: '', cf: '' 
});

const createEmptyAppointment = () => ({ 
  type: 'Determina Dirigenziale', number: '', date: '', authority: '', 
  protocolNumber: '', protocolDate: '', departmentManager: '' 
});

const createEmptySubject = (name = '', roleDesc: string = ''): SubjectProfile => ({
  contact: createEmptyContact(name),
  appointment: createEmptyAppointment(),
  roleDescription: roleDesc
});

const createEmptyDesignPhase = (): DesignPhaseData => ({
  deliveryDate: '',
  economicFramework: '',
  approvalType: 'Determinazione Dirigenziale',
  approvalNumber: '',
  approvalDate: '',
  localFolderLink: ''
});

export const createEmptyProject = (ownerId: string = ''): ProjectConstants => ({
  id: generateSafeId(),
  ownerId,
  lastModified: Date.now(),
  entity: '',
  entityProvince: '',
  projectName: '',
  location: '',
  cup: '',
  cig: '',
  notes: '',
  contract: {
    repNumber: '',
    date: '',
    regNumber: '',
    regDate: '',
    regSeries: '',
    totalAmount: '0,00',
    designAmount: '0,00',
    executionAmount: '0,00',
    securityCosts: '0,00',
    durationDays: 0
  },
  designPhases: {
    docfap: createEmptyDesignPhase(),
    dip: createEmptyDesignPhase(),
    pfte: createEmptyDesignPhase(),
    executive: createEmptyDesignPhase()
  },
  subjects: {
    rup: createEmptySubject('', 'R.U.P.'),
    designers: [],
    csp: createEmptySubject('', 'C.S.P.'),
    verifier: createEmptySubject('', 'Verificatore'),
    dl: createEmptySubject('', 'Direttore dei Lavori'),
    dlOffice: [],
    cse: createEmptySubject('', 'C.S.E.'),
    tester: createEmptySubject('', 'Collaudatore'),
    testerAppointment: {
        nominationType: 'Determina Dirigenziale',
        nominationAuthority: '',
        nominationNumber: '',
        nominationDate: '',
        contractRepNumber: '',
        contractDate: '',
        protocolNumber: '',
        departmentManager: ''
    }
  },
  contractor: {
    name: '',
    address: '',
    vat: '',
    pec: '',
    repName: '',
    repTitle: 'Sig.',
    repRole: 'Legale Rappresentante'
  },
  executionPhase: {
    deliveryDate: '',
    completionDate: '',
    sals: []
  }
});

export const createInitialDocument = (projectId: string): DocumentVariables => ({
  id: generateSafeId(),
  projectId,
  type: 'VERBALE_COLLAUDO',
  createdAt: Date.now(),
  visitNumber: 1,
  date: new Date().toISOString().split('T')[0],
  time: '10:00',
  attendees: '',
  attendeesList: [],
  premis: '',
  worksExecuted: [],
  worksInProgress: '',
  observations: '',
  photos: [],
  convocationMethod: 'PEC',
  convocationDate: new Date().toISOString().split('T')[0],
  testerRequests: '',
  testerInvitations: ''
});
