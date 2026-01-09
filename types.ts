
export interface ContactInfo {
  name: string;
  title?: string;
  address?: string;
  email?: string;
  pec?: string;
  phone?: string;
  mobile?: string;
  vat?: string;
  professionalOrder?: string;
  registrationNumber?: string;
  cf?: string;
}

export interface Appointment {
  type: string; 
  number: string;
  date: string;
  authority?: string;
  protocolNumber?: string;
  protocolDate?: string;
  departmentManager?: string;
}

export interface SubjectProfile {
  contact: ContactInfo;
  appointment: Appointment;
  roleDescription?: string;
}

export interface DesignPhaseData {
  deliveryDate: string;
  economicFramework: string;
  approvalType: string;
  approvalNumber: string;
  approvalDate: string;
  localFolderLink?: string;
}

export interface SALData {
  id: string;
  number: string;
  date: string;
  periodFrom: string;
  periodTo: string;
  netAmount: string;
  paymentCertificateDate?: string;
  paymentCertificateAmount?: string;
  localFolderLink?: string;
  notes?: string;
}

export interface ProjectConstants {
  id: string;
  ownerId: string;
  lastModified: number;
  entity: string;
  entityProvince?: string;
  projectName: string;
  location: string;
  cup: string;
  cig?: string;
  notes?: string;
  contract: {
    repNumber: string;
    date: string;
    regNumber?: string;
    regDate?: string;
    regSeries?: string;
    totalAmount: string;
    designAmount?: string;
    executionAmount?: string;
    securityCosts: string;
    durationDays: number;
  };
  designPhases: {
    docfap: DesignPhaseData;
    dip: DesignPhaseData;
    pfte: DesignPhaseData;
    executive: DesignPhaseData;
  };
  subjects: {
    rup: SubjectProfile;
    designers: SubjectProfile[];
    csp: SubjectProfile;
    verifier: SubjectProfile;
    dl: SubjectProfile;
    dlOffice: SubjectProfile[];
    cse: SubjectProfile;
    tester: SubjectProfile;
    testerAppointment: {
        nominationType: string;
        nominationAuthority: string;
        nominationNumber: string;
        nominationDate: string;
        contractRepNumber: string;
        contractDate: string;
        protocolNumber: string;
        departmentManager: string;
    };
  };
  contractor: {
    name: string;
    address?: string;
    vat: string;
    pec: string;
    repName: string;
    repTitle?: string;
    repRole?: string;
  };
  executionPhase: {
    deliveryDate: string;
    completionDate: string;
    sals: SALData[];
    ainopReport?: string;
    ainopProtocol?: string;
    ainopDate?: string;
  };
}

export type DocumentType = 
  | 'VERBALE_COLLAUDO'
  | 'VERBALE_CONSEGNA'
  | 'SOSPENSIONE_LAVORI'
  | 'RIPRESA_LAVORI'
  | 'LET_RICHIESTA_AUT_COLLAUDO'
  | 'LET_CONVOCAZIONE_COLLAUDO'
  | 'NULLAOSTA_COLLAUDO'
  | 'REL_COLLAUDO_TECN_AMM'
  | 'REL_COLLAUDO_STATICO'
  | 'REL_COLLAUDO_FUNZ_IMP'
  | 'CERTIFICATO_ULTIMAZIONE'
  | 'REL_CONTO_FINALE'
  | 'CERTIFICATO_REGOLARE_ESECUZIONE';

export interface PhotoAttachment {
  id: string;
  url: string;
  description: string;
}

export interface DocumentVariables {
  id: string;
  projectId: string;
  type: DocumentType;
  createdAt: number;
  visitNumber: number;
  docDate?: string; 
  date: string; 
  time: string;
  attendees: string;
  attendeesList?: string[]; // IDs or names of subjects from constants
  premis: string;
  worksExecuted: string[];
  worksInProgress?: string;
  upcomingWorks?: string;
  observations: string;
  photos: PhotoAttachment[];
  convocationDetails?: string;
  convocationMethod?: string;
  convocationDate?: string;
  testerRequests?: string;
  testerInvitations?: string;
  rupConvocationDate?: string;
}

// Add missing User and related types used throughout the application
export type UserStatus = 'active' | 'pending' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  isSystemAdmin?: boolean;
  status: UserStatus;
}

export type PermissionRole = 'viewer' | 'editor' | 'admin';

export interface ProjectPermission {
  id: string;
  projectId: string;
  userEmail: string;
  role: PermissionRole;
}

export interface BackupData {
  version: number;
  timestamp: number;
  users: User[];
  projects: ProjectConstants[];
  documents: DocumentVariables[];
  permissions?: ProjectPermission[];
}
