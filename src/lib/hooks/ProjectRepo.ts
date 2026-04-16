import { useState, useEffect } from 'react';

export type RepoData = {
  name: string;
  description: string;
  language: string | null;
  stars: number;
  forks: number;
  url: string;
  updatedAt: string;
};

export function useProjectRepo(owner: string, repo: string) {
  const [data, setData] = useState<RepoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchRepo() {
      try {
        setLoading(true);
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
        const r = await res.json();
        if (!cancelled) {
          setData({
            name: r.name,
            description: r.description ?? '',
            language: r.language,
            stars: r.stargazers_count,
            forks: r.forks_count,
            url: r.html_url,
            updatedAt: new Date(r.updated_at).toLocaleDateString(),
          });
        }
      } catch {
        // silently fail — project card will show config data instead
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRepo();
    return () => {
      cancelled = true;
    };
  }, [owner, repo]);

  return { data, loading };
}
