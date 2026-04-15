import React from "react";

import { AddConsoleLog } from "@/redux";

import useCommandHandler from "@/lib/hooks/CommandHandler";
import useGitHubRepos, { languageColors } from "@/lib/hooks/GitHubRepos";

import styles from "./Projects.module.css";

const ACCENT_COLORS = ["#00ffaa", "#ff77b7", "#ffa24c", "#00f3ff", "#fff700"];

export default function ProjectsView() {
  const { repos, loading, error } = useGitHubRepos("JoshHuang9508");

  useCommandHandler({
    open: (_cmd, args) => {
      const name = args[0] ?? "";
      if (!name) {
        AddConsoleLog("Usage: @#00ffaaopen@# @#fff700<repo-name>@#");
        return;
      }
      const repo = repos.find(
        (r) => r.name.toLowerCase() === name.toLowerCase(),
      );
      if (repo && repo.url) {
        window.open(repo.url, "_blank");
        AddConsoleLog(`Opening @#fff700${repo.name}@#...`);
      } else {
        AddConsoleLog(`Repo @#fff700${name}@# not found.`);
      }
    },
  });

  return (
    <div className={styles["projects-page"]}>
      <div className={styles["header"]}>
        <p className="page-header" style={{ color: "#00ffaa" }}>
          ~/projects
        </p>
        <p className="page-subtitle">My open-source work and side projects</p>
      </div>

      {loading && <p style={{ color: "#888" }}>Loading repos...</p>}
      {error && <p style={{ color: "#ff77b7" }}>Failed to load repos.</p>}

      <div className={styles["grid"]}>
        {repos.map((repo, index) => (
          <div
            key={repo.name}
            className={`${styles["project-card"]} card-enter`}
            style={{
              borderLeftColor: ACCENT_COLORS[index % ACCENT_COLORS.length],
              animationDelay: `${index * 0.05}s`,
            }}
            onClick={() => repo.url && window.open(repo.url, "_blank")}
          >
            <span className={styles["repo-name"]}>{repo.name}</span>
            {repo.description && (
              <p className={styles["repo-desc"]}>{repo.description}</p>
            )}
            <div className={styles["repo-meta"]}>
              {repo.language && (
                <span className={styles["lang"]}>
                  <span
                    className={styles["lang-dot"]}
                    style={{
                      backgroundColor: languageColors[repo.language] ?? "#ccc",
                    }}
                  />
                  {repo.language}
                </span>
              )}
              {repo.stars > 0 && (
                <span className={styles["stars"]}>&#9733; {repo.stars}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
