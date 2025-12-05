/* eslint-disable @typescript-eslint/no-explicit-any */
import { NormalizedLeague } from "@/lib/types";

export function normalizeLeague(raw: any): NormalizedLeague {
  const season = raw?.seasonId ?? raw?.settings?.season ?? null;
  const leagueId = raw?.id ?? raw?.leagueId ?? null;

  const currentWeek =
    raw?.status?.latestScoringPeriod ?? raw?.status?.currentScoringPeriod ?? null;

  const teams =
    raw?.teams?.map((team: any) => {
      const ownerName = Array.isArray(team.owners)
        ? team.owners[0]
        : team.owners ?? undefined;
      return {
        teamId: team.id,
        name: `${team.location ?? ""}${team.nickname ?? ""}`.trim() ||
          team.name ||
          `Team ${team.id}`,
        ownerName,
      };
    }) ?? [];

  return {
    season: season ?? 0,
    leagueId: leagueId ?? 0,
    currentWeek,
    fetchedAt: new Date().toISOString(),
    teams,
  };
}

