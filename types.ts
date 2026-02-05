export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
  icon: string;
  active: boolean;
  options?: string[]; // Sub-options (e.g. "High Fade", "Low Fade")
  isChild?: boolean; // New: Identifies if this is a child service
  notForKids?: boolean; // New: If true, cannot be selected with isChild services
}

export interface PortfolioItem {
  id: string;
  url: string;
  title: string;
  active: boolean;
  // Optional: internal storage path (used by admin to delete/replace)
  storagePath?: string | null;
}

export interface CutSuggestion {
  id: string;
  name: string;
  technicalName: string;
  category: 'Liso / Ondulado' | 'Crespo / Cacheado' | 'Geral';
  imageUrl: string;
  active: boolean;
  options?: string[]; // Sub-options
  isChild?: boolean; // New: Identifies if this is a child-specific style
  storagePath?: string | null;
}

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  active: boolean;
  options?: string[]; // Sub-options (e.g. "Matte", "Brilho")
  notForKids?: boolean; // New: If true, hidden when child service is active
  storagePath?: string | null;
}

export interface BusinessSettings {
  name: string;
  subtitle: string;
  phone: string;
  instagram: string; // Keep for backward compatibility or display
  address: string;
  mapLink: string; // Google Maps URL (view)
  googleMapsUrl: string; // Google Maps URL (action/link)
  logoUrl: string;
  appIconUrl: string; // PWA Icon
  heroImage: string;
  openingHoursText: string;

  // Optional: internal storage paths (used by admin to delete/replace)
  logoPath?: string | null;
  appIconPath?: string | null;
  heroImagePath?: string | null;

  // Social Media Links
  whatsappLink: string;
  instagramLink: string;
  facebookLink: string;

  // Home Page Editable Content
  heroButtonTextSchedule: string;
  heroButtonTextCuts: string;

  feature1Title: string;
  feature1Description: string;

  feature2Title: string;
  feature2Description: string;

  feature3Title: string;
  feature3Description: string;

  footerQuote: string;

  // Global Feature Toggles
  productsEnabled: boolean;
  childCutEnabled: boolean;
}

export interface Testimonial {
  id: string;
  clientName: string;
  comment: string;
  rating: number; // 1 to 5
  active: boolean;
}

export interface Appointment {
  services: ServiceItem[];
  products: { item: ProductItem; quantity: number }[]; // Updated to support quantity
  dayType: string | null;
  specificDate: string | null;
  time: string | null;
  clientName: string;
}

export enum DayType {
  HOJE = 'Hoje',
  AMANHA = 'Amanhã',
  OUTRO = 'Outro dia'
}

export enum ServiceType {
  CORTE = 'Corte Clássico',
  BARBA = 'Barba Tradicional',
  SOBRANCELHA = 'Acabamento',
  OUTRO = 'Outro'
}
