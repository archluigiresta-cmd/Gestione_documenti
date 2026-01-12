
export interface ContactInfo {
  name: string;
  title?: string;
  role?: string;
  address?: string;
  zip?: string;      
  city?: string;     
  province?: string; 
  email?: string;
  pec?: string;
  phone?: string;
  vat?: string;
  repName?: string;
  repRole?: string;
  repTitle?: string;
  professionalOrder?: string;
  registrationNumber?: string;
}

export interface AppointmentData {
  type: string;
  number: string;
  date: string;
}

export interface SubjectProfile {
  contact: ContactInfo;
  appointment: AppointmentData;
}

export interface DesignerProfile extends SubjectProfile {
  designLevels: string[];
  roles: string[];
  isLegalEntity: boolean;
  operatingDesigners: ContactInfo[];
}

export type CompanyType = 'single' | 'ati' | 'consortium';

export interface ContractorStructure {
  type: CompanyType;
  mainCompany: ContactInfo; 
  mandants: ContactInfo[]; 
  executors: ContactInfo[]; 
  subcontractors: ContactInfo[]; 
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

export type PermissionRole = 'viewer' | 'editor' | 'admin';
export type UserStatus = 'active' | 'pending' | 'suspended';

export interface User {
  id: string;
  email: string;
  password: string; 
  name: string;
  isSystemAdmin?: boolean; 
  status: UserStatus; 
}

export interface ProjectPermission {
  id: string; 
  projectId: string;
  userEmail: string; 
  role: PermissionRole;
}

/**
 * Interface for events recorded outside of a specific project structure
 */
export interface ExternalEvent {
    id: string;
    projectName: string;
    visitNumber: number;
    date: string;
    time: string;
    type: string;
}

export interface BackupData {
  version: number;
  timestamp: number;
  users: User[];
  projects: ProjectConstants[];
  documents: DocumentVariables[];
  permissions: ProjectPermission[];
  externalEvents?: ExternalEvent[];
}

export interface SALData {
    id: string;
    number: string;
    date: string;
    periodFrom: string;
    periodTo: string;
    netAmount: string; 
    paymentCertificateDate: string;
    paymentCertificateAmount: string; 
    localFolderLink: string; 
    notes: string;
}

export interface LetterRecipientConfig {
  id: string;
  isPc: boolean;
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
    regPlace: string;
    regDate: string;
    regNumber: string;
    regSeries: string;
    totalAmount: string;
    securityCosts: string;
    durationDays: number;
    deadline: string; 
  };

  designPhase: {
    docfap: DesignPhaseData; 
    dip: DesignPhaseData;    
    pfte: DesignPhaseData;   
    executive: DesignPhaseData; 
  };

  subjects: {
    rup: SubjectProfile; 
    designers: DesignerProfile[]; 
    csp: DesignerProfile; 
    verifier: DesignerProfile; 
    dl: DesignerProfile; 
    dlOffice: SubjectProfile[]; 
    cse: DesignerProfile; 
    tester: SubjectProfile; 
    others: SubjectProfile[];
    testerAppointment: { 
        nominationType: string;
        nominationAuthority: string; 
        nominationNumber: string;
        nominationDate: string;
        contractRepNumber: string; 
        contractDate: string; 
        contractProtocol: string; 
        isStatic: boolean;
        isAdmin: boolean;
        isFunctional: boolean;
    }
  };

  tenderPhase: {
    verificationMinutesDate: string; 
    validationMinutesDate: string; 
  };

  contractor: ContractorStructure;

  executionPhase: {
    deliveryDate: string; 
    deliveryType: 'ordinary' | 'anticipated';
    suspensions: { id: string; date: string; reason: string; minutesNumber?: string }[];
    resumptions: { id: string; date: string; minutesNumber?: string }[];
    sals: SALData[]; 
    variants: { id: string; date: string; approvalAct: string }[]; 
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

export interface PhotoAttachment {
  id: string;
  url: string;
  file?: File;
  description: string;
}

export type DocumentType = 
  | 'LETTERA_CONVOCAZIONE' 
  | 'VERBALE_COLLAUDO' 
  | 'VERBALE_CONSEGNA' 
  | 'SOSPENSIONE_LAVORI' 
  | 'RIPRESA_LAVORI' 
  | 'SAL' 
  | 'RELAZIONE_COLLAUDO' 
  | 'CERTIFICATO_ULTIMAZIONE';

export interface DocumentVariables {
  id: string;
  projectId: string; 
  createdAt: number; 
  visitNumber: number; 
  date: string;
  time: string; 
  endTime: string; 
  convocationMethod: string; 
  convocationDate: string;   
  convocationDetails: string; 
  attendees: string; 
  premis: string; 
  worksExecuted: string[]; 
  worksInProgress: string; 
  upcomingWorks: string; 
  worksIntroText: string; 
  testerRequests: string; 
  testerInvitations: string; 
  commonParts: string; 
  observations: string; 
  photos: PhotoAttachment[];
  
  letterIntro: string;
  letterBodyParagraphs: string[];
  letterClosing: string;
  letterRecipients?: LetterRecipientConfig[];
}
