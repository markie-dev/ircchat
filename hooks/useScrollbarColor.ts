import { useMemo } from "react";
import { usernameAccentColor } from "@/lib/color";

export function useScrollbarColor(username?: string) {
  return useMemo(() => usernameAccentColor(username), [username]);
}
