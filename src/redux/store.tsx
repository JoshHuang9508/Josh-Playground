import { configureStore } from "@reduxjs/toolkit";

import consoleContentSlice from "./consoleContentSlice";
import commandSlice from "./commandSlice";
import commandHistorySlice from "./commandHistorySlice";
import autoCompleteSlice from "./autoCompleteSlice";

const store = configureStore({
  reducer: {
    consoleContent: consoleContentSlice,
    command: commandSlice,
    commandHistory: commandHistorySlice,
    autoComplete: autoCompleteSlice,
  },
});

export default store;
