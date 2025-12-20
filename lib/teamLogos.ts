import type { NormalizedTeamWeek } from "@/lib/types";

/**
 * Optional overrides for custom team "avatars" (e.g. photos) to match ESPN-style circles.
 *
 * To use:
 * - Put files in `public/team-logos/`
 * - Update these paths or teamIds as needed
 *
 * Note: If ESPN provides a team logo URL, we still prefer an override when present.
 */
export const TEAM_LOGO_OVERRIDES: Record<number, string> = {
  // Brady's Bunch XVIII
  4: "/team-logos/bradys-bunch.png",
  // Try That In A Small Town
  10: "/team-logos/try-that-in-a-small-town.png",
};

export function teamLogoUrl(team: Pick<NormalizedTeamWeek, "teamId" | "logoUrl">) {
  return TEAM_LOGO_OVERRIDES[team.teamId] ?? team.logoUrl;
}



