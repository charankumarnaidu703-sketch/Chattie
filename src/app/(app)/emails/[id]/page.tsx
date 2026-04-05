import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client-server-wrapper';
import { EmailDetailClient } from './EmailDetailClient';
import type { EmailThreadWithMessages } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export const revalidate = 0;

export default async function EmailDetailPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseClient();

  // Fetch the email thread with contact and messages
  const { data: thread, error } = await supabase
    .from('email_threads')
    .select(`
      *,
      contacts (*),
      email_messages (
        *
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !thread) {
    console.error('Error fetching email thread:', error);
    notFound();
  }

  // Sort messages oldest to newest
  const sortedMessages = [...(thread.email_messages || [])].sort(
    (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
  );

  const threadWithSortedMessages: EmailThreadWithMessages = {
    ...thread,
    email_messages: sortedMessages
  };

  return (
    <div className="h-[calc(100vh-theme(spacing.20))] md:h-[calc(100vh-theme(spacing.8))] max-w-7xl mx-auto flex flex-col pt-4 px-4 md:px-0">
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <EmailDetailClient initialThread={threadWithSortedMessages} />
      </Suspense>
    </div>
  );
}
