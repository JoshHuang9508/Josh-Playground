import { createSlice } from "@reduxjs/toolkit";

const commandSlice = createSlice({
  name: "commandSlice",
  initialState: "" as String,
  reducers: {
    setCommand: (state, action: { payload: String }) => {
      return action.payload;
    },
  },
});

export const { setCommand } = commandSlice.actions;
export default commandSlice.reducer;
