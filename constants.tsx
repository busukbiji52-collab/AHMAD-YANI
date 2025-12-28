
import { MenuCategory } from './types';

export const MENU_DATABASE: MenuCategory[] = [
  {
    title: 'EDUKASI',
    items: [
      { id: 'BUKU_MEWARNAI', label: 'Buku Mewarnai', description: 'Konsep gambar garis/SVG untuk anak' },
      { id: 'WORKSHEET_ANAK', label: 'Worksheet Anak', description: 'Lembar soal & jawaban terstruktur' },
      { id: 'KOMIK', label: 'Komik & Cerita Bergambar', description: 'Naskah Storyboard visual & Dialog' },
    ]
  },
  {
    title: 'PHOTO STUDIO',
    items: [
      { id: 'PAS_FOTO', label: 'Pas Foto' },
      { id: 'STUDIO_LIGHTING', label: 'Studio Lighting' },
      { id: 'OUTDOOR', label: 'Outdoor' },
    ]
  },
  {
    title: 'UGC AFFILIATE',
    items: [
      { id: 'SCRIPT_VIDEO', label: 'Script Video' },
      { id: 'IDE_KONTEN', label: 'Ide Konten' },
    ]
  },
  {
    title: 'AFFILIATE E-COMMERCE',
    items: [
      { id: 'DESKRIPSI_PRODUK', label: 'Deskripsi Produk' },
      { id: 'REVIEW_PALSU', label: 'Review Palsu/Marketing' },
    ]
  },
  {
    title: 'ALAT BISNIS',
    items: [
      { id: 'SWOT', label: 'Analisis SWOT' },
      { id: 'BUSINESS_PLAN', label: 'Business Plan' },
    ]
  },
  {
    title: 'FAMILY & LIFESTYLE',
    items: [
      { id: 'IDE_LIBURAN', label: 'Ide Liburan' },
      { id: 'RESEP_MASAKAN', label: 'Resep Masakan' },
    ]
  },
  {
    title: 'AI CREATIVE SUITE',
    items: [
      { id: 'MINI_ME', label: 'Mini Me / Karikatur', description: 'Analisis foto -> Deskripsi Karakter' },
      { id: 'PHOTO_EDITOR', label: 'Photo Editor' },
    ]
  }
];
