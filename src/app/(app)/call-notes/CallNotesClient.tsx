'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import {
  Phone,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  PhoneOff,
  Voicemail,
  PhoneMissed,
  Send,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { env } from '@/lib/env';
import { getSupabaseClient } from '@/lib/supabase/client';

interface ContactBasic {
  id: string;
  name: string | null;
  phone: string;
}

interface ConversationBasic {
  id: string;
  contact_id: string;
  status: string;
}

interface CallNoteWithContact {
  id: string;
  contact_id: string;
  conversation_id: string | null;
  notes: string;
  outcome: string | null;
  follow_up_date: string | null;
  gmail_sent: boolean;
  created_at: string;
  contacts: { name: string | null; phone: string } | null;
}

const OUTCOMES = [
  { value: 'interested', label: 'Interested', icon: CheckCircle2, color: 'text-primary bg-primary/10 border-primary/20 ring-primary' },
  { value: 'callback', label: 'Callback', icon: Phone, color: 'text-tertiary bg-tertiary/10 border-tertiary/20 ring-tertiary' },
  { value: 'voicemail', label: 'Voicemail', icon: Voicemail, color: 'text-secondary bg-secondary/10 border-secondary/20 ring-secondary' },
  { value: 'no_answer', label: 'No Answer', icon: PhoneMissed, color: 'text-on-surface-variant bg-surface-container-highest border-outline-variant/30 ring-on-surface-variant' },
  { value: 'not_interested', label: 'Not Interested', icon: PhoneOff, color: 'text-error bg-error/10 border-error/20 ring-error' },
];

interface CallNotesClientProps {
  initialNotes: CallNoteWithContact[];
  contacts: ContactBasic[];
  conversations: ConversationBasic[];
}

