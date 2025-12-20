/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BENCH_SLOT_IDS,
  IR_SLOT_IDS,
  positionLabel,
  slotLabel,
} from "@/lib/espn/mappings";
import {
  NormalizedPlayer,
  NormalizedRoster,
  NormalizedTeamWeek,
  NormalizedWeek,
  PlayerStatus,
} from "@/lib/types";

type SlotLabelInfo = { label: string; order: number };

const PREFERRED_ORDER = [
  "QB",
  "RB",
  "WR",
  "TE",
  "FLEX",
  "D/ST",
  "DST",
  "DEF",
  "K",
  "OP",
  "BE",
  "BN",
  "IR",
];

// Slot ordering to mirror ESPN: QB, RB, RB, WR, WR, TE, FLEX, D/ST, K
const SLOT_ID_ORDER = [
  0, // QB/TQB
  1, // TQB alt
  2, // RB
  3, // WR
  4, // WR
  6, // TE (some leagues encode TE as 6)
  23, // FLEX
  7, // FLEX
  18, // FLEX alt
  11, // WR/TE alt
  22, // FLEX alt
  16, // D/ST
  28, // DEF alt
  17, // K
  5, // K alt
  20, // Bench
  15, // Bench alt
  21, // IR
  232, // IR alt
];

const SLOT_ID_RANK = SLOT_ID_ORDER.reduce((m, id, idx) => {
  m[id] = idx;
  return m;
}, {} as Record<number, number>);

const POSITION_FALLBACK: Record<number, SlotLabelInfo> = {
  1: { label: "QB", order: SLOT_ID_RANK[0] ?? 0 },
  5: { label: "K", order: SLOT_ID_RANK[17] ?? 13 },
  2: { label: "RB", order: SLOT_ID_RANK[2] ?? 2 },
  3: { label: "WR", order: SLOT_ID_RANK[4] ?? 4 },
  4: { label: "TE", order: SLOT_ID_RANK[6] ?? 5 },
  16: { label: "D/ST", order: SLOT_ID_RANK[16] ?? 11 },
};

function ensureTeam(
  teams: Record<number, NormalizedTeamWeek>,
  teamId: number,
  name?: string,
  ownerName?: string,
  logoUrl?: string,
) {
  if (!teams[teamId]) {
    teams[teamId] = {
      teamId,
      name: name ?? `Team ${teamId}`,
      ownerName,
      logoUrl,
      score: 0,
      players: { starters: [], bench: [], ir: [] },
    };
  }
  // Allow later calls to fill missing metadata.
  if (name && teams[teamId].name.startsWith("Team ")) teams[teamId].name = name;
  if (ownerName && !teams[teamId].ownerName) teams[teamId].ownerName = ownerName;
  if (logoUrl && !teams[teamId].logoUrl) teams[teamId].logoUrl = logoUrl;
  return teams[teamId];
}

function extractTeamLogoUrl(team: any): string | undefined {
  if (!team) return undefined;
  if (typeof team.logo === "string" && team.logo.length > 0) return team.logo;
  const logos = team.logos;
  if (Array.isArray(logos) && logos.length > 0) {
    const href =
      logos.find((l: any) => typeof l?.href === "string" && l.href.length > 0)
        ?.href ??
      logos.find((l: any) => typeof l?.url === "string" && l.url.length > 0)
        ?.url ??
      (typeof logos[0]?.href === "string" ? logos[0].href : undefined) ??
      (typeof logos[0]?.url === "string" ? logos[0].url : undefined);
    if (typeof href === "string" && href.length > 0) return href;
  }
  return undefined;
}

function statValue(entry: any, week: number, sourceId: number): number | undefined {
  const stat = entry?.stats?.find(
    (s: any) => s?.scoringPeriodId === week && s?.statSourceId === sourceId,
  );
  if (stat?.appliedTotal != null) return Number(stat.appliedTotal);
  if (stat?.appliedStats) {
    return Object.values(stat.appliedStats).reduce(
      (sum: number, val: any) => sum + Number(val ?? 0),
      0,
    );
  }
  return undefined;
}

function deriveStatus(points: number, projected: number): PlayerStatus {
  if (points === 0 && projected > 0) return "not_started";
  if (points > 0 && projected === 0) return "final";
  if (points > 0 && projected > 0) return "in_progress";
  return "unknown";
}

