'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Mail, Inbox, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
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

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('email_threads')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) throw error;

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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Mail className="h-6 w-6 text-blue-500" />
          Emails
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {emails.length} verwerkte emails
        </p>
      </div>

      {/* Email list */}
      {emails.length === 0 ? (
        <EmptyState
          icon={Inbox}
          message="Nog geen emails verwerkt"
          subMessage="Zodra de Gmail-poller draait, verschijnen geclassificeerde emails hier."
        />
      ) : (
        <div className="space-y-2">
          {emails.map((email) => (
            <div
              key={email.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow p-4"
            >
              <div className="flex items-start gap-3">
                {/* Email info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge
                      className={getClassificationColor(email.classification)}
                      variant="outline"
                    >
                      {email.classification}
                    </Badge>
                    {email.draft_created && (
                      <Badge variant="info">📝 Concept</Badge>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">
                      {format(new Date(email.processed_at), 'd MMM HH:mm', { locale: nl })}
                    </span>
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

                {/* Delete button — always visible */}
                <button
                  onClick={() => setDeleteTarget(email)}
                  className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
                  aria-label="Verwijderen"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => !isDeleting && setDeleteTarget(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
              {/* Warning icon */}
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Email verwijderen?
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  Dit verwijdert <strong>&quot;{deleteTarget.subject || '(geen onderwerp)'}&quot;</strong> permanent
                  uit de database. Deze actie kan niet ongedaan worden gemaakt.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Bezig...
                    </>
                  ) : (
                    'Verwijderen'
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
