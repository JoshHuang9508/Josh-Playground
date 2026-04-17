import { io, Socket } from 'socket.io-client';

import type * as Types from '@/lib/types';

import { API_URL } from '@/lib/constants';

export default class ListenTogetherSocket {
  private socket: Socket;

  public id: string | undefined;

  constructor() {
    this.socket = io(API_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    this.id = this.socket.id;
  }

  connect(eventHandlers: {
    onConnect: () => void;
    onConnectError: () => void;
    onError: (error: any) => void;
    onDisconnect: () => void;
    onPlayerState: (state: Types.PlayerState) => void;
    onLogs: (logs: any) => void;
    onUsers: (users: Types.User) => void;
    onSeek: (time: number) => void;
  }) {
    this.socket.connect();
    this.socket.on('connect', eventHandlers.onConnect);
    this.socket.on('connect_error', eventHandlers.onConnectError);
    this.socket.on('error', eventHandlers.onError);
    this.socket.on('disconnect', eventHandlers.onDisconnect);
    this.socket.on('player:player_state', eventHandlers.onPlayerState);
    this.socket.on('player:logs', eventHandlers.onLogs);
    this.socket.on('player:users', eventHandlers.onUsers);
    this.socket.on('player:seek', eventHandlers.onSeek);
  }

  disconnect() {
    this.socket.disconnect();
  }

  join = (username: string) => {
    this.socket.emit('player:join', username);
  };

  ready = () => {
    this.socket.emit('player:ready');
  };

  setUsername = (username: string) => {
    this.socket.emit('player:set_username', username);
  };

  addRoomLog = (log: string) => {
    this.socket.emit('player:add_log', log);
  };

  setPlayerState = (state: Types.PlayerState) => {
    this.socket.emit('player:set_player_state', state);
  };

  onDuration = (duration: number) => {
    this.socket.emit('player:duration', duration);
  };

  onProgress = (state: any) => {
    this.socket.emit('player:progress', state);
  };

  onEnded = () => {
    this.socket.emit('player:ended');
  };

  play = () => {
    this.socket.emit('player:play');
  };

  pause = () => {
    this.socket.emit('player:pause');
  };

  refresh = () => {
    this.socket.emit('player:refresh');
  };

  addTrack = (track: Types.Track) => {
    this.socket.emit('player:add_track', track);
  };

  addTracks = (tracks: Types.Track[]) => {
    this.socket.emit('player:add_tracks', tracks);
  };

  removeTrack = (index: number) => {
    this.socket.emit('player:remove_track', index);
  };

  setTrackQueue = (queue: Types.Track[]) => {
    this.socket.emit('player:set_track_queue', queue);
  };

  nextTrack = () => {
    this.socket.emit('player:next_track');
  };

  prevTrack = () => {
    this.socket.emit('player:prev_track');
  };

  setTrackIndex = (index: number) => {
    this.socket.emit('player:set_track_index', index);
  };

  setPlayBackRate = (rate: number) => {
    this.socket.emit('player:set_playback_rate', rate);
  };

  setLoop = (loop: boolean) => {
    this.socket.emit('player:set_loop', loop);
  };

  seek = (time: number) => {
    this.socket.emit('player:seek', time);
  };
}
