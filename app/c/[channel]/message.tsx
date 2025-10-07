"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface Message {
  _id: string;
  username: string;
  _creationTime: number;
  content: string;
}

interface MessageProps {
  message?: Message;
  isLoading?: boolean;
  loadingIndex?: number;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else {
    return date.toLocaleString();
  }
}

export function Message({
  message,
  isLoading,
  loadingIndex = 0,
}: MessageProps) {
  if (isLoading) {
    const contentWidths = [
      "w-32",
      "w-72",
      "w-84",
      "w-56",
      "w-40",
      "w-28",
      "w-36",
      "w-52",
    ];
    const width = contentWidths[loadingIndex % contentWidths.length];
    return (
      <div className="px-2 overflow-hidden">
        <div className="text-[13px] leading-6 overflow-hidden">
          <Skeleton className="h-3 w-12 inline-block rounded-sm mr-1" />
          <Skeleton className="h-3 w-16 inline-block rounded-sm mr-1" />
          <Skeleton className={`h-3 rounded-sm inline-block ${width}`} />
        </div>
      </div>
    );
  }

  if (!message) return null;
  const hashUsernameToHue = (name: string): number => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) % 360;
  };

  const renderContent = (text: string) => {
    // simple URL + mention highlighting
    const parts = text.split(/(https?:\/\/[^\s]+|@[A-Za-z0-9_\-]+)/g);
    return parts.map((part, i) => {
      if (/^https?:\/\//.test(part)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noreferrer"
            className="underline text-blue-600 hover:text-blue-700"
          >
            {part}
          </a>
        );
      }
      if (/^@[A-Za-z0-9_\-]+$/.test(part)) {
        return (
          <span
            key={i}
            className="px-1 rounded bg-neutral-100 text-neutral-800"
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const hue = hashUsernameToHue(message.username);
  return (
    <div className="px-2 overflow-hidden">
      <div className="text-[13px] leading-6 overflow-hidden">
        <span className="text-neutral-500 tabular-nums select-none text-xs">
          {formatTimestamp(message._creationTime)}
        </span>{" "}
        <span style={{ color: `oklch(0.55 0.18 ${hue})` }}>
          @{message.username}
        </span>{" "}
        <span
          className="text-neutral-900 break-words overflow-wrap-anywhere max-w-full"
          style={{ wordBreak: "break-all" }}
        >
          {renderContent(message.content)}
        </span>
      </div>
    </div>
  );
}
