import { useState } from "react";

import { NormalizedRoster } from "@/lib/types";

import { PlayerRow } from "./PlayerRow";

// Hard order by slotId to mirror ESPN starter order: QB, RB, RB, WR, WR, TE, FLEX, D/ST, K
const SLOT_ID_ORDER = [
  0, // QB
  1, // TQB
  2, // RB
  3, // WR
  4, // TE
  23, // FLEX (seen in roster)
  7, // FLEX
  18, // RB/WR/TE
  11, // WR/TE
  22, // FLEX alt
  16, // D/ST
  6, // D/ST alt
  28, // DEF
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

function slotRank(player: { lineupSlotId: number; lineupSlotOrder?: number; lineupSlot?: string }) {
  if (player.lineupSlotOrder != null) return player.lineupSlotOrder;
  if (player.lineupSlotId in SLOT_ID_RANK) return SLOT_ID_RANK[player.lineupSlotId];
  return 100 + player.lineupSlotId;
}

function sortPlayers(players: NormalizedRoster["starters"]) {
  return [...players].sort((a, b) => slotRank(a) - slotRank(b));
}

export function RosterList({ roster }: { roster: NormalizedRoster }) {
  const [showBench, setShowBench] = useState(false);
  const starters = sortPlayers(roster.starters);
  const bench = sortPlayers(roster.bench);
  const ir = sortPlayers(roster.ir);

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="divide-y divide-neutral-100">
        <Section title="Starters" count={roster.starters.length}>
          {starters.map((p) => (
            <PlayerRow key={`${p.lineupSlot}-${p.name}`} player={p} />
          ))}
        </Section>
        <button
          type="button"
          className="flex w-full items-center justify-between bg-neutral-50 px-4 py-2 text-left text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
          onClick={() => setShowBench((v) => !v)}
        >
          <span>Bench / IR</span>
          <span className="text-xs text-neutral-500">
            {showBench ? "Hide" : "Show"}
          </span>
        </button>
        {showBench && (
          <Section title="Bench" count={roster.bench.length + ir.length}>
            {bench.map((p) => (
              <PlayerRow key={`${p.lineupSlot}-${p.name}`} player={p} />
            ))}
            {ir.length > 0 && (
              <div className="mt-2 border-t border-neutral-100 pt-2">
                <div className="mb-1 text-xs font-semibold text-neutral-500">IR</div>
                {ir.map((p) => (
                  <PlayerRow key={`${p.lineupSlot}-${p.name}`} player={p} />
                ))}
              </div>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="px-3 py-2 sm:px-4 sm:py-3">
      <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-neutral-700 sm:text-xs">
        <span>{title}</span>
        <span className="text-neutral-400">{count}</span>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

