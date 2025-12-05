import { NextResponse } from "next/server";

import {
  EspnAuthError,
  EspnUnavailableError,
  fetchEspn,
} from "@/lib/espn/fetchEspn";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const raw = await fetchEspn({ views: ["mSettings"] });
    const fetchedAt = new Date().toISOString();
    const currentWeek =
      raw?.status?.latestScoringPeriod ??
      raw?.status?.currentScoringPeriod ??
      null;
    return NextResponse.json(
      {
        ok: true,
        fetchedAt,
        currentWeek,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    const fetchedAt = new Date().toISOString();
    if (err instanceof EspnAuthError) {
      return NextResponse.json(
        { ok: false, reason: "unauthorized", fetchedAt },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (err instanceof EspnUnavailableError) {
      return NextResponse.json(
        { ok: false, reason: "unavailable", fetchedAt },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json(
      { ok: false, reason: "unexpected", fetchedAt },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

