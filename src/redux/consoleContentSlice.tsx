import { createSlice } from "@reduxjs/toolkit";

const consoleContentSlice = createSlice({
  name: "consoleContentSlice",
  initialState: [] as String[],
  reducers: {
    setConsoleContent: (state, action: { payload: String[] }) => {
      return action.payload;
    },
    addConsoleContent: (state, action: { payload: String[] }) => {
      return [...state, ...action.payload, ""];
    },
  },
});

export const { setConsoleContent, addConsoleContent } =
  consoleContentSlice.actions;
export default consoleContentSlice.reducer;
