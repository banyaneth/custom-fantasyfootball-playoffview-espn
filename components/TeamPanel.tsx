import { RosterList } from "@/components/RosterList";
import { NormalizedTeamWeek } from "@/lib/types";

type Props = {
  team: NormalizedTeamWeek;
  label?: string;
};

export function TeamPanel({
  team,
  label,
}: Props) {
  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          {label && (
            <div className="text-[11px] font-semibold uppercase tracking-wide text-red-700">
              {label}
            </div>
          )}
          <div className="text-base font-semibold leading-tight text-neutral-950 sm:text-lg">
            {team.name}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-black leading-none text-neutral-950 sm:text-2xl">
            {team.score.toFixed(2)}
          </div>
        </div>
      </div>
      <RosterList roster={team.players} />
    </div>
  );
}

