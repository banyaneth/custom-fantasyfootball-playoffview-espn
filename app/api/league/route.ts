import { NextResponse } from "next/server";

import {
  EspnAuthError,
  EspnUnavailableError,
  errorResponse,
  fetchEspn,
} from "@/lib/espn/fetchEspn";
import { normalizeLeague } from "@/lib/espn/normalizeLeague";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const raw = await fetchEspn({ views: ["mTeam", "mSettings"] });
    const data = normalizeLeague(raw);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    if (err instanceof EspnAuthError) {
      return errorResponse("Unauthorized: check SWID/ESPN_S2 cookies.", 401);
    }
    if (err instanceof EspnUnavailableError) {
      return errorResponse("ESPN temporarily unavailable. Try again soon.", 503);
    }
    return errorResponse("Unexpected error loading league.");
  }
}


