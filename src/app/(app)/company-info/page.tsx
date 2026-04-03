import { createServerSupabaseClient } from '@/lib/supabase/server';
import CompanyInfoClient from './CompanyInfoClient';

export const dynamic = 'force-dynamic';

export default async function CompanyInfoPage() {
  const supabase = await createServerSupabaseClient();

  let knowledgeRows: { id: string; category: string; key: string; value: string }[] = [];

  try {
    const { data, error } = await supabase
      .from('company_knowledge')
      .select('id, category, key, value')
      .order('category')
      .order('key');

    if (!error && data) {
      knowledgeRows = data;
    }
  } catch {
    // Table might not exist yet — show empty form
  }

  return <CompanyInfoClient initialData={knowledgeRows} />;
}
