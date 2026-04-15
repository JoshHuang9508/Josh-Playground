# Personal Website Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Josh-Playground from a terminal-centric site into a full personal website with modern GUI pages (Bento homepage, Projects grid, osu! Stats dashboard, Blog with timeline), while keeping the floating console as a power-user tool.

**Architecture:** Next.js SPA using hash routing. New views follow the existing pattern: each page is a component in `src/components/views/`, registers terminal commands via `useCommandHandler`, and is rendered by the switch in `_app.tsx`. Blog posts are Markdown files in `/posts/` parsed at runtime with `gray-matter` + `react-markdown`. osu! data fetched from the public API via a custom hook.

**Tech Stack:** Next.js 15, React 18, Redux Toolkit, CSS Modules, gray-matter, react-markdown, remark-gfm, rehype-highlight

**Design Spec:** `docs/superpowers/specs/2026-04-16-personal-website-redesign.md`

---

## File Structure Overview

### New files to create

```
src/components/Navigation/index.tsx              — Floating breadcrumb navigation
src/components/Navigation/Navigation.module.css
src/components/views/Projects/index.tsx          — Full projects grid page
src/components/views/Projects/Projects.module.css
src/components/views/OsuStats/index.tsx          — osu! stats dashboard page
src/components/views/OsuStats/OsuStats.module.css
src/components/views/Blog/index.tsx              — Blog timeline list page
src/components/views/Blog/Blog.module.css
src/components/views/BlogPost/index.tsx          — Single blog post reader page
src/components/views/BlogPost/BlogPost.module.css
src/lib/hooks/OsuStats.ts                       — osu! API data fetching hook
src/lib/hooks/BlogPosts.ts                      — Blog post loading/parsing hook
public/posts/2026-04-10-terminal-ui.md           — Sample blog post
public/posts/index.json                          — Blog post index manifest
```

### Existing files to modify

```
package.json                                     — Add new dependencies
src/lib/constants.ts                             — Update PATH_LIST, COMMAND_LIST, TEXT_CONTENT
src/lib/types.ts                                 — Add BlogPost, OsuUser types
src/pages/_app.tsx                               — Add new routes, Navigation component
src/components/views/Home/index.tsx              — Complete redesign to Bento layout
src/components/views/Home/Home.module.css        — New Bento styles
src/global.css                                   — Add shared card styles, animations
```

---

## Phase 1: Infrastructure + Homepage + Projects

### Task 1: Install dependencies and add shared types

**Files:**
- Modify: `package.json`
- Modify: `src/lib/types.ts:50-61`

- [ ] **Step 1: Install markdown and syntax highlighting packages**

Run:
```bash
npm install gray-matter react-markdown remark-gfm rehype-highlight
```

- [ ] **Step 2: Add BlogPost and OsuUser types**

Add to `src/lib/types.ts` after the `GitHubRepo` type:

```typescript
export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  color?: string;
  content: string;
  readTime: number;
};

export type BlogPostMeta = Omit<BlogPost, "content">;

export type OsuUser = {
  username: string;
  avatarUrl: string;
  countryCode: string;
  joinDate: string;
  globalRank: number | null;
  countryRank: number | null;
  pp: number;
  accuracy: number;
  playCount: number;
  playTime: number;
  level: number;
  levelProgress: number;
  gradeCounts: {
    ss: number;
    ssh: number;
    s: number;
    sh: number;
    a: number;
  };
};
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json src/lib/types.ts
git commit -m "feat: install blog/markdown deps and add BlogPost, OsuUser types"
```

---

### Task 2: Update routes, PATH_LIST, and COMMAND_LIST

**Files:**
- Modify: `src/lib/constants.ts:179-183` (PATH_LIST)
- Modify: `src/lib/constants.ts:5-98` (COMMAND_LIST)
- Modify: `src/lib/constants.ts:194-464` (TEXT_CONTENT)

- [ ] **Step 1: Update PATH_LIST**

In `src/lib/constants.ts`, replace the `PATH_LIST` object:

```typescript
export const PATH_LIST = {
  "/": ["projects/", "osu/", "blog/", "listentogether/", "ytdownloader/"],
  "/projects": [],
  "/osu": [],
  "/blog": [],
  "/listentogether": [],
  "/ytdownloader": [],
};
```

- [ ] **Step 2: Add COMMAND_LIST entries for new pages**

In `src/lib/constants.ts`, add these entries to `COMMAND_LIST` after the existing `"ytdownloader/"` entry:

```typescript
  "projects/": [
    {
      name: "open",
      description: "Open a GitHub repo in a new tab",
      usage: "@#00ffaaopen@# @#fff700<repo-name>@#",
    },
  ],
  "osu/": [
    {
      name: "stats",
      description: "Show osu! stats summary in console",
      usage: "@#00ffaastats@#",
    },
  ],
  "blog/": [
    {
      name: "read",
      description: "Open a blog post by slug",
      usage: "@#00ffaaread@# @#fff700<slug>@#",
    },
  ],
```

- [ ] **Step 3: Add TEXT_CONTENT for new pages**

In `src/lib/constants.ts`, add these entries to `TEXT_CONTENT` before the `"*"` entry:

```typescript
  "/projects": {
    title: "Projects",
    subtitle: "My open-source work and side projects.",
  },
  "/osu": {
    title: "osu! Stats",
    subtitle: "My osu! profile and gameplay statistics.",
  },
  "/blog": {
    title: "Blog",
    subtitle: "Thoughts on development, life, and gaming.",
  },
```

- [ ] **Step 4: Add TAG_COLORS constant**

In `src/lib/constants.ts`, add after the `PATH_LIST`:

```typescript
export const TAG_COLORS: Record<string, string> = {
  dev: "#00ffaa",
  life: "#ff77b7",
  gaming: "#00f3ff",
  design: "#ffa24c",
};
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/constants.ts
git commit -m "feat: update PATH_LIST, COMMAND_LIST, TEXT_CONTENT for new pages"
```

---

### Task 3: Add shared card styles and animations to global CSS

**Files:**
- Modify: `src/global.css:185` (end of file, after `/* Test zone */`)

- [ ] **Step 1: Add shared card and animation styles**

Append to the end of `src/global.css`:

```css
/* Shared card styles */
div.card {
  padding: 0.75rem 1rem;
  background-color: #16213e;
  border-radius: 0.5rem;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

div.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px #00000060;
}

/* Page header terminal-style */
p.page-header {
  font-family: Consolas, monospace;
  font-size: 1.4rem;
  font-weight: bold;
}

p.page-subtitle {
  font-size: 0.9rem;
  color: #888;
}

/* Section label (monospace colored) */
span.section-label {
  font-family: Consolas, monospace;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Staggered fade-in for cards */
@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

div.card-enter {
  opacity: 0;
  animation: card-enter 0.5s ease forwards;
}

/* Link arrow style */
a.view-all-link {
  display: inline-flex;
  gap: 0.25rem;
  align-items: center;
  font-family: Consolas, monospace;
  font-size: 0.8rem;
  color: #fff700;
  text-decoration: none;
  transition: gap 0.2s ease;
}

a.view-all-link:hover {
  gap: 0.5rem;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/global.css
git commit -m "style: add shared card styles, animations, and utility classes"
```

