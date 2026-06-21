import { Suspense } from 'react';
import { ConversationsListClient } from './ConversationsListClient';
import { ConversationListSkeleton } from '@/components/LoadingSkeleton';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { PullToRefresh } from '@/components/PullToRefresh';

export const dynamic = 'force-dynamic';

async function ConversationsContent() {
  const supabase = await createServerSupabaseClient();

  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      contacts(*),
      messages(*)
    `)
    .order('updated_at', { ascending: false })
    .limit(50);

  // Sort messages within each conversation (most recent first for preview)
  const conversationsWithSortedMessages = (conversations ?? []).map((conv) => ({
    ...conv,
    messages: [...(conv.messages ?? [])].sort(
      (a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
    ),
  }));

  return <ConversationsListClient conversations={conversationsWithSortedMessages} />;
}

export default function ConversationsPage() {
  return (
    <div className="max-w-3xl mx-auto w-full px-6 py-6 pb-28 md:pb-6">
      <PullToRefresh>
        <Suspense fallback={<ConversationListSkeleton />}>
          <ConversationsContent />
        </Suspense>
      </PullToRefresh>
    </div>
  );
}
