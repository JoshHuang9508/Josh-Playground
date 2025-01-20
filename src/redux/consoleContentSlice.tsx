import { createSlice } from "@reduxjs/toolkit";

const consoleContentSlice = createSlice({
  name: "consoleContentSlice",
  initialState: [] as string[],
  reducers: {
    setConsoleContent: (state, action: { payload: string[] }) => {
      return action.payload;
    },
    addConsoleContent: (state, action: { payload: string[] }) => {
      return [...state, ...action.payload];
    },
  },
});

export const { setConsoleContent, addConsoleContent } =
  consoleContentSlice.actions;
export default consoleContentSlice.reducer;
