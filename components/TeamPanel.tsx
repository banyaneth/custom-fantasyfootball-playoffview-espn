import { RosterList } from "@/components/RosterList";
import { NormalizedTeamWeek } from "@/lib/types";

type Props = {
  team: NormalizedTeamWeek;
  seriesTotal?: number;
  seriesProjected?: number;
  projected?: number;
  label?: string;
};

export function TeamPanel({
  team,
  seriesTotal,
  seriesProjected,
  projected,
  label,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-300 bg-white p-4 shadow-md">
      <div className="flex items-start justify-between">
        <div>
          {label && (
            <div className="text-xs font-semibold uppercase text-emerald-700">
              {label}
            </div>
          )}
          <div className="text-lg font-bold text-slate-900">{team.name}</div>
          {team.ownerName && (
            <div className="text-xs text-slate-500">{team.ownerName}</div>
          )}
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-slate-900">
            {team.score.toFixed(2)}
          </div>
          {projected !== undefined ? (
            <div className="text-xs font-semibold text-slate-700">
              Proj {projected.toFixed(2)}
            </div>
          ) : (
            <div className="text-xs text-slate-400">Proj —</div>
          )}
          {seriesTotal !== undefined && (
            <div className="mt-1 text-xs font-semibold text-emerald-700">
              Series {seriesTotal.toFixed(2)}
            </div>
          )}
          {seriesProjected !== undefined ? (
            <div className="text-[11px] font-semibold text-emerald-600">
              Series Proj {seriesProjected.toFixed(2)}
            </div>
          ) : (
            <div className="text-[11px] text-slate-400">Series Proj —</div>
          )}
        </div>
      </div>
      <RosterList roster={team.players} />
    </div>
  );
}

