
export interface ContactInfo {
  name: string; // Nome e Cognome o Ragione Sociale
  title?: string; // Arch., Ing., Geom.
  role?: string; // Ruolo specifico o Categoria Lavori (per subappalti)
  address?: string;
  email?: string;
  pec?: string;
  phone?: string;
  vat?: string; // P.IVA / C.F.
  repName?: string; // Rappresentante Legale Name
  repRole?: string; // Rappresentante Legale Role
  repTitle?: string; // NEW: Titolo Rappresentante (es. Sig., Dott.)
  professionalOrder?: string; // NEW: Albo/Ordine di appartenenza
  registrationNumber?: string; // NEW: Numero iscrizione
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
  designLevels: string[]; // NEW: ['PFTE', 'Esecutivo', ...]
  roles: string[]; // NEW: ['Architettonico', 'Strutturale', ...] (Multiselect)
  isLegalEntity: boolean; // NEW: True if RTP or Engineering Society
  operatingDesigners: ContactInfo[]; // NEW: List of actual people doing the work if Entity
}

export type CompanyType = 'single' | 'ati' | 'consortium';

export interface ContractorStructure {
  type: CompanyType;
  mainCompany: ContactInfo; // Impresa Singola, Capogruppo ATI, o Consorzio
  mandants: ContactInfo[]; // Solo per ATI: Imprese Mandanti
  executors: ContactInfo[]; // Solo per Consorzi: Imprese Esecutrici
  subcontractors: ContactInfo[]; // Subappaltatori con anagrafica completa
}

export interface DesignPhaseData {
  deliveryProtocol: string; // NEW: Protocollo Consegna
  deliveryDate: string;
  economicFramework: string; // Quadro Economico
  approvalType: string; // Tipo atto approvazione
  approvalNumber: string;
  approvalDate: string;
  localFolderLink: string; // Path cartella locale (NEW)
}

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

export interface TesterVisitSummary {
    id: string;
    startDate: string;
    endDate: string;
    works: string[]; // Elenco sintetico lavorazioni
    notes: string;
}

export interface ProjectConstants {
  id: string; 
  ownerId: string; // ID dell'utente proprietario
  lastModified: number; 
  displayOrder: number; // NEW: Custom sort order
  entity: string; // Ente Appaltante
  entityProvince?: string; // Provincia dell'Ente
  headerLogo?: string; // NEW: Logo Intestazione (Base64)
  projectName: string;
  location: string;
  cup: string; 
  cig?: string; 
  generalNotes: string; // Note generali progetto (NEW)
  
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

  designPhase: {
    docfap: DesignPhaseData; // Documento fattibilità alternative
    dip: DesignPhaseData;    // Documento indirizzo progettazione
    pfte: DesignPhaseData;   // Progetto fattibilità tecnico economica
    executive: DesignPhaseData; // Progetto Esecutivo
  };

  subjects: {
    rup: SubjectProfile; // Resp. Unico Progetto
    designers: DesignerProfile[]; // Progettisti multipli
    csp: DesignerProfile; // Coord. Sicurezza Progettazione
    verifier: DesignerProfile; // Verificatore
    dl: DesignerProfile; // Direttore Lavori
    dlOffice: SubjectProfile[]; // Ufficio Direzione Lavori
    cse: DesignerProfile; // Coord. Sicurezza Esecuzione
    tester: SubjectProfile; // Collaudatore
    testerAppointment: { 
        nominationType: string;
        nominationAuthority: string; // NEW: Es. "Dirigente del Settore Tecnico"
        nominationNumber: string;
        nominationDate: string;
        contractRepNumber: string; // NEW: Rep. Convenzione
        contractDate: string; // NEW
        contractProtocol: string; // NEW: Prot. n.
        isStatic: boolean;
        isAdmin: boolean;
        isFunctional: boolean;
    }
  };

  tenderPhase: {
    verificationMinutesDate: string; // Verbale Verifica Progetto
    validationMinutesDate: string; // Verbale Validazione Progetto
  };

  contractor: ContractorStructure;

  executionPhase: {
    deliveryDate: string; // Consegna Lavori
    deliveryType: 'ordinary' | 'anticipated';
    suspensions: { id: string; date: string; reason: string; minutesNumber?: string }[];
    resumptions: { id: string; date: string; minutesNumber?: string }[];
    sals: SALData[]; 
    variants: { id: string; date: string; approvalAct: string }[]; // Varianti
    testerVisitSummaries: TesterVisitSummary[]; // NEW: Riepilogo lavori per visite collaudo
    completionDate: string; // Certificato Ultimazione
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
  | 'RICHIESTA_AUTORIZZAZIONE' // NEW: Richiesta Autorizzazione Ente
  | 'NULLA_OSTA_ENTE'         // NEW: Nulla Osta Ente
  | 'LETTERA_CONVOCAZIONE'     // NEW: Lettera Convocazione Visita
  | 'VERBALE_CONSEGNA' 
  | 'SOSPENSIONE_LAVORI' 
  | 'RIPRESA_LAVORI' 
  | 'SAL' 
  | 'RELAZIONE_FINALE' 
  | 'RELAZIONE_COLLAUDO'
  | 'CERTIFICATO_ULTIMAZIONE'
  | 'CERTIFICATO_REGOLARE_ESECUZIONE';

export interface DocumentVariables {
  id: string;
  projectId: string; 
  createdAt: number; 
  visitNumber: number; // Numero progressivo verbale
  date: string;
  time: string;
  convocationMethod: string; // New: PEC, Email, ecc.
  convocationDate: string;   // New: Data invio
  convocationDetails: string; // Legacy/Fallback text
  attendees: string; 
  premis: string; // Premesse
  worksExecuted: string[]; // Lavori (Giornale Lavori)
  worksInProgress: string; // Lavorazioni in corso al momento della visita
  upcomingWorks: string; // NEW: Prossime attività previste
  worksIntroText: string; // NEW: Frase introduttiva modificabile
  testerRequests: string; // Richieste del Collaudatore
  testerInvitations: string; // Inviti del Collaudatore
  commonParts: string; // Parti Comuni (Chiusura)
  observations: string; // Valutazioni collaudatore
  photos: PhotoAttachment[];
  
  // Specific fields for Letters/Acts
  actSubject?: string;       // Oggetto specifico della lettera
  actRecipient?: string;     // Destinatario specifico (se diverso dall'Ente)
  actBodyOverride?: string;  // Testo custom per atti amministrativi
}

export interface AppState {
  user: User | null; 
  project: ProjectConstants;
  documents: DocumentVariables[];
  currentDocumentId: string | null;
}
