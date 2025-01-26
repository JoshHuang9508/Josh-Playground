import { configureStore } from "@reduxjs/toolkit";

import consoleContentSlice, { addConsoleContent } from "./consoleContentSlice";
import commandSlice from "./commandSlice";
import userSlice, { setUsername } from "./userSlice";
import hostSlice from "./hostSlice";

const store = configureStore({
  reducer: {
    consoleContent: consoleContentSlice,
    command: commandSlice,
    user: userSlice,
    host: hostSlice,
  },
});

export default store;

export const AddConsoleLog = (message: string[]) => {
  store.dispatch(addConsoleContent(message));
};
export const SetUsername = (username: string) => {
  store.dispatch(setUsername(username));
};
