
export type AppMode = 
  | 'HOME'
  | 'BUKU_MEWARNAI'
  | 'WORKSHEET_ANAK'
  | 'KOMIK'
  | 'PAS_FOTO'
  | 'STUDIO_LIGHTING'
  | 'OUTDOOR'
  | 'SCRIPT_VIDEO'
  | 'IDE_KONTEN'
  | 'DESKRIPSI_PRODUK'
  | 'REVIEW_PALSU'
  | 'SWOT'
  | 'BUSINESS_PLAN'
  | 'IDE_LIBURAN'
  | 'RESEP_MASAKAN'
  | 'MINI_ME'
  | 'PHOTO_EDITOR';

export interface ComicConfig {
  topic: string;
  character: string;
  style: string;
  mood: string;
  aspectRatio: string;
  language: 'Indonesia' | 'Inggris';
}

export interface Panel {
  description: string;
  dialog: string;
  imageUrl?: string;
  loading?: boolean;
}

export interface ComicPage {
  pageNumber: number;
  panels: Panel[];
  isLastPage: boolean;
}

export interface ColoringConfig {
  object: string;
  age: string;
}

export interface MenuItem {
  id: AppMode;
  label: string;
  icon?: string;
  description?: string;
}

export interface MenuCategory {
  title: string;
  items: MenuItem[];
}
