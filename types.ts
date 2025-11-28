
// Data that remains constant throughout the project lifecycle
export interface ProjectConstants {
  id: string; // Unique ID for the project
  lastModified: number; // For sorting in dashboard
  entity: string; // Ente Appaltante (es. Provincia di Taranto)
  projectName: string;
  location: string;
  cup: string; // Codice Unico Progetto
  cig?: string; // Codice Identificativo Gara
  contractor: {
    name: string;
    address: string;
    vat: string; // P.IVA
    repName: string; // Legal representative
    repRole: string; // Role of the representative (e.g. Direttore Tecnico)
  };
  contract: {
    repNumber: string;
    date: string;
    registeredAt: string;
    totalAmount: string;
    netAmount: string;
    securityCosts: string;
    deadline: string; // Scadenza contrattuale
  };
  staff: {
    rup: string; // Responsabile Unico Procedimento
    direttoreLavori: string;
    collaudatore: string;
    ispettoreCantiere: string;
    cse: string; // Coordinatore Sicurezza Esecuzione
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
  attendees: string[]; // List of people present
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