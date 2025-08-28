import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const razorpayApi = createApi({
  reducerPath: 'razorpayApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/payment`,
    credentials: 'include',
  }),
  endpoints: (builder) => ({
    createRazorpayOrder: builder.mutation({
      query: (data) => ({
        url: '/create-order-secure',
        method: 'POST',
        body: data,
      }),
    }),
    verifyRazorpayPayment: builder.mutation({
      query: (paymentDetails) => ({
        url: '/verify',
        method: 'POST',
        body: paymentDetails,
      }),
    }),
  }),
});

export const {
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
} = razorpayApi;
