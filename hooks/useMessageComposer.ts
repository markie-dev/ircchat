"use client";

import * as React from "react";

type Options = {
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  onTyping: (typing: boolean) => void;
};

export function useMessageComposer({ onSubmit, onTyping }: Options) {
  const [value, setValue] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    await onSubmit(e);
    setValue("");
    onTyping(false);
    requestAnimationFrame(() => {
      textareaRef.current?.scrollIntoView();
    });
  };

  const onKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await handleSubmit(new Event("submit") as unknown as React.FormEvent);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setValue(text);
    onTyping(text.trim().length > 0);
  };

  const onBlur = () => onTyping(false);

  return {
    value,
    setValue,
    textareaRef,
    handleSubmit,
    onKeyDown,
    onChange,
    onBlur,
  } as const;
}
