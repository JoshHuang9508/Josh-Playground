import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

// Styles
import styles from "@/styles/index.module.css";

// Redux
import store, { AddConsoleLog } from "@/redux";
import { setCommand } from "@/redux/commandSlice";

// Types
import { Music } from "@/lib/types";

// Components
import ColorSpan from "@/components/ColorSpan";

// JSON
import textContent from "@/lib/textContent.json";

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
  const command = useSelector((state: { command: string }) => state.command);

  // Refs
  const scrollSpeedRef = useRef<number[]>(
    Array.from({ length: 3 }, () => Math.floor(Math.random() * 5) + 1)
  );
  const imageRef = useRef<HTMLImageElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  // States
  const [musicIndex, setMusicIndex] = React.useState(0);
  const [showMusicInfo, setShowMusicInfo] = React.useState(false);

  // Handlers
  const onMusicEnd = () => {
    if (!audioPlayerRef.current) return;
    setMusicIndex((musicIndex + 1) % musics.length);
  };

  const stopSpin = () => {
    if (!imageRef.current) return;

    const styles = window.getComputedStyle(imageRef.current);
    const matrix = new DOMMatrixReadOnly(styles.transform);
    let currentRotation =
      Math.atan2(matrix.m21, matrix.m11) * (180 / Math.PI) * -1;
    // @ts-ignore
    imageRef.current.style.setProperty(
      "--current-rotation",
      `${currentRotation}deg`
    );
  };

  // Effects
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

  useEffect(() => {
    if (!command || command == "") return;
    const flags =
      command
        .split(" ")
        .slice(1)
        .filter((_) => _.startsWith("-")) ?? "";
    switch (command.split(" ")[0]) {
      case "log":
        // Use for debugging
        break;
      case "github":
        window.open("https://github.com/JoshHuang9508", "_blank");
        AddConsoleLog(["Opening my @#FFF700GitHub@# page..."]);
      case "youtube":
        window.open("https://www.youtube.com/@whydog5555", "_blank");
        AddConsoleLog(["Opening my @#FFF700YouTube@# channel..."]);
      case "music":
        if (flags.includes("-l") || flags.includes("--list")) {
          AddConsoleLog([
            "Music list:",
            ...musics.map((_, index) => `${index + 1} - ${_.name}`),
          ]);
          break;
        }
        if (flags.includes("-p") || flags.includes("--play")) {
          if (audioPlayerRef.current) audioPlayerRef.current.play();
          break;
        }
        if (flags.includes("-s") || flags.includes("--stop")) {
          if (audioPlayerRef.current) audioPlayerRef.current.pause();
          break;
        }
        if (flags.includes("-i") || flags.includes("--info")) {
          setShowMusicInfo(!showMusicInfo);
          if (showMusicInfo) {
            stopSpin();
          }
          break;
        }
        AddConsoleLog([`Usage: music [option]`]);
        break;
      default:
        AddConsoleLog([`Command not found: @#fff700${command}`]);
        break;
    }
    store.dispatch(setCommand(""));
  }, [command]);

  return (
    <div className={"col content-div"}>
      <audio
        ref={audioPlayerRef}
        id="audio"
        src={musics[musicIndex].path}
        onEnded={onMusicEnd}
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

      <div className={styles["projectList"]}>
        {Array.from({ length: 3 }).map((_, index) => {
          return (
            <div
              key={index}
              className={`${styles["column"]} ${
                styles[`scroll-speed-${scrollSpeedRef.current[index]}`]
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
