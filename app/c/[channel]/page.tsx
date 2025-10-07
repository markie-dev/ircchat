"use client";

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { use, useRef } from "react";
import NotFound from "@/app/not-found";
import { HashIcon } from "lucide-react";
import { MessageList } from "@/app/c/[channel]/components/MessageList";
import { MessageComposer } from "@/app/c/[channel]/components/MessageComposer";
import { PresenceSidebar } from "@/app/c/[channel]/components/PresenceSidebar";
import { ChatSkeleton } from "@/app/c/[channel]/components/ChatSkeleton";
import { usePresence } from "@/hooks/usePresence";
import { useMessageComposer } from "@/hooks/useMessageComposer";
import { useScrollbarColor } from "@/hooks/useScrollbarColor";
import { useAutoScrollToEnd } from "@/hooks/useAutoScrollToEnd";

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

  const presence = usePresence(
    combined?.kind === "success" ? combined.channel._id : undefined,
    currentUser?._id ?? null
  );
  const online = presence.online;
  const typingUsers = presence.typingUsers;

  const isLoading = combined === undefined || online === undefined;

  const sendMessage = useMutation(api.channels.sendMessage);
  const composer = useMessageComposer({
    onSubmit: async () => {
      if (combined?.kind !== "success") return;
      await sendMessage({
        channelId: combined.channel._id,
        content: composer.value.trim(),
      });
    },
    onTyping: presence.sendTyping,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useAutoScrollToEnd(messagesEndRef, [
    isLoading,
    combined?.kind,
    combined?.kind === "success" ? combined.messages.length : 0,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    await composer.handleSubmit(e);
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView();
    });
  };
  const onComposerKeyDown = composer.onKeyDown;
  const onComposerChange = composer.onChange;
  const onComposerBlur = composer.onBlur;

  const scrollbarColor = useScrollbarColor(currentUser?.username);

  if (isLoading) {
    return <ChatSkeleton />;
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
            <MessageList
              messages={messages as unknown as Array<any>}
              endRef={messagesEndRef}
            />
          )}
        </div>
        <MessageComposer
          value={composer.value}
          onChange={onComposerChange}
          onKeyDown={onComposerKeyDown}
          onBlur={onComposerBlur}
          onSubmit={handleSubmit}
          placeholder={`message #${channel.name}`}
          typingNames={(typingUsers ?? [])
            .filter((u) => u.id !== currentUser?._id)
            .map((u) => u.name)}
        />
      </div>
      <PresenceSidebar
        users={(online?.users ?? []).map((u) => ({
          id: String(u.id),
          name: u.name,
        }))}
        anonymous={online?.anonymous ?? 0}
      />
    </div>
  );
}
