
export interface ContactInfo {
  name: string;
  title?: string;
  address?: string;
  email?: string;
  pec?: string;
  phone?: string;
  vat?: string;
  professionalOrder?: string;
  registrationNumber?: string;
}

export interface Appointment {
  type: string; // Es: Determina, Delibera, Incarico
  number: string;
  date: string;
}

export interface SubjectProfile {
  contact: ContactInfo;
  appointment: Appointment;
  roleDescription?: string; // Per i progettisti: "Architettonico", "Strutturale", ecc.
}

export interface DesignPhaseData {
  deliveryDate: string;
  economicFramework: string;
  approvalType: string;
  approvalNumber: string;
  approvalDate: string;
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
  // Fix: Added missing properties used in ExecutionManager component
  localFolderLink?: string;
  notes?: string;
}

export interface ProjectConstants {
  id: string;
  ownerId: string;
  lastModified: number;
  entity: string;
  projectName: string;
  location: string;
  cup: string;
  cig?: string;
  contract: {
    repNumber: string;
    date: string;
    totalAmount: string;
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
  };
  contractor: {
    name: string;
    vat: string;
    pec: string;
    repName: string;
  };
  executionPhase: {
    deliveryDate: string;
    completionDate: string;
    sals: SALData[];
  };
}

// Fix: Expanded DocumentType with missing values used in ExportManager filters
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
  date: string;
  time: string;
  attendees: string;
  premis: string;
  worksExecuted: string[];
  worksInProgress?: string;
  observations: string;
  photos: PhotoAttachment[];
  // Fix: Added missing properties used in DocumentEditor, TestingManager, and DocumentPreview
  convocationDetails?: string;
  convocationMethod?: string;
  convocationDate?: string;
  worksIntroText?: string;
  upcomingWorks?: string;
  testerRequests?: string;
  testerInvitations?: string;
  commonParts?: string;
}

export type UserStatus = 'active' | 'pending' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  isSystemAdmin?: boolean;
  status: UserStatus;
}

// Fix: Exported PermissionRole for use in ProjectSharing component
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
  permissions: ProjectPermission[];
}