export function CallNotesClient({ initialNotes, contacts, conversations }: CallNotesClientProps) {
  const [notes, setNotes] = useState<CallNoteWithContact[]>(initialNotes);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CallNoteWithContact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = getSupabaseClient();

  const [selectedContactId, setSelectedContactId] = useState('');
  const [noteText, setNoteText] = useState('');
  const [outcome, setOutcome] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const resetForm = () => {
    setSelectedContactId('');
    setNoteText('');
    setOutcome('');
    setFollowUpDate('');
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!selectedContactId || !noteText.trim()) {
      toast.error('Please select a contact and enter some notes.');
      return;
    }

    setIsSaving(true);
    const matchingConversation = conversations.find((c) => c.contact_id === selectedContactId);

    try {
      const response = await fetch(env.n8nCallNoteUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: selectedContactId,
          conversationId: matchingConversation?.id || '',
          notes: noteText.trim(),
          outcome: outcome || 'callback',
          followUpDate: followUpDate || null,
        }),
      });

      if (!response.ok) throw new Error('Webhook failed');

      const contact = contacts.find((c) => c.id === selectedContactId);
      const optimisticNote: CallNoteWithContact = {
        id: `temp-${Date.now()}`,
        contact_id: selectedContactId,
        conversation_id: matchingConversation?.id || null,
        notes: noteText.trim(),
        outcome: outcome || 'callback',
        follow_up_date: followUpDate || null,
        gmail_sent: false,
        created_at: new Date().toISOString(),
        contacts: contact ? { name: contact.name, phone: contact.phone } : null,
      };

      setNotes((prev) => [optimisticNote, ...prev]);
      toast.success('Call note saved and email sent!');
      resetForm();
    } catch {
      toast.error('Could not save the call note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('call_notes').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      setNotes((prev) => prev.filter((n) => n.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success('Call note deleted');
    } catch {
      toast.error('Could not delete the note.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getOutcomeInfo = (outcomeValue: string | null) => {
    return OUTCOMES.find((o) => o.value === outcomeValue) || OUTCOMES[3];
  };

  return (
    <div className="space-y-6 fade-in-content">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline font-extrabold text-2xl tracking-tight text-on-background flex items-center gap-2">
            <Phone className="h-6 w-6 text-primary" />
            Call Notes
          </h1>
          <p className="font-label text-xs text-outline mt-1">
            Conversation reports and follow-ups. ({notes.length})
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-4 py-2.5 font-label text-xs font-bold uppercase tracking-widest rounded-full transition-all active:scale-95 ${
            showForm
              ? 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              : 'bg-primary hover:bg-primary-container text-on-primary shadow-ambient'
          }`}
        >
          {showForm ? <><X className="h-4 w-4" /> Close</> : <><Plus className="h-4 w-4" /> New</>}
        </button>
      </div>

      <div className="bg-surface-container-low h-[1px] w-full" />

      {/* New Note Form */}
      {showForm && (
        <div className="bg-surface-container-lowest p-6 rounded-[1.5rem] shadow-ambient border border-primary/20 space-y-5 animate-slide-in">
          <h3 className="font-headline font-bold text-lg text-on-background">New Call Note</h3>

          {/* Contact selector */}
          <div>
            <label htmlFor="contact-select" className="block font-label text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Contact</label>
            <select
              id="contact-select"
              value={selectedContactId}
              onChange={(e) => setSelectedContactId(e.target.value)}
              className="w-full bg-surface-container-highest rounded-xl px-4 py-3.5 text-sm font-medium text-on-background border-none outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-h-[44px]"
            >
              <option value="">Select a contact...</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name || 'Unnamed'} — {contact.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Outcome selector */}
          <div>
            <label className="block font-label text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Outcome</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {OUTCOMES.map((o) => {
                const Icon = o.icon;
                const isSelected = outcome === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setOutcome(o.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border min-h-[44px] cursor-pointer ${
                      isSelected
                        ? `${o.color} ring-1`
                        : 'bg-surface-container-highest text-on-surface-variant border-transparent hover:bg-surface-container-high'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes textarea */}
          <div>
            <label htmlFor="notes-textarea" className="block font-label text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Notes</label>
            <textarea
              id="notes-textarea"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Describe the conversation..."
              rows={4}
              className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm font-medium text-on-background placeholder:text-on-surface-variant/50 border-none outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Follow-up date */}
          <div>
            <label htmlFor="followup-date" className="block font-label text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Follow-up Date (optional)</label>
            <input
              id="followup-date"
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm font-medium text-on-background border-none outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={resetForm}
              className="px-6 py-3 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container hover:bg-surface-container-high rounded-full transition-colors active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedContactId || !noteText.trim() || isSaving}
              className="flex items-center gap-2 px-6 py-3 font-label text-xs font-bold uppercase tracking-widest text-on-primary bg-primary hover:bg-primary-container rounded-full transition-colors active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Save & Email
            </button>
          </div>
        </div>
      )}

      {/* Notes list */}
      {notes.length === 0 ? (
        <EmptyState
          message="No call notes yet"
          subMessage="Create your first call note after calling a client."
        />
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const outcomeInfo = getOutcomeInfo(note.outcome);
            const OutcomeIcon = outcomeInfo.icon;
            const contactName = note.contacts?.name || 'Unknown';
            const contactPhone = note.contacts?.phone || '';

            return (
              <div
                key={note.id}
                className="bg-surface-container-lowest p-5 rounded-[1.5rem] shadow-ambient border border-outline-variant/10 group active:scale-[0.99] transition-transform flex items-start gap-4 stagger-item"
              >
                <div className={`flex-shrink-0 p-3 rounded-xl ${outcomeInfo.color}`}>
                  <OutcomeIcon className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-headline font-bold text-on-background text-base">{contactName}</span>
                    {contactPhone && <span className="font-mono text-xs text-outline">{contactPhone}</span>}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight border ${outcomeInfo.color}`}>
                      {outcomeInfo.label}
                    </span>
                    {note.gmail_sent && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight border border-tertiary/20 bg-tertiary/10 text-tertiary">
                        📧 Email sent
                      </span>
                    )}
                  </div>

                  <p className="font-body text-sm text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                    {note.notes}
                  </p>

                  <div className="flex items-center gap-4 mt-4">
                    <span className="font-label text-[10px] font-bold text-outline uppercase tracking-widest">
                      {format(new Date(note.created_at), 'd MMM yyyy HH:mm', { locale: enUS })}
                    </span>
                    {note.follow_up_date && (
                      <span className="font-label text-[10px] font-bold text-tertiary uppercase tracking-widest flex items-center gap-1 bg-tertiary/5 px-2 py-0.5 rounded-md">
                        <Clock className="h-3 w-3" />
                        Follow-up: {format(new Date(note.follow_up_date), 'd MMM yyyy', { locale: enUS })}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setDeleteTarget(note)}
                  className="h-11 w-11 flex items-center justify-center bg-surface-container hover:bg-error/10 text-outline hover:text-error rounded-xl transition-colors md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 flex-shrink-0"
                  aria-label={`Delete call note for ${contactName}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete note?"
        description="This permanently deletes this call note from the database."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}
