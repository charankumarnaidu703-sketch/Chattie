import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/lib/database.types';
import { env } from '@/lib/env';

export function createClient() {
  return createBrowserClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
}

// Singleton for client components
let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!client) {
    client = createClient();
  }
  return client;
}
