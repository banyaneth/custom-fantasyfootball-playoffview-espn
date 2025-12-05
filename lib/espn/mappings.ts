export const lineupSlotMap: Record<number, string> = {
  0: "QB",
  1: "QB",
  2: "RB",
  3: "WR",
  4: "TE",
  5: "K",
  6: "D/ST",
  7: "FLEX",
  11: "WR/TE",
  15: "BN",
  16: "D/ST",
  17: "K",
  18: "RB/WR/TE",
  19: "OP",
  20: "BE",
  21: "IR",
  22: "FLEX",
  23: "EDR",
  24: "DL",
  25: "LB",
  26: "DB",
  27: "DP",
  28: "DEF",
  29: "HC",
  30: "P",
  31: "Head Coach",
  232: "IR",
};

export const positionMap: Record<number, string> = {
  0: "QB",
  1: "TQB",
  2: "RB",
  3: "WR",
  4: "TE",
  5: "K",
  6: "D/ST",
  7: "HC",
  8: "P",
  9: "KR",
  10: "RB/WR",
  11: "RB/WR/TE",
  12: "DL",
  13: "LB",
  14: "DL/LB",
  15: "DB",
  16: "DL/DB",
  17: "DP",
  18: "EDR",
};

export const BENCH_SLOT_IDS = new Set<number>([20, 15]);
export const IR_SLOT_IDS = new Set<number>([21, 232]);

export function slotLabel(id?: number): string {
  if (id === undefined || id === null) return "SLOT";
  return lineupSlotMap[id] ?? `SLOT_${id}`;
}

export function positionLabel(id?: number): string {
  if (id === undefined || id === null) return "POS";
  return positionMap[id] ?? `POS_${id}`;
}

