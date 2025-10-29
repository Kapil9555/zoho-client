// src/redux/api/authApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';




export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    credentials: 'include',
  }),
  tagTypes: ['User', 'Product'],
  endpoints: (builder) => ({
    // profile
    getProfile: builder.query({
      query: () => '/users/profile',
      transformResponse: (response) => ({
        profile: response,
      }),
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    getProductByIdUser: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: ['Product'],
    }),
    addAddress: builder.mutation({
      query: (address) => ({
        url: '/users/address',
        method: 'POST',
        body: address,
        credentials: 'include',
      }),
      invalidatesTags: ['User'],
    }),
    deleteAddress: builder.mutation({
      query: (addressId) => ({
        url: `/users/address/${addressId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['User'],
    }),


  }),
});

export const { useGetProfileQuery, useLazyGetProfileQuery, useUpdateProfileMutation, useGetProductByIdUserQuery, useAddAddressMutation, useDeleteAddressMutation } = userApi;
