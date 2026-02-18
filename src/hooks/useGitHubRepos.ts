import { useState, useEffect } from "react";

import { GitHubRepo } from "@/lib/types";

export const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Vue: "#41b883",
  Java: "#b07219",
  "C#": "#178600",
  "C++": "#f34b7d",
  C: "#555555",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
};

export function useGitHubRepos(username?: string) {
  // States
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effects
  useEffect(() => {
    let cancelled = false;

    async function fetchRepos() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=30`,
        );
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
        const data = await res.json();
        const mapped: GitHubRepo[] = data.map((r: any) => ({
          name: r.name,
          owner: r.owner.login,
          description: r.description ?? "",
          language: r.language,
          stars: r.stargazers_count,
          forks: r.forks_count,
          watchers: r.watchers_count,
          visibility: r.private ? "Private" : "Public",
          updatedAt: `Updated ${new Date(r.updated_at).toLocaleDateString()}`,
          url: r.html_url,
        }));
        if (!cancelled) setRepos(mapped);
      } catch (err) {
        if (!cancelled) setError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRepos();
    return () => {
      cancelled = true;
    };
  }, [username]);

  return { repos, loading, error };
}

export default useGitHubRepos;
