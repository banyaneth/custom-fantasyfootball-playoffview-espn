export type PlayerStatus = "not_started" | "in_progress" | "final" | "unknown";

export interface NormalizedPlayer {
  id?: number;
  name: string;
  lineupSlotId: number;
  lineupSlot: string;
  lineupSlotOrder?: number;
  defaultPositionId?: number;
  position?: string;
  points: number;
  projected: number;
  status?: PlayerStatus;
}

export interface NormalizedRoster {
  starters: NormalizedPlayer[];
  bench: NormalizedPlayer[];
  ir: NormalizedPlayer[];
}

export interface NormalizedTeamWeek {
  teamId: number;
  name: string;
  ownerName?: string;
  score: number;
  projected?: number;
  players: NormalizedRoster;
}

export interface NormalizedWeek {
  season: number;
  leagueId: number;
  week: number;
  fetchedAt: string;
  stale?: boolean;
  teams: Record<number, NormalizedTeamWeek>;
}

export interface NormalizedLeague {
  season: number;
  leagueId: number;
  fetchedAt: string;
  currentWeek: number | null;
  teams: {
    teamId: number;
    name: string;
    ownerName?: string;
  }[];
}

export interface BracketConfig {
  version: 1;
  season: number;
  leagueId: number;
  seeds: Record<"1" | "2" | "3" | "4", number>;
  reseedFinals: boolean;
  thirdPlace: boolean;
}

