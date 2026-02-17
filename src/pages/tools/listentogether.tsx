import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ReactPlayer from "react-player";
import { io, Socket } from "socket.io-client";

import styles from "@/styles/listentogether.module.css";

import { AddConsoleLog } from "@/redux";

import { PlayerState, Track, PlayerStateClient, User } from "@/lib/types";

import useCommandHandler from "@/hooks/useCommandHandler";

import { API_URL } from "@/constants";

export default function Page() {
  // Refs
  const playerRef = useRef<ReactPlayer>(null);

  // Redux
  const username = useSelector((state: { user: string }) => state.user);

  // States
  const [mute, setMute] = useState(true);
  const [socketInstance, setSocketInstance] = useState<Socket>();
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
  const [PlayerStateClientState, setPlayerStateClient] =
    useState<PlayerStateClient>({
      volume: 0.5,
      seeking: false,
      isReady: false,
    });
  const [logs, setLogs] = useState<string[]>([]);
  const [cachedLogs, setCachedLogs] = useState<string[]>([]);
  const [users, setUsers] = useState<User>({});
  const [cachedUsers, setCachedUsers] = useState<User>({});

  // Functions
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

  const getVideoInfo = async (videoId: string): Promise<Track> => {
    const data = await fetch(`${API_URL}/api/ytdl?videoId=${videoId}`, {
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
        AddConsoleLog(`Error getting video info: ${error}`);
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

  const getPlaylist = async (playlistId: string): Promise<Track[]> => {
    const data = await fetch(`${API_URL}/api/ytpl?playlistId=${playlistId}`, {
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
        AddConsoleLog(`Error getting playlist info: ${error}`);
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

  // Command handler
  useCommandHandler({
    send: (_cmd, args) => {
      const message = args.join(" ") ?? "";
      if (!message) {
        AddConsoleLog("Usage: send [message]");
        return;
      }
      AddConsoleLog(`Send message: ${message}`);
      AddRoomLog(`${username}: ${message}`);
    },
    queue: (_cmd, args, flags) => {
      const URL = args[0] ?? "";
      if (!URL) {
        AddConsoleLog("Usage: queue [video_URL|playlist_URL]");
        return;
      }
      if (!ReactPlayer.canPlay(URL)) {
        AddConsoleLog("Can not play this URL");
        return;
      }
      const updateTrackQueue = async () => {
        if (URL.includes("playlist?list=")) {
          const tracks = await getPlaylist(URL.split("list=")[1]);
          AddTracks(tracks);
          AddConsoleLog(
            `Added ${tracks.length} tracks to queue (#${
              playerState.trackQueue.length
            } ~ #${playerState.trackQueue.length + tracks.length - 1})`,
          );
          AddRoomLog(
            `${username} 在播放清單中新增了 ${tracks.length} 首歌曲 (#${
              playerState.trackQueue.length
            } ~ #${playerState.trackQueue.length + tracks.length - 1})`,
          );
        }
        if (URL.includes("watch?v=")) {
          const track = await getVideoInfo(URL.split("v=")[1]);
          AddTrack(track);
          AddConsoleLog(
            `Added ${track.title} to queue (#${playerState.trackQueue.length})`,
          );
          AddRoomLog(
            `${username} 在播放清單中新增了 ${track.title} (#${playerState.trackQueue.length})`,
          );
        }
      };
      updateTrackQueue();
    },
    remove: (_cmd, args) => {
      const indexToRm = args[0] ?? "";
      if (!indexToRm) {
        AddConsoleLog("Usage: remove [index]");
        return;
      }
      if (indexToRm === "*") {
        SetTrackQueue([]);
        AddConsoleLog("Removed all tracks");
        AddRoomLog(`${username} 移除了所有歌曲`);
        return;
      }
      if (isNaN(parseFloat(indexToRm))) {
        AddConsoleLog("Invalid index");
        return;
      }
      if (parseInt(indexToRm) >= playerState.trackQueue.length) {
        AddConsoleLog("Index out of range");
        return;
      }
      const trackToRm = playerState.trackQueue[parseInt(indexToRm)];
      RemoveTrack(parseInt(indexToRm));
      AddConsoleLog(`Removed track ${indexToRm}`);
      AddRoomLog(`${username} 移除了 ${trackToRm.title} (#${indexToRm})`);
    },
    play: () => {
      Play();
      AddConsoleLog("Start playing...");
      AddRoomLog(`${username} 開始播放`);
    },
    pause: () => {
      Pause();
      AddConsoleLog("Pause playing...");
      AddRoomLog(`${username} 暫停播放`);
    },
    switch: (_cmd, args, flags) => {
      const index = args[0] ?? "";
      if (!index) {
        AddConsoleLog("Usage: switch [index|options]");
        return;
      }
      if (flags.includes("-n") || flags.includes("--next")) {
        NextTrack();
        AddConsoleLog("Switch to next track");
        AddRoomLog(`${username} 切換到下一首歌曲`);
        return;
      }
      if (flags.includes("-p") || flags.includes("--prev")) {
        PrevTrack();
        AddConsoleLog("Switch to previous track");
        AddRoomLog(`${username} 切換到上一首歌曲`);
        return;
      }
      if (isNaN(parseFloat(index))) {
        AddConsoleLog("Invalid index");
        return;
      }
      if (
        parseInt(index) >= playerState.trackQueue.length ||
        parseInt(index) < 0
      ) {
        AddConsoleLog("Index out of range");
        return;
      }
      SetTrackIndex(parseInt(index));
      AddConsoleLog(`Switch to track ${index}`);
      AddRoomLog(`${username} 切換到歌曲 #${index}`);
    },
    volume: (_cmd, args) => {
      const volume = args[0] ?? "";
      if (!volume) {
        AddConsoleLog("Usage: volume [value]");
        return;
      }
      if (isNaN(parseFloat(volume))) {
        AddConsoleLog("Invalid volume");
        return;
      }
      setPlayerStateClient((prev) => ({
        ...prev,
        volume: parseFloat(volume) / 100,
      }));
      localStorage.setItem("volume", volume);
      AddConsoleLog(`Set volume to ${volume}`);
    },
    loop: (_cmd, _args, flags) => {
      if (flags.includes("-t") || flags.includes("--true")) {
        SetLoop(true);
        AddConsoleLog("Loop...");
        AddRoomLog(`${username} 開啟循環播放`);
        return;
      }
      if (flags.includes("-f") || flags.includes("--false")) {
        SetLoop(false);
        AddConsoleLog("Unloop...");
        AddRoomLog(`${username} 關閉循環播放`);
        return;
      }
      AddConsoleLog("Usage: loop [options]");
    },
    random: (_cmd, _args, flags) => {
      if (flags.includes("-t") || flags.includes("--true")) {
        SetPlayerState({ ...playerState, random: true });
        AddConsoleLog("Random...");
        AddRoomLog(`${username} 開啟隨機播放`);
        return;
      }
      if (flags.includes("-f") || flags.includes("--false")) {
        SetPlayerState({ ...playerState, random: false });
        AddConsoleLog("Unrandom...");
        AddRoomLog(`${username} 關閉隨機播放`);
        return;
      }
      AddConsoleLog("Usage: random [options]");
    },
    rate: (_cmd, args) => {
      const rate = args[0] ?? "";
      if (!rate) {
        AddConsoleLog("Usage: rate [value]");
        return;
      }
      if (isNaN(parseFloat(rate))) {
        AddConsoleLog("Invalid rate");
        return;
      }
      SetPlayBackRate(parseFloat(rate) / 100);
      AddConsoleLog(`Set rate to ${rate}%`);
      AddRoomLog(`${username} 設定播放速度為 ${rate}%`);
    },
    seek: (_cmd, args) => {
      const seek = args[0] ?? "";
      if (!seek) {
        AddConsoleLog("Usage: seek [time]");
        return;
      }
      if (isNaN(parseFloat(seek))) {
        AddConsoleLog("Invalid time");
        return;
      }
      if (parseFloat(seek) < 0 || parseFloat(seek) > playerState.duration) {
        AddConsoleLog("Time out of range");
        return;
      }
      Seek(parseFloat(seek));
      AddConsoleLog(`Seek to ${seek}`);
      AddRoomLog(`${username} 跳轉到 ${seek} 秒`);
    },
    refresh: () => {
      Refresh();
      AddConsoleLog("Refresh player...");
      AddRoomLog(`${username} 刷新播放器`);
    },
    playlist: (_cmd, args, flags) => {
      if (flags.includes("-d") || flags.includes("--detail")) {
        AddConsoleLog(
          "Playlist detail:",
          ...playerState.trackQueue.map((track, index) => {
            if (track.id === playerState.currentTrack?.id) {
              return `@#fff700#${index + 1} - ${track.title} by ${track.author} | Requested: ${track.requestBy}`;
            }
            return `#${index + 1} - ${track.title} by ${track.author} | Requested: ${track.requestBy}`;
          }),
        );
      } else {
        AddConsoleLog(
          "Playlist:",
          ...playerState.trackQueue.map((track, index) => {
            if (track.id === playerState.currentTrack?.id) {
              return `@#fff700#${index + 1} - ${track.title}`;
            }
            return `#${index + 1} - ${track.title}`;
          }),
        );
      }
    },
  });

  // Effects
  useEffect(() => {
    const onInteraction = () => {
      if (PlayerStateClientState.isReady) setMute(false);
    };
    document.addEventListener("click", onInteraction);
    document.addEventListener("touchstart", onInteraction);
    return () => {
      document.removeEventListener("click", onInteraction);
      document.removeEventListener("touchstart", onInteraction);
    };
  }, [PlayerStateClientState.isReady]);

  useEffect(() => {
    const socket = io(API_URL, {
      transports: ["websocket"],
    });

    setSocketInstance(socket);

    socket.on("connect", async () => {
      AddConsoleLog(`Connect server success (id: ${socket.id})`);
      socket.emit("join", localStorage.getItem("username") ?? "Anonymous");
      socket.emit("ready");
    });
    socket.on("connect_error", () => {
      AddConsoleLog(`Connect server error (id: ${socket.id})`);
    });
    socket.on("error", (error) => {
      AddConsoleLog(`Connect server error: ${error.message}`);
    });
    socket.on("disconnect", () => {
      AddConsoleLog("Disconnect from server");
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
      if (playerRef.current) playerRef.current.seekTo(time);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    SetUsername(username);
  }, [username]);

  useEffect(() => {
    const volume = parseFloat(localStorage.getItem("volume") ?? "50");
    setPlayerStateClient((prev) => ({ ...prev, volume: volume / 100 }));
  }, []);

  useEffect(() => {
    if (playerState.trackQueue.length === 0) return;
    AddConsoleLog(
      "Playlist updated:",
      ...playerState.trackQueue.map((track, index) => {
        if (track.id === playerState.currentTrack?.id) {
          return `@#fff700#${index + 1} - ${track.title}`;
        }
        return `#${index + 1} - ${track.title}`;
      }),
    );
  }, [playerState.trackQueue]);

  useEffect(() => {
    if (cachedLogs.length === 0) {
      setCachedLogs(logs);
      return;
    }

    const diff = logs.filter((log) => !cachedLogs.includes(log));
    setCachedLogs(logs);

    if (diff.length > 0) {
      AddConsoleLog(
        ...diff.map((log) => `[${new Date().toLocaleTimeString()}] ${log}`),
      );
    }
  }, [logs]);

  useEffect(() => {
    if (Object.keys(cachedUsers).length === 0) {
      setCachedUsers(users);
      return;
    }

    const diff = Object.entries(users).filter(
      ([id]) => !Object.keys(cachedUsers).includes(id),
    );
    setCachedUsers(users);

    if (diff.length > 0) {
      AddConsoleLog(
        ...diff.map(
          ([, user]) =>
            `[${new Date().toLocaleTimeString()}] ${user} joined the room`,
        ),
      );
    }
  }, [users]);

  return (
    <div className={styles["content"]}>
      <div
        className={`${styles["unmute-container"]} ${
          !mute ? styles["active"] : ""
        }`}
      >
        <p className={"header2"}>點我一下</p>
      </div>

      <div className={styles["player-container"]}>
        {playerState && (
          <ReactPlayer
            style={playerState.trackQueue.length > 0 ? {} : { display: "none" }}
            ref={playerRef}
            url={playerState.currentTrack?.url ?? ""}
            playing={
              playerState.trackQueue.length > 0 &&
              PlayerStateClientState.isReady &&
              !PlayerStateClientState.seeking &&
              playerState.playing
            }
            volume={PlayerStateClientState.volume}
            muted={mute}
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
              AddConsoleLog(`Error: ${error}`);
            }}
            onReady={() => {
              if (PlayerStateClientState.isReady) return;
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
  );
}
