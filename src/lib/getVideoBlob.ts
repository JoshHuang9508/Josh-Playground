import { AddConsoleLog } from "@/redux";

import { API_URL } from "@/lib/constants";

import { t } from "@/lib/i18n";

export async function getVideoBlob(
  videoId: string,
  format: string,
): Promise<any> {
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
            throw new Error(t("errors.mp4Failed"));
          }
          return response.blob();
        })
        .catch((error) => {
          AddConsoleLog(t("errors.downloadVideo", String(error)));
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
            throw new Error(t("errors.mp3Failed"));
          }
          return response.blob();
        })
        .catch((error) => {
          AddConsoleLog(t("errors.downloadAudio", String(error)));
        });
      return blob_mp3;
  }
}
