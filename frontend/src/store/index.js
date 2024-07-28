import { configureStore } from '@reduxjs/toolkit';

import roomsReducer from './slices/roomsSlice';
import errorsReducer from './slices/errorsSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    rooms: roomsReducer,
    errors: errorsReducer,
    auth: authReducer,
  },
});
