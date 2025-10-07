import { usernameAccentColor } from "@/lib/color";

export function PresenceSidebar({
  users,
  anonymous,
}: {
  users: Array<{ id: string; name: string }>;
  anonymous: number;
}) {
  return (
    <aside className="hidden md:block w-64 border-l border-neutral-200 bg-white">
      <div className="p-4">
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
          Online
        </h2>
        <div className="space-y-1">
          {users.map((u) => (
            <div
              key={`u-${u.id}`}
              className="flex items-center gap-2 text-sm text-neutral-800"
            >
              <div
                className="w-[6px] h-[6px] rounded-full flex-shrink-0"
                style={{ backgroundColor: usernameAccentColor(u.name) }}
              ></div>
              <span style={{ color: usernameAccentColor(u.name) }}>
                @{u.name}
              </span>
            </div>
          ))}
          {anonymous > 0 && (
            <div className="flex items-center gap-2 text-sm text-neutral-800">
              <div className="w-[6px] h-[6px] bg-green-500 rounded-full flex-shrink-0"></div>
              {anonymous === 1 ? "anonymous" : `anonymous x${anonymous}`}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