function normalizePlayer(
  entry: any,
  week: number,
  slotMap: Map<number, SlotLabelInfo>,
  slotOverride?: number,
  statOverride?: { points?: number; projected?: number },
): NormalizedPlayer {
  const player = entry?.playerPoolEntry?.player ?? entry?.player;
  const playerStats: any[] = player?.stats ?? [];
  const actualWeekStat = playerStats.find(
    (s) => s?.statSourceId === 0 && s?.scoringPeriodId === week,
  );
  const projWeekStat = playerStats.find(
    (s) => s?.statSourceId === 1 && s?.scoringPeriodId === week,
  );
  const lineupSlotId =
    slotOverride && slotOverride !== 0 ? slotOverride : entry?.lineupSlotId;
  const slotInfo = slotMap.get(lineupSlotId ?? -1);
  const rank =
    lineupSlotId != null && lineupSlotId in SLOT_ID_RANK
      ? SLOT_ID_RANK[lineupSlotId]
      : undefined;
  const posFallback =
    player?.defaultPositionId != null
      ? POSITION_FALLBACK[player.defaultPositionId]
      : undefined;
  const points =
    statOverride?.points ??
    statValue(entry, week, 0) ??
    actualWeekStat?.appliedTotal ??
    0;
  const projected =
    statOverride?.projected ??
    statValue(entry, week, 1) ??
    projWeekStat?.appliedTotal ??
    entry?.projectedTotal ??
    0;

  const chosenLabel = posFallback?.label ?? slotInfo?.label ?? slotLabel(lineupSlotId);
  const chosenOrder =
    posFallback?.order ??
    rank ??
    slotInfo?.order ??
    (lineupSlotId != null ? 100 + lineupSlotId : undefined);

  return {
    id: player?.id,
    name: player?.fullName ?? "Player",
    lineupSlotId: lineupSlotId ?? -1,
    lineupSlot: chosenLabel,
    lineupSlotOrder: chosenOrder,
    defaultPositionId: player?.defaultPositionId,
    position: positionLabel(player?.defaultPositionId),
    points: Number(points ?? 0),
    projected: Number(projected ?? 0),
    status: deriveStatus(Number(points ?? 0), Number(projected ?? 0)),
  };
}

function buildSlotOverrideMap(rawTeams: any[]) {
  const slotMap = new Map<number, Map<number, number>>();
  for (const t of rawTeams ?? []) {
    const m = new Map<number, number>();
    for (const entry of t?.roster?.entries ?? []) {
      if (entry?.playerId != null && entry?.lineupSlotId != null) {
        m.set(entry.playerId, entry.lineupSlotId);
      }
    }
    if (m.size > 0) slotMap.set(t.id, m);
  }
  return slotMap;
}

function buildTeamRosterMap(rawTeams: any[]) {
  const rosterMap = new Map<number, any[]>();
  for (const t of rawTeams ?? []) {
    if (t?.roster?.entries?.length) {
      rosterMap.set(t.id, t.roster.entries);
    }
  }
  return rosterMap;
}

function deriveSlotLabels(rawTeams: any[]): Map<number, SlotLabelInfo> {
  const counts = new Map<number, Map<number, number>>(); // slotId -> posId -> count
  for (const t of rawTeams ?? []) {
    for (const entry of t?.roster?.entries ?? []) {
      const slot = entry?.lineupSlotId;
      const pos = entry?.playerPoolEntry?.player?.defaultPositionId;
      if (slot == null) continue;
      if (!counts.has(slot)) counts.set(slot, new Map<number, number>());
      const map = counts.get(slot)!;
      map.set(pos, (map.get(pos) ?? 0) + 1);
    }
  }

  const preferredOrder = new Map<string, number>();
  PREFERRED_ORDER.forEach((l, i) => preferredOrder.set(l, i));

  const labels = new Map<number, SlotLabelInfo>();
  for (const [slot, posCounts] of counts.entries()) {
    let modePos: number | undefined;
    let modeCount = 0;
    for (const [pos, cnt] of posCounts.entries()) {
      if (cnt > modeCount) {
        modeCount = cnt;
        modePos = pos;
      }
    }
    const multiple = posCounts.size > 1;
    let label: string;
    if (multiple) {
      label = "FLEX";
    } else if (
      modePos === -16002 ||
      modePos === -16008 ||
      slot === 16
    ) {
      label = "D/ST";
    } else if (slot === 17 && modePos === 5) {
      label = "K";
    } else if (modePos != null) {
      const mapped = positionLabel(modePos);
      label = mapped.startsWith("POS_") ? slotLabel(slot) : mapped;
      if (label === "POS_-1") label = slotLabel(slot);
    } else {
      label = slotLabel(slot);
    }

    const order = preferredOrder.has(label)
      ? preferredOrder.get(label)!
      : 100 + slot;
    labels.set(slot, { label, order });
  }
  return labels;
}

function buildPlayerStats(raw: any, week: number) {
  const stats = new Map<
    number,
    {
      points?: number;
      projected?: number;
    }
  >();
  for (const matchup of raw?.schedule ?? []) {
    for (const side of [matchup.home, matchup.away]) {
      const entries = pickRosterEntries(side, week) ?? [];
      for (const entry of entries) {
        const pid = entry?.playerId ?? entry?.playerPoolEntry?.player?.id;
        if (pid == null) continue;
        const pts = statValue(entry, week, 0);
        const proj = statValue(entry, week, 1) ?? entry?.projectedTotal;
        const existing = stats.get(pid) ?? {};
        stats.set(pid, {
          points: pts ?? existing.points,
          projected: proj ?? existing.projected,
        });
      }
    }
  }
  return stats;
}

