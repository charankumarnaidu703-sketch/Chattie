'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Mail, Inbox, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getClassificationColor } from '@/lib/types';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { EmailThread } from '@/lib/types';

interface EmailsListClientProps {
  initialEmails: EmailThread[];
}

export function EmailsListClient({ initialEmails }: EmailsListClientProps) {
  const [emails, setEmails] = useState<EmailThread[]>(initialEmails);
  const [deleteTarget, setDeleteTarget] = useState<EmailThread | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = getSupabaseClient();

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('email_threads')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .delete()
        .eq('id', deleteTarget.id) as any;

      if (error) throw error;

      // Remove from local state
      setEmails((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success('Email verwijderd uit database');
    } catch {
      toast.error('Kon email niet verwijderen. Probeer opnieuw.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Mail className="h-6 w-6 text-blue-500" />
          Emails
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {emails.length} verwerkte emails
        </p>
      </div>

      {emails.length === 0 ? (
        <EmptyState
          icon={Inbox}
          message="Nog geen emails verwerkt"
          subMessage="Zodra de Gmail-poller draait, verschijnen geclassificeerde emails hier."
        />
      ) : (
        <div className="space-y-2">
          {emails.map((email) => (
            <Card key={email.id} className="hover:shadow-sm transition-shadow group">
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

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-400 tabular-nums">
                      {format(new Date(email.processed_at), 'd MMM HH:mm', { locale: nl })}
                    </span>
                    <button
                      onClick={() => setDeleteTarget(email)}
                      className="group/del relative p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50/50 hover:shadow-sm hover:shadow-red-100/50 transition-all duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 active:scale-95 border border-gray-100 md:border-transparent hover:border-red-100"
                      title="Verwijderen"
                    >
                      <Trash2 className="h-5 w-5 transition-transform group-hover/del:rotate-3" />
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/del:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block">
                        Verwijderen
                      </span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Email verwijderen?"
        description={`Dit verwijdert "${deleteTarget?.subject || '(geen onderwerp)'}" permanent uit de database. Deze actie kan niet ongedaan worden gemaakt.`}
        confirmLabel="Verwijderen"
        cancelLabel="Annuleren"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
