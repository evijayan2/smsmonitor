"use client";

import { useEffect, useRef } from "react";
import { CheckCheck, Mail, X, Loader2 } from "lucide-react";
import { MessageBatchToolbarProps } from "@/types/sms";

/**
 * Renders the batch selection and action toolbar for messages.
 *
 * @param props - Component properties for batch message toolbar
 * @returns JSX element for batch message operations
 */
export function MessageBatchToolbar({
  totalCount,
  selectedCount,
  isAllSelected,
  isIndeterminate,
  onToggleSelectAll,
  onMarkSelectedAsRead,
  onClearSelection,
  isUpdating,
}: MessageBatchToolbarProps) {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border text-xs">
      <div className="flex items-center space-x-2">
        <label className="flex items-center space-x-2 cursor-pointer select-none">
          <input
            ref={checkboxRef}
            type="checkbox"
            checked={isAllSelected}
            onChange={onToggleSelectAll}
            disabled={totalCount === 0 || isUpdating}
            className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer disabled:opacity-50"
            aria-label="Select all messages"
          />
          <span className="font-medium text-foreground">
            {selectedCount > 0 ? (
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                {selectedCount} of {totalCount} selected
              </span>
            ) : (
              <span className="text-muted-foreground">Select All ({totalCount})</span>
            )}
          </span>
        </label>
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center space-x-1.5 animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => onMarkSelectedAsRead(true)}
            disabled={isUpdating}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all text-xs font-medium shadow-xs disabled:opacity-50"
            title="Mark selected messages as read"
          >
            {isUpdating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCheck className="w-3.5 h-3.5" />
            )}
            <span>Read</span>
          </button>

          <button
            type="button"
            onClick={() => onMarkSelectedAsRead(false)}
            disabled={isUpdating}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-card border border-border text-foreground hover:bg-muted active:scale-95 transition-all text-xs font-medium shadow-xs disabled:opacity-50"
            title="Mark selected messages as unread"
          >
            <Mail className="w-3.5 h-3.5 text-blue-500" />
            <span>Unread</span>
          </button>

          <button
            type="button"
            onClick={onClearSelection}
            disabled={isUpdating}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
            title="Clear selection"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

