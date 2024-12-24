// Import packages
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ReactPlayer from "react-player";
// Import styles
import styles from "../../../public/styles/listentogether.module.css";
// Import redux
import store from "../../redux/store";
import { addConsoleContent } from "../../redux/consoleContentSlice";
import { setCommand } from "../../redux/commandSlice";

export default function Page() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Command control
  const command = useSelector((state: { command: string }) => state.command);

  useEffect(() => {
    if (!command || command == "") return;
    switch (command.split(" ")[0]) {
      case "log":
        // Use for debugging
        store.dispatch(
          addConsoleContent([JSON.stringify(playerState.duration)])
        );
        break;
      case "queue":
        const URL = command.split(" ").slice(1)[0] ?? "";
        if (!URL) {
          store.dispatch(addConsoleContent(["Please provide a URL"]));
          break;
        }
        if (!ReactPlayer.canPlay(URL)) {
          store.dispatch(addConsoleContent(["Can not play this URL"]));
          return;
        }
        const track: Track = {
          url: URL,
          title: "Unknown Title",
          author: "Unknown Author",
          img: getThumbnail(URL.split("v=")[1]),
          requestBy: "Unknown User",
        };
        setPlayerState({
          ...playerState,
          trackQueue: [...playerState.trackQueue, track],
        });
        store.dispatch(addConsoleContent([`Added ${URL} to queue`]));
        break;
      case "remove":
        const indexToRm = command.split(" ").slice(1)[0] ?? "";
        if (!indexToRm) {
          store.dispatch(addConsoleContent(["Please provide an index"]));
          break;
        }
        if (indexToRm == "*") {
          playerState.trackQueue = [];
          setPlayerState({ ...playerState });
          store.dispatch(addConsoleContent(["Removed all tracks"]));
          break;
        }
        if (parseInt(indexToRm) >= playerState.trackQueue.length) {
          store.dispatch(addConsoleContent(["Index out of range"]));
          break;
        }
        playerState.trackQueue.splice(parseInt(indexToRm), 1);
        setPlayerState({ ...playerState });
        store.dispatch(addConsoleContent([`Removed track ${indexToRm}`]));
        break;
      case "play":
        playerState.isPlaying = true;
        store.dispatch(addConsoleContent(["Start playing..."]));
        break;
      case "pause":
        playerState.isPlaying = false;
        store.dispatch(addConsoleContent(["Pause playing..."]));
        break;
      case "next":
        playerState.index =
          playerState.index + 1 >= playerState.trackQueue.length
            ? 0
            : playerState.index + 1;
        player.current?.seekTo(0);
        store.dispatch(addConsoleContent(["Next track..."]));
        break;
      case "prev":
        playerState.index =
          playerState.index - 1 < 0
            ? playerState.trackQueue.length - 1
            : playerState.index - 1;
        player.current?.seekTo(0);
        store.dispatch(addConsoleContent(["Previous track..."]));
        break;
      case "switch":
        const indexToSw = command.split(" ").slice(1)[0] ?? "";
        if (!indexToSw) {
          store.dispatch(addConsoleContent(["Please provide an index"]));
          break;
        }
        if (parseInt(indexToSw) >= playerState.trackQueue.length) {
          store.dispatch(addConsoleContent(["Index out of range"]));
          break;
        }
        playerState.index = parseInt(indexToSw);
        player.current?.seekTo(0);
        store.dispatch(addConsoleContent([`Switch to track ${indexToSw}`]));
        break;
      case "volume":
        const volume = command.split(" ").slice(1)[0] ?? "";
        if (!volume) {
          store.dispatch(addConsoleContent(["Please provide a volume"]));
          break;
        }
        playerState.volume = parseFloat(volume) / 100;
        store.dispatch(addConsoleContent([`Set volume to ${volume}`]));
        break;
      case "mute":
        playerState.muted = true;
        store.dispatch(addConsoleContent(["Mute..."]));
        break;
      case "unmute":
        playerState.muted = false;
        store.dispatch(addConsoleContent(["Unmute..."]));
        break;
      case "loop":
        playerState.loop = true;
        store.dispatch(addConsoleContent(["Loop..."]));
        break;
      case "unloop":
        playerState.loop = false;
        store.dispatch(addConsoleContent(["Unloop..."]));
        break;
      case "rate":
        const rate = command.split(" ").slice(1)[0] ?? "";
        if (!rate) {
          store.dispatch(addConsoleContent(["Please provide a rate"]));
          break;
        }
        playerState.playbackRate = parseFloat(rate);
        store.dispatch(addConsoleContent([`Set rate to ${rate}`]));
        break;
      case "seek":
        const seek = command.split(" ").slice(1)[0] ?? "";
        if (!seek) {
          store.dispatch(addConsoleContent(["Please provide a time"]));
          break;
        }
        player.current?.seekTo(parseFloat(seek));
        store.dispatch(addConsoleContent([`Seek to ${seek}`]));
        break;
      case "help":
        store.dispatch(
          addConsoleContent([
            "--| Commands for this page |--",
            "queue <URL> - Add a track to queue",
            "play - Start playing",
            "pause - Pause playing",
            "next - Play next track",
            "prev - Play previous track",
            "switch <index> - Switch to track",
            "volume <volume> - Set volume (0 - 100) %",
            "mute - Mute",
            "unmute - Unmute",
            "loop - Loop",
            "unloop - Unloop",
            "rate <rate> - Set playback rate",
            "seek <time> - Seek to time",
          ])
        );
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
  interface Track {
    url: string; //https://www.youtube.com/watch?v={ID}
    title: string;
    author: string;
    img: string; //https://img.youtube.com/vi/{ID}/default.jpg
    requestBy: string;
  }
  interface PlayerState {
    isPlaying: boolean;
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
    duration: number;
    playbackRate: number;
    volume: number;
    muted: boolean;
    seeking: boolean;
    loop: boolean;
    trackQueue: Track[];
    index: number;
  }
  const player = useRef<ReactPlayer>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    played: 0,
    playedSeconds: 0,
    loaded: 0,
    loadedSeconds: 0,
    duration: 0,
    playbackRate: 1,
    volume: 0.1,
    muted: false,
    seeking: false,
    loop: false,
    trackQueue: [],
    index: 0,
  });

  return (
    <div className={styles["layout"]}>
      <p className={styles["title"]}>YT音樂同步撥放器</p>
      <p className={styles["subtitle"]}>
        一個可以同步撥放音樂的網站，讓你和朋友一起聽音樂
      </p>
      <div className={styles["info-div"]}>
        <div
          className={styles["container"]}
          style={{ gap: "20px", width: "30%" }}
        >
          <div className={styles["box"]}>
            <p className={styles["header2"]}>在線使用者</p>
          </div>
          <div className={styles["box"]}>
            <p className={styles["header2"]}>房間日誌</p>
          </div>
        </div>

        <div className={styles["container"]} style={{ width: "30%" }}>
          <div
            className="col"
            style={{
              gap: "10px",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            {isClient && (
              <ReactPlayer
                style={
                  playerState.trackQueue.length > 0 ? {} : { display: "none" }
                }
                ref={player}
                url={playerState.trackQueue[playerState.index]?.url ?? ""}
                playing={playerState.isPlaying}
                volume={playerState.volume}
                muted={playerState.muted}
                loop={playerState.loop}
                playbackRate={playerState.playbackRate}
                onProgress={(state) => {
                  if (!playerState.seeking)
                    setPlayerState({
                      ...playerState,
                      ...state,
                    });
                }}
                onDuration={(duration) =>
                  setPlayerState({ ...playerState, duration })
                }
                onEnded={() => {
                  playerState.index =
                    playerState.index + 1 >= playerState.trackQueue.length
                      ? 0
                      : playerState.index + 1;
                  player.current?.seekTo(0);
                }}
                width="100%"
                height="100%"
                controls={false}
              />
            )}
          </div>
        </div>

        <div
          className={styles["container"]}
          style={{ width: "30%", gap: "5%" }}
        >
          <p className={styles["header"]}>播放歌單</p>
          <div
            style={{
              width: "100%",
              height: "100%",
              overflow: "scroll",
              scrollbarWidth: "none",
            }}
          >
            {playerState.trackQueue.map((track, index) => (
              <div
                key={index}
                className={`${styles["track-card"]} ${
                  index === playerState.index ? styles["selected"] : ""
                }`}
              >
                <div className={styles["track-info"]}>
                  <img style={{ height: "100%" }} src={track.img} />
                  <div>
                    <p className={styles["track-title"]}>
                      {"#" + index + " " + track.author + " | " + track.title}
                    </p>
                    <p className={styles["track-subtitle"]}>
                      {"Add by: " + track.requestBy}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getThumbnail(videoId: string, quality = "high") {
  const qualities = {
    default: "default.jpg",
    medium: "mqdefault.jpg",
    high: "hqdefault.jpg",
    standard: "sddefault.jpg",
    maxres: "maxresdefault.jpg",
  };

  return `https://i.ytimg.com/vi/${videoId}/${qualities[quality]}`;
}
