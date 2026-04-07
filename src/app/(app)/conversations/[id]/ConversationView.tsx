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
  ChevronLeft,
  ChevronRight,
  Info,
  Download,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { QualificationProgressBar } from '@/components/QualificationProgress';
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
            // Deduplicate by real ID
            if (prev.some((m) => m.id === newMessage.id)) return prev;

            // Replace optimistic message with the real one
            const optimisticIndex = prev.findIndex(
              (m) =>
                m.id.startsWith('optimistic-') &&
                m.direction === newMessage.direction &&
                m.content === newMessage.content
            );
            if (optimisticIndex !== -1) {
              const updated = [...prev];
              updated[optimisticIndex] = newMessage;
              return updated;
            }

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
    const previousConversation = conversation;
    try {
      const newPaused = !conversation.bot_paused;

      // Optimistic UI update — feels instant
      setConversation((prev) => ({
        ...prev,
        bot_paused: newPaused,
        status: newPaused ? 'paused' : 'active',
      } as typeof prev));

      const { error } = await supabase
        .from('conversations')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({
          bot_paused: newPaused,
          status: newPaused ? 'paused' : 'active',
        } as any)
        .eq('id', conversation.id);

      if (error) {
        // Rollback on failure
        setConversation(previousConversation);
        throw error;
      }

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
    setMessageText('');

    // Create optimistic message so it appears instantly
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      conversation_id: conversation.id,
      unipile_msg_id: null,
      direction: 'outbound',
      type: 'text',
      content: text,
      media_url: null,
      sent_by_bot: false,
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom();

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

      if (!response.ok) {
        // Remove optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        throw new Error('Send failed');
      }

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
    <div className="flex flex-col h-[calc(100dvh-6rem)] md:h-[calc(100dvh-3rem)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md flex-shrink-0">
        <div className="flex justify-between items-center w-full px-4 py-3 border-b border-outline-variant/10">
          <div className="flex items-center gap-3">
            <Link href="/conversations" className="p-2 -ml-2 hover:bg-surface-container-low rounded-full transition-colors active:scale-95">
              <ArrowLeft className="h-5 w-5 text-primary" />
            </Link>
            <div className="flex flex-col">
              <h1 className="font-headline font-bold text-lg text-on-background tracking-tight">{displayName}</h1>
              <span className="font-label text-[11px] text-on-surface-variant font-medium tracking-widest">{contact?.phone || ''}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleBot}
              disabled={isTogglingBot}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-2 font-label text-xs font-bold uppercase tracking-wider active:scale-95 transition-all border ${
                conversation.bot_paused
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-secondary-container/10 border-secondary-container text-secondary'
              }`}
            >
              {isTogglingBot ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : conversation.bot_paused ? (
                <><Play className="h-4 w-4" /> Hervat</>
              ) : (
                <><Pause className="h-4 w-4" /> Pauze</>
              )}
            </button>
            <button
              className="md:hidden p-2 hover:bg-surface-container-low rounded-full transition-colors"
              onClick={() => setInfoSheetOpen(true)}
            >
              <Info className="h-5 w-5 text-on-surface-variant" />
            </button>
          </div>
        </div>

        {/* Bot paused alert banner */}
        {conversation.bot_paused && (
          <div className="bg-secondary/5 border-b border-secondary/10 px-4 py-2.5 flex items-center gap-3">
            <Pause className="h-4 w-4 text-secondary flex-shrink-0" />
            <p className="font-label text-[12px] font-semibold text-secondary">Bot gepauzeerd — u beheert dit gesprek</p>
          </div>
        )}

        {/* Qualification Progress Panel */}
        <div className="bg-surface-container-low px-4 py-3">
          <QualificationProgressBar currentStep={conversation.qualification_step || 1} />
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Chat messages */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 py-6 space-y-2 bg-surface"
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-outline text-sm font-body">
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
              className="absolute bottom-20 right-4 md:bottom-8 md:right-8 h-10 w-10 rounded-full bg-surface-container-lowest shadow-ambient flex items-center justify-center hover:bg-surface-container-low transition-colors z-10"
            >
              <ChevronDown className="h-5 w-5 text-on-surface-variant" />
            </button>
          )}

          {/* Message input */}
          {conversation.bot_paused && (
            <div className="p-4 bg-surface border-t border-outline-variant/10 safe-area-bottom">
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-surface-container-highest rounded-2xl flex items-center px-4 py-3">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Typ uw bericht..."
                    className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm flex-1 font-medium text-on-background placeholder:text-on-surface-variant/50"
                    disabled={isSending}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || isSending}
                  className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform disabled:opacity-50"
                >
                  {isSending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Info panel (desktop only) */}
        <div className="hidden md:block w-80 lg:w-96 bg-surface-container-low overflow-y-auto">
          <InfoPanel conversation={conversation} contact={contact} />
        </div>
      </div>

      {/* Mobile: Info panel as Sheet */}
      <Sheet open={infoSheetOpen} onOpenChange={setInfoSheetOpen}>
        <SheetContent onClose={() => setInfoSheetOpen(false)} side="bottom">
          <SheetHeader>
            <SheetTitle>Lead informatie</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto max-h-[65vh] -mx-2 px-2 pb-4">
            <InfoPanel conversation={conversation} contact={contact} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Message Bubble ──────────────────────────────────────────

function parseMediaUrls(mediaUrl: string | null): string[] {
  if (!mediaUrl) return [];
  // Try parsing as JSON array (multiple attachments)
  try {
    const parsed = JSON.parse(mediaUrl);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Not JSON — treat as single URL
  }
  return [mediaUrl];
}

export function getDirectImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  const driveRegex = /drive\.google\.com\/(?:file\/d\/|open\?id=)([-\w]+)/;
  const match = url.match(driveRegex);
  if (match && match[1]) {
    // Return the preview link for Google Drive, which embeds reliably in iframes
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return url;
}

function MessageBubble({ message }: { message: Message }) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const isInbound = message.direction === 'inbound';
  const isManual = !message.sent_by_bot && message.direction === 'outbound';

  const rawMediaUrls = message.type === 'image' ? parseMediaUrls(message.media_url) : [];
  const mediaUrls = rawMediaUrls.map(getDirectImageUrl);

  return (
    <div className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'} gap-1 mb-2 animate-slide-in`}>
      {isManual && (
        <span className="font-label text-[9px] font-bold text-tertiary uppercase tracking-widest mr-1">Handmatig</span>
      )}
      <div
        className={`
          max-w-[85%] p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm
          ${isInbound ? 'bg-surface-container-lowest border border-outline-variant/20 rounded-tl-none text-on-background' : ''}
          ${!isInbound && !isManual ? 'bg-primary text-on-primary rounded-tr-none' : ''}
          ${isManual ? 'bg-tertiary text-on-tertiary rounded-tr-none shadow-md' : ''}
        `}
      >
        {message.type === 'image' && mediaUrls.length > 0 && (
          <>
            <div
              onClick={() => setGalleryOpen(true)}
              className="flex items-center gap-2 mb-1.5 p-2.5 rounded-lg bg-black/5 hover:bg-black/10 transition-colors cursor-pointer select-none"
            >
              <div className="bg-tertiary-fixed text-tertiary p-1.5 rounded-full">
                <ImageIcon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">
                {mediaUrls.length === 1 ? 'Bekijk foto' : `Bekijk ${mediaUrls.length} foto's`}
              </span>
            </div>
            <PhotoGalleryModal photos={mediaUrls} open={galleryOpen} onOpenChange={setGalleryOpen} />
          </>
        )}
        {message.type === 'image' && mediaUrls.length === 0 && (
          <div className="flex items-center gap-1.5 mb-1">
            <Camera className="h-3.5 w-3.5" />
            <span className="text-xs opacity-80">Foto ontvangen</span>
          </div>
        )}
        {message.content && (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        )}
      </div>
      <span className={`font-label text-[10px] ${isInbound ? 'text-on-surface-variant ml-1' : isManual ? 'text-tertiary/70 mr-1' : 'text-primary/70 mr-1'}`}>
        {format(new Date(message.sent_at), 'HH:mm')}
      </span>
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
  const [galleryOpen, setGalleryOpen] = useState(false);
  const rawPhotos = conversation.collected_photos || [];
  const photos = rawPhotos.map(getDirectImageUrl);

  return (
    <div className="p-4 space-y-6">
      {/* Qualification Progress */}
      <QualificationProgressBar currentStep={conversation.qualification_step || 1} />

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
              photos.length
                ? `${photos.length} ontvangen`
                : 'Geen'
            }
            action={
              photos.length > 0 ? (
                <Button variant="outline" size="sm" onClick={() => setGalleryOpen(true)} className="h-7 text-xs px-2">
                  Bekijk foto's
                </Button>
              ) : undefined
            }
          />
        </div>
      </div>

      {/* Gallery Modal */}
      <PhotoGalleryModal
        photos={photos}
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
      />

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
  action,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLink?: boolean;
  href?: string;
  highlight?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-2.5">
      <div className="flex items-start gap-2.5 min-w-0">
        <div className="flex-shrink-0 mt-0.5">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-400">{label}</p>
          {isLink && href ? (
            <a
              href={href}
              className={`text-sm font-medium ${highlight ? 'text-green-600 hover:text-green-700' : 'text-blue-600 hover:text-blue-700'
                } transition-colors`}
            >
              {value}
            </a>
          ) : (
            <p
              className={`text-sm ${highlight && value !== 'Nog niet verzameld'
                ? 'font-semibold text-green-600'
                : 'text-gray-700'
                }`}
            >
              {value}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0 mt-1">{action}</div>}
    </div>
  );
}

