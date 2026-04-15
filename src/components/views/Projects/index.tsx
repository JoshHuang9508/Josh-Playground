import React, { useEffect, useState } from "react";

import { AddConsoleLog } from "@/redux";

import useCommandHandler from "@/lib/hooks/CommandHandler";
import { useProjectRepo } from "@/lib/hooks/ProjectRepo";
import { languageColors } from "@/lib/hooks/GitHubRepos";
import { FEATURED_PROJECTS, ProjectConfig } from "@/lib/projects";

import styles from "./Projects.module.css";

function ProjectCard({ project }: { project: ProjectConfig }) {
  const { data: repo } = useProjectRepo(
    project.github.owner,
    project.github.repo,
  );

  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (project.images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % project.images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [project.images.length]);

  const repoUrl =
    repo?.url ??
    `https://github.com/${project.github.owner}/${project.github.repo}`;

  return (
    <div
      className={styles["project-row"]}
      style={{ borderLeftColor: project.accent }}
    >
      {/* Top: image gallery */}
      <div className={styles["project-gallery"]}>
        {project.images.length > 0 ? (
          <div className={styles["gallery-wrapper"]}>
            {project.images.map((img, i) => (
              <img
                key={img}
                src={img}
                alt={`${project.name} screenshot ${i + 1}`}
                className={i === activeImage ? styles["active"] : ""}
              />
            ))}
            {project.images.length > 1 && (
              <div className={styles["gallery-dots"]}>
                {project.images.map((_, i) => (
                  <span
                    key={i}
                    className={`${styles["gallery-dot"]} ${i === activeImage ? styles["active"] : ""}`}
                    onClick={() => setActiveImage(i)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={styles["gallery-placeholder"]}>No images yet</div>
        )}
      </div>

      {/* Bottom: info + GitHub card */}
      <div className={styles["project-info"]}>
        <span className={styles["project-name"]}>{project.name}</span>
        <p className={styles["project-desc"]}>{project.description}</p>
        <div className={styles["project-tags"]}>
          {project.tags.map((tag) => (
            <span
              key={tag}
              className={styles["project-tag"]}
              style={{ color: project.accent }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* GitHub repo card */}
        <div
          className={styles["github-card"]}
          onClick={() => window.open(repoUrl, "_blank")}
        >
          <div className={styles["github-card-header"]}>
            <img
              className={styles["github-icon"]}
              src="/assets/github.png"
              alt="GitHub"
            />
            <span className={styles["github-repo-name"]}>
              {project.github.owner}/{project.github.repo}
            </span>
          </div>
          <div className={styles["github-card-meta"]}>
            {repo?.language && (
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
            {repo && repo.stars > 0 && (
              <span className={styles["stars"]}>&#9733; {repo.stars}</span>
            )}
            {repo && repo.forks > 0 && (
              <span className={styles["forks"]}>&#9906; {repo.forks}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsView() {
  useCommandHandler({
    open: (_cmd, args) => {
      const name = args[0] ?? "";
      if (!name) {
        AddConsoleLog("Usage: @#00ffaaopen@# @#fff700<project-name>@#");
        return;
      }
      const project = FEATURED_PROJECTS.find(
        (p) => p.slug.toLowerCase() === name.toLowerCase(),
      );
      if (project) {
        window.open(
          `https://github.com/${project.github.owner}/${project.github.repo}`,
          "_blank",
        );
        AddConsoleLog(`Opening @#fff700${project.name}@#...`);
      } else {
        AddConsoleLog(`Project @#fff700${name}@# not found.`);
      }
    },
  });

  return (
    <div className={styles["projects-page"]}>
      <p className="page-subtitle">My open-source work and side projects</p>
      <hr className="divider" />

      {FEATURED_PROJECTS.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}
    </div>
  );
}
