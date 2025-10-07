"use client";

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { use, useRef, useState, useEffect, useMemo } from "react";
import NotFound from "@/app/not-found";
import { HashIcon } from "lucide-react";
import { Message } from "@/app/components/message";
import { Skeleton } from "@/components/ui/skeleton";

function hashUsernameToHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 360;
}

function DateDivider({ label }: { label: string }) {
  return (
    <div className="my-3 flex items-center" role="separator" aria-label={label}>
      <div className="h-px flex-1 bg-neutral-200" />
      <span className="mx-2 bg-white px-2 text-[11px] text-neutral-500 border border-neutral-200 rounded-full">
        {label}
      </span>
      <div className="h-px flex-1 bg-neutral-200" />
    </div>
  );
}

export default function Channel({
  params,
}: {
  params: Promise<{ channel: string }>;
}) {
  const { channel: channelName } = use(params);

  const combined = useQuery(api.channels.getChannelWithMessages, {
    name: channelName,
  });
  const currentUser = useQuery(api.users.getCurrentUser);
  const online = useQuery(
    api.presence.listOnline,
    combined?.kind === "success" ? { channelId: combined.channel._id } : "skip"
  );

  const isLoading = combined === undefined;

  const sendMessage = useMutation(api.channels.sendMessage);
  const [messageContent, setMessageContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const heartbeat = useMutation(api.presence.heartbeat);
  const leave = useMutation(api.presence.leave);

  useEffect(() => {
    if (combined?.kind === "success" && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  }, [combined?.kind]);

  const anonKey = useMemo(() => {
    if (typeof window === "undefined") return null;
    const keyName = "ircchat_anon_key";
    let key = window.localStorage.getItem(keyName);
    if (!key) {
      key = window.crypto.randomUUID();
      window.localStorage.setItem(keyName, key);
    }
    return key;
  }, []);

  useEffect(() => {
    if (combined?.kind !== "success") return;
    let timer: number | undefined;
    const doBeat = () => {
      heartbeat({
        channelId: combined.channel._id,
        anonKey: currentUser ? undefined : (anonKey ?? undefined),
      }).catch(() => {});
      timer = window.setTimeout(doBeat, 10000);
    };
    doBeat();
    return () => {
      if (timer) window.clearTimeout(timer);
      leave({
        channelId: combined.channel._id,
        anonKey: currentUser ? undefined : (anonKey ?? undefined),
        userId: currentUser?._id,
      }).catch(() => {});
    };
  }, [
    combined?.kind,
    combined?.kind === "success" ? combined.channel._id : undefined,
    currentUser?.username,
    anonKey,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || combined?.kind !== "success") return;

    await sendMessage({
      channelId: combined.channel._id,
      content: messageContent.trim(),
    });
    setMessageContent("");

    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView();
      }
    });
  };

  const onComposerKeyDown = async (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // submit
      await handleSubmit(new Event("submit") as unknown as React.FormEvent);
    }
  };

  const formatDay = (ts: number) => {
    const d = new Date(ts);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    if (isToday) return "Today";
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="relative flex flex-col min-h-0 flex-1 chat-bg">
          {/* Header skeleton */}
          <div className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-neutral-200">
            <div className="px-4 py-3">
              <Skeleton className="h-6 w-64 rounded-sm" />
            </div>
          </div>

          {/* Messages skeleton */}
          <div className="chat-messages-container flex-1 px-3 md:px-4 overflow-y-auto overflow-x-hidden flex flex-col">
            <div className="flex-1 flex flex-col justify-end">
              <div className="space-y-0.5 pb-3 pt-3">
                {Array.from({ length: 35 }, (_, i) => (
                  <Message key={i} isLoading loadingIndex={i} />
                ))}
              </div>
            </div>
          </div>

          {/* Message input */}
          <div className="sticky bottom-0 bg-white/85 backdrop-blur-md border-t border-neutral-200 p-3">
            <textarea
              rows={1}
              disabled
              className="w-full resize-none rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
            />
          </div>
        </div>
        <aside className="hidden md:block w-64 border-l border-neutral-200 bg-white">
          <div className="p-4">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
              Online
            </h2>
            <div className="space-y-2">
              {["w-24", "w-16", "w-28", "w-20", "w-32"].map((w, i) => (
                <div key={`skeleton-${i}`} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neutral-200 rounded-full flex-shrink-0" />
                  <Skeleton className={`h-4 ${w} rounded-sm`} />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    );
  }
  if (combined.kind === "not_found") {
    return <NotFound error="unfortunately, this channel does not exist" />;
  }
  if (combined.kind === "access_denied") {
    return (
      <NotFound error="unfortunately, you do not have access to this channel" />
    );
  }
  const { channel, messages } = combined;

  const scrollbarColor = currentUser?.username
    ? `oklch(0.55 0.18 ${hashUsernameToHue(currentUser.username)})`
    : "#6b7280";

  return (
    <div className="flex h-screen">
      <div className="relative flex flex-col min-h-0 flex-1 chat-bg">
        <div className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-neutral-200">
          <div className="px-4 py-3 flex items-center gap-2">
            <HashIcon className="w-4 h-4 text-neutral-500" />
            <h1 className="text-sm font-semibold tracking-wide">
              {channel.name}
            </h1>
            <span className="text-neutral-400">—</span>
            <p className="text-xs text-neutral-500 truncate">
              {channel.description}
            </p>
          </div>
        </div>
        <div
          className="chat-messages-container flex-1 px-3 md:px-4 overflow-y-auto overflow-x-hidden flex flex-col"
          style={
            {
              "--scrollbar-color": scrollbarColor,
            } as React.CSSProperties
          }
        >
          {messages.length === 0 ? (
            <div className="text-neutral-400 text-sm flex-1 flex items-end pb-4">
              no messages yet - be the first to say hi!
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-end">
              <div className="space-y-0.5 pb-3 pt-2">
                {messages.map((m, idx) => {
                  const prev = idx > 0 ? messages[idx - 1] : null;
                  const showDivider =
                    !prev ||
                    new Date(prev._creationTime).toDateString() !==
                      new Date(m._creationTime).toDateString();
                  return (
                    <div key={m._id}>
                      {showDivider && (
                        <DateDivider label={formatDay(m._creationTime)} />
                      )}
                      <Message message={m} />
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>
        <div className="sticky bottom-0 bg-white/85 backdrop-blur-md border-t border-neutral-200 p-3">
          <form onSubmit={handleSubmit}>
            <textarea
              ref={textareaRef}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyDown={onComposerKeyDown}
              placeholder={`message #${channel.name}`}
              rows={1}
              className="w-full resize-none rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
            />
          </form>
        </div>
      </div>
      <aside className="hidden md:block w-64 border-l border-neutral-200 bg-white">
        <div className="p-4">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
            Online
          </h2>
          <div className="space-y-1">
            {(online?.users ?? []).map((u) => (
              <div
                key={`u-${String(u.id)}`}
                className="flex items-center gap-2 text-sm text-neutral-800"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                {u.name}
              </div>
            ))}
            {online && online.anonymous > 0 && (
              <div className="flex items-center gap-2 text-sm text-neutral-800">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                {online.anonymous === 1
                  ? "anonymous"
                  : `anonymous x${online.anonymous}`}
              </div>
            )}
            {!online && (
              <div className="space-y-2">
                {["w-24", "w-16", "w-28", "w-20", "w-32"].map((w, i) => (
                  <div
                    key={`skeleton-live-${i}`}
                    className="flex items-center gap-2"
                  >
                    <div className="w-2 h-2 bg-neutral-200 rounded-full flex-shrink-0" />
                    <Skeleton className={`h-4 ${w} rounded-sm`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
