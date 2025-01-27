// Import packages
import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
// Import styles
import styles from "../../public/styles/index.module.css";
// Import redux
import store, { AddConsoleLog } from "../redux/store";
import { setCommand } from "../redux/commandSlice";
// Import components
import ColorSpan from "../components/ColorSpan";
// Import json
import textContent from "../../src/lib/textContent.json";

import profileImage from "../../public/assets/pfp.png";

export default function Page() {
  // Music control
  const audioPlayer = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!audioPlayer.current) return;
    audioPlayer.current.play();
    audioPlayer.current.volume = 0.05;
    return () => {
      if (!audioPlayer.current) return;
      audioPlayer.current.pause();
    };
  }, [audioPlayer]);

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
      default:
        AddConsoleLog([`Command not found: @#fff700${command}`]);
        break;
    }
    store.dispatch(setCommand(""));
  }, [command]);

  return (
    <div className={"content-div"}>
      <audio
        ref={audioPlayer}
        id="audio"
        src="/musics/eyes-half-closed.mp3"
        loop
      />
      <div className={"container1"}>
        <div
          className="sub-container2"
          style={{ fontFamily: "monospace", gap: "1rem" }}
        >
          <img
            className={styles["profile-picture"]}
            src={profileImage.src}
            alt="Profile Picture"
          />
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
