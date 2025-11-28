
// Data that remains constant throughout the project lifecycle
export interface ProjectConstants {
  id: string; // Unique ID for the project
  lastModified: number; // For sorting in dashboard
  entity: string; // Ente Appaltante (es. Provincia di Taranto)
  projectName: string;
  location: string;
  cup: string; // Codice Unico Progetto
  cig?: string; // Codice Identificativo Gara
  
  // Impresa
  contractor: {
    name: string;
    address: string;
    vat: string; // P.IVA
    repName: string; // Legal representative
    repRole: string; // Role of the representative (e.g. Direttore Tecnico)
  };

  // Contratto Appalto
  contract: {
    repNumber: string; // Repertorio N.
    date: string; // Data stipula
    
    // Dettagli Registrazione
    regPlace: string; // Luogo
    regDate: string; // Data
    regNumber: string; // Numero
    regSeries: string; // Serie

    totalAmount: string; // Importo Contrattuale
    securityCosts: string; // Oneri sicurezza (inclusi nel totale)
    
    handoverDate: string; // Data consegna lavori
    durationDays: number; // Giorni naturali e consecutivi
    deadline: string; // Scadenza (calcolata)
  };

  // Soggetti
  staff: {
    rup: string; // Responsabile Unico Procedimento
    direttoreLavori: string;
    ispettoreCantiere: string;
    cse: string; // Coordinatore Sicurezza Esecuzione
    // Collaudatore name is now linked with appointment details below, 
    // but kept here for backwards compatibility in some views if needed
  };

  // Dati Collaudatore e Nomina
  testerAppointment: {
    name: string; // Nome Collaudatore
    qualification: string; // Arch. / Ing.
    nominationType: string; // Es. Determina Dirigenziale
    nominationNumber: string;
    nominationDate: string;
    contractRep: string; // Repertorio contratto incarico (se diverso da appalto)
    contractDate: string;
    // Tipi Incarico (Flags)
    isStatic: boolean;
    isAdmin: boolean;
    isFunctional: boolean;
  };

  // Documenti Consegnati e Atti Amministrativi
  handoverDocs: {
    // Approvazione Progetto Esecutivo
    projectApprovalType: string; // Es. Determina / Delibera
    projectApprovalNumber: string;
    projectApprovalDate: string;
    
    // Verbale Consegna Lavori
    deliveryDate: string;
    deliveryType: 'ordinary' | 'anticipated'; // Ordinaria o Anticipata

    // AINOP e Comune
    ainopProtocol: string;
    ainopDate: string;
    municipalityProtocol: string;
    municipalityDate: string;
  };
}

export interface PhotoAttachment {
  id: string;
  url: string; // Object URL for preview/print
  file?: File; // Actual file reference
  description: string;
}

// Data that changes with every specific document/visit
export interface DocumentVariables {
  id: string;
  projectId: string; // Link to the parent project
  createdAt: number; // Timestamp for sorting
  type: 'VERBALE_COLLAUDO' | 'RELAZIONE_STRUTTURA' | 'SAL';
  visitNumber: number;
  date: string;
  time: string;
  convocationDetails: string; // Details about how the visit was called (PEC, etc.)
  attendees: string; // List of people present (free text)
  premis: string; // The "Premesso che..." section
  worksExecuted: string[]; // List of specific works done specifically FOR THIS visit
  observations: string; // General notes or "Si dà atto che..."
  photos: PhotoAttachment[];
}

export interface AppState {
  project: ProjectConstants;
  documents: DocumentVariables[];
  currentDocumentId: string | null;
}
