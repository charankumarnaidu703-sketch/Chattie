import { Suspense } from 'react';
import { EmailsListClient } from './EmailsListClient';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';

function EmailsSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-white p-4">
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-3 w-32 mb-1" />
            <Skeleton className="h-3 w-64" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function EmailsContent() {
  const supabase = await createServerSupabaseClient();

  const { data: emails } = await supabase
    .from('email_threads')
    .select('*')
    .order('processed_at', { ascending: false })
    .limit(50);

  return <EmailsListClient initialEmails={emails ?? []} />;
}

export default function EmailsPage() {
  return (
    <Suspense fallback={<EmailsSkeleton />}>
      <EmailsContent />
    </Suspense>
  );
}
