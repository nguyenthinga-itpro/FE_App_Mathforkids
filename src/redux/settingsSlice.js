import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: 1,
  mode: null,
  language: "en",
  volume: 100,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setMode: (state, action) => {
      state.mode = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    setVolume: (state, action) => {
      state.volume = action.payload;
    },
  },
});

export const { setTheme, setMode, setLanguage, setVolume } =
  settingsSlice.actions;
export default settingsSlice.reducer;
