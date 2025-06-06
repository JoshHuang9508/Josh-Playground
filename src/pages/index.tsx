// Import packages
import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
// Import styles
import styles from "../../public/styles/index.module.css";
// Import redux
import store, { AddConsoleLog } from "../redux/store";
import { setCommand } from "../redux/commandSlice";
// Import types
import { Music } from "../lib/types";
// Import components
import ColorSpan from "../components/ColorSpan";
// Import json
import textContent from "../../src/lib/textContent.json";

import profileImage from "../../public/assets/pfp.png";

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
  // Music control
  const [musicIndex, setMusicIndex] = React.useState(0);
  const [showMusicInfo, setShowMusicInfo] = React.useState(false);
  const audioPlayer = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!audioPlayer.current) return;
    audioPlayer.current.play();
    audioPlayer.current.volume = 0.05;
  }, [audioPlayer]);

  useEffect(() => {
    if (!audioPlayer.current) return;
    audioPlayer.current.src = musics[musicIndex].path;
    audioPlayer.current.play();
  }, [musicIndex]);

  const onMusicEnd = () => {
    if (!audioPlayer.current) return;
    setMusicIndex((musicIndex + 1) % musics.length);
  };

  // Command control
  const command = useSelector((state: { command: string }) => state.command);

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
          if (audioPlayer.current) audioPlayer.current.play();
          break;
        }
        if (flags.includes("-s") || flags.includes("--stop")) {
          if (audioPlayer.current) audioPlayer.current.pause();
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

  // Image control
  const image = useRef(null);

  const stopSpin = () => {
    if (!image.current) return;

    const styles = window.getComputedStyle(image.current);
    const matrix = new DOMMatrixReadOnly(styles.transform);
    let currentRotation =
      Math.atan2(matrix.m21, matrix.m11) * (180 / Math.PI) * -1;
    // @ts-ignore
    image.current.style.setProperty(
      "--current-rotation",
      `${currentRotation}deg`
    );
  };

  return (
    <div className={"content-div"}>
      <audio
        ref={audioPlayer}
        id="audio"
        src={musics[musicIndex].path}
        onEnded={() => {
          onMusicEnd();
        }}
      />
      <div className={"container1"}>
        <div
          className="sub-container2"
          style={{ fontFamily: "monospace", gap: "1rem" }}
        >
          <img
            ref={image}
            className={`${styles["profile-picture"]} ${
              showMusicInfo ? styles["spin"] : ""
            }`}
            src={profileImage.src}
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
    </div>
  );
}
