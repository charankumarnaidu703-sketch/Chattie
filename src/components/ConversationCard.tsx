import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { MessageSquare } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { QualificationProgress } from '@/components/QualificationProgress';
import type { ConversationWithContact } from '@/lib/types';

interface ConversationCardProps {
  conversation: ConversationWithContact & {
    messages?: { content: string | null; sent_at: string; direction: string }[];
  };
}

export function ConversationCard({ conversation }: ConversationCardProps) {
  const contact = conversation.contacts;
  const displayName = contact?.name || contact?.phone || 'Onbekend';
  const lastMessage = conversation.messages?.[0];
  const lastMessagePreview = lastMessage?.content
    ? lastMessage.content.length > 60
      ? lastMessage.content.substring(0, 60) + '...'
      : lastMessage.content
    : 'Geen berichten';

  const timeAgo = lastMessage?.sent_at
    ? formatDistanceToNow(new Date(lastMessage.sent_at), {
        addSuffix: true,
        locale: nl,
      })
    : formatDistanceToNow(new Date(conversation.created_at), {
        addSuffix: true,
        locale: nl,
      });

  const statusDotColor =
    conversation.status === 'active' && !conversation.bot_paused
      ? 'bg-green-400'
      : conversation.bot_paused
      ? 'bg-orange-400'
      : conversation.status === 'qualified'
      ? 'bg-blue-400'
      : 'bg-gray-300';

  return (
    <Link href={`/conversations/${conversation.id}`}>
      <div className="group rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4 hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">
                {displayName.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface-container-lowest ${statusDotColor}`}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-on-background text-sm truncate">
                {displayName}
              </h3>
              <span className="text-xs text-outline whitespace-nowrap">{timeAgo}</span>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={conversation.bot_paused ? 'paused' : conversation.status} />
              {contact?.phone && (
                <span className="text-xs text-outline">{contact.phone}</span>
              )}
            </div>

            {/* Last message preview */}
            <div className="flex items-center gap-1.5 mt-2 text-on-surface-variant">
              <MessageSquare className="h-3 w-3 flex-shrink-0 text-outline" />
              <p className="text-xs truncate">{lastMessagePreview}</p>
            </div>

            {/* Qualification progress */}
            <div className="mt-2.5">
              <QualificationProgress currentStep={conversation.qualification_step || 1} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
