import { createSlice } from "@reduxjs/toolkit";

const hostSlice = createSlice({
  name: "hostSlice",
  initialState: "https://6100-36-50-249-80.ngrok-free.app" as string,
  reducers: {},
});

export const {} = hostSlice.actions;
export default hostSlice.reducer;