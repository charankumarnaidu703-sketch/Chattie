import { Suspense } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Mail, Inbox } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { getClassificationColor } from '@/lib/types';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';

function EmailsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-xl border bg-white p-4">
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-3 w-32 mb-1" />
          <Skeleton className="h-3 w-64" />
        </div>
      ))}
    </div>
  );
}

async function EmailsContent() {
  const supabase = await createServerSupabaseClient();

  const { data: emails } = await supabase
    .from('email_threads')
    .select('*')
    .order('processed_at', { ascending: false })
    .limit(50);

  const emailList = emails ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Mail className="h-6 w-6 text-blue-500" />
          Emails
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {emailList.length} verwerkte emails
        </p>
      </div>

      {emailList.length === 0 ? (
        <EmptyState
          icon={Inbox}
          message="Nog geen emails verwerkt"
          subMessage="Zodra de Gmail-poller draait, verschijnen geclassificeerde emails hier."
        />
      ) : (
        <div className="space-y-2">
          {emailList.map((email) => (
            <Card key={email.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={getClassificationColor(email.classification)}
                        variant="outline"
                      >
                        {email.classification}
                      </Badge>
                      {email.draft_created && (
                        <Badge variant="info">📝 Concept</Badge>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm truncate">
                      {email.subject || '(geen onderwerp)'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {email.sender_name || email.sender_email || 'Onbekend'}
                      {email.sender_name && email.sender_email && (
                        <span className="text-gray-400"> · {email.sender_email}</span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                    {format(new Date(email.processed_at), 'd MMM HH:mm', { locale: nl })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EmailsPage() {
  return (
    <Suspense fallback={<EmailsSkeleton />}>
      <EmailsContent />
    </Suspense>
  );
}
