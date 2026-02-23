import React, { useEffect, useRef } from "react";

import styles from "@/styles/index.module.css";

import { AddConsoleLog } from "@/redux";

import ColorSpan from "@/components/ColorSpan";
import GitHubRepoCard from "@/components/GitHubRepoCard";

import useCommandHandler from "@/hooks/useCommandHandler";
import useGitHubRepos from "@/hooks/useGitHubRepos";

import textContent from "@/lib/text-content.json";
import musicList from "@/lib/music-list.json";
import { t } from "@/lib/i18n";

export default function MobileView() {
  // Hooks
  const { repos } = useGitHubRepos("JoshHuang9508");

  // Refs
  const scrollSpeedRef = useRef<number[]>(
    Array.from({ length: 3 }).reduce<number[]>((acc, _) => {
      const getRandomSpeed = () => {
        const speed = Math.floor(Math.random() * 5) + 1;
        if (acc.includes(speed)) {
          return getRandomSpeed();
        }
        return speed;
      };
      return acc.concat(getRandomSpeed());
    }, []),
  );
  const imageRef = useRef<HTMLImageElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  // States
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [musicIndex, setMusicIndex] = React.useState(0);
  const [showMusicInfo, setShowMusicInfo] = React.useState(false);
  const [currentSocialIndex, setCurrentSocialIndex] = React.useState(0);

  // Functions
  const stopSpin = () => {
    if (!imageRef.current) return;

    const styles = window.getComputedStyle(imageRef.current);
    const matrix = new DOMMatrixReadOnly(styles.transform);
    let currentRotation =
      Math.atan2(matrix.m21, matrix.m11) * (180 / Math.PI) * -1;

    imageRef.current.style.setProperty(
      "--current-rotation",
      `${currentRotation}deg`,
    );
  };

  // Handlers
  const handleMusicEnd = () => {
    if (!audioPlayerRef.current) return;
    setMusicIndex((musicIndex + 1) % musicList.length);
  };

  // Command handler
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
          ...musicList.map((_, index) => `#${index} - ${_.name}`),
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
        if (showMusicInfo) {
          stopSpin();
        }
        return;
      }
      AddConsoleLog(t("commands.music.usage"));
    },
  });

  // Effects
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
    audioPlayerRef.current.src = musicList[musicIndex].path;
    audioPlayerRef.current.play();
    audioPlayerRef.current.volume = 0.05;
  }, [musicIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSocialIndex(
        (prev) => (prev + 1) % textContent["/"].social.length,
      );
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={"col content-div"}>
      <audio
        ref={audioPlayerRef}
        id="audio"
        src={musicList[musicIndex].path}
        onEnded={handleMusicEnd}
      />
      <div className={"container1"}>
        <div
          className="sub-container2"
          style={{ fontFamily: "monospace", gap: "1rem" }}
        >
          <img
            ref={imageRef}
            className={`${styles["profile-picture"]} ${
              showMusicInfo ? styles["spin"] : ""
            }`}
            src={"/assets/pfp.png"}
            alt="Profile Picture"
          />
          <div
            className={`${styles["music-info"]} ${
              showMusicInfo ? styles["show"] : styles["hidden"]
            }`}
          >
            <ColorSpan
              str={t("commands.music.nowPlaying", musicList[musicIndex].name)}
              className="p1"
              style={{ whiteSpace: "pre" }}
            />
          </div>
          <div
            className="col"
            style={{
              gap: "0.5rem",
              justifyContent: "center",
            }}
          >
            {textContent["/"].about.map((content, index) => {
              if (index == 0)
                return (
                  <div key={index}>
                    <ColorSpan str={content} className="header2" />
                  </div>
                );
              return (
                <div key={index}>
                  <ColorSpan str={content} className="p1" />
                </div>
              );
            })}
            <div
              className={styles["social-container"]}
              key={currentSocialIndex}
            >
              <img
                className={styles["social-icon"]}
                src={`/assets/${textContent["/"].social[currentSocialIndex].icon}.png`}
                alt={textContent["/"].social[currentSocialIndex].icon}
              />
              <ColorSpan
                str={textContent["/"].social[currentSocialIndex].value}
                className="p1"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles["repo-wall"]}>
        {Array.from({ length: 3 }).map((_, colIndex) => (
          <div
            key={colIndex}
            className={`${styles["column"]} ${
              styles[`scroll-speed-${scrollSpeedRef.current[colIndex]}`]
            }`}
          >
            {Array.from({ length: 4 }).map((_, dupIndex) => (
              <div key={dupIndex}>
                {repos.map((repo, repoIndex) => (
                  <GitHubRepoCard
                    key={`${dupIndex}-${repoIndex}`}
                    repo={repo}
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
