"use client";

import { useState } from "react";
import {
  User,
  Clock,
  Calendar,
  MessageSquare,
  Copy,
  Check,
  CheckCheck,
  Mail,
  ChevronRight,
  Layers,
} from "lucide-react";
import { MessageDetailProps, SmsMessage } from "@/types/sms";

/**
 * Message detail header with sender info and read/unread toggle button.
 */
function MessageHeader({
  message,
  onToggleRead,
}: {
  message: SmsMessage;
  onToggleRead: (msg: SmsMessage) => Promise<void>;
}) {
  return (
    <div className="p-6 border-b border-border flex flex-wrap items-center justify-between gap-4 bg-muted/20">
      <div className="flex items-center space-x-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
          <User className="w-7 h-7 text-blue-600 dark:text-blue-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground leading-tight">{message.sender}</h3>
          <div className="flex items-center space-x-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" />
              {new Date(message.receivedAt).toLocaleTimeString()}
            </span>
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              {new Date(message.receivedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => onToggleRead(message)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            message.isRead
              ? "bg-card border-border text-foreground hover:bg-muted"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          title={message.isRead ? "Mark as unread" : "Mark as read"}
        >
          {message.isRead ? (
            <>
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              <span>Mark Unread</span>
            </>
          ) : (
            <>
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark Read</span>
            </>
          )}
        </button>
        <div className="px-3 py-1.5 bg-muted border border-border rounded-xl text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          ID: {message.id.slice(-6)}
        </div>
      </div>
    </div>
  );
}

/**
 * Message content card displaying message body and copy button.
 */
function MessageContentCard({
  content,
  copied,
  onCopy,
}: {
  content: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div>
      <div className="flex items-center space-x-2 mb-4 text-blue-500/80">
        <MessageSquare className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Message Body</span>
      </div>
      <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden group">
        <button
          type="button"
          onClick={onCopy}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          title="Copy message text"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Layers className="w-24 h-24 text-blue-600 dark:text-blue-500 rotate-12" />
        </div>
        <p className="text-lg text-foreground leading-relaxed relative z-10 whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

/**
 * Message metadata details grid.
 */
function MessageMetadataGrid({ message }: { message: SmsMessage }) {
  return (
    <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
      <div className="p-4 bg-muted/30 border border-border rounded-2xl">
        <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
          Receiver
        </span>
        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
          {message.receiver || "Unknown"}
        </span>
      </div>
      <div className="p-4 bg-muted/30 border border-border rounded-2xl">
        <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
          Device Timestamp
        </span>
        <span className="text-sm text-foreground">{new Date(message.timestamp).toLocaleString()}</span>
      </div>
      <div className="p-4 bg-muted/30 border border-border rounded-2xl">
        <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
          Server Received
        </span>
        <span className="text-sm text-foreground">{new Date(message.receivedAt).toLocaleString()}</span>
      </div>
    </div>
  );
}

/**
 * Empty placeholder when no message is selected.
 */
function EmptyMessageView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-50">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <MessageSquare className="w-10 h-10 text-muted-foreground/30" />
      </div>
      <h3 className="text-xl font-medium text-foreground">Select a message</h3>
      <p className="text-muted-foreground max-w-xs mt-2">
        Choose a message from the list on the left to view its complete content and metadata.
      </p>
    </div>
  );
}

/**
 * Renders the detail view for a selected message.
 *
 * @param props - Component properties for message detail
 * @returns JSX element for message detail
 */
export function MessageDetail({ selectedMessage, onToggleRead, onCloseMobile }: MessageDetailProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!selectedMessage) return;
    navigator.clipboard.writeText(selectedMessage.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!selectedMessage) {
    return <EmptyMessageView />;
  }

  return (
    <div className="flex-1 flex flex-col bg-background/50 h-full overflow-hidden">
      <MessageHeader message={selectedMessage} onToggleRead={onToggleRead} />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl">
          <MessageContentCard content={selectedMessage.content} copied={copied} onCopy={handleCopy} />
          <MessageMetadataGrid message={selectedMessage} />
        </div>
      </div>

      {/* Mobile Overlay */}
      <div className="md:hidden fixed inset-0 z-[60] bg-background flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b border-border flex items-center justify-between bg-card">
          <button
            type="button"
            onClick={onCloseMobile}
            className="text-muted-foreground hover:text-foreground p-2"
          >
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <span className="font-bold text-foreground">Message Detail</span>
          <div className="w-10" />
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-background">
          <MessageHeader message={selectedMessage} onToggleRead={onToggleRead} />
          <div className="mt-6">
            <MessageContentCard content={selectedMessage.content} copied={copied} onCopy={handleCopy} />
            <MessageMetadataGrid message={selectedMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}

