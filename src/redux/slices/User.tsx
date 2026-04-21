import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'userSlice',
  initialState: 'Annonymous' as string,
  reducers: {
    setUsername: (state, action: { payload: string }) => {
      return action.payload;
    },
  },
});

export const { setUsername } = userSlice.actions;
export default userSlice.reducer;
