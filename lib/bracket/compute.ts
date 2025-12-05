import { BracketConfig, NormalizedWeek } from "@/lib/types";

export type MatchupResult = {
  teamA: number | null;
  teamB: number | null;
  winner: number | null;
  loser: number | null;
};

function pickWinner(
  week: NormalizedWeek,
  a: number | null,
  b: number | null,
): MatchupResult {
  if (!a || !b) {
    return { teamA: a, teamB: b, winner: a ?? b ?? null, loser: null };
  }
  const teamA = week.teams[a];
  const teamB = week.teams[b];
  const scoreA = teamA?.score ?? 0;
  const scoreB = teamB?.score ?? 0;

  if (scoreA > scoreB) return { teamA: a, teamB: b, winner: a, loser: b };
  if (scoreB > scoreA) return { teamA: a, teamB: b, winner: b, loser: a };
  // tie-breaker: lower seed number wins (seed 1 beats seed 4)
  return { teamA: a, teamB: b, winner: a, loser: b };
}

export function computeBracket(config: BracketConfig, week: NormalizedWeek) {
  const semi1 = pickWinner(week, config.seeds["1"], config.seeds["4"]);
  const semi2 = pickWinner(week, config.seeds["2"], config.seeds["3"]);

  const finalists = config.reseedFinals
    ? [semi1.winner, semi2.winner].sort(
        (a, b) =>
          (a ? seedOf(config, a) : 99) - (b ? seedOf(config, b) : 99),
      )
    : [semi1.winner, semi2.winner];

  const final = pickWinner(week, finalists[0] ?? null, finalists[1] ?? null);
  const thirdPlace = config.thirdPlace
    ? pickWinner(week, semi1.loser, semi2.loser)
    : null;

  return {
    semi1,
    semi2,
    final,
    thirdPlace,
  };
}

function seedOf(config: BracketConfig, teamId: number): number {
  const entry = Object.entries(config.seeds).find(
    ([, id]) => Number(id) === Number(teamId),
  );
  return entry ? Number(entry[0]) : 99;
}

