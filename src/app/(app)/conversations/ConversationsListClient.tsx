'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Search } from 'lucide-react';
import { StatusBadge, StatusDot } from '@/components/StatusBadge';
import { QualificationProgress } from '@/components/QualificationProgress';
import { EmptyState } from '@/components/EmptyState';
import type { ConversationWithContact, Message } from '@/lib/types';

type ConversationWithMessages = ConversationWithContact & {
  messages?: Message[];
};

interface ConversationsListClientProps {
  conversations: ConversationWithMessages[];
}

function getTimeLabel(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Yesterday';
  return formatDistanceToNow(d, { locale: enUS, addSuffix: false });
}

function getConversationStatus(c: ConversationWithContact): string {
  if (c.qualification_complete) return 'qualified';
  if (c.bot_paused) return 'paused';
  return 'active';
}

function getStatusColor(status: string): 'primary' | 'secondary' | 'tertiary' {
  switch (status) {
    case 'active': return 'primary';
    case 'paused': return 'secondary';
    case 'qualified': return 'tertiary';
    default: return 'primary';
  }
}

const TABS = [
  { key: 'alle', label: 'All' },
  { key: 'actief', label: 'Active' },
  { key: 'gepauzeerd', label: 'Paused' },
  { key: 'volledig', label: 'Qualified' },
];

export function ConversationsListClient({ conversations }: ConversationsListClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('alle');
  const [showSearch, setShowSearch] = useState(false);
  const [displayCount, setDisplayCount] = useState(15);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setDisplayCount(15);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setDisplayCount(15);
  };

  const filtered = useMemo(() => {
    let result = conversations;
    switch (activeTab) {
      case 'actief':
        result = result.filter((c) => c.status === 'active' && !c.bot_paused);
        break;
      case 'gepauzeerd':
        result = result.filter((c) => c.bot_paused);
        break;
      case 'volledig':
        result = result.filter((c) => c.qualification_complete);
        break;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => {
        const name = c.contacts?.name?.toLowerCase() ?? '';
        const phone = c.contacts?.phone?.toLowerCase() ?? '';
        return name.includes(q) || phone.includes(q);
      });
    }
    return result;
  }, [conversations, activeTab, searchQuery]);

  const visibleItems = useMemo(() => filtered.slice(0, displayCount), [filtered, displayCount]);

  return (
    <div className="space-y-4 fade-in-content">
      {/* Header */}
      <header className="flex justify-between items-center">
        <h1 className="font-headline font-bold text-2xl tracking-tight text-primary">
          Conversations
        </h1>
        <button
          onClick={() => setShowSearch((s) => !s)}
          className="h-11 w-11 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors active:scale-95"
          aria-label="Open search"
        >
          <Search className="h-5 w-5 text-primary" />
        </button>
      </header>

      {/* Tonal Separation */}
      <div className="bg-surface-container-low h-[1px] w-full" />

      {/* Search */}
      {showSearch && (
        <div className="animate-slide-in">
          <input
            type="text"
            placeholder="Search by name or phone number..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-surface-container-highest rounded-2xl px-4 py-3.5 text-sm font-medium text-on-background placeholder:text-on-surface-variant/50 border-none outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]"
            autoFocus
          />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar py-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-6 min-h-[44px] flex items-center justify-center rounded-full font-label font-bold text-[12px] uppercase tracking-wider transition-all flex-shrink-0 cursor-pointer ${
              activeTab === tab.key
                ? 'bg-primary text-on-primary shadow-ambient'
                : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conversation Cards */}
      {filtered.length === 0 ? (
        <EmptyState
          message={searchQuery ? 'No results found' : 'No conversations in this category'}
          subMessage={
            searchQuery
              ? `No conversations found for "${searchQuery}"`
              : 'Once clients send messages via WhatsApp, they will appear here.'
          }
        />
      ) : (
        <div className="space-y-3">
          {visibleItems.map((conv) => {
            const contact = conv.contacts;
            const status = getConversationStatus(conv);
            const lastMessage = conv.messages?.[0];
            const step = conv.qualification_step || 1;

            return (
              <Link key={conv.id} href={`/conversations/${conv.id}`} className="block stagger-item">
                <div className="bg-surface-container-lowest p-5 rounded-[1.5rem] shadow-ambient border border-outline-variant/10 active:scale-[0.98] transition-transform">
                  {/* Name + Time */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <StatusDot status={status} />
                      <span className="font-headline font-bold text-on-background">
                        {contact?.name || contact?.phone || 'Unknown'}
                      </span>
                    </div>
                    <span className="font-label text-on-surface-variant text-xs">
                      {getTimeLabel(conv.updated_at)}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <StatusBadge status={status} />
                  </div>

                  {/* Step Progress */}
                  <div className="mb-4">
                    <QualificationProgress
                      currentStep={step}
                      color={getStatusColor(status)}
                    />
                  </div>

                  {/* Last Message Preview */}
                  {lastMessage?.content && (
                    <p className="text-on-surface-variant/80 text-sm truncate font-body leading-relaxed">
                      {lastMessage.content}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}

          {filtered.length > displayCount && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setDisplayCount((prev) => prev + 15)}
                className="px-6 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label text-xs font-bold uppercase tracking-wider rounded-full active:scale-95 transition-all min-h-[44px] cursor-pointer"
              >
                Load more conversations ({filtered.length - displayCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
