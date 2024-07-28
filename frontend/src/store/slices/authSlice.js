import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: { isAuthenticated: false, token: null, user: null },
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action) => {
      state.value = {
        isAuthenticated: true,
        token: action.payload.token,
        user: action.payload.user,
      };
    },
    setUnAuthenticated: (state) => {
      state.value = initialState.value;
    },
    setCurrentUser: (state, action) => {
      if (state.value.isAuthenticated) {
        state.value.user = action.payload;
      }
    },
  },
});

export const { setAuthenticated, setUnAuthenticated, setCurrentUser } =
  authSlice.actions;
export default authSlice.reducer;
