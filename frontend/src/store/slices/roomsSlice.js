import { createSlice } from '@reduxjs/toolkit';

const initialState = { value: [] };

export const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    setRooms: (state, action) => {
      state.value = action.payload;
    },
    addRoom: (state, action) => {
      state.value.unshift(action.payload);
    },
    removeRoom: (state, action) => {
      const index = state.indexOf(action.payload);
      if (index > -1) {
        state.value.splice(index, 1);
      }
    },
  },
});

export const { setRooms, addRoom, removeRoom } = roomsSlice.actions;
export default roomsSlice.reducer;