// ─── Photo Gallery Modal ──────────────────────────────────────

function PhotoGalleryModal({
  photos,
  open,
  onOpenChange,
}: {
  photos: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col sm:p-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-0 absolute top-0 left-0 right-0 z-[110] sm:relative safe-area-top">
        <div className="bg-black/40 sm:bg-transparent px-3 py-1.5 rounded-full text-white text-sm font-medium backdrop-blur-md">
          {currentIndex + 1} / {photos.length}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-10 w-10 sm:h-9 sm:w-9 rounded-full bg-black/40 sm:bg-transparent backdrop-blur-md"
            onClick={() => {
              window.open(photos[currentIndex], '_blank');
            }}
          >
            <Download className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-10 w-10 sm:h-9 sm:w-9 rounded-full bg-black/40 sm:bg-transparent backdrop-blur-md"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      {/* Image Container */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center">
        {photos.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 sm:left-4 text-white hover:bg-white/20 h-12 w-12 sm:h-10 sm:w-10 rounded-full bg-black/40 sm:bg-transparent backdrop-blur-md z-10"
            onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
          >
            <ChevronLeft className="h-8 w-8 sm:h-6 sm:w-6" />
          </Button>
        )}

        <div className="w-full h-full p-0 sm:p-8 flex flex-col justify-center items-center">
          {photos[currentIndex].includes('drive.google.com') ? (
            <div className="flex flex-col items-center justify-center p-8 bg-black/40 rounded-xl backdrop-blur-md gap-6 max-w-sm text-center">
              <div className="h-20 w-20 bg-blue-500/10 rounded-full flex items-center justify-center">
                <ImageIcon className="h-10 w-10 text-blue-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-medium text-lg">Google Drive Foto</h3>
                <p className="text-gray-400 text-sm">
                  Deze foto is opgeslagen in Google Drive. Klik op de knop hieronder om deze veilig in een nieuw tabblad te openen.
                </p>
              </div>
              <Button
                onClick={() => window.open(photos[currentIndex], '_blank')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 h-12 rounded-xl mt-2"
              >
                <ImageIcon className="h-5 w-5" />
                Open Foto
              </Button>
            </div>
          ) : (
            <img
              src={photos[currentIndex]}
              alt={`Photo ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>

        {photos.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 sm:right-4 text-white hover:bg-white/20 h-12 w-12 sm:h-10 sm:w-10 rounded-full bg-black/40 sm:bg-transparent backdrop-blur-md z-10"
            onClick={() => setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
          >
            <ChevronRight className="h-8 w-8 sm:h-6 sm:w-6" />
          </Button>
        )}
      </div>

      {/* Thumbnails (Desktop mostly, hidden on very small screens) */}
      {photos.length > 1 && (
        <div className="hidden sm:flex items-center justify-center gap-2 mt-4 pb-4">
          {photos.map((photo, idx) => (
            <button
              key={photo}
              onClick={() => setCurrentIndex(idx)}
              className={`relative h-16 w-16 rounded-md overflow-hidden transition-all ${idx === currentIndex ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-100'
                }`}
            >
              <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
