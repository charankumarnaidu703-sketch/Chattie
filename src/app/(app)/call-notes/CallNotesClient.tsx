'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { env } from '@/lib/env';

// Types for what we receive from the server
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
  { value: 'interested', label: 'Geïnteresseerd', icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
  { value: 'callback', label: 'Terugbellen', icon: Phone, color: 'text-blue-600 bg-blue-50' },
  { value: 'voicemail', label: 'Voicemail', icon: Voicemail, color: 'text-orange-600 bg-orange-50' },
  { value: 'no_answer', label: 'Niet opgenomen', icon: PhoneMissed, color: 'text-gray-600 bg-gray-50' },
  { value: 'not_interested', label: 'Niet geïnteresseerd', icon: PhoneOff, color: 'text-red-600 bg-red-50' },
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

  // Form state
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
      toast.error('Selecteer een contact en vul notities in.');
      return;
    }

    setIsSaving(true);

    // Find matching conversation for this contact
    const matchingConversation = conversations.find(
      (c) => c.contact_id === selectedContactId
    );

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

      // Build optimistic note
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
      toast.success('Belnotitie opgeslagen en email verstuurd!');
      resetForm();
    } catch {
      toast.error('Kon belnotitie niet opslaan. Probeer opnieuw.');
    } finally {
      setIsSaving(false);
    }
  };

  const getOutcomeInfo = (outcomeValue: string | null) => {
    return OUTCOMES.find((o) => o.value === outcomeValue) || OUTCOMES[3];
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Phone className="h-6 w-6 text-green-500" />
            Belnotities
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {notes.length} notities
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors active:scale-95"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Sluiten' : 'Nieuwe notitie'}
        </button>
      </div>

      {/* New Note Form */}
      {showForm && (
        <div className="rounded-xl border border-green-200 bg-green-50/50 p-4 space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm">Nieuwe belnotitie</h3>

          {/* Contact selector */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Contact</label>
            <select
              value={selectedContactId}
              onChange={(e) => setSelectedContactId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Selecteer een contact...</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name || 'Naamloos'} — {contact.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Outcome selector */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Uitkomst</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {OUTCOMES.map((o) => {
                const Icon = o.icon;
                const isSelected = outcome === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setOutcome(o.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? `${o.color} border-current ring-1 ring-current`
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes textarea */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notities</label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Beschrijf het gesprek..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Follow-up date */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vervolgdatum (optioneel)</label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Save button */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedContactId || !noteText.trim() || isSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Opslaan & emailen
            </button>
          </div>
        </div>
      )}

      {/* Notes list */}
      {notes.length === 0 ? (
        <EmptyState
          icon={Phone}
          message="Nog geen belnotities"
          subMessage="Maak uw eerste belnotitie aan na het bellen van een lead."
        />
      ) : (
        <div className="space-y-2">
          {notes.map((note) => {
            const outcomeInfo = getOutcomeInfo(note.outcome);
            const OutcomeIcon = outcomeInfo.icon;
            const contactName = note.contacts?.name || 'Onbekend';
            const contactPhone = note.contacts?.phone || '';

            return (
              <div
                key={note.id}
                className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Outcome icon */}
                  <div className={`flex-shrink-0 p-2 rounded-lg ${outcomeInfo.color}`}>
                    <OutcomeIcon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-gray-900 text-sm">{contactName}</span>
                      {contactPhone && (
                        <span className="text-xs text-gray-400">{contactPhone}</span>
                      )}
                      <Badge variant="outline" className="text-[10px]">
                        {outcomeInfo.label}
                      </Badge>
                      {note.gmail_sent && (
                        <Badge variant="success" className="text-[10px]">📧 Email verstuurd</Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                      {note.notes}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>
                        {format(new Date(note.created_at), 'd MMM yyyy HH:mm', { locale: nl })}
                      </span>
                      {note.follow_up_date && (
                        <span className="flex items-center gap-1 text-blue-500">
                          <Clock className="h-3 w-3" />
                          Vervolg: {format(new Date(note.follow_up_date), 'd MMM yyyy', { locale: nl })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
