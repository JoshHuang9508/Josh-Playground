import { createSlice } from "@reduxjs/toolkit";

const autoCompleteSlice = createSlice({
  name: "autoCompleteSlice",
  initialState: { input: "", available: [], index: 0 } as {
    input: string;
    available: string[];
    index: number;
  },
  reducers: {
    setInput: (state, action: { payload: string }) => {
      return {
        input: action.payload,
        available: state.available,
        index: state.index,
      };
    },
    setAvailable: (state, action: { payload: string[] }) => {
      return { input: state.input, available: action.payload, index: 0 };
    },
    addAvailable: (state, action: { payload: string[] }) => {
      return {
        input: state.input,
        available: [...state.available, ...action.payload],
        index: state.index,
      };
    },
    setIndex: (state, action: { payload: number }) => {
      return {
        input: state.input,
        available: state.available,
        index: action.payload,
      };
    },
  },
});

export const { setInput, setAvailable, addAvailable, setIndex } =
  autoCompleteSlice.actions;
export default autoCompleteSlice.reducer;
