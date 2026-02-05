import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let _client: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (_client) return _client;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase env vars missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }
  _client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
  return _client;
};

export const getStorageBucket = (): string => {
  const bucket = import.meta.env.VITE_SUPABASE_BUCKET as string | undefined;
  if (!bucket) {
    throw new Error('Supabase bucket env var missing: set VITE_SUPABASE_BUCKET');
  }
  return bucket;
};

export const getAdminEmail = (): string => {
  const email = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;
  if (!email) throw new Error('Admin email env var missing: set VITE_ADMIN_EMAIL');
  return email;
};
