import { createSlice } from '@reduxjs/toolkit';

const terminalContentSlice = createSlice({
  name: 'terminalContentSlice',
  initialState: [] as string[],
  reducers: {
    setTerminalContent: (state, action: { payload: string[] }) => {
      return action.payload;
    },
    addTerminalContent: (state, action: { payload: string[] }) => {
      return [...state, ...action.payload];
    },
  },
});

export const { setTerminalContent, addTerminalContent } = terminalContentSlice.actions;
export default terminalContentSlice.reducer;
