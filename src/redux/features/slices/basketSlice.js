import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  baskets: [],
  selectedBasketId: null,
};

const basketSlice = createSlice({
  name: 'basket',
  initialState,
  reducers: {
    setBaskets(state, action) {
      state.baskets = action.payload;
    },
    setSelectedBasket(state, action) {
      state.selectedBasketId = action.payload;
    },
    initializeFromStorage(state, action) {
      state.baskets = action.payload.baskets || [];
      state.selectedBasketId = action.payload.selectedBasketId || null;
    },
    resetBasketState(state) {
      state.baskets = [];
      state.selectedBasketId = null;
    },
  },
});

export const {
  setBaskets,
  setSelectedBasket,
  initializeFromStorage,
  resetBasketState,
} = basketSlice.actions;

export default basketSlice.reducer;
