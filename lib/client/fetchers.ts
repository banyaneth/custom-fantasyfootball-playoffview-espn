import useSWR from "swr";

import { NormalizedLeague, NormalizedWeek } from "@/lib/types";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

export function useLeague() {
  return useSWR<NormalizedLeague>("/api/league", fetcher, {
    revalidateOnFocus: false,
  });
}

export function useWeek(week: number | null, refreshInterval?: number) {
  const shouldFetch = week != null && Number.isFinite(week);
  return useSWR<NormalizedWeek>(
    shouldFetch ? `/api/week?week=${week}` : null,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: false,
    },
  );
}


