'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Send,
  Pause,
  Play,
  Phone,
  MapPin,
  Ruler,
  Camera,
  Loader2,
  ChevronDown,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { QualificationProgress } from '@/components/QualificationProgress';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { getSupabaseClient } from '@/lib/supabase/client';
import { env } from '@/lib/env';
import type { Message, Conversation, Contact } from '@/lib/types';

interface ConversationViewProps {
  initialConversation: Conversation & { contacts: Contact };
  initialMessages: Message[];
}

export function ConversationView({
  initialConversation,
  initialMessages,
}: ConversationViewProps) {
  const [conversation, setConversation] = useState(initialConversation);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTogglingBot, setIsTogglingBot] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [infoSheetOpen, setInfoSheetOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const contact = conversation.contacts;
  const displayName = contact?.name || contact?.phone || 'Onbekend';
  const supabase = getSupabaseClient();

  // Auto-scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
    });
  }, []);

  // Initial scroll
  useEffect(() => {
    scrollToBottom(false);
  }, [scrollToBottom]);

  // Track scroll position for scroll-to-bottom button
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Realtime: new messages
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            // Deduplicate
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id, supabase, scrollToBottom]);

  // Realtime: conversation updates (bot_paused, qualification, etc.)
  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `id=eq.${conversation.id}`,
        },
        (payload) => {
          setConversation((prev) => ({ ...prev, ...payload.new } as typeof prev));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id, supabase]);

  // Pause / Resume bot
  const handleToggleBot = async () => {
    setIsTogglingBot(true);
    try {
      const newPaused = !conversation.bot_paused;
      const { error } = await supabase
        .from('conversations')
        .update({
          bot_paused: newPaused,
          status: (newPaused ? 'paused' : 'active') as 'active' | 'qualified' | 'paused' | 'closed',
        })
        .eq('id', conversation.id);

      if (error) throw error;

      toast.success(
        newPaused
          ? 'Bot gepauzeerd — u heeft de controle'
          : 'Bot hervat — automatische antwoorden staan weer aan'
      );
    } catch {
      toast.error('Kon bot status niet wijzigen');
    } finally {
      setIsTogglingBot(false);
    }
  };

  // Send manual message via n8n webhook
  const handleSendMessage = async () => {
    const text = messageText.trim();
    if (!text) return;

    setIsSending(true);
    try {
      const response = await fetch(env.n8nManualMessageUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: conversation.whatsapp_chat_id,
          conversationId: conversation.id,
          text,
        }),
      });

      if (!response.ok) throw new Error('Send failed');

      setMessageText('');
      toast.success('Bericht verzonden');
    } catch {
      toast.error('Kon bericht niet verzenden. Probeer opnieuw.');
    } finally {
      setIsSending(false);
    }
  };

  // Enter key to send
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.24))] md:h-[calc(100vh-theme(spacing.12))]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 rounded-t-xl">
        <Link href="/conversations" className="md:hidden">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0">
          <span className="text-green-700 font-semibold text-sm">
            {displayName.substring(0, 2).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 text-sm truncate">{displayName}</h2>
          <div className="flex items-center gap-2">
            <StatusBadge status={conversation.bot_paused ? 'paused' : conversation.status} />
            {contact?.phone && (
              <span className="text-xs text-gray-400">{contact.phone}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant={conversation.bot_paused ? 'default' : 'warning'}
            size="sm"
            onClick={handleToggleBot}
            disabled={isTogglingBot}
            className="min-h-[44px]"
          >
            {isTogglingBot ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : conversation.bot_paused ? (
              <>
                <Play className="h-4 w-4" /> Hervatten
              </>
            ) : (
              <>
                <Pause className="h-4 w-4" /> Pauzeren
              </>
            )}
          </Button>

          {/* Mobile: info panel toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setInfoSheetOpen(true)}
          >
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Bot paused banner */}
      {conversation.bot_paused && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 flex items-center gap-2">
          <Pause className="h-4 w-4 text-orange-500 flex-shrink-0" />
          <p className="text-sm text-orange-700">
            Bot gepauzeerd — u beheert dit gesprek handmatig
          </p>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Chat messages */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-gray-50"
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Nog geen berichten in dit gesprek
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Scroll-to-bottom button */}
          {showScrollButton && (
            <button
              onClick={() => scrollToBottom()}
              className="absolute bottom-32 right-8 md:right-[42%] h-10 w-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
            >
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </button>
          )}

          {/* Message input (only when bot paused) */}
          {conversation.bot_paused && (
            <div className="p-3 bg-white border-t border-gray-200">
              <div className="flex gap-2 items-end">
                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type uw bericht..."
                  className="min-h-[44px] max-h-32 resize-none"
                  rows={1}
                  disabled={isSending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || isSending}
                  className="h-[44px] px-4 flex-shrink-0"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {messageText.length > 200 && (
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {messageText.length} tekens
                </p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Info panel (desktop only) */}
        <div className="hidden md:block w-80 lg:w-96 border-l border-gray-200 bg-white overflow-y-auto">
          <InfoPanel conversation={conversation} contact={contact} />
        </div>
      </div>

      {/* Mobile: Info panel as Sheet */}
      <Sheet open={infoSheetOpen} onOpenChange={setInfoSheetOpen}>
        <SheetContent onClose={() => setInfoSheetOpen(false)} side="bottom">
          <SheetHeader>
            <SheetTitle>Lead informatie</SheetTitle>
          </SheetHeader>
          <InfoPanel conversation={conversation} contact={contact} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Message Bubble ──────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isInbound = message.direction === 'inbound';
  const isManual = !message.sent_by_bot && message.direction === 'outbound';

  return (
    <div
      className={`flex ${isInbound ? 'justify-start' : 'justify-end'} mb-1 animate-slide-in`}
    >
      <div
        className={`
          max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm
          ${isInbound ? 'bg-white text-gray-900 rounded-tl-sm border border-gray-100' : ''}
          ${!isInbound && !isManual ? 'bg-green-600 text-white rounded-tr-sm' : ''}
          ${isManual ? 'bg-blue-600 text-white rounded-tr-sm' : ''}
        `}
      >
        {isManual && (
          <span className="text-[10px] text-blue-200 block mb-0.5 font-medium">
            Handmatig verstuurd
          </span>
        )}
        {message.type === 'image' && !message.content && (
          <div className="flex items-center gap-1.5 mb-1">
            <Camera className="h-3.5 w-3.5" />
            <span className="text-xs opacity-80">Foto ontvangen</span>
          </div>
        )}
        <p className="whitespace-pre-wrap break-words">{message.content || ''}</p>
        <span
          className={`text-[10px] mt-1 block ${
            isInbound ? 'text-gray-400' : 'text-white/70'
          }`}
        >
          {format(new Date(message.sent_at), 'HH:mm')}
        </span>
      </div>
    </div>
  );
}

// ─── Info Panel ──────────────────────────────────────────────

function InfoPanel({
  conversation,
  contact,
}: {
  conversation: Conversation;
  contact: Contact;
}) {
  const displayName = contact?.name || contact?.phone || 'Onbekend';

  return (
    <div className="p-4 space-y-6">
      {/* Qualification Progress */}
      <QualificationProgress conversation={conversation} />

      <Separator />

      {/* Contact Details */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Contactgegevens</h3>

        <div className="space-y-2">
          <DetailRow
            icon={<span className="text-base">👤</span>}
            label="Naam"
            value={displayName}
          />
          <DetailRow
            icon={<Phone className="h-4 w-4 text-gray-400" />}
            label="WhatsApp"
            value={contact?.phone || '-'}
            isLink={!!contact?.phone}
            href={`tel:${contact?.phone}`}
          />
          <DetailRow
            icon={<Phone className="h-4 w-4 text-green-500" />}
            label="Telefoon"
            value={conversation.collected_phone || 'Nog niet verzameld'}
            isLink={!!conversation.collected_phone}
            href={`tel:${conversation.collected_phone}`}
            highlight
          />
        </div>
      </div>

      <Separator />

      {/* Collected Data */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Verzamelde gegevens</h3>

        <div className="space-y-2">
          <DetailRow
            icon={<MapPin className="h-4 w-4 text-gray-400" />}
            label="Adres"
            value={conversation.collected_address || '-'}
          />
          <DetailRow
            icon={<span className="text-base">🌿</span>}
            label="Wensen"
            value={conversation.collected_wishes || '-'}
          />
          <DetailRow
            icon={<Ruler className="h-4 w-4 text-gray-400" />}
            label="Afmetingen"
            value={conversation.collected_dimensions || '-'}
          />
          <DetailRow
            icon={<Camera className="h-4 w-4 text-gray-400" />}
            label="Foto's"
            value={
              conversation.collected_photos?.length
                ? `${conversation.collected_photos.length} ontvangen`
                : 'Geen'
            }
          />
        </div>
      </div>

      {/* Qualification complete badge */}
      {conversation.qualification_complete && (
        <>
          <Separator />
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2">
              <span className="text-lg">✅</span>
              <div>
                <p className="text-sm font-medium text-green-800">Kwalificatie voltooid</p>
                <p className="text-xs text-green-600">
                  Alle informatie is verzameld. Bel de klant om een afspraak te maken.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  isLink = false,
  href,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLink?: boolean;
  href?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400">{label}</p>
        {isLink && href ? (
          <a
            href={href}
            className={`text-sm font-medium ${
              highlight ? 'text-green-600 hover:text-green-700' : 'text-blue-600 hover:text-blue-700'
            } transition-colors`}
          >
            {value}
          </a>
        ) : (
          <p
            className={`text-sm ${
              highlight && value !== 'Nog niet verzameld'
                ? 'font-semibold text-green-600'
                : 'text-gray-700'
            }`}
          >
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
