import { Suspense } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import CompanyInfoClient from './CompanyInfoClient';
import { DashboardSkeleton } from '@/components/LoadingSkeleton';

export const dynamic = 'force-dynamic';

async function CompanyInfoContent() {
  const supabase = await createServerSupabaseClient();

  const { data: knowledgeRows } = await supabase
    .from('company_knowledge')
    .select('id, category, key, value')
    .order('category')
    .order('key');

  return <CompanyInfoClient initialData={knowledgeRows ?? []} />;
}

export default function CompanyInfoPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <CompanyInfoContent />
    </Suspense>
  );
}
