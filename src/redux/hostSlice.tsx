import { createSlice } from "@reduxjs/toolkit";

const hostSlice = createSlice({
  name: "hostSlice",
  initialState: process.env.SERVER_URL || ("http://localhost:3000" as string),
  reducers: {},
});

export const {} = hostSlice.actions;
export default hostSlice.reducer;
