import { createSlice } from "@reduxjs/toolkit";

const autoCompleteSlice = createSlice({
  name: "autoCompleteSlice",
  initialState: { input: "", availableCommands: [] } as {
    input: string;
    availableCommands: string[];
  },
  reducers: {
    setInput: (state, action: { payload: string }) => {
      return {
        input: action.payload,
        availableCommands: state.availableCommands,
      };
    },
    setAvailableCommands: (state, action: { payload: string[] }) => {
      return { input: state.input, availableCommands: action.payload };
    },
    addAvailableCommands: (state, action: { payload: string[] }) => {
      return {
        input: state.input,
        availableCommands: [...state.availableCommands, ...action.payload],
      };
    },
  },
});

export const { setInput, setAvailableCommands, addAvailableCommands } =
  autoCompleteSlice.actions;
export default autoCompleteSlice.reducer;
