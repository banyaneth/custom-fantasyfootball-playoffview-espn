import { NormalizedPlayer } from "@/lib/types";

function statusDot(status?: NormalizedPlayer["status"]) {
  switch (status) {
    case "in_progress":
      return "bg-emerald-500";
    case "not_started":
      return "bg-amber-500";
    case "final":
      return "bg-neutral-500";
    default:
      return "bg-neutral-400";
  }
}

export function PlayerRow({ player }: { player: NormalizedPlayer }) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-100 px-2 py-2 text-sm text-neutral-950">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="w-14 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-neutral-700">
          {player.lineupSlot}
        </span>
        <div className="flex items-center gap-2 overflow-hidden">
          <span
            className={`h-2 w-2 rounded-full ${statusDot(player.status)}`}
            aria-hidden
          />
          <div className="truncate">
            <div className="truncate text-[13px] font-semibold text-neutral-950 sm:text-sm">
              {player.name}
            </div>
            <div className="truncate text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              {player.position}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 text-right">
        <div className="w-12 text-[13px] font-black tabular-nums text-neutral-950 sm:w-14 sm:text-sm">
          {player.points.toFixed(2)}
        </div>
        <div className="w-12 text-[10px] font-semibold tabular-nums text-neutral-500 sm:w-14 sm:text-xs">
          {player.projected.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

