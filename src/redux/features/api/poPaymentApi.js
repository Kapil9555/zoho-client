// src/redux/features/api/poPaymentDetailApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const poPaymentDetailApi = createApi({
  reducerPath: 'poPaymentDetailApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api',
    credentials: 'include',
  }),
  tagTypes: ['PoPaymentDetail'],
  endpoints: (builder) => ({
    // Get all
    getPoPaymentDetails: builder.query({
      query: () => `/po-payment-details`,
      providesTags: ['PoPaymentDetail'],
    }),

    // Get by purchaseOrderId
    getPoPaymentDetailById: builder.query({
      query: (purchaseOrderId) => `/po-payment-details/${encodeURIComponent(purchaseOrderId)}`,
      providesTags: (_res, _err, purchaseOrderId) => [
        { type: 'PoPaymentDetail', id: purchaseOrderId },
      ],
    }),

    // Add new
    addPoPaymentDetail: builder.mutation({
      query: (payload) => ({
        url: `/po-payment-details`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['PoPaymentDetail'],
    }),
    updatePoPaymentDetail: builder.mutation({
      query: (payload) => ({
        url: `/po-payment-details`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['PoPaymentDetail'],
    }),

  }),
});

export const {
  useGetPoPaymentDetailsQuery,
  useGetPoPaymentDetailByIdQuery,
  useAddPoPaymentDetailMutation,
  useUpdatePoPaymentDetailMutation,
} = poPaymentDetailApi;




