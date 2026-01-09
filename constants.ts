
import { ProjectConstants, DocumentVariables, SubjectProfile, DesignPhaseData } from './types';

export const generateSafeId = () => crypto.randomUUID();

const createEmptyContact = () => ({ name: '', title: '', address: '', email: '', pec: '', phone: '', vat: '', professionalOrder: '', registrationNumber: '' });
const createEmptyAppointment = () => ({ type: 'Determina', number: '', date: '' });
const createEmptySubject = (roleDesc: string = ''): SubjectProfile => ({
  contact: createEmptyContact(),
  appointment: createEmptyAppointment(),
  roleDescription: roleDesc
});

const createEmptyDesignPhase = (): DesignPhaseData => ({
  deliveryDate: '',
  economicFramework: '',
  approvalType: 'Determina Dirigenziale',
  approvalNumber: '',
  approvalDate: ''
});

export const createEmptyProject = (ownerId: string = ''): ProjectConstants => ({
  id: generateSafeId(),
  ownerId,
  lastModified: Date.now(),
  entity: 'PROVINCIA DI TARANTO',
  projectName: '',
  location: '',
  cup: '',
  cig: '',
  contract: {
    repNumber: '',
    date: '',
    totalAmount: '',
    securityCosts: '',
    durationDays: 0
  },
  designPhases: {
    docfap: createEmptyDesignPhase(),
    dip: createEmptyDesignPhase(),
    pfte: createEmptyDesignPhase(),
    executive: createEmptyDesignPhase()
  },
  subjects: {
    rup: createEmptySubject('RUP'),
    designers: [],
    csp: createEmptySubject('CSP'),
    verifier: createEmptySubject('Verificatore'),
    dl: createEmptySubject('Direttore dei Lavori'),
    dlOffice: [],
    cse: createEmptySubject('CSE'),
    tester: createEmptySubject('Collaudatore')
  },
  contractor: {
    name: '',
    vat: '',
    pec: '',
    repName: ''
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
  time: '09:00',
  attendees: '',
  premis: '',
  worksExecuted: [],
  worksInProgress: '',
  observations: '',
  photos: []
});
