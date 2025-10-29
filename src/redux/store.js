// store.js
import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './features/api/authApi';
import { zohoApi } from './features/api/zohoApi';
import authReducer from './features/slices/authSlice';
import basketReducer from './features/slices/basketSlice';
import checkoutReducer from './features/slices/checkoutSlice';
import { uploadsApi } from './features/api/uploadsApi';
import { documentsApi } from './features/api/documentsApi';
import { poPaymentDetailApi } from './features/api/poPaymentApi';
import { customerPaymentApi } from './features/api/customerPaymentApi';
import { vendorApi } from './features/api/vendorApi';
import {reportsApi} from "./features/api/reportsApi"


export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [zohoApi.reducerPath]: zohoApi.reducer,
    [uploadsApi.reducerPath]: uploadsApi.reducer,
    [documentsApi.reducerPath]: documentsApi.reducer,
    [poPaymentDetailApi.reducerPath]: poPaymentDetailApi.reducer,
    [customerPaymentApi.reducerPath]: customerPaymentApi.reducer,
    [vendorApi.reducerPath]:vendorApi.reducer,
    [reportsApi.reducerPath]:reportsApi.reducer,



    auth: authReducer,
    basket: basketReducer,
    checkout: checkoutReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(zohoApi.middleware)
      .concat(uploadsApi.middleware)
      .concat(documentsApi.middleware)
      .concat(poPaymentDetailApi.middleware)
      .concat(customerPaymentApi.middleware)
      .concat(vendorApi.middleware)
      .concat(reportsApi.middleware)

});

