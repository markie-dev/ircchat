export function DateDivider({ label }: { label: string }) {
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
