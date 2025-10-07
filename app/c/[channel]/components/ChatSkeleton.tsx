"use client";

import { Message } from "@/app/c/[channel]/message";
import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton() {
  return (
    <div className="flex h-screen">
      <div className="relative flex flex-col min-h-0 flex-1 chat-bg">
        <div className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-neutral-200">
          <div className="px-4 py-3">
            <Skeleton className="h-6 w-64 rounded-sm" />
          </div>
        </div>

        <div className="chat-messages-container flex-1 px-3 md:px-4 overflow-y-auto overflow-x-hidden flex flex-col">
          <div className="flex-1 flex flex-col justify-end">
            <div className="space-y-0.5 pb-3 pt-3">
              {Array.from({ length: 35 }, (_, i) => (
                <Message key={i} isLoading loadingIndex={i} />
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white/85 backdrop-blur-md border-t border-neutral-200 pt-3 px-3">
          <textarea
            rows={1}
            disabled
            className="w-full resize-none rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
          />
          <div className="mb-2 h-4 text-[11px] text-neutral-500">
            <Skeleton className="h-3 w-32 rounded-sm" />
          </div>
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
