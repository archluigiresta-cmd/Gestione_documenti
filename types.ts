
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

// Struttura per ATI / Imprese
export interface ContractorStructure extends ContactInfo {
  isATI: boolean;
  mandants: ContactInfo[]; // Imprese mandanti in caso di ATI
  subcontractors: { name: string; activity: string }[];
}

export interface ProjectConstants {
  id: string; 
  lastModified: number; 
  entity: string; // Ente Appaltante
  projectName: string;
  location: string;
  cup: string; 
  cig?: string; 
  
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

  // 2. Soggetti Responsabili
  subjects: {
    rup: ContactInfo; // Resp. Unico Progetto
    designers: ContactInfo[]; // Progettisti
    csp: ContactInfo; // Coord. Sicurezza Progettazione
    verifier: ContactInfo; // Verificatore
    dl: ContactInfo; // Direttore Lavori
    dlOffice: ContactInfo[]; // Ufficio Direzione Lavori (Assistenti, Operativi)
    cse: ContactInfo; // Coord. Sicurezza Esecuzione
    tester: ContactInfo; // Collaudatore
    testerAppointment: { // Dati specifici nomina collaudatore
        nominationType: string;
        nominationNumber: string;
        nominationDate: string;
        isStatic: boolean;
        isAdmin: boolean;
        isFunctional: boolean;
    }
  };

  // 3. Fase Gara
  tenderPhase: {
    verificationMinutesDate: string; // Verbale Verifica Progetto
    validationMinutesDate: string; // Verbale Validazione Progetto
  };

  // 4. Impresa
  contractor: ContractorStructure;

  // 5. Fase Esecuzione (Atti Amministrativi)
  executionPhase: {
    deliveryDate: string; // Consegna Lavori
    deliveryType: 'ordinary' | 'anticipated';
    
    suspensions: { id: string; date: string; reason: string; minutesNumber?: string }[];
    resumptions: { id: string; date: string; minutesNumber?: string }[];
    
    sals: { id: string; date: string; number: string; amount: string }[]; // Stati Avanzamento
    variants: { id: string; date: string; approvalAct: string }[]; // Varianti
    
    completionDate: string; // Certificato Ultimazione
    
    // Documenti consegnati (ex handoverDocs)
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
  project: ProjectConstants;
  documents: DocumentVariables[];
  currentDocumentId: string | null;
}
