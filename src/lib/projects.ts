export type ProjectConfig = {
  slug: string;
  name: string;
  description: string;
  github: { owner: string; repo: string };
  images: string[];
  tags: string[];
  accent: string;
};

export const FEATURED_PROJECTS: ProjectConfig[] = [
  {
    slug: "josh-playground",
    name: "Josh-Playground",
    description:
      "My personal website built with Next.js — featuring a draggable terminal, bento-style homepage, blog, and osu! stats dashboard.",
    github: { owner: "JoshHuang9508", repo: "Josh-Playground" },
    images: ["/assets/bg.jpg"],
    tags: ["TypeScript", "Next.js", "React"],
    accent: "#00ffaa",
  },
  {
    slug: "raidcall-clone",
    name: "Raidcall Clone",
    description:
      "RC語音復刻版本 — a clone of the classic Raidcall voice chat application, rebuilt with modern web technologies.",
    github: { owner: "JoshHuang9508", repo: "Raidcall-Clone" },
    images: ["/assets/bg.jpg"],
    tags: ["Full-Stack", "Voice Chat"],
    accent: "#ff77b7",
  },
  {
    slug: "depth-of-origin",
    name: "Depth of Origin 2.0",
    description:
      "源深 — a 2D game built with Unity. Currently in beta 2.0 development.",
    github: { owner: "JoshHuang9508", repo: "Depth-of-Origin-2.0" },
    images: ["/assets/bg.jpg"],
    tags: ["C#", "Unity", "Game Dev"],
    accent: "#ffa24c",
  },
  {
    slug: "electron-audio-loopback",
    name: "Electron Audio Loopback",
    description:
      "Capture system loopback audio on macOS 12.3+, Windows and Linux — an Electron-based audio routing tool.",
    github: { owner: "JoshHuang9508", repo: "electron-audio-loopback" },
    images: ["/assets/bg.jpg"],
    tags: ["TypeScript", "Electron", "Audio"],
    accent: "#00f3ff",
  },
];
