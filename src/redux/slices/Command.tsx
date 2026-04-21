import { createSlice } from '@reduxjs/toolkit';

const commandSlice = createSlice({
  name: 'commandSlice',
  initialState: '' as string,
  reducers: {
    setCommand: (state, action: { payload: string }) => {
      return action.payload;
    },
  },
});

export const { setCommand } = commandSlice.actions;
export default commandSlice.reducer;
