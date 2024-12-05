import { configureStore } from "@reduxjs/toolkit";

import consoleContentSlice from "./consoleContentSlice";

const store = configureStore({
  reducer: {
    consoleContent: consoleContentSlice,
  },
});

export default store;
