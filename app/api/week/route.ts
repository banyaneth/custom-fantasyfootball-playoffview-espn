import { NextRequest, NextResponse } from "next/server";

import {
  EspnAuthError,
  EspnUnavailableError,
  errorResponse,
  fetchEspn,
} from "@/lib/espn/fetchEspn";
import { normalizeWeek } from "@/lib/espn/normalizeWeek";
import { NormalizedWeek } from "@/lib/types";

export const dynamic = "force-dynamic";

const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS ?? 15_000);
const cache = new Map<number, { data: NormalizedWeek; ts: number }>();

function cacheHit(week: number) {
  const entry = cache.get(week);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) return null;
  return entry.data;
}

function setCache(week: number, data: NormalizedWeek) {
  cache.set(week, { data, ts: Date.now() });
}

async function detectCurrentWeek(): Promise<number | null> {
  try {
    const raw = await fetchEspn({ views: ["mSettings"] });
    return (
      raw?.status?.latestScoringPeriod ??
      raw?.status?.currentScoringPeriod ??
      null
    );
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const weekParam = searchParams.get("week");
  const weekProvided = weekParam ? Number.parseInt(weekParam, 10) : null;

  const week =
    Number.isFinite(weekProvided) && weekProvided! > 0
      ? weekProvided
      : await detectCurrentWeek();

  if (!week) {
    return errorResponse("Week not specified and current week unavailable.", 400);
  }

  const cached = cacheHit(week);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  try {
    const raw = await fetchEspn({
      week,
      views: [
        "mTeam",
        "mMatchupScore",
        "mBoxscore",
        "mLiveScoring",
        "mRoster",
        "mScoreboard",
        "kona_player_info",
      ],
    });
    const data = normalizeWeek(raw, week);
    setCache(week, data);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("week fetch error", {
      week,
      type: err instanceof Error ? err.name : "unknown",
      message: err instanceof Error ? err.message : String(err),
    });
    const fallback = cache.get(week);
    if (fallback) {
      return NextResponse.json(
        { ...fallback.data, stale: true },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    if (err instanceof EspnAuthError) {
      return errorResponse("Unauthorized: check SWID/ESPN_S2 cookies.", 401);
    }
    if (err instanceof EspnUnavailableError) {
      return errorResponse("ESPN temporarily unavailable. Try again soon.", 503);
    }
    return errorResponse("Unexpected error loading week data.", 500);
  }
}

