import { configureStore } from '@reduxjs/toolkit';

import commandSlice, { setCommand } from './slices/Command';
import userSlice, { setUsername } from './slices/User';

import { emitConsoleLog } from '@/lib/consoleLog';

const store = configureStore({
  reducer: {
    command: commandSlice,
    user: userSlice,
  },
});

export default store;

export const AddConsoleLog = (...messages: string[]) => {
  emitConsoleLog(...messages);
};

export const SetCommand = (command: string) => {
  store.dispatch(setCommand(command));
};

export const SetUsername = (username: string) => {
  store.dispatch(setUsername(username));
};
