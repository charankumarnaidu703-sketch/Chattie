import { Suspense } from 'react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Clock, AlertTriangle, Bell, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { DashboardSkeleton } from '@/components/LoadingSkeleton';
import { QUALIFICATION_STEPS } from '@/lib/types';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

async function FollowUpsContent() {
  const supabase = await createServerSupabaseClient();

  const { data: conversations } = await supabase
    .from('conversations')
    .select('*, contacts(*)')
    .eq('qualification_complete', false)
    .eq('status', 'active')
    .eq('bot_paused', false)
    .order('updated_at', { ascending: true });

  const staleConversations = (conversations ?? []).filter((c) => {
    const lastUpdate = new Date(c.updated_at);
    const hoursSince = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
    return hoursSince >= 12; // Show after 12h (before 24h reminder)
  });

  const getStepInfo = (step: number) => {
    return QUALIFICATION_STEPS.find((s) => s.step === step) || QUALIFICATION_STEPS[0];
  };

  const getUrgencyColor = (hours: number) => {
    if (hours >= 72) return 'bg-red-100 text-red-700 border-red-200';
    if (hours >= 24) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  const getUrgencyLabel = (hours: number) => {
    if (hours >= 72) return 'Urgent';
    if (hours >= 24) return 'Follow-up nodig';
    return 'Binnenkort';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-6 w-6 text-orange-500" />
            Follow-ups
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gesprekken die wachten op een reactie van de klant.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <AlertTriangle className="h-4 w-4" />
          {staleConversations.length} wachtend
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '> 12 uur', count: staleConversations.filter((c) => { const h = (Date.now() - new Date(c.updated_at).getTime()) / 3600000; return h >= 12 && h < 24; }).length, color: 'border-l-yellow-400' },
          { label: '> 24 uur', count: staleConversations.filter((c) => { const h = (Date.now() - new Date(c.updated_at).getTime()) / 3600000; return h >= 24 && h < 72; }).length, color: 'border-l-orange-400' },
          { label: '> 72 uur', count: staleConversations.filter((c) => (Date.now() - new Date(c.updated_at).getTime()) / 3600000 >= 72).length, color: 'border-l-red-400' },
        ].map((stat) => (
          <Card key={stat.label} className={`border-l-4 ${stat.color}`}>
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conversations list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Wachtende gesprekken</CardTitle>
          <Link href="/conversations">
            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
              Alle gesprekken <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {staleConversations.length === 0 ? (
            <EmptyState
              icon={Clock}
              message="Geen follow-ups nodig"
              subMessage="Alle klanten reageren op tijd! 🎉"
            />
          ) : (
            <div className="space-y-3">
              {staleConversations.map((conv) => {
                const contact = conv.contacts as { name: string | null; phone: string } | null;
                const hoursSince = (Date.now() - new Date(conv.updated_at).getTime()) / (1000 * 60 * 60);
                const stepInfo = getStepInfo(conv.qualification_step || 1);
                const remindersSent = (conv as Record<string, unknown>).reminders_sent as number || 0;

                return (
                  <Link
                    key={conv.id}
                    href={`/conversations/${conv.id}`}
                    className="block"
                  >
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all">
                      {/* Urgency indicator */}
                      <div className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(hoursSince)}`}>
                        {getUrgencyLabel(hoursSince)}
                      </div>

                      {/* Contact info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {contact?.name || contact?.phone || 'Onbekend'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Laatste activiteit: {formatDistanceToNow(new Date(conv.updated_at), { locale: nl, addSuffix: true })}
                        </p>
                      </div>

                      {/* Current step */}
                      <div className="text-center hidden sm:block">
                        <p className="text-lg">{stepInfo.icon}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Stap {conv.qualification_step || 1}/5</p>
                      </div>

                      {/* Reminders sent */}
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Bell className="h-3.5 w-3.5" />
                        <span>{remindersSent}/2</span>
                      </div>

                      {/* Time */}
                      <div className="text-xs text-gray-400 hidden md:block">
                        {format(new Date(conv.updated_at), 'd MMM HH:mm', { locale: nl })}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function FollowUpsPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <FollowUpsContent />
    </Suspense>
  );
}
