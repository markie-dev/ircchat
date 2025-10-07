export function hashUsernameToHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 360;
}

export function usernameAccentColor(username?: string | null): string {
  if (!username) return "#6b7280";
  const hue = hashUsernameToHue(username);
  return `oklch(0.55 0.18 ${hue})`;
}
