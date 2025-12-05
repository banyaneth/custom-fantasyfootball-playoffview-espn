import { BracketConfig } from "@/lib/types";

export const DEFAULT_CONFIG: BracketConfig = {
  version: 1,
  season: Number(process.env.NEXT_PUBLIC_SEASON ?? 2025),
  leagueId: Number(process.env.NEXT_PUBLIC_LEAGUE_ID ?? 1319196),
  seeds: {
    "1": 2, // Rodgers Wireless XVIII
    "2": 10, // Try That In A Small Town
    "3": 5, // Team Team
    "4": 4, // Brady's Bunch XVIII
  },
  reseedFinals: false,
  thirdPlace: false,
};

const STORAGE_KEY = "gisele-bracket-config";

export function loadConfig(): BracketConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  const hashConfig = decodeConfigFromHash();
  if (hashConfig) return hashConfig;

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return DEFAULT_CONFIG;
  try {
    const parsed = JSON.parse(saved);
    if (parsed?.version === 1) return parsed as BracketConfig;
  } catch {
    // ignore parse errors
  }
  return DEFAULT_CONFIG;
}

export function saveConfig(config: BracketConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function exportConfig(config: BracketConfig): string {
  return JSON.stringify(config, null, 2);
}

export function importConfig(raw: string): BracketConfig | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.version === 1) return parsed as BracketConfig;
  } catch {
    return null;
  }
  return null;
}

export function encodeConfigToHash(config: BracketConfig): string {
  const encoded = encodeURIComponent(JSON.stringify(config));
  return `#config=${encoded}`;
}

export function decodeConfigFromHash(): BracketConfig | null {
  if (typeof window === "undefined") return null;
  if (!window.location.hash.startsWith("#config=")) return null;
  const encoded = window.location.hash.replace("#config=", "");
  try {
    const parsed = JSON.parse(decodeURIComponent(encoded));
    if (parsed?.version === 1) return parsed as BracketConfig;
  } catch {
    return null;
  }
  return null;
}

