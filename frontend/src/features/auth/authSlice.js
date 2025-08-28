
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('token') || null,
  admin: null, // You can store admin info here after login
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { token, admin } = action.payload;
      state.token = token;
      state.admin = admin;
      localStorage.setItem('token', token);
    },
    clearCredentials(state) {
      state.token = null;
      state.admin = null;
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
