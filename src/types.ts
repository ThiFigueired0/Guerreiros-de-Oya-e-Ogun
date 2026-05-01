export interface Event {
  id: string;
  title: string;
  category: string;
  date: string;
  reminder?: string;
  type?: 'event' | 'reminder';
}

export interface HerbBath {
  id: string;
  title: string;
  herbs: string;
  observations: string;
  isFavorite: boolean;
  category?: string;
}

export interface Ponto {
  id: string;
  title: string;
  entity: string;
  lyrics: string;
  youtubeLink?: string;
  audioUrl?: string;
  isFavorite: boolean;
  folderId?: string; // Optional parent folder ID
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string; // Optional parent folder ID for nesting
}

export interface Note {
  id: string;
  title: string;
  content: string;
  images?: string[]; // Array of base64 image strings
  attachments?: {
    name: string;
    type: 'image' | 'pdf';
    data: string; // base64
  }[];
  links?: string[];
  createdAt: number;
  lastEdited: number;
}

export interface ReadyBath {
  id: string;
  title: string;
  quantity: number;
  price: number;
  isFixed: boolean;
  category?: string;
  notes?: string;
}

export interface HerbStock {
  id: string;
  name: string;
  inStock: boolean;
}

export interface AppSettings {
  darkMode: boolean;
  eventCategories: string[];
  eventNames: string[];
  bathCategories?: string[];
  pushNotifications: boolean;
  logoBase64?: string;
  tabIcons?: Record<string, string>;
  primaryTabPaths?: string[];
  secondaryTabPaths?: string[];
  bathPackagePrice?: number;
  currentCashOnHand?: number;
  lastCashUpdate?: number;
}

export interface Bicho {
  id: string;
  name: string;
  purchaseCost: number;
  serviceCost: number;
}

export interface SimulatorItem {
  id: string;
  bichoId: string;
  quantity: number;
  entidade: string;
  observations: string;
}

export interface SimulationRecord {
  id: string;
  items: SimulatorItem[];
  total: number;
  timestamp: number;
  title?: string;
}

export interface OfferingEntity {
  id: string;
  name: string;
  color: string;
  sections: {
    title?: string;
    items: string[];
  }[];
}

export interface Candle {
  id: string;
  color: string;
  quantity: number;
  type: string; 
  observations?: string;
}

export interface Trabalho {
  id: string;
  title: string;
  description: string;
  date: number;
}

export interface StudyBook {
  id: string;
  name: string;
  pdfBase64?: string;
  uploadDate: number;
  notes?: string;
  attachments?: {
    name: string;
    type: 'image' | 'pdf';
    data: string; // base64
  }[];
  links?: string[];
  isFavorite?: boolean;
  readingStatus?: 'not_started' | 'in_progress' | 'completed';
  lastPage?: number;
  totalPages?: number;
  lastRead?: number;
  coverImage?: string;
  coverColor?: string;
}

export interface Greeting {
  id: string;
  category: string;
  entity: string;
  greeting: string;
  summary?: string;
  imageUrl?: string;
  beads?: string;
  firma?: string;
}

export interface StudyContent {
  id: string;
  title: string;
  category: string;
  content: string;
  attachments?: {
    name: string;
    type: 'image' | 'pdf';
    data: string; // base64
  }[];
  links?: string[];
  isFavorite?: boolean;
  createdAt: number;
}

export interface FinancialRecord {
  id: string;
  type: 'mensalidade' | 'extra' | 'oga';
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid';
  paymentDate?: string;
  category?: string;
  paymentAccount?: 'Nubank' | 'Caixa Econômica';
  installments?: {
    current: number;
    total: number;
    masterId: string;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  timestamp: number;
  category: string;
  read: boolean;
}
