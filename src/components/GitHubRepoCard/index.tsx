import React from "react";

import { GitHubRepo } from "@/lib/types";

import { languageColors } from "@/lib/hooks/GitHubRepos";

import styles from "./GitHubRepoCard.module.css";

interface GitHubRepoCardProps {
  repo: GitHubRepo;
}

export default function GitHubRepoCard({ repo }: GitHubRepoCardProps) {
  const langColor = repo.language
    ? (languageColors[repo.language] ?? "#ccc")
    : null;

  return (
    <div className={styles["repo-card"]}>
      <div className={styles["repo-card-header"]}>
        <svg
          className={styles["repo-icon"]}
          viewBox="0 0 16 16"
          width="16"
          height="16"
          fill="currentColor"
        >
          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
        </svg>
        <span className={styles["repo-card-name"]}>
          {repo.owner}/<strong>{repo.name}</strong>
        </span>
        <span
          className={`${styles["repo-card-badge"]} ${
            repo.visibility === "Public"
              ? styles["badge-public"]
              : styles["badge-private"]
          }`}
        >
          {repo.visibility}
        </span>
      </div>
      {repo.description && (
        <p className={styles["repo-card-desc"]}>{repo.description}</p>
      )}
      <div className={styles["repo-card-footer"]}>
        {repo.language && (
          <span className={styles["repo-card-meta"]}>
            <span
              className={styles["lang-dot"]}
              style={{ backgroundColor: langColor ?? "#ccc" }}
            />
            {repo.language}
          </span>
        )}
        {repo.stars > 0 && (
          <span className={styles["repo-card-meta"]}>
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
            </svg>
            {repo.stars}
          </span>
        )}
        {repo.forks > 0 && (
          <span className={styles["repo-card-meta"]}>
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
            </svg>
            {repo.forks}
          </span>
        )}
        <span className={styles["repo-card-meta"]}>{repo.updatedAt}</span>
      </div>
    </div>
  );
}
