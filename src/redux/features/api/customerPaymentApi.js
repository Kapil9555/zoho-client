// src/redux/features/api/customerPaymentApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const customerPaymentApi = createApi({
  reducerPath: 'customerPaymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/',
    credentials: 'include',
  }),
  tagTypes: ['CustomerPaymentDetail'],
  endpoints: (builder) => ({
    // Get all
    getCustomerPaymentDetails: builder.query({
      query: () => `/customer-payment-details`,
      providesTags: ['CustomerPaymentDetail'],
    }),

    // Get by PI Id
    getCustomerPaymentDetailById: builder.query({
      query: (piId) => `/customer-payment-details/${encodeURIComponent(piId)}`,
      providesTags: (_res, _err, piId) => [
        { type: 'CustomerPaymentDetail', id: piId },
      ],
    }),

    // Add new
    addCustomerPaymentDetail: builder.mutation({
      query: (payload) => ({
        url: `/customer-payment-details`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['CustomerPaymentDetail'],
    }),

    // Update existing
    updateCustomerPaymentDetail: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/customer-payment-details`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'CustomerPaymentDetail', id },
      ],
    }),
  }),
});

export const {
  useGetCustomerPaymentDetailsQuery,
  useGetCustomerPaymentDetailByIdQuery,
  useAddCustomerPaymentDetailMutation,
  useUpdateCustomerPaymentDetailMutation,
} = customerPaymentApi;
