import { createSlice } from "@reduxjs/toolkit";

const commandHistorySlice = createSlice({
  name: "commandHistorySlice",
  initialState: [] as string[],
  reducers: {
    addCoomandHistory: (state, action: { payload: string }) => {
      return [action.payload, ...state];
    },
  },
});

export const { addCoomandHistory } = commandHistorySlice.actions;
export default commandHistorySlice.reducer;
