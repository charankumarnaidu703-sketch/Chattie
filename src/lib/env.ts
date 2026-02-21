const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_N8N_MANUAL_MESSAGE_URL',
  'NEXT_PUBLIC_N8N_CALL_NOTE_URL',
] as const;

for (const key of requiredVars) {
  if (!process.env[key]) {
    console.warn(`⚠️ Missing environment variable: ${key}`);
  }
}

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  n8nManualMessageUrl: process.env.NEXT_PUBLIC_N8N_MANUAL_MESSAGE_URL ?? '',
  n8nCallNoteUrl: process.env.NEXT_PUBLIC_N8N_CALL_NOTE_URL ?? '',
};
