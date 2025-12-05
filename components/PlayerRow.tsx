import { NormalizedPlayer } from "@/lib/types";

function statusDot(status?: NormalizedPlayer["status"]) {
  switch (status) {
    case "in_progress":
      return "bg-green-500";
    case "not_started":
      return "bg-amber-500";
    case "final":
      return "bg-slate-500";
    default:
      return "bg-slate-400";
  }
}

export function PlayerRow({ player }: { player: NormalizedPlayer }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-2 py-1.5 text-sm text-slate-900">
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="w-14 text-xs font-bold uppercase tracking-wide text-slate-700">
          {player.lineupSlot}
        </span>
        <div className="flex items-center gap-3 overflow-hidden">
          <span
            className={`h-2 w-2 rounded-full ${statusDot(player.status)}`}
            aria-hidden
          />
          <div className="truncate">
            <div className="truncate font-semibold text-slate-900">
              {player.name}
            </div>
            <div className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {player.position}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6 text-right">
        <div className="w-14 text-base font-black tabular-nums text-slate-900">
          {player.points.toFixed(2)}
        </div>
        <div className="w-14 text-xs font-semibold tabular-nums text-slate-500">
          {player.projected.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

