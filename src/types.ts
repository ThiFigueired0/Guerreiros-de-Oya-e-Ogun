export interface Event {
  id: string;
  title: string;
  category: string;
  date: string;
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
  lastEdited: number;
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
}

export interface Bicho {
  id: string;
  name: string;
  purchaseCost: number;
  serviceCost: number;
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
  pdfBase64: string;
  uploadDate: number;
  notes?: string;
  isFavorite?: boolean;
  readingStatus?: 'not_started' | 'in_progress' | 'completed';
  lastPage?: number;
  totalPages?: number;
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
