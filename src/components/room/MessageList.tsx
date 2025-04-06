import { useEffect, useRef } from "react";
import { Id } from "../../../convex/_generated/dataModel";

interface Message {
  _id: Id<"messages">;
  content: string;
  userId: string;
  createdAt: number;
}

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  currentUserName?: string;
  partnerName?: string;
}

export function MessageList({
  messages,
  currentUserId,
  currentUserName,
  partnerName,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto space-y-5 mb-4 px-2">
      {messages.map((msg) => {
        const isCurrentUser = msg.userId === currentUserId;
        return (
          <div
            key={msg._id}
            className={`flex items-end gap-2 ${
              isCurrentUser ? "justify-end" : "justify-start"
            }`}
          >
            {!isCurrentUser && (
              <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-accent text-accent-content text-xs font-semibold">
                <span>{partnerName?.charAt(0).toUpperCase() ?? "P"}</span>
              </div>
            )}
            <div
              className={`group relative max-w-[70%] rounded-2xl px-4 py-2 ${
                isCurrentUser
                  ? "bg-primary text-primary-content rounded-br-sm"
                  : "bg-accent rounded-bl-sm text-accent-content"
              }`}
            >
              <p className="break-words whitespace-pre-wrap">{msg.content}</p>
              <span
                className={`absolute -bottom-4 text-primary text-[10px] opacity-0 group-hover:opacity-70 transition-opacity ${
                  isCurrentUser ? "right-0" : "left-0"
                }`}
              >
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {isCurrentUser && (
              <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-primary text-primary-content text-xs font-semibold">
                <span>{currentUserName?.charAt(0).toUpperCase() ?? "Y"}</span>
              </div>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} className="h-6" />
    </div>
  );
}
