"use client";

import { useEffect, useMemo, useState } from "react";

import { Bracket } from "@/components/Bracket";
import { WeekPicker } from "@/components/WeekPicker";
import { DEFAULT_REFRESH_MS, ROUND_WEEKS } from "@/lib/constants";
import { loadConfig, saveConfig } from "@/lib/bracket/config";
import { useLeague, useWeek } from "@/lib/client/fetchers";

const SEMI_WEEKS = ROUND_WEEKS.semi;
export default function Home() {
  const { data: league } = useLeague();
  const [config, setConfig] = useState(loadConfig);
  const [week, setWeek] = useState<number>(SEMI_WEEKS[0]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Live week selection: use league currentWeek if available
  useEffect(() => {
    if (league?.currentWeek && !week) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWeek(league.currentWeek);
    }
  }, [league, week]);

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
  // finals weeks will be pulled later when matchups are set

  const lastUpdated = useMemo(() => liveWeek?.fetchedAt, [liveWeek]);
  const isStale = liveWeek?.stale;

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Custom Playoffs · Weeks 14-17
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              Gisele 2025 Live Bracket
            </h1>
            {league && (
              <p className="text-sm text-slate-600">
                {league.leagueId} · Season {league.season}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <WeekPicker
              value={week}
              liveWeek={league?.currentWeek}
              onChange={setWeek}
            />
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Auto-refresh (60s)
            </label>
            {lastUpdated && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                Updated {new Date(lastUpdated).toLocaleTimeString()}
                {isStale && " · stale"}
              </span>
            )}
          </div>
        </header>

        {isStale && (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
            ESPN data may be stale; if it persists, refresh cookies on the server.
          </div>
        )}
        {!liveWeek && (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
            No data yet—check cookies or week selection.
          </div>
        )}

        <div className="mb-4 grid gap-3 md:grid-cols-3">
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
