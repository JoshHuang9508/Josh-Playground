import { createSlice } from "@reduxjs/toolkit";

const commandHistorySlice = createSlice({
  name: "commandHistorySlice",
  initialState: [] as String[],
  reducers: {
    addCoomandHistory: (state, action: { payload: String }) => {
      return [action.payload, ...state];
    },
  },
});

export const { addCoomandHistory } = commandHistorySlice.actions;
export default commandHistorySlice.reducer;
