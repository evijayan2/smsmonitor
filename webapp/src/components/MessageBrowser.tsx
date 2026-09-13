"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar, RefreshCw, Smartphone } from "lucide-react";
import { SmsMessage, MessageBrowserProps } from "@/types/sms";
import { MessageBatchToolbar } from "@/components/MessageBatchToolbar";
import { MessageListItem } from "@/components/MessageListItem";
import { MessageDetail } from "@/components/MessageDetail";
import {
  toggleSelection,
  selectAll,
  deselectAll,
  isAllSelected,
  isIndeterminateSelection,
} from "@/lib/selection";
import { logger } from "@/lib/logger";

/**
 * Message browser component providing search, date grouping, message details,
 * and bulk selection with read/unread status updates.
 *
 * @param props - Initial messages loaded from the database
 * @returns Dashboard browser layout component
 */
export function MessageBrowser({ initialMessages }: MessageBrowserProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<SmsMessage[]>(initialMessages);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    initialMessages.length > 0 ? initialMessages[0].id : null
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [groupByDate, setGroupByDate] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [prevInitialMessages, setPrevInitialMessages] = useState<SmsMessage[]>(initialMessages);

  if (initialMessages !== prevInitialMessages) {
    setPrevInitialMessages(initialMessages);
    setMessages(initialMessages);
  }

  const filteredMessages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return messages;
    return messages.filter(
      (msg) =>
        msg.sender.toLowerCase().includes(query) ||
        msg.content.toLowerCase().includes(query) ||
        (msg.receiver?.toLowerCase().includes(query) ?? false)
    );
  }, [messages, searchQuery]);

  const activeMessage = useMemo(() => {
    return messages.find((m) => m.id === selectedMessageId) ?? null;
  }, [messages, selectedMessageId]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 800);
  }, [router]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => toggleSelection(prev, id));
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allSelected = isAllSelected(filteredMessages.length, prev.size);
      return allSelected ? deselectAll() : selectAll(filteredMessages);
    });
  }, [filteredMessages]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(deselectAll());
  }, []);

  const handleBatchMarkRead = async (isRead: boolean): Promise<void> => {
    if (selectedIds.size === 0) return;
    const targetIds = Array.from(selectedIds);
    setIsUpdating(true);
    const previousMessages = messages;

    setMessages((prev) =>
      prev.map((msg) => (selectedIds.has(msg.id) ? { ...msg, isRead } : msg))
    );

    try {
      const res = await fetch("/api/sms/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: targetIds, isRead }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setSelectedIds(deselectAll());
    } catch (error) {
      logger.error("Failed batch read update", { error: String(error) });
      setMessages(previousMessages);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleReadSingle = async (message: SmsMessage): Promise<void> => {
    const newStatus = !message.isRead;
    const prevMessages = messages;
    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, isRead: newStatus } : m))
    );

    try {
      const res = await fetch(`/api/sms/${message.id}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update read status");
    } catch (error) {
      logger.error("Failed single read update", { error: String(error) });
      setMessages(prevMessages);
    }
  };

  const handleSelectMessage = async (msg: SmsMessage): Promise<void> => {
    setSelectedMessageId(msg.id);
    if (!msg.isRead) {
      await handleToggleReadSingle({ ...msg, isRead: false });
    }
  };

  const groupedMessages = useMemo(() => {
    if (!groupByDate) return null;
    const groups: Record<string, SmsMessage[]> = {};
    filteredMessages.forEach((msg) => {
      const key = new Date(msg.receivedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      if (!groups[key]) groups[key] = [];
      groups[key].push(msg);
    });
    return groups;
  }, [filteredMessages, groupByDate]);

  return (
    <div className="flex bg-background rounded-3xl border border-border overflow-hidden h-[calc(100vh-12rem)] transition-colors duration-300">
      <div className="w-full md:w-80 lg:w-96 flex flex-col border-r border-border bg-background/50">
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleRefresh}
              className={`p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-all ${
                isRefreshing ? "animate-spin" : ""
              }`}
              title="Refresh messages"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setGroupByDate(!groupByDate)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl border transition-all text-xs font-medium ${
                groupByDate
                  ? "bg-blue-600/10 border-blue-500/30 text-blue-600 dark:text-blue-400"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{groupByDate ? "Grouped" : "Group by Date"}</span>
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted/50 border border-border rounded-xl py-2 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <MessageBatchToolbar
          totalCount={filteredMessages.length}
          selectedCount={selectedIds.size}
          isAllSelected={isAllSelected(filteredMessages.length, selectedIds.size)}
          isIndeterminate={isIndeterminateSelection(filteredMessages.length, selectedIds.size)}
          onToggleSelectAll={handleToggleSelectAll}
          onMarkSelectedAsRead={handleBatchMarkRead}
          onClearSelection={handleClearSelection}
          isUpdating={isUpdating}
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Smartphone className="w-10 h-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No messages found</p>
            </div>
          ) : groupByDate && groupedMessages ? (
            Object.entries(groupedMessages).map(([dateGroup, groupList]) => (
              <div key={dateGroup} className="mb-2">
                <div className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm px-4 py-2 border-y border-border flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {dateGroup}
                  </span>
                  <span className="text-[10px] bg-accent text-muted-foreground px-1.5 py-0.5 rounded-md ml-auto">
                    {groupList.length}
                  </span>
                </div>
                {groupList.map((msg) => (
                  <MessageListItem
                    key={msg.id}
                    message={msg}
                    isSelected={selectedIds.has(msg.id)}
                    isActive={activeMessage?.id === msg.id}
                    onToggleSelect={handleToggleSelect}
                    onSelectMessage={handleSelectMessage}
                  />
                ))}
              </div>
            ))
          ) : (
            filteredMessages.map((msg) => (
              <MessageListItem
                key={msg.id}
                message={msg}
                isSelected={selectedIds.has(msg.id)}
                isActive={activeMessage?.id === msg.id}
                onToggleSelect={handleToggleSelect}
                onSelectMessage={handleSelectMessage}
              />
            ))
          )}
        </div>
      </div>

      <MessageDetail
        selectedMessage={activeMessage}
        onToggleRead={handleToggleReadSingle}
        onCloseMobile={() => setSelectedMessageId(null)}
      />
    </div>
  );
}

export default MessageBrowser;
