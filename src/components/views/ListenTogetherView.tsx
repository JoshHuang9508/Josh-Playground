import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ReactPlayer from "react-player";

import styles from "@/styles/listentogether.module.css";

import { AddConsoleLog } from "@/redux";

import { PlayerState, Track, PlayerStateClient, User } from "@/lib/types";

import useCommandHandler from "@/hooks/useCommandHandler";

import { API_URL } from "@/constants";
import { t } from "@/lib/i18n";

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
        AddConsoleLog(t("listentogether.errors.getVideoInfo", String(error)));
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
        AddConsoleLog(t("listentogether.errors.getPlaylist", String(error)));
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
    AddConsoleLog(t("listentogether.errors.playerError", String(error)));
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
        AddConsoleLog(t("listentogether.commands.send.usage"));
        return;
      } else {
        socketInstance?.addRoomLog(`${username}: ${message}`);
        return;
      }
    },
    queue: async (_cmd, args, flags) => {
      const URL = args[0] ?? "";
      if (!URL) {
        AddConsoleLog(t("listentogether.commands.queue.usage"));
        return;
      } else if (!ReactPlayer.canPlay(URL)) {
        AddConsoleLog(t("listentogether.commands.queue.cannotPlay"));
        return;
      } else if (URL.includes("playlist?list=")) {
        const tracks = await getPlaylist(URL.split("list=")[1]);
        socketInstance?.addTracks(tracks);
        AddConsoleLog(
          t(
            "listentogether.commands.queue.addedTracks",
            String(tracks.length),
            String(playerState.trackQueue.length),
            String(playerState.trackQueue.length + tracks.length - 1),
          ),
        );
        socketInstance?.addRoomLog(
          t(
            "listentogether.logs.addedTracks",
            username,
            String(tracks.length),
            String(playerState.trackQueue.length),
            String(playerState.trackQueue.length + tracks.length - 1),
          ),
        );
        return;
      } else if (URL.includes("watch?v=")) {
        const track = await getVideoInfo(URL.split("v=")[1]);
        socketInstance?.addTrack(track);
        AddConsoleLog(
          t(
            "listentogether.commands.queue.addedTrack",
            track.title,
            String(playerState.trackQueue.length),
          ),
        );
        socketInstance?.addRoomLog(
          t(
            "listentogether.logs.addedTrack",
            username,
            track.title,
            String(playerState.trackQueue.length),
          ),
        );
        return;
      } else {
        AddConsoleLog(t("listentogether.commands.queue.invalidUrl"));
        return;
      }
    },
    remove: (_cmd, args) => {
      const indexToRm = args[0] ?? "";
      if (!indexToRm) {
        AddConsoleLog(t("listentogether.commands.remove.usage"));
        return;
      } else if (indexToRm === "*") {
        socketInstance?.setTrackQueue([]);
        AddConsoleLog(t("listentogether.commands.remove.removedAll"));
        socketInstance?.addRoomLog(
          t("listentogether.logs.removedAll", username),
        );
        return;
      } else if (isNaN(parseFloat(indexToRm))) {
        AddConsoleLog(t("listentogether.commands.remove.invalidIndex"));
        return;
      } else if (parseInt(indexToRm) >= playerState.trackQueue.length) {
        AddConsoleLog(t("listentogether.commands.remove.indexOutOfRange"));
        return;
      } else {
        const trackToRm = playerState.trackQueue[parseInt(indexToRm)];
        socketInstance?.removeTrack(parseInt(indexToRm));
        AddConsoleLog(t("listentogether.commands.remove.removed", indexToRm));
        socketInstance?.addRoomLog(
          t(
            "listentogether.logs.removedTrack",
            username,
            trackToRm.title,
            indexToRm,
          ),
        );
        return;
      }
    },
    play: () => {
      socketInstance?.play();
      AddConsoleLog(t("listentogether.commands.play.start"));
      socketInstance?.addRoomLog(t("listentogether.logs.play", username));
      return;
    },
    pause: () => {
      socketInstance?.pause();
      AddConsoleLog(t("listentogether.commands.pause.pause"));
      socketInstance?.addRoomLog(t("listentogether.logs.pause", username));
      return;
    },
    switch: (_cmd, args, flags) => {
      const index = args[0] ?? "";
      if (!index) {
        AddConsoleLog(t("listentogether.commands.switch.usage"));
        return;
      } else if (flags.includes("-n") || flags.includes("--next")) {
        socketInstance?.nextTrack();
        AddConsoleLog(t("listentogether.commands.switch.next"));
        socketInstance?.addRoomLog(
          t("listentogether.logs.switchNext", username),
        );
        return;
      } else if (flags.includes("-p") || flags.includes("--prev")) {
        socketInstance?.prevTrack();
        AddConsoleLog(t("listentogether.commands.switch.prev"));
        socketInstance?.addRoomLog(
          t("listentogether.logs.switchPrev", username),
        );
        return;
      } else if (isNaN(parseFloat(index))) {
        AddConsoleLog(t("listentogether.commands.switch.invalidIndex"));
        return;
      } else if (
        parseInt(index) >= playerState.trackQueue.length ||
        parseInt(index) < 0
      ) {
        AddConsoleLog(t("listentogether.commands.switch.indexOutOfRange"));
        return;
      } else {
        socketInstance?.setTrackIndex(parseInt(index));
        AddConsoleLog(t("listentogether.commands.switch.switchTo", index));
        socketInstance?.addRoomLog(
          t("listentogether.logs.switchTo", username, index),
        );
        return;
      }
    },
    volume: (_cmd, args) => {
      const volume = args[0] ?? "";
      if (!volume) {
        AddConsoleLog(t("listentogether.commands.volume.usage"));
        return;
      } else if (isNaN(parseFloat(volume))) {
        AddConsoleLog(t("listentogether.commands.volume.invalid"));
        return;
      } else {
        setPlayerStateClient((prev) => ({
          ...prev,
          volume: parseFloat(volume) / 100,
        }));
        localStorage.setItem("volume", volume);
        AddConsoleLog(t("listentogether.commands.volume.set", volume));
        return;
      }
    },
    loop: (_cmd, _args, flags) => {
      if (flags.includes("-t") || flags.includes("--true")) {
        socketInstance?.setLoop(true);
        AddConsoleLog(t("listentogether.commands.loop.on"));
        socketInstance?.addRoomLog(t("listentogether.logs.loopOn", username));
        return;
      } else if (flags.includes("-f") || flags.includes("--false")) {
        socketInstance?.setLoop(false);
        AddConsoleLog(t("listentogether.commands.loop.off"));
        socketInstance?.addRoomLog(t("listentogether.logs.loopOff", username));
        return;
      } else {
        AddConsoleLog(t("listentogether.commands.loop.usage"));
        return;
      }
    },
    random: (_cmd, _args, flags) => {
      if (flags.includes("-t") || flags.includes("--true")) {
        socketInstance?.setPlayerState({ ...playerState, random: true });
        AddConsoleLog(t("listentogether.commands.random.on"));
        socketInstance?.addRoomLog(t("listentogether.logs.randomOn", username));
        return;
      } else if (flags.includes("-f") || flags.includes("--false")) {
        socketInstance?.setPlayerState({ ...playerState, random: false });
        AddConsoleLog(t("listentogether.commands.random.off"));
        socketInstance?.addRoomLog(
          t("listentogether.logs.randomOff", username),
        );
        return;
      } else {
        AddConsoleLog(t("listentogether.commands.random.usage"));
        return;
      }
    },
    rate: (_cmd, args) => {
      const rate = args[0] ?? "";
      if (!rate) {
        AddConsoleLog(t("listentogether.commands.rate.usage"));
        return;
      } else if (isNaN(parseFloat(rate))) {
        AddConsoleLog(t("listentogether.commands.rate.invalid"));
        return;
      } else {
        socketInstance?.setPlayBackRate(parseFloat(rate) / 100);
        AddConsoleLog(t("listentogether.commands.rate.set", rate));
        socketInstance?.addRoomLog(
          t("listentogether.logs.rate", username, rate),
        );
        return;
      }
    },
    seek: (_cmd, args) => {
      const seek = args[0] ?? "";
      if (!seek) {
        AddConsoleLog(t("listentogether.commands.seek.usage"));
        return;
      } else if (isNaN(parseFloat(seek))) {
        AddConsoleLog(t("listentogether.commands.seek.invalid"));
        return;
      } else if (
        parseFloat(seek) < 0 ||
        parseFloat(seek) > playerState.duration
      ) {
        AddConsoleLog(t("listentogether.commands.seek.outOfRange"));
        return;
      } else {
        socketInstance?.seek(parseFloat(seek));
        AddConsoleLog(t("listentogether.commands.seek.seekTo", seek));
        socketInstance?.addRoomLog(
          t("listentogether.logs.seek", username, seek),
        );
        return;
      }
    },
    refresh: () => {
      socketInstance?.refresh();
      AddConsoleLog(t("listentogether.commands.refresh.message"));
      socketInstance?.addRoomLog(t("listentogether.logs.refresh", username));
      return;
    },
    playlist: (_cmd, _args, flags) => {
      if (flags.includes("-d") || flags.includes("--detail")) {
        AddConsoleLog(
          t("listentogether.commands.playlist.detail"),
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
          t("listentogether.commands.playlist.list"),
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
        socket.join(
          localStorage.getItem("username") ?? t("global.defaultUsername"),
        );
        socket.ready();
      },
      connect_error: () => {
        AddConsoleLog(
          t("listentogether.errors.connectError", String(socket.id)),
        );
      },
      error: (error) => {
        AddConsoleLog(t("listentogether.errors.serverError", error.message));
      },
      disconnect: () => {
        AddConsoleLog(t("listentogether.errors.disconnect"));
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
        t("listentogether.logs.playlistUpdated"),
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
            `[${new Date().toLocaleTimeString()}] ${t("listentogether.logs.joined", user)}`,
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
        <p className={"header2"}>{t("listentogether.unmute")}</p>
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
