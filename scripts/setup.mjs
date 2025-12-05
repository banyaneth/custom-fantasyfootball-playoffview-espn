#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (q, def = "") =>
  new Promise((resolve) => {
    rl.question(`${q}${def ? ` (${def})` : ""}: `, (ans) => {
      resolve(ans || def);
    });
  });

async function main() {
  console.log("Configure .env.local (will overwrite existing values).");
  const league = await ask("LEAGUE_ID", process.env.LEAGUE_ID ?? "");
  const season = await ask("SEASON", process.env.SEASON ?? "");
  const swid = await ask("SWID (keep braces)", process.env.SWID ?? "");
  const s2 = await ask("ESPN_S2", process.env.ESPN_S2 ?? "");

  const envPath = path.join(process.cwd(), ".env.local");
  const content = [
    `LEAGUE_ID=${league}`,
    `SEASON=${season}`,
    `SWID=${swid}`,
    `ESPN_S2=${s2}`,
    `CACHE_TTL_MS=15000`,
    `NEXT_PUBLIC_REFRESH_MS=60000`,
  ].join("\n");

  fs.writeFileSync(envPath, content);
  console.log(`Wrote ${envPath}. Keep this file private; do not commit.`);
  rl.close();
}

main().catch((err) => {
  console.error(err);
  rl.close();
  process.exit(1);
});

