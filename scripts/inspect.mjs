#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const PRIMARY_BASE =
  "https://fantasy.espn.com/apis/v3/games/ffl/seasons";
const FALLBACK_BASE =
  "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons";

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    const value = rest.join("=");
    if (!process.env[key]) process.env[key] = value;
  }
}

function requireEnv(key) {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing env: ${key}`);
  }
  return val;
}

function parseWeekArg() {
  const idx = process.argv.findIndex((a) => a === "--week");
  if (idx >= 0 && process.argv[idx + 1]) {
    const w = Number.parseInt(process.argv[idx + 1], 10);
    if (Number.isFinite(w)) return w;
  }
  return null;
}

async function doFetch(url, cookie) {
  const res = await fetch(url, {
    headers: { Cookie: cookie },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

function buildUrl(base, season, leagueId, week, views) {
  const params = new URLSearchParams();
  if (week) params.set("scoringPeriodId", String(week));
  for (const view of views) params.append("view", view);
  return `${base}/${season}/segments/0/leagues/${leagueId}?${params.toString()}`;
}

function summarize(raw, week) {
  const teams =
    raw?.teams?.reduce((acc, t) => {
      acc[t.id] = `${t.location ?? ""}${t.nickname ?? ""}`.trim() ||
        t.name ||
        `Team ${t.id}`;
      return acc;
    }, {}) ?? {};

  console.log(
    `Fetched season ${raw?.seasonId} league ${raw?.id} for week ${week}`,
  );
  console.log(`Schedule entries: ${raw?.schedule?.length ?? 0}`);

  for (const matchup of raw?.schedule ?? []) {
    for (const sideKey of ["home", "away"]) {
      const side = matchup[sideKey];
      if (!side?.teamId) continue;
      const name = teams[side.teamId] ?? `Team ${side.teamId}`;
      const entries =
        side?.rosterForMatchupPeriod?.entries ??
        side?.rosterForCurrentScoringPeriod?.entries ??
        side?.rosterForCurrentPeriod?.entries ??
        side?.rosterForScoringPeriod?.[week]?.entries ??
        [];
      console.log(
        `- ${name} (team ${side.teamId}) pointsByWeek: ${
          side.pointsByScoringPeriod?.[String(week)] ?? "n/a"
        } roster entries: ${entries.length}`,
      );
      for (const entry of entries) {
        const player = entry?.playerPoolEntry?.player ?? entry?.player ?? {};
        console.log(
          `   slot ${entry?.lineupSlotId} ${player.fullName ?? "Player"} pts=${
            entry?.appliedTotal ?? entry?.appliedStatTotal ?? "?"
          } proj=${
            entry?.projectedTotal ??
            entry?.stats?.find((s) => s?.statSourceId === 1)?.appliedTotal ??
            "?"
          }`,
        );
      }
    }
  }
}

async function main() {
  loadEnvFile();
  const week = parseWeekArg();
  if (!week) {
    throw new Error("Pass --week <number>");
  }

  const leagueId = requireEnv("LEAGUE_ID");
  const season = requireEnv("SEASON");
  const swid = requireEnv("SWID");
  const s2 = requireEnv("ESPN_S2");

  const views = ["mTeam", "mMatchupScore", "mBoxscore", "mLiveScoring", "mRoster"];
  const primary = buildUrl(PRIMARY_BASE, season, leagueId, week, views);
  const fallback = buildUrl(FALLBACK_BASE, season, leagueId, week, views);
  const cookie = `SWID=${swid}; espn_s2=${s2}`;

  try {
    const raw = await doFetch(primary, cookie);
    summarize(raw, week);
    return;
  } catch (err) {
    console.warn(`Primary failed (${err.message}), trying fallback...`);
  }

  const raw = await doFetch(fallback, cookie);
  summarize(raw, week);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

