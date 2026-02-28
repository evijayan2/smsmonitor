"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    User,
    Clock,
    ChevronRight,
    Search,
    MessageSquare,
    Smartphone,
    Calendar,
    Layers,
    RefreshCw,
    Filter,
    Hash,
    Copy,
    Check
} from "lucide-react";

interface SmsMessage {
    id: string;
    sender: string;
    receiver: string | null;
    content: string;
    receivedAt: Date;
    timestamp: Date;
    isRead?: boolean;
}

interface MessageBrowserProps {
    initialMessages: SmsMessage[];
}

export default function MessageBrowser({ initialMessages }: MessageBrowserProps) {
    const router = useRouter();
    const [selectedMessage, setSelectedMessage] = useState<SmsMessage | null>(
        initialMessages.length > 0 ? initialMessages[0] : null
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [groupByDate, setGroupByDate] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.refresh();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const handleCopy = () => {
        if (!selectedMessage) return;
        navigator.clipboard.writeText(selectedMessage.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleMessageSelect = async (msg: SmsMessage) => {
        setSelectedMessage(msg);

        if (!msg.isRead) {
            msg.isRead = true;
            try {
                await fetch(`/api/sms/${msg.id}/read`, { method: "PATCH" });
            } catch (error) {
                console.error("Failed to mark message as read:", error);
                msg.isRead = false;
            }
            router.refresh();
        }
    };

    const filteredMessages = initialMessages.filter((msg) =>
        msg.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (msg.receiver?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );

    const groupedMessages = useMemo(() => {
        if (!groupByDate) return null;

        const groups: Record<string, SmsMessage[]> = {};
        filteredMessages.forEach(msg => {
            const dateObj = new Date(msg.receivedAt);
            const key = dateObj.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            if (!groups[key]) groups[key] = [];
            groups[key].push(msg);
        });
        return groups;
    }, [filteredMessages, groupByDate]);

    return (
        <div className="flex bg-background rounded-3xl border border-border overflow-hidden h-[calc(100vh-12rem)] transition-colors duration-300">
            {/* Left Sidebar: Message List */}
            <div className="w-full md:w-80 lg:w-96 flex flex-col border-r border-border bg-background/50">
                <div className="p-4 border-b border-border space-y-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleRefresh}
                            className={`p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                            title="Refresh messages"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setGroupByDate(!groupByDate)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-xl border transition-all text-xs font-medium ${groupByDate
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
                            className="w-full bg-muted/50 border border-border rounded-xl py-2 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all placeholder:text-muted-foreground"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            <Smartphone className="w-10 h-10 text-muted-foreground/30 mb-2" />
                            <p className="text-sm text-muted-foreground">No messages found</p>
                        </div>
                    ) : groupByDate ? (
                        Object.entries(groupedMessages!).map(([dateGroup, messages]) => (
                            <div key={dateGroup} className="mb-2">
                                <div className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm px-4 py-2 border-y border-border flex items-center space-x-2">
                                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        {dateGroup}
                                    </span>
                                    <span className="text-[10px] bg-accent text-muted-foreground px-1.5 py-0.5 rounded-md ml-auto">
                                        {messages.length}
                                    </span>
                                </div>
                                {messages.map((msg) => (
                                    <button
                                        key={msg.id}
                                        onClick={() => handleMessageSelect(msg)}
                                        className={`w-full relative text-left p-4 transition-all border-b border-border/50 flex items-start space-x-3 group ${selectedMessage?.id === msg.id
                                            ? "bg-blue-600/10 border-l-4 border-l-blue-600"
                                            : "hover:bg-muted/50 border-l-4 border-l-transparent"
                                            }`}
                                    >
                                        {!msg.isRead && (
                                            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                        )}
                                        <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border transition-colors ${selectedMessage?.id === msg.id ? "group-hover:border-blue-500/50" : ""}`}>
                                            <User className={`w-5 h-5 transition-colors ${selectedMessage?.id === msg.id ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`} />
                                        </div>
                                        <div className="flex-1 min-w-0 pr-6">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className={`text-sm ${msg.isRead ? 'font-medium' : 'font-bold'} truncate ${selectedMessage?.id === msg.id ? "text-blue-600 dark:text-blue-400" : "text-foreground"}`}>
                                                    {msg.sender}
                                                </span>
                                                <span className={`text-[10px] ${msg.isRead ? 'text-muted-foreground' : 'text-blue-500 font-bold'} whitespace-nowrap ml-2`}>
                                                    {new Date(msg.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className={`text-xs ${msg.isRead ? 'text-muted-foreground' : 'text-foreground/90 font-medium'} line-clamp-1`}>
                                                {msg.content}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ))
                    ) : (
                        filteredMessages.map((msg) => (
                            <button
                                key={msg.id}
                                onClick={() => handleMessageSelect(msg)}
                                className={`w-full relative text-left p-4 transition-all border-b border-border/50 flex items-start space-x-3 group ${selectedMessage?.id === msg.id
                                    ? "bg-blue-600/10 border-l-4 border-l-blue-600"
                                    : "hover:bg-muted/50 border-l-4 border-l-transparent"
                                    }`}
                            >
                                {!msg.isRead && (
                                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                )}
                                <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border transition-colors ${selectedMessage?.id === msg.id ? "group-hover:border-blue-500/50" : ""}`}>
                                    <User className={`w-5 h-5 transition-colors ${selectedMessage?.id === msg.id ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`} />
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className={`text-sm ${msg.isRead ? 'font-medium' : 'font-bold'} truncate ${selectedMessage?.id === msg.id ? "text-blue-600 dark:text-blue-400" : "text-foreground"}`}>
                                            {msg.sender}
                                        </span>
                                        <span className={`text-[10px] ${msg.isRead ? 'text-muted-foreground' : 'text-blue-500 font-bold'} whitespace-nowrap ml-2`}>
                                            {new Date(msg.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className={`text-xs ${msg.isRead ? 'text-muted-foreground' : 'text-foreground/90 font-medium'} line-clamp-1`}>
                                        {msg.content}
                                    </p>
                                </div>
                                <ChevronRight className={`w-4 h-4 self-center transition-transform ${selectedMessage?.id === msg.id ? "text-blue-500 translate-x-1" : "text-muted-foreground/30"}`} />
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Right Content: Message Detail */}
            <div className="hidden md:flex flex-1 flex-col bg-background/50">
                {selectedMessage ? (
                    <>
                        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
                            <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                                    <User className="w-7 h-7 text-blue-600 dark:text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground leading-tight">
                                        {selectedMessage.sender}
                                    </h3>
                                    <div className="flex items-center space-x-3 mt-1">
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Clock className="w-3.5 h-3.5 mr-1" />
                                            {new Date(selectedMessage.receivedAt).toLocaleTimeString()}
                                        </div>
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Calendar className="w-3.5 h-3.5 mr-1" />
                                            {new Date(selectedMessage.receivedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <div className="px-3 py-1 bg-muted border border-border rounded-lg text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    ID: {selectedMessage.id.slice(-6)}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-8 overflow-y-auto">
                            <div className="max-w-3xl">
                                <div className="flex items-center space-x-2 mb-4 text-blue-500/80">
                                    <MessageSquare className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Message Body</span>
                                </div>
                                <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden group">
                                    <button
                                        onClick={handleCopy}
                                        className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                                        title="Copy message text"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Layers className="w-24 h-24 text-blue-600 dark:text-blue-500 rotate-12" />
                                    </div>
                                    <p className="text-lg text-foreground leading-relaxed relative z-10 whitespace-pre-wrap">
                                        {selectedMessage.content}
                                    </p>
                                </div>

                                <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-muted/30 border border-border rounded-2xl">
                                        <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Receiver</span>
                                        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{selectedMessage.receiver || "Unknown"}</span>
                                    </div>
                                    <div className="p-4 bg-muted/30 border border-border rounded-2xl">
                                        <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Device Timestamp</span>
                                        <span className="text-sm text-foreground">{new Date(selectedMessage.timestamp).toLocaleString()}</span>
                                    </div>
                                    <div className="p-4 bg-muted/30 border border-border rounded-2xl">
                                        <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Server Received</span>
                                        <span className="text-sm text-foreground">{new Date(selectedMessage.receivedAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-50">
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                            <MessageSquare className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                        <h3 className="text-xl font-medium text-foreground">Select a message</h3>
                        <p className="text-muted-foreground max-w-xs mt-2">
                            Choose a message from the list on the left to view its complete content and metadata.
                        </p>
                    </div>
                )}
            </div>

            {/* Mobile Overlay: When selected on mobile */}
            {selectedMessage && (
                <div className="md:hidden fixed inset-0 z-[60] bg-background flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="p-4 border-b border-border flex items-center justify-between bg-card">
                        <button onClick={() => setSelectedMessage(null)} className="text-muted-foreground hover:text-foreground p-2">
                            <ChevronRight className="w-6 h-6 rotate-180" />
                        </button>
                        <span className="font-bold text-foreground">Message Detail</span>
                        <div className="w-10" />
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-background">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-border shrink-0 bg-muted">
                                <User className="w-full h-full p-2.5 text-blue-600 dark:text-blue-500 bg-blue-600/10" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground leading-tight">{selectedMessage.sender}</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(selectedMessage.receivedAt).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-6 mb-8 relative">
                            <button
                                onClick={handleCopy}
                                className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                                title="Copy message text"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{selectedMessage.content}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-muted/50 border border-border rounded-xl">
                                <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Receiver</span>
                                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{selectedMessage.receiver || "Unknown"}</span>
                            </div>
                            <div className="p-4 bg-muted/50 border border-border rounded-xl">
                                <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Device Timestamp</span>
                                <span className="text-sm text-foreground">{new Date(selectedMessage.timestamp).toLocaleString()}</span>
                            </div>
                            <div className="p-4 bg-muted/50 border border-border rounded-xl">
                                <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Server Received</span>
                                <span className="text-sm text-foreground">{new Date(selectedMessage.receivedAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
