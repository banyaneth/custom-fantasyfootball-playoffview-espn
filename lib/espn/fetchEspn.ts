import { NextResponse } from "next/server";

const PRIMARY_BASE =
  "https://fantasy.espn.com/apis/v3/games/ffl/seasons";
const FALLBACK_BASE =
  "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons";

type FetchArgs = {
  week?: number;
  views: string[];
};

export class EspnAuthError extends Error {}
export class EspnUnavailableError extends Error {}

function buildUrl(base: string, leagueId: string, season: string, args: FetchArgs) {
  const searchParams = new URLSearchParams();
  if (args.week) {
    searchParams.set("scoringPeriodId", String(args.week));
  }
  for (const view of args.views) {
    searchParams.append("view", view);
  }
  return `${base}/${season}/segments/0/leagues/${leagueId}?${searchParams.toString()}`;
}

async function doFetch(url: string, cookie: string) {
  const res = await fetch(url, {
    headers: {
      Cookie: cookie,
    },
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 403) {
    throw new EspnAuthError("Unauthorized with provided cookies");
  }

  if (!res.ok) {
    throw new EspnUnavailableError(`ESPN responded ${res.status}`);
  }

  return res.json();
}

export async function fetchEspn(args: FetchArgs) {
  const { LEAGUE_ID, SEASON, SWID, ESPN_S2 } = process.env;
  if (!LEAGUE_ID || !SEASON || !SWID || !ESPN_S2) {
    const missing = [
      !LEAGUE_ID && "LEAGUE_ID",
      !SEASON && "SEASON",
      !SWID && "SWID",
      !ESPN_S2 && "ESPN_S2",
    ]
      .filter(Boolean)
      .join(", ");
    throw new Error(`Missing env: ${missing || "unknown"}`);
  }

  const cookie = `SWID=${SWID}; espn_s2=${ESPN_S2}`;
  const primaryUrl = buildUrl(PRIMARY_BASE, LEAGUE_ID, SEASON, args);
  const fallbackUrl = buildUrl(FALLBACK_BASE, LEAGUE_ID, SEASON, args);

  try {
    return await doFetch(primaryUrl, cookie);
  } catch (err) {
    if (err instanceof EspnAuthError) throw err;
    // retry fallback
    return doFetch(fallbackUrl, cookie);
  }
}

export function errorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

