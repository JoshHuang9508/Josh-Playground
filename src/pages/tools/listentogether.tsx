// Import packages
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ReactPlayer from "react-player";
import { io, Socket } from "socket.io-client";
// Import styles
import styles from "../../../public/styles/listentogether.module.css";
// Import redux
import store from "../../redux/store";
import { addConsoleContent } from "../../redux/consoleContentSlice";
import { setCommand } from "../../redux/commandSlice";
// Import json

// API server
const hostURL = "https://c6ec-2001-df2-45c1-75-00-1.ngrok-free.app";

export default function Page() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Socket control
  const [socketInstance, setSocketInstance] = useState<Socket>();

  useEffect(() => {
    const socket = io(hostURL, {
      transports: ["websocket"],
    });
    console.log(`Connecting to ${hostURL}...`);

    setSocketInstance(socket);

    socket.emit("join", localStorage.getItem("username") ?? "Anonymous");

    socket.on("connect", () => {
      store.dispatch(
        addConsoleContent([`Connect server success (id: ${socket.id})`])
      );
    });
    socket.on("connect_error", () => {
      store.dispatch(
        addConsoleContent([`Connect server failed (id: ${socket.id})`])
      );
    });
    socket.on("error", (error) => {
      store.dispatch(
        addConsoleContent([`Connect server error: ${error.message}`])
      );
    });
    socket.on("disconnect", () => {
      store.dispatch(addConsoleContent([`Disconnect from server`]));
    });
    socket.on("message", (msg) => {
      console.log("Message received:", msg);
    });
    socket.on("receivePlayerState", (state) => {
      setPlayerState({ ...playerState, ...state });
    });
    socket.on("receiveLog", (logs) => {
      setLogs(logs);
    });
    socket.on("receiveUsers", (users) => {
      setUsers(users);
    });
    socket.on("seek", (time) => {
      player.current?.seekTo(time);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const GetPlayerState = () => {
    return new Promise((resolve) => {
      socketInstance?.emit("getPlayerState");
      socketInstance?.once("getPlayerState", (data) => {
        resolve(data);
      });
    });
  };
  const SetPlayerState = (state: PlayerState) => {
    socketInstance?.emit("setPlayerState", state);
  };
  const UpdatePlayerState = (state: PlayerState) => {
    socketInstance?.emit("updatePlayerState", state);
  };
  const Seek = (time: number) => {
    return new Promise((resolve) => {
      socketInstance?.emit("seek", time);
      socketInstance?.once("seek", (data) => {
        resolve(data);
      });
    });
  };
  const SetLog = (logs: string[]) => {
    socketInstance?.emit("setLog", logs);
  };
  const AddLog = (log: string) => {
    socketInstance?.emit("addLog", log);
  };
  const SetUsername = (username: string) => {
    setUsername(username);
    localStorage.setItem("username", username);
    socketInstance?.emit("setUsername", username);
  };

  // User control
  interface User {
    [id: string]: string;
  }
  const [users, setUsers] = useState<User>({});
  const [username, setUsername] = useState("Anonymous");

  useEffect(() => {
    const name: string = localStorage.getItem("username") ?? "Anonymous";
    setUsername(name);
  }, []);

  // Command control
  const command = useSelector((state: { command: string }) => state.command);

  useEffect(() => {
    if (!command || command == "") return;
    switch (command.split(" ")[0]) {
      case "log":
        // Use for debugging
        console.log(currentTrack);
        break;
      case "send":
        const message = command.split(" ").slice(1)[0] ?? "";
        if (!message) {
          store.dispatch(addConsoleContent(["Please provide a message"]));
          break;
        }
        if (!socketInstance) {
          store.dispatch(addConsoleContent(["WebSocket is not connected"]));
          break;
        }
        store.dispatch(addConsoleContent([`Send message: ${message}`]));
        AddLog(`${username}: ${message}`);
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
          const track = await getVideoInfoAPI(URL.split("v=")[1]).then(
            (data) => {
              return {
                url: data.video_url,
                title: data.title,
                author: data.ownerChannelName,
                img: data.thumbnails[data.thumbnails.length - 1].url,
                requestBy: username,
                id: Date.now(),
              } as Track;
            }
          );
          SetPlayerState({
            ...playerState,
            trackQueue: [...playerState.trackQueue, track],
          });
          store.dispatch(
            addConsoleContent([
              `Added ${track.title} to queue (#${playerState.trackQueue.length})`,
            ])
          );
          AddLog(
            `${username} 在播放清單中新增了 ${track.title} (#${playerState.trackQueue.length})`
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
        if (parseInt(indexToRm) >= playerState.trackQueue.length) {
          store.dispatch(addConsoleContent(["Index out of range"]));
          break;
        }
        if (indexToRm == "*") {
          SetPlayerState({ ...playerState, trackQueue: [] });
          store.dispatch(addConsoleContent(["Removed all tracks"]));
          AddLog(`${username} 移除了所有歌曲`);
          break;
        }
        const trackToRm = playerState.trackQueue[parseInt(indexToRm)];
        SetPlayerState({
          ...playerState,
          trackQueue: playerState.trackQueue.filter(
            (_, index) => index != parseInt(indexToRm)
          ),
        });
        store.dispatch(addConsoleContent([`Removed track ${indexToRm}`]));
        AddLog(`${username} 移除了 ${trackToRm.title} (#${indexToRm})`);
        break;
      case "play":
        SetPlayerState({
          ...playerState,
          playing: true,
        });
        store.dispatch(addConsoleContent(["Start playing..."]));
        AddLog(`${username} 開始播放`);
        break;
      case "pause":
        SetPlayerState({
          ...playerState,
          playing: false,
        });
        store.dispatch(addConsoleContent(["Pause playing..."]));
        AddLog(`${username} 暫停播放`);
        break;
      case "next":
        SetPlayerState({
          ...playerState,
          index:
            playerState.index + 1 >= playerState.trackQueue.length
              ? 0
              : playerState.index + 1,
        });
        store.dispatch(addConsoleContent(["Next track..."]));
        AddLog(`${username} 播放下一首歌曲`);
        break;
      case "prev":
        SetPlayerState({
          ...playerState,
          index:
            playerState.index - 1 <= -1
              ? playerState.trackQueue.length - 1
              : playerState.index - 1,
        });
        store.dispatch(addConsoleContent(["Previous track..."]));
        AddLog(`${username} 播放上一首歌曲`);
        break;
      case "switch":
        const indexToSw = command.split(" ").slice(1)[0] ?? "";
        if (!indexToSw) {
          store.dispatch(addConsoleContent(["Please provide an index"]));
          break;
        }
        if (
          parseInt(indexToSw) >= playerState.trackQueue.length ||
          parseInt(indexToSw) < 0
        ) {
          store.dispatch(addConsoleContent(["Index out of range"]));
          break;
        }
        SetPlayerState({ ...playerState, index: parseInt(indexToSw) });
        store.dispatch(addConsoleContent([`Switch to track ${indexToSw}`]));
        AddLog(`${username} 切換到歌曲 #${indexToSw}`);
        break;
      case "volume":
        const volume = command.split(" ").slice(1)[0] ?? "";
        if (!volume) {
          store.dispatch(addConsoleContent(["Please provide a volume"]));
          break;
        }
        setPlayerStateClient({
          ...PlayerStateClient,
          volume: parseFloat(volume) / 100,
        });
        store.dispatch(addConsoleContent([`Set volume to ${volume}`]));
        break;
      case "mute":
        const sufix_mute = command.split(" ").slice(1)[0] ?? "";
        switch (sufix_mute) {
          case "-t":
            setPlayerStateClient({ ...PlayerStateClient, muted: true });
            store.dispatch(addConsoleContent(["Mute..."]));
            break;
          case "-f":
            setPlayerStateClient({ ...PlayerStateClient, muted: false });
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
            SetPlayerState({ ...playerState, loop: true });
            store.dispatch(addConsoleContent(["Loop..."]));
            AddLog(`${username} 開啟循環播放`);
            break;
          case "-f":
            SetPlayerState({ ...playerState, loop: false });
            store.dispatch(addConsoleContent(["Unloop..."]));
            AddLog(`${username} 關閉循環播放`);
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
        SetPlayerState({
          ...playerState,
          playbackRate: parseFloat(rate) / 100,
        });
        store.dispatch(addConsoleContent([`Set rate to ${rate}`]));
        AddLog(`${username} 設定播放速度為 ${rate}%`);
        break;
      case "seek":
        const seek = command.split(" ").slice(1)[0] ?? "";
        if (!seek) {
          store.dispatch(addConsoleContent(["Please provide a time"]));
          break;
        }
        if (isNaN(parseFloat(seek))) {
          store.dispatch(addConsoleContent(["Invalid time"]));
          break;
        }
        if (parseFloat(seek) < 0 || parseFloat(seek) > playerState.duration) {
          store.dispatch(addConsoleContent(["Time out of range"]));
          break;
        }
        Seek(parseFloat(seek));
        store.dispatch(addConsoleContent([`Seek to ${seek}`]));
        AddLog(`${username} 跳轉到 ${seek} 秒`);
        break;
      case "refresh":
        const refresh = async () => {
          const state = await GetPlayerState().then((state) => {
            return state as PlayerState;
          });
          SetPlayerState({ ...state, playing: false });
          await new Promise((resolve) => setTimeout(resolve, 100));
          await Seek(state.playedSeconds);
          await new Promise((resolve) => setTimeout(resolve, 100));
          SetPlayerState({ ...state, playing: state.playing });
          store.dispatch(addConsoleContent(["Refresh player..."]));
          AddLog(`${username} 刷新了播放器`);
        };
        refresh();
        break;
      case "setname":
        const name = command.split(" ").slice(1)[0] ?? "";
        if (!name) {
          store.dispatch(addConsoleContent(["Please provide a name"]));
          break;
        }
        SetUsername(name);
        break;
      case "page":
        const page = command.split(" ").slice(1)[0] ?? "";
        if (!page) {
          store.dispatch(addConsoleContent(["Please provide a page"]));
          break;
        }
        if (parseInt(page) > totalPage || parseInt(page) <= 0) {
          store.dispatch(addConsoleContent(["Page out of range"]));
          break;
        }
        setCurrentPage(parseInt(page));
        store.dispatch(addConsoleContent([`Switch to playlist page ${page}`]));
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
            "refresh - Refresh player",
            "setname <name> - Set username",
            "page <page> - Switch playlist page",
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
    id: number;
  }
  interface PlayerState {
    playing: boolean;
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
    duration: number;
    playbackRate: number;
    loop: boolean;
    trackQueue: Track[];
    index: number;
  }
  interface PlayerStateClient {
    volume: number;
    muted: boolean;
    seeking: boolean;
    isReady: boolean;
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
    loop: false,
    trackQueue: [],
    index: 0,
  });
  const [PlayerStateClient, setPlayerStateClient] = useState<PlayerStateClient>(
    {
      volume: 0.5,
      muted: false,
      seeking: false,
      isReady: false,
    }
  );
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  useEffect(() => {
    if (
      playerState.index < 0 ||
      playerState.index >= playerState.trackQueue.length
    ) {
      setPlayerState({ ...playerState, index: 0 });
    } else if (playerState.trackQueue.length > 0) {
      if (currentTrack?.id != playerState.trackQueue[playerState.index].id)
        // This will cause restart when someone join the room
        Seek(0);
      setCurrentTrack(playerState.trackQueue[playerState.index]);
    } else {
      setCurrentTrack(null);
    }
  }, [playerState.index, playerState.trackQueue]);

  // Playlist control
  const [totalPage, setTotalPage] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [playlist, setPlaylist] = useState<Track[][]>([]);

  useEffect(() => {
    const newPlaylist: Track[][] = [];
    for (let i = 0; i < playerState.trackQueue.length; i += 4) {
      newPlaylist.push(playerState.trackQueue.slice(i, i + 4));
    }
    setPlaylist(newPlaylist);
  }, [playerState.trackQueue]);

  useEffect(() => {
    setTotalPage(Math.ceil(playerState.trackQueue.length / 4));
  }, [playerState.trackQueue]);

  useEffect(() => {
    setCurrentPage(Math.ceil((playerState.index + 1) / 4));
  }, [playerState.index]);

  useEffect(() => {
    setCurrentPageIndex(currentPage - 1);
  }, [currentPage]);

  // Log control
  const [logs, setLogs] = useState<string[]>([]);

  return (
    <div className={"layout"}>
      <p className={"title"}>YT音樂同步撥放器</p>
      <p className={"subtitle"}>
        一個可以同步撥放音樂的網站，讓你和朋友一起聽音樂
      </p>
      <div className={"content-div"}>
        <div className={"container1"} style={{ gap: "2rem", flex: 0.5 }}>
          <div className={"sub-container1"} style={{ gap: "1rem" }}>
            <p className={"header2"}>在線使用者</p>
            <div className={"col"}>
              {Object.keys(users).map((id, index) => (
                <p key={index} className={styles["online-user"]}>
                  ● {users[id]}
                </p>
              ))}
            </div>
          </div>
          <div className={"sub-container1"} style={{ gap: "1rem" }}>
            <p className={"header2"}>房間日誌</p>
            <div className={"col"}>
              {logs.map((log, index) => (
                <p key={index} className={styles["log"]}>
                  {log}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className={"container1"}>
          <div
            className="col"
            style={{
              justifyContent: "center",
              pointerEvents: "none",
              backgroundColor: "black",
            }}
          >
            {isClient && playerState && (
              <ReactPlayer
                style={
                  playerState.trackQueue.length > 0 ? {} : { display: "none" }
                }
                ref={player}
                url={currentTrack?.url ?? ""}
                playing={
                  playerState.trackQueue.length > 0 &&
                  PlayerStateClient.isReady &&
                  playerState.playing
                }
                volume={PlayerStateClient.volume}
                muted={PlayerStateClient.muted}
                loop={playerState.loop}
                playbackRate={playerState.playbackRate}
                onProgress={(state) => {
                  console.log("onProgress");
                  UpdatePlayerState({ ...playerState, ...state });
                }}
                onDuration={(duration) => {
                  console.log("onDuration");
                  SetPlayerState({ ...playerState, duration });
                }}
                onEnded={() => {
                  if (playerState.trackQueue.length > 0) {
                    const nextIndex =
                      playerState.index + 1 >= playerState.trackQueue.length
                        ? 0
                        : playerState.index + 1;
                    SetPlayerState({ ...playerState, index: nextIndex });
                    Seek(0);
                  }
                }}
                onError={(error) => {
                  store.dispatch(addConsoleContent([`Error: ${error}`]));
                }}
                onReady={async () => {
                  // Wait for website to load (6s)
                  await new Promise((resolve) => setTimeout(resolve, 6000));
                  if (!PlayerStateClient.isReady) {
                    store.dispatch(
                      addConsoleContent([
                        "Player is ready, auto refresh once (if player is not playing, please refresh manually)",
                      ])
                    );
                    store.dispatch(setCommand("refresh"));
                  }
                  setPlayerStateClient({ ...PlayerStateClient, isReady: true });
                }}
                onSeek={() => {
                  setPlayerStateClient({ ...PlayerStateClient, seeking: true });
                  setTimeout(() => {
                    setPlayerStateClient((prev) => ({
                      ...prev,
                      seeking: false,
                    }));
                  }, 80);
                }}
                width="100%"
                height="100%"
              />
            )}
          </div>
        </div>

        <div className={"container1"} style={{ gap: "5%" }}>
          <p className={"header1"}>
            {"播放歌單" +
              (playerState.trackQueue.length > 0
                ? `(${currentPage}/${totalPage})`
                : "")}
          </p>
          <div
            style={{
              width: "100%",
              height: "100%",
              overflow: "scroll",
              scrollbarWidth: "none",
            }}
          >
            {playlist[currentPageIndex]?.map((track, index) => (
              <div
                key={index + currentPageIndex * 4}
                className={`${styles["track-card"]} ${
                  index + currentPageIndex * 4 === playerState.index
                    ? styles["selected"]
                    : ""
                }`}
              >
                <div className={styles["track-info"]}>
                  <img style={{ height: "100%" }} src={track.img} />
                  <div>
                    <p className={styles["track-title"]}>
                      {"#" +
                        (index + currentPageIndex * 4) +
                        " " +
                        track.author +
                        " | " +
                        track.title}
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
    const data = await fetch(`/api/get-ytdl?videoId=${videoId}`).then((res) =>
      res.json()
    );
    return data as VideoInfo;
  }

  async function getVideoInfoAPI(videoId: string): Promise<VideoInfo> {
    const data = await fetch(`${hostURL}/api/get-ytdl?videoId=${videoId}`).then(
      (res) => res.json()
    );
    return data as VideoInfo;
  }
}
