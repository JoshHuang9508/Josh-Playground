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
// Import json

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
        const updateTrackQueue = async () => {
          const _ = await getVideoInfo(URL.split("v=")[1]);
          const track: Track = {
            url: _.video_url,
            title: _.title,
            author: _.ownerChannelName,
            img: _.thumbnails[_.thumbnails.length - 1].url,
            requestBy: "Unknown User", // TODO: Get user name
          };
          setPlayerState({
            ...playerState,
            playing: true,
            trackQueue: [...playerState.trackQueue, track],
          });
          store.dispatch(
            addConsoleContent([
              `Added ${track.title} to queue (#${playerState.trackQueue.length})`,
            ])
          );
        };
        updateTrackQueue();
        break;
      case "remove":
        const indexToRm = command.split(" ").slice(1)[0] ?? "";
        if (!indexToRm) {
          store.dispatch(addConsoleContent(["Please provide an index"]));
          break;
        }
        if (indexToRm == "*") {
          setPlayerState({ ...playerState, trackQueue: [] });
          store.dispatch(addConsoleContent(["Removed all tracks"]));
          break;
        }
        if (parseInt(indexToRm) >= playerState.trackQueue.length) {
          store.dispatch(addConsoleContent(["Index out of range"]));
          break;
        }
        setPlayerState({
          ...playerState,
          trackQueue: playerState.trackQueue.filter(
            (_, index) => index != parseInt(indexToRm)
          ),
        });
        store.dispatch(addConsoleContent([`Removed track ${indexToRm}`]));
        break;
      case "play":
        setPlayerState({
          ...playerState,
          playing: true,
        });
        store.dispatch(addConsoleContent(["Start playing..."]));
        break;
      case "pause":
        setPlayerState({
          ...playerState,
          playing: false,
        });
        store.dispatch(addConsoleContent(["Pause playing..."]));
        break;
      case "next":
        setPlayerState({
          ...playerState,
          index:
            playerState.index + 1 >= playerState.trackQueue.length
              ? 0
              : playerState.index + 1,
        });
        player.current?.seekTo(0);
        store.dispatch(addConsoleContent(["Next track..."]));
        break;
      case "prev":
        setPlayerState({
          ...playerState,
          index:
            playerState.index - 1 <= -1
              ? playerState.trackQueue.length - 1
              : playerState.index - 1,
        });
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
        setPlayerState({ ...playerState, index: parseInt(indexToSw) });
        player.current?.seekTo(0);
        store.dispatch(addConsoleContent([`Switch to track ${indexToSw}`]));
        break;
      case "volume":
        const volume = command.split(" ").slice(1)[0] ?? "";
        if (!volume) {
          store.dispatch(addConsoleContent(["Please provide a volume"]));
          break;
        }
        setPlayerState({ ...playerState, volume: parseFloat(volume) / 100 });
        store.dispatch(addConsoleContent([`Set volume to ${volume}`]));
        break;
      case "mute":
        const sufix_mute = command.split(" ").slice(1)[0] ?? "";
        switch (sufix_mute) {
          case "-t":
            setPlayerState({ ...playerState, muted: true });
            store.dispatch(addConsoleContent(["Mute..."]));
            break;
          case "-f":
            setPlayerState({ ...playerState, muted: false });
            store.dispatch(addConsoleContent(["Unmute..."]));
            break;
          default:
            store.dispatch(addConsoleContent(["Usage: mute <-t | -f>"]));
            break;
        }
        break;
      case "loop":
        const sufix_loop = command.split(" ").slice(1)[0] ?? "";
        switch (sufix_loop) {
          case "-t":
            setPlayerState({ ...playerState, loop: true });
            store.dispatch(addConsoleContent(["Loop..."]));
            break;
          case "-f":
            setPlayerState({ ...playerState, loop: false });
            store.dispatch(addConsoleContent(["Unloop..."]));
            break;
          default:
            store.dispatch(addConsoleContent(["Usage: loop <-t | -f>"]));
            break;
        }
        break;
      case "rate":
        const rate = command.split(" ").slice(1)[0] ?? "";
        if (!rate) {
          store.dispatch(addConsoleContent(["Please provide a rate"]));
          break;
        }
        setPlayerState({
          ...playerState,
          playbackRate: parseFloat(rate) / 100,
        });
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
            "remove <index | *> - Remove a track from queue",
            "play - Start playing",
            "pause - Pause playing",
            "next - Play next track",
            "prev - Play previous track",
            "switch <index> - Switch to track",
            "volume <0 - 100> - Set volume (0 - 100%)",
            "mute <-t | -f> - Mute / Unmute",
            "loop <-t | -f> - Loop / Unloop",
            "rate <0 - 100> - Set playback rate (0 - 100%)",
            "seek <time> - Seek to time (s)",
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
  interface VideoInfo {
    videoId: string;
    title: string;
    lengthSeconds: string;
    keywords: string[];
    viewCount: string;
    embed: {
      iframeUrl: string;
      width: number;
      height: number;
    };
    description: string;
    ownerProfileUrl: string;
    externalChannelId: string;
    isFamilySafe: boolean;
    availableCountries: string[];
    isUnlisted: boolean;
    hasYpcMetadata: boolean;
    category: string;
    publishDate: string;
    ownerChannelName: string;
    uploadDate: string;
    isShortsEligible: boolean;
    channelId: string;
    video_url: string;
    storyboards: {
      templateUrl: string;
      thumbnailWidth: number;
      thumbnailHeight: number;
      thumbnailCount: number;
      interval: number;
      columns: number;
      rows: number;
      storyboardCount: number;
    }[];
    chapters: any[];
    thumbnails: {
      url: string;
      width: number;
      height: number;
    }[];
    error: string;
  }
  interface Track {
    url: string; //https://www.youtube.com/watch?v={ID}
    title: string;
    author: string;
    img: string; //https://img.youtube.com/vi/{ID}/default.jpg
    requestBy: string;
  }
  interface PlayerState {
    playing: boolean;
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
    playing: false,
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
    <div className={"layout"}>
      <p className={"title"}>YT音樂同步撥放器</p>
      <p className={"subtitle"}>
        一個可以同步撥放音樂的網站，讓你和朋友一起聽音樂
      </p>
      <div className={"content-div"}>
        <div className={"container1"} style={{ gap: "2rem", flex: 0.5 }}>
          <div className={"sub-container1"} style={{ gap: "10%" }}>
            <p className={"header2"}>在線使用者</p>
          </div>
          <div className={"sub-container1"}>
            <p className={"header2"}>房間日誌</p>
          </div>
        </div>

        <div className={"container1"}>
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
                playing={playerState.playing}
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

        <div className={"container1"} style={{ gap: "5%" }}>
          <p className={"header1"}>播放歌單</p>
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

  async function getVideoInfo(videoId: string): Promise<VideoInfo> {
    const data = await fetch(`/api/getYTInfo?videoId=${videoId}`).then((res) =>
      res.json()
    );
    return data as VideoInfo;
  }
}
