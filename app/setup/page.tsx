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
    <main className="min-h-screen bg-neutral-100">
      <div className="mx-auto max-w-4xl px-3 py-6 sm:px-4">
        <div className="mb-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-red-600">
            Bracket config
          </div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-950">
            Setup
          </h1>
          <p className="text-sm font-medium text-neutral-600">
          Pick 4 teams, set seeds, and share the config. Saved to your browser.
          </p>
        </div>

        <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-700">
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

        <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-700">
            Options
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
            <input
              type="checkbox"
              checked={config.reseedFinals}
              onChange={() => toggle("reseedFinals")}
              className="h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
            />
            Reseed finals
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm font-semibold text-neutral-800">
            <input
              type="checkbox"
              checked={config.thirdPlace}
              onChange={() => toggle("thirdPlace")}
              className="h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
            />
            Include 3rd place game
          </label>
        </section>

        <section className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-700">
              Export
            </div>
            <textarea
              className="h-32 w-full rounded-xl border border-neutral-300 bg-neutral-50 p-2 font-mono text-xs text-neutral-800"
              readOnly
              value={exportConfig(config)}
            />
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-700">
              Import
            </div>
            <textarea
              className="h-32 w-full rounded-xl border border-neutral-300 bg-white p-2 font-mono text-xs text-neutral-800"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            <button
              type="button"
              onClick={handleImport}
              className="mt-2 rounded-xl bg-neutral-950 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-neutral-900"
            >
              Import JSON
            </button>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-700">
            Share link
          </div>
          <input
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800"
            readOnly
            value={shareLink}
          />
        </section>

        {message && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
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
    <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-800">
      Seed {seed}
      <select
        className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-950 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
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

