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

  return (
    <div className="max-w-3xl mx-auto w-full px-6 py-6 pb-28 md:pb-6">
      <CompanyInfoClient initialData={knowledgeRows} />
    </div>
  );
}
