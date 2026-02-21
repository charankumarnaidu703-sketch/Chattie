import { Suspense } from 'react';
import { ConversationsListClient } from './ConversationsListClient';
import { ConversationListSkeleton } from '@/components/LoadingSkeleton';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

async function ConversationsContent() {
  const supabase = await createServerSupabaseClient();

  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      contacts (id, name, phone),
      messages (content, sent_at, direction)
    `)
    .order('updated_at', { ascending: false })
    .limit(50);

  // Sort messages within each conversation (most recent first for preview)
  const conversationsWithSortedMessages = (conversations ?? []).map((conv) => ({
    ...conv,
    contacts: conv.contacts as { id: string; name: string | null; phone: string },
    messages: (conv.messages as { content: string | null; sent_at: string; direction: string }[])
      ?.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()),
  }));

  return <ConversationsListClient conversations={conversationsWithSortedMessages} />;
}

export default function ConversationsPage() {
  return (
    <Suspense fallback={<ConversationListSkeleton />}>
      <ConversationsContent />
    </Suspense>
  );
}
