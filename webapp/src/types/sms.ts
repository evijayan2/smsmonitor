/**
 * Core interface for an SMS message displayed in the web dashboard.
 */
export interface SmsMessage {
  id: string;
  sender: string;
  receiver: string | null;
  content: string;
  receivedAt: Date | string;
  timestamp: Date | string;
  isRead?: boolean;
}

/**
 * Filter modes for message lists.
 */
export type ReadFilter = "all" | "unread" | "read";

/**
 * Supported batch actions on selected messages.
 */
export type BatchReadAction = "read" | "unread";

/**
 * Request body for batch read-status updates.
 */
export interface BatchReadRequest {
  ids: string[];
  isRead: boolean;
}

/**
 * Response body from batch read-status updates.
 */
export interface BatchReadResponse {
  success: boolean;
  count: number;
  isRead: boolean;
}

/**
 * Props passed to the MessageBrowser container.
 */
export interface MessageBrowserProps {
  initialMessages: SmsMessage[];
}

/**
 * Props passed to the MessageListItem component.
 */
export interface MessageListItemProps {
  message: SmsMessage;
  isSelected: boolean;
  isActive: boolean;
  onToggleSelect: (id: string) => void;
  onSelectMessage: (message: SmsMessage) => void;
}

/**
 * Props passed to the MessageBatchToolbar component.
 */
export interface MessageBatchToolbarProps {
  totalCount: number;
  selectedCount: number;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onToggleSelectAll: () => void;
  onMarkSelectedAsRead: (isRead: boolean) => Promise<void>;
  onClearSelection: () => void;
  isUpdating: boolean;
}

/**
 * Props passed to the MessageDetail component.
 */
export interface MessageDetailProps {
  selectedMessage: SmsMessage | null;
  onToggleRead: (message: SmsMessage) => Promise<void>;
  onCloseMobile: () => void;
}

