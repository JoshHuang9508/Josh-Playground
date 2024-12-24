import { configureStore } from "@reduxjs/toolkit";

import consoleContentSlice from "./consoleContentSlice";
import commandSlice from "./commandSlice";
import commandHistorySlice from "./commandHistorySlice";

const store = configureStore({
  reducer: {
    consoleContent: consoleContentSlice,
    command: commandSlice,
    commandHistory: commandHistorySlice,
  },
});

export default store;
