// src/redux/features/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const isBrowser = typeof window !== 'undefined';

const initialState = {
  userInfo: isBrowser
    ? JSON.parse(localStorage.getItem('userInfo')) || null
    : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      if (isBrowser) {
        localStorage.setItem('userInfo', JSON.stringify(action.payload));
      }
    },
    logout: (state) => {
      state.userInfo = null;
      if (isBrowser) {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('b2b_basket_state');  
        localStorage.removeItem('b2b_selected_basket');
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
