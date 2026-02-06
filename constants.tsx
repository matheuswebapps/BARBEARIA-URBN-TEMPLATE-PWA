
import { ServiceItem, BusinessSettings, PortfolioItem, CutSuggestion, ProductItem } from './types';

export const LOGO_FALLBACK = ''; // We will use text if no logo
export const BARBERSHOP_PHONE = '5511999999999';

export const DEFAULT_SETTINGS: BusinessSettings = {
  name: 'URBN BARBER',
  subtitle: 'Corte rápido, ambiente limpo. Estilo sem complicação.',
  phone: '5511999999999',
  instagram: 'urbnbarber',
  address: 'Rua Augusta, 1500 - SP',
  mapLink: 'https://www.google.com/maps', 
  googleMapsUrl: 'https://goo.gl/maps/example',
  logoUrl: '', // Intentionally empty for text-based logo look
  appIconUrl: '',
  heroImage: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=1600',
  openingHoursText: 'Seg-Sex: 10h-20h | Sáb: 10h-18h',
  
  // Social Links
  whatsappLink: 'https://wa.me/5511999999999',
  instagramLink: 'https://instagram.com/',
  facebookLink: '',

  // Home Content (Urban/Direct Tone)
  heroButtonTextSchedule: 'Agendar agora',
  heroButtonTextCuts: 'Ver catálogo',
  
  feature1Title: 'Online & Rápido',
  feature1Description: 'Agende em segundos pelo celular.',
  
  feature2Title: 'Preço Justo',
  feature2Description: 'Valores claros. Sem surpresas no final.',
  
  feature3Title: 'Estilo Urbano',
  feature3Description: 'Especialistas em tendências atuais.',
  
  footerQuote: 'Menos papo, mais estilo.',

  // Global Toggles
  productsEnabled: true,
  childCutEnabled: true
};

// Services - Main + Plenty of Extras (Total +5 from previous, now +10 invisible)
export const DEFAULT_SERVICES: ServiceItem[] = [
  { id: '1', name: 'Corte Máquina', price: 45, durationMinutes: 30, description: 'Rápido e prático. Apenas máquina.', icon: 'hair', active: true, options: ['Pente 1', 'Pente 2', 'Zero'], isChild: false, notForKids: false },
  { id: '2', name: 'Corte Tesoura/Fade', price: 65, durationMinutes: 45, description: 'Acabamento detalhado e texturização.', icon: 'hair', active: true, options: ['Fade Alto', 'Fade Baixo', 'Tesoura'], isChild: false, notForKids: false },
  { id: '3', name: 'Barba Completa', price: 40, durationMinutes: 30, description: 'Modelagem e toalha quente.', icon: 'beard', active: true, isChild: false, notForKids: true },
  { id: '4', name: 'Combo (Corte + Barba)', price: 95, durationMinutes: 60, description: 'O pacote completo.', icon: 'combo', active: true, isChild: false, notForKids: true },
  { id: '5', name: 'Corte Infantil', price: 50, durationMinutes: 30, description: 'Até 10 anos.', icon: 'hair', active: true, isChild: true, notForKids: false },
  { id: '6', name: 'Sobrancelha', price: 20, durationMinutes: 10, description: 'Limpeza e alinhamento.', icon: 'eyebrow', active: true, isChild: false, notForKids: false },
  // Invisible slots
  { id: 'extra-1', name: '', price: 0, durationMinutes: 30, description: '', icon: 'default', active: false, isChild: false },
  { id: 'extra-2', name: '', price: 0, durationMinutes: 30, description: '', icon: 'default', active: false, isChild: false },
  { id: 'extra-3', name: '', price: 0, durationMinutes: 30, description: '', icon: 'default', active: false, isChild: false },
  { id: 'extra-4', name: '', price: 0, durationMinutes: 30, description: '', icon: 'default', active: false, isChild: false },
  { id: 'extra-5', name: '', price: 0, durationMinutes: 30, description: '', icon: 'default', active: false, isChild: false },
  { id: 'extra-6', name: '', price: 0, durationMinutes: 30, description: '', icon: 'default', active: false, isChild: false },
  { id: 'extra-7', name: '', price: 0, durationMinutes: 30, description: '', icon: 'default', active: false, isChild: false },
  { id: 'extra-8', name: '', price: 0, durationMinutes: 30, description: '', icon: 'default', active: false, isChild: false },
  { id: 'extra-9', name: '', price: 0, durationMinutes: 30, description: '', icon: 'default', active: false, isChild: false },
  { id: 'extra-10', name: '', price: 0, durationMinutes: 30, description: '', icon: 'default', active: false, isChild: false },
,
  { id: 'slot-serv-017', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false },
  { id: 'slot-serv-018', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false },
  { id: 'slot-serv-019', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false },
  { id: 'slot-serv-020', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false },
  { id: 'slot-serv-021', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false },
  { id: 'slot-serv-022', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false },
  { id: 'slot-serv-023', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false },
  { id: 'slot-serv-024', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false },
  { id: 'slot-serv-025', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false },
  { id: 'slot-serv-026', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false },
  { id: 'slot-serv-027', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false },
  { id: 'slot-serv-028', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false },
  { id: 'slot-serv-029', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false },
  { id: 'slot-serv-030', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false },
  { id: 'slot-serv-031', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false },
  { id: 'slot-serv-032', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false },
  { id: 'slot-serv-033', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false },
  { id: 'slot-serv-034', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false },
  { id: 'slot-serv-035', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false },
  { id: 'slot-serv-036', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false },
  { id: 'slot-serv-037', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false },
  { id: 'slot-serv-038', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false },
  { id: 'slot-serv-039', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false },
  { id: 'slot-serv-040', name: '', price: 0, durationMinutes: 30, description: '', icon: 'hair', active: false, options: [''], isChild: false, notForKids: false }
];

