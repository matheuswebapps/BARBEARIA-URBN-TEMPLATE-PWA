// Configuration for Data Provider
// Options: 'local' | 'supabase'
//
// NOTE:
// - If VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present, we auto-enable Supabase.
// - Otherwise we fall back to localStorage so the site still runs in dev without setup.

export const PROVIDER_MODE: 'local' | 'supabase' =
  (import.meta as any).env?.VITE_SUPABASE_URL && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY
    ? 'supabase'
    : 'local';
