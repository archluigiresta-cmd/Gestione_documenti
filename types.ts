
export interface ContactInfo {
  name: string;
  title?: string;
  address?: string;
  email?: string;
  pec?: string;
  phone?: string;
  vat?: string;
  repName?: string;
  repRole?: string;
  repTitle?: string;
  professionalOrder?: string;
  registrationNumber?: string;
  role?: string;
}

export interface PhotoAttachment {
  id: string;
  url: string;
  description: string;
  file?: File;
}

// Fix: Added missing types for project management subjects and design phases.
export interface Appointment {
  type: string;
  number: string;
  date: string;
}

export interface SubjectProfile {
  contact: ContactInfo;
  appointment: Appointment;
}

export interface DesignerProfile extends SubjectProfile {
  designLevels: string[];
  roles: string[];
  isLegalEntity: boolean;
  operatingDesigners: ContactInfo[];
}

export interface DesignPhaseData {
  deliveryProtocol: string;
  deliveryDate: string;
  economicFramework: string;
  approvalType: string;
  approvalNumber: string;
  approvalDate: string;
  localFolderLink: string;
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
  localFolderLink: string;
  notes: string;
}

export interface ProjectConstants {
  id: string;
  ownerId: string;
  lastModified: number;
  displayOrder: number;
  entity: string;
  entityProvince?: string;
  headerLogo?: string;
  projectName: string;
  location: string;
  cup: string;
  cig?: string;
  generalNotes: string;
  contract: {
    repNumber: string;
    date: string;
    regPlace?: string;
    regDate?: string;
    regNumber?: string;
    regSeries?: string;
    totalAmount: string;
    securityCosts: string;
    durationDays: number;
    deadline?: string;
  };
  designPhase: {
    docfap: DesignPhaseData;
    dip: DesignPhaseData;
    pfte: DesignPhaseData;
    executive: DesignPhaseData;
  };
  subjects: {
    rup: SubjectProfile;
    dl: DesignerProfile;
    cse: DesignerProfile;
    tester: SubjectProfile;
    designers: DesignerProfile[];
    csp: DesignerProfile;
    verifier: DesignerProfile;
    dlOffice: DesignerProfile[];
    testerAppointment: {
      nominationType: string;
      nominationAuthority: string;
      nominationNumber: string;
      nominationDate: string;
      contractRepNumber: string;
      contractDate: string;
      contractProtocol: string;
      testerFee: string;
      isStatic: boolean;
      isAdmin: boolean;
      isFunctional: boolean;
    };
  };
  contractor: {
    type: string;
    mainCompany: ContactInfo;
    mandants: ContactInfo[];
    executors: ContactInfo[];
    subcontractors: ContactInfo[];
  };
  executionPhase: {
    deliveryDate: string;
    deliveryType?: string;
    suspensions: any[];
    resumptions: any[];
    sals: SALData[];
    variants: any[];
    completionDate: string;
    handoverDocs: {
      projectApprovalType: string;
      projectApprovalNumber: string;
      projectApprovalDate: string;
      ainopProtocol: string;
      ainopDate: string;
      municipalityProtocol: string;
      municipalityDate: string;
      hasWasteNotes: boolean;
      hasUpdatedPOS: boolean;
      hasUpdatedSchedule: boolean;
      hasPreliminaryNotification: boolean;
      preliminaryNotifNumber: string;
      preliminaryNotifDate: string;
      hasOtherDocs: boolean;
      otherDocsDescription: string;
    };
  };
}

export type DocumentType = 
  | 'VERBALE_COLLAUDO'
  | 'LET_CONVOCAZIONE_COLLAUDO'
  | 'NULLAOSTA_COLLAUDO'
  | 'LET_RICHIESTA_AUT_COLLAUDO'
  | 'REL_COLLAUDO_TECN_AMM'
  | 'REL_COLLAUDO_STATICO'
  | 'REL_COLLAUDO_FUNZ_IMP'
  | 'CERTIFICATO_REGOLARE_ESECUZIONE'
  | 'VERBALE_CONSEGNA'
  | 'SOSPENSIONE_LAVORI'
  | 'RIPRESA_LAVORI';

export interface DocumentVariables {
  id: string;
  projectId: string;
  type: DocumentType;
  createdAt: number;
  visitNumber: number;
  date: string;
  time: string;
  convocationMethod: string;
  convocationDate: string;
  convocationDetails: string;
  attendees: string;
  premis: string;
  worksExecuted: string[];
  worksInProgress?: string;
  upcomingWorks?: string;
  worksIntroText?: string;
  testerRequests: string;
  testerInvitations: string;
  commonParts?: string;
  observations: string;
  photos: PhotoAttachment[];
}

// Fix: Added missing types for User, Auth and Backup management.
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
  permissions: ProjectPermission[];
}
