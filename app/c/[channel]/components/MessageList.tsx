"use client";

import * as React from "react";
import { Message as MessageRow } from "@/app/c/[channel]/message";
import { DateDivider } from "./DateDivider";
import { formatDay } from "@/lib/dates";

type MessageDoc = Parameters<typeof MessageRow>[0] extends { message?: infer M }
  ? NonNullable<M>
  : never;

const MemoMessage = React.memo(MessageRow);

export const MessageList = React.memo(function MessageList({
  messages,
  endRef,
}: {
  messages: Array<MessageDoc>;
  endRef?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
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
              <MemoMessage message={m} />
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
    </div>
  );
});
