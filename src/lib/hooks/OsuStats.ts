import { useState, useEffect } from "react";

import { OsuUser } from "@/lib/types";

const OSU_USER_ID = "15100005";

export function useOsuStats() {
  const [user, setUser] = useState<OsuUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/osu/${OSU_USER_ID}`);
        if (!res.ok) throw new Error(`osu! API error: ${res.status}`);
        const data = await res.json();

        const mapped: OsuUser = {
          username: data.username,
          avatarUrl: data.avatar_url,
          countryCode: data.country_code,
          joinDate: data.join_date,
          globalRank: data.statistics?.global_rank ?? null,
          countryRank: data.statistics?.country_rank ?? null,
          pp: data.statistics?.pp ?? 0,
          accuracy: data.statistics?.hit_accuracy ?? 0,
          playCount: data.statistics?.play_count ?? 0,
          playTime: data.statistics?.play_time ?? 0,
          level: data.statistics?.level?.current ?? 0,
          levelProgress: data.statistics?.level?.progress ?? 0,
          gradeCounts: {
            ss:
              (data.statistics?.grade_counts?.ss ?? 0) +
              (data.statistics?.grade_counts?.ssh ?? 0),
            ssh: data.statistics?.grade_counts?.ssh ?? 0,
            s:
              (data.statistics?.grade_counts?.s ?? 0) +
              (data.statistics?.grade_counts?.sh ?? 0),
            sh: data.statistics?.grade_counts?.sh ?? 0,
            a: data.statistics?.grade_counts?.a ?? 0,
          },
        };

        if (!cancelled) setUser(mapped);
      } catch (err) {
        if (!cancelled) setError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading, error };
}

export default useOsuStats;
