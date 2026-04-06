import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { EmailDetailClient } from './EmailDetailClient';
import type { EmailThreadWithMessages } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function EmailContent({ id }: { id: string }) {
  const supabase = await createServerSupabaseClient();

  const { data: thread, error } = await supabase
    .from('email_threads')
    .select(`
      *,
      contacts (*),
      email_messages (
        *
      )
    `)
    .eq('id', id)
    .single();

  if (error || !thread) {
    console.error('Error fetching email thread:', error);
    notFound();
  }

  const sortedMessages = [...(thread.email_messages || [])].sort(
    (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
  );

  const threadWithSortedMessages: EmailThreadWithMessages = {
    ...thread,
    email_messages: sortedMessages
  };

  return <EmailDetailClient initialThread={threadWithSortedMessages} />;
}

export default async function EmailDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="h-[calc(100vh-theme(spacing.20))] md:h-[calc(100vh-theme(spacing.8))] max-w-7xl mx-auto flex flex-col pt-4 px-4 md:px-0">
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <EmailContent id={id} />
      </Suspense>
    </div>
  );
}

