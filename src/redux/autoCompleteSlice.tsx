import { createSlice } from "@reduxjs/toolkit";

const autoCompleteSlice = createSlice({
  name: "autoCompleteSlice",
  initialState: { input: "", available: [] } as {
    input: string;
    available: string[];
  },
  reducers: {
    setInput: (state, action: { payload: string }) => {
      return {
        input: action.payload,
        available: state.available,
      };
    },
    setAvailable: (state, action: { payload: string[] }) => {
      return { input: state.input, available: action.payload };
    },
    addAvailable: (state, action: { payload: string[] }) => {
      return {
        input: state.input,
        available: [...state.available, ...action.payload],
      };
    },
  },
});

export const { setInput, setAvailable, addAvailable } =
  autoCompleteSlice.actions;
export default autoCompleteSlice.reducer;
