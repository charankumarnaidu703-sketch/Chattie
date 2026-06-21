import { Suspense } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { CheckCircle2, ArrowRight, Activity, MapPin } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { DashboardSkeleton } from '@/components/LoadingSkeleton';
import { getEventIcon } from '@/lib/types';
import { createServerSupabaseClient } from '@/lib/supabase/server';

import { WelcomeBanner } from '@/components/WelcomeBanner';

export const dynamic = 'force-dynamic';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Goedemorgen';
  if (hour < 18) return 'Goedemiddag';
  return 'Goedenavond';
}

async function DashboardContent() {
  const supabase = await createServerSupabaseClient();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [leadsResult, activeResult, pausedResult, emailResult, eventsResult, attentionResult] = await Promise.all([
    supabase
      .from('conversations')
      .select('*, contacts(*)')
      .eq('qualification_complete', true)
      .gte('updated_at', startOfToday.toISOString())
      .order('updated_at', { ascending: false }),
    supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('bot_paused', false),
    supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('bot_paused', true),
    supabase
      .from('email_threads')
      .select('classification')
      .gte('processed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('system_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('conversations')
      .select('*, contacts(*)')
      .eq('bot_paused', true)
      .order('updated_at', { ascending: false })
      .limit(3),
  ]);

  const todaysLeads = leadsResult.data ?? [];
  const activeCount = activeResult.count ?? 0;
  const pausedCount = pausedResult.count ?? 0;
  const emailStats = emailResult.data ?? [];
  const recentEvents = eventsResult.data ?? [];
  const attentionItems = attentionResult.data ?? [];
  const totalEmails = emailStats.length;

  return (
    <div className="space-y-10 fade-in-content">
      {/* Editorial Header */}
      <div>
        <h2 className="font-headline font-extrabold text-3xl tracking-tight text-on-background">
          {getGreeting()} 🌿
        </h2>
        <p className="font-label text-xs font-bold uppercase tracking-widest text-outline mt-1">
          {format(new Date(), "EEEE, d MMMM", { locale: nl })}
        </p>
      </div>

      {/* Tonal Separation */}
      <div className="bg-surface-container-low h-[1px] w-full -my-4" />

      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* Stats Bento Grid (2x2) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-[1.5rem] border-t-4 border-primary shadow-ambient">
          <span className="block font-headline font-bold text-3xl text-on-background">{todaysLeads.length}</span>
          <span className="font-label text-[10px] font-bold uppercase tracking-widest text-outline">Leads vandaag</span>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-[1.5rem] border-t-4 border-tertiary shadow-ambient">
          <span className="block font-headline font-bold text-3xl text-on-background">{totalEmails}</span>
          <span className="font-label text-[10px] font-bold uppercase tracking-widest text-outline">E-mails</span>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-[1.5rem] border-t-4 border-primary-fixed-dim shadow-ambient">
          <span className="block font-headline font-bold text-3xl text-on-background">{activeCount}</span>
          <span className="font-label text-[10px] font-bold uppercase tracking-widest text-outline">Bot actief</span>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-[1.5rem] border-t-4 border-secondary shadow-ambient">
          <span className="block font-headline font-bold text-3xl text-on-background">{pausedCount}</span>
          <span className="font-label text-[10px] font-bold uppercase tracking-widest text-outline">Gepauzeerd</span>
        </div>
      </div>

      {/* Attention Needed */}
      {attentionItems.length > 0 && (
        <section>
          <h3 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 ml-1">
            Aandacht nodig
          </h3>
          <div className="space-y-3">
            {attentionItems.map((item) => {
              const contact = item.contacts as { name: string | null; phone: string } | null;
              return (
                <div
                  key={item.id}
                  className="bg-secondary/5 border-l-4 border-secondary p-5 rounded-xl flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-headline font-bold text-on-background">
                        {contact?.name || contact?.phone || 'Onbekend'}
                      </span>
                      <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight">
                        Bot gepauzeerd
                      </span>
                    </div>
                    <div className="flex items-center text-outline text-xs font-medium">
                      🕐 {format(new Date(item.updated_at), 'HH:mm')}
                    </div>
                  </div>
                  <Link
                    href={`/conversations/${item.id}`}
                    className="bg-primary hover:bg-primary-container text-white text-xs font-bold px-4 py-2 rounded-full transition-all active:scale-95"
                  >
                    Hervat bot
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Today's Leads */}
      <section>
        <div className="flex justify-between items-center mb-4 ml-1">
          <h3 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Leads vandaag
          </h3>
          <Link href="/conversations" className="text-primary font-bold text-xs">
            Alles tonen
          </Link>
        </div>
        {todaysLeads.length === 0 ? (
          <EmptyState
            message="Nog geen leads vandaag"
            subMessage="De bot staat klaar! 🌿 Zodra een klant via WhatsApp alle informatie geeft, verschijnt de lead hier."
          />
        ) : (
          <div className="space-y-3">
            {todaysLeads.map((lead) => {
              const contact = lead.contacts as { name: string | null; phone: string } | null;
              return (
                <Link key={lead.id} href={`/conversations/${lead.id}`} className="block">
                  <div className="bg-surface-container-low hover:bg-surface-container transition-colors p-5 rounded-[1.5rem] flex items-center gap-4">
                    <div className="bg-primary/10 text-primary w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-headline font-bold text-on-background text-lg leading-none mb-1">
                            {contact?.name || contact?.phone || 'Onbekend'}
                          </p>
                          <p className="font-mono text-xs text-outline tracking-wider">
                            {contact?.phone || '-'}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-outline flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        {lead.collected_address && (
                          <span className="text-xs text-on-surface-variant flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {lead.collected_address}
                          </span>
                        )}
                        {lead.collected_dimensions && (
                          <span className="bg-white/50 text-[10px] font-bold px-2 py-0.5 rounded-md border border-outline-variant/20 uppercase">
                            {lead.collected_dimensions}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <section>
        <h3 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 ml-1 flex items-center gap-2">
          <Activity className="h-4 w-4 text-outline" />
          Recente activiteit
        </h3>
        {recentEvents.length === 0 ? (
          <p className="text-sm text-outline text-center py-4">Nog geen activiteit</p>
        ) : (
          <div className="space-y-3">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 text-sm">
                <span className="text-lg flex-shrink-0">{getEventIcon(event.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-on-surface-variant">{event.description || event.type}</p>
                  <p className="font-label text-[10px] text-outline mt-0.5">
                    {format(new Date(event.created_at), 'd MMM HH:mm', { locale: nl })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-6 pb-28 md:pb-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
