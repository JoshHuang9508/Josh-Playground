import React, { useEffect, useRef, useState } from "react";

import { AddConsoleLog } from "@/redux";

import ColorSpan from "@/components/ColorSpan";

import { MUSIC_LIST } from "@/lib/constants";
import { t } from "@/lib/i18n";
import useCommandHandler from "@/lib/hooks/CommandHandler";
import useOsuStats from "@/lib/hooks/OsuStats";
import { useBlogPosts } from "@/lib/hooks/BlogPosts";
import { FEATURED_PROJECTS } from "@/lib/projects";

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
  const imageRef = useRef<HTMLImageElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [musicIndex, setMusicIndex] = useState(0);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);

  const { user: osuUser } = useOsuStats();
  const { posts: blogPosts } = useBlogPosts();
  const latestPost = blogPosts[0] ?? null;

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
  }, [isPlaying]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveProjectIndex((prev) => (prev + 1) % FEATURED_PROJECTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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

      <div className={styles["feature-section"]}>
        <span className="section-label" style={{ color: "#fff700" }}>
          ABOUT ME
        </span>
        <div className={styles["bento"]}>
          {/* Left column */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {/* Hero card */}
            <div className={styles["hero-card"]}>
              <img
                ref={imageRef}
                className={`${styles["avatar"]} ${false ? styles["spin"] : ""}`}
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

            {/* Latest post preview */}
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
                  <span className={styles["post-title"]}>
                    {latestPost.title}
                  </span>
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
          </div>

          {/* Right column */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {/* Projects preview */}
            <div
              className={styles["preview-card"]}
              style={{ cursor: "pointer" }}
              onClick={() => (window.location.hash = `#/projects`)}
            >
              <div className={styles["preview-header"]}>
                <span className="section-label" style={{ color: "#00ffaa" }}>
                  PROJECTS
                </span>
                <a className="view-all-link" href="#/projects">
                  View All <span>&rarr;</span>
                </a>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div
                  key={FEATURED_PROJECTS[activeProjectIndex].slug}
                  className={styles["mini-project"]}
                >
                  <div
                    className={styles["mini-project-img"]}
                    style={{
                      borderColor: FEATURED_PROJECTS[activeProjectIndex].accent,
                    }}
                  >
                    {FEATURED_PROJECTS[activeProjectIndex].images[0] ? (
                      <img
                        src={FEATURED_PROJECTS[activeProjectIndex].images[0]}
                        alt={FEATURED_PROJECTS[activeProjectIndex].name}
                      />
                    ) : (
                      <span style={{ color: "#555", fontSize: "0.8rem" }}>
                        No image
                      </span>
                    )}
                  </div>
                  <div className={styles["mini-project-info"]}>
                    <span className={styles["mini-repo-name"]}>
                      {FEATURED_PROJECTS[activeProjectIndex].name}
                    </span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "#888",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {FEATURED_PROJECTS[activeProjectIndex].tags.join(" · ")}
                    </span>
                  </div>
                </div>
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
                  <span className={styles["stat-value"]}>
                    {osuUser
                      ? `#${osuUser.globalRank?.toLocaleString() ?? "--"}`
                      : "--"}
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
            </div>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* Feature showcase & console tutorial */}
      <div className={styles["feature-section"]}>
        <span className="section-label" style={{ color: "#fff700" }}>
          ABOUT THIS SITE
        </span>
        <div className={styles["feature-card"]}>
          <p className={styles["feature-title"]}>
            <span style={{ color: "#00ffaa" }}>&gt;_</span> Built-in Terminal
          </p>
          <p className={styles["feature-desc"]}>
            This site comes with a draggable, resizable console — a real
            terminal you can use to navigate pages, open links, and explore
            hidden commands. Try it out!
          </p>
          <div className={styles["shortcut-list"]}>
            <span className={styles["shortcut"]}>
              <span className={styles["shortcut-key"]}>Ctrl</span>+
              <span className={styles["shortcut-key"]}>`</span> Toggle console
            </span>
            <span className={styles["shortcut"]}>
              <span className={styles["shortcut-key"]}>Esc</span> Minimize
            </span>
            <span className={styles["shortcut"]}>
              <span className={styles["shortcut-key"]}>Tab</span> Autocomplete
            </span>
          </div>
        </div>
        <div className={styles["feature-card"]}>
          <p className={styles["feature-title"]}>
            <span style={{ color: "#ffa24c" }}>$</span> Quick Commands
          </p>
          <p className={styles["feature-desc"]}>
            Type{" "}
            <span
              style={{ color: "#fff700", fontFamily: "Consolas, monospace" }}
            >
              help
            </span>{" "}
            to see all available commands. Use{" "}
            <span
              style={{ color: "#fff700", fontFamily: "Consolas, monospace" }}
            >
              cd
            </span>{" "}
            to navigate between pages, or{" "}
            <span
              style={{ color: "#fff700", fontFamily: "Consolas, monospace" }}
            >
              github
            </span>
            ,{" "}
            <span
              style={{ color: "#fff700", fontFamily: "Consolas, monospace" }}
            >
              osu
            </span>
            ,{" "}
            <span
              style={{ color: "#fff700", fontFamily: "Consolas, monospace" }}
            >
              music -i
            </span>{" "}
            to interact directly.
          </p>
        </div>
      </div>

      <hr className="divider" />
      <p className={styles["footer"]}>built with next.js + too much coffee</p>
    </div>
  );
}
