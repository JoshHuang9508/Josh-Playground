import React from "react";
import ReactPlayer from "react-player";

import { AddConsoleLog } from "@/redux";

import { API_URL, TEXT_CONTENT } from "@/lib/constants";

import { t } from "@/lib/i18n";

import useCommandHandler from "@/lib/hooks/CommandHandler";

import ColorSpan from "@/components/ColorSpan";

export default function YtDownloaderView() {
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
              throw new Error(t("ytdownloader.errors.mp4Failed"));
            }
            return response.blob();
          })
          .catch((error) => {
            AddConsoleLog(
              t("ytdownloader.errors.downloadVideo", String(error)),
            );
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
              throw new Error(t("ytdownloader.errors.mp3Failed"));
            }
            return response.blob();
          })
          .catch((error) => {
            AddConsoleLog(
              t("ytdownloader.errors.downloadAudio", String(error)),
            );
          });
        return blob_mp3;
    }
  };

  useCommandHandler({
    download: (_cmd, args, flags) => {
      const URL = args[0] ?? "";
      if (!URL) {
        AddConsoleLog(t("ytdownloader.commands.download.usage"));
        return;
      } else if (!ReactPlayer.canPlay(URL)) {
        AddConsoleLog(t("ytdownloader.commands.download.invalidUrl"));
        return;
      } else if (
        flags.includes("-v") ||
        flags.includes("--video") ||
        flags.length === 0
      ) {
        const downloadVideo = async () => {
          AddConsoleLog(
            t("ytdownloader.commands.download.pending", URL, ".mp4"),
          );
          const blob = await getVideoBlob(URL.split("v=")[1], "mp4");
          AddConsoleLog(t("ytdownloader.commands.download.starting"));
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${URL.split("v=")[1]}.mp4`;
          a.click();
        };
        downloadVideo();
        return;
      } else if (flags.includes("-a") || flags.includes("--audio")) {
        const downloadAudio = async () => {
          AddConsoleLog(
            t("ytdownloader.commands.download.pending", URL, ".mp3"),
          );
          const blob = await getVideoBlob(URL.split("v=")[1], "mp3");
          AddConsoleLog(t("ytdownloader.commands.download.starting"));
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
            {TEXT_CONTENT["/ytdownloader"].tutorial.map((content, index) => {
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
