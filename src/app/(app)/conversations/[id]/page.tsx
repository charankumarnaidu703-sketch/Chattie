import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ConversationView } from './ConversationView';
import { ChatSkeleton } from '@/components/LoadingSkeleton';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function ConversationContent({ id }: { id: string }) {
  const supabase = await createServerSupabaseClient();

  const [convResult, messagesResult] = await Promise.all([
    supabase
      .from('conversations')
      .select('*, contacts(*)')
      .eq('id', id)
      .single(),
    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('sent_at', { ascending: true }),
  ]);

  if (!convResult.data) {
    notFound();
  }

  return (
    <ConversationView
      initialConversation={convResult.data}
      initialMessages={messagesResult.data ?? []}
    />
  );
}

export default async function ConversationDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ConversationContent id={id} />
    </Suspense>
  );
}
