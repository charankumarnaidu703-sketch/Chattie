'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Mail, Search, Trash2, Loader2, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge, StatusDot } from '@/components/StatusBadge';
import { QualificationProgress } from '@/components/QualificationProgress';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { EmailThread } from '@/lib/types';

interface EmailsListClientProps {
  initialEmails: EmailThread[];
}

function getTimeLabel(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Yesterday';
  return formatDistanceToNow(d, { locale: enUS, addSuffix: false });
}

const TABS = [
  { key: 'alle', label: 'All' },
  { key: 'nieuw', label: 'New' },
  { key: 'actief', label: 'Active' },
  { key: 'qualified', label: 'Qualified' },
];

export function EmailsListClient({ initialEmails }: EmailsListClientProps) {
  const [emails, setEmails] = useState<EmailThread[]>(initialEmails);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('actief'); // Default to target actionable
  const [showSearch, setShowSearch] = useState(false);
  const [displayCount, setDisplayCount] = useState(15);
  
  const [deleteTarget, setDeleteTarget] = useState<EmailThread | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = getSupabaseClient();

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setDisplayCount(15);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setDisplayCount(15);
  };

  // Sort by processed_at desc
  const sortedEmails = [...emails].sort((a, b) => 
    new Date(b.processed_at).getTime() - new Date(a.processed_at).getTime()
  );

  const filtered = useMemo(() => {
    let result = sortedEmails;
    
    // Tab filters
    switch (activeTab) {
      case 'nieuw':
        result = result.filter((e) => e.status === 'new');
        break;
      case 'actief':
        result = result.filter((e) => e.status === 'active' || e.status === 'new');
        break;
      case 'qualified':
        result = result.filter((e) => e.status === 'qualified');
        break;
    }
    
    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((e) => {
        const name = e.sender_name?.toLowerCase() ?? '';
        const emailAddress = e.sender_email?.toLowerCase() ?? '';
        const subject = e.subject?.toLowerCase() ?? '';
        return name.includes(q) || emailAddress.includes(q) || subject.includes(q);
      });
    }
    
    return result;
  }, [sortedEmails, activeTab, searchQuery]);

  const visibleItems = useMemo(() => filtered.slice(0, displayCount), [filtered, displayCount]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('email_threads')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) throw error;

      setEmails((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success('Email thread deleted');
    } catch {
      toast.error('Failed to delete email. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 fade-in-content">
      {/* Header */}
      <header className="flex justify-between items-center">
        <h1 className="font-headline font-bold text-2xl tracking-tight text-primary flex items-center gap-2">
          <Mail className="h-6 w-6" />
          Email Leads
        </h1>
        <button
          onClick={() => setShowSearch((s) => !s)}
          className="h-11 w-11 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors active:scale-95"
          aria-label="Search emails"
        >
          <Search className="h-5 w-5 text-primary" />
        </button>
      </header>

      {/* Tonal Separation */}
      <div className="bg-surface-container-low h-[1px] w-full" />

      {/* Search Bar */}
      {showSearch && (
        <div className="animate-slide-in">
          <input
            type="text"
            placeholder="Search by name, email, or subject..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-surface-container-highest rounded-2xl px-4 py-3.5 text-sm font-medium text-on-background placeholder:text-on-surface-variant/50 border-none outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]"
            autoFocus
          />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 pt-1">
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

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          message={searchQuery ? 'No results found' : 'No emails in this category'}
          subMessage={searchQuery ? `No emails found for "${searchQuery}"` : 'Client emails will appear here automatically.'}
        />
      ) : (
        <div className="space-y-3 pb-8">
          {visibleItems.map((thread) => {
            const step = thread.qualification_step || 1;
            const statusColor = 
              thread.status === 'qualified' ? 'tertiary' : 
              thread.status === 'closed' ? 'secondary' : 'primary';

            return (
              <div key={thread.id} className="relative group stagger-item">
                <Link href={`/emails/${thread.id}`} className="block relative z-0">
                  <div className="bg-surface-container-lowest p-5 rounded-[1.5rem] shadow-ambient border border-outline-variant/10 active:scale-[0.98] transition-transform">
                    {/* Name + Time */}
                    <div className="flex justify-between items-start mb-2 pr-10">
                      <div className="flex items-center gap-3">
                        <StatusDot status={thread.status || 'active'} />
                        <span className="font-headline font-bold text-on-background truncate max-w-[200px]">
                          {thread.sender_name || thread.sender_email || 'Unknown'}
                        </span>
                        {/* Bot indicator badge */}
                        {thread.bot_enabled && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 text-primary rounded-md text-[10px] font-bold uppercase tracking-wider">
                            <Bot className="h-3 w-3" />
                            Bot
                          </span>
                        )}
                      </div>
                      <span className="font-label text-on-surface-variant text-xs flex-shrink-0">
                        {getTimeLabel(thread.last_reply_at || thread.processed_at)}
                      </span>
                    </div>

                    {/* Subject Line */}
                    <h3 className="font-headline font-bold text-sm text-on-background/80 mb-3 truncate">
                      {thread.subject || '(No subject)'}
                    </h3>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <StatusBadge status={thread.status || 'active'} />
                    </div>

                    {/* Step Progress */}
                    {thread.classification === 'CUSTOMER' && (
                      <div className="mb-4">
                        <QualificationProgress
                          currentStep={step}
                          color={statusColor}
                        />
                      </div>
                    )}

                    {/* Body Preview */}
                    {thread.body_preview && (
                      <p className="text-on-surface-variant/80 text-sm truncate font-body leading-relaxed">
                        {thread.body_preview}
                      </p>
                    )}
                  </div>
                </Link>

                {/* Delete Button overlaid */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteTarget(thread);
                  }}
                  className="absolute top-4 right-4 z-10 h-11 w-11 flex items-center justify-center bg-surface-container hover:bg-error/10 text-outline hover:text-error rounded-xl transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                  aria-label={`Delete email from ${thread.sender_name || 'unknown sender'}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}

          {filtered.length > displayCount && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setDisplayCount((prev) => prev + 15)}
                className="px-6 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label text-xs font-bold uppercase tracking-wider rounded-full active:scale-95 transition-all min-h-[44px] cursor-pointer"
              >
                Load more emails ({filtered.length - displayCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete email?"
        description={`This will permanently delete "${deleteTarget?.subject || '(No subject)'}".`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}
