"use client";

import { useEffect, useMemo, useRef } from "react";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";

export function usePresence(
  channelId: Id<"channels"> | undefined,
  currentUserId?: Id<"users"> | null
) {
  const heartbeat = useMutation(api.presence.heartbeat);
  const leave = useMutation(api.presence.leave);
  const typingBeat = useMutation(api.presence.typingBeat);

  const online = useQuery(
    api.presence.listOnline,
    channelId ? { channelId } : "skip"
  );
  const typingUsers = useQuery(
    api.presence.listTyping,
    channelId ? { channelId } : "skip"
  );

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
    if (!channelId) return;
    let timer: number | undefined;
    const doBeat = () => {
      heartbeat({
        channelId,
        anonKey: currentUserId ? undefined : (anonKey ?? undefined),
      }).catch(() => {});
      timer = window.setTimeout(doBeat, 10000);
    };
    doBeat();
    return () => {
      if (timer) window.clearTimeout(timer);
      leave({
        channelId,
        anonKey: currentUserId ? undefined : (anonKey ?? undefined),
        userId: currentUserId ?? undefined,
      }).catch(() => {});
    };
  }, [channelId, currentUserId, anonKey]);

  const typingThrottleRef = useRef<{ last: number; timeout?: number }>({
    last: 0,
  });

  const sendTyping = (typing: boolean) => {
    if (!channelId) return;
    if (!currentUserId) return; // todo: support anonymous typing
    if (!typing) {
      typingBeat({ channelId, typing: false }).catch(() => {});
      typingThrottleRef.current.last = 0;
      if (typingThrottleRef.current.timeout) {
        window.clearTimeout(typingThrottleRef.current.timeout);
        typingThrottleRef.current.timeout = undefined;
      }
      return;
    }
    const now = Date.now();
    const elapsed = now - typingThrottleRef.current.last;
    const interval = 2000;
    if (elapsed >= interval) {
      typingThrottleRef.current.last = now;
      typingBeat({ channelId, typing: true }).catch(() => {});
      return;
    }
    if (!typingThrottleRef.current.timeout) {
      typingThrottleRef.current.timeout = window.setTimeout(() => {
        typingThrottleRef.current.timeout = undefined;
        typingThrottleRef.current.last = Date.now();
        typingBeat({ channelId, typing: true }).catch(() => {});
      }, interval - elapsed);
    }
  };

  return { online, typingUsers, sendTyping } as const;
}
