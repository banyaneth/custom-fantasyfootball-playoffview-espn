"use client";

import { useEffect, useMemo, useState } from "react";

import { Bracket } from "@/components/Bracket";
import { WeekPicker } from "@/components/WeekPicker";
import { DEFAULT_REFRESH_MS, ROUND_WEEKS } from "@/lib/constants";
import { loadConfig, saveConfig } from "@/lib/bracket/config";
import { useLeague, useWeek } from "@/lib/client/fetchers";

const SEMI_WEEKS = ROUND_WEEKS.semi;
const FINAL_WEEKS = ROUND_WEEKS.final;
export default function Home() {
  const { data: league } = useLeague();
  const [config, setConfig] = useState(loadConfig);
  const [week, setWeek] = useState<number>(FINAL_WEEKS[0]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Keep season/leagueId aligned with server data
  useEffect(() => {
    if (league) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConfig((prev) => {
        const next = { ...prev, season: league.season, leagueId: league.leagueId };
        saveConfig(next);
        return next;
      });
    }
  }, [league]);

  const refreshMs = autoRefresh ? DEFAULT_REFRESH_MS : 0;
  const liveWeek = useWeek(week, refreshMs).data;

  // Preload round weeks for combined totals
  const semiWeek14 = useWeek(SEMI_WEEKS[0], refreshMs).data;
  const semiWeek15 = useWeek(SEMI_WEEKS[1], refreshMs).data;
  const finalWeek16 = useWeek(ROUND_WEEKS.final[0], refreshMs).data;
  const finalWeek17 = useWeek(ROUND_WEEKS.final[1], refreshMs).data;

  const lastUpdated = useMemo(() => liveWeek?.fetchedAt, [liveWeek]);
  const isStale = liveWeek?.stale;

  return (
    <main className="min-h-screen bg-neutral-100">
      <div className="mx-auto max-w-6xl px-3 pb-8 pt-4 sm:px-4 sm:pt-6">
        <header className="sticky top-0 z-20 mb-4 -mx-3 border-b border-neutral-200 bg-white/90 px-3 py-3 backdrop-blur sm:static sm:mx-0 sm:rounded-2xl sm:border sm:px-4 sm:py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-red-600">
                Playoffs · Weeks 14–17
              </div>
            <div className="flex flex-col gap-1">
              <h1 className="truncate text-2xl font-black leading-tight tracking-tight text-neutral-950 sm:text-3xl">
                Gisele Live Bracket
              </h1>
              {league && (
                <p className="text-base font-semibold leading-tight text-neutral-900 sm:text-lg">
                  Season {league.season}
                </p>
              )}
              <div
                className="text-base font-semibold italic leading-snug text-neutral-800 sm:text-lg"
                style={{ fontFamily: '"Playfair Display", "Times New Roman", serif' }}
              >
                Presented by the Commissioner, Josh Klein
              </div>
            </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <WeekPicker
                value={week}
                liveWeek={league?.currentWeek}
                onChange={setWeek}
              />
              <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
                />
                Auto-refresh
              </label>
              {lastUpdated && (
                <span className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  Updated {new Date(lastUpdated).toLocaleTimeString()}
                  {isStale && " · stale"}
                </span>
              )}
            </div>
          </div>
        </header>

        {isStale && (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
            ESPN data may be stale; if it persists, refresh cookies on the server.
          </div>
        )}
        {!liveWeek && (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
            No data yet—check cookies or week selection.
          </div>
        )}

        <div className="mb-4 hidden gap-3 md:grid md:grid-cols-3">
          <InfoCard
            title="Week view"
            body="Scores are week-only (no ESPN multi-week totals)."
          />
          <InfoCard
            title="Round totals"
            body="Semis combine weeks 14-15; Finals combine weeks 16-17."
          />
          <InfoCard
            title="Live projections"
            body="Shows projections beside live scores when available."
          />
        </div>

        <Bracket
          config={config}
          liveWeek={liveWeek}
          semiWeeks={[semiWeek14, semiWeek15].filter(
            (w): w is NonNullable<typeof w> => Boolean(w),
          )}
          finalWeeks={[finalWeek16, finalWeek17].filter(
            (w): w is NonNullable<typeof w> => Boolean(w),
          )}
          selectedWeek={week}
        />
      </div>
    </main>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        {title}
      </div>
      <div className="text-sm text-slate-600">{body}</div>
    </div>
  );
}