---

### Task 4: Create Navigation component

**Files:**
- Create: `src/components/Navigation/index.tsx`
- Create: `src/components/Navigation/Navigation.module.css`

- [ ] **Step 1: Create Navigation.module.css**

Create `src/components/Navigation/Navigation.module.css`:

```css
nav.breadcrumb {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 100;
  display: flex;
  gap: 0.25rem;
  align-items: center;
  padding: 0.4rem 0.8rem;
  font-family: Consolas, monospace;
  font-size: 0.85rem;
  background-color: #16213e99;
  border-radius: 2rem;
  backdrop-filter: blur(8px);
}

span.segment {
  color: #888;
  cursor: pointer;
  transition: color 0.2s ease;
}

span.segment:hover {
  color: #fff;
}

span.segment.active {
  color: #fff;
}

span.home {
  color: #00ffaa;
}

span.home:hover {
  color: #00ffdd;
}

span.separator {
  color: #555;
  user-select: none;
}
```

- [ ] **Step 2: Create Navigation component**

Create `src/components/Navigation/index.tsx`:

```tsx
import React from "react";

import styles from "./Navigation.module.css";

interface NavigationProps {
  currentHash: string;
}

export default function Navigation({ currentHash }: NavigationProps) {
  const segments = currentHash.split("/").filter(Boolean);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  return (
    <nav className={styles["breadcrumb"]}>
      <span
        className={`${styles["segment"]} ${styles["home"]}`}
        onClick={() => navigate("#/")}
      >
        ~
      </span>
      {segments.map((segment, index) => {
        const path = `#/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        return (
          <React.Fragment key={path}>
            <span className={styles["separator"]}>/</span>
            <span
              className={`${styles["segment"]} ${isLast ? styles["active"] : ""}`}
              onClick={() => navigate(path)}
            >
              {segment}
            </span>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Navigation/index.tsx src/components/Navigation/Navigation.module.css
git commit -m "feat: add floating breadcrumb Navigation component"
```

---

### Task 5: Create Projects view

**Files:**
- Create: `src/components/views/Projects/index.tsx`
- Create: `src/components/views/Projects/Projects.module.css`

- [ ] **Step 1: Create Projects.module.css**

Create `src/components/views/Projects/Projects.module.css`:

```css
div.projects-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 900px;
  padding: 3rem 2rem 2rem;
  margin: 0 auto;
  overflow-y: auto;
}

div.projects-page::-webkit-scrollbar {
  width: 0;
}

div.header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

div.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

div.project-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  background-color: #16213e;
  border-left: 3px solid #00ffaa;
  border-radius: 0.5rem;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-left-width 0.2s ease;
}

div.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px #00000060;
  border-left-width: 5px;
}

span.repo-name {
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
}

p.repo-desc {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  line-clamp: 2;
  font-size: 0.8rem;
  line-height: 1.4;
  color: #888;
  -webkit-box-orient: vertical;
}

div.repo-meta {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-top: auto;
}

span.lang {
  display: inline-flex;
  gap: 0.25rem;
  align-items: center;
  font-size: 0.75rem;
  color: #888;
}

span.lang-dot {
  display: inline-block;
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
}

span.stars {
  font-size: 0.75rem;
  color: #fff700;
}

@media (width <= 768px) {
  div.grid {
    grid-template-columns: 1fr;
  }

  div.projects-page {
    padding: 3rem 1rem 2rem;
  }
}
```

- [ ] **Step 2: Create Projects view component**

Create `src/components/views/Projects/index.tsx`:

```tsx
import React from "react";

import { AddConsoleLog } from "@/redux";

import useCommandHandler from "@/lib/hooks/CommandHandler";
import useGitHubRepos, { languageColors } from "@/lib/hooks/GitHubRepos";

import { t } from "@/lib/i18n";

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
        <p className="page-subtitle">
          My open-source work and side projects
        </p>
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
                      backgroundColor:
                        languageColors[repo.language] ?? "#ccc",
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/views/Projects/index.tsx src/components/views/Projects/Projects.module.css
git commit -m "feat: add Projects view with color-accent grid layout"
```

---

### Task 6: Redesign Homepage as Bento layout

**Files:**
- Modify: `src/components/views/Home/index.tsx` (full rewrite)
- Modify: `src/components/views/Home/Home.module.css` (full rewrite)

- [ ] **Step 1: Rewrite Home.module.css**

Replace the entire contents of `src/components/views/Home/Home.module.css`:

```css
div.home-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 900px;
  padding: 3rem 2rem 2rem;
  margin: 0 auto;
  overflow-y: auto;
}

div.home-page::-webkit-scrollbar {
  width: 0;
}

div.bento {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 0.75rem;
  width: 100%;
}

/* Hero card */
div.hero-card {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  padding: 1.25rem;
  background-color: #16213e;
  border-radius: 0.5rem;
}

img.avatar {
  width: 5rem;
  height: 5rem;
  flex-shrink: 0;
  border-radius: 50%;
  box-shadow: 0 0 12px #ff77b740;
}

