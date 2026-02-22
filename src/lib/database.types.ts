export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      settings: {
        Row: {
          key: string;
          value: string;
        };
        Insert: {
          key: string;
          value: string;
        };
        Update: {
          key?: string;
          value?: string;
        };
        Relationships: [];
      };
      contacts: {
        Row: {
          id: string;
          phone: string;
          name: string | null;
          email: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          name?: string | null;
          email?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          name?: string | null;
          email?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          contact_id: string;
          whatsapp_chat_id: string;
          status: 'active' | 'qualified' | 'paused' | 'closed';
          bot_paused: boolean;
          collected_address: string | null;
          collected_wishes: string | null;
          collected_dimensions: string | null;
          collected_photos: string[];
          collected_phone: string | null;
          qualification_step: number;
          qualification_complete: boolean;
          summary_sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contact_id: string;
          whatsapp_chat_id: string;
          status?: 'active' | 'qualified' | 'paused' | 'closed';
          bot_paused?: boolean;
          collected_address?: string | null;
          collected_wishes?: string | null;
          collected_dimensions?: string | null;
          collected_photos?: string[];
          collected_phone?: string | null;
          qualification_step?: number;
          qualification_complete?: boolean;
          summary_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          contact_id?: string;
          whatsapp_chat_id?: string;
          status?: 'active' | 'qualified' | 'paused' | 'closed';
          bot_paused?: boolean;
          collected_address?: string | null;
          collected_wishes?: string | null;
          collected_dimensions?: string | null;
          collected_photos?: string[];
          collected_phone?: string | null;
          qualification_step?: number;
          qualification_complete?: boolean;
          summary_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'conversations_contact_id_fkey';
            columns: ['contact_id'];
            isOneToOne: false;
            referencedRelation: 'contacts';
            referencedColumns: ['id'];
          }
        ];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          unipile_msg_id: string | null;
          direction: 'inbound' | 'outbound';
          type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'other';
          content: string | null;
          media_url: string | null;
          sent_by_bot: boolean;
          sent_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          unipile_msg_id?: string | null;
          direction: 'inbound' | 'outbound';
          type?: 'text' | 'image' | 'video' | 'audio' | 'document' | 'other';
          content?: string | null;
          media_url?: string | null;
          sent_by_bot?: boolean;
          sent_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          unipile_msg_id?: string | null;
          direction?: 'inbound' | 'outbound';
          type?: 'text' | 'image' | 'video' | 'audio' | 'document' | 'other';
          content?: string | null;
          media_url?: string | null;
          sent_by_bot?: boolean;
          sent_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          }
        ];
      };
      email_threads: {
        Row: {
          id: string;
          gmail_thread_id: string;
          gmail_message_id: string;
          contact_id: string | null;
          classification: 'CUSTOMER' | 'SUPPLIER' | 'SPAM' | 'INTERNAL' | 'OTHER';
          subject: string | null;
          sender_email: string | null;
          sender_name: string | null;
          draft_created: boolean;
          draft_gmail_id: string | null;
          processed_at: string;
        };
        Insert: {
          id?: string;
          gmail_thread_id: string;
          gmail_message_id: string;
          contact_id?: string | null;
          classification: 'CUSTOMER' | 'SUPPLIER' | 'SPAM' | 'INTERNAL' | 'OTHER';
          subject?: string | null;
          sender_email?: string | null;
          sender_name?: string | null;
          draft_created?: boolean;
          draft_gmail_id?: string | null;
          processed_at?: string;
        };
        Update: {
          id?: string;
          gmail_thread_id?: string;
          gmail_message_id?: string;
          contact_id?: string | null;
          classification?: 'CUSTOMER' | 'SUPPLIER' | 'SPAM' | 'INTERNAL' | 'OTHER';
          subject?: string | null;
          sender_email?: string | null;
          sender_name?: string | null;
          draft_created?: boolean;
          draft_gmail_id?: string | null;
          processed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'email_threads_contact_id_fkey';
            columns: ['contact_id'];
            isOneToOne: false;
            referencedRelation: 'contacts';
            referencedColumns: ['id'];
          }
        ];
      };
      call_notes: {
        Row: {
          id: string;
          contact_id: string;
          conversation_id: string | null;
          notes: string;
          outcome: string | null;
          follow_up_date: string | null;
          gmail_sent: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          contact_id: string;
          conversation_id?: string | null;
          notes: string;
          outcome?: string | null;
          follow_up_date?: string | null;
          gmail_sent?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          contact_id?: string;
          conversation_id?: string | null;
          notes?: string;
          outcome?: string | null;
          follow_up_date?: string | null;
          gmail_sent?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'call_notes_contact_id_fkey';
            columns: ['contact_id'];
            isOneToOne: false;
            referencedRelation: 'contacts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'call_notes_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          }
        ];
      };
      system_events: {
        Row: {
          id: string;
          type: 'whatsapp_received' | 'whatsapp_sent' | 'email_received' | 'email_classified' | 'draft_created' | 'summary_sent' | 'bot_paused' | 'bot_resumed' | 'qualification_complete' | 'error';
          description: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: 'whatsapp_received' | 'whatsapp_sent' | 'email_received' | 'email_classified' | 'draft_created' | 'summary_sent' | 'bot_paused' | 'bot_resumed' | 'qualification_complete' | 'error';
          description?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: 'whatsapp_received' | 'whatsapp_sent' | 'email_received' | 'email_classified' | 'draft_created' | 'summary_sent' | 'bot_paused' | 'bot_resumed' | 'qualification_complete' | 'error';
          description?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      conversation_status: 'active' | 'qualified' | 'paused' | 'closed';
      message_direction: 'inbound' | 'outbound';
      message_type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'other';
      email_classification: 'CUSTOMER' | 'SUPPLIER' | 'SPAM' | 'INTERNAL' | 'OTHER';
      event_type: 'whatsapp_received' | 'whatsapp_sent' | 'email_received' | 'email_classified' | 'draft_created' | 'summary_sent' | 'bot_paused' | 'bot_resumed' | 'qualification_complete' | 'error';
    };
  };
};
