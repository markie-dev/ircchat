export function formatTypingNames(names: Array<string>): string {
  if (names.length === 0) return "\u00A0";
  if (names.length === 1) return `${names[0]} is typing...`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
  const shown = names.slice(0, 2);
  const extra = names.length - shown.length;
  return `${shown[0]}, ${shown[1]}, and ${extra} more are typing...`;
}

export function TypingIndicator({ names }: { names: Array<string> }) {
  const text = formatTypingNames(names);
  return <div className="mb-2 h-4 text-[11px] text-neutral-500">{text}</div>;
}
