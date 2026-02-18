import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ReactPlayer from "react-player";

import styles from "@/styles/listentogether.module.css";

import { AddConsoleLog } from "@/redux";

import { PlayerState, Track, PlayerStateClient, User } from "@/lib/types";

import useCommandHandler from "@/hooks/useCommandHandler";

import { API_URL } from "@/constants";

import { IDiffArray, IDiffObject } from "@/utils";
import ListenTogetherSocket from "@/socket";

export default function ListenTogetherView() {
  // Refs
  const playerRef = useRef<ReactPlayer>(null);

  // Redux
  const username = useSelector((state: { user: string }) => state.user);

  // States
  const [mute, setMute] = useState(true);
  const [socketInstance, setSocketInstance] =
    useState<ListenTogetherSocket | null>(null);
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
  const [cachedPlayerState, setCachedPlayerState] =
    useState<PlayerState | null>(null);
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

  // Handlers
  const handlePlayerEnded = () => {
    socketInstance?.onEnded();
  };

  const handlePlayerProgress = (state: PlayerState) => {
    socketInstance?.onProgress(state);
  };

  const handlePlayerDuration = (duration: number) => {
    socketInstance?.onDuration(duration);
  };

  const handlePlayerError = (error: any) => {
    AddConsoleLog(`Error: ${error}`);
  };

  const handlePlayerReady = () => {
    if (PlayerStateClientState.isReady) return;
    socketInstance?.refresh();
    setPlayerStateClient((prev) => ({
      ...prev,
      isReady: true,
    }));
  };

  const handlePlayerSeek = () => {
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
  };

  // Command handler
  useCommandHandler({
    send: (_cmd, args) => {
      const message = args.join(" ") ?? "";
      if (!message) {
        AddConsoleLog("Usage: send [message]");
        return;
      } else {
        socketInstance?.addRoomLog(`${username}: ${message}`);
        return;
      }
    },
    queue: async (_cmd, args, flags) => {
      const URL = args[0] ?? "";
      if (!URL) {
        AddConsoleLog("Usage: queue [video_URL|playlist_URL]");
        return;
      } else if (!ReactPlayer.canPlay(URL)) {
        AddConsoleLog("Can not play this URL");
        return;
      } else if (URL.includes("playlist?list=")) {
        const tracks = await getPlaylist(URL.split("list=")[1]);
        socketInstance?.addTracks(tracks);
        AddConsoleLog(
          `Added ${tracks.length} tracks to queue (#${
            playerState.trackQueue.length
          } ~ #${playerState.trackQueue.length + tracks.length - 1})`,
        );
        socketInstance?.addRoomLog(
          `${username} 在播放清單中新增了 ${tracks.length} 首歌曲 (#${
            playerState.trackQueue.length
          } ~ #${playerState.trackQueue.length + tracks.length - 1})`,
        );
        return;
      } else if (URL.includes("watch?v=")) {
        const track = await getVideoInfo(URL.split("v=")[1]);
        socketInstance?.addTrack(track);
        AddConsoleLog(
          `Added ${track.title} to queue (#${playerState.trackQueue.length})`,
        );
        socketInstance?.addRoomLog(
          `${username} 在播放清單中新增了 ${track.title} (#${playerState.trackQueue.length})`,
        );
        return;
      } else {
        AddConsoleLog("Invalid URL");
        return;
      }
    },
    remove: (_cmd, args) => {
      const indexToRm = args[0] ?? "";
      if (!indexToRm) {
        AddConsoleLog("Usage: remove [index]");
        return;
      } else if (indexToRm === "*") {
        socketInstance?.setTrackQueue([]);
        AddConsoleLog("Removed all tracks");
        socketInstance?.addRoomLog(`${username} 移除了所有歌曲`);
        return;
      } else if (isNaN(parseFloat(indexToRm))) {
        AddConsoleLog("Invalid index");
        return;
      } else if (parseInt(indexToRm) >= playerState.trackQueue.length) {
        AddConsoleLog("Index out of range");
        return;
      } else {
        const trackToRm = playerState.trackQueue[parseInt(indexToRm)];
        socketInstance?.removeTrack(parseInt(indexToRm));
        AddConsoleLog(`Removed track ${indexToRm}`);
        socketInstance?.addRoomLog(
          `${username} 移除了 ${trackToRm.title} (#${indexToRm})`,
        );
        return;
      }
    },
    play: () => {
      socketInstance?.play();
      AddConsoleLog("Start playing...");
      socketInstance?.addRoomLog(`${username} 開始播放`);
      return;
    },
    pause: () => {
      socketInstance?.pause();
      AddConsoleLog("Pause playing...");
      socketInstance?.addRoomLog(`${username} 暫停播放`);
      return;
    },
    switch: (_cmd, args, flags) => {
      const index = args[0] ?? "";
      if (!index) {
        AddConsoleLog("Usage: switch [index|options]");
        return;
      } else if (flags.includes("-n") || flags.includes("--next")) {
        socketInstance?.nextTrack();
        AddConsoleLog("Switch to next track");
        socketInstance?.addRoomLog(`${username} 切換到下一首歌曲`);
        return;
      } else if (flags.includes("-p") || flags.includes("--prev")) {
        socketInstance?.prevTrack();
        AddConsoleLog("Switch to previous track");
        socketInstance?.addRoomLog(`${username} 切換到上一首歌曲`);
        return;
      } else if (isNaN(parseFloat(index))) {
        AddConsoleLog("Invalid index");
        return;
      } else if (
        parseInt(index) >= playerState.trackQueue.length ||
        parseInt(index) < 0
      ) {
        AddConsoleLog("Index out of range");
        return;
      } else {
        socketInstance?.setTrackIndex(parseInt(index));
        AddConsoleLog(`Switch to track ${index}`);
        socketInstance?.addRoomLog(`${username} 切換到歌曲 #${index}`);
        return;
      }
    },
    volume: (_cmd, args) => {
      const volume = args[0] ?? "";
      if (!volume) {
        AddConsoleLog("Usage: volume [value]");
        return;
      } else if (isNaN(parseFloat(volume))) {
        AddConsoleLog("Invalid volume");
        return;
      } else {
        setPlayerStateClient((prev) => ({
          ...prev,
          volume: parseFloat(volume) / 100,
        }));
        localStorage.setItem("volume", volume);
        AddConsoleLog(`Set volume to ${volume}`);
        return;
      }
    },
    loop: (_cmd, _args, flags) => {
      if (flags.includes("-t") || flags.includes("--true")) {
        socketInstance?.setLoop(true);
        AddConsoleLog("Loop...");
        socketInstance?.addRoomLog(`${username} 開啟循環播放`);
        return;
      } else if (flags.includes("-f") || flags.includes("--false")) {
        socketInstance?.setLoop(false);
        AddConsoleLog("Unloop...");
        socketInstance?.addRoomLog(`${username} 關閉循環播放`);
        return;
      } else {
        AddConsoleLog("Usage: loop [options]");
        return;
      }
    },
    random: (_cmd, _args, flags) => {
      if (flags.includes("-t") || flags.includes("--true")) {
        socketInstance?.setPlayerState({ ...playerState, random: true });
        AddConsoleLog("Random...");
        socketInstance?.addRoomLog(`${username} 開啟隨機播放`);
        return;
      } else if (flags.includes("-f") || flags.includes("--false")) {
        socketInstance?.setPlayerState({ ...playerState, random: false });
        AddConsoleLog("Unrandom...");
        socketInstance?.addRoomLog(`${username} 關閉隨機播放`);
        return;
      } else {
        AddConsoleLog("Usage: random [options]");
        return;
      }
    },
    rate: (_cmd, args) => {
      const rate = args[0] ?? "";
      if (!rate) {
        AddConsoleLog("Usage: rate [value]");
        return;
      } else if (isNaN(parseFloat(rate))) {
        AddConsoleLog("Invalid rate");
        return;
      } else {
        socketInstance?.setPlayBackRate(parseFloat(rate) / 100);
        AddConsoleLog(`Set rate to ${rate}%`);
        socketInstance?.addRoomLog(`${username} 設定播放速度為 ${rate}%`);
        return;
      }
    },
    seek: (_cmd, args) => {
      const seek = args[0] ?? "";
      if (!seek) {
        AddConsoleLog("Usage: seek [time]");
        return;
      } else if (isNaN(parseFloat(seek))) {
        AddConsoleLog("Invalid time");
        return;
      } else if (
        parseFloat(seek) < 0 ||
        parseFloat(seek) > playerState.duration
      ) {
        AddConsoleLog("Time out of range");
        return;
      } else {
        socketInstance?.seek(parseFloat(seek));
        AddConsoleLog(`Seek to ${seek}`);
        socketInstance?.addRoomLog(`${username} 跳轉到 ${seek} 秒`);
        return;
      }
    },
    refresh: () => {
      socketInstance?.refresh();
      AddConsoleLog("Refresh player...");
      socketInstance?.addRoomLog(`${username} 刷新播放器`);
      return;
    },
    playlist: (_cmd, _args, flags) => {
      if (flags.includes("-d") || flags.includes("--detail")) {
        AddConsoleLog(
          "Playlist detail:",
          ...playerState.trackQueue.map((track, index) => {
            if (track.id === playerState.currentTrack?.id) {
              return `@#fff700#${index} - ${track.title} by ${track.author} | Requested: ${track.requestBy}`;
            }
            return `#${index} - ${track.title} by ${track.author} | Requested: ${track.requestBy}`;
          }),
        );
        return;
      } else {
        AddConsoleLog(
          "Playlist:",
          ...playerState.trackQueue.map((track, index) => {
            if (track.id === playerState.currentTrack?.id) {
              return `@#fff700#${index} - ${track.title}`;
            }
            return `#${index} - ${track.title}`;
          }),
        );
        return;
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
    const socket = new ListenTogetherSocket();

    socket.connect({
      connect: async () => {
        socket.join(localStorage.getItem("username") ?? "Anonymous");
        socket.ready();
      },
      connect_error: () => {
        AddConsoleLog(`Connect server error (id: ${socket.id})`);
      },
      error: (error) => {
        AddConsoleLog(`Connect server error: ${error.message}`);
      },
      disconnect: () => {
        AddConsoleLog("Disconnect from server");
      },
      receivePlayerState: (state) => {
        setPlayerState((prev) => ({ ...prev, ...state }));
      },
      receiveLog: (logs) => {
        setLogs(logs);
      },
      receiveUsers: (users) => {
        setUsers(users);
      },
      seek: (time) => {
        if (playerRef.current) playerRef.current.seekTo(time);
      },
    });

    setSocketInstance(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    socketInstance?.setUsername(username);
  }, [username]);

  useEffect(() => {
    const volume = parseFloat(localStorage.getItem("volume") ?? "50");
    setPlayerStateClient((prev) => ({ ...prev, volume: volume / 100 }));
  }, []);

  useEffect(() => {
    if (cachedPlayerState === null) {
      setCachedPlayerState(playerState);
      return;
    }

    const trackQueueDiff = IDiffArray(
      playerState.trackQueue,
      cachedPlayerState.trackQueue,
    );
    const currentTrackDiff = IDiffObject(
      playerState.currentTrack,
      cachedPlayerState.currentTrack,
    );
    setCachedPlayerState(playerState);

    if (trackQueueDiff || currentTrackDiff) {
      AddConsoleLog(
        "Playlist updated:",
        ...playerState.trackQueue.map((track, index) => {
          if (track.id === playerState.currentTrack?.id) {
            return `@#fff700#${index} - ${track.title}`;
          }
          return `#${index} - ${track.title}`;
        }),
      );
    }
  }, [playerState.trackQueue, playerState.currentTrack]);

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
        <p className={"header2"}>{`點我一下`}</p>
      </div>

      <div tabIndex={-1} className={styles["player-container"]}>
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
            onProgress={handlePlayerProgress}
            onDuration={handlePlayerDuration}
            onEnded={handlePlayerEnded}
            onError={handlePlayerError}
            onReady={handlePlayerReady}
            onSeek={handlePlayerSeek}
            width="100%"
            height="100%"
          />
        )}
      </div>
    </div>
  );
}

