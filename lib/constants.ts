export const DEFAULT_REFRESH_MS = Number(process.env.NEXT_PUBLIC_REFRESH_MS ?? 60000);
export const DEFAULT_CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS ?? 15000);

export const ROUND_WEEKS = {
  semi: [14, 15],
  final: [16, 17],
} as const;

