import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "userSlice",
  initialState: "Annonymous" as String,
  reducers: {
    setUsername: (state, action: { payload: String }) => {
      return action.payload;
    },
  },
});

export const { setUsername } = userSlice.actions;
export default userSlice.reducer;
