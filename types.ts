
export interface ContactInfo {
  name: string; // Nome e Cognome o Ragione Sociale
  title?: string; // Arch., Ing., Geom.
  role?: string; // Ruolo specifico (es. Direttore Tecnico)
  address?: string;
  email?: string;
  pec?: string;
  phone?: string;
  vat?: string; // P.IVA / C.F.
  repName?: string; // Rappresentante Legale Name
  repRole?: string; // Rappresentante Legale Role
}

export interface AppointmentData {
  type: string; // Es. Determina, Delibera, Lettera incarico
  number: string;
  date: string;
}

export interface SubjectProfile {
  contact: ContactInfo;
  appointment: AppointmentData;
}

export interface DesignerProfile extends SubjectProfile {
  specificRole: string; // Es. Strutturale, Architettonico
}

// Struttura per ATI / Imprese
export interface ContractorStructure extends ContactInfo {
  isATI: boolean;
  mandants: ContactInfo[]; // Imprese mandanti in caso di ATI
  subcontractors: { name: string; activity: string }[];
}

export interface DesignPhaseData {
  deliveryDate: string;
  economicFramework: string; // Quadro Economico
  approvalType: string; // Tipo atto approvazione
  approvalNumber: string;
  approvalDate: string;
  localFolderLink: string; // Path cartella locale (NEW)
}

// --- AUTH & PERMISSIONS ---
export type PermissionRole = 'viewer' | 'editor' | 'admin';
export type UserStatus = 'active' | 'pending' | 'suspended';

export interface User {
  id: string;
  email: string;
  password: string; 
  name: string;
  isSystemAdmin?: boolean; // Super Admin flag
  status: UserStatus; // Approval status
}

export interface ProjectPermission {
  id: string; // unique key
  projectId: string;
  userEmail: string; // using email to link even if user doesn't exist yet
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

export interface SALData {
    id: string;
    number: string;
    date: string;
    periodFrom: string;
    periodTo: string;
    netAmount: string; // Importo Lavori
    paymentCertificateDate: string;
    paymentCertificateAmount: string; // Importo Certificato Pagamento
    localFolderLink: string; // Path cartella locale
    notes: string;
}

// --------------------------

export interface ProjectConstants {
  id: string; 
  ownerId: string; // ID dell'utente proprietario
  lastModified: number; 
  entity: string; // Ente Appaltante
  entityProvince?: string; // Provincia dell'Ente
  projectName: string;
  location: string;
  cup: string; 
  cig?: string; 
  generalNotes: string; // Note generali progetto (NEW)
  
  // 1. Dati Generali (Contratto)
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
    deadline: string; // Scadenza calcolata
  };

  // 1-BIS. Progettazione (Ex Fase Progettuale)
  designPhase: {
    docfap: DesignPhaseData; // Documento fattibilità alternative
    dip: DesignPhaseData;    // Documento indirizzo progettazione
    pfte: DesignPhaseData;   // Progetto fattibilità tecnico economica
    executive: DesignPhaseData; // Progetto Esecutivo
  };

  // 2. Soggetti Responsabili
  subjects: {
    rup: SubjectProfile; // Resp. Unico Progetto
    designers: DesignerProfile[]; // Progettisti multipli
    csp: SubjectProfile; // Coord. Sicurezza Progettazione
    verifier: SubjectProfile; // Verificatore
    dl: SubjectProfile; // Direttore Lavori
    dlOffice: SubjectProfile[]; // Ufficio Direzione Lavori
    cse: SubjectProfile; // Coord. Sicurezza Esecuzione
    tester: SubjectProfile; // Collaudatore
    testerAppointment: { // Mantieni per compatibilità o integrare sopra
        nominationType: string;
        nominationNumber: string;
        nominationDate: string;
        isStatic: boolean;
        isAdmin: boolean;
        isFunctional: boolean;
    }
  };

  // 3. Gara (Ex Fase Gara)
  tenderPhase: {
    verificationMinutesDate: string; // Verbale Verifica Progetto
    validationMinutesDate: string; // Verbale Validazione Progetto
  };

  // 4. Impresa
  contractor: ContractorStructure;

  // 5. Esecuzione (Ex Fase Esecuzione)
  executionPhase: {
    deliveryDate: string; // Consegna Lavori
    deliveryType: 'ordinary' | 'anticipated';
    
    suspensions: { id: string; date: string; reason: string; minutesNumber?: string }[];
    resumptions: { id: string; date: string; minutesNumber?: string }[];
    
    sals: SALData[]; // Stati Avanzamento Lavori (UPDATED)
    
    variants: { id: string; date: string; approvalAct: string }[]; // Varianti
    
    completionDate: string; // Certificato Ultimazione
    
    // Documenti consegnati
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
  | 'VERBALE_COLLAUDO' 
  | 'VERBALE_CONSEGNA' 
  | 'SOSPENSIONE_LAVORI' 
  | 'RIPRESA_LAVORI' 
  | 'SAL' 
  | 'RELAZIONE_FINALE'
  | 'CERTIFICATO_REGOLARE_ESECUZIONE';

// Il "Verbale" o "Giornale"
export interface DocumentVariables {
  id: string;
  projectId: string; 
  createdAt: number; 
  visitNumber: number; // Numero progressivo verbale
  
  // Dati Sopralluogo (Collaudo)
  date: string;
  time: string;
  convocationDetails: string; 
  attendees: string; 
  
  // Contenuto
  premis: string; // Premesse
  worksExecuted: string[]; // Lavori (Giornale Lavori)
  observations: string; // Valutazioni collaudatore
  
  photos: PhotoAttachment[];
}

export interface AppState {
  user: User | null; 
  project: ProjectConstants;
  documents: DocumentVariables[];
  currentDocumentId: string | null;
}
