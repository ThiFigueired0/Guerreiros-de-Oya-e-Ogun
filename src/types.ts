export interface Event {
  id: string;
  title: string;
  category: string;
  date: string;
  reminder?: string;
  type?: 'event' | 'reminder';
  isCanceled?: boolean;
  cancelReason?: string;
  replacementDate?: string;
}

export interface HerbBath {
  id: string;
  title: string;
  herbs: string;
  observations: string;
  isFavorite: boolean;
  category?: string;
  thermalProperty?: 'quente' | 'morna' | 'fria';
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
  tags?: string[];
  folderId?: string;
  isPinned?: boolean;
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
  classification?: 'quente' | 'morna' | 'fria';
}

export interface UsefulContact {
  id: string;
  name: string;
  phone: string;
  photo?: string;
  isFixed?: boolean;
}

export const DEFAULT_TEMPLO_LOGO = 'https://res.cloudinary.com/dpv8m5igw/image/upload/v1779129046/2530f586-95fd-45d1-a887-8be0458a0a28_ztv0ly.jpg';
export const DEFAULT_INSTAGRAM_LOGO = 'https://res.cloudinary.com/dpv8m5igw/image/upload/v1778870299/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA1L3JtNTMzLW5lb24tMDAzLmpwZw_ci3qyh.webp';
export const DEFAULT_TIKTOK_LOGO = 'https://res.cloudinary.com/dpv8m5igw/image/upload/v1778870382/655140_uxy5kh.webp';
export const DEFAULT_ASSISTANT_AVATAR = 'https://res.cloudinary.com/dpv8m5igw/image/upload/v1778872491/15d88a8c-a394-432e-a4ba-abed0f7bb4b1_epejjh.jpg';

export interface AppSettings {
  darkMode: boolean;
  immersiveMode?: boolean;
  reminderHours?: number;
  silentHoursStart?: string;
  silentHoursEnd?: string;
  primaryColor?: string;
  eventCategories: string[];
  eventNames: string[];
  bathCategories?: string[];
  pushNotifications: boolean;
  logoBase64?: string;
  caixaLogo?: string;
  nubankLogo?: string;
  tiktokLogo?: string;
  instagramLogo?: string;
  whatsappLogo?: string;
  orixaPhotos?: Record<string, string>;
  tabIcons?: Record<string, string>;
  primaryTabPaths?: string[];
  secondaryTabPaths?: string[];
  bathPackagePrice?: number;
  currentCashOnHand?: number;
  lastCashUpdate?: number;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  email?: string;
  birthDate?: string;
  gender?: 'masculino' | 'feminino' | 'outro' | 'prefiro_nao_dizer';
  profilePhoto?: string;
  usefulContacts?: UsefulContact[];
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
  author?: string;
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
  pdfUrl?: string;
  readingStatus?: 'not_started' | 'in_progress' | 'completed';
  lastPage?: number;
  lastYPercent?: number;
  totalPages?: number;
  lastRead?: number;
  coverImage?: string;
  coverColor?: string;
  toc?: { capitulo: string; pagina: number }[];
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

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category?: string;
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
