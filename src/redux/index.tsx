import { configureStore } from '@reduxjs/toolkit';

import commandSlice from './slices/Command';
import userSlice from './slices/User';

const store = configureStore({
  reducer: {
    command: commandSlice,
    user: userSlice,
  },
});

export default store;
