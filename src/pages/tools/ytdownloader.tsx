// Import packages
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import ReactPlayer from "react-player";
// Import styles
// Import redux
import store, { AddConsoleLog } from "../../redux/store";
import { setCommand } from "../../redux/commandSlice";
// Import types

export default function Page() {
  // API server
  const hostURL = useSelector((state: { host: string }) => state.host);

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
        AddConsoleLog([hostURL]);
        // Use for debugging
        break;
      case "download":
        const URL = command.split(" ").slice(1)[0] ?? "";
        if (!URL) {
          AddConsoleLog(["Usage: download [video_URL]"]);
          break;
        }
        if (!ReactPlayer.canPlay(URL)) {
          AddConsoleLog(["Invalid video URL"]);
          break;
        }
        if (
          flags.includes("-v") ||
          flags.includes("--video") ||
          flags.length == 0
        ) {
          getVideoFile(URL.split("v=")[1], "mp4");
          AddConsoleLog([`Pending download: ${URL} (.mp4)`]);
          break;
        }
        if (flags.includes("-a") || flags.includes("--audio")) {
          getVideoFile(URL.split("v=")[1], "mp3");
          AddConsoleLog([`Pending download: ${URL} (.mp3)`]);
          break;
        }
        break;
      default:
        AddConsoleLog([`Command not found: @#fff700${command}`]);
        break;
    }
    store.dispatch(setCommand(""));
  }, [command]);

  // API control
  const getVideoFile = (videoId: string, format: string) => {
    const downloadAudio = (videoId: string) => {
      fetch(`${hostURL}/api/ytdownload-mp3?videoId=${videoId}`, {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      })
        .then((response) => {
          const contentType = response.headers.get("Content-Type");
          if (!response.ok) {
            AddConsoleLog([`HTTP error! status: ${response.status}`]);
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          if (contentType === "application/json") {
            AddConsoleLog([`Download failed!`]);
            throw new Error("Download failed!");
          }
          return response.blob();
        })
        .then((blob) => {
          AddConsoleLog(["Starting download..."]);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${videoId}.mp3`;
          a.click();
        })
        .catch((error) => {
          AddConsoleLog([`Error downloading audio: ${error}`]);
          throw error;
        });
    };
    const downloadVideo = (videoId: string) => {
      fetch(`${hostURL}/api/ytdownload-mp4?videoId=${videoId}`, {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      })
        .then((response) => {
          const contentType = response.headers.get("Content-Type");
          if (!response.ok) {
            AddConsoleLog([`HTTP error! status: ${response.status}`]);
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          if (contentType === "application/json") {
            AddConsoleLog(["Download failed!"]);
            throw new Error("Download failed!");
          }
          return response.blob();
        })
        .then((blob) => {
          AddConsoleLog(["Starting download..."]);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${videoId}.mp4`;
          a.click();
        })
        .catch((error) => {
          AddConsoleLog([`Error downloading video: ${error}`]);
          throw error;
        });
    };
    switch (format) {
      case "mp4":
        downloadVideo(videoId);
        break;
      case "mp3":
        downloadAudio(videoId);
        break;
    }
  };

  return (
    <div className={"content-div"}>
      <div className={"container2"} style={{ gap: "1rem" }}>
        <div className={"sub-container1"} style={{ gap: "1rem" }}>
          <p className={"header2"}>在線使用者</p>
        </div>
        <div className={"sub-container1"} style={{ gap: "1rem" }}>
          <p className={"header2"}>房間日誌</p>
        </div>
      </div>

      <div className={"container1"}></div>

      <div className={"container1"}>
        <div className={"sub-container1"} style={{ gap: "1rem" }}>
          <p className={"header2"}>{"播放歌單"}</p>
        </div>
      </div>
    </div>
  );
}
