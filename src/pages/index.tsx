import React, { useEffect, useRef } from "react";

import styles from "@/styles/index.module.css";

import { AddConsoleLog } from "@/redux";

import { Music } from "@/lib/types";

import ColorSpan from "@/components/ColorSpan";

import useCommandHandler from "@/hooks/useCommandHandler";

import textContent from "@/lib/text-content.json";

const musics: Music[] = [
  {
    name: "Crywolf - Eyes Half Closed",
    path: "/musics/eyes-half-closed.mp3",
  },
  {
    name: "BlueArchive - The Promise at Sunset",
    path: "/musics/the-promise-at-sunset.mp3",
  },
];

export default function Page() {
  // Refs
  const scrollSpeedRef = useRef<number[]>(
    Array.from({ length: 3 }, () => Math.floor(Math.random() * 5) + 1),
  );
  const imageRef = useRef<HTMLImageElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  // States
  const [musicIndex, setMusicIndex] = React.useState(0);
  const [showMusicInfo, setShowMusicInfo] = React.useState(false);

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
    setMusicIndex((musicIndex + 1) % musics.length);
  };

  // Command handler
  useCommandHandler({
    github: () => {
      window.open("https://github.com/JoshHuang9508", "_blank");
      AddConsoleLog(["Opening my @#FFF700GitHub@# page..."]);
    },
    youtube: () => {
      window.open("https://www.youtube.com/@whydog5555", "_blank");
      AddConsoleLog(["Opening my @#FFF700YouTube@# channel..."]);
    },
    music: (_cmd, _args, flags) => {
      if (flags.includes("-l") || flags.includes("--list")) {
        AddConsoleLog([
          "Music list:",
          ...musics.map((_, index) => `${index + 1} - ${_.name}`),
        ]);
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
      AddConsoleLog([`Usage: music [option]`]);
    },
  });

  // Effects
  useEffect(() => {
    const onInteraction = () => {
      if (!audioPlayerRef.current) return;
      audioPlayerRef.current.play();
      audioPlayerRef.current.volume = 0.05;
    };
    document.addEventListener("click", onInteraction);
    document.addEventListener("touchstart", onInteraction);
    return () => {
      document.removeEventListener("click", onInteraction);
      document.removeEventListener("touchstart", onInteraction);
    };
  }, [showMusicInfo]);

  useEffect(() => {
    if (!audioPlayerRef.current) return;
    audioPlayerRef.current.play();
    audioPlayerRef.current.volume = 0.05;
  }, [audioPlayerRef]);

  useEffect(() => {
    if (!audioPlayerRef.current) return;
    audioPlayerRef.current.src = musics[musicIndex].path;
    audioPlayerRef.current.play();
  }, [musicIndex]);

  return (
    <div className={"col content-div"}>
      <audio
        ref={audioPlayerRef}
        id="audio"
        src={musics[musicIndex].path}
        onEnded={handleMusicEnd}
      />
      <div className={"container1"}>
        <div
          className="sub-container2"
          style={{ fontFamily: "monospace", gap: "1rem" }}
        >
          <img
            ref={imageRef}
            className={`${styles["profile-picture"]} ${showMusicInfo ? styles["spin"] : ""
              }`}
            src={"/assets/pfp.png"}
            alt="Profile Picture"
          />
          <div
            className={`${styles["music-info"]} ${showMusicInfo ? styles["show"] : styles["hidden"]
              }`}
          >
            <ColorSpan
              str={`Now playing: @#FFF700${musics[musicIndex].name}@#...`}
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
          </div>
        </div>
      </div>

      <div className={styles["project-list"]}>
        {Array.from({ length: 3 }).map((_, index) => {
          return (
            <div
              key={index}
              className={`${styles["column"]} ${styles[`scroll-speed-${scrollSpeedRef.current[index]}`]
                }`}
            >
              {Array.from({ length: 2 }).map((_, index) => {
                return (
                  <div key={index}>
                    {textContent["/"].projects.map((project, index) => {
                      return (
                        <div key={index} className={styles["project"]}>
                          <div className={styles["project-title"]}>
                            <ColorSpan str={project.name} className="header2" />
                          </div>
                          <div className={styles["project-description"]}>
                            <ColorSpan
                              str={project.description}
                              className="p3"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
