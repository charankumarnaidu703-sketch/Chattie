import Link from 'next/link';
import { format, differenceInHours } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Clock, ArrowRight } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/EmptyState';
import { QualificationProgress } from '@/components/QualificationProgress';

export const dynamic = 'force-dynamic';

function getUrgencyLevel(hours: number): { label: string; color: string } {
  if (hours >= 72) return { label: 'Kritiek', color: 'text-error bg-error/10 border-error/20' };
  if (hours >= 24) return { label: 'Hoog', color: 'text-secondary bg-secondary/10 border-secondary/20' };
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-headline font-extrabold text-2xl tracking-tight text-on-background flex items-center gap-2">
          <Clock className="h-6 w-6 text-secondary" />
          Follow-ups
        </h1>
        <p className="font-label text-xs text-outline mt-1">
          Gesprekken die langer dan 12 uur geen reactie hebben gehad.
        </p>
      </div>

      <div className="bg-surface-container-low h-[1px] w-full" />

      {conversations.length === 0 ? (
        <EmptyState
          message="Geen follow-ups nodig"
          subMessage="Alle gesprekken zijn up-to-date! 🎉"
        />
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => {
            const contact = conv.contacts as { name: string | null; phone: string } | null;
            const hoursAgo = differenceInHours(new Date(), new Date(conv.updated_at));
            const urgency = getUrgencyLevel(hoursAgo);

            return (
              <Link key={conv.id} href={`/conversations/${conv.id}`} className="block">
                <div className="bg-surface-container-lowest p-5 rounded-[1.5rem] shadow-ambient border border-outline-variant/10 active:scale-[0.98] transition-transform">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-headline font-bold text-on-background">
                        {contact?.name || contact?.phone || 'Onbekend'}
                      </span>
                      <p className="font-label text-[11px] text-outline tracking-wider mt-0.5">
                        Laatste bericht: {format(new Date(conv.updated_at), 'd MMM HH:mm', { locale: nl })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight border ${urgency.color}`}>
                        {urgency.label} — {hoursAgo}u
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
  );
}
