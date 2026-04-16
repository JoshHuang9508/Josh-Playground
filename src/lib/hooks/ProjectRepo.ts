import { useState, useEffect } from 'react';

import type * as Types from '@/lib/types';

export default function useProjectRepo(owner: string, repo: string) {
  const [data, setData] = useState<Types.GitHubProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadRepo() {
      try {
        setLoading(true);
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (!res.ok) {
          setData(null);
          return;
        }
        const data = await res.json();

        const mapped: Types.GitHubProject = {
          name: data.name,
          description: data.description ?? '',
          language: data.language,
          stars: data.stargazers_count,
          forks: data.forks_count,
          url: data.html_url,
          updatedAt: new Date(data.updated_at).toLocaleDateString(),
        };

        if (!cancelled) setData(mapped);
      } catch {
        // silently fail — project card will show config data instead
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadRepo();

    return () => {
      cancelled = true;
    };
  }, [owner, repo]);

  return { data, loading };
}
