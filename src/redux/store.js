// store.js
import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './features/api/authApi';
import { zohoApi } from './features/api/zohoApi';
import authReducer from './features/slices/authSlice';
import basketReducer from './features/slices/basketSlice';
import checkoutReducer from './features/slices/checkoutSlice';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,

    [zohoApi.reducerPath]: zohoApi.reducer,

    auth: authReducer,
    basket: basketReducer,
     checkout: checkoutReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(zohoApi.middleware),
});