export const DEFAULT_PORTFOLIO: PortfolioItem[] = [];

// Cuts - Main + Plenty of Extras
export const DEFAULT_CUTS: CutSuggestion[] = [
  { id: '1', name: 'Crop Fade', technicalName: 'Texturizado', category: 'Geral', imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=600', active: true, options: ['Sem risco', 'Com risco'], isChild: false },
  { id: '2', name: 'Skin Fade', technicalName: 'Degradê Zero', category: 'Geral', imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', active: true, options: ['Alto', 'Médio', 'Baixo'], isChild: false },
  { id: '3', name: 'Mullet Moderno', technicalName: 'Modern Mullet', category: 'Geral', imageUrl: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=600', active: true, isChild: false },
  { id: '4', name: 'Buzz Cut', technicalName: 'Militar', category: 'Geral', imageUrl: 'https://images.unsplash.com/photo-1634316427356-324c65e5e406?auto=format&fit=crop&q=80&w=600', active: true, isChild: false },
  { id: '5', name: 'Social Clean', technicalName: 'Clássico', category: 'Geral', imageUrl: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&q=80&w=600', active: true, isChild: false },
  { id: '6', name: 'Waves/Nudred', technicalName: 'Textura Afro', category: 'Crespo / Cacheado', imageUrl: 'https://images.unsplash.com/photo-1514059074073-677a284e937d?auto=format&fit=crop&q=80&w=600', active: true, isChild: false },
  
  // Invisible slots
  { id: 'extra-c1', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, isChild: false },
  { id: 'extra-c2', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, isChild: false },
  { id: 'extra-c3', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, isChild: false },
  { id: 'extra-c4', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, isChild: false },
  { id: 'extra-c5', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, isChild: false },
,
  { id: 'slot-cut-012', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-013', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-014', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-015', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-016', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-017', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-018', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-019', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-020', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-021', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-022', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-023', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-024', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-025', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-026', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-027', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-028', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-029', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-030', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-031', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-032', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-033', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-034', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-035', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-036', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-037', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-038', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-039', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-040', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-041', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-042', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-043', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-044', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-045', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-046', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-047', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-048', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-049', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-050', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-051', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-052', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-053', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-054', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-055', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-056', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-057', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-058', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-059', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null },
  { id: 'slot-cut-060', name: '', technicalName: '', category: 'Geral', imageUrl: '', active: false, options: ['', '', '', ''], isChild: false, storagePath: null }
];

// New Products Section
export const DEFAULT_PRODUCTS: ProductItem[] = [
  { id: 'prod-1', name: 'Pomada Matte', description: 'Alta fixação e efeito seco.', price: 45, imageUrl: 'https://images.unsplash.com/photo-1626898950007-a36c1e34e548?auto=format&fit=crop&q=80&w=400', active: true, options: ['Normal', 'Extra Forte'], notForKids: false },
  { id: 'prod-2', name: 'Óleo para Barba', description: 'Hidratação e brilho natural.', price: 35, imageUrl: 'https://images.unsplash.com/photo-1626127027787-8f813a30c842?auto=format&fit=crop&q=80&w=400', active: true, notForKids: true },
  { id: 'prod-3', name: 'Shampoo Mentolado', description: 'Refrescante e limpeza profunda.', price: 30, imageUrl: 'https://images.unsplash.com/photo-1556228720-1987dcd79603?auto=format&fit=crop&q=80&w=400', active: true, notForKids: false },
  { id: 'prod-4', name: 'Pente de Madeira', description: 'Anti-estático para barba.', price: 25, imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&q=80&w=400', active: true, notForKids: true },
  { id: 'prod-5', name: 'Balm Hidratante', description: 'Maciez para barbas longas.', price: 40, imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=400', active: true, notForKids: true },
  // Invisible Product Slots
  { id: 'extra-p1', name: '', description: '', price: 0, imageUrl: '', active: false },
  { id: 'extra-p2', name: '', description: '', price: 0, imageUrl: '', active: false },
  { id: 'extra-p3', name: '', description: '', price: 0, imageUrl: '', active: false },
  { id: 'extra-p4', name: '', description: '', price: 0, imageUrl: '', active: false },
  { id: 'extra-p5', name: '', description: '', price: 0, imageUrl: '', active: false },
,
  { id: 'slot-prod-011', name: '', description: '', price: 0, imageUrl: '', active: false, options: [''], notForKids: false, storagePath: null },
  { id: 'slot-prod-012', name: '', description: '', price: 0, imageUrl: '', active: false, options: [''], notForKids: false, storagePath: null },
  { id: 'slot-prod-013', name: '', description: '', price: 0, imageUrl: '', active: false, options: [''], notForKids: false, storagePath: null },
  { id: 'slot-prod-014', name: '', description: '', price: 0, imageUrl: '', active: false, options: [''], notForKids: false, storagePath: null },
  { id: 'slot-prod-015', name: '', description: '', price: 0, imageUrl: '', active: false, options: [''], notForKids: false, storagePath: null },
  { id: 'slot-prod-016', name: '', description: '', price: 0, imageUrl: '', active: false, options: [''], notForKids: false, storagePath: null },
  { id: 'slot-prod-017', name: '', description: '', price: 0, imageUrl: '', active: false, options: [''], notForKids: false, storagePath: null },
  { id: 'slot-prod-018', name: '', description: '', price: 0, imageUrl: '', active: false, options: [''], notForKids: false, storagePath: null },
  { id: 'slot-prod-019', name: '', description: '', price: 0, imageUrl: '', active: false, options: [''], notForKids: false, storagePath: null },
  { id: 'slot-prod-020', name: '', description: '', price: 0, imageUrl: '', active: false, options: [''], notForKids: false, storagePath: null }
];
