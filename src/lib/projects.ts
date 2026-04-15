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
    slug: "ricecall",
    name: "RiceCall",
    description:
      "RiceCall, an un-official remake of Raidcall. \nCurrently in beta testing. \nDownload the latest version from https://ricecall.com/.",
    github: { owner: "NerdyHomeReOpen", repo: "RiceCall" },
    images: [
      "/projects/ricecall_screenshot_1.png",
      "/projects/ricecall_screenshot_2.png",
      "/projects/ricecall_screenshot_3.png",
      "/projects/ricecall_screenshot_4.png",
    ],
    tags: ["TypeScript", "Full-Stack", "Voice Chat", "WebRTC", "Electron"],
    accent: "#ff77b7",
  },
  {
    slug: "depth-of-origin",
    name: "Depth of Origin 2.0",
    description:
      "源深 — a 2D roguelike game built with Unity. \nI will be working on the 2.0 version, which is a complete rewrite of the game, only if I have time (lol).",
    github: { owner: "JoshHuang9508", repo: "Depth-of-Origin-2.0" },
    images: [
      "/projects/depth-of-origin_screenshot_1.png",
      "/projects/depth-of-origin_screenshot_2.png",
      "/projects/depth-of-origin_screenshot_3.png",
      "/projects/depth-of-origin_screenshot_4.png",
    ],
    tags: ["C#", "Unity", "Game Dev", "Roguelike", "School Project"],
    accent: "#ffa24c",
  },
  {
    slug: "josh-playground",
    name: "Josh-Playground",
    description:
      "My personal website built with Next.js — which you are currently on!",
    github: { owner: "JoshHuang9508", repo: "Josh-Playground" },
    images: [
      "/projects/josh-playground_screenshot_1.png",
      "/projects/josh-playground_screenshot_2.png",
      "/projects/josh-playground_screenshot_3.png",
    ],
    tags: ["TypeScript", "Next.js", "React", "Vibe Coding"],
    accent: "#00ffaa",
  },
];
