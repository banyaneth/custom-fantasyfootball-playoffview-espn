import { NormalizedWeek } from "@/lib/types";

import { TeamPanel } from "./TeamPanel";

type Props = {
  title: string;
  teamAId: number | null;
  teamBId: number | null;
  week: NormalizedWeek | undefined;
  seriesTotals?: Record<number, { total: number; projected?: number }>;
};

export function MatchupCard({
  title,
  teamAId,
  teamBId,
  week,
  seriesTotals = {},
}: Props) {
  if (!week || !teamAId || !teamBId) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 shadow-sm">
        {title}: waiting for data...
      </div>
    );
  }

  const teamA = week.teams[teamAId];
  const teamB = week.teams[teamBId];
  if (!teamA || !teamB) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 shadow-sm">
        {title}: teams missing for this week
      </div>
    );
  }

  const seriesA = seriesTotals[teamAId];
  const seriesB = seriesTotals[teamBId];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
      <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-white">
        <div className="text-sm font-semibold uppercase tracking-wide">{title}</div>
        <div className="text-xs font-semibold">Week {week.week} · Live</div>
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-2">
        <TeamPanel
          team={teamA}
          seriesTotal={seriesA?.total}
          seriesProjected={seriesA?.projected}
          projected={teamA.projected}
          label="Away/Seed"
        />
        <TeamPanel
          team={teamB}
          seriesTotal={seriesB?.total}
          seriesProjected={seriesB?.projected}
          projected={teamB.projected}
          label="Home/Seed"
        />
      </div>
      <div className="mt-1 border-t border-slate-100 bg-slate-50 px-4 py-3">
        <div className="flex flex-col gap-1 text-xs font-semibold text-slate-800 md:flex-row md:items-center md:justify-between">
          <div>
            Week total:{" "}
            <span className="text-slate-900">{teamA.score.toFixed(2)}</span> ·{" "}
            <span className="text-slate-900">{teamB.score.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
            <span>
              Proj (week):{" "}
              <span className="text-emerald-700">
                {(teamA.projected ?? 0).toFixed(2)}
              </span>{" "}
              ·{" "}
              <span className="text-emerald-700">
                {(teamB.projected ?? 0).toFixed(2)}
              </span>
            </span>
            <span className="hidden md:inline">|</span>
            <span className="text-slate-500">
              Live at {new Date(week.fetchedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

