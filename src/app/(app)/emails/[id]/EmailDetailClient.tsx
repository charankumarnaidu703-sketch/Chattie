'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft, Send, Bot, Pause, User, Mail, PlusCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { StatusBadge } from '@/components/StatusBadge';
import { QualificationProgress } from '@/components/QualificationProgress';
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

  const botButtonClass = isBotEnabled
    ? 'bg-primary/10 text-primary hover:bg-primary/20'
    : 'bg-surface-container text-on-surface hover:bg-surface-container-high';

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden rounded-[2rem] bg-surface-container-lowest border border-outline-variant/10 shadow-ambient">

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="bg-surface-container-lowest/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-outline-variant/10 z-10">
          <div className="flex items-center gap-4">
            <Link
              href="/emails"
              className="p-2 -ml-2 rounded-full hover:bg-surface-container transition-colors active:scale-95"
            >
              <ArrowLeft className="h-5 w-5 text-on-surface-variant" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="font-headline font-bold text-lg text-on-background">
                  {thread.sender_name || thread.sender_email || 'Onbekend'}
                </h2>
                <StatusBadge status={thread.status || 'active'} />
              </div>
              <p className="font-label text-xs text-on-surface-variant flex items-center gap-2">
                <Mail className="h-3 w-3" />
                {thread.sender_email}
              </p>
            </div>
          </div>

          <button
            onClick={toggleBot}
            disabled={isChangingBot}
            className={'hidden md:flex items-center gap-2 px-4 py-2 rounded-full font-label text-[11px] font-bold uppercase tracking-wider transition-all ' + botButtonClass}
          >
            {isBotEnabled ? (
              <><Bot className="h-4 w-4" /> Bot is Actief</>
            ) : (
              <><Pause className="h-4 w-4" /> Bot Gepauzeerd</>
            )}
          </button>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth bg-surface">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-on-surface-variant/50 font-body text-sm text-center">
              Geen berichten geladen of thread is leeg.<br/>E-mails worden hier getoond.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <span className="inline-block bg-surface-container-high text-on-surface text-[10px] font-bold font-label uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                  Onderwerp: {thread.subject || '(Geen onderwerp)'}
                </span>
              </div>

              {messages.map((msg) => {
                const isInbound = msg.direction === 'inbound';

                return (
                  <div key={msg.id} className={'flex ' + (isInbound ? 'justify-start' : 'justify-end')}>
                    <div className={'max-w-[85%] md:max-w-[70%] flex flex-col gap-1 ' + (isInbound ? 'items-start' : 'items-end')}>

                      <div className="flex items-end gap-2 group">
                        <div className={'relative px-6 py-4 rounded-3xl whitespace-pre-wrap font-body text-[15px] leading-relaxed ' + getBubbleClass(isInbound, msg.sent_by_bot)}>
                          {msg.content}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 px-2 mt-1">
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
        <div className="bg-surface-container-lowest p-4 border-t border-outline-variant/10 relative z-20">
          <div className="max-w-4xl mx-auto relative flex items-end gap-3 bg-surface rounded-[2rem] p-2 border border-outline-variant/30 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
            <button className="flex-shrink-0 p-3 bg-surface-container rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors">
              <PlusCircle className="h-5 w-5" />
            </button>
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
              placeholder={isBotEnabled ? 'Typ een antwoord (pauzeert AI agent)...' : 'Typ een bericht...'}
              className="flex-1 max-h-[120px] bg-transparent font-body text-[15px] text-on-background placeholder:text-on-surface-variant/50 focus:outline-none resize-none py-3 min-h-[48px] overflow-y-auto"
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              className="flex-shrink-0 p-3 bg-tertiary text-on-tertiary rounded-full hover:bg-tertiary/90 transition-all disabled:opacity-50 disabled:bg-surface-container disabled:text-outline active:scale-95"
            >
              {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-0.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* SIDEBAR - QUALIFICATION */}
      <div className="w-full md:w-80 lg:w-96 bg-surface-container-low border-l border-outline-variant/10 flex-col h-full overflow-y-auto hidden md:flex">
        <div className="p-6">
          <h3 className="font-headline font-bold text-sm tracking-widest uppercase text-primary mb-6">
            Kwalificatie
          </h3>

          <QualificationProgress
            currentStep={thread.qualification_step || 1}
            color={statusColor}
          />

          <div className="mt-8 space-y-6">
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
                <div key={stepInfo.step} className="flex gap-4 group">
                  <div className="flex-shrink-0 mt-0.5 relative flex flex-col items-center">
                    <div className={'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ' + stepCircleClass}>
                      {isPast ? <CheckCircle2 className="h-4 w-4" /> : stepInfo.step}
                    </div>
                    {stepInfo.step < 5 && (
                      <div className={'w-[2px] h-full absolute top-7 -bottom-6 ' + lineClass} />
                    )}
                  </div>

                  <div className="pb-6">
                    <div className="font-label font-bold text-xs uppercase tracking-wider text-on-surface-variant mb-1.5 flex items-center gap-2">
                       {stepInfo.icon} {stepInfo.label}
                    </div>

                    <div className={'font-body text-sm leading-relaxed p-3 rounded-2xl border transition-colors ' + fieldClass}>
                      {fieldValue || (isCurrent ? 'Wachten op klant...' : 'Nog niet gevraagd')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
