import { io, Socket } from 'socket.io-client';

import { PlayerState, Track, User } from '@/lib/types';

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
    connect: () => void;
    connect_error: () => void;
    error: (error: any) => void;
    disconnect: () => void;
    receivePlayerState: (state: PlayerState) => void;
    receiveLog: (logs: any) => void;
    receiveUsers: (users: User) => void;
    seek: (time: number) => void;
  }) {
    this.socket.connect();
    this.socket.on('connect', eventHandlers.connect);
    this.socket.on('connect_error', eventHandlers.connect_error);
    this.socket.on('error', eventHandlers.error);
    this.socket.on('disconnect', eventHandlers.disconnect);
    this.socket.on('receivePlayerState', eventHandlers.receivePlayerState);
    this.socket.on('receiveLog', eventHandlers.receiveLog);
    this.socket.on('receiveUsers', eventHandlers.receiveUsers);
    this.socket.on('seek', eventHandlers.seek);
  }

  disconnect() {
    this.socket.disconnect();
  }

  join = (username: string) => {
    this.socket.emit('join', username);
  };

  ready = () => {
    this.socket.emit('ready');
  };

  setUsername = (username: string) => {
    this.socket.emit('setUsername', username);
  };

  addRoomLog = (log: string) => {
    this.socket.emit('addLog', log);
  };

  setPlayerState = (state: PlayerState) => {
    this.socket.emit('setPlayerState', state);
  };

  onDuration = (duration: number) => {
    this.socket.emit('onDuration', duration);
  };

  onProgress = (state: any) => {
    this.socket.emit('onProgress', state);
  };

  onEnded = () => {
    this.socket.emit('onEnd');
  };

  play = () => {
    this.socket.emit('play');
  };

  pause = () => {
    this.socket.emit('pause');
  };

  refresh = () => {
    this.socket.emit('refresh');
  };

  addTrack = (track: Track) => {
    this.socket.emit('addTrack', track);
  };

  addTracks = (tracks: Track[]) => {
    this.socket.emit('addTracks', tracks);
  };

  removeTrack = (index: number) => {
    this.socket.emit('removeTrack', index);
  };

  setTrackQueue = (queue: Track[]) => {
    this.socket.emit('setTrackQueue', queue);
  };

  nextTrack = () => {
    this.socket.emit('nextTrack');
  };

  prevTrack = () => {
    this.socket.emit('prevTrack');
  };

  setTrackIndex = (index: number) => {
    this.socket.emit('setTrackIndex', index);
  };

  setPlayBackRate = (rate: number) => {
    this.socket.emit('setPlaybackRate', rate);
  };

  setLoop = (loop: boolean) => {
    this.socket.emit('setLoop', loop);
  };

  seek = (time: number) => {
    this.socket.emit('seek', time);
  };
}
