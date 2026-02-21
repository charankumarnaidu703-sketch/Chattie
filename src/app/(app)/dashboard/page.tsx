import { Suspense } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { CheckCircle2, Mail, MessageSquare, ArrowRight, Activity, Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { DashboardSkeleton } from '@/components/LoadingSkeleton';
import { getEventIcon } from '@/lib/types';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

async function DashboardContent() {
  const supabase = await createServerSupabaseClient();

  // Today's date boundaries
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Fetch all data in parallel
  const [leadsResult, activeResult, emailResult, eventsResult] = await Promise.all([
    // Today's qualified leads
    supabase
      .from('conversations')
      .select('*, contacts(*)')
      .eq('qualification_complete', true)
      .gte('updated_at', startOfToday.toISOString())
      .order('updated_at', { ascending: false }),
    // Active bot conversations count
    supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('bot_paused', false),
    // Email stats (last 7 days)
    supabase
      .from('email_threads')
      .select('classification')
      .gte('processed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    // Recent system events
    supabase
      .from('system_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const todaysLeads = leadsResult.data ?? [];
  const activeCount = activeResult.count ?? 0;
  const emailStats = emailResult.data ?? [];
  const recentEvents = eventsResult.data ?? [];

  const customerEmails = emailStats.filter((e) => e.classification === 'CUSTOMER').length;
  const totalEmails = emailStats.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-500" />
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {format(new Date(), "EEEE d MMMM yyyy", { locale: nl })}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Leads today */}
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Nieuwe leads vandaag</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{todaysLeads.length}</p>
                <p className="text-xs text-gray-400 mt-1">Laatste 24 uur</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emails processed */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Emails verwerkt</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalEmails}</p>
                <p className="text-xs text-gray-400 mt-1">{customerEmails} klanten — laatste 7 dagen</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active conversations */}
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Actieve gesprekken</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{activeCount}</p>
                <p className="text-xs text-gray-400 mt-1">Bot staat aan</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Leads Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Leads van vandaag</CardTitle>
          <Link href="/conversations">
            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
              Alle gesprekken <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {todaysLeads.length === 0 ? (
            <EmptyState
              icon={Leaf}
              message="Nog geen leads vandaag"
              subMessage="De bot staat klaar! 🌿 Zodra een klant via WhatsApp alle informatie geeft, verschijnt de lead hier."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Naam</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Telefoon</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500 hidden sm:table-cell">Adres</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500 hidden md:table-cell">Afmetingen</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500 hidden lg:table-cell">Tijd</th>
                  </tr>
                </thead>
                <tbody>
                  {todaysLeads.map((lead) => {
                    const contact = lead.contacts as { name: string | null; phone: string } | null;
                    return (
                      <tr
                        key={lead.id}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-2 font-medium text-gray-900">
                          <Link
                            href={`/conversations/${lead.id}`}
                            className="hover:text-green-600 transition-colors"
                          >
                            {contact?.name || contact?.phone || 'Onbekend'}
                          </Link>
                        </td>
                        <td className="py-3 px-2">
                          <a
                            href={`tel:${lead.collected_phone || contact?.phone || ''}`}
                            className="text-green-600 hover:text-green-700 font-medium"
                          >
                            {lead.collected_phone || contact?.phone || '-'}
                          </a>
                        </td>
                        <td className="py-3 px-2 text-gray-600 hidden sm:table-cell max-w-[200px] truncate">
                          {lead.collected_address || '-'}
                        </td>
                        <td className="py-3 px-2 text-gray-600 hidden md:table-cell">
                          {lead.collected_dimensions || '-'}
                        </td>
                        <td className="py-3 px-2 text-gray-400 hidden lg:table-cell">
                          {format(new Date(lead.updated_at), 'HH:mm')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-400" />
            Recente activiteit
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Nog geen activiteit</p>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 text-sm">
                  <span className="text-lg flex-shrink-0">{getEventIcon(event.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700">{event.description || event.type}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {format(new Date(event.created_at), 'd MMM HH:mm', { locale: nl })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
