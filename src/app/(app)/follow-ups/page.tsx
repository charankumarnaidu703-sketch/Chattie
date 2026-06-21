import Link from 'next/link';
import { format, differenceInHours } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Clock, ArrowRight } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/EmptyState';
import { QualificationProgress } from '@/components/QualificationProgress';

import { PullToRefresh } from '@/components/PullToRefresh';

export const dynamic = 'force-dynamic';

function getUrgencyLevel(hours: number): { label: string; color: string } {
  if (hours >= 72) return { label: 'Critical', color: 'text-error bg-error/10 border-error/20' };
  if (hours >= 24) return { label: 'High', color: 'text-secondary bg-secondary/10 border-secondary/20' };
  return { label: 'Medium', color: 'text-outline bg-outline/10 border-outline/20' };
}

export default async function FollowUpsPage() {
  const supabase = await createServerSupabaseClient();
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

  const { data: staleConversations } = await supabase
    .from('conversations')
    .select('*, contacts(*)')
    .eq('status', 'active')
    .lte('updated_at', twelveHoursAgo)
    .eq('qualification_complete', false)
    .order('updated_at', { ascending: true });

  const conversations = staleConversations ?? [];

  return (
    <div className="max-w-3xl mx-auto w-full px-6 py-6 pb-28 md:pb-6">
      <PullToRefresh>
        <div className="space-y-6 fade-in-content">
        {/* Header */}
        <div>
          <h1 className="font-headline font-extrabold text-2xl tracking-tight text-on-background flex items-center gap-2">
            <Clock className="h-6 w-6 text-secondary" />
            Follow-ups
          </h1>
          <p className="font-label text-xs text-outline mt-1">
            Conversations that have had no response for more than 12 hours.
          </p>
        </div>

        <div className="bg-surface-container-low h-[1px] w-full" />

        {conversations.length === 0 ? (
          <EmptyState
            message="No follow-ups needed"
            subMessage="All conversations are up-to-date! 🎉"
          />
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => {
              const contact = conv.contacts as { name: string | null; phone: string } | null;
              const hoursAgo = differenceInHours(new Date(), new Date(conv.updated_at));
              const urgency = getUrgencyLevel(hoursAgo);

              return (
                <Link key={conv.id} href={`/conversations/${conv.id}`} className="block stagger-item">
                  <div className="bg-surface-container-lowest p-5 rounded-[1.5rem] shadow-ambient border border-outline-variant/10 active:scale-[0.98] transition-transform">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-headline font-bold text-on-background">
                          {contact?.name || contact?.phone || 'Unknown'}
                        </span>
                        <p className="font-label text-[11px] text-outline tracking-wider mt-0.5">
                          Last message: {format(new Date(conv.updated_at), 'd MMM HH:mm', { locale: enUS })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight border ${urgency.color}`}>
                          {urgency.label} — {hoursAgo}h
                        </span>
                        <ArrowRight className="h-4 w-4 text-outline" />
                      </div>
                    </div>

                    <QualificationProgress
                      currentStep={conv.qualification_step || 1}
                      color={hoursAgo >= 72 ? 'secondary' : 'primary'}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      </PullToRefresh>
    </div>
  );
}