img.avatar.spin {
  animation: spin 5s infinite linear;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

div.hero-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

span.hero-name {
  font-size: 1.4rem;
  font-weight: bold;
  color: #fff;
}

span.hero-school {
  display: inline-block;
  width: fit-content;
  padding: 0.1rem 0.5rem;
  font-size: 0.7rem;
  color: #00f3ff;
  background-color: #00f3ff15;
  border-radius: 1rem;
}

p.hero-bio {
  font-size: 0.8rem;
  line-height: 1.5;
  color: #bababa;
}

div.social-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

img.social-icon {
  width: 1.4rem;
  height: 1.4rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

img.social-icon:hover {
  opacity: 1;
  transform: scale(1.15);
}

/* Preview cards */
div.preview-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #16213e;
  border-radius: 0.5rem;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

div.preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px #00000060;
}

div.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Mini repo cards inside projects preview */
div.mini-repo {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.4rem 0.6rem;
  background-color: #0f3460;
  border-radius: 0.35rem;
  transition: background-color 0.2s ease;
}

div.mini-repo:hover {
  background-color: #0f346099;
}

span.mini-repo-name {
  font-size: 0.8rem;
  color: #fff;
}

span.mini-lang-dot {
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
}

/* osu stats preview */
div.stat-row {
  display: flex;
  gap: 1rem;
}

div.stat-item {
  display: flex;
  flex-direction: column;
}

span.stat-value {
  font-family: Consolas, monospace;
  font-size: 1.1rem;
  font-weight: bold;
  color: #fff;
}

span.stat-label {
  font-size: 0.65rem;
  color: #888;
}

/* Blog preview */
span.post-title {
  font-size: 0.9rem;
  font-weight: bold;
  color: #fff;
}

p.post-excerpt {
  font-size: 0.75rem;
  line-height: 1.4;
  color: #888;
}

span.post-date {
  font-size: 0.7rem;
  color: #ffa24c;
}

/* Music info */
div.music-info {
  display: flex;
  justify-content: flex-start;
  margin-top: -0.5rem;
  transition: all 0.5s ease-in-out;
}

div.music-info.show {
  width: 100%;
  opacity: 1;
}

div.music-info.hidden {
  width: 0;
  opacity: 0;
}

/* Footer */
p.footer {
  font-family: Consolas, monospace;
  font-size: 0.65rem;
  color: #555;
}

/* Responsive */
@media (width <= 768px) {
  div.bento {
    grid-template-columns: 1fr;
  }

  div.hero-card {
    flex-direction: column;
    text-align: center;
  }

  div.social-row {
    justify-content: center;
  }

  div.home-page {
    padding: 3rem 1rem 2rem;
  }
}
```

- [ ] **Step 2: Rewrite Home/index.tsx**

Replace the entire contents of `src/components/views/Home/index.tsx`:

```tsx
import React, { useEffect, useRef, useState } from "react";

import { AddConsoleLog } from "@/redux";

import ColorSpan from "@/components/ColorSpan";

import { MUSIC_LIST, TEXT_CONTENT } from "@/lib/constants";
import { t } from "@/lib/i18n";
import useCommandHandler from "@/lib/hooks/CommandHandler";
import useGitHubRepos, { languageColors } from "@/lib/hooks/GitHubRepos";

import styles from "./Home.module.css";

const SOCIAL_LINKS = [
  { icon: "github", url: "https://github.com/JoshHuang9508" },
  { icon: "youtube", url: "https://www.youtube.com/@whydog5555" },
  { icon: "twitter", url: "https://x.com/whydog5555" },
  { icon: "instagram", url: "https://www.instagram.com/whydog5555/" },
  { icon: "twitch", url: "https://www.twitch.tv/whydog5555" },
  { icon: "discord", url: "https://discord.com/users/whydog5555" },
  { icon: "osu", url: "https://osu.ppy.sh/users/15100005" },
];

export default function HomeView() {
  const { repos } = useGitHubRepos("JoshHuang9508");

  const imageRef = useRef<HTMLImageElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [musicIndex, setMusicIndex] = useState(0);
  const [showMusicInfo, setShowMusicInfo] = useState(false);

  const topRepos = repos.slice(0, 3);

  const stopSpin = () => {
    if (!imageRef.current) return;
    const computed = window.getComputedStyle(imageRef.current);
    const matrix = new DOMMatrixReadOnly(computed.transform);
    const rotation =
      Math.atan2(matrix.m21, matrix.m11) * (180 / Math.PI) * -1;
    imageRef.current.style.setProperty(
      "--current-rotation",
      `${rotation}deg`,
    );
  };

  const handleMusicEnd = () => {
    setMusicIndex((prev) => (prev + 1) % MUSIC_LIST.length);
  };

  useCommandHandler({
    github: () => {
      window.open("https://github.com/JoshHuang9508", "_blank");
      AddConsoleLog(t("home.commands.github"));
    },
    youtube: () => {
      window.open("https://www.youtube.com/@whydog5555", "_blank");
      AddConsoleLog(t("home.commands.youtube"));
    },
    twitter: () => {
      window.open("https://x.com/whydog5555", "_blank");
      AddConsoleLog(t("home.commands.twitter"));
    },
    instagram: () => {
      window.open("https://www.instagram.com/whydog5555/", "_blank");
      AddConsoleLog(t("home.commands.instagram"));
    },
    twitch: () => {
      window.open("https://www.twitch.tv/whydog5555", "_blank");
      AddConsoleLog(t("home.commands.twitch"));
    },
    discord: () => {
      window.open("https://discord.com/users/whydog5555", "_blank");
      AddConsoleLog(t("home.commands.discord"));
    },
    email: () => {
      window.open("mailto:joshhuang9508@gmail.com", "_blank");
      AddConsoleLog(t("home.commands.email"));
    },
    osu: () => {
      window.open("https://osu.ppy.sh/users/15100005", "_blank");
      AddConsoleLog(t("home.commands.osu"));
    },
    music: (_cmd, _args, flags) => {
      if (flags.includes("-l") || flags.includes("--list")) {
        AddConsoleLog(
          t("commands.music.list"),
          ...MUSIC_LIST.map((_, index) => `#${index} - ${_.name}`),
        );
        return;
      }
      if (flags.includes("-p") || flags.includes("--play")) {
        if (audioPlayerRef.current) audioPlayerRef.current.play();
        return;
      }
      if (flags.includes("-s") || flags.includes("--stop")) {
        if (audioPlayerRef.current) audioPlayerRef.current.pause();
        return;
      }
      if (flags.includes("-i") || flags.includes("--info")) {
        setShowMusicInfo(!showMusicInfo);
        if (showMusicInfo) stopSpin();
        return;
      }
      AddConsoleLog(t("commands.music.usage"));
    },
  });

  useEffect(() => {
    const onInteraction = () => {
      if (!audioPlayerRef.current || isPlaying) return;
      audioPlayerRef.current.play();
      audioPlayerRef.current.volume = 0.05;
      setIsPlaying(true);
    };
    document.addEventListener("click", onInteraction);
    document.addEventListener("touchstart", onInteraction);
    return () => {
      document.removeEventListener("click", onInteraction);
      document.removeEventListener("touchstart", onInteraction);
    };
  }, [showMusicInfo, isPlaying]);

  useEffect(() => {
    if (!audioPlayerRef.current) return;
    audioPlayerRef.current.src = MUSIC_LIST[musicIndex].path;
    audioPlayerRef.current.play();
    audioPlayerRef.current.volume = 0.05;
  }, [musicIndex]);

  return (
    <div className={styles["home-page"]}>
      <audio
        ref={audioPlayerRef}
        src={MUSIC_LIST[musicIndex].path}
        onEnded={handleMusicEnd}
      />

      <div className={styles["bento"]}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {/* Hero card */}
          <div className={styles["hero-card"]}>
            <img
              ref={imageRef}
              className={`${styles["avatar"]} ${showMusicInfo ? styles["spin"] : ""}`}
              src="/assets/pfp.png"
              alt="Profile"
            />
            <div className={styles["hero-info"]}>
              <span className={styles["hero-name"]}>Whitedog</span>
              <span className={styles["hero-school"]}>NTUST-CSIE</span>
              <p className={styles["hero-bio"]}>
                18yo developer. I love playing games and coding. Passionate
                about full-stack development and UI/UX design.
              </p>
              <div className={styles["social-row"]}>
                {SOCIAL_LINKS.map((social) => (
                  <img
                    key={social.icon}
                    className={styles["social-icon"]}
                    src={`/assets/${social.icon}.png`}
                    alt={social.icon}
                    title={social.icon}
                    onClick={() => window.open(social.url, "_blank")}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Music info */}
          <div
            className={`${styles["music-info"]} ${showMusicInfo ? styles["show"] : styles["hidden"]}`}
          >
            <ColorSpan
              str={t("commands.music.nowPlaying", MUSIC_LIST[musicIndex].name)}
              className="p1"
              style={{ whiteSpace: "pre" }}
            />
          </div>

          {/* Latest post preview */}
          <div
            className={styles["preview-card"]}
            style={{ cursor: "pointer" }}
            onClick={() => (window.location.hash = "#/blog")}
          >
            <div className={styles["preview-header"]}>
              <span className="section-label" style={{ color: "#ffa24c" }}>
                LATEST POST
              </span>
              <a
                className="view-all-link"
                href="#/blog"
                onClick={(e) => e.stopPropagation()}
              >
                Read <span>&rarr;</span>
              </a>
            </div>
            <span className={styles["post-title"]}>Coming soon...</span>
            <p className={styles["post-excerpt"]}>
              Stay tuned for the first blog post.
            </p>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {/* Projects preview */}
          <div className={styles["preview-card"]}>
            <div className={styles["preview-header"]}>
              <span className="section-label" style={{ color: "#00ffaa" }}>
                PROJECTS
              </span>
              <a className="view-all-link" href="#/projects">
                View All <span>&rarr;</span>
              </a>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}
            >
              {topRepos.map((repo) => (
                <div
                  key={repo.name}
                  className={styles["mini-repo"]}
                  onClick={() => repo.url && window.open(repo.url, "_blank")}
                  style={{ cursor: "pointer" }}
                >
                  {repo.language && (
                    <span
                      className={styles["mini-lang-dot"]}
                      style={{
                        backgroundColor:
                          languageColors[repo.language] ?? "#ccc",
                      }}
                    />
                  )}
                  <span className={styles["mini-repo-name"]}>{repo.name}</span>
                </div>
              ))}
              {topRepos.length === 0 && (
                <p style={{ color: "#888", fontSize: "0.8rem" }}>Loading...</p>
              )}
            </div>
          </div>

          {/* osu! stats preview */}
          <div
            className={styles["preview-card"]}
            style={{ cursor: "pointer" }}
            onClick={() => (window.location.hash = "#/osu")}
          >
            <div className={styles["preview-header"]}>
              <span className="section-label" style={{ color: "#ff77b7" }}>
                OSU! STATS
              </span>
              <a
                className="view-all-link"
                href="#/osu"
                onClick={(e) => e.stopPropagation()}
              >
                Details <span>&rarr;</span>
              </a>
            </div>
            <div className={styles["stat-row"]}>
              <div className={styles["stat-item"]}>
                <span className={styles["stat-value"]}>--</span>
                <span className={styles["stat-label"]}>Global Rank</span>
              </div>
              <div className={styles["stat-item"]}>
                <span className={styles["stat-value"]}>--</span>
                <span className={styles["stat-label"]}>PP</span>
              </div>
              <div className={styles["stat-item"]}>
                <span className={styles["stat-value"]}>--</span>
                <span className={styles["stat-label"]}>Accuracy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className={styles["footer"]}>
        built with next.js + too much coffee
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Verify in dev server**

Run `npm run dev` and open the browser. Check:
- Bento layout renders with hero card (avatar, name, school, bio, social icons)
- Projects preview shows 3 mini repo cards
- osu! stats shows placeholder dashes
- Blog preview shows "Coming soon"
- All social icon clicks open correct URLs
- Music controls still work
- Responsive: on narrow viewport, columns stack vertically

- [ ] **Step 4: Commit**

```bash
git add src/components/views/Home/index.tsx src/components/views/Home/Home.module.css
git commit -m "feat: redesign homepage as two-column Bento layout with preview cards"
```

---

### Task 7: Wire up new routes in _app.tsx

**Files:**
- Modify: `src/pages/_app.tsx`

- [ ] **Step 1: Add imports and update renderView**

In `src/pages/_app.tsx`, add the new imports after existing view imports:

```typescript
import ProjectsView from "@/components/views/Projects";
import Navigation from "@/components/Navigation";
```

Then update the `renderView` function's switch statement to include new routes:

```typescript
  const renderView = () => {
    if (isMobile) {
      return <MobileView />;
    } else {
      switch (currentHash) {
        case "/":
          return <HomeView />;
        case "/projects":
          return <ProjectsView />;
        case "/listentogether":
          return <ListenTogetherView />;
        case "/ytdownloader":
          return <YtDownloaderView />;
        default:
          return <NotFoundView />;
      }
    }
  };
```

- [ ] **Step 2: Add Navigation component to the layout**

In the JSX, add `<Navigation>` inside the `AppContext.Provider`, right before the container div:

```tsx
        <Navigation currentHash={currentHash} />
        <div className={styles["container"]}>{renderView()}</div>
        {!isMobile && <ConsoleManager />}
```

- [ ] **Step 3: Verify routing**

Run `npm run dev` and verify:
- `#/` shows new Bento homepage
- `#/projects` shows Projects grid with GitHub repos
- Terminal `cd projects` navigates correctly
- Terminal `cd /` returns home
- Breadcrumb navigation works (click `~` goes home, click `projects` stays)
- `#/listentogether` and `#/ytdownloader` still work

- [ ] **Step 4: Commit**

```bash
git add src/pages/_app.tsx
git commit -m "feat: wire up Projects route and Navigation component in app layout"
```

---

## Phase 2: Blog System

### Task 8: Create blog post loading hook

**Files:**
- Create: `src/lib/hooks/BlogPosts.ts`

- [ ] **Step 1: Create BlogPosts hook**

Create `src/lib/hooks/BlogPosts.ts`:

```typescript
import { useState, useEffect } from "react";

import { BlogPost, BlogPostMeta } from "@/lib/types";
import { TAG_COLORS } from "@/lib/constants";

function calculateReadTime(content: string): number {
  const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = content
    .replace(/[\u4e00-\u9fff]/g, "")
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = chineseChars / 200 + englishWords / 250;
  return Math.max(1, Math.round(minutes));
}

export function getTagColor(tag: string): string {
  return TAG_COLORS[tag] ?? "#888";
}

export function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPostMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch("/posts/index.json");
        if (!res.ok) {
          setPosts([]);
          return;
        }
        const index: BlogPostMeta[] = await res.json();
        setPosts(index.sort((a, b) => b.date.localeCompare(a.date)));
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  return { posts, loading };
}

export function useBlogPost(slug: string | null) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    async function loadPost() {
      try {
        const res = await fetch(`/posts/${slug}.md`);
        if (!res.ok) {
          setPost(null);
          return;
        }
        const raw = await res.text();

        const matter = await import("gray-matter");
        const { data, content } = matter.default(raw);

        const blogPost: BlogPost = {
          slug,
          title: data.title ?? slug,
          date: data.date ?? "",
          tags: data.tags ?? [],
          excerpt: data.excerpt ?? "",
          color: data.color,
          content,
          readTime: calculateReadTime(content),
        };
        setPost(blogPost);
      } catch {
        setPost(null);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [slug]);

  return { post, loading };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/hooks/BlogPosts.ts
git commit -m "feat: add useBlogPosts and useBlogPost hooks for markdown loading"
```

---

### Task 9: Create sample blog post and index

**Files:**
- Create: `public/posts/2026-04-10-terminal-ui.md`
- Create: `public/posts/index.json`

- [ ] **Step 1: Create the posts directory and sample post**

Create `public/posts/2026-04-10-terminal-ui.md`:

```markdown
---
title: "Building a Terminal UI for My Website"
date: "2026-04-10"
tags: ["dev"]
excerpt: "How I built a draggable, resizable console component with React and made it a core part of my personal site."
---

# Building a Terminal UI for My Website

Ever since I started coding, I've been fascinated by terminal interfaces. There's something satisfying about typing commands and watching things happen. So when I set out to build my personal website, I knew I wanted to incorporate that experience.

## The Concept

The idea was simple: what if my personal website had a real, functional terminal? Not just a decorative one, but something you could actually use to navigate, control music, and interact with the site.

## Tech Stack

I built it with **React** and **Next.js**, using:

- **Redux** for state management (command dispatching)
- **CSS Modules** for scoped styling
- Custom drag & resize logic with mouse events

## The Console Component

The console supports:

- Dragging and resizing (like a real OS window)
- Minimize, maximize, and close
- Command history (arrow keys)
- Tab auto-completion
- Multiple console instances (`Ctrl + backtick`)

```tsx
// Command handling is beautifully simple
useCommandHandler({
  github: () => {
    window.open("https://github.com/JoshHuang9508", "_blank");
  },
  music: (_cmd, _args, flags) => {
    // Handle music flags
  },
});
```

## What I Learned

Building this taught me a lot about event handling in React, especially managing global mouse events for drag and resize operations. The key insight was using `useCallback` and refs to avoid stale closures.

It also reminded me that **personality matters in design**. A standard portfolio site would have been easier, but the terminal gives visitors something to play with and remember.

## What's Next

I'm planning to add more pages — a projects showcase, game stats, and a blog (you're reading it!). The terminal will always be there as a power-user shortcut.

Stay tuned.
```

- [ ] **Step 2: Create the post index**

Create `public/posts/index.json`:

```json
[
  {
    "slug": "2026-04-10-terminal-ui",
    "title": "Building a Terminal UI for My Website",
    "date": "2026-04-10",
    "tags": ["dev"],
    "excerpt": "How I built a draggable, resizable console component with React and made it a core part of my personal site.",
    "readTime": 3
  }
]
```

- [ ] **Step 3: Commit**

```bash
git add public/posts/2026-04-10-terminal-ui.md public/posts/index.json
git commit -m "feat: add sample blog post and posts index"
```

---

### Task 10: Create Blog timeline list view

**Files:**
- Create: `src/components/views/Blog/index.tsx`
- Create: `src/components/views/Blog/Blog.module.css`

- [ ] **Step 1: Create Blog.module.css**

Create `src/components/views/Blog/Blog.module.css`:

```css
div.blog-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 700px;
  padding: 3rem 2rem 2rem;
  margin: 0 auto;
  overflow-y: auto;
}

div.blog-page::-webkit-scrollbar {
  width: 0;
}

div.header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

div.timeline {
  position: relative;
  padding-left: 1.5rem;
}

div.timeline-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0.35rem;
  width: 1px;
  background-color: #333;
}

div.timeline-entry {
  position: relative;
  margin-bottom: 1.25rem;
}

div.timeline-dot {
  position: absolute;
  top: 0.2rem;
  left: -1.25rem;
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  animation: pulse 0.6s ease forwards;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.4);
  }

  100% {
    transform: scale(1);
  }
}

span.timeline-date {
  font-family: Consolas, monospace;
  font-size: 0.7rem;
  color: #888;
}

div.post-card {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.75rem 1rem;
  margin-top: 0.35rem;
  cursor: pointer;
  background-color: #16213e;
  border-radius: 0.5rem;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

div.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px #00000060;
}

span.post-title {
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
}

p.post-excerpt {
  font-size: 0.8rem;
  line-height: 1.4;
  color: #888;
}

div.post-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

span.tag-badge {
  padding: 0.1rem 0.4rem;
  font-size: 0.65rem;
  border-radius: 0.75rem;
  background-color: #0f3460;
}

span.read-time {
  font-size: 0.65rem;
  color: #888;
}

div.empty {
  padding: 2rem;
  text-align: center;
  color: #888;
  font-size: 0.9rem;
}

@media (width <= 768px) {
  div.blog-page {
    padding: 3rem 1rem 2rem;
  }
}
```

- [ ] **Step 2: Create Blog list view component**

Create `src/components/views/Blog/index.tsx`:

```tsx
import React from "react";

import { AddConsoleLog } from "@/redux";

import useCommandHandler from "@/lib/hooks/CommandHandler";
import { useBlogPosts, getTagColor } from "@/lib/hooks/BlogPosts";

import styles from "./Blog.module.css";

export default function BlogView() {
  const { posts, loading } = useBlogPosts();

  useCommandHandler({
    read: (_cmd, args) => {
      const slug = args[0] ?? "";
      if (!slug) {
        AddConsoleLog("Usage: @#00ffaaread@# @#fff700<slug>@#");
        return;
      }
      const post = posts.find((p) => p.slug === slug);
      if (post) {
        window.location.hash = `#/blog/${slug}`;
        AddConsoleLog(`Opening @#fff700${post.title}@#...`);
      } else {
        AddConsoleLog(`Post @#fff700${slug}@# not found.`);
      }
    },
  });

  return (
    <div className={styles["blog-page"]}>
      <div className={styles["header"]}>
        <p className="page-header" style={{ color: "#ffa24c" }}>
          ~/blog
        </p>
        <p className="page-subtitle">
          Thoughts on development, life, and gaming
        </p>
      </div>

      {loading && <p style={{ color: "#888" }}>Loading posts...</p>}

      {!loading && posts.length === 0 && (
        <div className={styles["empty"]}>No posts yet. Stay tuned.</div>
      )}

      {posts.length > 0 && (
        <div className={styles["timeline"]}>
          <div className={styles["timeline-line"]} />
          {posts.map((post, index) => {
            const tagColor = getTagColor(post.tags[0] ?? "");
            return (
              <div
                key={post.slug}
                className={styles["timeline-entry"]}
              >
                <div
                  className={styles["timeline-dot"]}
                  style={{
                    backgroundColor: tagColor,
                    animationDelay: `${index * 0.1}s`,
                  }}
                />
                <span className={styles["timeline-date"]}>{post.date}</span>
                <div
                  className={styles["post-card"]}
                  onClick={() =>
                    (window.location.hash = `#/blog/${post.slug}`)
                  }
                >
                  <span className={styles["post-title"]}>{post.title}</span>
                  <p className={styles["post-excerpt"]}>{post.excerpt}</p>
                  <div className={styles["post-meta"]}>
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className={styles["tag-badge"]}
                        style={{ color: getTagColor(tag) }}
                      >
                        {tag}
                      </span>
                    ))}
                    <span className={styles["read-time"]}>
                      {post.readTime} min read
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/views/Blog/index.tsx src/components/views/Blog/Blog.module.css
git commit -m "feat: add Blog timeline list view"
```

---

### Task 11: Create BlogPost article view

**Files:**
- Create: `src/components/views/BlogPost/index.tsx`
- Create: `src/components/views/BlogPost/BlogPost.module.css`

- [ ] **Step 1: Create BlogPost.module.css**

Create `src/components/views/BlogPost/BlogPost.module.css`:

```css
div.blogpost-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 700px;
  padding: 3rem 2rem 2rem;
  margin: 0 auto;
  overflow-y: auto;
}

div.blogpost-page::-webkit-scrollbar {
  width: 0;
}

/* Reading progress bar */
div.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 200;
  height: 2px;
  background-color: #ffa24c;
  transition: width 0.1s linear;
}

/* Article header */
div.article-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

h1.article-title {
  font-size: 1.6rem;
  font-weight: bold;
  line-height: 1.3;
  color: #fff;
}

div.article-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

span.article-date {
  font-family: Consolas, monospace;
  font-size: 0.75rem;
  color: #888;
}

span.article-tag {
  padding: 0.1rem 0.4rem;
  font-size: 0.65rem;
  background-color: #0f3460;
  border-radius: 0.75rem;
}

span.article-read-time {
  font-size: 0.7rem;
  color: #888;
}

/* Markdown body */
div.article-body {
  font-family: "Noto Sans TC", sans-serif;
  font-size: 0.95rem;
  line-height: 1.7;
  color: #ccc;
}

div.article-body h1,
div.article-body h2,
div.article-body h3 {
  font-family: Consolas, "Noto Sans TC", sans-serif;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  color: #fff;
}

div.article-body h1 { font-size: 1.4rem; }
div.article-body h2 { font-size: 1.2rem; }
div.article-body h3 { font-size: 1rem; }

div.article-body p {
  margin-bottom: 0.75rem;
}

div.article-body a {
  color: #00ffaa;
  text-decoration: underline;
  text-underline-offset: 2px;
}

div.article-body strong {
  color: #fff;
}

div.article-body ul,
div.article-body ol {
  padding-left: 1.25rem;
  margin-bottom: 0.75rem;
}

div.article-body li {
  margin-bottom: 0.25rem;
}

div.article-body code {
  padding: 0.15rem 0.35rem;
  font-family: Consolas, monospace;
  font-size: 0.85rem;
  color: #fff700;
  background-color: #0f3460;
  border-radius: 0.25rem;
}

div.article-body pre {
  padding: 1rem;
  margin-bottom: 0.75rem;
  overflow-x: auto;
  font-family: Consolas, monospace;
  font-size: 0.8rem;
  line-height: 1.5;
  background-color: #0d1117;
  border: 1px solid #30363d;
  border-radius: 0.5rem;
}

div.article-body pre code {
  padding: 0;
  color: inherit;
  background: none;
  border-radius: 0;
}

div.article-body blockquote {
  padding-left: 1rem;
  margin-bottom: 0.75rem;
  color: #888;
  border-left: 3px solid #ffa24c;
}

div.article-body hr {
  margin: 1.5rem 0;
  border: none;
  border-top: 1px solid #333;
}

/* Navigation */
div.article-nav {
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid #333;
}

a.back-link {
  font-family: Consolas, monospace;
  font-size: 0.8rem;
  color: #fff700;
  text-decoration: none;
}

a.back-link:hover {
  text-decoration: underline;
}

div.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
  color: #888;
}

@media (width <= 768px) {
  div.blogpost-page {
    padding: 3rem 1rem 2rem;
  }

  h1.article-title {
    font-size: 1.3rem;
  }
}
```

- [ ] **Step 2: Create BlogPost view component**

Create `src/components/views/BlogPost/index.tsx`:

```tsx
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import { useBlogPost, getTagColor } from "@/lib/hooks/BlogPosts";

import styles from "./BlogPost.module.css";

interface BlogPostViewProps {
  slug: string;
}

export default function BlogPostView({ slug }: BlogPostViewProps) {
  const { post, loading } = useBlogPost(slug);
  const pageRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      if (scrollHeight > 0) {
        setProgress((scrollTop / scrollHeight) * 100);
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [post]);

  if (loading) {
    return (
      <div className={styles["blogpost-page"]}>
        <div className={styles["loading"]}>Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles["blogpost-page"]}>
        <div className={styles["loading"]}>Post not found.</div>
        <a className={styles["back-link"]} href="#/blog">
          &larr; Back to ~/blog
        </a>
      </div>
    );
  }

  return (
    <div className={styles["blogpost-page"]} ref={pageRef}>
      <div
        className={styles["progress-bar"]}
        style={{ width: `${progress}%` }}
      />

      <div className={styles["article-header"]}>
        <h1 className={styles["article-title"]}>{post.title}</h1>
        <div className={styles["article-meta"]}>
          <span className={styles["article-date"]}>{post.date}</span>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className={styles["article-tag"]}
              style={{ color: getTagColor(tag) }}
            >
              {tag}
            </span>
          ))}
          <span className={styles["article-read-time"]}>
            {post.readTime} min read
          </span>
        </div>
      </div>

      <div className={styles["article-body"]}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {post.content}
        </ReactMarkdown>
      </div>

      <div className={styles["article-nav"]}>
        <a className={styles["back-link"]} href="#/blog">
          &larr; Back to ~/blog
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/views/BlogPost/index.tsx src/components/views/BlogPost/BlogPost.module.css
git commit -m "feat: add BlogPost article view with markdown rendering and progress bar"
```

---

### Task 12: Wire up Blog routes

**Files:**
- Modify: `src/pages/_app.tsx`

- [ ] **Step 1: Add blog imports and routes**

In `src/pages/_app.tsx`, add imports:

```typescript
import BlogView from "@/components/views/Blog";
import BlogPostView from "@/components/views/BlogPost";
```

Update `renderView` to handle blog routes:

```typescript
  const renderView = () => {
    if (isMobile) {
      return <MobileView />;
    } else {
      if (currentHash.startsWith("/blog/") && currentHash !== "/blog") {
        const slug = currentHash.slice("/blog/".length);
        return <BlogPostView slug={slug} />;
      }

      switch (currentHash) {
        case "/":
          return <HomeView />;
        case "/projects":
          return <ProjectsView />;
        case "/blog":
          return <BlogView />;
        case "/listentogether":
          return <ListenTogetherView />;
        case "/ytdownloader":
          return <YtDownloaderView />;
        default:
          return <NotFoundView />;
      }
    }
  };
