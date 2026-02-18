import { configureStore } from "@reduxjs/toolkit";

import commandSlice from "./commandSlice";
import userSlice, { setUsername } from "./userSlice";

import { emitConsoleLog } from "@/lib/consoleLog";

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
export const SetUsername = (username: string) => {
  store.dispatch(setUsername(username));
};
