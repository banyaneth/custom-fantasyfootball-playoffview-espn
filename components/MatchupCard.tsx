import { NormalizedWeek } from "@/lib/types";
import { teamLogoUrl } from "@/lib/teamLogos";

import { TeamPanel } from "./TeamPanel";
import { TeamAvatar } from "./TeamAvatar";

type Props = {
  title: string;
  seriesLabel?: string;
  teamAId: number | null;
  teamBId: number | null;
  week: NormalizedWeek | undefined;
  seriesTotals?: Record<number, { total: number }>;
};

export function MatchupCard({
  title,
  seriesLabel = "2-week total (Weeks 14–15)",
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
  const seriesAText = seriesA ? seriesA.total.toFixed(2) : "—";
  const seriesBText = seriesB ? seriesB.total.toFixed(2) : "—";

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
      <div className="bg-gradient-to-r from-neutral-950 to-neutral-800 px-4 py-3 text-white">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold uppercase tracking-wide">{title}</div>
          <div className="text-xs font-semibold">Week {week.week} · Live</div>
        </div>
        <div className="mt-3 rounded-xl bg-white/10 px-3 py-3 ring-1 ring-white/10">
          <div className="text-center text-[11px] font-semibold uppercase tracking-wide text-white/80">
            {seriesLabel}
          </div>
          <div className="mt-1 flex items-baseline justify-center gap-3 tabular-nums">
            <div className="text-4xl font-black leading-none tracking-tight sm:text-5xl">
              {seriesAText}
            </div>
            <div className="text-xl font-black text-red-500/90 sm:text-2xl">–</div>
            <div className="text-4xl font-black leading-none tracking-tight sm:text-5xl">
              {seriesBText}
            </div>
          </div>
          <div className="mt-2 flex items-end justify-between gap-3 text-xs font-semibold text-white/90">
            <div className="flex min-w-0 max-w-[45%] flex-col items-start gap-1">
              <TeamAvatar
                name={teamA.name}
                logoUrl={teamLogoUrl(teamA)}
                className="h-6 w-6 sm:h-7 sm:w-7"
              />
              <div className="w-full truncate">{teamA.name}</div>
            </div>
            <div className="flex min-w-0 max-w-[45%] flex-col items-end gap-1 text-right">
              <TeamAvatar
                name={teamB.name}
                logoUrl={teamLogoUrl(teamB)}
                className="h-6 w-6 sm:h-7 sm:w-7"
              />
              <div className="w-full truncate">{teamB.name}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-2 md:gap-3 md:p-4">
        <TeamPanel
          team={teamA}
        />
        <TeamPanel
          team={teamB}
        />
      </div>
      <div className="mt-1 border-t border-neutral-100 bg-neutral-50 px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex flex-col gap-1 text-[11px] font-semibold text-neutral-800 sm:flex-row sm:items-center sm:justify-between sm:text-xs">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="rounded-full bg-white px-2 py-1 text-neutral-700 shadow-sm">
              Week total
            </span>
            <span className="text-neutral-950">{teamA.score.toFixed(2)}</span>
            <span className="text-neutral-400">·</span>
            <span className="text-neutral-950">{teamB.score.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-600">
            <span className="text-neutral-500">
              Live {new Date(week.fetchedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