```

- [ ] **Step 2: Verify blog system**

Run `npm run dev` and check:
- `#/blog` shows timeline with the sample post
- Colored dot matches "dev" tag (#00ffaa)
- Click the post card → navigates to `#/blog/2026-04-10-terminal-ui`
- Article page renders markdown correctly with syntax-highlighted code
- Reading progress bar fills on scroll
- "← Back to ~/blog" link works
- Terminal `cd blog` works, `read 2026-04-10-terminal-ui` navigates to the post

- [ ] **Step 3: Commit**

```bash
git add src/pages/_app.tsx
git commit -m "feat: wire up Blog and BlogPost routes"
```

---

## Phase 3: osu! Stats

### Task 13: Create osu! stats hook

**Files:**
- Create: `src/lib/hooks/OsuStats.ts`

- [ ] **Step 1: Create OsuStats hook**

Create `src/lib/hooks/OsuStats.ts`:

```typescript
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

        // Uses your API server as a proxy for osu! API v2
        // If you haven't set up the proxy yet, this will fall back gracefully
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
            ss: (data.statistics?.grade_counts?.ss ?? 0) +
              (data.statistics?.grade_counts?.ssh ?? 0),
            ssh: data.statistics?.grade_counts?.ssh ?? 0,
            s: (data.statistics?.grade_counts?.s ?? 0) +
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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/hooks/OsuStats.ts
git commit -m "feat: add useOsuStats hook for osu! API data"
```

---

### Task 14: Create OsuStats view

**Files:**
- Create: `src/components/views/OsuStats/index.tsx`
- Create: `src/components/views/OsuStats/OsuStats.module.css`

- [ ] **Step 1: Create OsuStats.module.css**

Create `src/components/views/OsuStats/OsuStats.module.css`:

```css
div.osu-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 800px;
  padding: 3rem 2rem 2rem;
  margin: 0 auto;
  overflow-y: auto;
}

div.osu-page::-webkit-scrollbar {
  width: 0;
}

div.header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* Profile banner */
div.banner {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1.25rem;
  background: linear-gradient(135deg, #16213e, #1a1a3e);
  border-radius: 0.5rem;
}

img.osu-avatar {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 0.5rem;
  flex-shrink: 0;
}

div.banner-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

span.osu-username {
  font-size: 1.3rem;
  font-weight: bold;
  color: #fff;
}

span.osu-details {
  font-size: 0.75rem;
  color: #888;
}

div.rank-row {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

div.rank-item {
  display: flex;
  flex-direction: column;
}

span.rank-value {
  font-family: Consolas, monospace;
  font-size: 1.3rem;
  font-weight: bold;
  color: #fff;
}

span.rank-label {
  font-size: 0.65rem;
  color: #888;
}

/* Level progress bar */
div.level-bar {
  height: 3px;
  margin-top: 0.5rem;
  background-color: #0f3460;
  border-radius: 2px;
  overflow: hidden;
}

div.level-fill {
  height: 100%;
  background-color: #ff77b7;
  border-radius: 2px;
  transition: width 1s ease;
}

span.level-text {
  font-size: 0.65rem;
  color: #888;
}

/* Stats grid */
div.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
}

div.stat-card {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  align-items: center;
  padding: 1rem;
  background-color: #16213e;
  border-radius: 0.5rem;
}

span.stat-number {
  font-family: Consolas, monospace;
  font-size: 1.4rem;
  font-weight: bold;
  color: #fff;
}

span.stat-label {
  font-size: 0.7rem;
  color: #888;
}

/* Grade distribution */
div.grade-card {
  padding: 1rem;
  background-color: #16213e;
  border-radius: 0.5rem;
}

span.grade-title {
  font-size: 0.8rem;
  color: #888;
}

div.grade-bar {
  display: flex;
  gap: 2px;
  height: 1rem;
  margin-top: 0.5rem;
  border-radius: 0.25rem;
  overflow: hidden;
}

div.grade-bar > div {
  min-width: 2px;
  transition: flex 1s ease;
}

div.grade-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.35rem;
}

span.grade-label {
  font-family: Consolas, monospace;
  font-size: 0.7rem;
}

/* Unavailable state */
div.unavailable {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  min-height: 30vh;
  color: #888;
  font-size: 0.9rem;
}

@media (width <= 768px) {
  div.osu-page {
    padding: 3rem 1rem 2rem;
  }

  div.banner {
    flex-direction: column;
    text-align: center;
  }

  div.rank-row {
    justify-content: center;
  }

  div.stats-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Create OsuStats view component**

Create `src/components/views/OsuStats/index.tsx`:

```tsx
import React from "react";

import { AddConsoleLog } from "@/redux";

import useCommandHandler from "@/lib/hooks/CommandHandler";
import useOsuStats from "@/lib/hooks/OsuStats";

import styles from "./OsuStats.module.css";

function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  return `${hours}h`;
}

