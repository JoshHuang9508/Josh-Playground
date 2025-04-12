import { createSlice } from "@reduxjs/toolkit";

const hostSlice = createSlice({
  name: "hostSlice",
  initialState: "https://a1d9-2001-df2-45c1-75-00-1.ngrok-free.app" as string,
  reducers: {},
});

export const {} = hostSlice.actions;
export default hostSlice.reducer;
