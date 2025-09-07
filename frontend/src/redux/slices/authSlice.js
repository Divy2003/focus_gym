// src/store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('token'),
  admin: JSON.parse(localStorage.getItem('admin') || 'null'),
  isAuthenticated: !!localStorage.getItem('token'),
  otpSent: false,
  mobile: '',
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setMobile: (state, action) => {
      state.mobile = action.payload;
    },
    setOtpSent: (state, action) => {
      state.otpSent = action.payload;
    },
    loginSuccess: (state, action) => {
      const { token, admin } = action.payload;
      state.token = token;
      state.admin = admin;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      state.otpSent = false;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('admin', JSON.stringify(admin));
    },
    logout: (state) => {
      state.token = null;
      state.admin = null;
      state.isAuthenticated = false;
      state.otpSent = false;
      state.mobile = '';
      state.error = null;
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
    },
    resetAuthState: (state) => {
      state.otpSent = false;
      state.mobile = '';
      state.error = null;
      state.loading = false;
    },
  },
});

// Selectors
export const selectCurrentToken = (state) => {
  // First try to get from Redux state
  const tokenFromState = state.auth.token;
  // Fallback to localStorage if not in state (useful for page refresh)
  return tokenFromState || localStorage.getItem('token');
};

export const selectCurrentUser = (state) => {
  // First try to get from Redux state
  const userFromState = state.auth.admin;
  // Fallback to localStorage if not in state (useful for page refresh)
  return userFromState || JSON.parse(localStorage.getItem('admin') || 'null');
};

// Export all actions
export const {
  setLoading,
  setError,
  clearError,
  setMobile,
  setOtpSent,
  loginSuccess,
  logout,
  resetAuthState,
} = authSlice.actions;

// Alias loginSuccess as setCredentials for backward compatibility
export const setCredentials = loginSuccess;

export default authSlice.reducer;