function formatNumber(n: number | null): string {
  if (n === null) return "--";
  return n.toLocaleString();
}

export default function OsuStatsView() {
  const { user, loading, error } = useOsuStats();

  useCommandHandler({
    stats: () => {
      if (!user) {
        AddConsoleLog("osu! stats not available.");
        return;
      }
      AddConsoleLog(
        `@#ff77b7osu! Stats for ${user.username}@#`,
        `Global Rank: @#fff700#${formatNumber(user.globalRank)}@#`,
        `Country Rank: @#00ffaa#${formatNumber(user.countryRank)}@#`,
        `PP: @#ffa24c${formatNumber(user.pp)}@#`,
        `Accuracy: @#fff${user.accuracy.toFixed(2)}%@#`,
        `Play Count: ${formatNumber(user.playCount)}`,
        `Play Time: ${formatPlayTime(user.playTime)}`,
      );
    },
  });

  if (loading) {
    return (
      <div className={styles["osu-page"]}>
        <div className={styles["header"]}>
          <p className="page-header" style={{ color: "#ff77b7" }}>
            ~/osu
          </p>
        </div>
        <p style={{ color: "#888" }}>Loading stats...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={styles["osu-page"]}>
        <div className={styles["header"]}>
          <p className="page-header" style={{ color: "#ff77b7" }}>
            ~/osu
          </p>
        </div>
        <div className={styles["unavailable"]}>
          <p>Stats temporarily unavailable.</p>
          <p style={{ fontSize: "0.75rem" }}>
            osu! API proxy not configured yet.
          </p>
        </div>
      </div>
    );
  }

  const totalGrades =
    user.gradeCounts.ss + user.gradeCounts.s + user.gradeCounts.a;

  return (
    <div className={styles["osu-page"]}>
      <div className={styles["header"]}>
        <p className="page-header" style={{ color: "#ff77b7" }}>
          ~/osu
        </p>
      </div>

      {/* Profile banner */}
      <div className={styles["banner"]}>
        <img
          className={styles["osu-avatar"]}
          src={user.avatarUrl}
          alt={user.username}
        />
        <div className={styles["banner-info"]}>
          <span className={styles["osu-username"]}>{user.username}</span>
          <span className={styles["osu-details"]}>
            {user.countryCode} &bull; Joined{" "}
            {new Date(user.joinDate).getFullYear()}
          </span>
          <div className={styles["rank-row"]}>
            <div className={styles["rank-item"]}>
              <span
                className={styles["rank-value"]}
                style={{ color: "#fff700" }}
              >
                #{formatNumber(user.globalRank)}
              </span>
              <span className={styles["rank-label"]}>Global Rank</span>
            </div>
            <div className={styles["rank-item"]}>
              <span
                className={styles["rank-value"]}
                style={{ color: "#00ffaa" }}
              >
                #{formatNumber(user.countryRank)}
              </span>
              <span className={styles["rank-label"]}>Country</span>
            </div>
            <div className={styles["rank-item"]}>
              <span
                className={styles["rank-value"]}
                style={{ color: "#ffa24c" }}
              >
                {formatNumber(user.pp)}pp
              </span>
              <span className={styles["rank-label"]}>Performance</span>
            </div>
          </div>
          <div>
            <span className={styles["level-text"]}>
              Lv.{user.level} ({user.levelProgress}%)
            </span>
            <div className={styles["level-bar"]}>
              <div
                className={styles["level-fill"]}
                style={{ width: `${user.levelProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className={styles["stats-grid"]}>
        <div className={styles["stat-card"]}>
          <span className={styles["stat-number"]}>
            {user.accuracy.toFixed(1)}%
          </span>
          <span className={styles["stat-label"]}>Accuracy</span>
        </div>
        <div className={styles["stat-card"]}>
          <span className={styles["stat-number"]}>
            {formatNumber(user.playCount)}
          </span>
          <span className={styles["stat-label"]}>Play Count</span>
        </div>
        <div className={styles["stat-card"]}>
          <span className={styles["stat-number"]}>
            {formatPlayTime(user.playTime)}
          </span>
          <span className={styles["stat-label"]}>Play Time</span>
        </div>
      </div>

      {/* Grade distribution */}
      <div className={styles["grade-card"]}>
        <span className={styles["grade-title"]}>Grade Distribution</span>
        <div className={styles["grade-bar"]}>
          <div
            style={{
              flex: user.gradeCounts.ss || 1,
              backgroundColor: "#fff700",
            }}
          />
          <div
            style={{
              flex: user.gradeCounts.s || 1,
              backgroundColor: "#ffa24c",
            }}
          />
          <div
            style={{
              flex: user.gradeCounts.a || 1,
              backgroundColor: "#00ffaa",
            }}
          />
        </div>
        <div className={styles["grade-labels"]}>
          <span className={styles["grade-label"]} style={{ color: "#fff700" }}>
            SS: {user.gradeCounts.ss}
          </span>
          <span className={styles["grade-label"]} style={{ color: "#ffa24c" }}>
            S: {user.gradeCounts.s}
          </span>
          <span className={styles["grade-label"]} style={{ color: "#00ffaa" }}>
            A: {user.gradeCounts.a}
          </span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/views/OsuStats/index.tsx src/components/views/OsuStats/OsuStats.module.css
git commit -m "feat: add osu! Stats dashboard view with profile banner and grade distribution"
```

---

### Task 15: Wire up osu! route and update homepage previews

**Files:**
- Modify: `src/pages/_app.tsx`
- Modify: `src/components/views/Home/index.tsx`

- [ ] **Step 1: Add osu! route in _app.tsx**

In `src/pages/_app.tsx`, add the import:

```typescript
import OsuStatsView from "@/components/views/OsuStats";
```

Add to the switch statement (before `default`):

```typescript
        case "/osu":
          return <OsuStatsView />;
```

- [ ] **Step 2: Connect live data to homepage previews**

In `src/components/views/Home/index.tsx`, add imports at the top:

```typescript
import useOsuStats from "@/lib/hooks/OsuStats";
import { useBlogPosts } from "@/lib/hooks/BlogPosts";
```

Add hooks inside the component:

```typescript
  const { user: osuUser } = useOsuStats();
  const { posts: blogPosts } = useBlogPosts();
  const latestPost = blogPosts[0] ?? null;
```

Replace the osu! stats preview card's stat-row content to use live data:

```tsx
            <div className={styles["stat-row"]}>
              <div className={styles["stat-item"]}>
                <span className={styles["stat-value"]}>
                  {osuUser ? `#${osuUser.globalRank?.toLocaleString() ?? "--"}` : "--"}
                </span>
                <span className={styles["stat-label"]}>Global Rank</span>
              </div>
              <div className={styles["stat-item"]}>
                <span className={styles["stat-value"]}>
                  {osuUser ? `${osuUser.pp.toLocaleString()}` : "--"}
                </span>
                <span className={styles["stat-label"]}>PP</span>
              </div>
              <div className={styles["stat-item"]}>
                <span className={styles["stat-value"]}>
                  {osuUser ? `${osuUser.accuracy.toFixed(1)}%` : "--"}
                </span>
                <span className={styles["stat-label"]}>Accuracy</span>
              </div>
            </div>
```

Replace the blog preview card content to use live data:

```tsx
          <div
            className={styles["preview-card"]}
            style={{ cursor: "pointer" }}
            onClick={() =>
              (window.location.hash = latestPost
                ? `#/blog/${latestPost.slug}`
                : "#/blog")
            }
          >
            <div className={styles["preview-header"]}>
              <span className="section-label" style={{ color: "#ffa24c" }}>
                LATEST POST
              </span>
              <a
                className="view-all-link"
                href="#/blog"
                onClick={(e) => e.stopPropagation()}
              >
                All Posts <span>&rarr;</span>
              </a>
            </div>
            {latestPost ? (
              <>
                <span className={styles["post-date"]}>{latestPost.date}</span>
                <span className={styles["post-title"]}>{latestPost.title}</span>
                <p className={styles["post-excerpt"]}>{latestPost.excerpt}</p>
              </>
            ) : (
              <>
                <span className={styles["post-title"]}>Coming soon...</span>
                <p className={styles["post-excerpt"]}>
                  Stay tuned for the first blog post.
                </p>
              </>
            )}
          </div>
```

- [ ] **Step 3: Final verification**

Run `npm run dev` and thoroughly test:
- Homepage: all 4 bento cards render, projects show real repos, blog shows latest post, osu! shows data (or graceful fallback)
- `#/projects`: grid loads, cards clickable, `open` command works
- `#/blog`: timeline renders with sample post, `read` command works
- `#/blog/2026-04-10-terminal-ui`: article renders, progress bar works, back link works
- `#/osu`: shows stats or "unavailable" message gracefully
- Navigation breadcrumb works on all pages
- Terminal `cd` works for all new paths: `cd projects`, `cd osu`, `cd blog`, `cd /`
- `ls` from root shows all new paths
- Responsive: check at narrow viewport

- [ ] **Step 4: Commit**

```bash
git add src/pages/_app.tsx src/components/views/Home/index.tsx
git commit -m "feat: wire up osu! route and connect live data to homepage previews"
```

---

### Task 16: Final cleanup — run lint and format

- [ ] **Step 1: Run formatter and linter**

```bash
npm run format
npm run format:css
npm run lint
```

Fix any issues reported.

- [ ] **Step 2: Run build to verify no errors**

```bash
npm run build
```

Ensure the build succeeds with no errors.

- [ ] **Step 3: Commit any formatting fixes**

```bash
git add -A
git commit -m "style: apply formatting and fix lint issues"
```
