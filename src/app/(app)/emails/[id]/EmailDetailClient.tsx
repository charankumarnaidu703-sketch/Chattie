'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft, Send, Bot, Pause, User, Mail, Info, PlusCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { StatusBadge } from '@/components/StatusBadge';
import { QualificationProgress } from '@/components/QualificationProgress';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getSupabaseClient } from '@/lib/supabase/client';
import { QUALIFICATION_STEPS } from '@/lib/types';
import type { EmailThreadWithMessages, EmailMessage } from '@/lib/types';

interface Props {
  initialThread: EmailThreadWithMessages;
}

export function EmailDetailClient({ initialThread }: Props) {
  const [thread, setThread] = useState(initialThread);
  const [messages, setMessages] = useState<EmailMessage[]>(initialThread.email_messages || []);
  const [isBotEnabled, setIsBotEnabled] = useState(initialThread.bot_enabled ?? false);

  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isChangingBot, setIsChangingBot] = useState(false);
  const [infoSheetOpen, setInfoSheetOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Realtime subscription
  useEffect(() => {
    const channelName1 = 'email_messages:' + thread.id;
    const channelName2 = 'email_threads:' + thread.id;
    const filterMsg = 'thread_id=eq.' + thread.id;
    const filterThread = 'id=eq.' + thread.id;

    const messagesSubscription = supabase
      .channel(channelName1)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'email_messages', filter: filterMsg },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as EmailMessage]);
        }
      )
      .subscribe();

    const threadSubscription = supabase
      .channel(channelName2)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'email_threads', filter: filterThread },
        (payload) => {
          setThread((prev) => ({ ...prev, ...payload.new }));
          setIsBotEnabled(payload.new.bot_enabled);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(threadSubscription);
    };
  }, [thread.id, supabase]);

  const toggleBot = async () => {
    setIsChangingBot(true);
    const newState = !isBotEnabled;
    try {
      const { error } = await supabase
        .from('email_threads')
        .update({ bot_enabled: newState })
        .eq('id', thread.id);

      if (error) throw error;

      setIsBotEnabled(newState);
      toast.success(newState ? 'Bot Resumeert' : 'Bot Gepauzeerd');
    } catch {
      toast.error('Kan de bot status niet updaten');
    } finally {
      setIsChangingBot(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);

    try {
      if (isBotEnabled) {
        await supabase
          .from('email_threads')
          .update({ bot_enabled: false })
          .eq('id', thread.id);
        setIsBotEnabled(false);
      }

      const { error } = await supabase.from('email_messages').insert({
        thread_id: thread.id,
        gmail_message_id: 'manual-' + Date.now(),
        direction: 'outbound',
        content: newMessage.trim(),
        sent_by_bot: false,
      });

      if (error) throw error;

      setNewMessage('');
      toast.success('Bericht verzonden');
    } catch (err) {
      console.error(err);
      toast.error('Fout bij verzenden bericht');
    } finally {
      setIsSending(false);
    }
  };

  const statusColor: 'primary' | 'secondary' | 'tertiary' =
    thread.status === 'qualified' ? 'tertiary' :
    thread.status === 'closed' ? 'secondary' : 'primary';

  const getBubbleClass = (isInbound: boolean, sentByBot: boolean) => {
    if (isInbound) return 'bg-surface-container-low text-on-background rounded-bl-md';
    if (sentByBot) return 'bg-primary/10 text-primary border border-primary/20 rounded-br-md';
    return 'bg-tertiary text-on-tertiary rounded-br-md';
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full fade-in-content">
      <div className="px-4 pt-4 hidden md:block flex-shrink-0">
        <Breadcrumbs items={[{ label: 'E-mails', href: '/emails' }, { label: thread.sender_name || thread.sender_email || 'Onbekend' }]} />
      </div>
      <div className="flex flex-col h-[calc(100dvh-6rem)] md:h-auto md:flex-1 md:flex-row overflow-hidden md:rounded-[2rem] bg-surface-container-lowest md:border md:border-outline-variant/10 md:shadow-ambient">

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md flex-shrink-0">
          <div className="flex justify-between items-center w-full px-3 md:px-6 py-3 border-b border-outline-variant/10">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Link
                href="/emails"
                className="h-11 w-11 flex items-center justify-center -ml-1 rounded-full hover:bg-surface-container transition-colors active:scale-95 flex-shrink-0"
                aria-label="Terug naar e-mails"
              >
                <ArrowLeft className="h-5 w-5 text-primary" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="font-headline font-bold text-base md:text-lg text-on-background truncate">
                    {thread.sender_name || thread.sender_email || 'Onbekend'}
                  </h1>
                  <StatusBadge status={thread.status || 'active'} />
                </div>
                <p className="font-label text-[11px] text-on-surface-variant flex items-center gap-1.5 truncate">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{thread.sender_email}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Bot toggle — compact on mobile */}
              <button
                onClick={toggleBot}
                disabled={isChangingBot}
                className={
                  'bot-toggle-btn flex items-center gap-1.5 px-3 min-h-[44px] rounded-xl font-label text-[11px] font-bold uppercase tracking-wider active:scale-95 transition-all border ' +
                  (isBotEnabled
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-surface-container border-outline-variant/30 text-on-surface-variant')
                }
              >
                {isChangingBot ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isBotEnabled ? (
                  <><Bot className="h-4 w-4" /><span className="hidden md:inline">Bot Actief</span></>
                ) : (
                  <><Pause className="h-4 w-4" /><span className="hidden md:inline">Gepauzeerd</span></>
                )}
              </button>

              {/* Info icon — mobile only */}
              <button
                className="md:hidden h-11 w-11 flex items-center justify-center hover:bg-surface-container-low rounded-full transition-colors"
                onClick={() => setInfoSheetOpen(true)}
                aria-label="Lead details tonen"
              >
                <Info className="h-5 w-5 text-on-surface-variant" />
              </button>
            </div>
          </div>

          {/* Subject bar */}
          <div className="bg-surface-container-low px-4 py-2 border-b border-outline-variant/5">
            <p className="font-label text-[11px] text-on-surface-variant truncate">
              <span className="font-bold uppercase tracking-wider mr-1.5">Onderwerp:</span>
              {thread.subject || '(Geen onderwerp)'}
            </p>
          </div>
        </header>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-6 scroll-smooth bg-surface">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-on-surface-variant/50 font-body text-sm text-center px-4">
              Geen berichten geladen of thread is leeg.<br/>E-mails worden hier getoond.
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {messages.map((msg) => {
                const isInbound = msg.direction === 'inbound';

                return (
                  <div key={msg.id} className={'flex ' + (isInbound ? 'justify-start' : 'justify-end')}>
                    <div className={'max-w-[90%] md:max-w-[70%] flex flex-col gap-1 ' + (isInbound ? 'items-start' : 'items-end')}>
                      <div className={'relative px-4 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-3xl whitespace-pre-wrap font-body text-[14px] md:text-[15px] leading-relaxed ' + getBubbleClass(isInbound, msg.sent_by_bot)}>
                        {msg.content}
                      </div>

                      <div className="flex items-center gap-1.5 px-1.5 mt-0.5">
                        <span className="font-label text-[10px] text-outline tracking-wider">
                          {format(new Date(msg.sent_at), 'HH:mm')}
                        </span>
                        {!isInbound && msg.sent_by_bot && (
                          <span className="flex items-center gap-1 text-[10px] text-primary/70 font-label tracking-wide uppercase">
                            <Bot className="h-3 w-3" /> Bot
                          </span>
                        )}
                        {!isInbound && !msg.sent_by_bot && (
                          <span className="flex items-center gap-1 text-[10px] text-tertiary/70 font-label tracking-wide uppercase">
                            <User className="h-3 w-3" /> Jij
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="bg-surface-container-lowest p-2.5 md:p-4 border-t border-outline-variant/10 relative z-20 safe-area-bottom">
          <div className="max-w-4xl mx-auto relative flex items-end gap-2 md:gap-3 bg-surface rounded-2xl md:rounded-[2rem] p-1.5 md:p-2 border border-outline-variant/30 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={isBotEnabled ? 'Typ een antwoord (pauzeert AI)...' : 'Typ een bericht...'}
              className="flex-1 max-h-[120px] bg-transparent font-body text-[14px] md:text-[15px] text-on-background placeholder:text-on-surface-variant/50 focus:outline-none resize-none py-2.5 px-3 md:py-3 md:px-4 min-h-[44px] overflow-y-auto"
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              className="flex-shrink-0 p-2.5 md:p-3 bg-tertiary text-on-tertiary rounded-full hover:bg-tertiary/90 transition-all disabled:opacity-50 disabled:bg-surface-container disabled:text-outline active:scale-95"
            >
              {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-0.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* SIDEBAR — QUALIFICATION (desktop only) */}
      <div className="w-full md:w-80 lg:w-96 bg-surface-container-low border-l border-outline-variant/10 flex-col h-full overflow-y-auto hidden md:flex">
        <EmailInfoPanel thread={thread} statusColor={statusColor} />
      </div>

      {/* MOBILE INFO SHEET */}
      <Sheet open={infoSheetOpen} onOpenChange={setInfoSheetOpen}>
        <SheetContent onClose={() => setInfoSheetOpen(false)} side="bottom">
          <SheetHeader>
            <SheetTitle>Lead Informatie</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto max-h-[65vh] -mx-2 px-2 pb-4">
            <EmailInfoPanel thread={thread} statusColor={statusColor} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
    </div>
  );
}


/* ─── Email Info Panel (shared between desktop sidebar & mobile sheet) ─── */

function EmailInfoPanel({
  thread,
  statusColor,
}: {
  thread: EmailThreadWithMessages;
  statusColor: 'primary' | 'secondary' | 'tertiary';
}) {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Contact details card */}
      <div className="space-y-3">
        <h3 className="font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant">
          Contactgegevens
        </h3>
        <div className="bg-surface-container-lowest rounded-2xl p-4 space-y-3 border border-outline-variant/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-headline font-bold text-sm text-on-background truncate">
                {thread.sender_name || 'Onbekend'}
              </p>
              <p className="font-label text-[11px] text-on-surface-variant truncate">
                {thread.sender_email}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-outline-variant/10 space-y-2">
            <InfoRow label="Status" value={thread.status || 'active'} />
            <InfoRow label="Onderwerp" value={thread.subject || '(Geen)'} />
            <InfoRow label="Classificatie" value={thread.classification || '-'} />
          </div>
        </div>
      </div>

      {/* Qualification */}
      <div className="space-y-4">
        <h3 className="font-label font-bold text-xs uppercase tracking-widest text-primary">
          Kwalificatie Voortgang
        </h3>

        <QualificationProgress
          currentStep={thread.qualification_step || 1}
          color={statusColor}
        />

        <div className="mt-4 space-y-4">
          {QUALIFICATION_STEPS.map((stepInfo) => {
            const isCurrent = stepInfo.step === (thread.qualification_step || 1) && !thread.qualification_complete;
            const isPast = thread.qualification_complete || stepInfo.step < (thread.qualification_step || 1);

            const fieldValue = (thread as Record<string, unknown>)[stepInfo.field] as string | null | undefined;

            const stepCircleClass = isPast
              ? 'bg-primary text-on-primary'
              : isCurrent
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-surface-container-highest text-outline';

            const lineClass = isPast ? 'bg-primary/30' : 'bg-surface-container-highest';

            const fieldClass = fieldValue
              ? 'bg-surface-container border-outline-variant/20 text-on-background'
              : isCurrent
                ? 'bg-primary/5 border-primary/20 text-primary/70 italic'
                : 'bg-transparent border-dashed border-outline-variant/50 text-outline italic';

            return (
              <div key={stepInfo.step} className="flex gap-3 group">
                <div className="flex-shrink-0 mt-0.5 relative flex flex-col items-center">
                  <div className={'w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ' + stepCircleClass}>
                    {isPast ? <CheckCircle2 className="h-3.5 w-3.5" /> : stepInfo.step}
                  </div>
                  {stepInfo.step < 5 && (
                    <div className={'w-[2px] h-full absolute top-6 md:top-7 -bottom-4 ' + lineClass} />
                  )}
                </div>

                <div className="pb-4 min-w-0 flex-1">
                  <div className="font-label font-bold text-[11px] uppercase tracking-wider text-on-surface-variant mb-1 flex items-center gap-1.5">
                    {stepInfo.icon} {stepInfo.label}
                  </div>
                  <div className={'font-body text-sm leading-relaxed p-2.5 md:p-3 rounded-xl md:rounded-2xl border transition-colors break-words ' + fieldClass}>
                    {fieldValue || (isCurrent ? 'Wachten op klant...' : 'Nog niet gevraagd')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Qualification complete badge */}
      {thread.qualification_complete && (
        <div className="bg-primary/5 rounded-xl p-3 border border-primary/20">
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <div>
              <p className="text-sm font-medium text-primary">Kwalificatie voltooid</p>
              <p className="text-xs text-primary">
                Alle informatie is verzameld.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ─── Helper Components ─── */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="font-label text-[11px] text-on-surface-variant/70 flex-shrink-0">{label}</span>
      <span className="font-body text-sm text-on-background text-right break-words min-w-0">{value}</span>
    </div>
  );
}
