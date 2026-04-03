'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Mail, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/EmptyState';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { EmailThread } from '@/lib/types';

interface EmailsListClientProps {
  initialEmails: EmailThread[];
}

const classificationMap: Record<string, { label: string; color: string }> = {
  CUSTOMER: { label: 'Klant', color: 'text-primary bg-primary/10 border-primary/20' },
  SUPPLIER: { label: 'Leverancier', color: 'text-tertiary bg-tertiary/10 border-tertiary/20' },
  INTERNAL: { label: 'Intern', color: 'text-on-surface-variant bg-surface-container-high border-outline-variant/50' },
  SPAM: { label: 'Spam', color: 'text-error bg-error/10 border-error/20' },
  OTHER: { label: 'Overig', color: 'text-outline bg-outline/10 border-outline/20' },
};

function getClassificationDetails(c: string) {
  return classificationMap[c] || classificationMap.OTHER;
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
      toast.success('Email verwijderd');
    } catch {
      toast.error('Kon email niet verwijderen. Probeer opnieuw.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-headline font-extrabold text-2xl tracking-tight text-on-background flex items-center gap-2">
          <Mail className="h-6 w-6 text-tertiary" />
          E-mails
        </h1>
        <p className="font-label text-xs text-outline mt-1">
          Automatisch verwerkte en geclassificeerde e-mails. ({emails.length})
        </p>
      </div>

      <div className="bg-surface-container-low h-[1px] w-full" />

      {/* Email list */}
      {emails.length === 0 ? (
        <EmptyState
          message="Nog geen e-mails verwerkt"
          subMessage="Zodra er nieuwe e-mails binnenkomen, verschijnen ze hier."
        />
      ) : (
        <div className="space-y-3">
          {emails.map((email) => {
            const classInfo = getClassificationDetails(email.classification);
            return (
              <div
                key={email.id}
                className="bg-surface-container-lowest p-5 rounded-[1.5rem] shadow-ambient border border-outline-variant/10 group active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start justify-between">
                  {/* Email info */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight border ${classInfo.color}`}>
                        {classInfo.label}
                      </span>
                      <span className="font-label text-[11px] text-outline tracking-wider">
                        {format(new Date(email.processed_at), 'd MMM HH:mm', { locale: nl })}
                      </span>
                    </div>

                    <h3 className="font-headline font-bold text-on-background text-base mb-1 truncate">
                      {email.subject || '(Geen onderwerp)'}
                    </h3>
                    <p className="font-label text-xs text-on-surface-variant truncate">
                      <span className="font-bold text-on-background">{email.sender_name || email.sender_email || 'Onbekend'}</span>
                      {email.sender_name && email.sender_email && <span className="opacity-70"> · {email.sender_email}</span>}
                    </p>
                  </div>

                  {/* Delete button (shows on hover desktop, always mobile) */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => setDeleteTarget(email)}
                      className="p-3 bg-surface-container hover:bg-error/10 text-outline hover:text-error rounded-xl transition-colors md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                      aria-label="Verwijderen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={() => !isDeleting && setDeleteTarget(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 px-6 animate-slide-in">
            <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-elevated max-w-sm w-full p-6 text-center border border-outline-variant/20">
              <div className="mx-auto w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-4">
                <Trash2 className="h-6 w-6 text-error" />
              </div>

              <h3 className="font-headline font-bold text-lg text-on-background">
                E-mail verwijderen?
              </h3>
              <p className="font-body text-sm text-on-surface-variant mt-2 leading-relaxed">
                Dit verwijdert <strong>"{deleteTarget.subject || '(Geen onderwerp)'}"</strong> permanent.
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container hover:bg-surface-container-high rounded-xl transition-colors disabled:opacity-50"
                 >
                  Annuleren
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 font-label text-xs font-bold uppercase tracking-widest text-on-error bg-error hover:bg-error/90 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> ...</>
                  ) : (
                    'Verwijder'
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
