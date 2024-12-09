// Import packages
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import dynamic from "next/dynamic";
// Import styles
import styles from "../../../public/styles/index.module.css";
// Import redux
import store from "../../redux/store";
import {
  addConsoleContent,
  setConsoleContent,
} from "../../redux/consoleContentSlice";
import { setCommand } from "../../redux/commandSlice";
import ReactPlayer from "react-player";

export default function Page() {
  // Command control
  const command = useSelector((state: { command: string }) => state.command);

  useEffect(() => {
    if (!command || command == "") return;
    switch (command.split(" ")[0]) {
      case "cl":
        store.dispatch(setConsoleContent([]));
        break;
      case "cd":
        const page = command.split(" ")[1] ?? "";
        const link = window.location.href.split("/");
        if (!page) {
          window.location.href = "/";
          break;
        } else {
          page.split("/").forEach((element) => {
            if (element == "..") {
              link.pop();
            } else if (element != "") {
              link.push(element);
            }
          });
          window.location.href = link.join("/");
        }
        break;
      case "help":
        store.dispatch(
          addConsoleContent([
            "Available commands:",
            "",
            "help <command> - Show help message, type command to get more info",
            "cd <page> - Redirect to page",
            "cl - Clear console",
          ])
        );
        break;
      case "log":
        // Use for debugging
        break;
      case "play":
        const videoID = command.split(" ")[1] ?? "";
        if (!videoID) {
          store.dispatch(addConsoleContent(["Please provide a video ID"]));
          break;
        }
        setVedioURL(`https://www.youtube.com/watch?v=${videoID}`);
        // player.current?.seekTo(0, "seconds");
        // player.current?.getCurrentTime();
        store.dispatch(addConsoleContent([`Playing video ${videoID}`]));
        break;
      default:
        store.dispatch(
          addConsoleContent([`"${command}" is not a valid command`])
        );
        break;
    }
    store.dispatch(setCommand(""));
  }, [command]);

  // Video player control
  const player = useRef<ReactPlayer>(null);
  const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });
  // const videoURL = useSelector((state: { videoURL: string }) => state.videoURL);
  const [vedioURL, setVedioURL] = useState("");

  return (
    <div className={styles["layout"]}>
      <p className={styles["title"]}>YT音樂同步撥放器</p>
      <p className={styles["subtitle"]}>
        一個可以同步撥放音樂的網站，讓你和朋友一起聽音樂
      </p>
      <div className={styles["info-div"]}>
        <div className={styles["container"]} style={{ width: "30%" }}>
          <div
            className="col"
            style={{ gap: "10px", justifyContent: "center" }}
          >
            <ReactPlayer
              ref={player}
              url={vedioURL}
              controls={false}
              width="100%"
              height="100%"
            />
          </div>
        </div>

        <div
          className={styles["container"]}
          style={{ gap: "20px", width: "30%" }}
        >
          <div className={styles["box"]}>
            <p className={styles["header"]}>在線使用者</p>
          </div>
          <div className={styles["box"]}>
            <p className={styles["header"]}>房間日誌</p>
          </div>
        </div>

        <div className={styles["container"]} style={{ width: "30%" }}>
          <p className={styles["header"]}>播放歌單</p>
          <div
            className="col"
            style={{ gap: "10px", justifyContent: "center" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
