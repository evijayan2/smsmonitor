"use client";

import { MouseEvent } from "react";
import { User, ChevronRight } from "lucide-react";
import { MessageListItemProps } from "@/types/sms";

/**
 * Renders an individual message item within the sidebar list.
 *
 * @param props - Component properties for the message list item
 * @returns JSX element representing the message row
 */
export function MessageListItem({
  message,
  isSelected,
  isActive,
  onToggleSelect,
  onSelectMessage,
}: MessageListItemProps) {
  const handleCheckboxClick = (e: MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onToggleSelect(message.id);
  };

  const formattedTime = new Date(message.receivedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelectMessage(message)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectMessage(message);
        }
      }}
      className={`w-full relative text-left p-3.5 transition-all border-b border-border/50 flex items-start space-x-3 group cursor-pointer ${
        isActive
          ? "bg-blue-600/10 border-l-4 border-l-blue-600"
          : isSelected
          ? "bg-blue-500/5 border-l-4 border-l-blue-400/50"
          : "hover:bg-muted/50 border-l-4 border-l-transparent"
      }`}
    >
      <div className="pt-2 flex items-center shrink-0">
        <input
          type="checkbox"
          checked={isSelected}
          onClick={handleCheckboxClick}
          onChange={() => {}}
          aria-label={`Select message from ${message.sender}`}
          className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      </div>

      <div
        className={`w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border transition-colors ${
          isActive ? "group-hover:border-blue-500/50" : ""
        }`}
      >
        <User
          className={`w-4 h-4 transition-colors ${
            isActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
          }`}
        />
      </div>

      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center justify-between mb-0.5">
          <span
            className={`text-sm ${
              message.isRead ? "font-medium text-foreground" : "font-bold text-blue-600 dark:text-blue-400"
            } truncate`}
          >
            {message.sender}
          </span>
          <span
            className={`text-[10px] ${
              message.isRead ? "text-muted-foreground" : "text-blue-500 font-bold"
            } whitespace-nowrap ml-2`}
          >
            {formattedTime}
          </span>
        </div>
        <p
          className={`text-xs ${
            message.isRead ? "text-muted-foreground" : "text-foreground font-medium"
          } line-clamp-1`}
        >
          {message.content}
        </p>
      </div>

      {!message.isRead && (
        <span
          className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] shrink-0 self-center mr-1"
          aria-label="Unread message"
        />
      )}

      <ChevronRight
        className={`w-4 h-4 self-center transition-transform shrink-0 ${
          isActive ? "text-blue-500 translate-x-0.5" : "text-muted-foreground/30"
        }`}
      />
    </div>
  );
}

