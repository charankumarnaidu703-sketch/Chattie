import { Suspense } from 'react';
import { CallNotesClient } from './CallNotesClient';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';

function CallNotesSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4">
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-3 w-64 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

import { PullToRefresh } from '@/components/PullToRefresh';

async function CallNotesContent() {
  const supabase = await createServerSupabaseClient();

  // Fetch call notes with contact info
  const { data: callNotes } = await supabase
    .from('call_notes')
    .select('*, contacts(name, phone)')
    .order('created_at', { ascending: false })
    .limit(50);

  // Fetch contacts for the "new note" form dropdown
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, name, phone')
    .order('name', { ascending: true });

  // Fetch conversations for linking
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, contact_id, status')
    .order('updated_at', { ascending: false });

  return (
    <CallNotesClient
      initialNotes={callNotes ?? []}
      contacts={contacts ?? []}
      conversations={conversations ?? []}
    />
  );
}

export default function CallNotesPage() {
  return (
    <div className="max-w-3xl mx-auto w-full px-6 py-6 pb-28 md:pb-6">
      <PullToRefresh>
        <Suspense fallback={<CallNotesSkeleton />}>
          <CallNotesContent />
        </Suspense>
      </PullToRefresh>
    </div>
  );
}
