import React, { useEffect, useRef } from "react";

import { AddConsoleLog } from "@/redux";

import { MUSIC_LIST, TEXT_CONTENT } from "@/lib/constants";

import { t } from "@/lib/i18n";

import useCommandHandler from "@/lib/hooks/CommandHandler";
import useGitHubRepos from "@/lib/hooks/GitHubRepos";

import ColorSpan from "@/components/ColorSpan";
import GitHubRepoCard from "@/components/GitHubRepoCard";

import styles from "./Mobile.module.css";

export default function MobileView() {
  const { repos } = useGitHubRepos("JoshHuang9508");

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

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [musicIndex, setMusicIndex] = React.useState(0);
  const [showMusicInfo, setShowMusicInfo] = React.useState(false);
  const [currentSocialIndex, setCurrentSocialIndex] = React.useState(0);

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

  const handleMusicEnd = () => {
    if (!audioPlayerRef.current) return;
    setMusicIndex((musicIndex + 1) % MUSIC_LIST.length);
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
        if (showMusicInfo) {
          stopSpin();
        }
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSocialIndex(
        (prev) => (prev + 1) % TEXT_CONTENT["/"].social.length,
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
        src={MUSIC_LIST[musicIndex].path}
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
              str={t("commands.music.nowPlaying", MUSIC_LIST[musicIndex].name)}
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
            {TEXT_CONTENT["/"].about.map((content, index) => {
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
                src={`/assets/${TEXT_CONTENT["/"].social[currentSocialIndex].icon}.png`}
                alt={TEXT_CONTENT["/"].social[currentSocialIndex].icon}
              />
              <ColorSpan
                str={TEXT_CONTENT["/"].social[currentSocialIndex].value}
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
