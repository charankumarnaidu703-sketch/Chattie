import { Database } from './database.types';

// Table row types
export type Contact = Database['public']['Tables']['contacts']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type EmailThread = Database['public']['Tables']['email_threads']['Row'];
export type EmailMessage = Database['public']['Tables']['email_messages']['Row'];
export type CallNote = Database['public']['Tables']['call_notes']['Row'];
export type SystemEvent = Database['public']['Tables']['system_events']['Row'];

// Joined types used in UI
export type ConversationWithContact = Conversation & {
  contacts: Contact;
};

export type ConversationWithMessages = Conversation & {
  contacts: Contact;
  messages: Message[];
};

export type EmailThreadWithContact = EmailThread & {
  contacts: Contact | null;
};

export type EmailThreadWithMessages = EmailThread & {
  contacts: Contact | null;
  email_messages: EmailMessage[];
};

// Qualification step metadata
export const QUALIFICATION_STEPS = [
  { step: 1, label: 'Adres', field: 'collected_address' as const, icon: '📍' },
  { step: 2, label: 'Wensen', field: 'collected_wishes' as const, icon: '🌿' },
  { step: 3, label: 'Afmetingen', field: 'collected_dimensions' as const, icon: '📐' },
  { step: 4, label: "Foto's", field: 'collected_photos' as const, icon: '📷' },
  { step: 5, label: 'E-mail', field: 'collected_email' as const, icon: '📧' },
] as const;

// Badge color helpers
export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'paused':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'qualified':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'closed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Actief';
    case 'paused':
      return 'Gepauzeerd';
    case 'qualified':
      return 'Gekwalificeerd';
    case 'closed':
      return 'Gesloten';
    default:
      return status;
  }
}

export function getClassificationColor(classification: string): string {
  switch (classification) {
    case 'CUSTOMER':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'SUPPLIER':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'SPAM':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'INTERNAL':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
}

export function getEventIcon(type: string): string {
  switch (type) {
    case 'whatsapp_received':
      return '📩';
    case 'whatsapp_sent':
      return '📤';
    case 'email_received':
      return '📧';
    case 'email_classified':
      return '🏷️';
    case 'draft_created':
      return '📝';
    case 'summary_sent':
      return '📊';
    case 'bot_paused':
      return '⏸️';
    case 'bot_resumed':
      return '▶️';
    case 'qualification_complete':
      return '✅';
    case 'error':
      return '❌';
    default:
      return '📋';
  }
}
