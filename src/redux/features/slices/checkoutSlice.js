// redux/checkoutSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  basketId: null,
  form: {
    billingAddress: {},
    shippingAddress: {},
    deliveryMethod: 'domestic',
    paymentMethod: '',
    note: '',
    utrProof: null,
    poDocument: null
  },
  summary: {
    subTotal: 0,
    gst: 0,
    platformFee: 0,
    total: 0
  },
  status: 'idle',
  error: null
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setBasketId: (state, action) => {
      state.basketId = action.payload;
    },
    updateForm: (state, action) => {
      state.form = { ...state.form, ...action.payload };
    },
    updateAddress: (state, action) => {
      const { type, data } = action.payload;
      state.form[`${type}Address`] = data;
    },
    updateSummary: (state, action) => {
      state.summary = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetCheckout: () => initialState
  }
});

export const {
  setBasketId,
  updateForm,
  updateAddress,
  updateSummary,
  setStatus,
  setError,
  resetCheckout
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
