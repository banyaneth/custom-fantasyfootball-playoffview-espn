"use client";

import { useEffect, useMemo, useState } from "react";

import {
  encodeConfigToHash,
  exportConfig,
  importConfig,
  loadConfig,
  saveConfig,
} from "@/lib/bracket/config";
import { useLeague } from "@/lib/client/fetchers";
import { BracketConfig } from "@/lib/types";

export default function SetupPage() {
  const { data: league } = useLeague();
  const [config, setConfig] = useState<BracketConfig>(loadConfig);
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (league) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConfig((prev) => {
        const next = { ...prev, leagueId: league.leagueId, season: league.season };
        saveConfig(next);
        return next;
      });
    }
  }, [league]);

  const teams = useMemo(() => league?.teams ?? [], [league]);

  const updateSeed = (seed: "1" | "2" | "3" | "4", teamId: number) => {
    setConfig((prev) => {
      const next = { ...prev, seeds: { ...prev.seeds, [seed]: teamId } };
      saveConfig(next);
      return next;
    });
    setMessage("Saved locally.");
  };

  const toggle = (key: "reseedFinals" | "thirdPlace") => {
    setConfig((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveConfig(next);
      return next;
    });
  };

  const handleImport = () => {
    const parsed = importConfig(importText);
    if (!parsed) {
      setMessage("Import failed. Check JSON.");
      return;
    }
    setConfig(parsed);
    saveConfig(parsed);
    setMessage("Imported and saved.");
  };

  const shareLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/${encodeConfigToHash(config)}`
      : "";

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="text-2xl font-black text-slate-900">Setup</h1>
        <p className="text-sm text-slate-600">
          Pick 4 teams, set seeds, and share the config. Saved to your browser.
        </p>

        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-600">
            Seeds
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {(["1", "2", "3", "4"] as const).map((seed) => (
              <SeedSelect
                key={seed}
                seed={seed}
                teams={teams}
                value={config.seeds[seed]}
                onChange={(teamId) => updateSeed(seed, teamId)}
              />
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-600">
            Options
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={config.reseedFinals}
              onChange={() => toggle("reseedFinals")}
              className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            Reseed finals
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={config.thirdPlace}
              onChange={() => toggle("thirdPlace")}
              className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            Include 3rd place game
          </label>
        </section>

        <section className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-600">
              Export
            </div>
            <textarea
              className="h-32 w-full rounded-md border border-slate-300 p-2 text-xs text-slate-700"
              readOnly
              value={exportConfig(config)}
            />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-600">
              Import
            </div>
            <textarea
              className="h-32 w-full rounded-md border border-slate-300 p-2 text-xs text-slate-700"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            <button
              type="button"
              onClick={handleImport}
              className="mt-2 rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-700"
            >
              Import JSON
            </button>
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-600">
            Share link
          </div>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700"
            readOnly
            value={shareLink}
          />
        </section>

        {message && (
          <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}

function SeedSelect({
  seed,
  teams,
  value,
  onChange,
}: {
  seed: "1" | "2" | "3" | "4";
  teams: { teamId: number; name: string }[];
  value?: number;
  onChange: (id: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
      Seed {seed}
      <select
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none"
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        <option value="">Select team</option>
        {teams.map((t) => (
          <option key={t.teamId} value={t.teamId}>
            {t.name}
          </option>
        ))}
      </select>
    </label>
  );
}

