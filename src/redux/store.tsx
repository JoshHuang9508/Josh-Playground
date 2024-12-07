import { configureStore } from "@reduxjs/toolkit";

import consoleContentSlice from "./consoleContentSlice";
import commandSlice from "./commandSlice";

const store = configureStore({
  reducer: {
    consoleContent: consoleContentSlice,
    command: commandSlice,
  },
});

export default store;
