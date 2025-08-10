// src/redux/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!(localStorage.getItem('token') && localStorage.getItem('user')),
  isLoggedIn: !!(localStorage.getItem('token') && localStorage.getItem('user')), // Add this for navbar compatibility
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      console.log('Redux loginSuccess payload:', action.payload); // Debug log
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoggedIn = true; // Add this for navbar compatibility
      localStorage.setItem('user', JSON.stringify(state.user));
      localStorage.setItem('token', state.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoggedIn = false; // Add this for navbar compatibility
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;