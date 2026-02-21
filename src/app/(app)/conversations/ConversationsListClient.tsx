'use client';

import { useState, useMemo } from 'react';
import { Search, MessageSquare, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ConversationCard } from '@/components/ConversationCard';
import { EmptyState } from '@/components/EmptyState';
import type { ConversationWithContact } from '@/lib/types';

type ConversationWithMessages = ConversationWithContact & {
  messages?: { content: string | null; sent_at: string; direction: string }[];
};

interface ConversationsListClientProps {
  conversations: ConversationWithMessages[];
}

export function ConversationsListClient({ conversations }: ConversationsListClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('alle');

  const filtered = useMemo(() => {
    let result = conversations;

    // Filter by tab
    switch (activeTab) {
      case 'actief':
        result = result.filter((c) => c.status === 'active' && !c.bot_paused);
        break;
      case 'gepauzeerd':
        result = result.filter((c) => c.bot_paused);
        break;
      case 'gekwalificeerd':
        result = result.filter((c) => c.qualification_complete);
        break;
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => {
        const name = c.contacts?.name?.toLowerCase() ?? '';
        const phone = c.contacts?.phone?.toLowerCase() ?? '';
        const address = c.collected_address?.toLowerCase() ?? '';
        return name.includes(q) || phone.includes(q) || address.includes(q);
      });
    }

    return result;
  }, [conversations, activeTab, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-green-500" />
            Gesprekken
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {conversations.length} totaal
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Zoek op naam, telefoon of adres..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Tabs */}
      <Tabs defaultValue="alle" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto overflow-x-auto">
          <TabsTrigger value="alle">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            Alle ({conversations.length})
          </TabsTrigger>
          <TabsTrigger value="actief">
            🟢 Actief ({conversations.filter((c) => c.status === 'active' && !c.bot_paused).length})
          </TabsTrigger>
          <TabsTrigger value="gepauzeerd">
            🟠 Gepauzeerd ({conversations.filter((c) => c.bot_paused).length})
          </TabsTrigger>
          <TabsTrigger value="gekwalificeerd">
            ✅ Gekwalificeerd ({conversations.filter((c) => c.qualification_complete).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filtered.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              message={
                searchQuery
                  ? 'Geen resultaten gevonden'
                  : 'Geen gesprekken in deze categorie'
              }
              subMessage={
                searchQuery
                  ? `Geen gesprekken gevonden voor "${searchQuery}"`
                  : 'Zodra klanten via WhatsApp berichten sturen, verschijnen ze hier.'
              }
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((conversation) => (
                <ConversationCard key={conversation.id} conversation={conversation} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
