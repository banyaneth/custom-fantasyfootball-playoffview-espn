import { useMemo } from "react";

import { MatchupCard } from "@/components/MatchupCard";
import { computeBracket } from "@/lib/bracket/compute";
import { BracketConfig, NormalizedWeek } from "@/lib/types";

type SeriesTotals = Record<number, { total: number; projected?: number }>;

function buildSeriesTotals(weeks: NormalizedWeek[], teamIds: number[]) {
  const totals: SeriesTotals = {};
  for (const id of teamIds) {
    let total = 0;
    let projected = 0;
    for (const w of weeks) {
      const t = w?.teams?.[id];
      if (t) {
        total += t.score ?? 0;
        // Projected: use current score + remaining week projection; if projection missing, skip
        const remaining = estimateRemainingProjection(t.players);
        projected += t.score + remaining;
      }
    }
    totals[id] = { total, projected: projected > 0 ? projected : undefined };
  }
  return totals;
}

function estimateRemainingProjection(roster: NormalizedWeek["teams"][number]["players"]) {
  // rough: sum projected for starters - current points to get remaining, but keep simple
  const starters = roster.starters ?? [];
  const proj = starters.reduce((sum, p) => sum + (p.projected ?? 0), 0);
  return proj;
}

export function Bracket({
  config,
  liveWeek,
  semiWeeks,
}: {
  config: BracketConfig;
  liveWeek: NormalizedWeek | undefined;
  semiWeeks: NormalizedWeek[];
}) {
  const bracket = useMemo(
    () => (liveWeek ? computeBracket(config, liveWeek) : null),
    [config, liveWeek],
  );

  const allTeams = Object.values(config.seeds).map(Number);
  const semiTotals = useMemo(
    () => buildSeriesTotals(semiWeeks, allTeams),
    [semiWeeks, allTeams],
  );

  if (!bracket) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
        Loading bracket...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MatchupCard
        title="Semifinal A (Weeks 14-15)"
        teamAId={bracket.semi1.teamA}
        teamBId={bracket.semi1.teamB}
        week={liveWeek}
        seriesTotals={semiTotals}
      />
      <MatchupCard
        title="Semifinal B (Weeks 14-15)"
        teamAId={bracket.semi2.teamA}
        teamBId={bracket.semi2.teamB}
        week={liveWeek}
        seriesTotals={semiTotals}
      />
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 shadow-inner">
        Final (Weeks 16-17): TBD after semis finish.
      </div>
    </div>
  );
}