function pickRosterEntries(side: any, week: number) {
  return (
    side?.rosterForMatchupPeriod?.entries ??
    side?.rosterForCurrentScoringPeriod?.entries ??
    side?.rosterForCurrentPeriod?.entries ??
    side?.rosterForScoringPeriod?.[week]?.entries ??
    []
  );
}

function mergeRoster(target: NormalizedRoster, players: NormalizedPlayer[]) {
  for (const p of players) {
    if (IR_SLOT_IDS.has(p.lineupSlotId)) {
      target.ir.push(p);
    } else if (BENCH_SLOT_IDS.has(p.lineupSlotId)) {
      target.bench.push(p);
    } else {
      target.starters.push(p);
    }
  }
}

function computeScoreFromRoster(roster: NormalizedRoster): number {
  return roster.starters.reduce((sum, p) => sum + (p.points ?? 0), 0);
}

function computeProjectionFromRoster(roster: NormalizedRoster): number {
  return roster.starters.reduce((sum, p) => sum + (p.projected ?? 0), 0);
}

export function normalizeWeek(raw: any, week: number): NormalizedWeek {
  const teamsInfo: Record<
    number,
    { name?: string; ownerName?: string; logoUrl?: string }
  > = {};
  (raw?.teams ?? []).forEach((t: any) => {
    teamsInfo[t.id] = {
      name: `${t.location ?? ""}${t.nickname ?? ""}`.trim() ||
        t.name ||
        `Team ${t.id}`,
      ownerName: Array.isArray(t.owners) ? t.owners[0] : t.owners,
      logoUrl: extractTeamLogoUrl(t),
    };
  });
  const slotOverrides = buildSlotOverrideMap(raw?.teams ?? []);
  const teamRosters = buildTeamRosterMap(raw?.teams ?? []);
  const slotLabels = deriveSlotLabels(raw?.teams ?? []);
  const playerStats = buildPlayerStats(raw, week);

  const result: NormalizedWeek = {
    season: raw?.seasonId ?? raw?.settings?.season ?? 0,
    leagueId: raw?.id ?? raw?.leagueId ?? 0,
    week,
    fetchedAt: new Date().toISOString(),
    teams: {},
  };

  // Ensure all teams exist first
  for (const [teamIdStr, info] of Object.entries(teamsInfo)) {
    const teamId = Number(teamIdStr);
    ensureTeam(result.teams, teamId, info.name, info.ownerName, info.logoUrl);
  }

  // Populate players from authoritative team rosters (no duplication)
  for (const [teamId, entries] of teamRosters.entries()) {
    const team = result.teams[teamId];
    if (!team) continue;
    team.players = { starters: [], bench: [], ir: [] };
    const players = entries.map((entry: any) =>
      normalizePlayer(
        entry,
        week,
        slotLabels,
        entry?.lineupSlotId,
        playerStats.get(entry?.playerId ?? entry?.playerPoolEntry?.player?.id),
      ),
    );
    mergeRoster(team.players, players);
    team.projected = computeProjectionFromRoster(team.players);
  }

  // Use schedule to set scores; if a team had no roster, fall back to schedule entries
  const schedule = raw?.schedule ?? [];
  for (const matchup of schedule) {
    const sides = [matchup.home, matchup.away];
    for (const side of sides) {
      if (!side?.teamId) continue;
      const team = result.teams[side.teamId];
      if (!team) continue;

      const pointsByWeek = side.pointsByScoringPeriod?.[String(week)];
      if (pointsByWeek != null) {
        team.score = Number(pointsByWeek ?? 0);
      }

      const hasPlayers =
        team.players.starters.length +
          team.players.bench.length +
          team.players.ir.length >
        0;
      if (hasPlayers) continue;

      const overrides = slotOverrides.get(side.teamId) ?? new Map<number, number>();
      const entries = pickRosterEntries(side, week) ?? [];
      const players = entries.map((entry: any) =>
        normalizePlayer(
          entry,
          week,
          slotLabels,
          overrides.get(entry?.playerId ?? entry?.playerPoolEntry?.player?.id),
          playerStats.get(entry?.playerId ?? entry?.playerPoolEntry?.player?.id),
        ),
      );
      mergeRoster(team.players, players);
      team.projected = computeProjectionFromRoster(team.players);
    }
  }

  // Fallback scoring if missing
  for (const team of Object.values(result.teams)) {
    if (!team.score || Number.isNaN(team.score)) {
      team.score = computeScoreFromRoster(team.players);
    }
  }

  return result;
}

