import { useMemo } from "react";

import { MatchupCard } from "@/components/MatchupCard";
import { computeSemisFromSeries } from "@/lib/bracket/compute";
import { BracketConfig, NormalizedWeek } from "@/lib/types";

type SeriesTotals = Record<number, { total: number }>;

function buildSeriesTotals(weeks: NormalizedWeek[], teamIds: number[]) {
  const totals: SeriesTotals = {};
  for (const id of teamIds) {
    let total = 0;
    for (const w of weeks) {
      const t = w?.teams?.[id];
      if (t) {
        total += t.score ?? 0;
      }
    }
    totals[id] = { total };
  }
  return totals;
}

export function Bracket({
  config,
  liveWeek,
  semiWeeks,
  finalWeeks,
  selectedWeek,
}: {
  config: BracketConfig;
  liveWeek: NormalizedWeek | undefined;
  semiWeeks: NormalizedWeek[];
  finalWeeks: NormalizedWeek[];
  selectedWeek: number;
}) {
  const viewingWeek = selectedWeek;
  const isFinalsPhase = viewingWeek >= 16;

  const allTeams = Object.values(config.seeds).map(Number);
  const semiTotals = useMemo(
    () => buildSeriesTotals(semiWeeks, allTeams),
    [semiWeeks, allTeams],
  );

  const semiResults = useMemo(
    () => computeSemisFromSeries(config, semiTotals),
    [config, semiTotals],
  );

  const finalistIds = useMemo(() => {
    const ordered = config.reseedFinals
      ? [...semiResults.winners].sort(
          (a, b) =>
            (a ? seedOf(config, a) : 99) - (b ? seedOf(config, b) : 99),
        )
      : [...semiResults.winners];
    return ordered.filter(Boolean) as number[];
  }, [config, semiResults.winners]);

  const finalTotals = useMemo(
    () => buildSeriesTotals(finalWeeks, finalistIds),
    [finalWeeks, finalistIds],
  );

  const hasFinalists = finalistIds.length === 2;

  if (!liveWeek) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
        Loading bracket...
      </div>
    );
  }

  if (isFinalsPhase && hasFinalists) {
    return (
      <div className="space-y-4">
        <MatchupCard
          title="Championship (Weeks 16-17)"
          seriesLabel="2-week total (Weeks 16–17)"
          teamAId={finalistIds[0] ?? null}
          teamBId={finalistIds[1] ?? null}
          week={liveWeek}
          seriesTotals={finalTotals}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MatchupCard
        title="Semifinal A (Weeks 14-15)"
        seriesLabel="2-week total (Weeks 14–15)"
        teamAId={semiResults.semi1.teamA}
        teamBId={semiResults.semi1.teamB}
        week={liveWeek}
        seriesTotals={semiTotals}
      />
      <MatchupCard
        title="Semifinal B (Weeks 14-15)"
        seriesLabel="2-week total (Weeks 14–15)"
        teamAId={semiResults.semi2.teamA}
        teamBId={semiResults.semi2.teamB}
        week={liveWeek}
        seriesTotals={semiTotals}
      />
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 shadow-inner">
        Final (Weeks 16-17): TBD after semis finish.
      </div>
    </div>
  );
}

function seedOf(config: BracketConfig, teamId: number): number {
  const entry = Object.entries(config.seeds).find(
    ([, id]) => Number(id) === Number(teamId),
  );
  return entry ? Number(entry[0]) : 99;
}

