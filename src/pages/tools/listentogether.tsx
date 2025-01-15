// Import packages
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ReactPlayer from "react-player";
import { io, Socket } from "socket.io-client";
// Import styles
import styles from "../../../public/styles/listentogether.module.css";
// Import redux
import store, { AddConsoleLog } from "../../redux/store";
import { setCommand } from "../../redux/commandSlice";
// Import types
import { PlayerState, Track, PlayerStateClient, User } from "../../lib/types";

// API server
const hostURL = "https://15e3-2001-df2-45c1-75-00-1.ngrok-free.app";

export default function Page() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Mute control
  const [isAllowedToUnmute, setIsAllowedToUnmute] = useState(false);

  useEffect(() => {
    const enablePlay = () => setIsAllowedToUnmute(true);
    document.addEventListener("click", enablePlay);
    document.addEventListener("touchstart", enablePlay);
    return () => {
      document.removeEventListener("click", enablePlay);
      document.removeEventListener("touchstart", enablePlay);
    };
  }, []);

  // Socket control
  const [socketInstance, setSocketInstance] = useState<Socket>();

  useEffect(() => {
    const socket = io(hostURL, {
      transports: ["websocket"],
    });

    setSocketInstance(socket);

    socket.on("connect", async () => {
      AddConsoleLog([`Connect server success (id: ${socket.id})`]);
      socket.emit("join", localStorage.getItem("username") ?? "Anonymous");
      socket.emit("ready");
    });
    socket.on("connect_error", () => {
      AddConsoleLog([`Connect server error (id: ${socket.id})`]);
    });
    socket.on("error", (error) => {
      AddConsoleLog([`Connect server error: ${error.message}`]);
    });
    socket.on("disconnect", () => {
      AddConsoleLog([`Disconnect from server`]);
    });
    socket.on("receivePlayerState", (state) => {
      console.log("Receive player state");
      setPlayerState({ ...playerState, ...state });
    });
    socket.on("receiveLog", (logs) => {
      console.log("Receive logs");
      setLogs(logs);
    });
    socket.on("receiveUsers", (users) => {
      console.log("Receive users");
      setUsers(users);
    });
    socket.on("seek", (time) => {
      console.log("Seek to: ", time);
      player.current?.seekTo(time);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const SetUsername = (username: string) => {
    socketInstance?.emit("setUsername", username);
  };

  const AddRoomLog = (log: string) => {
    socketInstance?.emit("addLog", log);
  };

  const SetPlayerState = (state: PlayerState) => {
    socketInstance?.emit("setPlayerState", state);
  };
  const onDuration = (duration: number) => {
    socketInstance?.emit("onDuration", duration);
  };
  const onProgress = (state: any) => {
    socketInstance?.emit("onProgress", state);
  };
  const onEnd = () => {
    socketInstance?.emit("onEnd");
  };
  const Play = () => {
    socketInstance?.emit("play");
  };
  const Pause = () => {
    socketInstance?.emit("pause");
  };
  const Refresh = () => {
    socketInstance?.emit("refresh");
  };
  const AddTrack = (track: Track) => {
    socketInstance?.emit("addTrack", track);
  };
  const AddTracks = (tracks: Track[]) => {
    socketInstance?.emit("addTracks", tracks);
  };
  const RemoveTrack = (index: number) => {
    socketInstance?.emit("removeTrack", index);
  };
  const SetTrackQueue = (queue: Track[]) => {
    socketInstance?.emit("setTrackQueue", queue);
  };
  const NextTrack = () => {
    socketInstance?.emit("nextTrack");
  };
  const PrevTrack = () => {
    socketInstance?.emit("prevTrack");
  };
  const SetTrackIndex = (index: number) => {
    socketInstance?.emit("setTrackIndex", index);
  };
  const SetPlayBackRate = (rate: number) => {
    socketInstance?.emit("setPlaybackRate", rate);
  };
  const SetLoop = (loop: boolean) => {
    socketInstance?.emit("setLoop", loop);
  };
  const Seek = (time: number) => {
    socketInstance?.emit("seek", time);
  };

  // User control

  const [users, setUsers] = useState<User>({});
  const [username, setUsername] = useState("Anonymous");

  useEffect(() => {
    setUsername(localStorage.getItem("username") ?? "Anonymous");
  }, []);

  // Log control
  const [logs, setLogs] = useState<string[]>([]);

  // Command control
  const command = useSelector((state: { command: string }) => state.command);

  useEffect(() => {
    if (!command || command == "") return;
    switch (command.split(" ")[0]) {
      case "log":
        // Use for debugging
        break;
      case "send":
        const message = command.split(" ").slice(1).join(" ") ?? "";
        if (!message) {
          AddConsoleLog(["Usage: send [message]"]);
          break;
        }
        AddConsoleLog([`Send message: ${message}`]);
        AddRoomLog(`${username}: ${message}`);
        break;
      case "queue":
        const URL = command.split(" ").slice(1)[0] ?? "";
        if (!URL) {
          AddConsoleLog(["Usage: queue [video_URL|playlist_URL]"]);
          break;
        }
        if (!ReactPlayer.canPlay(URL)) {
          AddConsoleLog(["Can not play this URL"]);
          return;
        }
        const updateTrackQueue = async () => {
          if (URL.includes("playlist?list=")) {
            const tracks = await getPlaylistAPI(URL.split("list=")[1]);
            AddTracks(tracks);
            AddConsoleLog([
              `Added ${tracks.length} tracks to queue (#${
                playerState.trackQueue.length
              } ~ #${playerState.trackQueue.length + tracks.length - 1})`,
            ]);
            AddRoomLog(
              `${username} 在播放清單中新增了 ${tracks.length} 首歌曲 (#${
                playerState.trackQueue.length
              } ~ #${playerState.trackQueue.length + tracks.length - 1})`
            );
          }
          if (URL.includes("watch?v=")) {
            const track = await getVideoInfoAPI(URL.split("v=")[1]);
            AddTrack(track);
            AddConsoleLog([
              `Added ${track.title} to queue (#${playerState.trackQueue.length})`,
            ]);
            AddRoomLog(
              `${username} 在播放清單中新增了 ${track.title} (#${playerState.trackQueue.length})`
            );
          }
        };
        updateTrackQueue();
        break;
      case "remove":
        const indexToRm = command.split(" ").slice(1)[0] ?? "";
        if (!indexToRm) {
          AddConsoleLog(["Usage: remove [index]"]);
          break;
        }
        if (indexToRm == "*") {
          SetTrackQueue([]);
          AddConsoleLog(["Removed all tracks"]);
          AddRoomLog(`${username} 移除了所有歌曲`);
          break;
        }
        if (isNaN(parseFloat(indexToRm))) {
          AddConsoleLog(["Invalid index"]);
          break;
        }
        if (parseInt(indexToRm) >= playerState.trackQueue.length) {
          AddConsoleLog(["Index out of range"]);
          break;
        }
        const trackToRm = playerState.trackQueue[parseInt(indexToRm)];
        RemoveTrack(parseInt(indexToRm));
        AddConsoleLog([`Removed track ${indexToRm}`]);
        AddRoomLog(`${username} 移除了 ${trackToRm.title} (#${indexToRm})`);
        break;
      case "play":
        Play();
        AddConsoleLog(["Start playing..."]);
        AddRoomLog(`${username} 開始播放`);
        break;
      case "pause":
        Pause();
        AddConsoleLog(["Pause playing..."]);
        AddRoomLog(`${username} 暫停播放`);
        break;
      case "switch":
        const sufix_switch = command.split(" ").slice(1)[0] ?? "";
        switch (sufix_switch) {
          case "--next":
          case "-n":
            SetTrackIndex(playerState.index + 1);
            AddConsoleLog([`Switch to next track`]);
            AddRoomLog(`${username} 切換到下一首歌曲`);
            break;
          case "--prev":
          case "-p":
            SetTrackIndex(playerState.index - 1);
            AddConsoleLog([`Switch to previous track`]);
            AddRoomLog(`${username} 切換到上一首歌曲`);
            break;
          default:
            if (isNaN(parseFloat(sufix_switch))) {
              AddConsoleLog(["Invalid index"]);
              break;
            }
            if (
              parseInt(sufix_switch) >= playerState.trackQueue.length ||
              parseInt(sufix_switch) < 0
            ) {
              AddConsoleLog(["Index out of range"]);
              break;
            }
            SetTrackIndex(parseInt(sufix_switch));
            AddConsoleLog([`Switch to track ${sufix_switch}`]);
            AddRoomLog(`${username} 切換到歌曲 #${sufix_switch}`);
            break;
        }
        break;
      case "volume":
        const volume = command.split(" ").slice(1)[0] ?? "";
        if (!volume) {
          AddConsoleLog(["Usage: volume [value]"]);
          break;
        }
        if (isNaN(parseFloat(volume))) {
          AddConsoleLog(["Invalid volume"]);
          break;
        }
        setPlayerStateClient((prev) => ({
          ...prev,
          volume: parseFloat(volume) / 100,
        }));
        localStorage.setItem("volume", volume);
        AddConsoleLog([`Set volume to ${volume}`]);
        break;
      case "loop":
        const sufix_loop = command.split(" ").slice(1)[0] ?? "";
        switch (sufix_loop) {
          case "--true":
          case "-t":
            SetLoop(true);
            AddConsoleLog(["Loop..."]);
            AddRoomLog(`${username} 開啟循環播放`);
            break;
          case "--false":
          case "-f":
            SetLoop(false);
            AddConsoleLog(["Unloop..."]);
            AddRoomLog(`${username} 關閉循環播放`);
            break;
          default:
            AddConsoleLog(["Usage: loop [options]"]);
            break;
        }
        break;
      case "random":
        const sufix_random = command.split(" ").slice(1)[0] ?? "";
        switch (sufix_random) {
          case "--true":
          case "-t":
            SetPlayerState({ ...playerState, random: true });
            AddConsoleLog(["Random..."]);
            AddRoomLog(`${username} 開啟隨機播放`);
            break;
          case "--false":
          case "-f":
            SetPlayerState({ ...playerState, random: false });
            AddConsoleLog(["Unrandom..."]);
            AddRoomLog(`${username} 關閉隨機播放`);
            break;
          default:
            AddConsoleLog(["Usage: random [options]"]);
            break;
        }
        break;
      case "rate":
        const rate = command.split(" ").slice(1)[0] ?? "";
        if (!rate) {
          AddConsoleLog(["Usage: rate [value]"]);
          break;
        }
        if (isNaN(parseFloat(rate))) {
          AddConsoleLog(["Invalid rate"]);
          break;
        }
        SetPlayBackRate(parseFloat(rate) / 100);
        AddConsoleLog([`Set rate to ${rate}%`]);
        AddRoomLog(`${username} 設定播放速度為 ${rate}%`);
        break;
      case "seek":
        const seek = command.split(" ").slice(1)[0] ?? "";
        if (!seek) {
          AddConsoleLog(["Usage: seek [time]"]);
          break;
        }
        if (isNaN(parseFloat(seek))) {
          AddConsoleLog(["Invalid time"]);
          break;
        }
        if (parseFloat(seek) < 0 || parseFloat(seek) > playerState.duration) {
          AddConsoleLog(["Time out of range"]);
          break;
        }
        Seek(parseFloat(seek));
        AddConsoleLog([`Seek to ${seek}`]);
        AddRoomLog(`${username} 跳轉到 ${seek} 秒`);
        break;
      case "refresh":
        Refresh();
        AddConsoleLog(["Refresh player..."]);
        AddRoomLog(`${username} 刷新播放器`);
        break;
      case "setname":
        const name = command.split(" ").slice(1)[0] ?? "";
        if (!name) {
          AddConsoleLog(["Usage: setname [name]"]);
          break;
        }
        if (name.length > 20) {
          AddConsoleLog(["Name too long (max 20 characters)"]);
          break;
        }
        setUsername(name);
        localStorage.setItem("username", name);
        SetUsername(name);
        AddConsoleLog([`Set username to ${name}`]);
        AddRoomLog(`${username} 更改名稱為 ${name}`);
        break;
      case "page":
        const sufix_page = command.split(" ").slice(1)[0] ?? "";
        switch (sufix_page) {
          case "--next":
          case "-n":
            setCurrentPage(currentPage + 1);
            AddConsoleLog([`Switch to playlist page ${currentPage + 1}`]);
            break;
          case "--prev":
          case "-p":
            setCurrentPage(currentPage - 1);
            AddConsoleLog([`Switch to playlist page ${currentPage + 1}`]);
            break;
          default:
            if (isNaN(parseFloat(sufix_page))) {
              AddConsoleLog(["Invalid page"]);
              break;
            }
            if (parseInt(sufix_page) > totalPage || parseInt(sufix_page) <= 0) {
              AddConsoleLog(["Page out of range"]);
              break;
            }
            setCurrentPage(parseInt(sufix_page));
            AddConsoleLog([`Switch to playlist page ${sufix_page}`]);
            break;
        }
        break;
      default:
        AddConsoleLog([`Command not found: ${command}`]);
        break;
    }
    store.dispatch(setCommand(""));
  }, [command]);

  // Player control
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
    random: false,
    trackQueue: [],
    currentTrack: null,
    index: 0,
    isEnd: false,
  });
  const [PlayerStateClient, setPlayerStateClient] = useState<PlayerStateClient>(
    {
      volume: 0.5,
      seeking: false,
      isReady: false,
    }
  );
  const [playlist, setPlaylist] = useState<Track[][]>([]);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);

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
    setCurrentPage(Math.min(totalPage, Math.ceil((playerState.index + 1) / 4)));
  }, [playerState.index, totalPage]);

  useEffect(() => {
    const volume = parseFloat(localStorage.getItem("volume") ?? "50");
    setPlayerStateClient((prev) => ({ ...prev, volume: volume / 100 }));
  }, []);

  // API control
  const getVideoInfoAPI = async (videoId: string): Promise<Track> => {
    const data = await fetch(`${hostURL}/api/ytdl?videoId=${videoId}`, {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Error:", error);
        throw error;
      });
    const track: Track = {
      url: data.video_url,
      title: data.title,
      author: data.ownerChannelName,
      img: data.thumbnails[data.thumbnails.length - 1].url,
      requestBy: username,
      id: Date.now(),
    };
    return track;
  };
  const getPlaylistAPI = async (playlistId: string): Promise<Track[]> => {
    const data = await fetch(`${hostURL}/api/ytpl?playlistId=${playlistId}`, {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Error:", error);
        throw error;
      });
    const tracks: Track[] = data.map((item: any, index) => {
      return {
        url: item.shortUrl,
        title: item.title,
        author: item.author.name,
        img: item.thumbnails[item.thumbnails.length - 1].url,
        requestBy: username,
        id: `${index}-${Date.now()}`,
      };
    });
    return tracks;
  };

  return (
    <div className={"layout"}>
      <div className="title-div">
        <p className={"title"}>YT音樂同步撥放器</p>
        <p className={"subtitle"}>
          一個可以同步撥放音樂的網站，讓你和朋友一起聽音樂
        </p>
      </div>
      <div className={"content-div"}>
        <div className={"container2"}>
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
          <div className={styles["player"]}>
            {isClient && playerState && (
              <ReactPlayer
                style={
                  playerState.trackQueue.length > 0 ? {} : { display: "none" }
                }
                ref={player}
                url={playerState.currentTrack?.url ?? ""}
                playing={
                  playerState.trackQueue.length > 0 &&
                  PlayerStateClient.isReady &&
                  !PlayerStateClient.seeking &&
                  playerState.playing
                }
                volume={PlayerStateClient.volume}
                muted={!isAllowedToUnmute}
                loop={playerState.loop}
                playbackRate={playerState.playbackRate}
                controls={false}
                onProgress={(state) => {
                  onProgress(state);
                }}
                onDuration={(duration) => {
                  onDuration(duration);
                }}
                onEnded={() => {
                  onEnd();
                }}
                onError={(error) => {
                  AddConsoleLog([`Error: ${error}`]);
                }}
                onReady={() => {
                  if (PlayerStateClient.isReady) return;
                  Refresh();
                  setPlayerStateClient((prev) => ({
                    ...prev,
                    isReady: true,
                  }));
                }}
                onSeek={() => {
                  setPlayerStateClient((prev) => ({
                    ...prev,
                    seeking: true,
                  }));
                  setTimeout(() => {
                    setPlayerStateClient((prev) => ({
                      ...prev,
                      seeking: false,
                    }));
                  }, 1000);
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
            {playlist[currentPage - 1]?.map((track, index) => (
              <div
                key={index + (currentPage - 1) * 4}
                className={`${styles["track-card"]} ${
                  index + (currentPage - 1) * 4 === playerState.index
                    ? styles["selected"]
                    : ""
                }`}
              >
                <div className={styles["track-info"]}>
                  <img style={{ height: "100%" }} src={track.img} />
                  <div>
                    <p className={styles["track-title"]}>
                      {"#" +
                        (index + (currentPage - 1) * 4) +
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
}
