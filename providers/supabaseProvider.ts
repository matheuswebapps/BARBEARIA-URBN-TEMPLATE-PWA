import { DataProviderInterface, UploadFolder } from "./interfaces";
import { BusinessSettings, CutSuggestion, PortfolioItem, ServiceItem, Testimonial, ProductItem } from "../types";
import { DEFAULT_CUTS, DEFAULT_PORTFOLIO, DEFAULT_SERVICES, DEFAULT_SETTINGS, DEFAULT_PRODUCTS } from "../constants";
import { getSupabase, getStorageBucket } from "../services/supabaseClient";

const sanitizeFilename = (name: string) => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 80);
};

const withTimeout = async <T>(p: Promise<T>, ms = 15000): Promise<T> => {
  let t: any;
  const timeout = new Promise<T>((_, rej) => {
    t = setTimeout(() => rej(new Error('Timeout')), ms);
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    clearTimeout(t);
  }
};

const TABLES = {
  SETTINGS: 'site_settings',
  SERVICES: 'services',
  CUTS: 'cuts',
  PRODUCTS: 'products',
  PORTFOLIO: 'portfolio_items',
  TESTIMONIALS: 'testimonials'
} as const;

export const supabaseProvider: DataProviderInterface = {
  // -------------------------
  // Settings
  // -------------------------
  getSettings: async (): Promise<BusinessSettings> => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from(TABLES.SETTINGS).select('*').eq('id', 1).maybeSingle();
    if (error) {
      console.warn('Supabase getSettings error. Falling back to defaults.', error);
      return DEFAULT_SETTINGS;
    }
    if (!data) return DEFAULT_SETTINGS;

    // Map DB (snake_case) -> App (camelCase)
    return {
      ...DEFAULT_SETTINGS,
      name: data.name ?? DEFAULT_SETTINGS.name,
      subtitle: data.subtitle ?? DEFAULT_SETTINGS.subtitle,
      phone: data.phone ?? DEFAULT_SETTINGS.phone,
      instagram: data.instagram ?? DEFAULT_SETTINGS.instagram,
      address: data.address ?? DEFAULT_SETTINGS.address,
      mapLink: data.map_link ?? DEFAULT_SETTINGS.mapLink,
      googleMapsUrl: data.google_maps_url ?? DEFAULT_SETTINGS.googleMapsUrl,
      logoUrl: data.logo_url ?? DEFAULT_SETTINGS.logoUrl,
      appIconUrl: data.app_icon_url ?? DEFAULT_SETTINGS.appIconUrl,
      heroImage: data.hero_image ?? DEFAULT_SETTINGS.heroImage,
      openingHoursText: data.opening_hours_text ?? DEFAULT_SETTINGS.openingHoursText,

      // Optional storage paths
      logoPath: data.logo_path ?? null,
      appIconPath: data.app_icon_path ?? null,
      heroImagePath: data.hero_image_path ?? null,

      whatsappLink: data.whatsapp_link ?? DEFAULT_SETTINGS.whatsappLink,
      instagramLink: data.instagram_link ?? DEFAULT_SETTINGS.instagramLink,
      facebookLink: data.facebook_link ?? DEFAULT_SETTINGS.facebookLink,

      heroButtonTextSchedule: data.hero_button_text_schedule ?? DEFAULT_SETTINGS.heroButtonTextSchedule,
      heroButtonTextCuts: data.hero_button_text_cuts ?? DEFAULT_SETTINGS.heroButtonTextCuts,

      feature1Title: data.feature1_title ?? DEFAULT_SETTINGS.feature1Title,
      feature1Description: data.feature1_description ?? DEFAULT_SETTINGS.feature1Description,
      feature2Title: data.feature2_title ?? DEFAULT_SETTINGS.feature2Title,
      feature2Description: data.feature2_description ?? DEFAULT_SETTINGS.feature2Description,
      feature3Title: data.feature3_title ?? DEFAULT_SETTINGS.feature3Title,
      feature3Description: data.feature3_description ?? DEFAULT_SETTINGS.feature3Description,

      footerQuote: data.footer_quote ?? DEFAULT_SETTINGS.footerQuote,

      productsEnabled: data.products_enabled ?? DEFAULT_SETTINGS.productsEnabled,
      childCutEnabled: data.child_cut_enabled ?? DEFAULT_SETTINGS.childCutEnabled
    };
  },

  saveSettings: async (settings: BusinessSettings): Promise<void> => {
    const supabase = getSupabase();

    // Map App (camelCase) -> DB (snake_case)
    const payload: any = {
      id: 1,
      name: settings.name,
      subtitle: settings.subtitle,
      phone: settings.phone,
      instagram: settings.instagram,
      address: settings.address,
      map_link: settings.mapLink,
      google_maps_url: settings.googleMapsUrl,
      logo_url: settings.logoUrl,
      app_icon_url: settings.appIconUrl,
      hero_image: settings.heroImage,
      opening_hours_text: settings.openingHoursText,

      // Optional storage paths
      logo_path: settings.logoPath ?? null,
      app_icon_path: settings.appIconPath ?? null,
      hero_image_path: settings.heroImagePath ?? null,

      whatsapp_link: settings.whatsappLink,
      instagram_link: settings.instagramLink,
      facebook_link: settings.facebookLink,

      hero_button_text_schedule: settings.heroButtonTextSchedule,
      hero_button_text_cuts: settings.heroButtonTextCuts,

      feature1_title: settings.feature1Title,
      feature1_description: settings.feature1Description,
      feature2_title: settings.feature2Title,
      feature2_description: settings.feature2Description,
      feature3_title: settings.feature3Title,
      feature3_description: settings.feature3Description,

      footer_quote: settings.footerQuote,

      products_enabled: settings.productsEnabled,
      child_cut_enabled: settings.childCutEnabled
    };

    const { error } = await supabase.from(TABLES.SETTINGS).upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  },

  // -------------------------
  // Services
  // -------------------------
  getServices: async (): Promise<ServiceItem[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from(TABLES.SERVICES).select('*').order('sort_order', { ascending: true, nullsFirst: false });
    if (error) {
      console.warn('Supabase getServices error. Falling back to defaults.', error);
      return DEFAULT_SERVICES;
    }
    return (data as any[]).map((r) => ({
      id: r.id,
      name: r.name,
      price: Number(r.price ?? 0),
      durationMinutes: Number(r.duration_minutes ?? 0),
      description: r.description ?? '',
      icon: r.icon ?? '',
      active: !!r.active,
      options: r.options ?? undefined,
      isChild: r.is_child ?? undefined,
      notForKids: r.not_for_kids ?? undefined
    }));
  },

  saveServices: async (services: ServiceItem[]): Promise<void> => {
    const supabase = getSupabase();
    const rows = services.map((s, idx) => ({
      id: s.id,
      name: s.name,
      price: s.price,
      duration_minutes: s.durationMinutes,
      description: s.description,
      icon: s.icon,
      active: s.active,
      options: s.options ?? null,
      is_child: s.isChild ?? null,
      not_for_kids: s.notForKids ?? null,
      sort_order: idx
    }));

    const { data: existing, error: e1 } = await supabase.from(TABLES.SERVICES).select('id');
    if (e1) throw e1;

    const existingIds = new Set((existing ?? []).map((r: any) => r.id));
    const incomingIds = new Set(rows.map((r) => r.id));

    const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
    if (toDelete.length) {
      const { error } = await supabase.from(TABLES.SERVICES).delete().in('id', toDelete);
      if (error) throw error;
    }

    const { error } = await supabase.from(TABLES.SERVICES).upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  },

  // -------------------------
  // Portfolio
  // -------------------------
  getPortfolio: async (): Promise<PortfolioItem[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from(TABLES.PORTFOLIO).select('*').order('sort_order', { ascending: true, nullsFirst: false });
    if (error) {
      console.warn('Supabase getPortfolio error. Falling back to defaults.', error);
      return DEFAULT_PORTFOLIO;
    }
    return (data as any[]).map((r) => ({
      id: r.id,
      url: r.url ?? '',
      title: r.title ?? '',
      active: !!r.active,
      storagePath: r.storage_path ?? null
    }));
  },

  savePortfolio: async (items: PortfolioItem[]): Promise<void> => {
    const supabase = getSupabase();
    const rows = items.map((p, idx) => ({
      id: p.id,
      url: p.url,
      title: p.title,
      active: p.active,
      storage_path: p.storagePath ?? null,
      sort_order: idx
    }));

    const { data: existing, error: e1 } = await supabase.from(TABLES.PORTFOLIO).select('id');
    if (e1) throw e1;

    const existingIds = new Set((existing ?? []).map((r: any) => r.id));
    const incomingIds = new Set(rows.map((r) => r.id));

    const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
    if (toDelete.length) {
      const { error } = await supabase.from(TABLES.PORTFOLIO).delete().in('id', toDelete);
      if (error) throw error;
    }

    const { error } = await supabase.from(TABLES.PORTFOLIO).upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  },

  // -------------------------
  // Cuts
  // -------------------------
  getCuts: async (): Promise<CutSuggestion[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from(TABLES.CUTS).select('*').order('sort_order', { ascending: true, nullsFirst: false });
    if (error) {
      console.warn('Supabase getCuts error. Falling back to defaults.', error);
      return DEFAULT_CUTS;
    }
    return (data as any[]).map((r) => ({
      id: r.id,
      name: r.name ?? '',
      technicalName: r.technical_name ?? '',
      category: r.category ?? 'Geral',
      imageUrl: r.image_url ?? '',
      active: !!r.active,
      options: r.options ?? undefined,
      isChild: r.is_child ?? undefined,
      storagePath: r.storage_path ?? null
    }));
  },

  saveCuts: async (items: CutSuggestion[]): Promise<void> => {
    const supabase = getSupabase();
    const rows = items.map((c, idx) => ({
      id: c.id,
      name: c.name,
      technical_name: c.technicalName,
      category: c.category,
      image_url: c.imageUrl,
      active: c.active,
      options: c.options ?? null,
      is_child: c.isChild ?? null,
      storage_path: c.storagePath ?? null,
      sort_order: idx
    }));

    const { data: existing, error: e1 } = await supabase.from(TABLES.CUTS).select('id');
    if (e1) throw e1;

    const existingIds = new Set((existing ?? []).map((r: any) => r.id));
    const incomingIds = new Set(rows.map((r) => r.id));

    const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
    if (toDelete.length) {
      const { error } = await supabase.from(TABLES.CUTS).delete().in('id', toDelete);
      if (error) throw error;
    }

    const { error } = await supabase.from(TABLES.CUTS).upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  },

  // -------------------------
  // Products
  // -------------------------
  getProducts: async (): Promise<ProductItem[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from(TABLES.PRODUCTS).select('*').order('sort_order', { ascending: true, nullsFirst: false });
    if (error) {
      console.warn('Supabase getProducts error. Falling back to defaults.', error);
      return DEFAULT_PRODUCTS;
    }
    return (data as any[]).map((r) => ({
      id: r.id,
      name: r.name ?? '',
      description: r.description ?? '',
      price: Number(r.price ?? 0),
      imageUrl: r.image_url ?? '',
      active: !!r.active,
      options: r.options ?? undefined,
      notForKids: r.not_for_kids ?? undefined,
      storagePath: r.storage_path ?? null
    }));
  },

  saveProducts: async (items: ProductItem[]): Promise<void> => {
    const supabase = getSupabase();
    const rows = items.map((p, idx) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      image_url: p.imageUrl,
      active: p.active,
      options: p.options ?? null,
      not_for_kids: p.notForKids ?? null,
      storage_path: p.storagePath ?? null,
      sort_order: idx
    }));

    const { data: existing, error: e1 } = await supabase.from(TABLES.PRODUCTS).select('id');
    if (e1) throw e1;

    const existingIds = new Set((existing ?? []).map((r: any) => r.id));
    const incomingIds = new Set(rows.map((r) => r.id));

    const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
    if (toDelete.length) {
      const { error } = await supabase.from(TABLES.PRODUCTS).delete().in('id', toDelete);
      if (error) throw error;
    }

    const { error } = await supabase.from(TABLES.PRODUCTS).upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  },

  // -------------------------
  // Testimonials
  // -------------------------
  getTestimonials: async (): Promise<Testimonial[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from(TABLES.TESTIMONIALS).select('*').order('sort_order', { ascending: true, nullsFirst: false });
    if (error) {
      console.warn('Supabase getTestimonials error.', error);
      return [];
    }
    return (data as any[]).map((r) => ({
      id: r.id,
      clientName: r.client_name ?? '',
      comment: r.comment ?? '',
      rating: Number(r.rating ?? 5),
      active: !!r.active
    }));
  },

  saveTestimonials: async (items: Testimonial[]): Promise<void> => {
    const supabase = getSupabase();
    const rows = items.map((t, idx) => ({
      id: t.id,
      client_name: t.clientName,
      comment: t.comment,
      rating: t.rating,
      active: t.active,
      sort_order: idx
    }));

    const { data: existing, error: e1 } = await supabase.from(TABLES.TESTIMONIALS).select('id');
    if (e1) throw e1;

    const existingIds = new Set((existing ?? []).map((r: any) => r.id));
    const incomingIds = new Set(rows.map((r) => r.id));

    const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
    if (toDelete.length) {
      const { error } = await supabase.from(TABLES.TESTIMONIALS).delete().in('id', toDelete);
      if (error) throw error;
    }

    const { error } = await supabase.from(TABLES.TESTIMONIALS).upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  },

  // -------------------------
  // Storage helpers
  // -------------------------
  uploadImage: async (file: File, folder: UploadFolder, filenameHint?: string) => {
    const supabase = getSupabase();
    const bucket = getStorageBucket();

    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const base = sanitizeFilename(filenameHint || file.name || 'image');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const path = `${folder}/${stamp}-${base}.${ext}`;

    const upload = supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || undefined
    });

    const { data, error } = await withTimeout(upload, 20000);
    if (error) throw error;

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return { publicUrl: pub.publicUrl, path: data.path };
  },

  removeImage: async (path: string) => {
    if (!path) return;
    const supabase = getSupabase();
    const bucket = getStorageBucket();
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  }
};
