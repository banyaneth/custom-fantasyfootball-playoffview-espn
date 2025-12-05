# Gisele 2025 Live Bracket

Custom ESPN Fantasy Football playoff viewer for private leagues when your house rules differ from ESPN’s bracket or multi-week totals. Shows week-only live scoring, custom seeds, and round totals you define (e.g., semis 14–15, finals 16–17) without relying on ESPN’s playoff UI.

## What it does
- Fetches live scores/rosters from ESPN (week-only, no multi-week rollups).
- Lets you pick 4 teams/seeds and ignore ESPN’s official bracket.
- Displays custom semis/finals structure; finals stay TBD until semis finish.
- Week projections and round totals are shown side-by-side with live scores.
- Stale-data and no-data banners to prompt cookie refresh if needed.

## Local setup
1) `npm install`
2) Create `.env.local` (do **not** commit this file):
```
LEAGUE_ID=1319196
SEASON=2025
SWID={...your cookie...}
ESPN_S2=...your cookie...
CACHE_TTL_MS=15000
NEXT_PUBLIC_REFRESH_MS=90000
```
3) `npm run dev` and open http://localhost:3000
4) `/setup` to set seeds/toggles; config is stored in localStorage and shareable via URL hash.

## Scripts
- `npm run dev` – local dev
- `npm run lint` – lint
- `npm run inspect -- --week 14` – debug ESPN pull for a week
- `npm run setup` – write `.env.local` interactively (local only)

## Deploy to Fly.io (example)
1) Install `flyctl` and log in.
2) `fly launch --no-deploy --name <your-app>`
3) Set secrets (replace with your values):
```
fly secrets set LEAGUE_ID=1319196 SEASON=2025 SWID=... ESPN_S2=... CACHE_TTL_MS=15000 NEXT_PUBLIC_REFRESH_MS=90000
```
4) `fly deploy`
5) If you want a single machine, set `min_machines_running = 0` in `fly.toml` or scale to 1.

## Reliability tips
- Cookies expire: refresh SWID/ESPN_S2 when you see stale banners or 401/403.
- Poll gently: default refresh 90s (NEXT_PUBLIC_REFRESH_MS); server cache TTL 15s.
- Stale banner and “no data” banner are shown in the UI so users know to refresh cookies.
- Health check: `/api/health` reports reachability and currentWeek (no secrets).
- Keep `.env.local` private; never commit it.

## Notes
- Week view is week-only; round totals are manual combinations (semis 14–15, finals 16–17).
- Finals are shown as TBD until semis conclude.
- Config persistence: localStorage, import/export JSON, shareable via URL hash on `/setup`.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
