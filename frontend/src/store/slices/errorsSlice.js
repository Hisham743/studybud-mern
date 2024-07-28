import { createSlice } from '@reduxjs/toolkit';

const initialState = { value: [] };

export const errorsSlice = createSlice({
  name: 'errors',
  initialState,
  reducers: {
    setErrors: (state, action) => {
      state.value = action.payload;
    },
    addError: (state, action) => {
      state.value.unshift(action.payload);
    },
  },
});

export const { setErrors, addError } = errorsSlice.actions;
export default errorsSlice.reducer;
