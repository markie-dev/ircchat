"use client";

import * as React from "react";
import { TypingIndicator } from "./TypingIndicator";

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onBlur: () => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder: string;
  typingNames: Array<string>;
};

export function MessageComposer({
  value,
  onChange,
  onKeyDown,
  onBlur,
  onSubmit,
  placeholder,
  typingNames,
}: Props) {
  return (
    <div className="sticky bottom-0 bg-white/85 backdrop-blur-md border-t border-neutral-200 pt-3 px-3">
      <form onSubmit={onSubmit}>
        <textarea
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={1}
          className="w-full resize-none rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
        />
        <TypingIndicator names={typingNames} />
      </form>
    </div>
  );
}
