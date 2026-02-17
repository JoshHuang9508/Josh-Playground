import React from "react";
import ReactPlayer from "react-player";

import { AddConsoleLog } from "@/redux";

import ColorSpan from "@/components/ColorSpan";

import useCommandHandler from "@/hooks/useCommandHandler";

import textContent from "@/lib/text-content.json";

export default function Page() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const getVideoBlob = async (
    videoId: string,
    format: string,
  ): Promise<any> => {
    switch (format) {
      case "mp4":
        const blob_mp4 = await fetch(
          `${API_URL}/api/ytdownload-mp4?videoId=${videoId}`,
          {
            method: "GET",
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          },
        )
          .then((response) => {
            const contentType = response.headers.get("Content-Type");
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            if (contentType === "application/json") {
              throw new Error("Get .mp4 file failed!");
            }
            return response.blob();
          })
          .catch((error) => {
            AddConsoleLog([`Error downloading video: ${error}`]);
          });
        return blob_mp4;
      case "mp3":
        const blob_mp3 = await fetch(
          `${API_URL}/api/ytdownload-mp3?videoId=${videoId}`,
          {
            method: "GET",
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          },
        )
          .then((response) => {
            const contentType = response.headers.get("Content-Type");
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            if (contentType === "application/json") {
              throw new Error("Get .mp3 file failed!");
            }
            return response.blob();
          })
          .catch((error) => {
            AddConsoleLog([`Error downloading audio: ${error}`]);
          });
        return blob_mp3;
    }
  };

  // Command handler
  useCommandHandler({
    log: () => {
      AddConsoleLog([API_URL]);
      // Use for debugging
    },
    download: (_cmd, args, flags) => {
      const URL = args[0] ?? "";
      if (!URL) {
        AddConsoleLog(["Usage: download [video_URL]"]);
        return;
      }
      if (!ReactPlayer.canPlay(URL)) {
        AddConsoleLog(["Invalid video URL"]);
        return;
      }
      if (
        flags.includes("-v") ||
        flags.includes("--video") ||
        flags.length === 0
      ) {
        const downloadVideo = async () => {
          AddConsoleLog([`Pending download: ${URL} (.mp4)`]);
          const blob = await getVideoBlob(URL.split("v=")[1], "mp4");
          AddConsoleLog(["Starting download..."]);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${URL.split("v=")[1]}.mp4`;
          a.click();
        };
        downloadVideo();
        return;
      }
      if (flags.includes("-a") || flags.includes("--audio")) {
        const downloadAudio = async () => {
          AddConsoleLog([`Pending download: ${URL} (.mp3)`]);
          const blob = await getVideoBlob(URL.split("v=")[1], "mp3");
          AddConsoleLog(["Starting download..."]);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${URL.split("v=")[1]}.mp3`;
          a.click();
        };
        downloadAudio();
        return;
      }
    },
  });

  return (
    <div className={"content-div"}>
      <div className={"container1"}>
        <div className={"sub-container2"} style={{ fontFamily: "monospace" }}>
          <div
            className="col"
            style={{
              gap: "0.5rem",
              justifyContent: "center",
            }}
          >
            {textContent["tools/ytdownloader/"].tutorial.map(
              (content, index) => {
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
              },
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
